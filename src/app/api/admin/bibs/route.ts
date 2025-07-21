import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all bib numbers with their photo count and payment/survey status
    const { data: bibData, error } = await supabase
      .from('photos')
      .select(`
        bib_number,
        id,
        uploaded_at,
        access:photo_access(
          survey_completed,
          payment_completed,
          is_unlocked
        ),
        payments(
          status,
          completed_at,
          total_amount
        )
      `)
      .eq('is_active', true)
      .order('bib_number');

    if (error) {
      console.error('Error fetching bib data:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Group by bib number and aggregate data
    const bibMap = new Map();
    
    bibData?.forEach(photo => {
      const bibNumber = photo.bib_number;
      
      if (!bibMap.has(bibNumber)) {
        bibMap.set(bibNumber, {
          bib_number: bibNumber,
          photo_count: 0,
          latest_upload: null,
          has_survey: false,
          has_payment: false,
          is_paid: false,
          payment_amount: 0,
        });
      }

      const bib = bibMap.get(bibNumber);
      bib.photo_count += 1;
      
      // Update latest upload time
      if (!bib.latest_upload || photo.uploaded_at > bib.latest_upload) {
        bib.latest_upload = photo.uploaded_at;
      }

      // Check survey and payment status
      if (photo.access?.[0]?.survey_completed) {
        bib.has_survey = true;
      }
      
      if (photo.payments?.[0]) {
        bib.has_payment = true;
        if (photo.payments[0].status === 'completed') {
          bib.is_paid = true;
          bib.payment_amount = photo.payments[0].total_amount || 0;
        }
      }
    });

    const bibs = Array.from(bibMap.values()).sort((a, b) => 
      a.bib_number.localeCompare(b.bib_number)
    );

    return NextResponse.json({
      success: true,
      data: bibs
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}