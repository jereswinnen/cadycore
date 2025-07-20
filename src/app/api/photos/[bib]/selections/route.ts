import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';
import { calculatePricePerPhoto, calculateTotalAmount } from '@/lib/pricing';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();
    const body = await request.json();
    const { photo_id, is_selected } = body;

    if (!photo_id || typeof is_selected !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid required fields'
      } as ApiResponse<null>, { status: 400 });
    }

    // Update the photo selection
    const { data: selection, error: selectionError } = await supabase
      .from('photo_selections')
      .upsert({
        bib_number: bibNumber,
        photo_id: photo_id,
        is_selected: is_selected
      }, {
        onConflict: 'bib_number,photo_id'
      })
      .select()
      .single();

    if (selectionError) {
      console.error('Error updating selection:', selectionError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update photo selection'
      } as ApiResponse<null>, { status: 500 });
    }

    // Get updated selection counts and pricing
    const { data: allSelections } = await supabase
      .from('photo_selections')
      .select('*')
      .eq('bib_number', bibNumber)
      .eq('is_selected', true);

    const totalSelected = allSelections?.length || 0;
    const pricePerPhoto = calculatePricePerPhoto(totalSelected);
    const totalPrice = calculateTotalAmount(totalSelected);

    return NextResponse.json({
      success: true,
      data: {
        selection,
        totalSelected,
        pricePerPhoto,
        totalPrice
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();
    const body = await request.json();
    const { selected_photo_ids } = body;

    if (!Array.isArray(selected_photo_ids)) {
      return NextResponse.json({
        success: false,
        error: 'selected_photo_ids must be an array'
      } as ApiResponse<null>, { status: 400 });
    }

    // First, set all photos for this bib to unselected
    await supabase
      .from('photo_selections')
      .update({ is_selected: false })
      .eq('bib_number', bibNumber);

    // Then, set selected photos to selected
    if (selected_photo_ids.length > 0) {
      const updates = selected_photo_ids.map(photo_id => ({
        bib_number: bibNumber,
        photo_id: photo_id,
        is_selected: true
      }));

      const { error: updateError } = await supabase
        .from('photo_selections')
        .upsert(updates, {
          onConflict: 'bib_number,photo_id'
        });

      if (updateError) {
        console.error('Error updating selections:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Failed to update photo selections'
        } as ApiResponse<null>, { status: 500 });
      }
    }

    // Get updated pricing
    const totalSelected = selected_photo_ids.length;
    const pricePerPhoto = calculatePricePerPhoto(totalSelected);
    const totalPrice = calculateTotalAmount(totalSelected);

    return NextResponse.json({
      success: true,
      data: {
        totalSelected,
        pricePerPhoto,
        totalPrice
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>, { status: 500 });
  }
}