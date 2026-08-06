export const EXTERNAL_COMPARATIVE_PROTOCOL_VERSION = "1" as const;

export type TreatmentId =
  | "human-only"
  | "llm-only-fixture-proxy"
  | "retrieval-plus-synthesis"
  | "traditional-structured-analysis"
  | "discovery";

export type EvidenceRecord = {
  id: string;
  observedAt: string;
  permissionScope: "all-benchmark-treatments" | "discovery-only";
  content: string;
};

export type GroundTruth = {
  materialFacts: string[];
  contradictions: Array<{ id: string; left: string; right: string }>;
  supportedMechanisms: string[];
  unsupportedMechanisms: string[];
  uncertainties: string[];
  conditions: string[];
  primaryConstraint: string | null;
  highValueMissingEvidence: string[];
  decisionImplications: string[];
  expectedAbstention: boolean;
};

export type BenchmarkPhase = {
  phaseId: "initial" | "update";
  evidenceIds: string[];
  groundTruth: GroundTruth;
};

export type ComparativeCase = {
  caseId: string;
  organizationId: string;
  title: string;
  industry: string;
  size: "small" | "medium" | "large";
  structure: string;
  question: string;
  scenarioTypes: string[];
  holdout: boolean;
  evidence: EvidenceRecord[];
  phases: BenchmarkPhase[];
};

export type ObservableClaim = {
  statement: string;
  semanticIds: string[];
  confidence: number | null;
  evidenceIds: string[];
};

export type ComparativeTreatmentOutput = {
  contractVersion: "1";
  treatmentId: TreatmentId;
  executionClass:
    | "genuine-human"
    | "genuine-live-model"
    | "deterministic-fixture-backed-proxy"
    | "deterministic-local-baseline"
    | "canonical-discovery"
    | "not-yet-evaluated";
  caseId: string;
  organizationId: string;
  phaseId: BenchmarkPhase["phaseId"];
  materialFacts: ObservableClaim[];
  principalFindings: ObservableClaim[];
  contradictions: Array<{ id: string; left: ObservableClaim; right: ObservableClaim; resolved: boolean }>;
  causalExplanations: ObservableClaim[];
  organizationalConditions: ObservableClaim[];
  primaryConstraint: ObservableClaim | null;
  uncertaintyStatements: ObservableClaim[];
  missingEvidence: ObservableClaim[];
  recommendedNextEvidence: ObservableClaim[];
  decisionImplications: ObservableClaim[];
  predictions: ObservableClaim[];
  abstained: boolean;
  abstentionReason: string | null;
  lineageComplete: boolean;
  permissionCompliant: boolean;
  internalArtifactCounts?: Record<string, number>;
};

export type MetricComponents = {
  correctness: number;
  materialCoverage: number;
  contradictionQuality: number;
  causalQuality: number;
  calibration: number;
  uncertaintyDiscipline: number;
  evidenceGapQuality: number;
  decisionUtility: number;
};

export type CaseScore = {
  caseId: string;
  phaseId: BenchmarkPhase["phaseId"];
  treatmentId: TreatmentId;
  evaluative: boolean;
  comparativeOrganizationalUnderstandingUtility: number | null;
  components: MetricComponents | null;
  unsupportedAssertionRate: number | null;
  materialOmissionRate: number | null;
  contradictionPrecision: number | null;
  contradictionRecall: number | null;
  mechanismPrecision: number | null;
  mechanismRecall: number | null;
  brierScore: number | null;
  appropriateAbstention: boolean | null;
  guardrailFailures: string[];
};

export type PreregistrationManifest = {
  protocolVersion: typeof EXTERNAL_COMPARATIVE_PROTOCOL_VERSION;
  experimentId: "external-comparative-validation-001";
  repositoryCommit: string;
  benchmarkImplementationHash: string;
  evaluatorVersion: "1";
  fixtureHashes: Record<string, string>;
  contractVersions: Record<string, string>;
  cases: Array<{
    caseId: string;
    organizationId: string;
    holdout: boolean;
    scenarioTypes: string[];
    phases: BenchmarkPhase[];
    permissionBoundaries: string[];
  }>;
  treatments: Array<{ id: TreatmentId; executionClass: ComparativeTreatmentOutput["executionClass"] }>;
  weights: MetricComponents;
  robustnessTests: string[];
  classificationRules: string[];
  invalidationGates: string[];
  frozenAt: string;
};

