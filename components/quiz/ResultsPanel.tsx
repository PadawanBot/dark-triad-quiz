'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { TraitScores, TraitPercentiles } from '@/lib/scoring';
import { traitSummary, compositeSummary } from '@/lib/scoring';

const TRAIT_CONFIG = {
  narcissism: { label: 'Narcissism', color: '#f0c040', bg: 'rgba(240,192,64,0.12)' },
  psychopathy: { label: 'Psychopathy', color: '#c0392b', bg: 'rgba(192,57,43,0.12)' },
  machiavellianism: { label: 'Machiavellianism', color: '#8e44ad', bg: 'rgba(142,68,173,0.12)' },
} as const;

type TraitKey = keyof typeof TRAIT_CONFIG;

interface Props {
  scores: TraitScores;
  percentiles: TraitPercentiles;
  shareToken: string;
  challengeToken?: string;
  sessionId?: string;
  isPreliminary: boolean;
  onContinue?: () => void;
  subjectName?: string;
}

export default function ResultsPanel({
  scores,
  percentiles,
  shareToken,
  challengeToken,
  sessionId,
  isPreliminary,
  onContinue,
  subjectName,
}: Props) {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const shareUrl = `${baseUrl}/r/${shareToken}`;
  const challengeUrl = challengeToken ? `${baseUrl}/c/${challengeToken}` : null;

  const handleCopy = (url: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    document.body.removeChild(el);
  };

  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);
  const [directInput, setDirectInput] = useState('');
  const [directSent, setDirectSent] = useState(false);

  // Leaderboard opt-in state
  const [lbOptIn, setLbOptIn] = useState(false);
  const [lbNickname, setLbNickname] = useState('');
  const [lbSubmitting, setLbSubmitting] = useState(false);
  const [lbDone, setLbDone] = useState(false);
  const [lbError, setLbError] = useState<string | null>(null);

  const dominantTrait = Object.entries(scores)
    .filter(([k]) => k !== 'composite')
    .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];

  const shareText = encodeURIComponent(
    `I just scored ${scores.composite}/100 on the Dark Triad Profiler. My dominant trait: ${dominantTrait.charAt(0).toUpperCase() + dominantTrait.slice(1)}. What's yours?`
  );

  const handleDirectShare = () => {
    const val = directInput.trim();
    if (!val) return;
    if (val.startsWith('@') || !val.includes('@')) {
      const handle = val.startsWith('@') ? val : `@${val}`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${shareText}+${handle}&url=${encodeURIComponent(shareUrl)}`;
      window.open(tweetUrl, '_blank');
    } else {
      const subject = encodeURIComponent('Can you beat my Dark Triad score?');
      const body = encodeURIComponent(
        `I just took the Dark Triad Profiler and scored ${scores.composite}/100.\n\nMy dominant trait was ${dominantTrait}.\n\nThink you can beat me? Take the test:\n${shareUrl}`
      );
      window.location.href = `mailto:${val}?subject=${subject}&body=${body}`;
    }
    setDirectSent(true);
    setTimeout(() => setDirectSent(false), 3000);
  };

  const handleLeaderboardSubmit = async () => {
    if (!sessionId) return;
    const nick = lbNickname.trim().slice(0, 20);
    if (!nick) {
      setLbError('Please enter a nickname');
      return;
    }
    setLbSubmitting(true);
    setLbError(null);
    try {
      const res = await fetch('/api/quiz/leaderboard-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, nickname: nick }),
      });
      if (!res.ok) throw new Error('Failed');
      setLbDone(true);
    } catch {
      setLbError('Something went wrong. Try again.');
    } finally {
      setLbSubmitting(false);
    }
  };

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
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            {subjectName ? `${subjectName}'s Results` : 'Your Results'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isPreliminary
              ? 'Based on 15 questions — preliminary estimates'
              : 'Based on all 30 questions — full accuracy'}
          </p>
        </div>

        {/* ── Composite Score ─────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-6 mb-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            Composite Dark Triad Score
          </p>
          <div className="text-6xl font-black mb-1" style={{ color: '#c0392b' }}>
            {scores.composite}
          </div>
          <p className="text-sm text-gray-400">
            {compositeSummary(scores.composite)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Higher than {percentiles.composite}% of people
          </p>
        </div>

        {/* ── Trait Score Bars ────────────────────────────────────────────── */}
        <div className="space-y-4 mb-8">
          {(Object.keys(TRAIT_CONFIG) as TraitKey[]).map((trait) => {
            const cfg = TRAIT_CONFIG[trait];
            const score = scores[trait];
            const pct = percentiles[trait];
            const summary = traitSummary(trait, pct);

            return (
              <TraitBar
                key={trait}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                score={score}
                percentile={pct}
                summary={summary}
              />
            );
          })}
        </div>

        {/* ── Leaderboard Opt-in ──────────────────────────────────────────── */}
        {sessionId && (
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 mb-6">
            {lbDone ? (
              <div className="text-center py-2">
                <p className="text-green-400 font-semibold text-sm">✓ You&apos;re on the leaderboard!</p>
                <Link href="/leaderboard" className="text-xs text-gray-500 hover:text-gray-300 mt-1 inline-block">
                  View Leaderboard →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="lb-optin"
                    checked={lbOptIn}
                    onChange={(e) => setLbOptIn(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border border-white/20 bg-black/40 accent-[#c0392b] cursor-pointer"
                  />
                  <label htmlFor="lb-optin" className="text-sm cursor-pointer select-none">
                    <span className="text-white font-medium">Add me to the leaderboard</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Show your score publicly (nickname only)</span>
                  </label>
                </div>
                {lbOptIn && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={lbNickname}
                      onChange={(e) => setLbNickname(e.target.value.slice(0, 20))}
                      placeholder="Your nickname (max 20 chars)"
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                      onKeyDown={(e) => e.key === 'Enter' && handleLeaderboardSubmit()}
                    />
                    <button
                      onClick={handleLeaderboardSubmit}
                      disabled={lbSubmitting}
                      className="px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      {lbSubmitting ? '…' : 'Submit'}
                    </button>
                  </div>
                )}
                {lbError && <p className="text-xs text-red-400 mt-2">{lbError}</p>}
              </>
            )}
          </div>
        )}

        {/* ── Preliminary CTA ─────────────────────────────────────────────── */}
        {isPreliminary && onContinue && (
          <div className="rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-6 mb-6">
            <h2 className="font-bold text-lg mb-1">Want a more accurate score?</h2>
            <p className="text-gray-400 text-sm mb-4">
              Answer 15 more questions to refine your results. Your preliminary
              data is saved — continue any time.
            </p>
            <button
              onClick={onContinue}
              className="w-full py-3 bg-[#c0392b] hover:bg-[#a93226] text-white font-semibold rounded-lg transition-colors"
            >
              Refine My Results (15 more questions) →
            </button>
            <p className="text-center text-xs text-gray-700 mt-2">~90 seconds</p>
          </div>
        )}

        {/* ── Share ───────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-5 mb-4">
          <p className="text-sm font-semibold mb-3">Share your results</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none"
            />
            <button
              onClick={() => { handleCopy(shareUrl); setCopiedShare(true); setTimeout(() => setCopiedShare(false), 2500); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {copiedShare ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* ── Challenge Link ──────────────────────────────────────────────── */}
        {challengeUrl && (
          <div className="rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-5 mb-4">
            <p className="text-sm font-semibold mb-1">Challenge someone</p>
            <p className="text-xs text-gray-500 mb-3">Send this link — they&apos;ll see your score and can try to beat it</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={challengeUrl}
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none"
              />
              <button
                onClick={() => { handleCopy(challengeUrl); setCopiedChallenge(true); setTimeout(() => setCopiedChallenge(false), 2500); }}
                className="px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                {copiedChallenge ? '✓ Copied' : 'Copy →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Direct Share ────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-5 mb-6">
          <p className="text-sm font-semibold mb-1">Challenge someone directly</p>
          <p className="text-xs text-gray-500 mb-3">Enter an email or X/Twitter handle (@username)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDirectShare()}
              placeholder="friend@example.com or @username"
              className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
            />
            <button
              onClick={handleDirectShare}
              className="px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {directSent ? '✓ Sent!' : 'Send →'}
            </button>
          </div>
        </div>

        {/* ── Footer nav ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
          >
            ← Home
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
          >
            Leaderboard
          </Link>
          <Link
            href="/quiz"
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
          >
            Take Again
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Animated Score Bar ────────────────────────────────────────────────────────

function TraitBar({
  label,
  color,
  bg,
  score,
  percentile,
  summary,
}: {
  label: string;
  color: string;
  bg: string;
  score: number;
  percentile: number;
  summary: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.style.setProperty('--target-width', `${score}%`);
      el.classList.add('score-bar-fill');
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div
      className="rounded-xl border p-5 transition-colors"
      style={{ borderColor: `${color}30`, backgroundColor: bg }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold" style={{ color }}>
            {label}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{summary}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color }}>
            {score}
          </div>
          <div className="text-xs text-gray-600">
            Top {100 - percentile}%
          </div>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: 0,
          }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-700">0</span>
        <span className="text-[10px] text-gray-500">
          Higher than {percentile}% of people
        </span>
        <span className="text-[10px] text-gray-700">100</span>
      </div>
    </div>
  );
}
