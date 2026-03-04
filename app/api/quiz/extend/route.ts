export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { scoreAnswers } from '@/lib/scoring';
import { QUICK_TEST_IDS, FULL_ASSESSMENT_IDS } from '@/lib/questions';

const ALL_QUESTION_IDS = [...QUICK_TEST_IDS, ...FULL_ASSESSMENT_IDS];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, additionalAnswers } = body as {
      sessionId: string;
      additionalAnswers: Record<string, number>;
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Fetch the existing session
      const existing = await client.query(
        'SELECT id, answers FROM quiz.sessions WHERE id = $1',
        [sessionId]
      );

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const row = existing.rows[0];
      const previousAnswers: Record<number, number> = row.answers;

      // Validate additional answers cover Full Assessment questions
      const missingIds = FULL_ASSESSMENT_IDS.filter(
        (id) => additionalAnswers[id] == null
      );
      if (missingIds.length > 0) {
        return NextResponse.json(
          { error: `Missing answers for question IDs: ${missingIds.join(', ')}` },
          { status: 400 }
        );
      }

      // Convert string keys
      const numericAdditional: Record<number, number> = {};
      for (const [k, v] of Object.entries(additionalAnswers)) {
        numericAdditional[parseInt(k, 10)] = v;
      }

      // Merge all answers
      const allAnswers: Record<number, number> = {
        ...previousAnswers,
        ...numericAdditional,
      };

      // Re-score with all 30 questions
      const { scores, percentiles } = scoreAnswers(allAnswers, ALL_QUESTION_IDS);

      // Update session
      await client.query(
        `UPDATE quiz.sessions
         SET answers = $1,
             scores = $2,
             percentiles = $3,
             is_preliminary = FALSE,
             completed_at = NOW()
         WHERE id = $4`,
        [
          JSON.stringify(allAnswers),
          JSON.stringify(scores),
          JSON.stringify(percentiles),
          sessionId,
        ]
      );

      return NextResponse.json({
        sessionId,
        scores,
        percentiles,
        isPreliminary: false,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[quiz/extend]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
