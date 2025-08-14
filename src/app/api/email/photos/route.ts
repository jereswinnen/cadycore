import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmailWithRetry, getEmailConfig } from "@/lib/email";
import { generatePhotoDeliveryEmail } from "@/components/EmailTemplate";
import archiver from "archiver";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, force_resend = false } = body;

    // Debug logging
    const config = getEmailConfig();
    console.log("Email API called with:", { payment_id, force_resend });
    console.log("Email config:", {
      fromEmail: config.fromEmail,
      hasApiKey: !!process.env.RESEND_API_KEY,
      envFromEmail: process.env.FROM_EMAIL,
    });

    if (!payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment ID is required",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .eq("status", "completed")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found or not completed",
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get survey info for this bib number
    const { data: surveyData, error: surveyError } = await supabaseAdmin
      .from("survey_responses")
      .select("runner_name, runner_email")
      .eq("bib_number", payment.bib_number)
      .single();

    if (surveyError || !surveyData) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer email or name not found in survey",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if email already sent (unless force resend)
    if (payment.email_sent && !force_resend) {
      return NextResponse.json({
        success: true,
        data: {
          message: "Email already sent",
          email_sent_at: payment.email_sent_at,
        },
      } as ApiResponse<any>);
    }

    if (!surveyData?.runner_email || !surveyData?.runner_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer email or name not found",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get photo access records for unlocked photos
    const { data: accessRecords, error: accessError } = await supabaseAdmin
      .from("photo_access")
      .select(
        `
        *,
        photo:photos(*)
      `
      )
      .eq("bib_number", payment.bib_number)
      .eq("is_unlocked", true)
      .in("photo_id", payment.selected_photo_ids);

    if (accessError || !accessRecords || accessRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No unlocked photos found",
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Create ZIP file in memory
    const zipBuffer = await createZipBuffer(accessRecords);

    if (!zipBuffer) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create photo ZIP file",
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Generate email HTML
    const emailHtml = generatePhotoDeliveryEmail({
      runnerName: surveyData.runner_name,
      bibNumber: payment.bib_number,
      photoCount: accessRecords.length,
    });

    // Update email attempt count
    const newAttempts = (payment.email_attempts || 0) + 1;
    await supabaseAdmin
      .from("payments")
      .update({ email_attempts: newAttempts })
      .eq("id", payment_id);

    // Send email with ZIP attachment
    const emailResult = await sendEmailWithRetry({
      to: surveyData.runner_email,
      subject: `📸 Your Race Photos - Bib #${payment.bib_number}`,
      html: emailHtml,
      attachments: [
        {
          filename: `race-photos-${payment.bib_number}.zip`,
          content: zipBuffer,
          type: "application/zip",
        },
      ],
    });

    if (emailResult.success) {
      // Update payment record with successful email send
      await supabaseAdmin
        .from("payments")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          email_attempts: newAttempts,
        })
        .eq("id", payment_id);

      return NextResponse.json({
        success: true,
        data: {
          message: "Email sent successfully",
          message_id: emailResult.messageId,
          attempts: emailResult.attempts,
        },
      } as ApiResponse<any>);
    } else {
      // Update attempts count on failure
      await supabaseAdmin
        .from("payments")
        .update({ email_attempts: newAttempts })
        .eq("id", payment_id);

      return NextResponse.json(
        {
          success: false,
          error: `Email delivery failed: ${emailResult.error}`,
          attempts: emailResult.attempts,
        } as ApiResponse<null>,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email photos API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

async function createZipBuffer(accessRecords: any[]): Promise<Buffer | null> {
  try {
    // Fetch all photos first
    const photoData = await Promise.all(
      accessRecords.map(async (access, index) => {
        if (!access.photo || !access.photo.highres_url) {
          console.warn(`Skipping photo ${access.photo_id}: No high-res URL`);
          return null;
        }

        try {
          const imageResponse = await fetch(access.photo.highres_url);
          if (!imageResponse.ok) {
            console.warn(
              `Failed to fetch photo ${access.photo_id}: ${imageResponse.status}`
            );
            return null;
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const filename = `photo-${index + 1}-${access.photo_id.slice(-8)}.jpg`;

          return {
            buffer: Buffer.from(imageBuffer),
            filename,
          };
        } catch (error) {
          console.error(`Error processing photo ${access.photo_id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed downloads
    const validPhotos = photoData.filter((photo) => photo !== null);

    if (validPhotos.length === 0) {
      console.error("No valid photos to zip");
      return null;
    }

    // Create zip using Promise-based approach
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      const chunks: Buffer[] = [];

      archive.on("data", (chunk) => {
        chunks.push(chunk);
      });

      archive.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      archive.on("error", (err) => {
        reject(err);
      });

      // Add all photos to the archive
      validPhotos.forEach((photo) => {
        if (photo) {
          archive.append(photo.buffer, { name: photo.filename });
        }
      });

      // Finalize the archive
      archive.finalize();
    });

    return zipBuffer;
  } catch (error) {
    console.error("Error creating ZIP buffer:", error);
    return null;
  }
}
