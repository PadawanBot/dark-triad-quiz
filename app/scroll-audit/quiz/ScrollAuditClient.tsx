'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS, SECTIONS, scoreAnswers } from '@/lib/scroll-audit-questions';

export default function ScrollAuditClient() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const question = QUESTIONS[current];
  const total = QUESTIONS.length;
  const progress = Math.round(((current + 1) / total) * 100);
  const section = SECTIONS.find((s) => s.id === question.section);

  const handleAnswer = useCallback(async (letter: string) => {
    // Guard: ignore taps during transition or submission
    if (submitting || transitioning) return;

    const newAnswers = { ...answers, [question.id]: letter };
    setAnswers(newAnswers);

    if (current < total - 1) {
      // Brief lock to prevent tap-through to next question's answers
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setTransitioning(false);
      }, 120);
      return;
    }

    // All answered — score and navigate
    setSubmitting(true);
    const profile = scoreAnswers(newAnswers);

    try {
      await fetch('/api/scroll-audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers, profile }),
      });
    } catch {
      // Non-critical — still navigate to result
    }

    router.push(`/scroll-audit/result?profile=${profile}`);
  }, [answers, current, question.id, submitting, total, transitioning, router]);

  function handleBack() {
    if (current > 0 && !transitioning && !submitting) setCurrent(current - 1);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>{section?.title}</span>
            <span>{current + 1} / {total}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c0392b] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-white mb-8 leading-snug">
          {question.text}
        </h2>

        {/* Answers */}
        <div className="space-y-3 mb-8">
          {question.answers.map((a) => (
            <button
              key={a.letter}
              onClick={() => handleAnswer(a.letter)}
              disabled={submitting || transitioning}
              className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 active:border-[#c0392b]/60 active:bg-[#c0392b]/8 transition-all text-sm text-gray-300 leading-relaxed disabled:opacity-50 select-none"
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Back */}
        {current > 0 && !submitting && (
          <button
            onClick={handleBack}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Previous question
          </button>
        )}

        {submitting && (
          <p className="text-center text-gray-500 text-sm mt-4">Calculating your profile…</p>
        )}

      </div>
    </main>
  );
}
