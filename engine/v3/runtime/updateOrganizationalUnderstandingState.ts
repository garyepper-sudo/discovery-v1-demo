import type { DiscoveryV3Result } from "../types";
import {
  createDefaultUnderstandingMechanism,
  createUnderstandingTitle,
  getConfidenceBand,
  getUnderstandingStatus,
  OrganizationalUnderstandingItem,
  OrganizationalUnderstandingState,
} from "./organizationalUnderstandingState";

function makeUnderstandingId(index: number): string {
  return `understanding-${Date.now()}-${index}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function deriveStrength(confidence: number, supportCount: number): number {
  return clamp(confidence * 0.75 + Math.min(0.2, supportCount * 0.05));
}

function deriveStability(confidence: number, supportCount: number): number {
  return clamp(confidence * 0.6 + Math.min(0.3, supportCount * 0.075));
}

export function updateOrganizationalUnderstandingState(params: {
  state: OrganizationalUnderstandingState;
  result: DiscoveryV3Result;
  now: string;
}): OrganizationalUnderstandingState {
  const { state, result, now } = params;

  const newItems: OrganizationalUnderstandingItem[] = result.beliefs.map(
    (belief, index) => {
      const confidence = belief.confidence ?? 0.6;
      const supportCount = 1;
      const statement = belief.headline;
      const summary = belief.explanation || belief.headline;

      return {
        id: makeUnderstandingId(index),

        title: createUnderstandingTitle(statement),
        statement,
        summary,
        mechanism: createDefaultUnderstandingMechanism(statement),

        confidence,
        confidenceBand: getConfidenceBand(confidence),
        strength: deriveStrength(confidence, supportCount),
        stability: deriveStability(confidence, supportCount),

        status: getUnderstandingStatus({ confidence, supportCount }),

        firstSeenAt: now,
        lastUpdatedAt: now,
        supportCount,

        evidenceIds: belief.supportingEvidenceIds || [],
        observationIds: [],
        beliefIds: [belief.id],
        themeIds: belief.themeIds || [],
        mechanismIds: belief.mechanismIds || [],
        contradictionIds: belief.contradictionIds || [],

        supportingDynamics: [],
        supportingCapabilities: [],
        investigationIds: [],

        whyItMatters:
          belief.supportingReasons?.[0] ||
          "This understanding may affect how the organization interprets its current situation.",

        openQuestions: belief.nextQuestions || [],
        implications: belief.concerns || [],

        history: [
          {
            date: now,
            event: "created",
            nextConfidence: confidence,
            reason: "This understanding emerged from the latest investigation.",
          },
        ],
      };
    }
  );

  const currentUnderstandings = [...state.currentUnderstandings, ...newItems];

  return {
    ...state,
    lastUpdatedAt: now,
    currentUnderstandings,
    confidenceLandscape: currentUnderstandings.map((item) => ({
      id: `confidence-${item.id}`,
      label: item.statement,
      confidence: item.confidence,
      confidenceBand: item.confidenceBand,
      relatedUnderstandingIds: [item.id],
    })),
    activeQuestions: currentUnderstandings.flatMap((item) =>
      item.openQuestions.map((question, index) => ({
        id: `question-${item.id}-${index}`,
        question,
        importance: item.confidence,
        relatedUnderstandingIds: [item.id],
        firstRaisedAt: item.firstSeenAt,
        lastSeenAt: item.lastUpdatedAt,
      }))
    ),
    strategicRisks: currentUnderstandings
      .filter((item) => item.implications.length > 0)
      .map((item) => ({
        id: `risk-${item.id}`,
        title: item.statement,
        description: item.implications[0],
        severity: item.confidence >= 0.75 ? "high" : "medium",
        confidence: item.confidence,
        relatedUnderstandingIds: [item.id],
        evidenceIds: item.evidenceIds,
      })),
    evolutionHistory: [
      ...state.evolutionHistory,
      ...newItems.map((item) => ({
        id: `evolution-${item.id}`,
        date: now,
        type: "new_understanding" as const,
        title: item.statement,
        description: "A new organizational understanding was created.",
        relatedUnderstandingIds: [item.id],
      })),
    ],
    health: {
      maturity: Math.min(1, currentUnderstandings.length / 8),
      coherence: Math.min(1, currentUnderstandings.length / 6),
      uncertainty:
        currentUnderstandings.length === 0
          ? 1
          : 1 -
            currentUnderstandings.reduce(
              (sum, item) => sum + item.confidence,
              0
            ) /
              currentUnderstandings.length,
      adaptation: Math.min(1, state.evolutionHistory.length / 8),
    },
  };
}