import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scroll Audit — What\'s actually driving your phone use?',
  description: 'A 10-question diagnostic that identifies the psychological driver behind your scrolling pattern. Takes 2 minutes.',
};

export default function ScrollAuditLanding() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">

        {/* Badge */}
        <p className="text-xs text-[#c0392b] font-semibold uppercase tracking-widest text-center mb-6">
          The Automated Doctor · Free Diagnostic
        </p>

        {/* Headline */}
        <h1 className="text-4xl font-black text-center leading-tight mb-4">
          What&apos;s actually driving<br />your phone use?
        </h1>
        <p className="text-gray-400 text-center text-base leading-relaxed mb-10">
          Most people assume they scroll because they&apos;re bored.<br />
          The research says otherwise. 10 questions. 2 minutes.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: '10', label: 'Questions' },
            { value: '4', label: 'Profiles' },
            { value: '2 min', label: 'To complete' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Profiles preview */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">The 4 profiles</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'The Autopilot', desc: 'Pure habit, no trigger' },
              { name: 'The Connection Seeker', desc: 'Social monitoring' },
              { name: 'The Stimulation Hunter', desc: 'Novelty-seeking' },
              { name: 'The Performer', desc: 'Feedback loops' },
            ].map((p) => (
              <div key={p.name} className="rounded-lg bg-black/40 p-3">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/scroll-audit/quiz"
          className="block w-full py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-center text-lg rounded-xl transition-colors"
        >
          Start the Audit →
        </Link>

        <p className="text-xs text-gray-600 text-center mt-4">
          Free. No account required. Your profile revealed instantly.
        </p>

        {/* Footer link */}
        <div className="text-center mt-12">
          <Link href="/" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
            ← Back to The Automated Doctor
          </Link>
        </div>

      </div>
    </main>
  );
}
