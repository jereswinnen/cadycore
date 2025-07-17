import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';
import { generateSecureUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bib_number, photo_id } = body;

    // Validate required fields
    if (!bib_number || !photo_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse<null>, { status: 400 });
    }

    const bibNumberUpper = bib_number.toUpperCase();

    // Check if photo exists and survey is completed
    const { data: access, error: accessError } = await supabase
      .from('photo_access')
      .select('*')
      .eq('photo_id', photo_id)
      .eq('bib_number', bibNumberUpper)
      .single();

    if (accessError || !access) {
      return NextResponse.json({
        success: false,
        error: 'Photo access not found'
      } as ApiResponse<null>, { status: 404 });
    }

    if (!access.survey_completed) {
      return NextResponse.json({
        success: false,
        error: 'Survey must be completed before payment'
      } as ApiResponse<null>, { status: 400 });
    }

    if (access.payment_completed) {
      return NextResponse.json({
        success: false,
        error: 'Payment already completed for this photo'
      } as ApiResponse<null>, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.CURRENCY,
            product_data: {
              name: `Race Photo - Bib #${bibNumberUpper}`,
              description: 'High-resolution race photo download',
            },
            unit_amount: STRIPE_CONFIG.PRICE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: generateSecureUrl(`/success/${bibNumberUpper}?session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: generateSecureUrl(`/photo/${bibNumberUpper}/unlock`),
      metadata: {
        bib_number: bibNumberUpper,
        photo_id: photo_id,
      },
    });

    // Save payment record
    console.log(`Creating payment record with session ID: ${session.id}`);
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        photo_id: photo_id,
        bib_number: bibNumberUpper,
        stripe_session_id: session.id,
        amount: STRIPE_CONFIG.PRICE_AMOUNT,
        currency: STRIPE_CONFIG.CURRENCY,
        status: 'pending'
      })
      .select();

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      // Don't fail the request - Stripe session was created successfully
    } else {
      console.log('Payment record created successfully:', paymentData);
    }

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
        session_id: session.id
      }
    } as ApiResponse<{ url: string | null; session_id: string }>);

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment session'
    } as ApiResponse<null>, { status: 500 });
  }
}