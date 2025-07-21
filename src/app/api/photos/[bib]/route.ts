import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, PhotosWithSelections, PhotoWithAccess, PhotoSelection } from '@/types';
import { calculatePricePerPhoto, calculateTotalAmount } from '@/lib/pricing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();

    // Fetch all photos for this bib number with access information
    const { data: photos, error: photoError } = await supabase
      .from('photos')
      .select(`
        *,
        access:photo_access(*)
      `)
      .eq('bib_number', bibNumber)
      .eq('is_active', true)
      .order('photo_order', { ascending: true });

    if (photoError) {
      console.error('Supabase error:', photoError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      } as ApiResponse<null>, { status: 500 });
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No photos found for this bib number'
      } as ApiResponse<null>, { status: 404 });
    }

    // Fetch photo selections
    const { data: selections, error: selectionsError } = await supabase
      .from('photo_selections')
      .select('*')
      .eq('bib_number', bibNumber);

    if (selectionsError) {
      console.error('Error fetching selections:', selectionsError);
    }

    // Create photo access records if they don't exist
    const photosWithoutAccess = photos.filter(photo => !photo.access || photo.access.length === 0);
    
    if (photosWithoutAccess.length > 0) {
      const accessRecords = photosWithoutAccess.map(photo => ({
        photo_id: photo.id,
        bib_number: bibNumber,
        survey_completed: false,
        payment_completed: false,
        is_unlocked: false
      }));

      const { data: newAccessRecords, error: accessError } = await supabase
        .from('photo_access')
        .insert(accessRecords)
        .select();

      if (accessError) {
        console.error('Error creating access records:', accessError);
      } else {
        // Update photos with new access records
        photosWithoutAccess.forEach((photo, index) => {
          photo.access = [newAccessRecords[index]];
        });
      }
    }

    // Create photo selections for photos that don't have them (default selected)
    const photosWithoutSelections = photos.filter(photo => 
      !selections?.some(s => s.photo_id === photo.id)
    );

    if (photosWithoutSelections.length > 0) {
      const selectionRecords = photosWithoutSelections.map(photo => ({
        bib_number: bibNumber,
        photo_id: photo.id,
        is_selected: true
      }));

      const { data: newSelections, error: selectionError } = await supabase
        .from('photo_selections')
        .insert(selectionRecords)
        .select();

      if (selectionError) {
        console.error('Error creating selections:', selectionError);
      }
    }

    // Fetch updated selections
    const { data: finalSelections } = await supabase
      .from('photo_selections')
      .select('*')
      .eq('bib_number', bibNumber);

    // Merge selection data with photos
    const photosWithSelections: PhotoWithAccess[] = photos.map(photo => ({
      ...photo,
      access: photo.access?.[0] || null,
      selected: finalSelections?.find(s => s.photo_id === photo.id)?.is_selected || false
    }));

    // Calculate pricing
    const totalSelected = finalSelections?.filter(s => s.is_selected).length || 0;
    const pricePerPhoto = calculatePricePerPhoto(totalSelected);
    const totalPrice = calculateTotalAmount(totalSelected);

    const response: PhotosWithSelections = {
      photos: photosWithSelections,
      selections: finalSelections || [],
      totalSelected,
      totalPrice,
      pricePerPhoto
    };

    return NextResponse.json({
      success: true,
      data: response
    } as ApiResponse<PhotosWithSelections>);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>, { status: 500 });
  }
}