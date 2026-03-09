export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { GasBand } from '@/lib/gasScoring';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session');
    const bandParam = searchParams.get('band') as GasBand | null;
    const scoreParam = searchParams.get('score');

    let band: GasBand = 'few';
    let totalScore = 0;
    let safetyYes = false;

    if (sessionId && sessionId !== 'public') {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT band, total_score, safety_yes FROM quiz.gaslighting_sessions WHERE id = $1',
          [sessionId]
        );
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        band = result.rows[0].band as GasBand;
        totalScore = result.rows[0].total_score as number;
        safetyYes = result.rows[0].safety_yes as boolean;
      } finally {
        client.release();
      }
    } else if (bandParam) {
      band = (['few', 'some', 'many'] as GasBand[]).includes(bandParam)
        ? bandParam
        : 'few';
      totalScore = scoreParam ? parseInt(scoreParam, 10) : 0;
      safetyYes = false;
    }

    // Dynamic imports to avoid Edge runtime issues
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { RealityGroundingGuide } = await import('@/lib/gasPdf');
    const React = (await import('react')).default;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(RealityGroundingGuide as any, {
      band,
      totalScore,
      safetyYes,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    const bytes = new Uint8Array(buffer);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reality-grounding-guide.pdf"',
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[gaslighting/guide]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
