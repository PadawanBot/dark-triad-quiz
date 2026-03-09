/* eslint-disable react/no-unescaped-entities */
// Reality Grounding Guide — PDF for Gaslighting Quiz
// Server-side only — do NOT import in client components

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { GasBand } from './gasScoring';
import { resultsCopy, SAFETY_RESOURCES } from './gasScoring';

const C = {
  bg: '#ffffff',
  darkBg: '#0a0a0a',
  teal: '#0d9488',
  amber: '#d97706',
  red: '#dc2626',
  white: '#ffffff',
  black: '#111111',
  gray: '#555555',
  lightGray: '#888888',
  border: '#e0e0e0',
  muted: '#666666',
  accent: '#0d9488',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    padding: 48,
    fontFamily: 'Helvetica',
  },
  titlePage: {
    backgroundColor: C.darkBg,
    padding: 48,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  brandBadge: {
    fontSize: 9,
    color: C.teal,
    letterSpacing: 3,
    marginBottom: 40,
  },
  reportTitle: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    marginBottom: 12,
    lineHeight: 1.2,
  },
  reportSubtitle: {
    fontSize: 13,
    color: '#aaaaaa',
    marginBottom: 36,
    lineHeight: 1.5,
  },
  divider: {
    height: 2,
    backgroundColor: C.teal,
    width: 60,
    marginBottom: 36,
  },
  bandBox: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    marginBottom: 36,
  },
  bandLabel: {
    fontSize: 8,
    color: '#666666',
    letterSpacing: 2,
    marginBottom: 8,
  },
  bandValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
  },
  titleFooter: {
    fontSize: 8,
    color: '#444444',
    marginTop: 'auto',
    lineHeight: 1.6,
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 12,
  },
  // Content styles
  sectionTag: {
    fontSize: 8,
    color: C.teal,
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginBottom: 12,
  },
  body: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.8,
    marginBottom: 14,
  },
  callout: {
    padding: 16,
    backgroundColor: '#f5fafa',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: C.teal,
    marginBottom: 20,
  },
  calloutText: {
    fontSize: 10,
    color: '#1a4040',
    lineHeight: 1.7,
  },
  dayTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginBottom: 4,
  },
  dayBody: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.7,
    marginBottom: 16,
  },
  dayTask: {
    fontSize: 10,
    color: C.teal,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 14,
  },
  safetyBox: {
    padding: 18,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 20,
  },
  safetyTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.red,
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 10,
    color: '#7f1d1d',
    lineHeight: 1.7,
  },
  disclaimer: {
    fontSize: 7.5,
    color: '#aaaaaa',
    lineHeight: 1.6,
    marginTop: 8,
  },
});

function bandColor(band: GasBand): string {
  if (band === 'few') return C.teal;
  if (band === 'some') return C.amber;
  return C.red;
}

function bandDisplayName(band: GasBand): string {
  if (band === 'few') return 'Few Indicators';
  if (band === 'some') return 'Some Indicators';
  return 'Many Indicators';
}

interface GuideProps {
  band: GasBand;
  totalScore: number;
  safetyYes: boolean;
}

export function RealityGroundingGuide({ band, totalScore, safetyYes }: GuideProps) {
  const copy = resultsCopy(band);

  return (
    <Document>
      {/* ── Page 1: Cover ── */}
      <Page size="A4" style={styles.titlePage}>
        <Text style={styles.brandBadge}>THE AUTOMATED DOCTOR · GASLIGHTING QUIZ</Text>
        <Text style={styles.reportTitle}>
          Reality Grounding Guide
        </Text>
        <Text style={styles.reportSubtitle}>
          7 days of exercises to reconnect with your own perception,
          rebuild trust in your judgment, and find clarity.
        </Text>
        <View style={styles.divider} />

        <View style={styles.bandBox}>
          <Text style={styles.bandLabel}>YOUR RESULT</Text>
          <Text style={[styles.bandValue, { color: bandColor(band) }]}>
            {bandDisplayName(band)}
          </Text>
          <Text style={[styles.body, { color: '#aaaaaa', marginTop: 8, marginBottom: 0 }]}>
            Score: {totalScore}/34
          </Text>
        </View>

        <Text style={[styles.body, { color: '#aaaaaa' }]}>
          {copy.body}
        </Text>

        {safetyYes && (
          <View style={[styles.safetyBox, { backgroundColor: '#1a0a0a', borderColor: '#7f1d1d' }]}>
            <Text style={[styles.safetyTitle, { color: '#ef4444' }]}>
              Important — Safety Resources
            </Text>
            <Text style={[styles.safetyText, { color: '#fca5a5' }]}>
              {SAFETY_RESOURCES}
            </Text>
          </View>
        )}

        <Text style={styles.titleFooter}>
          {`quiz.theautomateddoctor.com/gaslighting\nGenerated ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nDisclaimer: This guide is for educational and self-reflection purposes only. It is not a clinical assessment, diagnosis, or confirmation of any person\'s intent or behaviour. If you have concerns about your mental health or safety, please consult a qualified professional.`}
        </Text>
      </Page>

      {/* ── Page 2: What Gaslighting Is (and What It Isn't) ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTag}>UNDERSTANDING</Text>
        <Text style={styles.sectionTitle}>What Gaslighting Is — and What It Isn't</Text>

        <Text style={styles.body}>
          Gaslighting is a pattern — not a single incident. It describes a dynamic in which one person's perception of reality is repeatedly called into question, most often through denial, deflection, minimisation, or counter-accusation. Over time, this pattern erodes confidence in one's own judgment.
        </Text>

        <Text style={styles.body}>
          The term comes from a 1944 film in which a husband systematically manipulates his wife into doubting her sanity. In everyday relationships, it rarely looks this dramatic. It can look like: always being told your memory is wrong. Always being the "too sensitive" one. Consistently feeling confused after a conversation you expected to be straightforward.
        </Text>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Important: This quiz measures patterns you have experienced — not confirmation of anyone's intent. Gaslighting can occur without conscious intent. What matters is whether these patterns are present and how they are affecting you.
          </Text>
        </View>

        <Text style={styles.body}>
          The goal of this guide is not to help you reach a verdict about another person. It is to help you reconnect with your own perception, rebuild trust in your judgment, and get clearer on what you actually want and need.
        </Text>

        <Text style={styles.body}>
          Reality grounding is a set of practical skills — things you can do to reduce the disorientation that comes with sustained self-doubt. They work whether or not you've experienced gaslighting specifically. They work any time your sense of what's real has become unstable.
        </Text>

        <Text style={[styles.body, { color: C.muted, fontSize: 9, marginTop: 8 }]}>
          Disclaimer: This guide is for educational purposes only. It is not a clinical assessment or a diagnosis. If you are experiencing significant distress, please speak with a qualified mental health professional.
        </Text>
      </Page>

      {/* ── Pages 3–9: 7-Day Micro-Plan ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTag}>7-DAY MICRO-PLAN</Text>
        <Text style={styles.sectionTitle}>Days 1–3: Anchor to What You Know</Text>
        <Text style={[styles.body, { color: C.muted, marginBottom: 20 }]}>
          The first three days focus on re-establishing a baseline — a private record of what you actually experience, separate from anyone else's interpretation.
        </Text>

        <Text style={styles.dayTitle}>Day 1 — Start a Reality Log</Text>
        <Text style={styles.dayBody}>
          Get a notebook or a private notes app. Each time something happens that later gets denied or reframed, write it down immediately: what happened, what was said, how you felt. No interpretation needed — just the facts. Date and time-stamp each entry. This isn't about building a case against anyone. It's about giving your memory a stable home outside of other people's influence.
        </Text>
        <Text style={styles.dayTask}>Today's task: Set up your Reality Log. Write one entry — something that happened recently that you've been second-guessing.</Text>

        <Text style={styles.dayTitle}>Day 2 — Name Your Signals</Text>
        <Text style={styles.dayBody}>
          Your body often knows before your mind catches up. Gaslighting tends to produce distinctive physical sensations: a low-grade confusion, a tightness in the chest, a vague sense that something doesn't add up even when you can't identify what. Start noticing these signals without trying to fix them yet. They are information.
        </Text>
        <Text style={styles.dayTask}>Today's task: Write down 3 physical sensations you notice during or after difficult conversations. Name them without judgment.</Text>

        <Text style={styles.dayTitle}>Day 3 — The 24-Hour Memory Test</Text>
        <Text style={styles.dayBody}>
          Pick a specific incident from the past month that left you feeling confused about what actually happened. Write your version of events as completely as you can — not what you were told happened, your version. Then put it aside for 24 hours. When you return to it, notice: does it still feel accurate? This exercise isn't about being right. It's about practising trust in your own account.
        </Text>
        <Text style={styles.dayTask}>Today's task: Write your account of one confusing incident. Seal it in an envelope or move it to a locked folder. Read it tomorrow.</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTag}>7-DAY MICRO-PLAN</Text>
        <Text style={styles.sectionTitle}>Days 4–5: Rebuild Your Reference Points</Text>
        <Text style={[styles.body, { color: C.muted, marginBottom: 20 }]}>
          When our perception of reality is constantly challenged, we often lose track of our values, preferences, and sense of self. These exercises help you rebuild those reference points.
        </Text>

        <Text style={styles.dayTitle}>Day 4 — What Do You Actually Think?</Text>
        <Text style={styles.dayBody}>
          Take a topic — it can be small: a film you watched, a decision you made recently, a preference about how to spend a weekend. Write down what you actually think about it, without editing for what someone else would approve of. Notice if you have immediate urges to qualify your opinion, downplay it, or imagine how it would be received. Those urges are data.
        </Text>
        <Text style={styles.dayTask}>Today's task: Write three things you genuinely think, prefer, or want — with no qualification. Just your unfiltered take.</Text>

        <Text style={styles.dayTitle}>Day 5 — Trusted Witnesses</Text>
        <Text style={styles.dayBody}>
          Identify 1–2 people in your life whose judgment you trust — ideally people who knew you before the relationship or situation in question began. Not to complain or build a case, but to reality-check. Ask one of them: "Do I seem different to you lately? More uncertain? Less like myself?" Their answer, however gentle, is important information.
        </Text>
        <Text style={styles.dayBody}>
          If you don't currently have people like this in your life, that is also information. Isolation — whether imposed or gradual — is one of the conditions that makes gaslighting dynamics more effective.
        </Text>
        <Text style={styles.dayTask}>Today's task: Name your 1–2 trusted witnesses. If you feel comfortable, reach out to one of them today — even just to reconnect.</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTag}>7-DAY MICRO-PLAN</Text>
        <Text style={styles.sectionTitle}>Days 6–7: Decide What You Want</Text>
        <Text style={[styles.body, { color: C.muted, marginBottom: 20 }]}>
          The final two days are about clarity — not about what to do, but about what you actually want and what would need to be true for you to feel safe and stable.
        </Text>

        <Text style={styles.dayTitle}>Day 6 — What Would You Need?</Text>
        <Text style={styles.dayBody}>
          Imagine a version of this relationship or situation in which you felt consistently safe and believed. What would that look like? Be specific: "I would need to be able to raise a concern without it being turned back on me." "I would need my memory to be taken seriously." "I would need to feel like I'm not going crazy." Write these down as clearly as you can. These are your baseline requirements — not demands, not a wishlist, just the minimum conditions for your own stability.
        </Text>
        <Text style={styles.dayTask}>Today's task: Write 3–5 "I would need..." statements. Be as specific as possible.</Text>

        <Text style={styles.dayTitle}>Day 7 — Review and Decide Your Next Step</Text>
        <Text style={styles.dayBody}>
          Review your Reality Log, your memory test entry, and your "I would need" statements. You don't have to have all the answers today. But you do need one small, concrete next step — something you can do in the next 72 hours. It might be: "I'm going to speak to a therapist." "I'm going to tell one person what's been happening." "I'm going to set one specific limit and see how it's received." One step. That's all.
        </Text>
        <Text style={styles.dayTask}>Today's task: Write your one next step. Tell one trusted person what it is, if possible. This creates accountability and makes it real.</Text>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            A note on professional support: If what you've been experiencing is severe, persistent, or is affecting your safety, a therapist who specialises in relationship patterns and trauma can provide support that a seven-day guide cannot. You deserve that level of care.
          </Text>
        </View>

        {safetyYes && (
          <View style={styles.safetyBox}>
            <Text style={styles.safetyTitle}>Safety Resources</Text>
            <Text style={styles.safetyText}>{SAFETY_RESOURCES}</Text>
          </View>
        )}
      </Page>

      {/* ── Final page: What's Next ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTag}>CONTINUING YOUR JOURNEY</Text>
        <Text style={styles.sectionTitle}>Where to Go From Here</Text>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Taking this quiz is a form of paying attention. Paying attention is how clarity begins.
          </Text>
        </View>

        <Text style={styles.body}>
          Self-knowledge — even the uncomfortable kind — is the foundation of every meaningful change. The fact that you took this quiz and are reading this guide suggests you already know something feels off. Trust that.
        </Text>

        <Text style={[styles.dayTitle, { marginTop: 8 }]}>Recommended Reading</Text>
        <Text style={styles.body}>
          {'· Why Does He Do That? — Lundy Bancroft (patterns of control in relationships)\n'}
          {'· The Gaslight Effect — Robin Stern (practical guide to recognising and recovering from gaslighting)\n'}
          {'· Healing from Hidden Abuse — Shannon Thomas (psychological abuse recovery)\n'}
          {'· The Body Keeps the Score — Bessel van der Kolk (trauma and body-based recovery)\n'}
          {'· Set Boundaries, Find Peace — Nedra Tawwab (clear, practical boundary-setting)'}
        </Text>

        <Text style={[styles.dayTitle, { marginTop: 16 }]}>The Automated Doctor</Text>
        <Text style={styles.body}>
          Evidence-based psychology for people who want to understand themselves and the relationships around them. No jargon. No fluff. Just the science, applied.
        </Text>
        <Text style={[styles.body, { color: C.teal, fontFamily: 'Helvetica-Bold' }]}>
          quiz.theautomateddoctor.com/gaslighting
        </Text>

        <Text style={styles.disclaimer}>
          {`Disclaimer: This guide is for educational and self-reflection purposes only. It is not a clinical assessment, diagnosis, or confirmation of any person's intent or behaviour. It does not constitute medical or psychological advice. If you are experiencing distress or safety concerns, please consult a qualified mental health professional or contact emergency services.\n\nThe Automated Doctor · quiz.theautomateddoctor.com · For educational purposes only`}
        </Text>
      </Page>
    </Document>
  );
}
