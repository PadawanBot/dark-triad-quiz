import { questionById, Trait } from './questions';

// ─────────────────────────────────────────────────────────────────────────────
// Normative data from published research (full 10-item scale)
// We halve mean/SD for the 5-item quick test (proportional scaling)
// ─────────────────────────────────────────────────────────────────────────────

interface NormativeEntry {
  mean10: number; // 10-item scale mean (raw 10–50)
  sd10: number;
}

const NORMATIVE: Record<Trait, NormativeEntry> = {
  narcissism: { mean10: 15.5, sd10: 6.8 },
  psychopathy: { mean10: 20.1, sd10: 6.2 },
  machiavellianism: { mean10: 25.3, sd10: 7.1 },
};

// Normal distribution CDF approximation (Abramowitz & Stegun)
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}

export type Answers = Record<number, number>; // questionId → response (1–5)

export interface TraitScores {
  narcissism: number;   // 0–100
  psychopathy: number;
  machiavellianism: number;
  composite: number;
}

export interface TraitPercentiles {
  narcissism: number;   // 1–99
  psychopathy: number;
  machiavellianism: number;
  composite: number;
}

export interface ScoringResult {
  scores: TraitScores;
  percentiles: TraitPercentiles;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Sum scored responses for a set of question IDs from an answers map */
function rawScoreForIds(answers: Answers, ids: number[]): number {
  let total = 0;
  for (const id of ids) {
    const q = questionById.get(id);
    if (!q) continue;
    const response = answers[id] ?? 3; // midpoint default
    total += q.reversed ? 6 - response : response;
  }
  return total;
}

/** Normalise raw score to 0–100 given the min/max possible */
function normalise(raw: number, rawMin: number, rawMax: number): number {
  return Math.round(((raw - rawMin) / (rawMax - rawMin)) * 100);
}

/**
 * Calculate percentile.
 * We scale the normative mean/SD to match the number of items answered
 * (e.g. 5-item subset → mean/2, sd/√2 for a rough proportional estimate).
 */
function percentile(raw: number, trait: Trait, numItems: number): number {
  const norm = NORMATIVE[trait];
  // Scale normative params to the number of items (10-item baseline)
  const scale = numItems / 10;
  const scaledMean = norm.mean10 * scale;
  const scaledSd = norm.sd10 * Math.sqrt(scale);

  const z = (raw - scaledMean) / scaledSd;
  const p = normalCDF(z) * 100;
  return Math.round(Math.min(99, Math.max(1, p)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score a set of answers.
 * Pass the question IDs that were answered (determines normative scaling).
 * Automatically groups them by trait.
 */
export function scoreAnswers(answers: Answers, questionIds: number[]): ScoringResult {
  const byTrait: Record<Trait, number[]> = {
    narcissism: [],
    psychopathy: [],
    machiavellianism: [],
  };

  for (const id of questionIds) {
    const q = questionById.get(id);
    if (q) byTrait[q.trait].push(id);
  }

  const traits: Trait[] = ['narcissism', 'psychopathy', 'machiavellianism'];
  const rawScores: Record<Trait, number> = {} as Record<Trait, number>;
  const normScores: Record<Trait, number> = {} as Record<Trait, number>;
  const pctScores: Record<Trait, number> = {} as Record<Trait, number>;

  for (const trait of traits) {
    const ids = byTrait[trait];
    const n = ids.length;
    const rawMin = n * 1;
    const rawMax = n * 5;
    rawScores[trait] = rawScoreForIds(answers, ids);
    normScores[trait] = normalise(rawScores[trait], rawMin, rawMax);
    pctScores[trait] = percentile(rawScores[trait], trait, n);
  }

  const composite = Math.round(
    (normScores.narcissism + normScores.psychopathy + normScores.machiavellianism) / 3
  );
  const compositePct = Math.round(
    (pctScores.narcissism + pctScores.psychopathy + pctScores.machiavellianism) / 3
  );

  return {
    scores: {
      narcissism: normScores.narcissism,
      psychopathy: normScores.psychopathy,
      machiavellianism: normScores.machiavellianism,
      composite,
    },
    percentiles: {
      narcissism: pctScores.narcissism,
      psychopathy: pctScores.psychopathy,
      machiavellianism: pctScores.machiavellianism,
      composite: compositePct,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Descriptive text helpers
// ─────────────────────────────────────────────────────────────────────────────

export function traitSummary(trait: Trait, pct: number): string {
  const band = pct >= 85 ? 'high' : pct >= 50 ? 'moderate' : 'low';

  const summaries: Record<Trait, Record<string, string>> = {
    narcissism: {
      high: 'You have a strong sense of entitlement and a deep need for admiration.',
      moderate: 'You have a healthy self-regard with occasional narcissistic tendencies.',
      low: 'You are modest, other-focused, and rarely seek the spotlight.',
    },
    psychopathy: {
      high: 'You show reduced empathy and a willingness to break rules for personal gain.',
      moderate: 'You can be pragmatic and detached but retain core ethical limits.',
      low: 'You are empathetic, rule-abiding, and deeply considerate of others.',
    },
    machiavellianism: {
      high: 'You are highly strategic — you plan carefully and trust very few.',
      moderate: 'You balance strategic thinking with genuine interpersonal warmth.',
      low: 'You are open, trusting, and rarely pursue hidden agendas.',
    },
  };

  return summaries[trait][band];
}

export function compositeSummary(composite: number): string {
  if (composite >= 75) return 'Your Dark Triad profile is exceptionally elevated.';
  if (composite >= 55)
    return 'You carry notable Dark Triad traits — you are likely formidable and strategic.';
  if (composite >= 35)
    return 'You show moderate Dark Triad traits — a blend of ambition and conscience.';
  return 'Your Dark Triad profile is low — you lead with empathy and openness.';
}

export function dominantTrait(scores: TraitScores): Trait {
  const traits: Trait[] = ['narcissism', 'psychopathy', 'machiavellianism'];
  return traits.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
}
