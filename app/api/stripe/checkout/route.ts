export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body as { sessionId?: string };

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Verify session exists and Tier 2 is unlocked
    const client = await pool.connect();
    let session;
    try {
      const result = await client.query(
        'SELECT id, email, tier2_unlocked_at, paid_report_unlocked FROM quiz.sessions WHERE id = $1',
        [sessionId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      session = result.rows[0];
    } finally {
      client.release();
    }

    if (!session.tier2_unlocked_at) {
      return NextResponse.json({ error: 'Email gate not completed' }, { status: 403 });
    }

    if (session.paid_report_unlocked) {
      return NextResponse.json({ error: 'Report already unlocked' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://quiz.theautomateddoctor.com';

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Dark Triad Full Report',
              description: 'Your personalised Dark Triad psychological profile — trait deep-dive, relationship patterns, and evidence-based strategies. Delivered as a PDF.',
            },
            unit_amount: 699, // $6.99 USD in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        quiz_session_id: sessionId,
      },
      customer_email: session.email ?? undefined,
      success_url: `${baseUrl}/quiz/success?session_id={CHECKOUT_SESSION_ID}&quiz_session_id=${sessionId}`,
      cancel_url: `${baseUrl}/quiz?session=${sessionId}`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
