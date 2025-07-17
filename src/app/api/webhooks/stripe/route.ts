import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

console.log('🚀 Webhook route file loaded at:', new Date().toISOString());

export async function GET(request: NextRequest) {
  console.log('🔥 Webhook GET handler called');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📍 Request URL:', request.url);
  
  return NextResponse.json({ 
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  console.log('🔥 Webhook POST handler called');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📍 Request URL:', request.url);
  console.log('📍 Request method:', request.method);
  console.log('📍 Request headers:', Object.fromEntries(request.headers.entries()));
  
  if (!webhookSecret) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let body: string;
  try {
    body = await request.text();
    console.log('📦 Request body length:', body.length);
  } catch (error) {
    console.error('❌ Failed to read request body:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const signature = request.headers.get('stripe-signature');
  console.log('🔐 Stripe signature present:', !!signature);

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook signature verified successfully');
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    console.log(`🎯 Processing event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Handling checkout session completed');
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        console.log('✅ Handling payment intent succeeded');
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Handling payment intent failed');
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🔄 Starting checkout session completion handler');
  const { bib_number, photo_id } = session.metadata || {};

  if (!bib_number || !photo_id) {
    console.error('❌ Missing metadata in checkout session:', session.id);
    return;
  }

  console.log(`📋 Processing payment for bib: ${bib_number}, photo: ${photo_id}`);

  try {
    // Update payment record
    console.log('💾 Updating payment record...');
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('stripe_session_id', session.id);

    if (paymentError) {
      console.error('❌ Failed to update payment record:', paymentError);
    } else {
      console.log('✅ Payment record updated successfully');
    }

    // Update photo access to mark payment as completed and unlock photo
    console.log('🔓 Updating photo access...');
    const { error: accessError } = await supabase
      .from('photo_access')
      .update({
        payment_completed: true,
        is_unlocked: true,
        unlocked_at: new Date().toISOString()
      })
      .eq('photo_id', photo_id)
      .eq('bib_number', bib_number);

    if (accessError) {
      console.error('❌ Failed to update photo access:', accessError);
    } else {
      console.log('✅ Photo access updated successfully');
    }

    console.log(`🎉 Payment completed for bib ${bib_number}, photo ${photo_id}`);
  } catch (error) {
    console.error('❌ Error processing completed checkout:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
  
  // Update payment status if needed
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('❌ Failed to update payment status:', error);
  } else {
    console.log('✅ Payment status updated successfully');
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  
  // Update payment status
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed'
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('❌ Failed to update payment status:', error);
  } else {
    console.log('✅ Payment failure status updated successfully');
  }
}

// Add handlers for other HTTP methods to debug unexpected calls
export async function PUT(request: NextRequest) {
  console.log('🔥 Webhook PUT handler called - This should not happen');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📍 Request URL:', request.url);
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  console.log('🔥 Webhook DELETE handler called - This should not happen');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📍 Request URL:', request.url);
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  console.log('🔥 Webhook PATCH handler called - This should not happen');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📍 Request URL:', request.url);
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}