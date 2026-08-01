import { canonicalHash } from "./canonicalSerialization";
import { DUPLICATE_COLLAPSE_VERSION } from "./duplicateCollapse";
import { FAMILY_COMPATIBILITY_VERSION } from "./familyCompatibility";
import { phase3GroundTruthGraphHash, phase3RecoveredGraphHash } from "./generateSemanticCandidates";
import { phase2GroundTruthFixture, phase2RecoveredFixture } from "./phase2ValidationFixtures";
import {
  PHASE_3_CONFIGURATION_VERSION,
  PHASE_3_PREREGISTRATION_VERSION,
  PHASE_3_CORPUS_SPLIT_VERSION,
  PHASE_3_INPUT_VERSION,
  STRUCTURAL_COMPARISON_VERSION,
  type Phase3FixtureCase,
  type Phase3Input,
} from "./phase3Contracts";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const recoveredGraphHash = (input: Phase3Input["collapsedRecovered"]) => phase3RecoveredGraphHash(input.treatmentRunId, input.propositions);
const structuralReceipt = (organizationId: string, caseId: string, recoveredHash: string, groundTruthHash: string): Phase3Input["structuralReceipt"] => {
  const content = { evaluatorId: "organizational-understanding-evaluator-001" as const, structuralEvaluatorVersion: "oue-001-phase-2-structural/v1" as const, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: FAMILY_COMPATIBILITY_VERSION, duplicateCollapseVersion: DUPLICATE_COLLAPSE_VERSION, valid: true as const, organizationId, caseId, recoveredGraphHash: recoveredHash, groundTruthGraphHash: groundTruthHash };
  const receiptHash = canonicalHash(content);
  return { ...content, receiptId: `phase2-structural-${receiptHash.slice(0, 24)}`, receiptHash };
};

const baseInput = (): Phase3Input => {
  const groundTruth = clone(phase2GroundTruthFixture);
  groundTruth.graphHash = phase3GroundTruthGraphHash(groundTruth.propositions);
  const collapsedRecovered: Phase3Input["collapsedRecovered"] = { ...clone(phase2RecoveredFixture), collapsedMemberIds: [], duplicateAuditAncestry: [] };
  return {
    inputVersion: PHASE_3_INPUT_VERSION,
    evaluatorId: "organizational-understanding-evaluator-001",
    organizationId: groundTruth.organizationId,
    caseId: groundTruth.caseId,
    activeAuthorizationScopes: ["benchmark-reviewer"],
    groundTruth,
    collapsedRecovered,
    structuralReceipt: structuralReceipt(groundTruth.organizationId, groundTruth.caseId, recoveredGraphHash(collapsedRecovered), groundTruth.graphHash),
    configuration: { version: PHASE_3_CONFIGURATION_VERSION, maximumCandidatesPerRecovered: 4, minimumFeatureScore: 0 },
    preregistrationVersion: PHASE_3_PREREGISTRATION_VERSION,
    preregistrationHash: "69fe9e7713f711e2610a3c0454ab9fc54ff74bbd355752989e0891e6af96d9c4",
    corpusSplitVersion: PHASE_3_CORPUS_SPLIT_VERSION,
    corpusSplitHash: "25931337fe1c442b862d737a817b8a6ddeb0c2ec11d903a29cf99d3c52cdec8b",
    evaluatedAt: "2026-07-31T12:00:00.000Z",
  };
};

const pairAll = (input: Phase3Input) => input.collapsedRecovered.propositions.map((item) => ({ recoveredPropositionId: item.id, groundTruthPropositionId: item.id.replace("recovered-", "") }));
const developmentInput = baseInput();

const holdoutInput = baseInput();
const holdoutMeanings: Record<string, string> = {
  "recovered-finding-1": "Accountability is established only after the customer transition begins.",
  "recovered-condition-1": "The transfer process remains constrained by a late ownership state.",
  "recovered-constraint-1": "The timing of named responsibility is the leading limitation.",
  "recovered-mechanism-1": "Assigning accountable ownership downstream lengthens the handoff.",
  "recovered-mechanism-2": "Incomplete access preparation independently lengthens the handoff.",
  "recovered-uncertainty-1": "The relative contribution of the two constraints remains unresolved.",
  "recovered-gap-1": "A controlled comparison could distinguish the competing causes.",
};
holdoutInput.collapsedRecovered.propositions = holdoutInput.collapsedRecovered.propositions.map((item) => ({ ...item, recoveredMeaning: holdoutMeanings[item.id] ?? item.recoveredMeaning }));
holdoutInput.structuralReceipt = structuralReceipt(holdoutInput.organizationId, holdoutInput.caseId, recoveredGraphHash(holdoutInput.collapsedRecovered), holdoutInput.groundTruth.graphHash);

const negativeInput = baseInput();
negativeInput.collapsedRecovered.propositions = [{ ...negativeInput.collapsedRecovered.propositions.find((item) => item.family === "finding")!, id: "negative-future-finding", recoveredMeaning: "A future renewal outcome may change.", modality: "predictive", temporality: { state: "future" } }];
negativeInput.structuralReceipt = structuralReceipt(negativeInput.organizationId, negativeInput.caseId, recoveredGraphHash(negativeInput.collapsedRecovered), negativeInput.groundTruth.graphHash);

export const phase3FixtureCases: Phase3FixtureCase[] = [
  { id: "phase3-development", split: "development", input: developmentInput, expectedCandidatePairs: pairAll(developmentInput) },
  { id: "phase3-holdout", split: "holdout", input: holdoutInput, expectedCandidatePairs: pairAll(holdoutInput) },
  { id: "phase3-negative", split: "negative-control", input: negativeInput, expectedCandidatePairs: [] },
];

export const phase3CorpusSplitManifest = {
  version: PHASE_3_CORPUS_SPLIT_VERSION,
  identityHash: "25931337fe1c442b862d737a817b8a6ddeb0c2ec11d903a29cf99d3c52cdec8b",
  developmentCaseIds: ["phase3-development"],
  holdoutCaseIds: ["phase3-holdout"],
  negativeControlCaseIds: ["phase3-negative"],
  caseHashes: Object.fromEntries(phase3FixtureCases.map((item) => [item.id, canonicalHash(item)])),
  holdoutLabelsAvailableToGenerator: false,
} as const;

export const clonePhase3Input = (id = "phase3-development") => clone(phase3FixtureCases.find((item) => item.id === id)!.input);
