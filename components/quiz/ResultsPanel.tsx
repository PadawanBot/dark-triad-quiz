'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { TraitScores, TraitPercentiles } from '@/lib/scoring';
import { traitSummary, compositeSummary } from '@/lib/scoring';
import { getCharacterMatch } from '@/lib/character-map';

const TRAIT_CONFIG = {
  narcissism: { label: 'Narcissism', color: '#f0c040', bg: 'rgba(240,192,64,0.12)' },
  psychopathy: { label: 'Psychopathy', color: '#c0392b', bg: 'rgba(192,57,43,0.12)' },
  machiavellianism: { label: 'Machiavellianism', color: '#8e44ad', bg: 'rgba(142,68,173,0.12)' },
} as const;

type TraitKey = keyof typeof TRAIT_CONFIG;

const TRAIT_DESCRIPTIONS: Record<TraitKey, { high: string[]; medium: string[]; low: string[] }> = {
  narcissism: {
    high: [
      'Your Narcissism score is your most significant result. At this level, narcissistic traits — a strong self-orientation, a need for recognition, a sense of being somewhat exceptional — show up prominently in how you move through the world.',
      'In relationships, your drive for admiration can create tension over time. Partners and colleagues often feel drawn to your confidence early, then gradually like they\'re supporting characters in your story. The people who stay closest to you have learned to give you space to lead.',
      'Professionally, you\'re drawn to roles with visibility and authority. You self-promote effectively and perform well under pressure. The growth edge is managing the gap between how you experience yourself and how others experience you — especially the people closest to you.',
      'The research is clear on this: narcissism is highly responsive to self-awareness. People with elevated scores who develop genuine curiosity about others\' inner worlds consistently report better relationships and less of the constant need for validation that, if you\'re honest, is exhausting.',
    ],
    medium: [
      'Your Narcissism score sits in the moderate range — present but not dominant. You have a solid sense of your own value and likely advocate for yourself reasonably well without tipping into entitlement.',
      'In relationships, you balance your own needs with others\' most of the time. Under stress, you may become more self-focused than usual — this is the direction to watch when things get hard.',
      'Professionally, you perform well in competitive environments without needing to dominate them. Your growth edge is noticing when the drive for recognition is shaping decisions in ways that aren\'t serving you.',
    ],
    low: [
      'Your Narcissism score is genuinely low — you tend to undervalue your own contributions and may find it difficult to take credit even when it\'s deserved. You\'re likely seen as collaborative and easy to work with.',
      'In relationships, you invest deeply and often put others\' needs before your own. This makes you a loyal and attentive partner — and it also means you can be taken for granted more than you should be.',
      'Professionally, you may undersell yourself in negotiations and miss opportunities by waiting to be recognised rather than claiming recognition. Learning to advocate for yourself — not from ego, but from accuracy — would change a lot.',
    ],
  },
  psychopathy: {
    high: [
      'Your Psychopathy score is your most analytically significant result. At this level, you process the world through a cooler, more detached lens than most — emotions are data points rather than drivers. This makes you decisive in high-pressure situations where others freeze.',
      'Your empathy is largely cognitive: you can model what others feel without being moved by it. This is an asset in negotiation, leadership, and crisis response. The shadow side is that people close to you can feel unseen or emotionally alone in the relationship.',
      'The research on subclinical psychopathy is clear: elevated scores are over-represented in high-demand roles (surgery, law, finance, military leadership) precisely because of stress tolerance and decisiveness. The challenge is that the same detachment that helps you perform can quietly erode the relationships that matter.',
      'Growth for this profile isn\'t about manufacturing emotions you don\'t feel. It\'s about developing deliberate habits that compensate for lower automatic empathy — proactively checking in, naming what you observe in others, choosing reciprocity as a practice rather than waiting to feel it.',
    ],
    medium: [
      'Your Psychopathy score is in the moderate range — you have reasonable emotional resilience without being detached. You can make hard calls without being paralysed, while still feeling the weight of decisions that affect others.',
      'In relationships, you\'re generally present and emotionally available, though under sustained stress you may become harder to reach. People close to you have probably noticed you go quieter when things get difficult.',
      'Professionally, your stress tolerance is a genuine asset without being the coldness that high scorers sometimes project. You\'re seen as stable and reliable under pressure.',
    ],
    low: [
      'Your Psychopathy score is genuinely low — you feel things deeply, both your own emotions and those of the people around you. You\'re likely described as warm, empathetic, and trustworthy. These qualities are rare.',
      'In relationships, your high empathy makes you an exceptional listener and a trusted confidant. It also means conflict is particularly costly for you, and you may avoid necessary confrontation to preserve the peace.',
      'In competitive or high-stakes environments, your emotional responsiveness can work against you if not managed. Others with lower empathy may read your reactions and use them strategically. Learning to maintain composure as a skill — not by suppressing feeling, but by choosing when to show it — gives you protection without costing you your warmth.',
    ],
  },
  machiavellianism: {
    high: [
      'Your Machiavellianism score is your most strategically significant result. At this level, you think in systems and long games. Where others see a situation, you see a game — with players, incentives, and pressure points. This is a genuine advantage in complex environments.',
      'In relationships, the texture of elevated Machiavellianism is often a trust asymmetry — you extend less trust to others than they extend to you. Over time, perceptive people in your life can feel this, even when you don\'t consciously intend to signal it.',
      'Professionally, you navigate politics better than most, negotiate effectively, and rarely get blindsided by hidden agendas. The risk is reputation: high-Machiavellian patterns become legible to others over time. Being known as strategic is fine. Being known as willing to manipulate closes doors.',
      'The most powerful strategists aren\'t just sharp — they\'re also trusted. Those two things can coexist, but they have to be built on purpose. Voluntary transparency with safe people is the paradox: it often increases your influence, because trust is one of the few forms of power that compounds.',
    ],
    medium: [
      'Your Machiavellianism score sits in the moderate range — strategic social intelligence without it being the dominant driver of your behaviour. You read incentives and power dynamics well, and you adjust your approach accordingly.',
      'In relationships, you\'re generally honest and direct, with a tendency toward tactical thinking in high-stakes situations. You know when you\'re managing a conversation versus having one — and you usually know which mode to be in.',
      'Professionally, this is a useful range: you\'re politically aware without being seen as playing angles. Your growth edge is noticing when strategic mode is bleeding into personal relationships where it doesn\'t belong.',
    ],
    low: [
      'Your Machiavellianism score is genuinely low — you default to honesty and good faith in your dealings with others. You assume people mean what they say and are often right. The exceptions can catch you badly off guard.',
      'In relationships, your straightforwardness builds real trust over time. People know where they stand with you, and that\'s rare. The risk is in competitive environments where not everyone has agreed to play by the same rules you do.',
      'Learning to think strategically — not manipulatively, but with awareness of how others\' incentives shape their behaviour — would substantially protect your interests without changing who you are. Knowing the game exists isn\'t the same as playing it cynically.',
    ],
  },
};

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
  const characterMatch = getCharacterMatch(
    percentiles.narcissism,
    percentiles.machiavellianism,
    percentiles.psychopathy
  );

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
  const [nativeShareDone, setNativeShareDone] = useState(false);

  // ── Tier 2: Email gate state ──────────────────────────────────────────────
  const [tier2Email, setTier2Email] = useState('');
  const [tier2Submitting, setTier2Submitting] = useState(false);
  const [tier2Unlocked, setTier2Unlocked] = useState(false);
  const [tier2Error, setTier2Error] = useState<string | null>(null);

  // ── Tier 3: Stripe checkout state ─────────────────────────────────────────
  const [tier3Loading, setTier3Loading] = useState(false);
  const [tier3Error, setTier3Error] = useState<string | null>(null);

  // ── Promo banner state ───────────────────────────────────────────────────
  const [promoBarDismissed, setPromoBarDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('mindarchive_promo_dismissed') === '1';
  });

  const handlePromoBarDismiss = () => {
    setPromoBarDismissed(true);
    localStorage.setItem('mindarchive_promo_dismissed', '1');
  };

  // Leaderboard opt-in state (inside Tier 2)
  const [lbOptIn, setLbOptIn] = useState(false);
  const [lbNickname, setLbNickname] = useState('');
  const [lbSubmitting, setLbSubmitting] = useState(false);
  const [lbDone, setLbDone] = useState(false);
  const [lbError, setLbError] = useState<string | null>(null);

  const dominantTrait = Object.entries(scores)
    .filter(([k]) => k !== 'composite')
    .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];

  const shareText = encodeURIComponent(
    `I took the Dark Triad Profiler and my character match is ${characterMatch.name} (${characterMatch.franchise}).\n\n"${characterMatch.tagline}"\n\nWhat's yours? ${shareUrl}`
  );

  const handleNativeShare = async () => {
    const text = `I took the Dark Triad Profiler and my character match is ${characterMatch.name} (${characterMatch.franchise}). "${characterMatch.tagline}" What's yours? ${shareUrl}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'My Dark Triad Results', text, url: shareUrl });
        setNativeShareDone(true);
        setTimeout(() => setNativeShareDone(false), 3000);
      } catch { /* user cancelled */ }
    } else {
      handleCopy(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

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

  const handleTier2Submit = async () => {
    if (!sessionId) return;
    const email = tier2Email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setTier2Error('Please enter a valid email address');
      return;
    }
    setTier2Submitting(true);
    setTier2Error(null);
    try {
      const res = await fetch('/api/quiz/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to submit');
      }
      setTier2Unlocked(true);
    } catch (err) {
      setTier2Error(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setTier2Submitting(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!sessionId) return;
    setTier3Loading(true);
    setTier3Error(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create checkout');
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      setTier3Error(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setTier3Loading(false);
    }
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

        {/* ── Preliminary CTA ─────────────────────────────────────────────── */}
        {isPreliminary && onContinue && (
          <div className="rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-6 mb-8">
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

        {/* ── TIER 2: Email Gate ───────────────────────────────────────────── */}
        {!tier2Unlocked && sessionId && (
          <div className="rounded-xl border border-white/15 bg-gradient-to-b from-white/5 to-white/2 p-6 mb-6">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded-full bg-white/8 border border-white/10 text-xs text-gray-400 font-medium uppercase tracking-widest">
                Free Upgrade
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                Unlock your full psychological breakdown
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get a deep-dive analysis of all three traits — what your scores mean for your relationships,
                your work, and how others perceive you. Plus your Dark Triad radar chart.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={tier2Email}
                onChange={(e) => setTier2Email(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTier2Submit()}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              />
              <button
                onClick={handleTier2Submit}
                disabled={tier2Submitting}
                className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {tier2Submitting ? '…' : 'Unlock Free →'}
              </button>
            </div>
            {tier2Error && <p className="text-xs text-red-400 mt-2">{tier2Error}</p>}
            <p className="text-xs text-gray-700 mt-2">No spam. Unsubscribe any time.</p>
          </div>
        )}

        {/* ── TIER 2: Content (shown after email gate) ──────────────────────── */}
        {tier2Unlocked && (
          <>
            {/* MindArchive Promo Banner */}
            {!promoBarDismissed && (
              <div className="relative rounded-xl border border-amber-500/40 bg-[#1a1200] p-4 mb-6 flex items-start gap-3">
                <div className="flex-1 text-sm text-gray-300 leading-relaxed">
                  🎬 Watching the MindArchive Dark Triad video? Use code{' '}
                  <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    MINDARCHIVE
                  </span>
                  {' '}at checkout for <strong className="text-white">50% off</strong> the full report.
                </div>
                <button
                  onClick={handlePromoBarDismiss}
                  className="text-gray-600 hover:text-gray-400 transition-colors ml-2 flex-shrink-0 text-base leading-none"
                  aria-label="Dismiss promo banner"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Radar Chart */}
            <div className="rounded-xl border border-white/10 bg-white/3 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Dark Triad Fingerprint</p>
                  <h2 className="text-lg font-bold text-white">Trait Radar</h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                  ✓ Unlocked
                </div>
              </div>
              <RadarChart
                narcissism={scores.narcissism}
                psychopathy={scores.psychopathy}
                machiavellianism={scores.machiavellianism}
              />
            </div>

            {/* Full Trait Breakdowns */}
            {(Object.keys(TRAIT_CONFIG) as TraitKey[]).map((trait) => {
              const cfg = TRAIT_CONFIG[trait];
              const score = scores[trait];
              const desc = score > 65
                ? TRAIT_DESCRIPTIONS[trait].high
                : score >= 35
                ? TRAIT_DESCRIPTIONS[trait].medium
                : TRAIT_DESCRIPTIONS[trait].low;
              return (
                <div
                  key={trait}
                  className="rounded-xl border p-5 mb-4"
                  style={{ borderColor: `${cfg.color}25`, backgroundColor: `${cfg.color}08` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <h3 className="font-bold text-base" style={{ color: cfg.color }}>{cfg.label}</h3>
                    <span className="ml-auto text-sm font-semibold" style={{ color: cfg.color }}>{score}/100</span>
                  </div>
                  <div className="space-y-2">
                    {desc.map((para, i) => (
                      <p key={i} className="text-sm text-gray-400 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Combined Profile */}
            <div className="rounded-xl border border-white/10 bg-white/3 p-5 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Combined Profile</p>
              <h3 className="font-bold text-base text-white mb-3">What your combination means</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">
                {scores.composite > 65
                  ? `Your overall Dark Triad score is elevated — you share a psychological profile with a disproportionate number of people who hold positions of influence and leadership. The research shows these traits, when combined with self-awareness, tend to produce high achievers who can also sustain genuine relationships. Without awareness, the same profile tends to leave a trail of burned connections.`
                  : scores.composite >= 40
                  ? `Your overall Dark Triad score is moderate — your trait expression is contextual and adaptive. You can access strategic thinking and emotional resilience when the situation demands it, but you're not driven by them constantly. This range is associated with social flexibility and, importantly, real capacity for change.`
                  : `Your overall Dark Triad score is low — you're in the majority of people who navigate the world with genuine empathy and good faith. Your profile's primary implication isn't about your own behaviour; it's about understanding the people around you who may score differently.`
                }
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {`Your dominant trait is ${dominantTrait.charAt(0).toUpperCase() + dominantTrait.slice(1)} — which shapes how the rest of your profile expresses itself. Use the full report to get a personalised breakdown of what this specific combination means for your relationships and decisions.`}
              </p>
            </div>

            {/* Leaderboard Opt-in */}
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

            {/* ── TIER 3: Stripe CTA ─────────────────────────────────────────── */}
            <div className="rounded-xl border border-[#c0392b]/40 bg-gradient-to-b from-[#c0392b]/10 to-[#c0392b]/5 p-6 mb-8">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-[#c0392b]/15 border border-[#c0392b]/25 text-xs text-[#c0392b] font-semibold uppercase tracking-widest">
                    Personalised Report
                  </div>
                  <h2 className="text-xl font-black text-white mb-2">
                    Get your Dark Triad Full Report
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    A personalised 6-page PDF report with in-depth per-trait analysis,
                    {scores.composite > 60
                      ? ' management strategies for your dominant traits, and a roadmap for channelling these tendencies constructively.'
                      : ' protection strategies tailored to your vulnerabilities, and a guide to recognising dark triad behaviour in others.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {[
                  'Per-trait deep dive',
                  'Personalised strategies',
                  'Recommended reading',
                  'Instant PDF download',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="text-[#c0392b]">✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={handleStripeCheckout}
                disabled={tier3Loading}
                className="w-full py-3.5 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 text-white font-bold text-base rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {tier3Loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparing checkout…
                  </>
                ) : (
                  'Get Your Full Report — $6.99 USD →'
                )}
              </button>
              {tier3Error && <p className="text-xs text-red-400 mt-2 text-center">{tier3Error}</p>}
              <p className="text-center text-xs text-gray-700 mt-2">One-time payment · Instant download · 30-day guarantee</p>
              <p className="text-center text-xs text-gray-500 mt-1.5">
                Subscribers: use code{' '}
                <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded text-xs">
                  MINDARCHIVE
                </span>
                {' '}at checkout for 50% off →{' '}
                <strong className="text-amber-300">$3.49 USD</strong>
              </p>
            </div>
          </>
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

        {/* ── Character Match Teaser ──────────────────────────────────── */}
        <div className="rounded-xl border border-[#c0392b]/40 bg-gradient-to-b from-[#1a0505] to-[#0d0202] p-6 mb-6">
          <p className="text-xs text-[#c0392b] font-semibold uppercase tracking-widest mb-3">
            Your Dark Triad Character Match
          </p>
          <div className="mb-1">
            <span className="text-2xl font-black text-white">{characterMatch.name}</span>
            <span className="ml-2 text-sm text-gray-500">{characterMatch.franchise}</span>
          </div>
          <p className="text-gray-300 text-sm italic mb-4">
            &ldquo;{characterMatch.tagline}&rdquo;
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {characterMatch.shortDescription}
          </p>
          <div className="rounded-lg border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🔒</span>
              <p className="text-sm font-semibold text-white">Full Character Analysis — in the paid report</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Why you match this profile, your specific trait breakdown, real-world implications,
              and alternate character matches — all in your $6.99 report.
            </p>
          </div>
        </div>

        {/* ── Book CTA ──────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-[#4ade80]/30 bg-gradient-to-b from-[#0a1f0a] to-[#060f06] p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📘</div>
            <div className="flex-1">
              <p className="text-xs text-[#4ade80] font-semibold uppercase tracking-widest mb-1">From the creator of this quiz</p>
              <h2 className="text-lg font-black text-white mb-2">Want to understand the psychology behind your score?</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                <em>The Automated Doctor</em> explores AI-powered self-analysis and how to build personal systems that work for — not against — your psychology. No technical knowledge required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://a.co/d/0cs0zZDb"
                  target="_blank"
                  rel="noopener"
                  className="flex-1 py-3 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold text-sm text-center rounded-lg transition-colors"
                >
                  📘 Get the Book on Amazon →
                </a>
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-3 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {nativeShareDone ? '✓ Shared!' : '🔗 Share My Result'}
                </button>
              </div>
            </div>
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

// ── Radar Chart ───────────────────────────────────────────────────────────────

function RadarChart({
  narcissism,
  psychopathy,
  machiavellianism,
}: {
  narcissism: number;
  psychopathy: number;
  machiavellianism: number;
}) {
  const cx = 150;
  const cy = 160;
  const maxR = 100;
  const gridLevels = [25, 50, 75, 100];

  // Three axes: top (narcissism), bottom-right (psychopathy), bottom-left (machiavellianism)
  const axes = [
    { trait: 'Narcissism', score: narcissism, angle: -90, color: '#f0c040' },
    { trait: 'Psychopathy', score: psychopathy, angle: 30, color: '#c0392b' },
    { trait: 'Machiavellianism', score: machiavellianism, angle: 150, color: '#8e44ad' },
  ];

  const polarToXY = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Build polygon points
  const polyPoints = axes
    .map(({ score, angle }) => {
      const r = (score / 100) * maxR;
      const { x, y } = polarToXY(angle, r);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 300 310" width="280" height="290">
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={cx}
            cy={cy}
            r={(level / 100) * maxR}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map(({ angle, color, trait }) => {
          const end = polarToXY(angle, maxR);
          return (
            <line
              key={trait}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.3"
            />
          );
        })}

        {/* Score polygon */}
        <polygon
          points={polyPoints}
          fill="rgba(192,57,43,0.15)"
          stroke="rgba(192,57,43,0.6)"
          strokeWidth="1.5"
        />

        {/* Score dots */}
        {axes.map(({ score, angle, color, trait }) => {
          const r = (score / 100) * maxR;
          const { x, y } = polarToXY(angle, r);
          return (
            <circle
              key={trait}
              cx={x}
              cy={y}
              r={4}
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {axes.map(({ trait, score, angle, color }) => {
          const labelR = maxR + 22;
          const { x, y } = polarToXY(angle, labelR);
          const anchor =
            Math.abs(angle) === 90 ? 'middle' : angle > 0 && angle < 180 ? 'start' : 'end';
          return (
            <g key={trait}>
              <text
                x={x}
                y={y - 6}
                textAnchor={anchor}
                fill={color}
                fontSize="10"
                fontWeight="bold"
              >
                {trait}
              </text>
              <text
                x={x}
                y={y + 7}
                textAnchor={anchor}
                fill={color}
                fontSize="9"
                opacity={0.8}
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Grid level labels */}
        {gridLevels.map((level) => (
          <text
            key={level}
            x={cx + 3}
            y={cy - (level / 100) * maxR + 4}
            fill="rgba(255,255,255,0.2)"
            fontSize="7"
          >
            {level}
          </text>
        ))}
      </svg>
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
