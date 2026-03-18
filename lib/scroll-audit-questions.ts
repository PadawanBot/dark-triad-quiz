// Scroll Audit — Questions, scoring, and profile definitions

export type ScrollProfile = 'autopilot' | 'connection_seeker' | 'stimulation_hunter' | 'performer';

export interface Question {
  id: number;
  section: number;
  text: string;
  answers: { label: string; letter: 'A' | 'L' | 'B' | 'R' }[];
}

export interface ProfileDef {
  key: ScrollProfile;
  name: string;
  tagline: string;
  teaser: string;
  fullReport: {
    mechanism: string;
    science: string;
    pattern: string;
    intervention: string;
  };
}

export const SECTIONS = [
  { id: 1, title: 'When You Pick Up Your Phone' },
  { id: 2, title: 'What Keeps You Scrolling' },
  { id: 3, title: 'How You Feel After' },
  { id: 4, title: 'Your Relationship with Notifications' },
];

export const QUESTIONS: Question[] = [
  // Section 1 — When You Pick Up Your Phone
  {
    id: 1, section: 1,
    text: 'You reach for your phone most often when:',
    answers: [
      { label: "There's a gap — waiting in line, ads on TV, a pause in conversation", letter: 'A' },
      { label: "You feel a bit flat or disconnected from people", letter: 'L' },
      { label: "Nothing interesting is happening around you", letter: 'B' },
      { label: "You want to check how something you posted is doing", letter: 'R' },
    ],
  },
  {
    id: 2, section: 1,
    text: 'Before you even decide to open your phone, what usually happens?',
    answers: [
      { label: "Nothing — it's just in my hand already", letter: 'A' },
      { label: "I'm thinking about someone or wondering what people are up to", letter: 'L' },
      { label: "I want a hit of something interesting or funny", letter: 'B' },
      { label: "I want to see if anything has happened since I last looked", letter: 'R' },
    ],
  },
  {
    id: 3, section: 1,
    text: 'How often do you open your phone and genuinely not know why?',
    answers: [
      { label: 'Most of the time', letter: 'A' },
      { label: 'Sometimes — usually when I feel out of the loop', letter: 'L' },
      { label: 'Rarely — I usually want something specific', letter: 'B' },
      { label: "Not often — I'm usually checking something", letter: 'R' },
    ],
  },
  {
    id: 4, section: 1,
    text: 'When you try to put your phone down, what pulls you back?',
    answers: [
      { label: "I don't know — I'm just holding it again", letter: 'A' },
      { label: 'Feeling like I might be missing something social', letter: 'L' },
      { label: "There's always one more thing I might find interesting", letter: 'B' },
      { label: "I want to check if there's been any response or reaction", letter: 'R' },
    ],
  },
  // Section 2 — What Keeps You Scrolling
  {
    id: 5, section: 2,
    text: 'Once you start scrolling, what makes you keep going?',
    answers: [
      { label: "I'm not really tracking it — it just continues", letter: 'A' },
      { label: 'Seeing what people I know are doing or thinking', letter: 'L' },
      { label: "Hunting for that one piece of content that's actually great", letter: 'B' },
      { label: "Seeing if my content or opinions are landing", letter: 'R' },
    ],
  },
  {
    id: 6, section: 2,
    text: "What's happening in your head while you scroll?",
    answers: [
      { label: "Not much — it's almost background noise", letter: 'A' },
      { label: "I'm thinking about the people behind the posts", letter: 'L' },
      { label: "Active hunting — evaluating each thing as interesting or not", letter: 'B' },
      { label: "Comparing, noticing patterns, tracking engagement", letter: 'R' },
    ],
  },
  {
    id: 7, section: 2,
    text: 'Which type of content stops your scroll?',
    answers: [
      { label: 'Whatever happens to catch my eye — no pattern', letter: 'A' },
      { label: "Personal updates, drama, what's happening in people's lives", letter: 'L' },
      { label: 'Something genuinely novel, clever, or surprising', letter: 'B' },
      { label: 'Trending things, big engagement, viral content', letter: 'R' },
    ],
  },
  {
    id: 8, section: 2,
    text: 'When do you feel like stopping?',
    answers: [
      { label: "When something external interrupts — otherwise I don't really stop", letter: 'A' },
      { label: "When I feel caught up on everyone", letter: 'L' },
      { label: "When I've found enough good stuff or I'm full", letter: 'B' },
      { label: "When I'm satisfied with where things stand socially", letter: 'R' },
    ],
  },
  // Section 3 — How You Feel After
  {
    id: 9, section: 3,
    text: 'After a long scroll session, you usually feel:',
    answers: [
      { label: 'Vaguely drained, slightly glazed — time disappeared', letter: 'A' },
      { label: 'Unsettled or a bit lonely, even after all that connection', letter: 'L' },
      { label: 'Flat — like you ate junk food', letter: 'B' },
      { label: 'Anxious if the feedback was bad, energised if it was good', letter: 'R' },
    ],
  },
  {
    id: 10, section: 3,
    text: 'Do you notice a difference between how you expect to feel and how you actually feel after scrolling?',
    answers: [
      { label: "I don't usually expect anything — it just happens", letter: 'A' },
      { label: 'Yes — I go in hoping to feel connected, I come out less so', letter: 'L' },
      { label: 'Yes — I expect to find something good, I rarely do', letter: 'B' },
      { label: 'Sometimes — depends entirely on the response I got', letter: 'R' },
    ],
  },
];

// Letter → profile mapping
const LETTER_TO_PROFILE: Record<string, ScrollProfile> = {
  A: 'autopilot',
  L: 'connection_seeker',
  B: 'stimulation_hunter',
  R: 'performer',
};

// Tiebreak order: L > R > B > A
const TIEBREAK_ORDER: ScrollProfile[] = ['connection_seeker', 'performer', 'stimulation_hunter', 'autopilot'];

export function scoreAnswers(answers: Record<number, string>): ScrollProfile {
  const counts: Record<string, number> = { A: 0, L: 0, B: 0, R: 0 };
  for (const letter of Object.values(answers)) {
    if (letter in counts) counts[letter]++;
  }
  const max = Math.max(...Object.values(counts));
  const winners = Object.entries(counts)
    .filter(([, v]) => v === max)
    .map(([k]) => LETTER_TO_PROFILE[k]);
  // Apply tiebreak order
  for (const p of TIEBREAK_ORDER) {
    if (winners.includes(p)) return p;
  }
  return 'autopilot';
}

export const PROFILES: Record<ScrollProfile, ProfileDef> = {
  autopilot: {
    key: 'autopilot',
    name: 'The Autopilot',
    tagline: "Your scrolling isn't driven by emotion — it's pure habit.",
    teaser: "Your scrolling isn't driven by emotion — it's pure habit. The loop runs without a conscious trigger, which means willpower alone won't stop it.",
    fullReport: {
      mechanism: "Autopilot scrolling is driven by **procedural memory** — the same system that makes you brush your teeth without thinking. The behaviour has been rehearsed so many times it no longer requires conscious initiation. Your phone has been inserted into micro-gaps so consistently that your nervous system treats picking it up as a default state rather than a choice.",
      science: "Research from the University of Southern California found that habitual smartphone use activates the basal ganglia (habit circuits) rather than the prefrontal cortex (decision-making). This is clinically significant: interventions that rely on willpower or intention are targeting the wrong system. The habit is running below the level where those tools operate.",
      pattern: "The defining feature of your pattern is **absence of a felt trigger**. You don't pick up your phone because you're bored, lonely, or seeking validation — you pick it up because that's what happens in a gap. This makes it harder to interrupt, because there's no emotional signal to catch before the behaviour fires.",
      intervention: "The most effective interventions for autopilot patterns are **environmental, not psychological**: phone in a different room, grayscale display, app removal rather than self-control. Your behaviour is location and cue-dependent — change the cues, change the behaviour. Friction is your friend. Every extra step between you and the scroll reduces automaticity."
    },
  },
  connection_seeker: {
    key: 'connection_seeker',
    name: 'The Connection Seeker',
    tagline: 'Your phone is a stand-in for something your nervous system is actively looking for.',
    teaser: "Your phone is a stand-in for something your nervous system is actively looking for. The science behind this is both specific and actionable.",
    fullReport: {
      mechanism: "Connection-seeking scrolling is driven by the **social monitoring system** — a deeply conserved evolutionary mechanism that tracks your standing and proximity within social networks. Historically this system kept you alive. In 2026 it's pointed at Instagram, where the inputs are curated, the feedback is asymmetric, and the social landscape is orders of magnitude larger than it was designed to process.",
      science: "A 2021 meta-analysis in *JAMA Psychiatry* found that passive social media consumption (scrolling others' content) is associated with increased loneliness, while active use (direct messaging, posting, responding) shows no such effect. The paradox is that connection-seeking scrolling — the behaviour most motivated by a desire for social contact — is the form least likely to deliver it.",
      pattern: "Your pattern has a specific signature: you go in seeking warmth or social proximity, and you come out feeling further away. This isn't failure — it's the expected output of a mismatch between what your nervous system is asking for (reciprocal, embodied social contact) and what the feed delivers (broadcast content from acquaintances).",
      intervention: "The most effective reframe is **substitution, not restriction**: identify what the phone session is actually seeking (a sense of being thought of, the feeling of being current with people you care about) and create a direct path to that thing. A three-message thread with one person you actually want to hear from will do more for your nervous system than forty minutes of passive feed consumption."
    },
  },
  stimulation_hunter: {
    key: 'stimulation_hunter',
    name: 'The Stimulation Hunter',
    tagline: "Your brain is wired for novelty, and your phone delivers it on demand — until it doesn't.",
    teaser: "Your brain is wired for novelty, and your phone delivers it on demand — until it doesn't. The pattern is well understood in behavioural research.",
    fullReport: {
      mechanism: "Stimulation-hunting scrolling is driven by **dopaminergic novelty-seeking** — the same system that made humans explorers, inventors, and early adopters. Your scroll is a foraging behaviour: you're hunting for high-value informational content in an environment specifically engineered to simulate scarcity (just one more scroll) while delivering just enough to keep you searching.",
      science: "Kent Berridge's work at the University of Michigan distinguished between **wanting** (dopaminergic, anticipatory) and **liking** (opioid, consummatory). Stimulation hunters run hot on wanting and cool on liking — you're often driven by the hunt more than the content itself. This is why you can scroll for an hour, find ten things you enjoyed, and still feel empty: the reward architecture is in the seeking, not the finding.",
      pattern: "Your defining experience is the **disappointment of arrival**: you find something good, it satisfies briefly, then the wanting restarts immediately. The feed is calibrated to this. The algorithm is not trying to satisfy you — it's trying to maintain the state of almost-satisfied, which keeps you scrolling.",
      intervention: "The most effective approach is **raising the threshold for engagement**. Instead of blocking access, replace the feed with curated, high-signal sources (RSS readers, newsletters, specific channels) that require active navigation. The novelty-seeking system doesn't disappear — it needs something worth hunting. Give it a harder game to play."
    },
  },
  performer: {
    key: 'performer',
    name: 'The Performer',
    tagline: 'Your relationship with your phone is built around feedback.',
    teaser: "Your relationship with your phone is built around feedback. What gets reinforced, gets repeated — and that loop has a biological mechanism.",
    fullReport: {
      mechanism: "Performer scrolling is driven by **social feedback loops** — specifically the variable-ratio reinforcement schedule that platforms use for likes, comments, and shares. Variable-ratio schedules (unpredictable reward intervals) produce the most persistent and resistant-to-extinction behaviour in the psychology literature. You're not addicted to the phone — you're addicted to the signal that other people are responding to you.",
      science: "Research from UCLA's Social Cognitive Neuroscience Lab showed that receiving likes activates the same neural circuits (nucleus accumbens) as receiving money or eating chocolate. More significantly, the *anticipation* of social feedback is neurologically indistinguishable from other reward anticipation states. This is why checking your phone after posting feels urgent — your nervous system has categorised it as a meaningful reward event.",
      pattern: "Your pattern is highly state-dependent: when feedback is positive, your phone use energises you; when it's negative or absent, it depletes you. This makes your relationship with your phone more volatile than other profiles. The platform has outsized influence on your mood — not because you're weak, but because you've created a genuine feedback dependency.",
      intervention: "The most important shift is **decoupling your output from your monitoring**. Post, then put the phone away for a defined period before checking. Start with 30 minutes. This rebuilds the gap between action and feedback that platforms deliberately collapse. Over time it resets the baseline anxiety around posting and reduces the compulsive checking behaviour."
    },
  },
};
