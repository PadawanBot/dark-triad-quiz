// Gaslighting Quiz — Scoring Logic

export type GasAnswers = Record<number, GasResponse>;
export type GasResponse = 0 | 1 | 2; // Never | Sometimes | Often

export type GasBand = 'few' | 'some' | 'many';

export interface GasScoringResult {
  tacticsScore: number;   // 0–16
  impactScore: number;    // 0–18 (weighted ×1.5, rounded)
  totalScore: number;     // 0–34
  band: GasBand;
  safetyYes: boolean;
}

const TACTICS_IDS = [1, 2, 3, 4, 5, 6, 7, 8];
const IMPACT_IDS = [9, 10, 11, 12, 13, 14];

export function scoreGasAnswers(
  answers: GasAnswers,
  safetyYes: boolean
): GasScoringResult {
  // Tactics: raw sum 0–16
  const tacticsScore = TACTICS_IDS.reduce(
    (sum, id) => sum + (answers[id] ?? 0),
    0
  );

  // Impact: raw sum 0–12, then × 1.5, rounded → 0–18
  const impactRaw = IMPACT_IDS.reduce(
    (sum, id) => sum + (answers[id] ?? 0),
    0
  );
  const impactScore = Math.round(impactRaw * 1.5);

  const totalScore = tacticsScore + impactScore;

  const band: GasBand =
    totalScore <= 10 ? 'few' : totalScore <= 20 ? 'some' : 'many';

  return { tacticsScore, impactScore, totalScore, band, safetyYes };
}

export function bandLabel(band: GasBand): string {
  const labels: Record<GasBand, string> = {
    few: 'Few Indicators',
    some: 'Some Indicators',
    many: 'Many Indicators',
  };
  return labels[band];
}

export function bandColor(band: GasBand): string {
  const colors: Record<GasBand, string> = {
    few: '#14b8a6',   // teal
    some: '#f59e0b',  // amber
    many: '#ef4444',  // red
  };
  return colors[band];
}

export function resultsCopy(band: GasBand): {
  headline: string;
  body: string;
  microcopy: string;
} {
  if (band === 'few') {
    return {
      headline: 'Few Gaslighting Indicators',
      body:
        'Your responses suggest relatively few gaslighting indicators in this situation right now. ' +
        'That said, even a small number of indicators can be worth paying attention to — patterns often develop gradually, ' +
        'and noticing them early matters.',
      microcopy:
        'This reflects the indicators you endorsed — not a diagnosis, not a certainty. ' +
        'Only you know the full context of your situation.',
    };
  }

  if (band === 'some') {
    return {
      headline: 'Some Gaslighting Indicators',
      body:
        'Your responses suggest a meaningful number of indicators associated with gaslighting. ' +
        'Patterns like these can occur in relationships where gaslighting is happening, ' +
        'though they can also appear in other high-conflict or stressful situations. ' +
        'What matters most is how these patterns are affecting you day to day.',
      microcopy:
        'This reflects the indicators you endorsed — not a diagnosis or confirmation of anyone\'s intent. ' +
        'Only you know the full context of your situation.',
    };
  }

  // many
  return {
    headline: 'Many Gaslighting Indicators',
    body:
      'Your responses indicate a significant number of indicators associated with gaslighting. ' +
      'If this reflects your current experience, what you\'re going through is real — ' +
      'and it makes sense that it is affecting you. You deserve support and accurate information.',
    microcopy:
      'This reflects the indicators you endorsed — not a diagnosis or confirmation of anyone\'s intent. ' +
      'Only you know the full context of your situation.',
  };
}

export const SAFETY_RESOURCES = `If you\'ve felt physically unsafe or afraid, please know that help is available.

• National Domestic Violence Hotline (US): 1-800-799-7233 or text START to 88788
• 1800RESPECT (Australia): 1800 737 732
• National DV Helpline (UK): 0808 2000 247
• In immediate danger: call your local emergency number (000 / 911 / 999)`;
