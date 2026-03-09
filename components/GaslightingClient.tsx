'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Quiz data
// ─────────────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  { id: 1, text: 'Someone important to me denies saying things I clearly remember.' },
  { id: 2, text: 'My reactions are dismissed as "too sensitive" or "overreacting."' },
  { id: 3, text: 'I doubt my own memory of events in our relationship.' },
  { id: 4, text: 'I\'m told my feelings are wrong, irrational, or invalid.' },
  { id: 5, text: 'After conflicts, I feel confused about what actually happened.' },
  { id: 6, text: 'Important information is withheld from me and I only find out later.' },
  { id: 7, text: 'My accomplishments are minimised or attributed to luck.' },
  { id: 8, text: 'I\'m blamed for problems that aren\'t my fault.' },
  { id: 9, text: 'I find myself constantly apologising without knowing why.' },
  { id: 10, text: 'I feel like I\'m "walking on eggshells" around someone close to me.' },
];

const OPTIONS = [
  { label: 'Never', value: 0 },
  { label: 'Rarely', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Always', value: 4 },
];

const PAGES = [QUESTIONS.slice(0, 5), QUESTIONS.slice(5, 10)];

// ─────────────────────────────────────────────────────────────────────────────
// Score interpretation
// ─────────────────────────────────────────────────────────────────────────────

function interpret(score: number): {
  level: string;
  color: string;
  border: string;
  bg: string;
  summary: string;
  detail: string;
} {
  if (score <= 10) {
    return {
      level: 'Low Exposure',
      color: '#4ade80',
      border: 'rgba(74,222,128,0.25)',
      bg: 'rgba(74,222,128,0.07)',
      summary: 'Your responses suggest minimal gaslighting patterns in your key relationships.',
      detail:
        'The dynamics you describe appear mostly healthy. You trust your perceptions, feel heard, and rarely experience systematic invalidation. Stay aware — gaslighting often starts subtly.',
    };
  }
  if (score <= 22) {
    return {
      level: 'Moderate Exposure',
      color: '#f0c040',
      border: 'rgba(240,192,64,0.25)',
      bg: 'rgba(240,192,64,0.07)',
      summary: 'Your responses indicate some patterns consistent with gaslighting.',
      detail:
        'You\'re experiencing enough reality-distortion to warrant attention. Some relationships in your life may involve deliberate or unconscious manipulation of your perceptions. Learning to identify and name these patterns is the first protective step.',
    };
  }
  return {
    level: 'High Exposure',
    color: '#c0392b',
    border: 'rgba(192,57,43,0.25)',
    bg: 'rgba(192,57,43,0.08)',
    summary: 'Your responses indicate significant gaslighting patterns in your relationships.',
    detail:
      'The patterns you\'re describing are serious. Chronic reality-distortion erodes self-trust, creates anxiety, and can cause long-term psychological harm. You deserve relationships where your perceptions are respected. The guide below maps the patterns and provides concrete strategies.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Email gate result type
// ─────────────────────────────────────────────────────────────────────────────

interface GuideResult {
  guideUrl: string;
  kitSuccess: boolean;
  kitError: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Stage = 'intro' | 'quiz' | 'results' | 'email_submitted';

export default function GaslightingClient() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  // Email gate state
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);

  const pageQuestions = PAGES[currentPage];
  const pageAnswered = pageQuestions.every((q) => answers[q.id] != null);
  const isLastPage = currentPage === PAGES.length - 1;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (isLastPage) {
      const total = QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
      setScore(total);
      setStage('results');
    } else {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleBack = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const handleEmailSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const res = await fetch('/api/gaslighting/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to submit');
      }
      const data: GuideResult = await res.json();
      setGuideResult(data);
      setStage('email_submitted');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  // ── Intro ──────────────────────────────────────────────────────────────────

  if (stage === 'intro') {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(41,128,185,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-[#2980b9]/40 bg-[#2980b9]/10 text-[#2980b9] text-xs font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2980b9] animate-pulse" />
              Gaslighting Assessment
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-4">
              Are you being{' '}
              <span className="text-[#2980b9]">gaslit</span>?
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              Gaslighting distorts your sense of reality — quietly, deliberately.
              <br />
              <span className="text-gray-300">
                This 10-question assessment maps the patterns used to make you doubt yourself.
                Takes 3 minutes.
              </span>
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center text-xs text-gray-500">
              {['10 questions', '~3 minutes', 'Free guide included'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span className="text-[#2980b9]">✓</span>
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStage('quiz')}
              className="mt-10 px-10 py-4 bg-[#2980b9] hover:bg-[#2471a3] text-white font-bold text-lg rounded-xl transition-colors"
            >
              Start Assessment →
            </button>

            <p className="mt-6 text-sm text-gray-500">
              <Link href="/" className="underline underline-offset-4 hover:text-gray-300 transition-colors">
                ← Back to all assessments
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────

  if (stage === 'quiz') {
    const progress = ((currentPage) / PAGES.length) * 100;
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>
                Questions {currentPage * 5 + 1}–{currentPage * 5 + 5} of {QUESTIONS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2980b9] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6 mb-10">
            {pageQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-white/10 bg-white/3 p-5"
              >
                <p className="text-sm sm:text-base font-medium text-white mb-4 leading-relaxed">
                  {q.text}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(q.id, opt.value)}
                      className={`flex-1 min-w-[60px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        answers[q.id] === opt.value
                          ? 'bg-[#2980b9] border-[#2980b9] text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentPage > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!pageAnswered}
              className="flex-1 py-3 bg-[#2980b9] hover:bg-[#2471a3] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {isLastPage ? 'See My Results →' : 'Next →'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────

  const interp = interpret(score);
  const maxScore = QUESTIONS.length * 4; // 40

  if (stage === 'results') {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: interp.border, color: interp.color, backgroundColor: interp.bg }}
            >
              Gaslighting Assessment
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Your Results</h1>
            <p className="text-gray-500 text-sm">Based on {QUESTIONS.length} questions</p>
          </div>

          {/* Score card */}
          <div
            className="rounded-xl border p-6 mb-6 text-center"
            style={{ borderColor: interp.border, backgroundColor: interp.bg }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              Gaslighting Exposure Score
            </p>
            <div className="text-6xl font-black mb-1" style={{ color: interp.color }}>
              {score}
              <span className="text-2xl text-gray-600">/{maxScore}</span>
            </div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mt-2 mb-3 rounded-full text-xs font-semibold"
              style={{ color: interp.color, backgroundColor: `${interp.color}15` }}
            >
              {interp.level}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">{interp.summary}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{interp.detail}</p>

            {/* Score bar */}
            <div className="mt-5 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(score / maxScore) * 100}%`,
                  backgroundColor: interp.color,
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-600">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>

          {/* Email gate */}
          <div className="rounded-xl border border-white/15 bg-gradient-to-b from-white/5 to-white/2 p-6 mb-6">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded-full bg-[#2980b9]/10 border border-[#2980b9]/25 text-xs text-[#2980b9] font-medium uppercase tracking-widest">
                Free Guide
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                Get your Gaslighting Survival Guide
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                A practical PDF guide: how to identify gaslighting patterns, protect your sense of
                reality, and decide what to do next. Enter your email to receive it.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={emailSubmitting}
                className="px-5 py-2.5 bg-[#2980b9] hover:bg-[#2471a3] disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                {emailSubmitting ? '…' : 'Send Guide →'}
              </button>
            </div>
            {emailError && <p className="text-xs text-red-400 mt-2">{emailError}</p>}
            <p className="text-xs text-gray-700 mt-2">No spam. Unsubscribe any time.</p>
          </div>

          {/* Footer nav */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
            >
              ← Home
            </Link>
            <button
              onClick={() => {
                setStage('intro');
                setCurrentPage(0);
                setAnswers({});
                setScore(0);
                setEmail('');
                setEmailError(null);
              }}
              className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
            >
              Retake →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Email submitted — always show download button ──────────────────────────

  if (stage === 'email_submitted' && guideResult) {
    const deliveryDelayed =
      !guideResult.kitSuccess ||
      (typeof guideResult.kitError === 'string' &&
        guideResult.kitError.length > 0);

    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: interp.border, color: interp.color, backgroundColor: interp.bg }}
            >
              Gaslighting Assessment
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Your Results</h1>
          </div>

          {/* Score card (compact repeat) */}
          <div
            className="rounded-xl border p-5 mb-6"
            style={{ borderColor: interp.border, backgroundColor: interp.bg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Gaslighting Exposure
                </p>
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ color: interp.color, backgroundColor: `${interp.color}15` }}
                >
                  {interp.level}
                </div>
              </div>
              <div className="text-4xl font-black" style={{ color: interp.color }}>
                {score}
                <span className="text-lg text-gray-600">/{maxScore}</span>
              </div>
            </div>
          </div>

          {/* ── Guide download (ALWAYS shown after email submitted) ── */}
          <div className="rounded-xl border border-[#2980b9]/40 bg-[#2980b9]/10 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">📄</span>
              <div>
                <h2 className="text-lg font-black text-white mb-1">
                  Your Gaslighting Survival Guide is ready
                </h2>
                {deliveryDelayed ? (
                  <p className="text-sm text-amber-300">
                    Email delivery may be delayed; download now.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    We&apos;ve also sent a copy to <span className="text-gray-200">{email}</span>.
                  </p>
                )}
              </div>
            </div>
            <a
              href={guideResult.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#2980b9] hover:bg-[#2471a3] text-white font-bold text-base rounded-lg transition-colors"
            >
              ⬇ Download your guide (PDF)
            </a>
          </div>

          {/* Insight summary */}
          <div
            className="rounded-xl border p-5 mb-6"
            style={{ borderColor: interp.border, backgroundColor: interp.bg }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">What your score means</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">{interp.summary}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{interp.detail}</p>
          </div>

          {/* Footer nav */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
            >
              ← Home
            </Link>
            <button
              onClick={() => {
                setStage('intro');
                setCurrentPage(0);
                setAnswers({});
                setScore(0);
                setEmail('');
                setEmailError(null);
                setGuideResult(null);
              }}
              className="flex-1 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-center text-sm font-medium rounded-lg transition-all"
            >
              Retake →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
