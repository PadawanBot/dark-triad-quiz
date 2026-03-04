import type { Metadata } from 'next';
import pool from '@/lib/db';
import type { TraitScores } from '@/lib/scoring';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Dark Triad Leaderboard — Who Ranks Highest?',
  description:
    'See who carries the most Dark Triad traits. Top scorers ranked by composite score. Can you make the list?',
};

// Revalidate every 5 minutes
export const revalidate = 300;

interface LeaderboardRow {
  rank: number;
  nickname: string;
  dominantTrait: string;
  composite: number;
  completedAt: string;
}

async function getLeaderboard(filter: 'all' | 'week' = 'all') {
  const client = await pool.connect();
  try {
    const whereClause =
      filter === 'week'
        ? `AND completed_at >= NOW() - INTERVAL '7 days'`
        : '';

    const result = await client.query(
      `SELECT nickname, scores, completed_at
       FROM quiz.sessions
       WHERE leaderboard_opt_in = TRUE
         AND nickname IS NOT NULL
         AND completed_at IS NOT NULL
         ${whereClause}
       ORDER BY (scores->>'composite')::int DESC
       LIMIT 50`
    );

    return result.rows.map((row, i) => {
      const scores = row.scores as TraitScores;
      const dominant =
        scores.narcissism >= scores.psychopathy && scores.narcissism >= scores.machiavellianism
          ? 'narcissism'
          : scores.psychopathy >= scores.machiavellianism
          ? 'psychopathy'
          : 'machiavellianism';

      return {
        rank: i + 1,
        nickname: row.nickname as string,
        dominantTrait: dominant,
        composite: scores.composite,
        completedAt: (row.completed_at as Date).toISOString(),
      } as LeaderboardRow;
    });
  } finally {
    client.release();
  }
}

async function getTotalCount() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT COUNT(*) as count FROM quiz.sessions WHERE completed_at IS NOT NULL`
    );
    return parseInt(result.rows[0].count, 10);
  } finally {
    client.release();
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = searchParams.filter === 'week' ? 'week' : 'all';
  const [rows, totalCount] = await Promise.all([
    getLeaderboard(filter),
    getTotalCount(),
  ]);

  return <LeaderboardClient rows={rows} totalCount={totalCount} filter={filter} />;
}
