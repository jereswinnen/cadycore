import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    // First, get the photo details to extract storage paths
    const { data: photo, error: photoError } = await supabaseAdmin
      .from('photos')
      .select('id, bib_number, preview_url, highres_url, watermark_url')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Extract storage paths from URLs to delete files
    const filesToDelete: string[] = [];
    [photo.preview_url, photo.highres_url, photo.watermark_url].forEach(url => {
      if (url) {
        // Extract path from Supabase URL (e.g., "/storage/v1/object/photos/filename.jpg")
        const matches = url.match(/\/photos\/([^?]+)/);
        if (matches && matches[1]) {
          filesToDelete.push(matches[1]);
        }
      }
    });

    // Remove duplicates
    const uniqueFilesToDelete = [...new Set(filesToDelete)];

    // Delete files from Supabase Storage
    if (uniqueFilesToDelete.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('photos')
        .remove(uniqueFilesToDelete);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete database records in correct order due to foreign key constraints
    
    // 1. Delete order_items that reference this photo
    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('photo_id', photoId);

    if (orderItemsError) {
      console.error('Error deleting order items:', orderItemsError);
    }

    // 2. Delete photo_selections
    const { error: selectionsError } = await supabaseAdmin
      .from('photo_selections')
      .delete()
      .eq('photo_id', photoId);

    if (selectionsError) {
      console.error('Error deleting photo selections:', selectionsError);
    }

    // 3. Delete photo_access
    const { error: accessError } = await supabaseAdmin
      .from('photo_access')
      .delete()
      .eq('photo_id', photoId);

    if (accessError) {
      console.error('Error deleting photo access:', accessError);
    }

    // 4. Finally, delete the photo record
    const { error: photoDeleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (photoDeleteError) {
      console.error('Error deleting photo:', photoDeleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete photo from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted photo from bib ${photo.bib_number}`,
      deleted: {
        photoId,
        bibNumber: photo.bib_number,
        files: uniqueFilesToDelete.length
      }
    });

  } catch (error) {
    console.error('Delete photo API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}