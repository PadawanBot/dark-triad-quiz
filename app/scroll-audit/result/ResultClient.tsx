'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScrollProfile } from '@/lib/scroll-audit-questions';
import { PROFILES } from '@/lib/scroll-audit-questions';

const SHARE_TWEETS: Record<ScrollProfile, string> = {
  autopilot: `I just took the Scroll Audit and I'm The Autopilot.\n\nMy scrolling isn't driven by emotion — it's pure habit running below conscious control.\n\nFind out what drives yours: https://quiz.theautomateddoctor.com/scroll-audit`,
  connection_seeker: `I just took the Scroll Audit and I'm The Connection Seeker.\n\nI scroll because my nervous system is looking for something it can't find in a feed.\n\nFind out what drives yours: https://quiz.theautomateddoctor.com/scroll-audit`,
  stimulation_hunter: `I just took the Scroll Audit and I'm The Stimulation Hunter.\n\nMy brain is wired for novelty — the feed simulates scarcity to keep me hunting.\n\nFind out what drives yours: https://quiz.theautomateddoctor.com/scroll-audit`,
  performer: `I just took the Scroll Audit and I'm The Performer.\n\nMy scrolling is built around feedback loops — variable-ratio reinforcement, same as a slot machine.\n\nFind out what drives yours: https://quiz.theautomateddoctor.com/scroll-audit`,
};

interface Props {
  profile: ScrollProfile;
}

export default function ResultClient({ profile }: Props) {
  const router = useRouter();
  const def = PROFILES[profile];

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const shareTweet = SHARE_TWEETS[profile];
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTweet)}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareTweet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/scroll-audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, email }),
      });
      const data = await res.json();
      if (data.reportToken) {
        router.push(`/scroll-audit/report/${data.reportToken}`);
      } else {
        setError('Something went wrong. Please try again.');
        setSubmitting(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">

        {/* Badge */}
        <p className="text-xs text-[#c0392b] font-semibold uppercase tracking-widest text-center mb-6">
          Your Scroll Audit Profile
        </p>

        {/* Profile reveal */}
        <div className="rounded-xl border border-[#c0392b]/40 bg-gradient-to-b from-[#1a0505] to-[#0d0202] p-8 mb-6 text-center">
          <h1 className="text-3xl font-black text-white mb-2">{def.name}</h1>
          <p className="text-gray-400 italic text-sm mb-6">&ldquo;{def.tagline}&rdquo;</p>
          <p className="text-gray-300 text-sm leading-relaxed">{def.teaser}</p>
        </div>

        {/* Share mechanic */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Share your result</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-4 font-mono bg-black/40 p-3 rounded-lg whitespace-pre-line">{shareTweet}</p>
          <div className="flex gap-3">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener"
              className="flex-1 py-2.5 bg-black border border-white/20 hover:border-white/40 text-white text-sm font-semibold text-center rounded-lg transition-colors"
            >
              𝕏 Post on X
            </a>
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy text'}
            </button>
          </div>
        </div>

        {/* Email wall */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔬</span>
            <h2 className="text-base font-bold text-white">Get your full psychological report</h2>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            The mechanism behind your pattern, the neuroscience, your specific behavioural signature,
            and the intervention most likely to work for your profile — all in your free report.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c0392b]/50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Sending your report…' : 'Send Me My Report →'}
            </button>
          </form>

          <p className="text-xs text-gray-600 text-center mt-3">
            Free. No spam. Unsubscribe anytime.
          </p>
        </div>

      </div>
    </main>
  );
}
