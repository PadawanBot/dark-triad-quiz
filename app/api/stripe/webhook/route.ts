export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';

// Disable body parsing — need raw body for Stripe signature verification
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('[webhook] Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.arrayBuffer();
    const buf = Buffer.from(rawBody);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const quizSessionId = checkoutSession.metadata?.quiz_session_id;
    const stripePaymentId = checkoutSession.payment_intent as string;

    if (!quizSessionId) {
      console.warn('[webhook] No quiz_session_id in metadata');
      return NextResponse.json({ received: true });
    }

    const client = await pool.connect();
    try {
      // Idempotency check: skip if already processed
      const existing = await client.query(
        'SELECT id, stripe_payment_id FROM quiz.sessions WHERE id = $1',
        [quizSessionId]
      );

      if (existing.rows.length === 0) {
        console.warn('[webhook] Quiz session not found:', quizSessionId);
        return NextResponse.json({ received: true });
      }

      const row = existing.rows[0];
      if (row.stripe_payment_id === stripePaymentId) {
        // Already processed — idempotent
        console.log('[webhook] Already processed, skipping:', stripePaymentId);
        return NextResponse.json({ received: true });
      }

      // Mark session as paid
      await client.query(
        `UPDATE quiz.sessions
         SET paid_report_unlocked = TRUE,
             payment_status = 'confirmed',
             stripe_payment_id = $1
         WHERE id = $2`,
        [stripePaymentId, quizSessionId]
      );

      console.log('[webhook] Payment confirmed for quiz session:', quizSessionId);
    } finally {
      client.release();
    }
  }

  return NextResponse.json({ received: true });
}
