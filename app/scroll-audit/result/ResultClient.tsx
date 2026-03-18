'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScrollProfile } from '@/lib/scroll-audit-questions';
import { PROFILES } from '@/lib/scroll-audit-questions';

interface Props {
  profile: ScrollProfile;
}

export default function ResultClient({ profile }: Props) {
  const router = useRouter();
  const def = PROFILES[profile];

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
