import type { Metadata } from 'next';
import ScrollAuditClient from './ScrollAuditClient';

export const metadata: Metadata = {
  title: 'Scroll Audit — Quiz',
};

export default function ScrollAuditQuizPage() {
  return <ScrollAuditClient />;
}
