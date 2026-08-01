import type { MaterialInformationAcquisitionInput, MaterialInformationAcquisitionResult } from "../../../product/acquisition/contracts";

export type BenchmarkEvidence = { id: string; statement: string; role: "supports" | "opposes" | "shared" | "irrelevant"; authorized: boolean };
export type BenchmarkScenario = {
  id: "scenario-a" | "scenario-b" | "scenario-c-margin" | "scenario-c-growth";
  version: "1";
  organizationId: string;
  question: { id: string; revision: 1; text: string };
  unknown: { id: string; revisionRef: string; text: string; whyItMatters: string };
  understanding: { revisionRef: string; answer: string | null; uncertainty: string; mechanisms: string[] };
  evidence: BenchmarkEvidence[];
  groundTruth: string[];
  ambiguousFacts: string[];
  withheld: string[];
  objective: { versionRef: string; statement: string };
  optimizationContext: { versionRef: string; summary: string };
  selectorInput: MaterialInformationAcquisitionInput;
  expected: { kind: MaterialInformationAcquisitionResult["kind"]; selectedCandidateId: string | null };
  prohibitedRecommendations: string[];
  deterministicClock: string;
  scenarioHash: string;
};

export type ProductWorkflowCommunicationBrief = {
  contractVersion: "benchmark-1";
  scenarioId: string;
  audience: "authorized-organizational-leader";
  question: string;
  directAnswer: string;
  currentUnderstanding: string;
  claimIds: string[];
  evidenceRefs: string[];
  objective: string;
  optimizationContext: string;
  disposition: MaterialInformationAcquisitionResult["kind"];
  recommendedOption: string | null;
  alternatives: string[];
  candidateMaterialFields: Array<{ candidateId: string; burden: string; cost: string; delay: string; reliability: string; reversibility: string; governanceAllowed: boolean; authorizationSatisfied: boolean; stoppingCondition: string }>;
  mechanismRationale: string;
  contradictions: string[];
  uncertainty: string;
  risksAndLimitations: string[];
  requestedUserDecision: string;
  whatWouldChangeTheRecommendation: string;
  unavailable: string[];
  withheld: string[];
  requiredDisclosures: string[];
  prohibitedClaims: string[];
  desiredLength: "one-page-progressive-disclosure";
  digest: string;
};

export type BenchmarkScenarioResult = {
  scenarioId: string;
  scenarioHash: string;
  evidenceStatus: "development-case";
  developmentCorrections: string[];
  questionIdentityStable: true;
  organizationIsolated: true;
  answerKind: "answer" | "unknown";
  selection: MaterialInformationAcquisitionResult;
  workflowTurns: string[];
  brief: ProductWorkflowCommunicationBrief;
  deterministicPresentation: string;
  claimFidelity: { passed: true; unsupportedClaims: []; withheldValuesExposed: false };
  invariance: Array<{ perturbation: string; passed: boolean }>;
  sensitivity: Array<{ perturbation: string; expected: string; actual: string; passed: boolean }>;
};

export type EndToEndBenchmarkResult = {
  benchmark: "discovery-product-workflow-end-to-end-benchmark-001";
  classification: "A — END-TO-END WORKFLOW RECOMMENDATION AND COMMUNICATION SHADOW VALIDATED" | "B-R — WORKFLOW SAFE; RECOMMENDATION SOPHISTICATION OR ROBUSTNESS INSUFFICIENT";
  scenarios: BenchmarkScenarioResult[];
  hardGates: Record<string, 0>;
  communication: { deterministicRenderer: "passed"; llmArm: "not-executed"; humanReviewPacket: "not-created-single-arm" };
  qualityDimensions: Record<string, "pass" | "bounded">;
  frozenBaseline: {
    commit: "351c97a2547082feba2a4bed4ef134cc6ce30dea";
    sourceHashes: Record<string, string>;
    versions: { candidateEnvelope: "1"; confidenceImprovementEvent: "3"; objective: "1"; optimizationContext: "1"; communicationBrief: "benchmark-1"; benchmark: "1"; scenarioDossier: "1"; deterministicRenderer: "1" };
  };
  controlledSetupRuntimeWrites: number;
  temporaryRuntimeWrites: 0;
  connectorCalls: 0;
  externalActions: 0;
  productionOperations: 0;
};
