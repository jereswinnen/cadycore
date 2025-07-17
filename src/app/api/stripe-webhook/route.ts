import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active'
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    console.log(`Processing Stripe event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { bib_number, photo_id } = session.metadata || {};

  if (!bib_number || !photo_id) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  try {
    // First, let's see what payment records exist for this bib
    console.log(`Looking for payment records for bib ${bib_number}`);
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('bib_number', bib_number);

    if (allPaymentsError) {
      console.error('Error fetching payment records:', allPaymentsError);
    } else {
      console.log(`Found ${allPayments?.length || 0} payment records for bib ${bib_number}`);
      console.log('Payment records:', allPayments);
    }

    // Update payment record
    console.log(`Looking for payment record with session ID: ${session.id}`);
    
    // Try to update the payment record by ID instead of session ID
    const paymentRecord = allPayments?.[0];
    if (paymentRecord) {
      console.log(`Updating payment record by ID: ${paymentRecord.id}`);
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .update({
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id)
        .select();

      if (paymentError) {
        console.error('Failed to update payment record by ID:', paymentError);
      } else {
        console.log(`Payment records updated by ID:`, paymentData?.length || 0);
        console.log('Updated payment record:', paymentData);
      }
    } else {
      console.error('No payment record found to update');
    }

    // Update photo access to mark payment as completed and unlock photo
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
      console.error('Failed to update photo access:', accessError);
    }

    console.log(`Payment completed for bib ${bib_number}, photo ${photo_id}`);
  } catch (error) {
    console.error('Error processing completed checkout:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  
  // Update payment status if needed
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Failed to update payment status:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);
  
  // Update payment status
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed'
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Failed to update payment status:', error);
  }
}