export type FidelityArtifactKind =
  | "finding" | "condition" | "constraint" | "conclusion" | "prediction"
  | "contradiction" | "mechanism" | "uncertainty" | "evidence-gap";

export type CanonicalObservableArtifact = {
  id: string;
  kind: FidelityArtifactKind;
  organizationId: string;
  statement: string;
  confidence: number | null;
  supportingEvidenceIds: string[];
  opposingEvidenceIds: string[];
  competingArtifactIds: string[];
  unresolved: boolean;
  priority: number | null;
  expectedUtility: number | null;
  justification: string | null;
  understandingRefs: string[];
  changedFromArtifactId: string | null;
  observedAt: string | null;
};

export type CanonicalObservableSnapshot = {
  contractVersion: "1";
  organizationId: string;
  evidenceIds: string[];
  artifacts: CanonicalObservableArtifact[];
};

export type ObservableArtifact = CanonicalObservableArtifact;

export type ObservableOutput = {
  contractVersion: "1";
  organizationId: string;
  findings: ObservableArtifact[];
  conditions: ObservableArtifact[];
  constraints: ObservableArtifact[];
  conclusions: ObservableArtifact[];
  predictions: ObservableArtifact[];
  contradictions: ObservableArtifact[];
  mechanisms: ObservableArtifact[];
  uncertainty: ObservableArtifact[];
  evidenceGaps: ObservableArtifact[];
};

export type ObservableAuthorization = {
  organizationId: string;
  authorizedEvidenceIds: string[];
  authorizedArtifactIds: string[];
};

export type FailureClass =
  | "serialization-defect" | "normalization-defect" | "artifact-omission"
  | "artifact-corruption" | "lineage-loss" | "confidence-corruption"
  | "permission-defect" | "organization-contamination"
  | "evaluator-incompatibility" | "scoring-incompatibility" | "unknown";

