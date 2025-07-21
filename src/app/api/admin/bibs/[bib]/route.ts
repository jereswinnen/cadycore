import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();

    // First, get all photos for this bib to delete from storage
    const { data: photos, error: photosError } = await supabaseAdmin
      .from('photos')
      .select('id, preview_url, highres_url, watermark_url')
      .eq('bib_number', bibNumber);

    if (photosError) {
      console.error('Error fetching photos for deletion:', photosError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch photos for deletion' },
        { status: 500 }
      );
    }

    // Extract storage paths from URLs to delete files
    const filesToDelete: string[] = [];
    photos?.forEach(photo => {
      // Extract file path from Supabase storage URLs
      [photo.preview_url, photo.highres_url, photo.watermark_url].forEach(url => {
        if (url) {
          // Extract path from Supabase URL (e.g., "/storage/v1/object/photos/filename.jpg")
          const matches = url.match(/\/photos\/([^?]+)/);
          if (matches && matches[1]) {
            filesToDelete.push(matches[1]);
          }
        }
      });
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

    // Delete database records (cascade will handle related records)
    // Order matters due to foreign key constraints
    
    // 1. Delete order_items (references payments and photos)
    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .in('photo_id', photos?.map(p => p.id) || []);

    if (orderItemsError) {
      console.error('Error deleting order items:', orderItemsError);
    }

    // 2. Delete photo_selections
    const { error: selectionsError } = await supabaseAdmin
      .from('photo_selections')
      .delete()
      .eq('bib_number', bibNumber);

    if (selectionsError) {
      console.error('Error deleting photo selections:', selectionsError);
    }

    // 3. Delete photo_access
    const { error: accessError } = await supabaseAdmin
      .from('photo_access')
      .delete()
      .eq('bib_number', bibNumber);

    if (accessError) {
      console.error('Error deleting photo access:', accessError);
    }

    // 4. Delete payments
    const { error: paymentsError } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('bib_number', bibNumber);

    if (paymentsError) {
      console.error('Error deleting payments:', paymentsError);
    }

    // 5. Delete survey responses
    const { error: surveyError } = await supabaseAdmin
      .from('survey_responses')
      .delete()
      .eq('bib_number', bibNumber);

    if (surveyError) {
      console.error('Error deleting survey responses:', surveyError);
    }

    // 6. Finally, delete photos
    const { error: photosDeleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('bib_number', bibNumber);

    if (photosDeleteError) {
      console.error('Error deleting photos:', photosDeleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete photos from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted bib ${bibNumber} and all associated data`,
      deleted: {
        photos: photos?.length || 0,
        files: uniqueFilesToDelete.length
      }
    });

  } catch (error) {
    console.error('Delete bib API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}