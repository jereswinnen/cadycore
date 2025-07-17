import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      bib_number,
      photo_id,
      runner_name,
      runner_email,
      age_group,
      race_experience,
      satisfaction_rating,
      would_recommend,
      feedback,
      marketing_consent
    } = body;

    // Validate required fields
    if (!bib_number || !photo_id || !runner_name || !runner_email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse<null>, { status: 400 });
    }

    // Check if photo exists
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('id')
      .eq('id', photo_id)
      .eq('bib_number', bib_number.toUpperCase())
      .single();

    if (photoError || !photo) {
      return NextResponse.json({
        success: false,
        error: 'Photo not found'
      } as ApiResponse<null>, { status: 404 });
    }

    // Insert survey response
    const { data: surveyResponse, error: surveyError } = await supabase
      .from('survey_responses')
      .insert({
        photo_id,
        bib_number: bib_number.toUpperCase(),
        runner_name,
        runner_email,
        age_group,
        race_experience,
        satisfaction_rating: parseInt(satisfaction_rating),
        would_recommend: Boolean(would_recommend),
        feedback: feedback || null,
        marketing_consent: Boolean(marketing_consent)
      })
      .select()
      .single();

    if (surveyError) {
      console.error('Survey insertion error:', surveyError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save survey response'
      } as ApiResponse<null>, { status: 500 });
    }

    // Update photo access to mark survey as completed
    const { error: accessError } = await supabase
      .from('photo_access')
      .update({
        survey_completed: true
      })
      .eq('photo_id', photo_id)
      .eq('bib_number', bib_number.toUpperCase());

    if (accessError) {
      console.error('Access update error:', accessError);
      // Don't fail the request - survey was saved successfully
    }

    return NextResponse.json({
      success: true,
      data: surveyResponse
    } as ApiResponse<typeof surveyResponse>);

  } catch (error) {
    console.error('Survey API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>, { status: 500 });
  }
}