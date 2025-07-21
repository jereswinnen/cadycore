import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all photos
    const { data: photos, error: photoError } = await supabase
      .from('photos')
      .select('bib_number, id, uploaded_at')
      .eq('is_active', true);

    if (photoError) {
      console.error('Error fetching photos:', photoError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Fetch photo access data
    const { data: accessData, error: accessError } = await supabase
      .from('photo_access')
      .select('bib_number, survey_completed, payment_completed');

    if (accessError) {
      console.error('Error fetching access data:', accessError);
    }

    // Fetch payment data
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('bib_number, status, amount');

    if (paymentError) {
      console.error('Error fetching payment data:', paymentError);
    }

    // Group by bib number and aggregate data
    const bibMap = new Map();
    
    // Process photos data
    photos?.forEach(photo => {
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
    });

    // Process access data
    accessData?.forEach(access => {
      if (bibMap.has(access.bib_number)) {
        const bib = bibMap.get(access.bib_number);
        if (access.survey_completed) {
          bib.has_survey = true;
        }
      }
    });

    // Process payment data
    paymentData?.forEach(payment => {
      if (bibMap.has(payment.bib_number)) {
        const bib = bibMap.get(payment.bib_number);
        bib.has_payment = true;
        if (payment.status === 'completed') {
          bib.is_paid = true;
          bib.payment_amount += payment.amount || 0; // Sum all payments for this bib
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