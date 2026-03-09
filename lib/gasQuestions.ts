// Gaslighting Quiz — Questions & IDs
// Q1–8: Tactics (score 0–16)
// Q9–14: Impact (score 0–12, weighted ×1.5 → 0–18)
// Q15: Safety screener (Yes/No, not scored)

export type GasResponse = 0 | 1 | 2; // Never | Sometimes | Often

export interface GasQuestion {
  id: number;
  text: string;
  type: 'tactics' | 'impact';
}

export const GAS_TACTICS_IDS = [1, 2, 3, 4, 5, 6, 7, 8];
export const GAS_IMPACT_IDS = [9, 10, 11, 12, 13, 14];
export const GAS_SAFETY_ID = 15;
export const GAS_ALL_SCORED_IDS = [...GAS_TACTICS_IDS, ...GAS_IMPACT_IDS];

export const GAS_QUESTIONS: GasQuestion[] = [
  // ── Tactics ──────────────────────────────────────────────────────────────
  {
    id: 1,
    type: 'tactics',
    text: 'Someone tells you that your memory of an event is wrong when you feel confident it happened the way you remember.',
  },
  {
    id: 2,
    type: 'tactics',
    text: 'You are made to feel foolish, dramatic, or unreasonable for having a normal emotional reaction.',
  },
  {
    id: 3,
    type: 'tactics',
    text: 'Someone denies saying or doing something you clearly remember.',
  },
  {
    id: 4,
    type: 'tactics',
    text: 'You are told you are "too sensitive" or "overreacting" when you raise a concern.',
  },
  {
    id: 5,
    type: 'tactics',
    text: 'Someone deflects, changes the subject, or turns the conversation back on you when you try to address a problem.',
  },
  {
    id: 6,
    type: 'tactics',
    text: 'Important facts about a situation are withheld from you until after decisions have already been made.',
  },
  {
    id: 7,
    type: 'tactics',
    text: 'After conversations with this person, you find yourself questioning whether your read of a situation was correct.',
  },
  {
    id: 8,
    type: 'tactics',
    text: 'You are made to feel like the problem in the relationship for pointing out concerning behaviour.',
  },
  // ── Impact ────────────────────────────────────────────────────────────────
  {
    id: 9,
    type: 'impact',
    text: 'You second-guess your own memories or perception of events.',
  },
  {
    id: 10,
    type: 'impact',
    text: 'You feel confused or disoriented after conversations with this person.',
  },
  {
    id: 11,
    type: 'impact',
    text: 'You find yourself apologising for things you did not do or do not believe were wrong.',
  },
  {
    id: 12,
    type: 'impact',
    text: 'You feel anxious about bringing up problems for fear of how this person will respond.',
  },
  {
    id: 13,
    type: 'impact',
    text: 'You have started to rely on this person\'s version of events rather than your own.',
  },
  {
    id: 14,
    type: 'impact',
    text: 'You feel less confident in yourself or your judgment than you used to.',
  },
];

// Safety screener — not part of scoring
export const GAS_SAFETY_QUESTION = {
  id: GAS_SAFETY_ID,
  text: 'Have you ever felt physically unsafe or afraid of this person?',
};

export const gasQuestionById = new Map<number, GasQuestion>(
  GAS_QUESTIONS.map((q) => [q.id, q])
);
