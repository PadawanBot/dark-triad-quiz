export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, nickname } = body as {
      sessionId: string;
      nickname: string;
    };

    if (!sessionId || !nickname) {
      return NextResponse.json(
        { error: 'sessionId and nickname are required' },
        { status: 400 }
      );
    }

    const cleanNickname = nickname.trim().slice(0, 20);
    if (!cleanNickname) {
      return NextResponse.json({ error: 'Nickname cannot be empty' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE quiz.sessions
         SET leaderboard_opt_in = TRUE, nickname = $1
         WHERE id = $2
         RETURNING id`,
        [cleanNickname, sessionId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[quiz/leaderboard-optin]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
