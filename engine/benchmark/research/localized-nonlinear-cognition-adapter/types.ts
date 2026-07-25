export type ArchitectureId =
  | "stable-linear"
  | "localized-nonlinear"
  | "pervasive-nonlinear";

export type TreatmentType =
  | "baseline"
  | "localized-nonlinear"
  | "pervasive-nonlinear";

export type DimensionStatus =
  | "improved"
  | "unchanged"
  | "regressed"
  | "mixed"
  | "not-measured";

export type EvidenceStrength = "strong" | "moderate" | "limited" | "none";

export type ResearchDecision =
  | "reject"
  | "continue-research"
  | "replicate"
  | "eligible-for-production-contract-design";

export type ResearchArtifactReference = {
  id: string;
  file: string;
  jsonPointer?: string;
  scenarioId?: string;
  description: string;
};

export type MeasuredIndicator = {
  name: string;
  value: string | number | boolean;
  artifactReferenceIds: string[];
};

export type DimensionAssessment = {
  status: DimensionStatus;
  evidenceStrength: EvidenceStrength;
  measuredIndicators: MeasuredIndicator[];
  interpretation: string;
  limitations: string[];
};

export type GuardrailAssessment = {
  status: "passed" | "failed" | "mixed" | "not-measured";
  measuredIndicators: MeasuredIndicator[];
  interpretation: string;
  limitations: string[];
};

export type ComplexityAssessment = {
  benchmarkObserved: string[];
  productionEstimated: string[];
  limitations: string[];
};

export type ReadinessGate = {
  gate: string;
  status: "passed" | "failed" | "not-yet-demonstrated";
  evidence: string;
  artifactReferenceIds: string[];
};

export type OrganizationalUnderstandingResearchRecord = {
  experimentId: "localized-nonlinear-cognition-experiment-001";
  architectureId: ArchitectureId;
  scenarioIds: string[];
  treatmentType: TreatmentType;
  sourceArtifacts: ResearchArtifactReference[];
  measuredResults: {
    utility: number;
    predictionMae: number;
    transitionPrecision: number;
    transitionRecall: number;
    negativeControlPrecision: number;
    expectedTransitionCount: number;
    observedExpectedTransitionCount: number;
    falseTransitionCount: number;
    falseNonlinearClassificationCount: number;
    lineageComplete: boolean;
    reversible?: boolean;
    alternativePromoted?: boolean;
    mechanismRetired?: boolean;
    cascadeDetected: boolean;
    oscillationDetected: boolean;
  };
  researchDimensions: {
    explanatoryDepth: DimensionAssessment;
    evidenceIntegration: DimensionAssessment;
    alternativeResolution: DimensionAssessment;
    stateAndDynamicsAwareness: DimensionAssessment;
    longitudinalLearning: DimensionAssessment;
    emergentInsight: DimensionAssessment;
  };
  guardrails: {
    governanceIntegrity: GuardrailAssessment;
    systemSustainability: GuardrailAssessment;
  };
  complexityEvidence: ComplexityAssessment;
  traceability: {
    sourceResultHash: string;
    adapterProtocolVersion: "1";
    directlyMeasuredFields: string[];
    derivedInterpretations: string[];
  };
  productionReadinessGates: ReadinessGate[];
  decision: ResearchDecision;
};

export type LocalizedNonlinearResearchResult = {
  framework: "organizational-understanding-research-framework";
  frameworkVersion: "1";
  sourceExperiment: {
    name: string;
    classification: string;
    resultFile: string;
    resultHash: string;
  };
  records: OrganizationalUnderstandingResearchRecord[];
  comparison: {
    stableLinear: ArchitectureId;
    localizedNonlinear: ArchitectureId;
    pervasiveNonlinear: ArchitectureId;
    weightedTotal: null;
  };
  finalDecision: ResearchDecision;
  finalDecisionBasis: string;
};
