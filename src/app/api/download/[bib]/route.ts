import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();
    
    // Get photo_id from query parameters
    const url = new URL(request.url);
    const photoId = url.searchParams.get('photo_id');

    if (!photoId) {
      // If no photo_id specified, get the first unlocked photo
      const { data: access, error: accessError } = await supabase
        .from('photo_access')
        .select(`
          *,
          photo:photos(*)
        `)
        .eq('bib_number', bibNumber)
        .eq('is_unlocked', true)
        .limit(1)
        .single();

      if (accessError || !access) {
        return NextResponse.json({
          error: 'No unlocked photos found for this bib number'
        }, { status: 404 });
      }

      return downloadPhoto(access, bibNumber);
    } else {
      // Download specific photo
      const { data: access, error: accessError } = await supabase
        .from('photo_access')
        .select(`
          *,
          photo:photos(*)
        `)
        .eq('bib_number', bibNumber)
        .eq('photo_id', photoId)
        .eq('is_unlocked', true)
        .single();

      if (accessError || !access) {
        return NextResponse.json({
          error: 'Photo not found or not unlocked'
        }, { status: 404 });
      }

      return downloadPhoto(access, bibNumber, photoId);
    }
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function downloadPhoto(access: any, bibNumber: string, photoId?: string) {
  if (!access.photo || !access.photo.highres_url) {
    return NextResponse.json({
      error: 'High-resolution photo not available'
    }, { status: 404 });
  }

  // Update download count
  const { error: updateError } = await supabase
    .from('photo_access')
    .update({
      download_count: (access.download_count || 0) + 1,
      last_downloaded_at: new Date().toISOString()
    })
    .eq('id', access.id);

  if (updateError) {
    console.error('Failed to update download count:', updateError);
    // Don't fail the request - just log the error
  }

  try {
    // Fetch the image from the URL
    const imageResponse = await fetch(access.photo.highres_url);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Create filename with photo number if specific photo
    const filename = photoId 
      ? `race-photo-${bibNumber}-${photoId.slice(-8)}.jpg`
      : `race-photo-${bibNumber}.jpg`;
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (fetchError) {
    console.error('Error fetching image:', fetchError);
    
    // Fallback: redirect to the image URL
    return NextResponse.redirect(access.photo.highres_url);
  }
}