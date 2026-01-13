import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    console.log('Stripe key prefix:', stripeKey?.substring(0, 7));

    const stripe = getStripe();
    const body = await request.json();
    const { organizerName, intervieweeName } = body;

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').trim();
    const successUrl = `${baseUrl}/setup/ready?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/setup/payment?cancelled=true`;

    console.log('Creating checkout session with URLs:', { baseUrl, successUrl, cancelUrl });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1SoVDv2RgbfwU75pele7ZSKb',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        organizer_name: organizerName || '',
        interviewee_name: intervieweeName || '',
      },
    });

    console.log('Session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error.type, error.code, error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
