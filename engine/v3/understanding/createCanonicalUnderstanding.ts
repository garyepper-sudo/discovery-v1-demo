import {
  CanonicalUnderstanding,
  createUnderstandingId,
} from "./canonicalUnderstanding";
import {
  createUnderstandingMechanism,
  createUnderstandingTitle,
  normalizeUnderstandingStatement,
} from "./normalizeUnderstanding";
import {
  calibrateUnderstandingConfidence,
  deriveUnderstandingStability,
  deriveUnderstandingStrength,
} from "./calibrateUnderstandingConfidence";

export function createCanonicalUnderstanding(params: {
  rawStatement: string;
  supportingEvidence?: string[];
  supportingDynamics?: string[];
  supportingCapabilities?: string[];
  contradictoryEvidence?: string[];
  investigationId?: string;
  existingConfidence?: number;
}): CanonicalUnderstanding {
  const now = new Date().toISOString();

  const statement = normalizeUnderstandingStatement(params.rawStatement);
  const confidence = calibrateUnderstandingConfidence({
    evidenceCount: params.supportingEvidence?.length ?? 0,
    investigationCount: params.investigationId ? 1 : 0,
    contradictionCount: params.contradictoryEvidence?.length ?? 0,
    supportingDynamicsCount: params.supportingDynamics?.length ?? 0,
    existingConfidence: params.existingConfidence,
  });

  return {
    id: createUnderstandingId(statement),
    title: createUnderstandingTitle(statement),
    statement,
    mechanism: createUnderstandingMechanism(statement),

    confidence,
    strength: deriveUnderstandingStrength(confidence),
    stability: deriveUnderstandingStability({
      investigationCount: params.investigationId ? 1 : 0,
      evidenceCount: params.supportingEvidence?.length ?? 0,
      contradictionCount: params.contradictoryEvidence?.length ?? 0,
    }),

    status:
      confidence >= 0.82
        ? "reinforced"
        : confidence >= 0.66
          ? "active"
          : "emerging",

    supportingEvidence: params.supportingEvidence ?? [],
    supportingDynamics: params.supportingDynamics ?? [],
    supportingCapabilities: params.supportingCapabilities ?? [],
    contradictoryEvidence: params.contradictoryEvidence ?? [],

    investigationIds: params.investigationId ? [params.investigationId] : [],

    createdAt: now,
    updatedAt: now,
  };
}