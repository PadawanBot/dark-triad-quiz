'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TRAIT_CONFIG = {
  narcissism: { label: 'Narcissism', color: '#f0c040', shortLabel: 'Narc.' },
  psychopathy: { label: 'Psychopathy', color: '#c0392b', shortLabel: 'Psych.' },
  machiavellianism: { label: 'Machiavellianism', color: '#8e44ad', shortLabel: 'Mach.' },
} as const;

type TraitKey = keyof typeof TRAIT_CONFIG;

interface LeaderboardRow {
  rank: number;
  nickname: string;
  dominantTrait: string;
  composite: number;
  completedAt: string;
}

interface Props {
  rows: LeaderboardRow[];
  totalCount: number;
  filter: 'all' | 'week';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' });
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm text-gray-500 font-mono w-5 text-center">{rank}</span>;
}

export default function LeaderboardClient({ rows, totalCount, filter }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[#c0392b]/40 bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
            Live Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            The Dark Triad<br />
            <span className="text-[#c0392b]">Leaderboard</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {totalCount.toLocaleString()} participants ranked by composite score
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => router.push('/leaderboard')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              filter === 'all'
                ? 'bg-[#c0392b] text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => router.push('/leaderboard?filter=week')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              filter === 'week'
                ? 'bg-[#c0392b] text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            This Week
          </button>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/3 p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No entries yet this week</p>
            <p className="text-gray-700 text-sm">Be the first to rank!</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-white/5 border-b border-white/10 text-xs text-gray-600 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Nickname</div>
              <div className="col-span-4">Dominant Trait</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-1 text-right hidden sm:block"></div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {rows.map((row) => {
                const trait = row.dominantTrait as TraitKey;
                const cfg = TRAIT_CONFIG[trait] ?? TRAIT_CONFIG.psychopathy;

                return (
                  <div
                    key={`${row.nickname}-${row.rank}`}
                    className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center transition-colors hover:bg-white/3 ${
                      row.rank <= 3 ? 'bg-white/2' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      <RankBadge rank={row.rank} />
                    </div>

                    {/* Nickname */}
                    <div className="col-span-4">
                      <span
                        className={`font-semibold text-sm ${row.rank <= 3 ? 'text-white' : 'text-gray-300'}`}
                      >
                        {row.nickname}
                      </span>
                    </div>

                    {/* Dominant Trait */}
                    <div className="col-span-4">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          color: cfg.color,
                          background: `${cfg.color}18`,
                          border: `1px solid ${cfg.color}35`,
                        }}
                      >
                        <span className="hidden sm:inline">{cfg.label}</span>
                        <span className="sm:hidden">{cfg.shortLabel}</span>
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-right">
                      <span
                        className="text-lg font-black"
                        style={{ color: row.rank <= 3 ? '#c0392b' : 'rgba(255,255,255,0.7)' }}
                      >
                        {row.composite}
                      </span>
                    </div>

                    {/* Date (desktop only) */}
                    <div className="col-span-1 text-right hidden sm:block">
                      <span className="text-[10px] text-gray-700">
                        {formatDate(row.completedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participant count note */}
        <p className="text-center text-xs text-gray-700 mt-4">
          Showing top {Math.min(rows.length, 50)} of {totalCount.toLocaleString()} participants
          {filter === 'week' ? ' this week' : ' all time'}
        </p>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">See where you rank</h2>
          <p className="text-gray-400 text-sm mb-6">
            Take the 15-question assessment and opt in to appear on the leaderboard.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-lg rounded-xl transition-colors shadow-xl shadow-[#c0392b]/20"
          >
            Take the Test →
          </Link>
          <p className="text-xs text-gray-700 mt-3">15 questions · Anonymous · Free</p>
        </div>

        {/* Footer nav */}
        <div className="flex justify-center mt-8">
          <Link href="/" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
            ← Dark Triad Profiler
          </Link>
        </div>
      </div>
    </div>
  );
}
