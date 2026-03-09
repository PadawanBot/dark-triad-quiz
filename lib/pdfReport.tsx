// PDF Report Generator using @react-pdf/renderer
// Server-side only — do NOT import in client components

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,

} from '@react-pdf/renderer';

interface TraitScores {
  narcissism: number;
  psychopathy: number;
  machiavellianism: number;
  composite: number;
}

interface TraitPercentiles {
  narcissism: number;
  psychopathy: number;
  machiavellianism: number;
  composite: number;
}

interface ReportData {
  scores: TraitScores;
  percentiles: TraitPercentiles;
  subjectName?: string | null;
}

const COLORS = {
  black: '#000000',
  darkBg: '#0a0a0a',
  red: '#c0392b',
  gold: '#f0c040',
  purple: '#8e44ad',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#999999',
  border: '#e0e0e0',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  // Title page
  titlePage: {
    backgroundColor: '#0a0a0a',
    padding: 48,
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandBadge: {
    fontSize: 9,
    color: '#c0392b',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  reportTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 1.2,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 48,
  },
  divider: {
    height: 2,
    backgroundColor: '#c0392b',
    width: 60,
    marginBottom: 32,
  },
  titleScoreRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 48,
  },
  titleScoreBox: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
  },
  titleScoreLabel: {
    fontSize: 8,
    color: '#666666',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleScoreValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
  },
  titleFooter: {
    fontSize: 9,
    color: '#444444',
    marginTop: 'auto',
  },
  // Content pages
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 8,
    color: '#c0392b',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 1.5,
  },
  traitCard: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  traitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  traitName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  traitScore: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  traitPercentile: {
    fontSize: 9,
    color: '#999999',
    textAlign: 'right',
  },
  barContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  traitBody: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.7,
  },
  strategiesBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  strategiesTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  strategyItem: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  ctaBox: {
    marginTop: 32,
    padding: 24,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  ctaBody: {
    fontSize: 10,
    color: '#999999',
    lineHeight: 1.7,
    marginBottom: 16,
  },
  ctaUrl: {
    fontSize: 12,
    color: '#c0392b',
    fontFamily: 'Helvetica-Bold',
  },
  disclaimer: {
    fontSize: 8,
    color: '#bbbbbb',
    lineHeight: 1.5,
    marginTop: 12,
  },
});

// Trait content based on scores
function getTraitContent(
  trait: 'narcissism' | 'psychopathy' | 'machiavellianism',
  score: number
): { heading: string; body: string; relationships: string; work: string; strategies: string[] } {
  const isHigh = score > 65;
  const isMedium = score >= 35 && score <= 65;

  if (trait === 'narcissism') {
    if (isHigh) {
      return {
        heading: 'Understanding Your Narcissistic Traits',
        body: `Your Narcissism score places you in the higher range — and before we go further, let's be clear about what that actually means.\n\nIt doesn't mean you're dangerous. It doesn't mean something is wrong with you. What it means is that narcissistic traits — a strong self-orientation, a need for recognition, a sense of being somewhat exceptional — show up prominently in how you move through the world.\n\nPeople with scores in this range tend to be ambitious, confident, and highly attuned to status and image. They often perform well in competitive environments and project a strong personal brand. The research is also clear on this: narcissism is highly responsive to self-awareness. People with elevated scores who develop genuine curiosity about others' inner worlds consistently report better relationships and less of the constant need for validation — which, if you're honest, can be exhausting.`,
        relationships: `In romantic relationships, a high Narcissism score creates an intensity that often feels exciting early — then can feel imbalanced over time. You likely bring strong energy and vision, but you may also have a lower threshold for criticism and a tendency to centre your own experience during conflict.\n\nPartners of high-Narcissism individuals frequently describe a pattern: they feel deeply chosen at the start — then gradually like they're supporting characters in someone else's story. Awareness of this pattern is step one. Deliberately asking how your partner is doing — and actually listening — is step two.\n\nProfessionally, your profile is a genuine asset: drive, confidence, willingness to self-promote. The growth edge is managing down well and building loyalty through people feeling developed and valued, not just useful.`,
        work: '',
        strategies: [
          '→ Build a feedback loop you actually trust — 1-2 people who will tell you hard truths.',
          '→ Practise perspective-taking before major decisions: what does this look like from their side?',
          '→ Distinguish short-term leverage from long-term trust — track what your patterns are building or eroding.',
          '→ Channel your competitive drive toward external goals, not the people closest to you.',
          '→ Regular honest reflection: where did things go sideways? What did you want vs what did you get?',
          '→ Invest in genuine curiosity about people — not strategic curiosity, genuine interest.',
        ],
      };
    } else if (isMedium) {
      return {
        heading: 'Your Narcissism Profile — Moderate Range',
        body: `Your Narcissism score sits in the moderate range — present but not dominant. You have a solid sense of your own value and likely advocate for yourself reasonably well without tipping into entitlement.\n\nModerate narcissism is, by many accounts, a functional middle ground. People with very low narcissism can struggle with self-advocacy. People with very high narcissism often damage relationships. In the moderate range — your range — narcissistic traits tend to show up as healthy self-regard: confidence without constant dominance, ambition without burning bridges.\n\nUnder stress, you may become more self-focused than usual. This is the direction to watch when things get hard.`,
        relationships: `In relationships, you balance your own needs with others' most of the time. You're capable of genuine reciprocity, though under sustained pressure you may default to self-focus without fully realising it.\n\nProfessionally, you perform well in competitive environments without needing to dominate them. Your growth edge is noticing when the drive for recognition is shaping decisions in ways that aren't actually serving you.`,
        work: '',
        strategies: [
          '→ Notice when stress is making you more self-focused — name it before it affects others.',
          '→ Practise asking for feedback specifically about how you show up in relationships.',
          "→ Invest in reciprocity deliberately: track whether you're asking as much as you're telling.",
          '→ Channel ambition into shared goals with people you care about.',
          '→ Regularly check: are the people closest to me feeling seen?',
        ],
      };
    } else {
      return {
        heading: 'What Your Narcissism Profile Means for You',
        body: `Your Narcissism score is in the lower range — you tend to undervalue your own contributions and may find it genuinely difficult to take credit even when it's deserved. You're likely seen as collaborative and easy to work with.\n\nWhile humility is a genuine strength, a low narcissism score means the traits that make you good to be around also make you more susceptible to people who score much higher. The goal isn't to become narcissistic — it's to understand how high scorers operate so you can protect your interests without losing your warmth.`,
        relationships: `In romantic relationships, you invest deeply and often put others' needs before your own. This makes you a loyal and attentive partner — and means you can be taken for granted more than you should be.\n\nProfessionally, you may undersell yourself in negotiations and miss opportunities by waiting to be recognised rather than claiming recognition. Learning to advocate for yourself — not from ego, but from accuracy — would change a lot.`,
        work: '',
        strategies: [
          '→ Practise stating your needs directly: "I need X" rather than hinting.',
          '→ Keep a record of your achievements — refer to it when negotiating.',
          '→ Learn to recognise love-bombing and excessive flattery as potential manipulation.',
          '→ Set and enforce clear limits; "no" is a complete sentence.',
          '→ Surround yourself with people who reciprocate care — not just receive it.',
        ],
      };
    }
  }

  if (trait === 'psychopathy') {
    if (isHigh) {
      return {
        heading: 'Understanding Your Psychopathy Profile',
        body: `Your Psychopathy score is elevated — and this is the one that tends to generate the most alarm. Let's cut through it.\n\nSubclinical psychopathy measures emotional detachment, reduced fear response, and high stress tolerance. It is not the same as clinical psychopathy. The vast majority of people who score high on psychopathy measures live entirely ordinary — or extraordinarily successful — lives.\n\nWhat your score predicts: high stress tolerance. Situations that generate significant anxiety or dread in others may feel manageable — even unremarkable — to you. In high-pressure environments, that quality is genuinely valuable. Research consistently shows psychopathic traits are over-represented in surgery, law, finance, and executive leadership for exactly this reason.\n\nThe real risk for high scorers isn't antisocial behaviour — it's interpersonal misattunement. When you experience emotions at lower intensity, you can unconsciously underestimate how intensely others feel things.`,
        relationships: `In close relationships, emotional detachment can read as coldness or indifference even when you're not intending either. People closest to you may occasionally feel alone in the relationship — not because you've withdrawn, but because your emotional operating system runs differently.\n\nGrowth for this profile isn't about manufacturing emotions you don't have. It's about developing deliberate habits that compensate for lower automatic empathy: proactively checking in, naming what you observe, choosing reciprocity as a practice rather than waiting to feel moved by it.\n\nProfessionally, your stability under pressure is a genuine asset. The key is using it to carry others through difficulty, not just to outpace them.`,
        work: '',
        strategies: [
          '→ Develop a personal code of ethics in writing — treat it like a contract you honour.',
          "→ Practise \"reflective signalling\": name what you see others feeling, even if you don't feel it yourself.",
          '→ Build at least two relationships where you invest emotionally without any instrumental expectation.',
          "→ Use your stress tolerance as a resource for others, not just yourself — it's a genuine leadership edge.",
          '→ Seek feedback from trusted people about how your decisions land for them.',
          '→ Slow down decisions with significant impact on others — force a 48-hour window.',
        ],
      };
    } else if (isMedium) {
      return {
        heading: 'Your Psychopathy Profile — Moderate Range',
        body: `Your Psychopathy score is in the moderate range — you have reasonable emotional resilience without being detached. You can make hard calls without being paralysed, while still feeling the weight of decisions that affect others.\n\nThis is a functional balance. You're generally present and emotionally available, though under sustained stress you may become harder to reach. People close to you have probably noticed you go quieter when things get difficult.\n\nProfessionally, your stress tolerance is an asset without projecting the coldness that high scorers sometimes exhibit. You're typically seen as stable and dependable under pressure.`,
        relationships: `In relationships you're generally warm and reciprocal, with the capacity to hold difficult conversations without becoming overwhelmed. Your growth edge is staying emotionally accessible during extended high-pressure periods — when you go quiet, the people around you can mistake distance for disinterest.`,
        work: '',
        strategies: [
          '→ Notice when stress is making you emotionally withdraw — name it to the people close to you.',
          '→ Practise maintaining warmth under pressure as a deliberate skill.',
          "→ Use your stress tolerance to support others during crises — it's a rare quality.",
          '→ Check in proactively when you\'ve been in "head-down" work mode for extended periods.',
          '→ Build the habit of naming your internal state to close people, even briefly.',
        ],
      };
    } else {
      return {
        heading: 'What Your Psychopathy Profile Means for You',
        body: `Your Psychopathy score is genuinely low — you feel things deeply, both your own emotions and those of the people around you. You're likely described as warm, empathetic, and trustworthy. These qualities are rare and genuinely valuable.\n\nYour high empathy makes you an exceptional listener and a trusted confidant. It also means conflict is particularly costly for you, and you may avoid necessary confrontation to preserve peace.\n\nIn competitive or high-stakes environments, your emotional responsiveness can work against you if not managed. Others with lower empathy may read your reactions and use them strategically. Learning to maintain composure as a skill — not by suppressing feeling, but by choosing when to show it — gives you protection without costing you your warmth.`,
        relationships: `In relationships, your deep empathy creates genuine intimacy — you feel with people in a way that's rare. The vulnerability is that you can be manipulated through your compassion: people who present as struggling or misunderstood can engage your care before you've had time to verify their intentions.\n\nThe most important protection is calibrated trust: extend warmth freely, but extend access slowly.`,
        work: '',
        strategies: [
          '→ Trust your gut when something feels "off" — your empathy picks up on inconsistencies before your conscious mind does.',
          '→ Watch patterns of behaviour over time, not just individual incidents.',
          '→ Practise detaching emotionally when making decisions that affect your security.',
          "→ Don't mistake charm for trustworthiness — track what people do, not just what they say.",
          '→ Build your assertiveness: you can care about people while still enforcing limits.',
          '→ Give trust incrementally — small access first, more as it\'s earned.',
        ],
      };
    }
  }

  // Machiavellianism
  if (isHigh) {
    return {
      heading: 'Understanding Your Machiavellian Traits',
      body: `Your Machiavellianism score is your most strategically significant result. At this level, you think in systems and long games. Where others see a situation, you see a game — with players, incentives, and pressure points.\n\nMachiavellianism consistently outperforms in complex social negotiations. High scorers read people well, understand incentives and power dynamics intuitively, and are willing to deploy tactical deception when they believe the end justifies it.\n\nThe shadow side is trust. When you're always reading the angle, always thinking about what someone wants and how to use it, genuine intimacy starts to feel like exposure. There's also a risk of means-end reasoning becoming habitual — where short-term tactical moves accumulate into a reputation that closes more doors than it opens.\n\nThe most powerful strategists aren't just sharp — they're also trusted. Those two things can coexist, but they have to be built on purpose.`,
      relationships: `In close relationships, the texture of elevated Machiavellianism is often a trust asymmetry — you extend less trust to others than they extend to you. Perceptive people in your life can feel this, even when you don't consciously intend to signal it.\n\nProfessionally, you navigate politics better than most, negotiate effectively, and rarely get blindsided by hidden agendas. The risk: being known as willing to manipulate closes inner circles over time. Being known as strategic AND fair opens them.\n\nVoluntary transparency with safe people is the paradox: it often increases your influence, because trust is one of the few forms of power that compounds.`,
      work: '',
      strategies: [
        '→ Distinguish strategic thinking (healthy) from manipulation (corrosive) — write down your intent before acting.',
        '→ Invest deliberately in relationships that are not instrumental to any current goal.',
        '→ Audit your network: are most relationships transactional? Rebalance toward depth.',
        '→ Practise radical honesty in at least one close relationship.',
        '→ Before each strategic move: "Would I be comfortable if this person knew exactly what I was doing?"',
        '→ Track reputation over time — what is your pattern building or eroding?',
      ],
    };
  } else if (isMedium) {
    return {
      heading: 'Your Machiavellianism Profile — Moderate Range',
      body: `Your Machiavellianism score sits in the moderate range — strategic social intelligence without it being the dominant driver of your behaviour. You read incentives and power dynamics reasonably well and adjust your approach accordingly.\n\nThis is often simply practical wisdom: you understand that people are motivated by self-interest, that politics exist in organisations, and that naive trust can be costly. In the moderate range, this is an asset without the corrosive effects of high-end Machiavellianism.\n\nYour growth edge is noticing when strategic mode is bleeding into personal relationships where it doesn't belong — and choosing transparency there instead.`,
      relationships: `In relationships you're generally honest and direct, with a tendency toward tactical thinking in high-stakes situations. The people who know you well probably trust you, while people who don't yet know you may find you slightly hard to read.\n\nProfessionally, you're politically aware without being seen as playing angles. This is a valuable middle ground.`,
      work: '',
      strategies: [
        '→ Notice when you\'re "managing" a conversation vs genuinely having one — choose deliberately.',
        '→ Practise voluntary transparency in personal relationships: say what you want and why.',
        '→ Use your political awareness to protect your team, not just yourself.',
        '→ Build genuine alliances alongside any strategic ones.',
        '→ Regularly check: are the people I care about experiencing me as open or guarded?',
      ],
    };
  } else {
    return {
      heading: 'What Your Machiavellianism Profile Means for You',
      body: `Your Machiavellianism score is genuinely low — you default to honesty and good faith in your dealings with others. You assume people mean what they say and are often right. The exceptions can catch you badly off guard.\n\nYour straightforwardness builds real trust over time. People know where they stand with you, and that's genuinely rare. The risk is in competitive environments where not everyone has agreed to play by the same rules you do.\n\nLearning to think strategically — not manipulatively, but with awareness of how others' incentives shape their behaviour — would substantially protect your interests without changing who you are. Knowing the game exists isn't the same as playing it cynically.`,
      relationships: `In relationships your transparency is a genuine gift — people feel safe being honest with you because you're honest with them. The vulnerability is that highly strategic people may read your openness as a resource to be used rather than a quality to be respected.\n\nThe most useful skill here is calibrated disclosure: share freely with people who have earned it, more carefully with those who haven't yet.`,
      work: '',
      strategies: [
        '→ Assume in competitive contexts that not everyone shares your values — adjust accordingly.',
        "→ Don't disclose your full position in negotiations — share information deliberately.",
        '→ Ask "What does this person gain from this interaction?" before committing.',
        "→ Study basic negotiation: anchor high, don't accept first offers, know your walk-away point.",
        "→ Protect information about your plans and finances from people you haven't fully vetted.",
        '→ Distinguish between safe people (who deserve your openness) and everyone else.',
      ],
    };
  }
}

function ScoreBar({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  return (
    <View style={styles.barContainer}>
      <View
        style={[
          styles.barFill,
          { width: `${score}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export function DarkTriadReport({ scores, percentiles, subjectName }: ReportData) {
  const traits = [
    { key: 'narcissism' as const, label: 'Narcissism', color: COLORS.gold },
    { key: 'psychopathy' as const, label: 'Psychopathy', color: COLORS.red },
    { key: 'machiavellianism' as const, label: 'Machiavellianism', color: COLORS.purple },
  ];

  const dominantTrait = traits.reduce((a, b) =>
    scores[a.key] > scores[b.key] ? a : b
  );

  return (
    <Document>
      {/* ── Page 1: Title ── */}
      <Page size="A4" style={styles.titlePage}>
        <Text style={styles.brandBadge}>The Automated Doctor · Dark Triad Profiler</Text>
        <Text style={styles.reportTitle}>
          {subjectName ? `${subjectName}'s` : 'Your'}{'\n'}Dark Triad{'\n'}Full Report
        </Text>
        <Text style={styles.reportSubtitle}>
          Personalised psychological profile and strategy guide
        </Text>
        <View style={styles.divider} />

        <View style={styles.titleScoreRow}>
          <View style={styles.titleScoreBox}>
            <Text style={styles.titleScoreLabel}>Composite Score</Text>
            <Text style={[styles.titleScoreValue, { color: COLORS.red }]}>
              {scores.composite}
            </Text>
          </View>
          <View style={styles.titleScoreBox}>
            <Text style={styles.titleScoreLabel}>Dominant Trait</Text>
            <Text style={[styles.titleScoreValue, { color: dominantTrait.color, fontSize: 18 }]}>
              {dominantTrait.label}
            </Text>
          </View>
          <View style={styles.titleScoreBox}>
            <Text style={styles.titleScoreLabel}>Percentile</Text>
            <Text style={[styles.titleScoreValue, { color: COLORS.white }]}>
              {percentiles.composite}th
            </Text>
          </View>
        </View>

        <Text style={styles.titleFooter}>
          quiz.theautomateddoctor.com · Generated {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </Page>

      {/* ── Page 2: Score Summary ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTag}>Score Summary</Text>
          <Text style={styles.sectionTitle}>Your Dark Triad Profile</Text>
          <Text style={styles.sectionSubtitle}>
            Based on validated psychological scales (NPI-16, Levenson SRPS, MACH-IV).
            Your scores reflect tendencies measured against published normative data.
          </Text>
        </View>

        {traits.map(({ key, label, color }) => (
          <View key={key} style={[styles.traitCard, { borderLeftColor: color }]}>
            <View style={styles.traitCardHeader}>
              <View>
                <Text style={[styles.traitName, { color }]}>{label}</Text>
              </View>
              <View>
                <Text style={[styles.traitScore, { color }]}>{scores[key]}</Text>
                <Text style={styles.traitPercentile}>Top {100 - percentiles[key]}% · {percentiles[key]}th percentile</Text>
              </View>
            </View>
            <ScoreBar score={scores[key]} color={color} />
          </View>
        ))}

        <View style={[styles.traitCard, { borderLeftColor: COLORS.red }]}>
          <View style={styles.traitCardHeader}>
            <View>
              <Text style={[styles.traitName, { color: COLORS.red }]}>Composite Dark Triad</Text>
            </View>
            <View>
              <Text style={[styles.traitScore, { color: COLORS.red }]}>{scores.composite}</Text>
              <Text style={styles.traitPercentile}>{percentiles.composite}th percentile overall</Text>
            </View>
          </View>
          <ScoreBar score={scores.composite} color={COLORS.red} />
          <Text style={styles.traitBody}>
            {`Your composite score represents the equal-weighted average of all three Dark Triad traits.`}
            {scores.composite > 65
              ? ` At ${scores.composite}/100 you're in the elevated range — your results carry meaningful implications for how you engage in relationships and competitive environments. High composite scorers share a profile with many high-achieving, influential people. The differentiator is self-awareness.`
              : scores.composite >= 35
              ? ` At ${scores.composite}/100 you're in the moderate range — your trait expression is contextual and adaptive. You can access strategic thinking and emotional resilience when needed without being driven by them constantly.`
              : ` At ${scores.composite}/100 you're in the lower range — you navigate the world with genuine empathy and good faith. Your profile's primary implication is understanding the people around you who may score very differently.`
            }
          </Text>
        </View>
      </Page>

      {/* ── Pages 3–5: Per-Trait Deep Dives ── */}
      {traits.map(({ key, label, color }) => {
        const content = getTraitContent(key, scores[key]);
        return (
          <Page key={key} size="A4" style={styles.page}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTag, { color }]}>{label} · Score {scores[key]}/100</Text>
              <Text style={styles.sectionTitle}>{content.heading}</Text>
            </View>

            <Text style={[styles.traitBody, { marginBottom: 20 }]}>{content.body}</Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.strategiesTitle, { marginBottom: 6 }]}>In Relationships & Work</Text>
              <Text style={styles.traitBody}>{content.relationships}</Text>
            </View>

            <View style={styles.strategiesBox}>
              <Text style={styles.strategiesTitle}>
                {scores[key] > 65 ? 'Management Strategies' : 'Protection Strategies'}
              </Text>
              {content.strategies.map((s, i) => (
                <Text key={i} style={styles.strategyItem}>{s}</Text>
              ))}
            </View>
          </Page>
        );
      })}

      {/* ── Final Page: CTA ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTag}>What&apos;s Next</Text>
          <Text style={styles.sectionTitle}>Continue Your Journey</Text>
          <Text style={styles.sectionSubtitle}>
            Self-knowledge is the foundation of every meaningful change.
            You&apos;ve taken the first step — here&apos;s how to go deeper.
          </Text>
        </View>

        <View style={[styles.traitCard, { borderLeftColor: COLORS.red, marginBottom: 16 }]}>
          <Text style={[styles.traitName, { color: COLORS.red, marginBottom: 8 }]}>
            Recommended Reading
          </Text>
          <Text style={styles.traitBody}>
            {'· The Mask of Sanity — Hervey Cleckley (psychopathy foundations)\n'}
            {'· The Prince — Niccolò Machiavelli (strategic realism)\n'}
            {'· Why Is It Always About You? — Sandy Hotchkiss (narcissism in relationships)\n'}
            {'· Snakes in Suits — Paul Babiak & Robert Hare (dark triad in the workplace)\n'}
            {'· The Gift of Fear — Gavin de Becker (recognising manipulation)'}
          </Text>
        </View>

        <View style={[styles.traitCard, { borderLeftColor: '#333333', marginBottom: 32 }]}>
          <Text style={[styles.traitName, { marginBottom: 8 }]}>Challenge a Friend</Text>
          <Text style={styles.traitBody}>
            The real insight often comes from comparison. Challenge someone in your life to take the test —
            a partner, a colleague, a rival. The comparison view reveals dynamics you might not otherwise notice.
          </Text>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>The Automated Doctor</Text>
          <Text style={styles.ctaBody}>
            Evidence-based psychology for people who want to understand themselves and the people around them. No jargon. No fluff. Just the science, applied.{'\n\n'}Take the challenge link from your results page and send it to someone you&apos;re curious about. The comparison often reveals more than the individual scores.
          </Text>
          <Text style={styles.ctaUrl}>quiz.theautomateddoctor.com</Text>
          <Text style={styles.disclaimer}>
            This report is for educational and self-reflection purposes only. It is not a clinical assessment
            and should not be used as a basis for medical or psychological diagnosis. If you have concerns
            about your mental health, please consult a qualified mental health professional.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
