import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Subtle radial gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(192,57,43,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-[#c0392b]/40 bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
            Validated Psychological Assessment
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-4">
            How much of the{' '}
            <span className="text-[#c0392b]">Dark Triad</span>
            <br />
            do you carry?
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            The same traits that built empires — and destroyed lives.
            <br />
            <span className="text-gray-300">
              Based on validated psychological scales used by researchers worldwide.
              Takes 3 minutes.
            </span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-lg rounded-lg transition-colors duration-200 shadow-lg shadow-[#c0392b]/20"
            >
              Test Yourself
            </Link>
            <Link
              href="/quiz?mode=challenge"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-lg rounded-lg transition-all duration-200"
            >
              Challenge a Friend
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-600">
            Anonymous · No sign-up required · Results shared only if you choose
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-700">
          <span className="text-xs uppercase tracking-widest">Learn More</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-transparent" />
        </div>
      </section>

      {/* ── TRAIT EXPLAINERS ──────────────────────────────────────────────── */}
      <section className="py-24 px-6" id="learn">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            The Dark Triad
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-lg mx-auto">
            Three distinct but correlated personality traits. All present to some
            degree in most people.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Narcissism */}
            <div className="rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 p-6 hover:border-[#f0c040]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#f0c040]/20 flex items-center justify-center mb-4">
                <span className="text-[#f0c040] text-xl">♛</span>
              </div>
              <h3 className="text-[#f0c040] font-bold text-lg mb-2">Narcissism</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Grandiosity, entitlement, and a hunger for admiration. Narcissists
                see themselves as exceptional — and expect others to as well. Based
                on the NPI-16 scale.
              </p>
            </div>

            {/* Psychopathy */}
            <div className="rounded-xl border border-[#c0392b]/20 bg-[#c0392b]/5 p-6 hover:border-[#c0392b]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#c0392b]/20 flex items-center justify-center mb-4">
                <span className="text-[#c0392b] text-xl">⚡</span>
              </div>
              <h3 className="text-[#c0392b] font-bold text-lg mb-2">Psychopathy</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Reduced empathy, impulsivity, and antisocial behaviour. Psychopathic
                traits enable ruthless decision-making without emotional interference.
                Measured by Levenson SRPS.
              </p>
            </div>

            {/* Machiavellianism */}
            <div className="rounded-xl border border-[#8e44ad]/20 bg-[#8e44ad]/5 p-6 hover:border-[#8e44ad]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#8e44ad]/20 flex items-center justify-center mb-4">
                <span className="text-[#8e44ad] text-xl">⚔</span>
              </div>
              <h3 className="text-[#8e44ad] font-bold text-lg mb-2">Machiavellianism</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Strategic deception, emotional detachment, and long-game thinking.
                Machiavellians trust no one fully and plan multiple moves ahead.
                Based on MACH-IV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTION ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Watch: The Dark Triad Explained
          </h2>
          <p className="text-gray-500 mb-8">
            A deep dive into the psychology behind these traits.
          </p>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
            <iframe
              src="https://www.youtube.com/embed/giXkTVUFQ40"
              title="The Dark Triad Explained"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ── CREDIBILITY BAR ───────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">
            Based on validated research instruments
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>NPI-16 (Narcissistic Personality Inventory)</span>
            <span>·</span>
            <span>Levenson SRPS (Self-Report Psychopathy Scale)</span>
            <span>·</span>
            <span>MACH-IV (Machiavellianism Scale)</span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to find out?
          </h2>
          <p className="text-gray-500 mb-8">
            3 minutes. 30 questions. Results that researchers actually use.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-10 py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-lg rounded-lg transition-colors shadow-lg shadow-[#c0392b]/20"
          >
            Take the Test Now
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-xs text-gray-700">
          Dark Triad Profiler · MindArchive · For educational purposes only
        </p>
      </footer>
    </main>
  );
}
