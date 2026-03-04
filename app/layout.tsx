import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dark Triad Profiler — Discover Your Dark Side',
  description:
    'Take the validated Dark Triad personality assessment. Based on NPI, Levenson SRPS, and MACH-IV scales used by researchers worldwide. Takes 3 minutes.',
  openGraph: {
    title: 'Dark Triad Profiler',
    description: 'How much of the Dark Triad do you carry? Take the test.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dark Triad Profiler',
    description: 'How much of the Dark Triad do you carry? Take the test.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
