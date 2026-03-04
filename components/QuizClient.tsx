'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { questionById, QUICK_TEST_PAGES, FULL_ASSESSMENT_PAGES } from '@/lib/questions';
import type { TraitScores, TraitPercentiles } from '@/lib/scoring';
import ModeSelect from './quiz/ModeSelect';
import QuestionPage from './quiz/QuestionPage';
import ResultsPanel from './quiz/ResultsPanel';
import ComparisonPanel from './quiz/ComparisonPanel';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Stage =
  | 'mode_select'
  | 'quick_test'
  | 'submitting'
  | 'preliminary_results'
  | 'comparison'
  | 'full_assessment'
  | 'extending'
  | 'final_results';

interface ChallengerData {
  scores: TraitScores;
  percentiles: TraitPercentiles;
  subjectName?: string | null;
  shareToken: string;
}

interface ResultData {
  sessionId: string;
  shareToken: string;
  challengeToken: string;
  scores: TraitScores;
  percentiles: TraitPercentiles;
  isPreliminary: boolean;
  challengerData?: ChallengerData | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function QuizClient() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'challenge' ? 'challenge' : null;
  // challenger session ID passed from /c/[token] page
  const challengerSessionId = searchParams.get('challenger') ?? null;

  const [stage, setStage] = useState<Stage>(
    initialMode ? 'quick_test' : 'mode_select'
  );
  const [mode, setMode] = useState<string>(initialMode ?? 'self');
  const [subjectName, setSubjectName] = useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed within current phase
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Quick Test pages ───────────────────────────────────────────────────────
  const quickTestTotalPages = QUICK_TEST_PAGES.length; // 3

  const handleModeSelect = useCallback((selectedMode: string, name: string) => {
    setMode(selectedMode);
    setSubjectName(name);
    setStage('quick_test');
    setCurrentPage(0);
  }, []);

  const handleAnswer = useCallback((questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleQuickTestNext = useCallback(() => {
    setCurrentPage((p) => p + 1);
  }, []);

  const handleQuickTestBack = useCallback(() => {
    setCurrentPage((p) => Math.max(0, p - 1));
  }, []);

  const handleQuickTestSubmit = useCallback(async () => {
    setStage('submitting');
    setError(null);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          mode,
          subjectName: subjectName || undefined,
          challengerSessionId: challengerSessionId || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      // If this was a challenge response, show comparison view
      if (challengerSessionId && data.challengerData) {
        setStage('comparison');
      } else {
        setStage('preliminary_results');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setStage('quick_test');
    }
  }, [answers, mode, subjectName, challengerSessionId]);

  // ── Full Assessment ────────────────────────────────────────────────────────
  const fullAssessmentTotalPages = FULL_ASSESSMENT_PAGES.length; // 3

  const handleStartFullAssessment = useCallback(() => {
    setStage('full_assessment');
    setCurrentPage(0);
  }, []);

  const handleFullAssessmentNext = useCallback(() => {
    setCurrentPage((p) => p + 1);
  }, []);

  const handleFullAssessmentBack = useCallback(() => {
    setCurrentPage((p) => Math.max(0, p - 1));
  }, []);

  const handleFullAssessmentSubmit = useCallback(async () => {
    if (!result?.sessionId) return;
    setStage('extending');
    setError(null);
    try {
      const res = await fetch('/api/quiz/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: result.sessionId,
          additionalAnswers: answers,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult((prev) => prev ? { ...prev, ...data } : data);
      setStage('final_results');
    } catch {
      setError('Something went wrong. Please try again.');
      setStage('full_assessment');
    }
  }, [answers, result]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (stage === 'mode_select') {
    return <ModeSelect onSelect={handleModeSelect} />;
  }

  if (stage === 'quick_test') {
    const pageIds = QUICK_TEST_PAGES[currentPage];
    const pageQuestions = pageIds.map((id) => questionById.get(id)!);
    const isLastPage = currentPage === quickTestTotalPages - 1;
    const pageAnswered = pageIds.every((id) => answers[id] != null);
    const progress = ((currentPage) / quickTestTotalPages) * 100;

    return (
      <QuestionPage
        questions={pageQuestions}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={isLastPage ? handleQuickTestSubmit : handleQuickTestNext}
        onBack={currentPage > 0 ? handleQuickTestBack : undefined}
        isLastPage={isLastPage}
        pageAnswered={pageAnswered}
        progress={progress}
        pageLabel={`Question ${currentPage * 5 + 1}–${currentPage * 5 + 5} of 15`}
        phaseLabel={challengerSessionId ? 'Challenge Mode' : 'Quick Test'}
        phaseTotalPages={quickTestTotalPages}
        currentPageIndex={currentPage}
        error={error}
        isSubmitting={false}
      />
    );
  }

  if (stage === 'submitting') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Calculating your profile…</p>
        </div>
      </div>
    );
  }

  if (stage === 'comparison' && result && result.challengerData) {
    return (
      <ComparisonPanel
        you={{
          scores: result.scores,
          percentiles: result.percentiles,
          subjectName: subjectName || null,
          shareToken: result.shareToken,
          challengeToken: result.challengeToken,
        }}
        challenger={{
          scores: result.challengerData.scores,
          percentiles: result.challengerData.percentiles,
          subjectName: result.challengerData.subjectName,
          shareToken: result.challengerData.shareToken,
        }}
      />
    );
  }

  if (stage === 'preliminary_results' && result) {
    return (
      <ResultsPanel
        scores={result.scores}
        percentiles={result.percentiles}
        shareToken={result.shareToken}
        challengeToken={result.challengeToken}
        isPreliminary={true}
        onContinue={handleStartFullAssessment}
        subjectName={subjectName}
        sessionId={result.sessionId}
      />
    );
  }

  if (stage === 'full_assessment') {
    const pageIds = FULL_ASSESSMENT_PAGES[currentPage];
    const pageQuestions = pageIds.map((id) => questionById.get(id)!);
    const isLastPage = currentPage === fullAssessmentTotalPages - 1;
    const pageAnswered = pageIds.every((id) => answers[id] != null);
    const progress = 50 + ((currentPage) / fullAssessmentTotalPages) * 50;

    return (
      <QuestionPage
        questions={pageQuestions}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={isLastPage ? handleFullAssessmentSubmit : handleFullAssessmentNext}
        onBack={currentPage > 0 ? handleFullAssessmentBack : undefined}
        isLastPage={isLastPage}
        pageAnswered={pageAnswered}
        progress={progress}
        pageLabel={`Question ${currentPage * 5 + 1}–${currentPage * 5 + 5} of 15`}
        phaseLabel="Full Assessment"
        phaseTotalPages={fullAssessmentTotalPages}
        currentPageIndex={currentPage}
        error={error}
        isSubmitting={false}
      />
    );
  }

  if (stage === 'extending') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Refining your results…</p>
        </div>
      </div>
    );
  }

  if (stage === 'final_results' && result) {
    return (
      <ResultsPanel
        scores={result.scores}
        percentiles={result.percentiles}
        shareToken={result.shareToken}
        challengeToken={result.challengeToken}
        isPreliminary={false}
        subjectName={subjectName}
        sessionId={result.sessionId}
      />
    );
  }

  return null;
}
