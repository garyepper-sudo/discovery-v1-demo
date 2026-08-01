import { canonicalHash } from "./canonicalSerialization";
import type { GroundTruthPropositionGraph, OrganizationalUnderstandingProposition, RecoveredProposition, RecoveredPropositionGraph, SemanticAdjudication } from "./contracts";
import { IMPORTED_RUBRIC_VERSION, PHASE_2_STRUCTURAL_EVALUATOR_VERSION, type Phase2EvaluationInput, type Phase2GraphMetadata, type Phase2ImportedRubricJudgment } from "./phase2Contracts";
import { importedRubricRecordHash } from "./importedRubric";
import { phase1GroundTruthFixture, phase1RecoveredFixture } from "./validationFixtures";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const mechanismTwo: OrganizationalUnderstandingProposition = {
  ...clone(phase1GroundTruthFixture.propositions.find((item) => item.id === "mechanism-1")!), id: "mechanism-2", canonicalMeaning: "Credential unreadiness delays onboarding handoffs.", predicate: "access-readiness-causally-delays", supportingEvidenceRefs: ["evidence-2"], competingPropositionRefs: ["mechanism-1"], allowedEquivalentMeanings: ["Missing access credentials make customer transfers take longer."], prohibitedInterpretations: ["Credentials never affect onboarding."],
};
const groundTruthPropositions = clone(phase1GroundTruthFixture.propositions).map((item) => {
  if (item.id === "gap-1") return { ...item, competingPropositionRefs: ["mechanism-1", "mechanism-2"] };
  if (item.id === "prediction-1") return { ...item, temporality: { state: "future" as const, validFrom: "2026-08-01T00:00:00.000Z" } };
  return item;
}).concat(mechanismTwo).sort((a, b) => a.id.localeCompare(b.id));

export const phase2GroundTruthFixture: GroundTruthPropositionGraph = { ...clone(phase1GroundTruthFixture), propositions: groundTruthPropositions, graphHash: canonicalHash(groundTruthPropositions) };

const recoveredMechanismTwo: RecoveredProposition = {
  ...clone(phase1RecoveredFixture.propositions.find((item) => item.id === "recovered-mechanism-1")!), id: "recovered-mechanism-2", sourceClaimRefs: ["claim-mechanism-2"], recoveredMeaning: "Missing access credentials make customer transfers take longer.", predicate: "access-readiness-causally-delays", supportingEvidenceRefs: ["evidence-2"], relatedPropositionRefs: ["recovered-mechanism-1"],
};
const recoveredPropositions = clone(phase1RecoveredFixture.propositions).map((item) => {
  if (item.id === "recovered-contradiction-1") return { ...item, relatedPropositionRefs: ["recovered-mechanism-1", "recovered-mechanism-2"] };
  if (item.id === "recovered-mechanism-1") return { ...item, relatedPropositionRefs: ["recovered-mechanism-2"] };
  if (item.id === "recovered-gap-1") return { ...item, relatedPropositionRefs: ["recovered-mechanism-1", "recovered-mechanism-2"] };
  if (item.id === "recovered-prediction-1") return { ...item, temporality: { state: "future" as const, validFrom: "2026-08-01T00:00:00.000Z" } };
  return item;
}).concat(recoveredMechanismTwo).sort((a, b) => a.id.localeCompare(b.id));
export const phase2RecoveredFixture: RecoveredPropositionGraph = { ...clone(phase1RecoveredFixture), propositions: recoveredPropositions, inputHash: canonicalHash({ treatmentRunId: phase1RecoveredFixture.treatmentRunId, propositions: recoveredPropositions }) };

const recoveredIdFor = (item: OrganizationalUnderstandingProposition) => `recovered-${item.id}`;
export const phase2Adjudications: SemanticAdjudication[] = phase2GroundTruthFixture.propositions.map((item) => ({
  adjudicationId: `phase2-adjudication-${item.id}`, groundTruthPropositionId: item.id, recoveredPropositionId: recoveredIdFor(item), classification: "equivalent",
  meaningAgreement: 1, polarityAgreement: true, modalityAgreement: true, temporalAgreement: true, ...(item.family === "mechanism" ? { causalAgreement: true, confidenceAgreement: { overlap: 1, absoluteError: 0, directionallyCorrect: true } } : {}),
  lineageAgreement: 1, justification: "Imported frozen fixture adjudication; no semantic judgment executed in Phase 2.", adjudicatorConfidence: 1, requiresHumanReview: false, adjudicatorRecordRef: `fixture-adjudication-record-${item.id}`,
}));

export const validPhase2Input: Phase2EvaluationInput = {
  structuralEvaluatorVersion: PHASE_2_STRUCTURAL_EVALUATOR_VERSION, groundTruth: phase2GroundTruthFixture, recovered: phase2RecoveredFixture, adjudications: phase2Adjudications,
  expectedTreatmentRunId: phase2RecoveredFixture.treatmentRunId, activeAuthorizationScopes: ["benchmark-reviewer"], explicitDuplicateGroups: [],
  evidenceCatalog: ["evidence-1", "evidence-2"].map((id) => ({ id, organizationId: phase2GroundTruthFixture.organizationId, caseId: phase2GroundTruthFixture.caseId, authorizationScope: ["benchmark-reviewer"] })),
  importedRubricJudgments: phase2Adjudications.map((item) => {
    const family = phase2GroundTruthFixture.propositions.find((proposition) => proposition.id === item.groundTruthPropositionId)!.family;
    const imported: Omit<Phase2ImportedRubricJudgment, "recordHash"> = { source: "imported", rubricVersion: IMPORTED_RUBRIC_VERSION, adjudicationId: item.adjudicationId,
      ...(family === "contradiction" ? { contradiction: { endpointFidelity: 1, unresolvedStateFidelity: 1, supportOppositionFidelity: 1 } } : {}),
      ...(family === "mechanism" ? { causal: { modalityAccuracy: 1, competingMechanismPreservation: 1, supportOppositionFidelity: 1, causalOverclaim: false } } : {}),
      ...(family === "uncertainty" ? { uncertainty: { appropriateAbstention: 1, unresolvedStatePreservation: 1, falseCertainty: false, unsupportedCertainty: false } } : {}),
      ...(family === "evidence-gap" ? { evidenceGap: { relevance: 1, utilityAgreement: 1, feasibilityAgreement: 1, nonredundancy: 1, rankAgreement: 1 } } : {}),
      ...(family === "implication" ? { decisionUtility: { frozenRubricAgreement: 1 } } : {}),
    };
    return { ...imported, recordHash: importedRubricRecordHash(imported) };
  }),
  graphMetadata: phase2GroundTruthFixture.propositions.reduce<Phase2GraphMetadata[]>((items, item) => item.family === "mechanism" ? [...items, { propositionId: item.id, mechanism: { explanandumRefs: ["condition-1"] } }] : item.family === "evidence-gap" ? [...items, { propositionId: item.id, evidenceGap: { priority: 1, justification: "Discriminates the competing mechanisms.", expectedUtility: 0.2, feasibility: "feasible" } }] : item.family === "prediction" ? [...items, { propositionId: item.id, prediction: { evaluationStatus: "pending" } }] : items, []),
};

export const clonePhase2Input = () => clone(validPhase2Input);
