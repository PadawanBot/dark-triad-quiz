export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, mode, subject_name, scores, percentiles,
                share_token, is_preliminary, completed_at
         FROM quiz.sessions
         WHERE id = $1`,
        [params.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const row = result.rows[0];
      return NextResponse.json({
        sessionId: row.id,
        mode: row.mode,
        subjectName: row.subject_name,
        scores: row.scores,
        percentiles: row.percentiles,
        shareToken: row.share_token,
        isPreliminary: row.is_preliminary,
        completedAt: row.completed_at,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[quiz/session]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
