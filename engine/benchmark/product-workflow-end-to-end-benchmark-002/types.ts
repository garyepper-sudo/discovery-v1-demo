import type { MaterialInformationAcquisitionInput, MaterialInformationAcquisitionResult } from "../../../product/acquisition/contracts";
import type { BenchmarkEvidence, ProductWorkflowCommunicationBrief } from "../product-workflow-end-to-end-benchmark-001/types";

export type HeldOutCoverage = "dominant-mechanism" | "competing-explanations" | "objective-reversal" | "context-reversal" | "governance-prohibition" | "authorization-revocation" | "stale-context" | "contradictory-outcome" | "insufficient-evidence" | "understanding-sufficient";

export type HeldOutScenarioInput = {
  id: string;
  version: "1";
  status: "untouched-controlled-holdout";
  priorExposure: "not-viewed-by-recommendation-implementation-before-freeze";
  coverage: HeldOutCoverage[];
  organizationId: string;
  question: { id: string; revision: 1; text: string };
  unknown: { id: string; revisionRef: string; text: string; whyItMatters: string };
  understanding: { revisionRef: string; answer: string | null; uncertainty: string; mechanisms: string[] };
  evidence: BenchmarkEvidence[];
  objective: { versionRef: string; statement: string };
  optimizationContext: { versionRef: string; summary: string };
  selectorInput: MaterialInformationAcquisitionInput;
  ambiguousFacts: string[];
  withheld: string[];
  prohibitedRecommendations: string[];
  deterministicClock: string;
  inputHash: string;
};

export type HeldOutExpectation = {
  scenarioId: string;
  expectedKind: MaterialInformationAcquisitionResult["kind"];
  expectedCandidateId: string | null;
  prohibitedKinds: MaterialInformationAcquisitionResult["kind"][];
  invariance: string[];
  sensitivity: string[];
  expectationHash: string;
};

export type HeldOutExecutionResult = {
  scenarioId: string;
  inputHash: string;
  status: HeldOutScenarioInput["status"];
  coverage: HeldOutCoverage[];
  questionReloaded: true;
  selection: MaterialInformationAcquisitionResult;
  brief: ProductWorkflowCommunicationBrief;
  presentation: string;
  claimFidelity: { passed: true; unsupportedClaims: []; withheldValuesExposed: false };
  invariance: Array<{ name: string; passed: boolean }>;
  sensitivity: Array<{ name: string; baseline: string; changed: string; passed: boolean }>;
};

export type HeldOutComparison = {
  scenarioId: string;
  expectationHash: string;
  expectedKind: MaterialInformationAcquisitionResult["kind"];
  actualKind: MaterialInformationAcquisitionResult["kind"];
  expectedCandidateId: string | null;
  actualCandidateId: string | null;
  passed: boolean;
};
