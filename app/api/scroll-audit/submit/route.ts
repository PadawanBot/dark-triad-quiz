import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, profile, email } = body;

    if (!profile) {
      return NextResponse.json({ error: 'profile required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      if (email) {
        // Email capture path — upsert by looking for recent session with same profile,
        // or insert new row with email + report_token
        const result = await client.query(
          `INSERT INTO quiz.scroll_audit_sessions
             (answers, profile, email, email_captured_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING report_token`,
          [answers ? JSON.stringify(answers) : '{}', profile, email]
        );

        const reportToken = result.rows[0]?.report_token;

        // Send to Kit (ConvertKit) — non-blocking
        if (process.env.KIT_API_KEY) {
          fetch('https://api.kit.com/v4/subscribers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.KIT_API_KEY}`,
            },
            body: JSON.stringify({
              email_address: email,
              tags: [`scroll-audit`, `profile-${profile}`],
              fields: { scroll_profile: profile },
            }),
          }).catch(() => {/* non-critical */});
        }

        return NextResponse.json({ success: true, reportToken });
      } else {
        // Anonymous score save (called after completing quiz, before email)
        await client.query(
          `INSERT INTO quiz.scroll_audit_sessions (answers, profile)
           VALUES ($1, $2)`,
          [answers ? JSON.stringify(answers) : '{}', profile]
        );
        return NextResponse.json({ success: true });
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('scroll-audit submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
