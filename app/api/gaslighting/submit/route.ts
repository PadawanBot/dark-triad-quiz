export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

import pool from '@/lib/db';
import { scoreGasAnswers } from '@/lib/gasScoring';
import type { GasAnswers } from '@/lib/gasScoring';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, safetyYes } = body as {
      answers: Record<string, number>;
      safetyYes: boolean;
    };

    if (!answers || typeof safetyYes !== 'boolean') {
      return NextResponse.json(
        { error: 'answers and safetyYes are required' },
        { status: 400 }
      );
    }

    // Convert string keys to numbers
    const numericAnswers: GasAnswers = {};
    for (const [k, v] of Object.entries(answers)) {
      numericAnswers[parseInt(k, 10)] = v as 0 | 1 | 2;
    }

    const result = scoreGasAnswers(numericAnswers, safetyYes);

    // Persist to DB
    const client = await pool.connect();
    try {
      const dbResult = await client.query(
        `INSERT INTO quiz.gaslighting_sessions
           (answers, tactics_score, impact_score, total_score, band, safety_yes, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id`,
        [
          JSON.stringify(numericAnswers),
          result.tacticsScore,
          result.impactScore,
          result.totalScore,
          result.band,
          result.safetyYes,
        ]
      );

      const sessionId = dbResult.rows[0].id as string;

      return NextResponse.json({
        sessionId,
        tacticsScore: result.tacticsScore,
        impactScore: result.impactScore,
        totalScore: result.totalScore,
        band: result.band,
        safetyYes: result.safetyYes,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[gaslighting/submit]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
