import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, profile, email } = body;

    if (!profile) {
      return NextResponse.json({ error: 'profile required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      if (email) {
        // Email capture path — upsert by looking for recent session with same profile,
        // or insert new row with email + report_token
        const result = await client.query(
          `INSERT INTO quiz.scroll_audit_sessions
             (answers, profile, email, email_captured_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING report_token`,
          [answers ? JSON.stringify(answers) : '{}', profile, email]
        );

        const reportToken = result.rows[0]?.report_token;

        // Send to Kit (ConvertKit) — non-blocking
        if (process.env.KIT_API_KEY) {
          const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://quiz.theautomateddoctor.com').replace(/\/$/, '');
          const reportUrl = `${baseUrl}/scroll-audit/report/${reportToken}`;
          // Subscribe via scroll-audit tag (ID: 17627291)
          fetch(`https://api.convertkit.com/v3/tags/17627291/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_secret: process.env.KIT_API_KEY,
              email: email,
              fields: {
                scroll_profile: profile,
                scroll_report_url: reportUrl,
              },
            }),
          }).catch(() => {/* non-critical */});

          // Send report email via AgentMail
          if (process.env.AGENTMAIL_API_KEY) {
            const profileNames: Record<string, string> = {
              autopilot: 'The Autopilot',
              connection_seeker: 'The Connection Seeker',
              stimulation_hunter: 'The Stimulation Hunter',
              performer: 'The Performer',
            };
            const profileName = profileNames[profile] ?? profile;
            fetch('https://api.agentmail.to/v0/inboxes/scroll-audit@agentmail.to/messages/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AGENTMAIL_API_KEY}`,
              },
              body: JSON.stringify({
                to: [email],
                subject: `Your Scroll Audit Report — ${profileName}`,
                text: `Your Scroll Audit profile: ${profileName}\n\nYour full report is here:\n${reportUrl}\n\nBookmark this link — it's your permanent report.\n\n— The Automated Doctor`,
                html: `<p>Your Scroll Audit profile: <strong>${profileName}</strong></p><p><a href="${reportUrl}">View your full report →</a></p><p>Bookmark this link — it's your permanent report.</p><p>— The Automated Doctor</p>`,
              }),
            }).catch(() => {/* non-critical */});
          }
        }

        return NextResponse.json({ success: true, reportToken });
      } else {
        // Anonymous score save (called after completing quiz, before email)
        await client.query(
          `INSERT INTO quiz.scroll_audit_sessions (answers, profile)
           VALUES ($1, $2)`,
          [answers ? JSON.stringify(answers) : '{}', profile]
        );
        return NextResponse.json({ success: true });
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('scroll-audit submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
