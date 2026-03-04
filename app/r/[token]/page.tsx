import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import pool from '@/lib/db';
import type { TraitScores, TraitPercentiles } from '@/lib/scoring';
import { dominantTrait } from '@/lib/scoring';
import ShareResultClient from '@/components/ShareResultClient';

interface PageProps {
  params: { token: string };
}

async function getSession(token: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, mode, subject_name, scores, percentiles, share_token, is_preliminary
       FROM quiz.sessions WHERE share_token = $1`,
      [token]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await getSession(params.token);
  if (!session) return { title: 'Result Not Found' };

  const scores = session.scores as TraitScores;
  const percentiles = session.percentiles as TraitPercentiles;
  const name = session.subject_name ? `${session.subject_name}'s` : 'My';
  const dominant = dominantTrait(scores);
  const dominantLabel = dominant.charAt(0).toUpperCase() + dominant.slice(1);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://quiz.theautomateddoctor.com';

  const title = `${name} Dark Triad Profile — Composite ${scores.composite}/100`;
  const description = `${name} highest trait is ${dominantLabel} (${percentiles[dominant]}th percentile). How do you compare? Take the test.`;

  const ogImageUrl = `${baseUrl}/api/og?score=${scores.composite}&dominant=${dominant}&name=${encodeURIComponent(session.subject_name ?? '')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/r/${params.token}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${name} Dark Triad Score: ${scores.composite}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ShareResultPage({ params }: PageProps) {
  const session = await getSession(params.token);
  if (!session) notFound();

  const scores = session.scores as TraitScores;
  const percentiles = session.percentiles as TraitPercentiles;

  return (
    <ShareResultClient
      scores={scores}
      percentiles={percentiles}
      shareToken={session.share_token}
      isPreliminary={session.is_preliminary}
      subjectName={session.subject_name}
    />
  );
}
