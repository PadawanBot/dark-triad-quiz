import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { ScrollProfile } from '@/lib/scroll-audit-questions';
import { PROFILES } from '@/lib/scroll-audit-questions';
import ResultClient from './ResultClient';

interface PageProps {
  searchParams: { profile?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const profile = searchParams.profile as ScrollProfile;
  const def = PROFILES[profile];
  return {
    title: def ? `${def.name} — Scroll Audit` : 'Your Scroll Audit Result',
  };
}

export default function ResultPage({ searchParams }: PageProps) {
  const profile = searchParams.profile as ScrollProfile;
  if (!profile || !PROFILES[profile]) redirect('/scroll-audit');
  return <ResultClient profile={profile} />;
}
