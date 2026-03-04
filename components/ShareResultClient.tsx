'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { TraitScores, TraitPercentiles } from '@/lib/scoring';
import { traitSummary, compositeSummary } from '@/lib/scoring';

const TRAIT_CONFIG = {
  narcissism: { label: 'Narcissism', color: '#f0c040', bg: 'rgba(240,192,64,0.10)' },
  psychopathy: { label: 'Psychopathy', color: '#c0392b', bg: 'rgba(192,57,43,0.10)' },
  machiavellianism: { label: 'Machiavellianism', color: '#8e44ad', bg: 'rgba(142,68,173,0.10)' },
} as const;

type TraitKey = keyof typeof TRAIT_CONFIG;

interface Props {
  scores: TraitScores;
  percentiles: TraitPercentiles;
  shareToken: string; // reserved for future copy-link feature on share page
  isPreliminary: boolean;
  subjectName?: string | null;
}

export default function ShareResultClient({
  scores,
  percentiles,
  shareToken: _shareToken, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPreliminary,
  subjectName,
}: Props) {
  const name = subjectName || null;
  const heading = name ? `${name}'s Dark Triad Profile` : 'Dark Triad Profile';

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          {isPreliminary && (
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold uppercase tracking-widest">
              Preliminary Assessment
            </div>
          )}
          {!isPreliminary && (
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-semibold uppercase tracking-widest">
              ✓ Full Assessment
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black mb-2">{heading}</h1>
          <p className="text-gray-500 text-sm">
            {isPreliminary ? 'Preliminary results (15 questions)' : 'Full results (30 questions)'}
          </p>
        </div>

        {/* ── Composite ───────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-6 mb-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            Composite Dark Triad Score
          </p>
          <div className="text-6xl font-black mb-1" style={{ color: '#c0392b' }}>
            {scores.composite}
          </div>
          <p className="text-sm text-gray-400">{compositeSummary(scores.composite)}</p>
          <p className="text-xs text-gray-600 mt-1">
            Higher than {percentiles.composite}% of people
          </p>
        </div>

        {/* ── Trait Bars ──────────────────────────────────────────────────── */}
        <div className="space-y-4 mb-8">
          {(Object.keys(TRAIT_CONFIG) as TraitKey[]).map((trait) => {
            const cfg = TRAIT_CONFIG[trait];
            const score = scores[trait];
            const pct = percentiles[trait];
            return (
              <TraitBar
                key={trait}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                score={score}
                percentile={pct}
                summary={traitSummary(trait, pct)}
              />
            );
          })}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-6 text-center mb-6">
          <p className="text-sm text-gray-400 mb-1">
            {name ? `Curious how you compare to ${name}?` : 'How do you compare?'}
          </p>
          <h2 className="text-xl font-bold mb-4">Take the Dark Triad Profiler</h2>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold rounded-lg transition-colors shadow-lg shadow-[#c0392b]/20"
          >
            Test Yourself →
          </Link>
          <p className="text-xs text-gray-700 mt-3">15 questions · Anonymous · Free</p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
            ← Dark Triad Profiler
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Animated bar ─────────────────────────────────────────────────────────────

function TraitBar({
  label, color, bg, score, percentile, summary,
}: {
  label: string; color: string; bg: string;
  score: number; percentile: number; summary: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.style.width = `${score}%`;
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="rounded-xl border p-5" style={{ borderColor: `${color}30`, backgroundColor: bg }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold" style={{ color }}>{label}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{summary}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color }}>{score}</div>
          <div className="text-xs text-gray-600">Top {100 - percentile}%</div>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ backgroundColor: color, width: 0 }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-700">0</span>
        <span className="text-[10px] text-gray-500">Higher than {percentile}% of people</span>
        <span className="text-[10px] text-gray-700">100</span>
      </div>
    </div>
  );
}
