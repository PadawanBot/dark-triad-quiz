'use client';

import type { Question } from '@/lib/questions';

const LIKERT_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
];

interface Props {
  questions: Question[];
  answers: Record<number, number>;
  onAnswer: (questionId: number, value: number) => void;
  onNext: () => void;
  onBack?: () => void;
  isLastPage: boolean;
  pageAnswered: boolean;
  progress: number; // 0–100
  pageLabel: string;
  phaseLabel: string;
  phaseTotalPages: number;
  currentPageIndex: number;
  error: string | null;
  isSubmitting: boolean;
}

export default function QuestionPage({
  questions,
  answers,
  onAnswer,
  onNext,
  onBack,
  isLastPage,
  pageAnswered,
  progress,
  pageLabel,
  phaseLabel,
  phaseTotalPages,
  currentPageIndex,
  error,
  isSubmitting,
}: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <div className="w-full h-1 bg-white/5">
        <div
          className="h-full bg-[#c0392b] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="text-xs text-gray-600 uppercase tracking-widest font-semibold">
          {phaseLabel}
        </div>
        <div className="text-xs text-gray-600">{pageLabel}</div>
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {Array.from({ length: phaseTotalPages }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i < currentPageIndex
                  ? 'bg-[#c0392b]'
                  : i === currentPageIndex
                  ? 'bg-white'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Questions ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {questions.map((q, qi) => (
            <QuestionCard
              key={q.id}
              question={q}
              qIndex={qi}
              value={answers[q.id]}
              onChange={(val) => onAnswer(q.id, val)}
            />
          ))}
        </div>
      </div>

      {/* ── Footer / Navigation ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          {error && (
            <p className="text-[#c0392b] text-sm mb-3 text-center">{error}</p>
          )}
          <div className="flex gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-lg transition-all text-sm font-medium"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!pageAnswered || isSubmitting}
              className="flex-1 py-3 bg-[#c0392b] hover:bg-[#a93226] disabled:bg-white/10 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm"
            >
              {isSubmitting
                ? 'Submitting…'
                : isLastPage
                ? 'See My Results →'
                : 'Continue →'}
            </button>
          </div>
          {!pageAnswered && (
            <p className="text-center text-xs text-gray-700 mt-2">
              Answer all questions on this page to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Individual Question Card ───────────────────────────────────────────────────

function QuestionCard({
  question,
  qIndex,
  value,
  onChange,
}: {
  question: Question;
  qIndex: number;
  value: number | undefined;
  onChange: (val: number) => void;
}) {
  return (
    <div className="group">
      <p className="text-base sm:text-lg font-medium text-white mb-4 leading-relaxed">
        <span className="text-gray-600 mr-2">{qIndex + 1}.</span>
        {question.text}
      </p>

      {/* Likert scale */}
      <div className="flex gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            title={LIKERT_LABELS[v - 1]}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border transition-all ${
              value === v
                ? 'border-[#c0392b] bg-[#c0392b]/15 text-white'
                : 'border-white/10 hover:border-white/25 text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-base sm:text-lg font-bold">{v}</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wide leading-tight text-center hidden sm:block">
              {LIKERT_LABELS[v - 1].split(' ').map((w, i) => (
                <span key={i} className="block">{w}</span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
