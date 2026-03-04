export type Trait = 'narcissism' | 'psychopathy' | 'machiavellianism';

export interface Question {
  id: number;
  trait: Trait;
  text: string;
  reversed: boolean;
  /**
   * phase 1 = Quick Test (highest-loading items, 5 per trait)
   * phase 2 = Full Assessment (additional 5 per trait, shown only if user opts in)
   */
  phase: 1 | 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// Question Bank (30 questions — 10 per trait)
// Based on: NPI-16, Levenson SRPS, MACH-IV (plain English rewrites)
// IDs 1–10 = Narcissism, 11–20 = Psychopathy, 21–30 = Machiavellianism
// Phase 1 = items 1–5 per trait (highest loading)
// Phase 2 = items 6–10 per trait (additional)
// ─────────────────────────────────────────────────────────────────────────────

export const questions: Question[] = [
  // ── NARCISSISM — Phase 1 (highest-loading) ────────────────────────────────
  {
    id: 1,
    trait: 'narcissism',
    text: 'I know that I am good because everyone keeps telling me so.',
    reversed: false,
    phase: 1,
  },
  {
    id: 2,
    trait: 'narcissism',
    text: 'I am a natural leader and others recognise this.',
    reversed: false,
    phase: 1,
  },
  {
    id: 3,
    trait: 'narcissism',
    text: 'I like to be the centre of attention.',
    reversed: false,
    phase: 1,
  },
  {
    id: 4,
    trait: 'narcissism',
    text: 'I think I am a special person with unique qualities.',
    reversed: false,
    phase: 1,
  },
  {
    id: 5,
    trait: 'narcissism',
    text: 'I am more capable than most people around me.',
    reversed: false,
    phase: 1,
  },

  // ── NARCISSISM — Phase 2 (additional) ─────────────────────────────────────
  {
    id: 6,
    trait: 'narcissism',
    text: 'I can read people like a book and use it to my advantage.',
    reversed: false,
    phase: 2,
  },
  {
    id: 7,
    trait: 'narcissism',
    text: 'I prefer to blend into the crowd rather than stand out.',
    reversed: true,
    phase: 2,
  },
  {
    id: 8,
    trait: 'narcissism',
    text: 'If I ruled the world, it would be a much better place.',
    reversed: false,
    phase: 2,
  },
  {
    id: 9,
    trait: 'narcissism',
    text: 'I expect a great deal from other people.',
    reversed: false,
    phase: 2,
  },
  {
    id: 10,
    trait: 'narcissism',
    text: 'I rarely feel the need to seek the advice of others.',
    reversed: false,
    phase: 2,
  },

  // ── PSYCHOPATHY — Phase 1 (highest-loading) ───────────────────────────────
  {
    id: 11,
    trait: 'psychopathy',
    text: 'Success is measured by winning, regardless of how you get there.',
    reversed: false,
    phase: 1,
  },
  {
    id: 12,
    trait: 'psychopathy',
    text: 'I find it easy to manipulate people.',
    reversed: false,
    phase: 1,
  },
  {
    id: 13,
    trait: 'psychopathy',
    text: 'I feel little concern for the pain or misfortune of others.',
    reversed: false,
    phase: 1,
  },
  {
    id: 14,
    trait: 'psychopathy',
    text: 'For me, what is right is whatever I can get away with.',
    reversed: false,
    phase: 1,
  },
  {
    id: 15,
    trait: 'psychopathy',
    text: 'I enjoy taking risks and living on the edge.',
    reversed: false,
    phase: 1,
  },

  // ── PSYCHOPATHY — Phase 2 (additional) ────────────────────────────────────
  {
    id: 16,
    trait: 'psychopathy',
    text: 'My feelings and those of others are equally important to me.',
    reversed: true,
    phase: 2,
  },
  {
    id: 17,
    trait: 'psychopathy',
    text: 'I feel bad when I hurt or mistreat someone.',
    reversed: true,
    phase: 2,
  },
  {
    id: 18,
    trait: 'psychopathy',
    text: 'Love is overrated — it is just a chemical trick the brain plays on you.',
    reversed: false,
    phase: 2,
  },
  {
    id: 19,
    trait: 'psychopathy',
    text: 'I often get bored quickly and need new stimulation.',
    reversed: false,
    phase: 2,
  },
  {
    id: 20,
    trait: 'psychopathy',
    text: 'Rules and laws are made for people who lack the intelligence to get around them.',
    reversed: false,
    phase: 2,
  },

  // ── MACHIAVELLIANISM — Phase 1 (highest-loading) ──────────────────────────
  {
    id: 21,
    trait: 'machiavellianism',
    text: 'The best way to deal with people is to tell them what they want to hear.',
    reversed: false,
    phase: 1,
  },
  {
    id: 22,
    trait: 'machiavellianism',
    text: 'Anyone who fully trusts another person is asking for trouble.',
    reversed: false,
    phase: 1,
  },
  {
    id: 23,
    trait: 'machiavellianism',
    text: 'It is hard to get ahead without cutting corners and being deceptive.',
    reversed: false,
    phase: 1,
  },
  {
    id: 24,
    trait: 'machiavellianism',
    text: 'I am willing to be ruthless if it serves my long-term goals.',
    reversed: false,
    phase: 1,
  },
  {
    id: 25,
    trait: 'machiavellianism',
    text: 'The end justifies the means in most situations.',
    reversed: false,
    phase: 1,
  },

  // ── MACHIAVELLIANISM — Phase 2 (additional) ───────────────────────────────
  {
    id: 26,
    trait: 'machiavellianism',
    text: 'I believe most people are fundamentally honest and good.',
    reversed: true,
    phase: 2,
  },
  {
    id: 27,
    trait: 'machiavellianism',
    text: 'I prefer direct honesty even when flattery would serve me better.',
    reversed: true,
    phase: 2,
  },
  {
    id: 28,
    trait: 'machiavellianism',
    text: 'Never tell anyone the real reason you did something unless it is useful for you to do so.',
    reversed: false,
    phase: 2,
  },
  {
    id: 29,
    trait: 'machiavellianism',
    text: 'It is wise to keep information to yourself as a form of leverage.',
    reversed: false,
    phase: 2,
  },
  {
    id: 30,
    trait: 'machiavellianism',
    text: 'I feel that compassion should guide decisions more than strategy.',
    reversed: true,
    phase: 2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page definitions — interleaved trait mix per page for engagement
// Quick Test (Phase 1): 3 pages × 5 questions
// Full Assessment (Phase 2): 3 pages × 5 questions
// ─────────────────────────────────────────────────────────────────────────────

/** Question IDs for Quick Test pages (Phase 1, 15 questions, interleaved) */
export const QUICK_TEST_PAGES: number[][] = [
  [1, 2, 11, 12, 21],   // N1, N2, P1, P2, M1
  [3, 4, 13, 14, 22],   // N3, N4, P3, P4, M2
  [5, 15, 23, 24, 25],  // N5, P5, M3, M4, M5
];

/** Question IDs for Full Assessment pages (Phase 2, additional 15 questions) */
export const FULL_ASSESSMENT_PAGES: number[][] = [
  [6, 7, 16, 17, 26],   // N6, N7, P6, P7, M6
  [8, 9, 18, 19, 27],   // N8, N9, P8, P9, M7
  [10, 20, 28, 29, 30], // N10, P10, M8, M9, M10
];

/** Flat ordered list of Quick Test question IDs */
export const QUICK_TEST_IDS = QUICK_TEST_PAGES.flat();

/** Flat ordered list of Full Assessment question IDs */
export const FULL_ASSESSMENT_IDS = FULL_ASSESSMENT_PAGES.flat();

/** Look up a question by ID */
export const questionById = new Map<number, Question>(
  questions.map((q) => [q.id, q])
);

export const TOTAL_PAGES = QUICK_TEST_PAGES.length + FULL_ASSESSMENT_PAGES.length; // 6
export const QUICK_TEST_PAGES_COUNT = QUICK_TEST_PAGES.length; // 3
