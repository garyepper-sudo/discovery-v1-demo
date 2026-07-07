export type OrganizationalTheoryStatus =
  | "new"
  | "strengthening"
  | "stable"
  | "weakening"
  | "contradicted"
  | "retired";

export type OrganizationalTheory = {
  id: string;
  title: string;
  explanation: string;

  confidence: number;
  stability: number;
  novelty: number;

  supportingMechanisms: string[];
  supportingBeliefs: string[];
  supportingConcepts: string[];
  supportingEvidence: string[];

  competingTheories: string[];

  firstObserved: string;
  lastConfirmed: string;
  investigationCount: number;

  status: OrganizationalTheoryStatus;
};

export type OrganizationalTheoryEvolution = {
  theoryId: string;
  previousConfidence: number;
  currentConfidence: number;
  delta: number;
  status: OrganizationalTheoryStatus;
  reason: string;
};

export type UnderstandingEvolution = {
  strengthened: string[];
  weakened: string[];
  retired: string[];
  new: string[];
  merged: string[];
  contradicted: string[];
  summary: string;
};

export type OrganizationalMemoryMaturity = {
  score: number;
  persistentBeliefs: number;
  recurringMechanisms: number;
  stableTheories: number;
  historicalContinuity: number;
  contradictionResolution: number;
  understandingReuse: number;
  conceptStability: number;
  reasons: string[];
};