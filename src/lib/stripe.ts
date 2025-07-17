import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  PRICE_AMOUNT: 1000, // $10.00 in cents
  CURRENCY: 'usd',
  PAYMENT_METHOD_TYPES: ['card'] as const,
};