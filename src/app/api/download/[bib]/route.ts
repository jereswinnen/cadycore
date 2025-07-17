import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { bib: string } }
) {
  try {
    const bibNumber = params.bib.toUpperCase();

    // Check if photo is unlocked
    const { data: access, error: accessError } = await supabase
      .from('photo_access')
      .select(`
        *,
        photo:photos(*)
      `)
      .eq('bib_number', bibNumber)
      .eq('is_unlocked', true)
      .single();

    if (accessError || !access) {
      return NextResponse.json({
        error: 'Photo not found or not unlocked'
      }, { status: 404 });
    }

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

    // For now, redirect to the high-resolution image URL
    // In a production environment, you would want to:
    // 1. Fetch the image from Supabase Storage
    // 2. Return it as a stream with proper headers
    // 3. Implement proper access control
    
    try {
      // Fetch the image from Supabase Storage
      const imageResponse = await fetch(access.photo.highres_url);
      
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Return the image with proper headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename="race-photo-${bibNumber}.jpg"`,
          'Cache-Control': 'private, no-cache',
        },
      });
    } catch (fetchError) {
      console.error('Error fetching image:', fetchError);
      
      // Fallback: redirect to the image URL
      return NextResponse.redirect(access.photo.highres_url);
    }

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}