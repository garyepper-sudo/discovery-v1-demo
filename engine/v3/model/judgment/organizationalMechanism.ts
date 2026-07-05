import type { KnowledgeReference } from "../../cognition/cognitiveGraph";

export type OrganizationalMechanismType =
  | "decisionLatency"
  | "coordinationBreakdown"
  | "governanceFriction"
  | "knowledgeConcentration"
  | "executionDrag"
  | "feedbackFailure"
  | "capabilityConstraint"
  | "priorityConflict"
  | "accountabilityGap"
  | "resourceConstraint"

  // Legacy mechanism types (temporary compatibility)
  | "coordination"
  | "governance"
  | "execution"
  | "knowledge"
  | "decision"
  | "capability"
  | "feedback"
  | "priority"

  | "unknown";

export type MechanismStability =
  | "emerging"
  | "reinforced"
  | "stable"
  | "declining"
  | "unknown";

export type MechanismActionability =
  | "high"
  | "medium"
  | "low"
  | "unknown"
  | number;

export type OrganizationalMechanism = {
  id: string;
  type: OrganizationalMechanismType;
  title: string;

  summary: string;
  interpretation: string;
  executiveImplication: string;

  executiveName: string;
  executiveSummary: string;
  organizationalBehavior: string;

  confidence: number;

  // Legacy interpreter compatibility
  severity: number | string;
  executivePriority: number | string;

  actionability: MechanismActionability;
  stability: MechanismStability;

  organizationalScope?: string;

  /**
   * Executive-facing capabilities affected by this mechanism.
   */
  affectedCapabilities: string[];
  affectedCapabilityIds: string[];

  /**
   * Canonical support relationships.
   * These make the mechanism the hub object for organizational understanding.
   */
  supportingEvidenceIds: string[];
  supportingExplanationIds: string[];
  supportingReasoningPathIds?: string[];
  supportingJudgmentIds?: string[];
  supportingClusterIds: string[];
  supportingPhenomenonIds: string[];
  supportingCapabilityIds?: string[];
  supportingSemanticConceptIds?: string[];

  /**
   * Mechanism-centric enrichment.
   * These allow capabilities, phenomena, clusters, and concepts
   * to become supporting context rather than peer objects.
   */
  observedThroughPhenomenonIds?: string[];
  observedThroughClusterIds?: string[];
  explainsCapabilityIds?: string[];
  explainsCapabilityLabels?: string[];
  compressedIntoConceptIds?: string[];

  /**
   * Mechanism network relationships.
   */
  upstreamMechanismIds: string[];
  downstreamMechanismIds: string[];
  reinforcingMechanismIds: string[];
  conflictingMechanismIds?: string[];
  networkNeighborIds?: string[];

  /**
   * Aggregated support metrics.
   */
  supportCount?: number;
  evidenceSupportCount?: number;
  explanationSupportCount?: number;
  reasoningPathSupportCount?: number;
  clusterSupportCount?: number;
  phenomenonSupportCount?: number;
  capabilitySupportCount?: number;
  semanticConceptSupportCount?: number;

  /**
   * Legacy aliases.
   */
  explanationIds?: string[];
  reasoningPathIds?: string[];
  capabilityIds?: string[];
  clusterIds?: string[];
  judgmentIds?: string[];

  sourcePhenomenonIds?: string[];
  sourceClusterIds?: string[];

  evidenceReferences: KnowledgeReference[];

  firstObserved?: string;
  lastObserved?: string;
  observationCount?: number;
};