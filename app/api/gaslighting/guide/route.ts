export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { RealityGroundingGuide } from '@/lib/gasPdf';
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
      // Fetch from DB
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
      // Public/fallback — use query params (no safety block for anonymous)
      band = (['few', 'some', 'many'] as GasBand[]).includes(bandParam)
        ? bandParam
        : 'few';
      totalScore = scoreParam ? parseInt(scoreParam, 10) : 0;
      safetyYes = false;
    }

    const element = React.createElement(RealityGroundingGuide, {
      band,
      totalScore,
      safetyYes,
    });

    const buffer = await renderToBuffer(element);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reality-grounding-guide.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[gaslighting/guide]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
