'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TraitScores, TraitPercentiles } from '@/lib/scoring';

const TRAIT_CONFIG = {
  narcissism: { label: 'Narcissism', color: '#f0c040' },
  psychopathy: { label: 'Psychopathy', color: '#c0392b' },
  machiavellianism: { label: 'Machiavellianism', color: '#8e44ad' },
} as const;

type TraitKey = keyof typeof TRAIT_CONFIG;

interface ParticipantData {
  scores: TraitScores;
  percentiles: TraitPercentiles;
  subjectName?: string | null;
  shareToken: string;
  challengeToken?: string;
}

interface Props {
  you: ParticipantData;
  challenger: ParticipantData;
}

export default function ComparisonPanel({ you, challenger }: Props) {
  const [copied, setCopied] = useState<'share' | 'challenge' | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const yourName = you.subjectName || 'You';
  const challengerName = challenger.subjectName || 'Challenger';

  const youWinsComposite = you.scores.composite >= challenger.scores.composite;

  const handleCopy = (url: string, type: 'share' | 'challenge') => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
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

  const yourShareUrl = `${baseUrl}/r/${you.shareToken}`;
  const challengeBackUrl = you.challengeToken ? `${baseUrl}/c/${you.challengeToken}` : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 sm:px-6 py-12 text-white">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[#c0392b]/40 bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold uppercase tracking-widest">
            Challenge Results
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Head-to-Head</h1>
          <p className="text-gray-500 text-sm">
            {yourName} vs {challengerName}
          </p>
        </div>

        {/* Overall Winner */}
        <div
          className="rounded-2xl border p-6 mb-8 text-center"
          style={{
            borderColor: 'rgba(192,57,43,0.3)',
            background: 'rgba(192,57,43,0.08)',
          }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Overall Winner</p>
          <div className="text-2xl font-black mb-1">
            {youWinsComposite ? (
              <span>🏆 <span className="text-[#c0392b]">{yourName === 'You' ? 'You Win' : yourName}</span></span>
            ) : you.scores.composite === challenger.scores.composite ? (
              <span>🤝 <span className="text-gray-300">It&apos;s a Draw</span></span>
            ) : (
              <span>💀 <span className="text-gray-400">{challengerName} Wins</span></span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {you.scores.composite} vs {challenger.scores.composite} composite score
          </p>
        </div>

        {/* Comparison Header Row */}
        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div className="text-sm font-bold text-white/80 truncate">{yourName}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider self-center">Trait</div>
          <div className="text-sm font-bold text-white/80 truncate">{challengerName}</div>
        </div>

        {/* Trait Rows */}
        <div className="space-y-3 mb-8">
          {(Object.keys(TRAIT_CONFIG) as TraitKey[]).map((trait) => {
            const cfg = TRAIT_CONFIG[trait];
            const youScore = you.scores[trait];
            const theirScore = challenger.scores[trait];
            const youWins = youScore > theirScore;
            const draw = youScore === theirScore;

            return (
              <div
                key={trait}
                className="rounded-xl border p-4"
                style={{ borderColor: `${cfg.color}25`, background: `${cfg.color}08` }}
              >
                {/* Label */}
                <div className="text-center mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {youWins && <span className="ml-2 text-xs">🏆 You</span>}
                  {!youWins && !draw && <span className="ml-2 text-xs text-gray-600">🏆 Them</span>}
                  {draw && <span className="ml-2 text-xs text-gray-600">Draw</span>}
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-3 items-center">
                  {/* Your bar (right-to-left) */}
                  <div className="flex flex-col items-start gap-1">
                    <div
                      className="text-2xl font-black"
                      style={{ color: youWins ? cfg.color : 'rgba(255,255,255,0.4)' }}
                    >
                      {youScore}
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden rotate-180">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${youScore}%`, backgroundColor: youWins ? cfg.color : '#555' }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Top {100 - you.percentiles[trait]}%
                    </div>
                  </div>

                  {/* vs */}
                  <div className="text-center">
                    <span className="text-xs text-gray-700 font-mono">vs</span>
                  </div>

                  {/* Their bar */}
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className="text-2xl font-black"
                      style={{ color: !youWins && !draw ? cfg.color : 'rgba(255,255,255,0.4)' }}
                    >
                      {theirScore}
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${theirScore}%`, backgroundColor: !youWins && !draw ? cfg.color : '#555' }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-600 text-right">
                      Top {100 - challenger.percentiles[trait]}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composite Row */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-5 mb-8">
          <div className="text-center mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Composite Score</span>
          </div>
          <div className="grid grid-cols-3 items-center text-center">
            <div>
              <div className="text-4xl font-black" style={{ color: youWinsComposite ? '#c0392b' : 'rgba(255,255,255,0.4)' }}>
                {you.scores.composite}
              </div>
              {youWinsComposite && <div className="text-xs text-[#c0392b] mt-1">🏆 Winner</div>}
            </div>
            <div className="text-xs text-gray-600">vs</div>
            <div>
              <div className="text-4xl font-black" style={{ color: !youWinsComposite ? '#c0392b' : 'rgba(255,255,255,0.4)' }}>
                {challenger.scores.composite}
              </div>
              {!youWinsComposite && you.scores.composite !== challenger.scores.composite && (
                <div className="text-xs text-[#c0392b] mt-1">🏆 Winner</div>
              )}
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-4 mb-6">
          {/* Share your result */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <p className="text-sm font-semibold mb-3">Share your result</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={yourShareUrl}
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(yourShareUrl, 'share')}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                {copied === 'share' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Challenge them back */}
          {challengeBackUrl && (
            <div className="rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-5">
              <p className="text-sm font-semibold mb-1">Challenge them back</p>
              <p className="text-xs text-gray-500 mb-3">Send your own challenge link</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={challengeBackUrl}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(challengeBackUrl, 'challenge')}
                  className="px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  {copied === 'challenge' ? '✓ Copied' : 'Copy →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
          >
            ← Home
          </Link>
          <Link
            href="/quiz"
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
          >
            Take Again
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
