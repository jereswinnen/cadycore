import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';
import { generateSecureUrl } from '@/lib/utils';
import { calculatePricePerPhoto, calculateTotalAmount, formatPrice } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bib_number, selected_photo_ids } = body;

    // Validate required fields
    if (!bib_number || !Array.isArray(selected_photo_ids) || selected_photo_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields or no photos selected'
      } as ApiResponse<null>, { status: 400 });
    }

    const bibNumberUpper = bib_number.toUpperCase();

    // Check if photos exist and verify they belong to this bib
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, bib_number')
      .in('id', selected_photo_ids)
      .eq('bib_number', bibNumberUpper)
      .eq('is_active', true);

    if (photosError || !photos || photos.length !== selected_photo_ids.length) {
      return NextResponse.json({
        success: false,
        error: 'Invalid photos selected or photos do not belong to this bib number'
      } as ApiResponse<null>, { status: 400 });
    }

    // Check if survey is completed for this bib (survey is now bib-based, not photo-based)
    const { data: surveyResponse, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('bib_number', bibNumberUpper)
      .single();

    if (surveyError && surveyError.code !== 'PGRST116') {
      console.error('Survey check error:', surveyError);
      return NextResponse.json({
        success: false,
        error: 'Error checking survey status'
      } as ApiResponse<null>, { status: 500 });
    }

    if (!surveyResponse) {
      return NextResponse.json({
        success: false,
        error: 'Survey must be completed before payment'
      } as ApiResponse<null>, { status: 400 });
    }

    // Check if any of the selected photos have already been paid for
    const { data: existingAccess, error: accessError } = await supabase
      .from('photo_access')
      .select('photo_id, payment_completed')
      .in('photo_id', selected_photo_ids)
      .eq('bib_number', bibNumberUpper)
      .eq('payment_completed', true);

    if (accessError) {
      console.error('Access check error:', accessError);
    }

    if (existingAccess && existingAccess.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Some selected photos have already been paid for'
      } as ApiResponse<null>, { status: 400 });
    }

    // Calculate pricing
    const photoCount = selected_photo_ids.length;
    const pricePerPhoto = calculatePricePerPhoto(photoCount);
    const totalAmount = calculateTotalAmount(photoCount);

    // Create Stripe line items
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Race Photos - Bib #${bibNumberUpper}`,
          description: `${photoCount} high-resolution race photo${photoCount > 1 ? 's' : ''} (${formatPrice(pricePerPhoto)} each)`,
        },
        unit_amount: pricePerPhoto,
      },
      quantity: photoCount,
    }];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: generateSecureUrl(`/success/${bibNumberUpper}?session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: generateSecureUrl(`/photo/${bibNumberUpper}/unlock`),
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: 'required',
      metadata: {
        bib_number: bibNumberUpper,
        selected_photo_ids: JSON.stringify(selected_photo_ids),
        photo_count: photoCount.toString(),
        price_per_photo: pricePerPhoto.toString(),
      },
    });

    // Save payment record (multiple photos schema supports arrays)
    console.log(`Creating payment record for ${photoCount} photos with session ID: ${session.id}`);
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        bib_number: bibNumberUpper,
        selected_photo_ids: selected_photo_ids,
        stripe_session_id: session.id,
        total_photos: photoCount,
        price_per_photo: pricePerPhoto,
        total_amount: totalAmount,
        currency: 'usd',
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
        session_id: session.id,
        total_amount: totalAmount,
        photo_count: photoCount,
        price_per_photo: pricePerPhoto
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment session'
    } as ApiResponse<null>, { status: 500 });
  }
}