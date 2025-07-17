import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, PhotoWithAccess } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bib: string }> }
) {
  try {
    const { bib } = await params;
    const bibNumber = bib.toUpperCase();

    // Fetch photo with access information
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select(`
        *,
        access:photo_access(*)
      `)
      .eq('bib_number', bibNumber)
      .eq('is_active', true)
      .single();

    if (photoError) {
      if (photoError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Photo not found for this bib number'
        } as ApiResponse<null>, { status: 404 });
      }
      
      console.error('Supabase error:', photoError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      } as ApiResponse<null>, { status: 500 });
    }

    // If no access record exists, create one
    if (!photo.access || photo.access.length === 0) {
      const { data: newAccess, error: accessError } = await supabase
        .from('photo_access')
        .insert({
          photo_id: photo.id,
          bib_number: bibNumber,
          survey_completed: false,
          payment_completed: false,
          is_unlocked: false
        })
        .select()
        .single();

      if (accessError) {
        console.error('Error creating access record:', accessError);
        // Continue without access record - not critical
      } else {
        photo.access = [newAccess];
      }
    }

    const response: PhotoWithAccess = {
      ...photo,
      access: photo.access?.[0] || null
    };

    return NextResponse.json({
      success: true,
      data: response
    } as ApiResponse<PhotoWithAccess>);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>, { status: 500 });
  }
}