import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const bibNumber = formData.get('bib_number') as string;

    if (!bibNumber) {
      return NextResponse.json(
        { success: false, error: 'Bib number is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedPhotos = [];

    // Get current highest photo_order for this bib to determine next order
    const { data: existingPhotos, error: countError } = await supabaseAdmin
      .from('photos')
      .select('photo_order')
      .eq('bib_number', bibNumber.toUpperCase())
      .order('photo_order', { ascending: false })
      .limit(1);

    if (countError) {
      console.error('Error getting photo count:', countError);
    }

    const startingOrder = existingPhotos?.[0]?.photo_order ? existingPhotos[0].photo_order + 1 : 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${bibNumber.toUpperCase()}-${fileId}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('photos')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { success: false, error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }

      // Get public URLs (try public first, fallback to signed URL)
      const { data: previewUrl } = supabaseAdmin.storage
        .from('photos')
        .getPublicUrl(uploadData.path);

      // Verify the URL works, otherwise create a signed URL
      let finalPreviewUrl = previewUrl.publicUrl;
      
      // Check if we can access the public URL, if not create a signed URL
      try {
        const testResponse = await fetch(previewUrl.publicUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          // Public URL doesn't work, create a signed URL
          const { data: signedUrl, error: signedError } = await supabaseAdmin.storage
            .from('photos')
            .createSignedUrl(uploadData.path, 3600 * 24 * 7); // 7 days
          
          if (!signedError && signedUrl) {
            finalPreviewUrl = signedUrl.signedUrl;
          }
        }
      } catch (error) {
        // If public URL test fails, try signed URL
        const { data: signedUrl, error: signedError } = await supabaseAdmin.storage
          .from('photos')
          .createSignedUrl(uploadData.path, 3600 * 24 * 7); // 7 days
        
        if (!signedError && signedUrl) {
          finalPreviewUrl = signedUrl.signedUrl;
        }
      }

      // For now, use the same URL for both preview and high-res
      // In a real system, you might want to create different sized versions
      const photoData = {
        bib_number: bibNumber.toUpperCase(),
        preview_url: finalPreviewUrl,
        highres_url: finalPreviewUrl,
        watermark_url: finalPreviewUrl, // You might want to add watermarking logic
        photo_order: startingOrder + i,
        metadata: {
          original_filename: file.name,
          file_size: file.size,
          content_type: file.type,
          uploaded_by: 'admin',
        },
      };

      // Insert photo record into database
      const { data: photoRecord, error: dbError } = await supabaseAdmin
        .from('photos')
        .insert(photoData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabaseAdmin.storage.from('photos').remove([uploadData.path]);
        return NextResponse.json(
          { success: false, error: `Failed to save photo record for ${file.name}` },
          { status: 500 }
        );
      }

      uploadedPhotos.push({
        ...photoRecord,
        filename: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        bib_number: bibNumber.toUpperCase(),
        uploaded_count: uploadedPhotos.length,
        photos: uploadedPhotos,
      },
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}