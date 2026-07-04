import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3Theme,
  V3Understanding,
} from "../types";

export type UnderstandingEngineInput = {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
};

export type PrioritizedUnderstanding = {
  primaryBelief?: V3Belief;
  primaryTheme?: V3Theme;
  primaryContradiction?: V3Contradiction;
  strongestEvidence?: V3Evidence;
  confidence: number;
};

export type CompressedUnderstanding = {
  headline: string;
  coreClaim: string;
  strategicMeaning: string;
  confidence: number;
};

export type UnderstandingExplanation = {
  confidenceLabel: "early" | "moderate" | "strong";
  whyWeBelieveIt: string;
  uncertainty: string;
};

export type UnderstandingRecommendation = {
  nextQuestion: string;
  mondayMove: string;
  watchSignal: string;
};

export type ExecutiveNarrative = {
  headline: string;
  body: string;
  confidence: number;
  currentAssessment: string;
  suggestedNextQuestion: string;
  nextMoves: string[];
};

/* =====================================================
   Sprint 20 — Persistent Organizational Understanding

   These types describe what Discovery learns over time.
   The existing types above describe one investigation.
   ===================================================== */

export type StabilityLevel = "emerging" | "forming" | "stable";

export type ChangeDirection =
  | "new"
  | "strengthened"
  | "weakened"
  | "contradicted"
  | "resolved"
  | "unchanged";

export type PersistentEvidence = {
  id: string;
  uploadId: string;
  text: string;
  sourceTitle?: string;
  createdAt: string;
  linkedObservationIds: string[];
  linkedBeliefIds: string[];
  linkedThemeIds: string[];
};

export type PersistentObservation = {
  id: string;
  uploadId: string;
  statement: string;
  implication: string;
  confidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  evidenceIds: string[];
  relatedThemeIds: string[];
  relatedBeliefIds: string[];
  occurrenceCount: number;
};

export type PersistentTheme = {
  id: string;
  label: string;
  summary: string;
  confidence: number;
  stability: StabilityLevel;
  firstSeenAt: string;
  lastSeenAt: string;
  evidenceIds: string[];
  observationIds: string[];
  occurrenceCount: number;
};

export type PersistentBelief = {
  id: string;
  statement: string;
  rationale: string;
  confidence: number;
  stability: StabilityLevel;
  firstSeenAt: string;
  lastSeenAt: string;
  evidenceIds: string[];
  observationIds: string[];
  themeIds: string[];
  occurrenceCount: number;
};

export type PersistentContradiction = {
  id: string;
  statement: string;
  tension: string;
  confidence: number;
  status: "open" | "softened" | "resolved";
  firstSeenAt: string;
  lastSeenAt: string;
  evidenceIds: string[];
  observationIds: string[];
  relatedBeliefIds: string[];
};

export type PersistentMechanism = {
  id: string;
  label: string;
  description: string;
  confidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  evidenceIds: string[];
  observationIds: string[];
  relatedBeliefIds: string[];
};

export type StablePattern = {
  id: string;
  label: string;
  description: string;
  confidence: number;
  stability: StabilityLevel;
  firstSeenAt: string;
  lastSeenAt: string;
  relatedObservationIds: string[];
  relatedBeliefIds: string[];
  relatedThemeIds: string[];
};

export type OpenQuestion = {
  id: string;
  question: string;
  reason: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  relatedObservationIds: string[];
  relatedBeliefIds: string[];
  relatedContradictionIds: string[];
};

export type OrganismNode = {
  id: string;
  kind:
    | "observation"
    | "belief"
    | "theme"
    | "contradiction"
    | "mechanism"
    | "stablePattern";
  label: string;
  strength: number;
  stability: StabilityLevel;
};

export type OrganismLink = {
  id: string;
  sourceId: string;
  targetId: string;
  kind: "supports" | "tensions" | "explains" | "clusters";
  strength: number;
};

export type PersistentOrganismState = {
  version: number;
  nodes: OrganismNode[];
  links: OrganismLink[];
  recentChangeNodeIds: string[];
};

export type UnderstandingState = {
  organizationId: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  events: UnderstandingEvent[];

  evidenceIndex: PersistentEvidence[];
  observations: PersistentObservation[];
  themes: PersistentTheme[];
  beliefs: PersistentBelief[];
  contradictions: PersistentContradiction[];
  mechanisms: PersistentMechanism[];

  stablePatterns: StablePattern[];
  openQuestions: OpenQuestion[];

  organism: PersistentOrganismState;
};

export type ObservationChange = {
  observationId: string;
  statement: string;
  direction: ChangeDirection;
  previousConfidence: number;
  nextConfidence: number;
  reason: string;
};

export type BeliefChange = {
  beliefId: string;
  statement: string;
  direction: ChangeDirection;
  previousConfidence: number;
  nextConfidence: number;
  reason: string;
};

export type ThemeChange = {
  themeId: string;
  label: string;
  direction: ChangeDirection;
  previousConfidence: number;
  nextConfidence: number;
  reason: string;
};

export type ContradictionChange = {
  contradictionId: string;
  statement: string;
  direction: ChangeDirection;
  reason: string;
};

export type StablePatternChange = {
  stablePatternId: string;
  label: string;
  direction: ChangeDirection;
  reason: string;
};

export type ExecutiveChangeNarrative = {
  headline: string;
  summary: string;
  whatChanged: string[];
  whyItMatters: string[];
  suggestedQuestions: string[];
};

export type UnderstandingDelta = {
  uploadId: string;
  createdAt: string;

  addedObservations: PersistentObservation[];
  strengthenedObservations: ObservationChange[];

  addedBeliefs: PersistentBelief[];
  strengthenedBeliefs: BeliefChange[];
  weakenedBeliefs: BeliefChange[];

  addedThemes: PersistentTheme[];
  strengthenedThemes: ThemeChange[];

  newContradictions: PersistentContradiction[];
  resolvedContradictions: ContradictionChange[];

  newMechanisms: PersistentMechanism[];

  newStablePatterns: StablePattern[];
  changedStablePatterns: StablePatternChange[];

  executiveNarrative: ExecutiveChangeNarrative;
};

export type UnderstandingEvent = {
  id: string;
  uploadId: string;
  organizationId: string;
  timestamp: string;

  eventType: "upload" | "manual_note" | "system_update";

  summary: string;

  addedObservationIds: string[];
  strengthenedObservationIds: string[];

  addedBeliefIds: string[];
  strengthenedBeliefIds: string[];

  delta: UnderstandingDelta;
};