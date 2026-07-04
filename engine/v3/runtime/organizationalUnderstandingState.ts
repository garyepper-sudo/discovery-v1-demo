import type { OrganizationalConcept } from "../concepts/synthesizeOrganizationalConcepts";

export type UnderstandingStateStatus =
  | "emerging"
  | "forming"
  | "stable"
  | "weakening"
  | "retired";

export type UnderstandingStateConfidenceBand = "low" | "medium" | "high";

export type OrganizationalUnderstandingItem = {
  id: string;
  statement: string;
  summary: string;

  confidence: number;
  confidenceBand: UnderstandingStateConfidenceBand;
  status: UnderstandingStateStatus;

  firstSeenAt: string;
  lastUpdatedAt: string;
  supportCount: number;

  evidenceIds: string[];
  observationIds: string[];
  beliefIds: string[];
  themeIds: string[];
  mechanismIds: string[];
  contradictionIds: string[];

  whyItMatters: string;
  openQuestions: string[];
  implications: string[];

  history: {
    date: string;
    event:
      | "created"
      | "strengthened"
      | "weakened"
      | "stabilized"
      | "retired";
    previousConfidence?: number;
    nextConfidence: number;
    reason: string;
  }[];
};

export type OrganizationalConfidenceArea = {
  id: string;
  label: string;
  confidence: number;
  confidenceBand: UnderstandingStateConfidenceBand;
  relatedUnderstandingIds: string[];
};

export type OrganizationalOpenQuestion = {
  id: string;
  question: string;
  importance: number;
  relatedUnderstandingIds: string[];
  firstRaisedAt: string;
  lastSeenAt: string;
};

export type OrganizationalStrategicRisk = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  relatedUnderstandingIds: string[];
  evidenceIds: string[];
};

export type OrganizationalUnderstandingEvolutionEvent = {
  id: string;
  date: string;
  type:
    | "new_understanding"
    | "strengthened_understanding"
    | "weakened_understanding"
    | "stabilized_understanding"
    | "retired_understanding";
  title: string;
  description: string;
  relatedUnderstandingIds: string[];
};

export type OrganizationalUnderstandingState = {
  organizationId: string;
  name?: string;
  industry?: string;
  website?: string;

  lastUpdatedAt: string;

  currentUnderstandings: OrganizationalUnderstandingItem[];
  organizationalConcepts?: OrganizationalConcept[];

  confidenceLandscape: OrganizationalConfidenceArea[];
  activeQuestions: OrganizationalOpenQuestion[];
  strategicRisks: OrganizationalStrategicRisk[];
  evolutionHistory: OrganizationalUnderstandingEvolutionEvent[];

  health: {
    maturity: number;
    coherence: number;
    uncertainty: number;
    adaptation: number;
  };
};

export function getConfidenceBand(
  confidence: number
): UnderstandingStateConfidenceBand {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.45) return "medium";
  return "low";
}

export function getUnderstandingStatus(params: {
  confidence: number;
  supportCount: number;
}): UnderstandingStateStatus {
  const { confidence, supportCount } = params;

  if (supportCount >= 4 && confidence >= 0.75) return "stable";
  if (supportCount >= 2) return "forming";
  return "emerging";
}

export function createEmptyOrganizationalUnderstandingState(params: {
  organizationId: string;
  name?: string;
  industry?: string;
  website?: string;
  now: string;
}): OrganizationalUnderstandingState {
  return {
    organizationId: params.organizationId,
    name: params.name,
    industry: params.industry,
    website: params.website,
    lastUpdatedAt: params.now,

    currentUnderstandings: [],
    organizationalConcepts: [],

    confidenceLandscape: [],
    activeQuestions: [],
    strategicRisks: [],
    evolutionHistory: [],

    health: {
      maturity: 0,
      coherence: 0,
      uncertainty: 1,
      adaptation: 0,
    },
  };
}