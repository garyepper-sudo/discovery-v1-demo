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

  affectedCapabilities: string[];
  affectedCapabilityIds: string[];

  supportingEvidenceIds: string[];
  supportingExplanationIds: string[];
  supportingClusterIds: string[];
  supportingPhenomenonIds: string[];

  // Legacy aliases
  explanationIds?: string[];
  reasoningPathIds?: string[];
  capabilityIds?: string[];
  clusterIds?: string[];
  judgmentIds?: string[];

  sourcePhenomenonIds?: string[];
  sourceClusterIds?: string[];

  upstreamMechanismIds: string[];
  downstreamMechanismIds: string[];
  reinforcingMechanismIds: string[];

  evidenceReferences: KnowledgeReference[];

  firstObserved?: string;
  lastObserved?: string;
  observationCount?: number;
};