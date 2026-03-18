// Dark Triad Character Match
// Maps N/M/P high/low combinations to fictional character profiles
// Used in: ResultsPanel.tsx (teaser) + paid report (full analysis)

export type DimensionLevel = 'high' | 'low';

export interface CharacterMatch {
  name: string;
  franchise: string;
  tagline: string;
  shortDescription: string;
  fullAnalysis: string;
  altCharacters: string[];
  traitBreakdown: {
    N: string;
    M: string;
    P: string;
  };
}

const CHARACTER_MAP: Record<string, CharacterMatch> = {
  'high-low-low': {
    name: 'Tony Stark',
    franchise: 'Marvel / Iron Man',
    tagline: "Brilliant. Confident. Needs the spotlight — but doesn't scheme for it.",
    shortDescription:
      "Your profile matches Tony Stark: high self-belief, low manipulation, low cruelty. You lead with ego, not calculation.",
    fullAnalysis: `Tony Stark isn't subtle — he doesn't need to be. His narcissism is his armour (literally). High Narcissism in your profile means you have strong self-belief, a desire for recognition, and a tendency to centre yourself in situations. Unlike the calculating Machiavellian or the detached psychopath, your pattern is about visibility, not control. You want to win, but you want everyone to see it.

Stark's low Machiavellianism mirrors yours: he's not a schemer. He reacts, improvises, trusts his own judgment. His low psychopathy shows up in his genuine attachment to Pepper, Rhodey, and eventually the broader world — he feels things, even if he performs invulnerability.

The clinical profile: high confidence, high need for admiration, low predatory calculation. The risk is entitlement and blind spots around feedback. The strength is extraordinary self-drive and charisma under pressure.`,
    altCharacters: ['Kanye West', 'Cristiano Ronaldo', 'Elon Musk (early career)'],
    traitBreakdown: {
      N: "Your narcissism drives performance, not exploitation",
      M: "You're direct rather than strategic — transparency over manipulation",
      P: "You feel consequences — which both slows and humanises you",
    },
  },

  'low-high-low': {
    name: 'Petyr Baelish',
    franchise: 'Game of Thrones',
    tagline: 'The strategist behind the scenes. Power through patience.',
    shortDescription:
      "Your profile matches Littlefinger: low ego, high calculation, low cruelty. You're a chess player, not a showman.",
    fullAnalysis: `Petyr Baelish never needed the throne — he needed to control who sat on it. High Machiavellianism in your profile means you think in systems, read people strategically, and move with patience. Unlike the narcissist who craves recognition, you're comfortable being underestimated.

Baelish's low narcissism is his most dangerous quality: no ego to exploit, no need for applause. He can absorb insults, play a long game, and sacrifice personal recognition for strategic gain. His low psychopathy means he's not gratuitously cruel — cruelty for him is always instrumental.

The clinical profile: high strategic intelligence, low need for validation, calculated interpersonal management. The risk is cynicism and a tendency to see all relationships as transactional. The strength is formidable long-term thinking and adaptability.`,
    altCharacters: ['Frank Underwood (House of Cards)', "Bobby Axelrod (Billions)", "Succession's Logan Roy"],
    traitBreakdown: {
      N: "You don't need credit — which makes you harder to predict",
      M: "You see angles others miss and move accordingly",
      P: "Your manipulation is strategic, not sadistic",
    },
  },

  'low-low-high': {
    name: 'Anton Chigurh',
    franchise: 'No Country for Old Men',
    tagline: 'Detached. Fearless. No ego to exploit.',
    shortDescription:
      "Your profile matches Anton Chigurh: low ego, low scheming, high emotional detachment. The most unsettling combination.",
    fullAnalysis: `Anton Chigurh is terrifying not because he's cruel for pleasure, but because he's genuinely indifferent. High psychopathy in your profile means emotional detachment, fearlessness, and low reactivity to social consequences. Unlike the narcissist (needs validation) or Machiavellian (needs control), you simply act according to your own internal logic.

Chigurh's low narcissism means he doesn't need to be feared — he just is. His low Machiavellianism means he doesn't manipulate; he applies his own code directly. There's no game being played. That's what makes this profile rare and striking.

The clinical profile: emotional detachment, high stress tolerance, reduced empathic response. The risk is interpersonal disconnection and difficulty building long-term trust. The strength is exceptional composure under pressure and freedom from social anxiety.`,
    altCharacters: ['Dexter Morgan', 'Amy Dunne (Gone Girl)', 'Villanelle (Killing Eve)'],
    traitBreakdown: {
      N: "No need for recognition — you act from internal logic",
      M: "No scheming — direct, sometimes to a fault",
      P: "High emotional detachment; you process differently than most",
    },
  },

  'high-high-low': {
    name: 'Harvey Specter',
    franchise: 'Suits',
    tagline: "Ambitious. Charming. Strategic. Wants to win — and wants you to know it.",
    shortDescription:
      "Your profile matches Harvey Specter: high self-belief, high calculation, low cruelty. The power player.",
    fullAnalysis: `Harvey Specter is the archetype of the Dark Triad executive: brilliant, strategic, and relentlessly self-assured. High Narcissism + High Machiavellianism is the combination that built Wall Street and every boardroom worth occupying.

His high narcissism means he needs to be the best — and knows he is. His high Machiavellianism means he reads rooms, manages relationships strategically, and always has a counter-move. His low psychopathy is what keeps him anchored: he has genuine loyalty to Mike, Donna, and his principles. He plays hard but has a code.

The clinical profile: high ambition, strategic intelligence, strong self-image with genuine interpersonal investment. The risk is using relationships instrumentally while telling yourself you care. The strength is extraordinary effectiveness in competitive environments.`,
    altCharacters: ['Gordon Gekko', 'Don Draper (Mad Men)', 'Patrick Jane (The Mentalist)'],
    traitBreakdown: {
      N: "High self-confidence, needs to be the best",
      M: "Strategic, reads people well, always thinking three moves ahead",
      P: "Has a code — not cruel for cruelty's sake",
    },
  },

  'high-low-high': {
    name: 'Tyler Durden',
    franchise: 'Fight Club',
    tagline: 'Grandiose, fearless, unpredictable. Acts before planning.',
    shortDescription:
      "Your profile matches Tyler Durden: high self-belief, impulsive, emotionally detached. The wildcard.",
    fullAnalysis: `Tyler Durden doesn't plan — he acts. High Narcissism + High Psychopathy without the Machiavellian calculation creates the most volatile profile: absolute self-certainty, fearlessness, and no patience for strategy.

His high narcissism means he believes in his own vision completely — he's not seeking approval, he's providing revelation. His high psychopathy means he can push limits, cross lines, and absorb consequences without flinching. His low Machiavellianism means there's no long game — just the next bold move.

The clinical profile: high impulsivity, grandiosity, stress immunity, low concern for consequence. The risk is self-destruction and collateral damage. The strength is extraordinary boldness and the ability to move people through sheer conviction.`,
    altCharacters: ['Jordan Belfort (Wolf of Wall Street)', 'Elon Musk (current)', 'Johnny Drama (Entourage)'],
    traitBreakdown: {
      N: "Absolute self-belief, vision-driven, seeks impact not approval",
      M: "Impulsive rather than strategic — acts on instinct",
      P: "Fearless, can cross lines others won't",
    },
  },

  'low-high-high': {
    name: 'Walter White',
    franchise: 'Breaking Bad',
    tagline: 'Coldly effective. No need for applause. Accumulates power quietly.',
    shortDescription:
      "Your profile matches Walter White (late season): low ego, high calculation, high detachment. The operator.",
    fullAnalysis: `Walter White's transformation is the story of Machiavellianism and Psychopathy consuming a man who started with high narcissism — but by the end, the ego is almost gone. What remains is cold effectiveness.

High Machiavellianism + High Psychopathy is the profile that quietly builds empires. There's no need for credit (low N), which means the operator can act invisibly. High M provides the strategic architecture; high P provides the emotional insulation to do what needs to be done.

The clinical profile: strategic precision, emotional detachment, low need for recognition, high tolerance for moral complexity. The risk is complete instrumentalisation of relationships. The strength is extraordinary effectiveness in high-stakes, complex environments.`,
    altCharacters: ['Tom Ripley (The Talented Mr. Ripley)', 'Roy Cohn', "Kevin Spacey's John Doe (Se7en)"],
    traitBreakdown: {
      N: "No need for recognition — invisible power",
      M: "Exceptional strategic thinking, plans multiple steps ahead",
      P: "Can emotionally compartmentalise to an extraordinary degree",
    },
  },

  'high-high-high': {
    name: 'Thomas Shelby',
    franchise: 'Peaky Blinders',
    tagline: 'Calculated. Confident. Ruthless. The full profile.',
    shortDescription:
      "Your profile matches Thomas Shelby: high across all three dimensions. Rare, and formidable.",
    fullAnalysis: `Thomas Shelby is one of fiction's most complete Dark Triad portrayals. Every dimension is elevated, and they reinforce each other: his narcissism drives his ambition, his Machiavellianism provides the architecture, and his psychopathy gives him the emotional insulation to execute.

This is the rarest profile — and the most historically significant. High all-three individuals show up disproportionately in positions of extreme power, leadership under pressure, and yes, historically, in atrocity. The profile confers extraordinary capability and extraordinary risk.

Shelby's genius is channelling all three into a coherent identity: the provider, the strategist, the survivor. His vulnerability is that the machinery never fully stops — even in peace, he's at war.

The clinical note: this profile is associated with both exceptional leadership and significant interpersonal cost. Self-awareness is the variable that determines which direction it goes.`,
    altCharacters: ['Richard III (Shakespeare)', 'Patrick Bateman (American Psycho)', 'Cersei Lannister'],
    traitBreakdown: {
      N: "Powerful self-image, expects authority and deference",
      M: "Strategic at the cellular level — always calculating",
      P: "Can function in situations that would paralyse others",
    },
  },

  'low-low-low': {
    name: 'Ted Lasso',
    franchise: 'Ted Lasso (Apple TV+)',
    tagline: 'Integrity. Empathy. Directness. The profile most people aspire to.',
    shortDescription:
      "Your profile matches Ted Lasso: low across all three dimensions. Genuine, empathic, trustworthy.",
    fullAnalysis: `Low Dark Triad is a result worth celebrating, not dismissing. Ted Lasso is the fictional embodiment: disarmingly genuine, strategically benevolent, and emotionally present.

Low Narcissism means genuine interest in others rather than self-promotion. Low Machiavellianism means relationships are not instrumentalised — what you see is what you get. Low Psychopathy means high empathy, emotional engagement, and genuine care about consequences.

This profile builds deep loyalty, creates high-trust environments, and tends to accumulate genuine social capital over time. The clinical literature is clear: low Dark Triad is associated with higher relationship satisfaction, lower conflict, and stronger community ties.

The risk for this profile is different: naivety in high-stakes competitive environments, difficulty recognising when others are exploiting goodwill, and sometimes under-asserting in conflict.`,
    altCharacters: ['Atticus Finch (To Kill a Mockingbird)', 'Captain America', 'Sam Gamgee (Lord of the Rings)'],
    traitBreakdown: {
      N: "Genuine humility and interest in others",
      M: "Transparent — what you say is what you mean",
      P: "High empathy, emotionally present",
    },
  },
};

export function getCharacterMatch(
  nPercentile: number,
  mPercentile: number,
  pPercentile: number
): CharacterMatch {
  const threshold = 60;
  const N = nPercentile > threshold ? 'high' : 'low';
  const M = mPercentile > threshold ? 'high' : 'low';
  const P = pPercentile > threshold ? 'high' : 'low';
  const key = `${N}-${M}-${P}`;
  return CHARACTER_MAP[key] ?? CHARACTER_MAP['low-low-low'];
}
