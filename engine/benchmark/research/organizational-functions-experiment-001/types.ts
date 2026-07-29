export type ExperimentalEvidenceDirection =
  | "increasing"
  | "decreasing"
  | "friction"
  | "stable"
  | "unknown";

export type ExperimentalEvidenceRole =
  | "supports"
  | "weakens"
  | "temporal-trend"
  | "operational-observation"
  | "customer-observation"
  | "leadership-observation"
  | "constraint-signal"
  | "execution-signal"
  | "demand-signal"
  | "capacity-signal"
  | "decision-signal"
  | "retention-signal"
  | "risk-signal"
  | "unknown";

export type ExperimentalEvidenceRoleAssignment = {
  evidenceId: string;
  roles: ExperimentalEvidenceRole[];
  direction: ExperimentalEvidenceDirection;
  basis: {
    evidenceType: ExperimentalEvidence["type"];
    evidencePolarity: ExperimentalEvidence["polarity"];
    evidenceStrength: "weak" | "moderate" | "strong" | "unknown";
    observationIds: string[];
    signalIds: string[];
    themeIds: string[];
  };
  lineage: {
    evidenceIds: string[];
    observationIds: string[];
  };
};

export type OrganizationalFunction =
  | "demand-generation"
  | "value-conversion"
  | "value-exchange"
  | "customer-retention"
  | "capacity-acquisition"
  | "productive-capacity"
  | "decision-formation"
  | "decision-authorization"
  | "coordination"
  | "execution-throughput"
  | "quality-control"
  | "knowledge-flow"
  | "learning-adaptation"
  | "resource-allocation";

export type ExperimentalEvidence = {
  id: string;
  organizationId: string;
  text: string;
  type: "fact" | "metric" | "claim" | "risk" | "opportunity" | "decision" | "question";
  polarity: "positive" | "negative" | "neutral" | "mixed" | "unknown";
  admitted: boolean;
  sourceType: string;
};

export type ExperimentalObservation = {
  id: string;
  organizationId: string;
  statement: string;
  evidenceIds: string[];
};

export type FunctionAssignment = {
  function: OrganizationalFunction;
  direction: ExperimentalEvidenceDirection;
  evidenceIds: string[];
  observationIds: string[];
  sourceArtifactIds: string[];
  derivationRule: string;
};

export type EvidenceGap = {
  function: OrganizationalFunction;
  recommendation: string;
  evidenceIds?: string[];
};

export type MechanismCandidate = {
  upstream: OrganizationalFunction;
  downstream: OrganizationalFunction;
  evidenceIds: string[];
  status: "supported-relationship" | "insufficient";
};

export type Scenario = {
  id: string;
  category:
    | "exact"
    | "paraphrase"
    | "cross-industry"
    | "negative"
    | "negation"
    | "hypothesis"
    | "quotation"
    | "ambiguous";
  industry: string;
  questionDomain:
    | "sales"
    | "execution"
    | "hiring"
    | "decisions"
    | "retention"
    | "other";
  evidence: ExperimentalEvidence[];
  observations: ExperimentalObservation[];
  evidenceRoles: ExperimentalEvidenceRoleAssignment[];
  expectedFunctions: OrganizationalFunction[];
  prohibitedFunctions: OrganizationalFunction[];
  expectedDirection: ExperimentalEvidenceDirection | "abstain";
  expectedAbstention: boolean;
  expectedMechanism?: readonly [OrganizationalFunction, OrganizationalFunction];
  highestValueEvidenceGap?: EvidenceGap;
};

export type Architecture = "A" | "B" | "C";

export type ScenarioResult = {
  scenarioId: string;
  architecture: Architecture;
  assignments: FunctionAssignment[];
  mechanism?: MechanismCandidate;
  evidenceGap?: EvidenceGap;
};

export type MetricSet = {
  exactGrammarRecovery: string;
  independentParaphraseRecovery: string;
  crossIndustryTransfer: string;
  functionPrecision: number;
  functionRecall: number;
  directionPrecision: number;
  negativeControlPrecision: number;
  negationPrecision: number;
  hypothesisPrecision: number;
  quotationPrecision: number;
  ambiguityAbstention: number;
  organizationIsolation: boolean;
  orderingDeterminism: boolean;
  truthfulUtilityRecovery: string;
  mechanismRecovery: string;
  evidenceGapRecovery: string;
};
