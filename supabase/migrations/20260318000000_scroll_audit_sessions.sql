-- Scroll Audit sessions table
CREATE TABLE IF NOT EXISTS quiz.scroll_audit_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answers             JSONB,
  profile             TEXT NOT NULL,
  email               TEXT,
  email_captured_at   TIMESTAMPTZ,
  report_token        TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  report_sent_at      TIMESTAMPTZ,
  kit_subscriber_id   TEXT
);

CREATE INDEX IF NOT EXISTS idx_scroll_audit_report_token
  ON quiz.scroll_audit_sessions(report_token);
CREATE INDEX IF NOT EXISTS idx_scroll_audit_email
  ON quiz.scroll_audit_sessions(email);
