export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import { scoreAnswers } from '@/lib/scoring';
import { QUICK_TEST_IDS } from '@/lib/questions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, mode = 'self', subjectName, challengerSessionId } = body as {
      answers: Record<string, number>;
      mode?: string;
      subjectName?: string;
      challengerSessionId?: string;
    };

    // Validate we have answers for all Quick Test questions
    const missingIds = QUICK_TEST_IDS.filter((id) => answers[id] == null);
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `Missing answers for question IDs: ${missingIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert string keys to number keys (JSON serialisation)
    const numericAnswers: Record<number, number> = {};
    for (const [k, v] of Object.entries(answers)) {
      numericAnswers[parseInt(k, 10)] = v;
    }

    // Score only the Quick Test questions (15 items, 5 per trait)
    const { scores, percentiles } = scoreAnswers(numericAnswers, QUICK_TEST_IDS);

    // Generate tokens
    const shareToken = randomBytes(16).toString('hex');
    const challengeToken = randomBytes(16).toString('hex');

    // Persist session
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO quiz.sessions
          (mode, subject_name, answers, scores, percentiles, share_token, challenge_token,
           challenger_session_id, is_preliminary, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW())
         RETURNING id, share_token, challenge_token`,
        [
          mode,
          subjectName || null,
          JSON.stringify(numericAnswers),
          JSON.stringify(scores),
          JSON.stringify(percentiles),
          shareToken,
          challengeToken,
          challengerSessionId || null,
        ]
      );

      const row = result.rows[0];

      // If this was a challenge response, mark the challenger's session as completed
      let challengerData: {
        scores: Record<string, number>;
        percentiles: Record<string, number>;
        subjectName: string | null;
        shareToken: string;
      } | null = null;

      if (challengerSessionId) {
        await client.query(
          `UPDATE quiz.sessions SET challenge_completed_at = NOW() WHERE id = $1`,
          [challengerSessionId]
        );

        // Fetch challenger data for comparison
        const challengerResult = await client.query(
          `SELECT scores, percentiles, subject_name, share_token FROM quiz.sessions WHERE id = $1`,
          [challengerSessionId]
        );
        if (challengerResult.rows.length > 0) {
          const cr = challengerResult.rows[0];
          challengerData = {
            scores: cr.scores,
            percentiles: cr.percentiles,
            subjectName: cr.subject_name,
            shareToken: cr.share_token,
          };
        }
      }

      return NextResponse.json({
        sessionId: row.id,
        shareToken: row.share_token,
        challengeToken: row.challenge_token,
        scores,
        percentiles,
        isPreliminary: true,
        challengerData,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[quiz/submit]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
