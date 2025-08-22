import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ApiResponse, SurveySubmissionData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bib_number,
      selected_photo_ids,
      runner_name,
      runner_email,
      social_media_preference,
      waiting_stops_buying,
    }: SurveySubmissionData & { bib_number: string } = body;

    // Validate required fields
    if (
      !bib_number ||
      !Array.isArray(selected_photo_ids) ||
      selected_photo_ids.length === 0 ||
      !runner_name ||
      !runner_email ||
      !social_media_preference ||
      !waiting_stops_buying
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const bibNumberUpper = bib_number.toUpperCase();

    // Check if photos exist and belong to this bib number
    const { data: photos, error: photoError } = await supabase
      .from("photos")
      .select("id, bib_number")
      .in("id", selected_photo_ids)
      .eq("bib_number", bibNumberUpper);

    if (photoError || !photos || photos.length !== selected_photo_ids.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid photos selected or photos do not belong to this bib number",
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if survey already exists for this bib
    const { data: existingSurvey, error: existingError } = await supabase
      .from("survey_responses")
      .select("id")
      .eq("bib_number", bibNumberUpper)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Existing survey check error:", existingError);
      return NextResponse.json(
        {
          success: false,
          error: "Error checking existing survey",
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    if (existingSurvey) {
      // Survey already completed - return success and let frontend redirect to payment
      return NextResponse.json({
        success: true,
        data: {
          message: "Survey already completed",
          redirect_to_payment: true,
        },
      } as ApiResponse<any>);
    }

    // Save survey response
    const { data: surveyData, error: surveyError } = await supabase
      .from("survey_responses")
      .insert({
        bib_number: bibNumberUpper,
        selected_photo_ids: selected_photo_ids,
        runner_name,
        runner_email,
        social_media_preference,
        waiting_stops_buying,
      })
      .select()
      .single();

    if (surveyError) {
      console.error("Survey save error:", surveyError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save survey response",
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Update photo access to mark survey as completed for all selected photos
    const { error: accessError } = await supabase
      .from("photo_access")
      .update({ survey_completed: true })
      .in("photo_id", selected_photo_ids)
      .eq("bib_number", bibNumberUpper);

    if (accessError) {
      console.error("Photo access update error:", accessError);
      // Don't fail the request - survey was saved successfully
    }

    return NextResponse.json({
      success: true,
      data: surveyData,
    } as ApiResponse<any>);
  } catch (error) {
    console.error("Survey API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
