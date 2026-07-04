import type { OrganizationalConcept } from "../concepts/synthesizeOrganizationalConcepts";

export type UnderstandingStateStatus =
  | "emerging"
  | "forming"
  | "stable"
  | "weakening"
  | "retired";

export type UnderstandingStateConfidenceBand = "low" | "medium" | "high";

export type OrganizationalUnderstandingHistoryEvent = {
  date: string;
  event:
    | "created"
    | "strengthened"
    | "weakened"
    | "stabilized"
    | "merged"
    | "retired";
  previousConfidence?: number;
  nextConfidence: number;
  reason: string;
};

export type OrganizationalUnderstandingItem = {
  id: string;

  title: string;
  statement: string;
  summary: string;
  mechanism: string;

  confidence: number;
  confidenceBand: UnderstandingStateConfidenceBand;
  strength: number;
  stability: number;

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

  supportingDynamics: string[];
  supportingCapabilities: string[];
  investigationIds: string[];

  whyItMatters: string;
  openQuestions: string[];
  implications: string[];

  history: OrganizationalUnderstandingHistoryEvent[];
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
    | "merged_understanding"
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
  organizationalConcepts: OrganizationalConcept[];

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

  if (confidence < 0.35) return "weakening";
  if (supportCount >= 4 && confidence >= 0.75) return "stable";
  if (supportCount >= 2) return "forming";

  return "emerging";
}

export function createUnderstandingTitle(statement: string): string {
  const cleaned = statement.replace(/[.]/g, "").trim();

  if (!cleaned) return "Unclear Organizational Understanding";

  return cleaned
    .split(/\s+/)
    .slice(0, 6)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function createDefaultUnderstandingMechanism(statement: string): string {
  const normalized = statement.toLowerCase();

  if (
    normalized.includes("decision") ||
    normalized.includes("authority") ||
    normalized.includes("approval")
  ) {
    return "Decision rights appear concentrated in a way that shapes speed, accountability, and escalation.";
  }

  if (
    normalized.includes("execution") ||
    normalized.includes("delivery") ||
    normalized.includes("implementation")
  ) {
    return "Execution patterns suggest a gap between intent, coordination, and operational follow-through.";
  }

  if (
    normalized.includes("knowledge") ||
    normalized.includes("memory") ||
    normalized.includes("retained")
  ) {
    return "Organizational knowledge appears to depend on people more than durable systems.";
  }

  if (
    normalized.includes("coordination") ||
    normalized.includes("ownership") ||
    normalized.includes("cross")
  ) {
    return "Ownership and coordination boundaries appear to shape how work moves across functions.";
  }

  return "Repeated evidence suggests this may be a stable feature of how the organization operates.";
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