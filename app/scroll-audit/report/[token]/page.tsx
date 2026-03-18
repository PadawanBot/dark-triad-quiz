import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import pool from '@/lib/db';
import type { ScrollProfile } from '@/lib/scroll-audit-questions';
import { PROFILES } from '@/lib/scroll-audit-questions';

interface PageProps {
  params: { token: string };
}

async function getSession(token: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, profile, email, created_at FROM quiz.scroll_audit_sessions WHERE report_token = $1`,
      [token]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await getSession(params.token);
  if (!session) return { title: 'Report Not Found' };
  const def = PROFILES[session.profile as ScrollProfile];
  return { title: def ? `${def.name} — Full Scroll Audit Report` : 'Scroll Audit Report' };
}

export default async function ReportPage({ params }: PageProps) {
  const session = await getSession(params.token);
  if (!session) notFound();

  const def = PROFILES[session.profile as ScrollProfile];
  if (!def) notFound();

  const report = def.fullReport;

  function renderMarkdown(text: string) {
    // Simple bold markdown rendering
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') ? <strong key={i} className="text-white">{part.slice(2, -2)}</strong> : part
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <p className="text-xs text-[#c0392b] font-semibold uppercase tracking-widest mb-4">
          Scroll Audit · Full Report
        </p>
        <h1 className="text-4xl font-black mb-2">{def.name}</h1>
        <p className="text-gray-400 italic mb-10">&ldquo;{def.tagline}&rdquo;</p>

        {/* Report sections */}
        {[
          { title: 'The Mechanism', content: report.mechanism },
          { title: 'The Science', content: report.science },
          { title: 'Your Pattern', content: report.pattern },
          { title: 'What Actually Works', content: report.intervention },
        ].map((section) => (
          <div key={section.title} className="mb-10">
            <h2 className="text-sm font-bold text-[#c0392b] uppercase tracking-widest mb-3">
              {section.title}
            </h2>
            <p className="text-gray-300 leading-relaxed text-[15px]">
              {renderMarkdown(section.content)}
            </p>
          </div>
        ))}

        {/* Dark Triad CTA */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 mt-12">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Also from The Automated Doctor</p>
          <h3 className="text-lg font-bold text-white mb-2">Curious how your broader psychology shapes your behaviour?</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            The Dark Triad Profiler measures Narcissism, Machiavellianism, and Psychopathy — and matches your profile to a fictional character.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Take the Dark Triad Quiz →
          </Link>
        </div>

        <p className="text-xs text-gray-700 text-center mt-12">
          The Automated Doctor · quiz.theautomateddoctor.com
        </p>

      </div>
    </main>
  );
}
