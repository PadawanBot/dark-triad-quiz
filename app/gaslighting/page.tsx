import { Suspense } from 'react';
import GaslightingClient from '@/components/GaslightingClient';

export const metadata = {
  title: 'Gaslighting Assessment · MindArchive',
  description:
    'Discover the patterns of gaslighting with our validated psychological assessment. Takes 3 minutes.',
};

export default function GaslightingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-gray-500">Loading…</div>
        </div>
      }
    >
      <GaslightingClient />
    </Suspense>
  );
}
