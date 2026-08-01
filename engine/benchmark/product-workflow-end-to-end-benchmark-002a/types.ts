import type { MaterialInformationAcquisitionInput, MaterialInformationAcquisitionResult } from "../../../product/acquisition/contracts";
import type { BenchmarkEvidence } from "../product-workflow-end-to-end-benchmark-001/types";

export type GovernedOutcome = { outcomeId: string; version: 1; operationRef: string; organizationId: string; authorized: true; observedAt: string; observation: string; lineage: string[] };
export type ReplacementScenario = {
  id: "holdout-11-outcome-discrimination";
  status: "untouched-controlled-holdout";
  priorExposureCount: 0;
  organizationId: string;
  question: { id: string; revision: 1; text: string };
  unknown: { id: string; revisionRef: string; text: string };
  objective: { versionRef: string; statement: string };
  optimizationContext: { versionRef: string; summary: string };
  baselineUnderstanding: { revisionRef: string; answer: string | null; uncertainty: string; mechanisms: string[] };
  baselineEvidence: BenchmarkEvidence[];
  baselineInput: MaterialInformationAcquisitionInput;
  materialOutcome: GovernedOutcome;
  resultingInformation: { informationId: string; sourceOutcomeRef: string; statement: string };
  evidenceCandidacy: { candidateId: string; sourceInformationRef: string; status: "candidate" };
  admittedEvidence: BenchmarkEvidence & { sourceOutcomeRef: string; admissionReceiptRef: string };
  revisedUnderstanding: { revisionRef: string; answer: string; uncertainty: string; mechanisms: string[] };
  materialOutcomeInput: MaterialInformationAcquisitionInput;
  unrelatedOutcome: GovernedOutcome;
  unrelatedOutcomeInput: MaterialInformationAcquisitionInput;
  ambiguousFacts: string[];
  withheld: string[];
  prohibitedRecommendations: string[];
  deterministicClock: string;
  scenarioHash: string;
};

export type ReplacementExpectation = { scenarioId: string; baseline: { kind: MaterialInformationAcquisitionResult["kind"]; candidateId: string | null }; materialOutcome: { kind: MaterialInformationAcquisitionResult["kind"]; candidateId: string | null }; unrelatedOutcome: { substantiveChange: false }; prohibitedCandidates: string[]; expectationHash: string };
