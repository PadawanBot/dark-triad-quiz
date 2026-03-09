import type { Metadata } from 'next';
import { Suspense } from 'react';
import GasQuizClient from '@/components/gaslighting/GasQuizClient';

export const metadata: Metadata = {
  title: "You're Not Crazy — Gaslighting Awareness Quiz | The Automated Doctor",
  description:
    "Gaslighting is a pattern that erodes your trust in your own perception. Take this quiz to identify common indicators and get your free Reality Grounding Guide.",
  openGraph: {
    title: "You're Not Crazy — You Might Be Getting Gaslit",
    description:
      "14 questions. Immediate results. Free Reality Grounding Guide sent to your inbox.",
    url: "https://quiz.theautomateddoctor.com/gaslighting",
    type: "website",
  },
};

export default function GaslightingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <GasQuizClient />
    </Suspense>
  );
}
