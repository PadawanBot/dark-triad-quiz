export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { kitSubscribeWithTag } from '@/lib/kitApi';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    // Build guide URL — strip any trailing slash from base to avoid double slashes
    const base = (process.env.NEXT_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');
    const guideUrl =
      process.env.GASLIGHTING_GUIDE_URL ??
      `${base}/guides/gaslighting-survival-guide.pdf`;

    // Subscribe to Kit with gaslighting-quiz tag (fire-and-forget on error)
    const kitResult = await kitSubscribeWithTag(
      email,
      { dominant_trait: 'gaslighting' },
      'gaslighting-quiz',
    );

    return NextResponse.json({
      guideUrl,
      kitSuccess: kitResult.success,
      kitError: kitResult.error ?? null,
    });
  } catch (err) {
    console.error('[gaslighting/email]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
