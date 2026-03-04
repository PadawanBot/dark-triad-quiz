import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://padawan_app:bowjac-uTg-0ci@172.31.44.186:5432/padawan_ops?sslmode=require',
  max: 3,
  ssl: { rejectUnauthorized: false },
});

const migration = `
CREATE SCHEMA IF NOT EXISTS quiz;

CREATE TABLE IF NOT EXISTS quiz.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode VARCHAR(20) NOT NULL,
  subject_name VARCHAR(100),
  answers JSONB NOT NULL,
  scores JSONB NOT NULL,
  percentiles JSONB,
  email VARCHAR(255),
  tier2_unlocked_at TIMESTAMPTZ,
  stripe_payment_id VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'none',
  paid_report_unlocked BOOLEAN DEFAULT FALSE,
  pdf_generated_at TIMESTAMPTZ,
  share_token VARCHAR(32) UNIQUE,
  challenge_token VARCHAR(32) UNIQUE,
  challenger_session_id UUID REFERENCES quiz.sessions(id),
  challenge_completed_at TIMESTAMPTZ,
  leaderboard_opt_in BOOLEAN DEFAULT FALSE,
  nickname VARCHAR(50),
  ip_hash VARCHAR(64),
  utm_source VARCHAR(100),
  referrer VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_share_token ON quiz.sessions(share_token);
CREATE INDEX IF NOT EXISTS idx_sessions_challenge_token ON quiz.sessions(challenge_token);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON quiz.sessions(email);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migration...');
    await client.query(migration);
    console.log('✅ Migration complete — quiz.sessions table ready');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
