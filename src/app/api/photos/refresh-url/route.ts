import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 });
    }

    // Get the photo from database to extract the storage path
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('id, preview_url, highres_url')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json({
        success: false,
        error: 'Photo not found'
      }, { status: 404 });
    }

    // Extract the file path from the existing URL
    // URL format: https://domain/storage/v1/object/sign/photos/filename.jpg?token=...
    const extractFilePath = (url: string): string | null => {
      const match = url.match(/\/photos\/([^?]+)/);
      return match ? match[1] : null;
    };

    const previewPath = extractFilePath(photo.preview_url);
    const highresPath = extractFilePath(photo.highres_url);

    if (!previewPath || !highresPath) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract file paths from URLs'
      }, { status: 400 });
    }

    // Generate new signed URLs (7 days expiry)
    const { data: newPreviewUrl, error: previewError } = await supabase.storage
      .from('photos')
      .createSignedUrl(previewPath, 3600 * 24 * 7);

    const { data: newHighresUrl, error: highresError } = await supabase.storage
      .from('photos')
      .createSignedUrl(highresPath, 3600 * 24 * 7);

    if (previewError || highresError || !newPreviewUrl || !newHighresUrl) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate new signed URLs'
      }, { status: 500 });
    }

    // Update the database with new URLs
    const { error: updateError } = await supabase
      .from('photos')
      .update({
        preview_url: newPreviewUrl.signedUrl,
        highres_url: newHighresUrl.signedUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', photoId);

    if (updateError) {
      console.error('Error updating photo URLs:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update photo URLs'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        photoId,
        preview_url: newPreviewUrl.signedUrl,
        highres_url: newHighresUrl.signedUrl
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}