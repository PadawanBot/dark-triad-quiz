'use client';

import { useState } from 'react';
import { GAS_QUESTIONS, GAS_SAFETY_QUESTION } from '@/lib/gasQuestions';
import type { GasResponse } from '@/lib/gasQuestions';
import { bandColor, bandLabel, resultsCopy, SAFETY_RESOURCES } from '@/lib/gasScoring';
import type { GasBand } from '@/lib/gasScoring';

// ─── Disclaimer ───────────────────────────────────────────────────────────────
const DISCLAIMER =
  'This quiz is for educational and self-reflection purposes only. It is not a clinical assessment, ' +
  'diagnosis, or confirmation of any person\'s intent or behaviour. Results reflect indicators you ' +
  'endorsed — not certainty about your situation.';

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = 'landing' | 'quiz' | 'submitting' | 'results' | 'email_sent';

interface ResultData {
  sessionId: string;
  tacticsScore: number;
  impactScore: number;
  totalScore: number;
  band: GasBand;
  safetyYes: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RESPONSE_LABELS: Record<GasResponse, string> = {
  0: 'Never',
  1: 'Sometimes',
  2: 'Often',
};

// Build pages: tactics (4+4 questions), then impact (3+3), then safety
const PAGES: Array<{ questions: typeof GAS_QUESTIONS; isSafetyPage?: boolean }> = [
  { questions: GAS_QUESTIONS.slice(0, 4) },
  { questions: GAS_QUESTIONS.slice(4, 8) },
  { questions: GAS_QUESTIONS.slice(8, 11) },
  { questions: GAS_QUESTIONS.slice(11, 14) },
];
const SAFETY_PAGE_INDEX = PAGES.length; // page 4 (0-indexed)
const TOTAL_PAGES = PAGES.length + 1; // +1 for safety page

// ─── Component ────────────────────────────────────────────────────────────────
export default function GasQuizClient() {
  const [stage, setStage] = useState<Stage>('landing');
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, GasResponse>>({});
  const [safetyYes, setSafetyYes] = useState<boolean | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [guideUrl, setGuideUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Progress ─────────────────────────────────────────────────────────────
  

  // ── Page-level completion check ───────────────────────────────────────────
  const currentPageAnswered =
    currentPage < PAGES.length
      ? PAGES[currentPage].questions.every((q) => answers[q.id] != null)
      : safetyYes !== null; // safety page

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAnswer = (qId: number, val: GasResponse) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleNext = () => {
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleSubmit = async () => {
    if (safetyYes === null) return;
    setStage('submitting');
    setApiError(null);
    try {
      const res = await fetch('/api/gaslighting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, safetyYes }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as ResultData;
      setResult(data);
      setStage('results');
    } catch {
      setApiError('Something went wrong. Please try again.');
      setStage('quiz');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !email.trim()) return;
    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const res = await fetch('/api/gaslighting/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: result.sessionId, email }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { guideUrl: string };
      setGuideUrl(data.guideUrl);
      setStage('email_sent');
    } catch {
      setEmailError('Something went wrong — please try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Landing
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-teal-600/40 bg-teal-600/10 text-teal-400 text-xs font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Self-Reflection Quiz
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-6">
              You&apos;re Not Crazy —<br />
              <span className="text-teal-400">You Might Be Getting Gaslit</span>
            </h1>

            <p className="text-gray-400 text-lg mb-4 max-w-xl mx-auto leading-relaxed">
              Gaslighting is a pattern that erodes your trust in your own perception over time.
              This quiz helps you identify common indicators — so you can start making sense of
              what you&apos;ve been experiencing.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              14 questions · Takes about 3 minutes · No sign-up to take the quiz
            </p>

            {/* Disclaimer — Place 1: landing above Start */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-10 text-left">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-300">Important: </span>
                {DISCLAIMER}
              </p>
            </div>

            <button
              onClick={() => setStage('quiz')}
              className="inline-flex items-center justify-center px-10 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg rounded-lg transition-colors shadow-lg shadow-teal-900/40"
            >
              Start the Quiz
            </button>

            <p className="mt-5 text-xs text-gray-700">
              Anonymous · Results shown immediately · Guide sent to email
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Submitting
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === 'submitting') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Calculating your results…</p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Quiz
  // ────────────────────────────────────────────────────────────────────────────
  if (stage === 'quiz') {
    const isSafetyPage = currentPage === SAFETY_PAGE_INDEX;
    const isLastPage = currentPage === TOTAL_PAGES - 1;
    const pageData = !isSafetyPage ? PAGES[currentPage] : null;

    const sectionLabel =
      currentPage <= 1
        ? 'Section 1 of 2 — Behaviours & Tactics'
        : currentPage <= 3
        ? 'Section 2 of 2 — Impact on You'
        : 'Final Check-In';

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                {sectionLabel}
              </span>
              <span className="text-xs text-gray-600">
                {currentPage + 1} / {TOTAL_PAGES}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentPage) / (TOTAL_PAGES - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Error */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {apiError}
            </div>
          )}

          {/* Safety page */}
          {isSafetyPage ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-semibold">
                  Safety Check-In
                </p>
                <p className="text-lg text-white leading-relaxed mb-6">
                  {GAS_SAFETY_QUESTION.text}
                </p>
                <div className="flex gap-4">
                  {(['Yes', 'No'] as const).map((opt) => {
                    const val = opt === 'Yes';
                    const selected = safetyYes === val;
                    return (
                      <button
                        key={opt}
                        onClick={() => setSafetyYes(val)}
                        className={`flex-1 py-3 rounded-lg border font-semibold text-base transition-all ${
                          selected
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  This question is not scored — it helps us include safety resources if relevant.
                </p>
              </div>
            </div>
          ) : (
            /* Scored questions */
            <div className="space-y-5">
              {pageData!.questions.map((q) => {
                const currentVal = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-sm text-gray-400 mb-3 leading-relaxed">{q.text}</p>
                    <div className="flex gap-2">
                      {([0, 1, 2] as GasResponse[]).map((val) => (
                        <button
                          key={val}
                          onClick={() => handleAnswer(q.id, val)}
                          className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            currentVal === val
                              ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                              : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40 hover:text-white'
                          }`}
                        >
                          {RESPONSE_LABELS[val]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {currentPage > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-lg border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition font-medium"
              >
                Back
              </button>
            )}
            {isLastPage ? (
              <button
                onClick={handleSubmit}
                disabled={!currentPageAnswered}
                className="flex-1 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition"
              >
                See My Results
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!currentPageAnswered}
                className="flex-1 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Results
  // ────────────────────────────────────────────────────────────────────────────
  if ((stage === 'results' || stage === 'email_sent') && result) {
    const copy = resultsCopy(result.band);
    const color = bandColor(result.band);
    const label = bandLabel(result.band);

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Disclaimer — Place 2: results top */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-300">Note: </span>
              {copy.microcopy}
            </p>
          </div>

          {/* Band result */}
          <div
            className="rounded-2xl border p-8 mb-8 text-center"
            style={{ borderColor: `${color}33`, backgroundColor: `${color}11` }}
          >
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color }}>
              Your Result
            </p>
            <h2 className="text-3xl font-black mb-3" style={{ color }}>
              {copy.headline}
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Total score: {result.totalScore} / 34 · {label}
            </p>
            <p className="text-gray-300 leading-relaxed text-base max-w-lg mx-auto">
              {copy.body}
            </p>
          </div>

          {/* Score breakdown */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Score Breakdown</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-400">{result.tacticsScore}</p>
                <p className="text-xs text-gray-500 mt-1">Tactics<br />(0–16)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-400">{result.impactScore}</p>
                <p className="text-xs text-gray-500 mt-1">Impact<br />(0–18)</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color }}>{result.totalScore}</p>
                <p className="text-xs text-gray-500 mt-1">Total<br />(0–34)</p>
              </div>
            </div>
          </div>

          {/* Safety block */}
          {result.safetyYes && (
            <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-6 mb-8">
              <p className="text-red-400 font-bold mb-3">⚠ Safety Resources</p>
              <pre className="text-sm text-red-200/80 whitespace-pre-wrap leading-relaxed font-sans">
                {SAFETY_RESOURCES}
              </pre>
            </div>
          )}

          {/* Email wall / guide delivery */}
          {stage === 'results' && (
            <div className="rounded-2xl border border-teal-700/40 bg-teal-900/10 p-8">
              <h3 className="text-xl font-bold mb-2">
                Get Your Reality Grounding Guide
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                A free PDF guide + 7-day micro-plan to help you reconnect with your own perception
                and rebuild trust in your judgment. Enter your email and we&apos;ll send it straight to you.
                No spam — ever.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition"
                />
                {emailError && (
                  <p className="text-red-400 text-sm">{emailError}</p>
                )}
                <button
                  type="submit"
                  disabled={emailSubmitting || !email.trim()}
                  className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition"
                >
                  {emailSubmitting ? 'Sending…' : 'Email me the guide'}
                </button>
                <p className="text-xs text-gray-600 text-center">
                  We use ConvertKit to send the guide. No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          )}

          {/* Post-email: guide sent */}
          {stage === 'email_sent' && guideUrl && (
            <div className="rounded-2xl border border-teal-700/40 bg-teal-900/10 p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2 text-teal-300">Guide on its way!</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Check your inbox — your Reality Grounding Guide and 7-day micro-plan are on their way.
                If you want to download now, use the button below.
              </p>
              <a
                href={guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition"
              >
                Download PDF Now →
              </a>
            </div>
          )}

          {/* Footer note */}
          <p className="text-xs text-gray-700 text-center mt-10 leading-relaxed">
            quiz.theautomateddoctor.com/gaslighting · For educational purposes only
          </p>
        </div>
      </div>
    );
  }

  return null;
}
