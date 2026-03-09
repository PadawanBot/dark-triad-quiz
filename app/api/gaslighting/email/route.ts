export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const KIT_BASE = 'https://api.convertkit.com/v3';

async function kitSubscribeGaslighting(
  email: string,
  band: string,
  totalScore: number
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return { success: false, error: 'No KIT_API_KEY configured' };

  try {
    // Get or create tag
    const tagsRes = await fetch(`${KIT_BASE}/tags?api_key=${apiKey}`);
    if (!tagsRes.ok) return { success: false, error: `Kit tags fetch failed: ${tagsRes.status}` };
    const tagsData = await tagsRes.json();
    const tags: Array<{ id: number; name: string }> = tagsData.tags ?? [];
    let tag = tags.find((t) => t.name === 'gaslighting-quiz');

    if (!tag) {
      const createRes = await fetch(`${KIT_BASE}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, tag: { name: 'gaslighting-quiz' } }),
      });
      if (!createRes.ok) return { success: false, error: `Kit tag create failed: ${createRes.status}` };
      const createData = await createRes.json();
      tag = Array.isArray(createData) ? createData[0] : createData;
    }

    if (!tag?.id) return { success: false, error: 'Could not get Kit tag ID' };

    const guideUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://quiz.theautomateddoctor.com'}/api/gaslighting/guide?session=public&band=${encodeURIComponent(band)}&score=${totalScore}`;

    const subRes = await fetch(`${KIT_BASE}/tags/${tag.id}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        fields: {
          gaslighting_band: band,
          gaslighting_score: String(totalScore),
          gaslighting_guide_url: guideUrl,
        },
      }),
    });

    if (!subRes.ok) {
      const errText = await subRes.text();
      return { success: false, error: `Kit subscribe failed: ${subRes.status} ${errText}` };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, email } = body as { sessionId?: string; email?: string };

    if (!sessionId || !email) {
      return NextResponse.json({ error: 'sessionId and email required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const sessionResult = await client.query(
        'SELECT id, band, total_score, email_sent_at FROM quiz.gaslighting_sessions WHERE id = $1',
        [sessionId]
      );

      if (sessionResult.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const session = sessionResult.rows[0];
      const band = session.band as string;
      const totalScore = session.total_score as number;

      // Save email
      await client.query(
        `UPDATE quiz.gaslighting_sessions
         SET email = $1, email_sent_at = COALESCE(email_sent_at, NOW())
         WHERE id = $2`,
        [email, sessionId]
      );

      // Subscribe to Kit
      const kitResult = await kitSubscribeGaslighting(email, band, totalScore);

      // Build guide URL for client-side download/display
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? 'https://quiz.theautomateddoctor.com';
      const guideUrl = `${baseUrl}/api/gaslighting/guide?session=${sessionId}`;

      return NextResponse.json({
        success: true,
        guideUrl,
        kitSuccess: kitResult.success,
        kitError: kitResult.error ?? null,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[gaslighting/email]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
