import { Suspense } from 'react';
import QuizClient from '@/components/QuizClient';

export const metadata = {
  title: 'Dark Triad Profiler — Take the Test',
};

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-gray-500">Loading…</div></div>}>
      <QuizClient />
    </Suspense>
  );
}
