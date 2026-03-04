import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import pool from '@/lib/db';
import type { TraitScores } from '@/lib/scoring';

interface PageProps {
  params: { token: string };
}

async function getChallenge(token: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, subject_name, scores, challenge_token
       FROM quiz.sessions WHERE challenge_token = $1`,
      [token]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await getChallenge(params.token);
  if (!session) return { title: 'Challenge Not Found' };

  const name = session.subject_name ? session.subject_name : 'Someone';
  const scores = session.scores as TraitScores;

  return {
    title: `${name} challenged you — Dark Triad Profiler`,
    description: `${name} scored ${scores.composite}/100 on the Dark Triad Profiler. Can you beat them? Take the 15-question test.`,
  };
}

export default async function ChallengePage({ params }: PageProps) {
  const session = await getChallenge(params.token);
  if (!session) notFound();

  const scores = session.scores as TraitScores;
  const name = session.subject_name as string | null;
  const displayName = name || 'Someone';
  const sessionId = session.id as string;

  const dominant =
    scores.narcissism >= scores.psychopathy && scores.narcissism >= scores.machiavellianism
      ? { label: 'Narcissism', color: '#f0c040' }
      : scores.psychopathy >= scores.machiavellianism
      ? { label: 'Psychopathy', color: '#c0392b' }
      : { label: 'Machiavellianism', color: '#8e44ad' };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(192,57,43,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-[#c0392b]/40 bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
            You&apos;ve Been Challenged
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">
            <span className="text-[#c0392b]">{displayName}</span>
            {' '}challenged you
          </h1>
          <p className="text-gray-400 mb-10 text-lg">
            They took the Dark Triad Profiler. Do you have what it takes to beat them?
          </p>

          {/* Score Teaser Card */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">
              {displayName}&apos;s Composite Score
            </p>
            <div className="text-7xl font-black mb-2" style={{ color: '#c0392b' }}>
              {scores.composite}
            </div>
            <p className="text-sm text-gray-500 mb-4">out of 100</p>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: `${dominant.color}18`,
                border: `1px solid ${dominant.color}40`,
                color: dominant.color,
              }}
            >
              Dominant trait: {dominant.label}
            </div>

            {/* Blurred teaser of trait breakdown */}
            <div className="mt-6 space-y-2 select-none" aria-hidden="true">
              {['Narcissism', 'Psychopathy', 'Machiavellianism'].map((t) => (
                <div key={t} className="flex items-center gap-3 opacity-40">
                  <span className="text-xs text-gray-600 w-28 text-right">{t}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-white/20 blur-sm" style={{ width: '60%' }} />
                  </div>
                  <span className="text-xs text-gray-700 w-6 blur-sm">??</span>
                </div>
              ))}
              <p className="text-xs text-gray-700 mt-2">Take the test to see full breakdown</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/quiz?challenger=${sessionId}`}
            className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-xl rounded-xl transition-colors shadow-2xl shadow-[#c0392b]/25"
          >
            Accept the Challenge →
          </Link>
          <p className="text-xs text-gray-700 mt-3">15 questions · ~3 minutes · Free · Anonymous</p>

          <div className="mt-8">
            <Link href="/" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
              ← Dark Triad Profiler
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
