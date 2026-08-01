import { CANONICAL_SERIALIZATION_VERSION, canonicalHash } from "./canonicalSerialization";
import type { EvaluationDimension, EvaluationLedger, OrganizationalUnderstandingProposition, RecoveredProposition, SemanticAdjudication } from "./contracts";
import { compareConfidence } from "./confidenceNormalization";
import { IMPORTED_RUBRIC_VERSION, PHASE_2_STRUCTURAL_EVALUATOR_VERSION, type Phase2DimensionResult, type Phase2EvaluationInput, type Phase2EvaluationLedger, type Phase2ScoreResult, type Phase2StructuralResult } from "./phase2Contracts";
import { scoringDecomposition } from "./scoringDecomposition";
import { CONFIDENCE_NORMALIZATION_VERSION } from "./confidenceNormalization";
import { DUPLICATE_COLLAPSE_VERSION } from "./duplicateCollapse";
import { FAMILY_COMPATIBILITY_VERSION } from "./familyCompatibility";
import { MATCH_ASSIGNMENT_VERSION } from "./matchAssignment";
import { GRAPH_INTEGRITY_VALIDATION_VERSION } from "./structuralValidation";

export const COMPONENT_SCORER_VERSIONS = Object.freeze<Record<EvaluationDimension, string>>({ correctness: "correctness-scorer/v1", materialCoverage: "material-coverage-scorer/v1", contradictionQuality: "contradiction-quality-scorer/v1", causalQuality: "causal-quality-scorer/v1", confidenceCalibration: "confidence-representation-fidelity-scorer/v1", uncertaintyDiscipline: "uncertainty-discipline-scorer/v1", evidenceGapQuality: "evidence-gap-quality-scorer/v1", decisionRelevantUtility: "imported-decision-utility-rubric-aggregator/v1" });
export const COMPOSITE_WEIGHT_VERSION = "couu-scoring-decomposition/v1" as const;

const classificationCredit: Record<SemanticAdjudication["classification"], (item: SemanticAdjudication) => number> = {
  exact: () => 1, equivalent: () => 1, partial: (item) => item.meaningAgreement,
  overgeneralized: (item) => item.meaningAgreement, undergeneralized: (item) => item.meaningAgreement,
  contradictory: () => 0, unsupported: () => 0, irrelevant: () => 0, ambiguous: () => 0, missing: () => 0,
};
const weightedMean = (rows: Array<{ credit: number; weight: number; ref: string }>, limitation?: string): Phase2DimensionResult => {
  const denominator = rows.reduce((sum, item) => sum + item.weight, 0);
  const numerator = rows.reduce((sum, item) => sum + item.credit * item.weight, 0);
  return { score: denominator ? numerator / denominator : 1, numerator, denominator, propositionRefs: rows.map((item) => item.ref).sort(), ...(limitation ? { limitation } : {}) };
};
const importance = (item: OrganizationalUnderstandingProposition) => (item.importance + item.decisionRelevance) / 2;

export function calculateDeterministicScores(input: { source: Phase2EvaluationInput; structural: Phase2StructuralResult }): Phase2ScoreResult {
  if (!input.structural.valid) throw new Error("Blocking structural failures prohibit scoring.");
  const gt = new Map(input.source.groundTruth.propositions.map((item) => [item.id, item]));
  const recovered = new Map(input.structural.collapsedRecovered.propositions.map((item) => [item.id, item]));
  const selected = input.structural.assignment.filter((item) => item.selected).map((item) => item.adjudication);
  const byGroundTruth = new Map(input.source.adjudications.map((item) => [item.groundTruthPropositionId, item]));
  const rubricByAdjudication = new Map(input.source.importedRubricJudgments.map((item) => [item.adjudicationId, item]));
  const credit = (item: SemanticAdjudication) => classificationCredit[item.classification](item);
  const correctnessRows = selected.map((item) => ({ credit: credit(item), weight: importance(gt.get(item.groundTruthPropositionId)!), ref: item.groundTruthPropositionId }));
  const coverageRows = input.source.groundTruth.propositions.filter((item) => item.requiredForCoverage).map((item) => ({ credit: byGroundTruth.has(item.id) ? credit(byGroundTruth.get(item.id)!) : 0, weight: importance(item), ref: item.id }));
  const familyRows = (family: OrganizationalUnderstandingProposition["family"]) => input.source.groundTruth.propositions.filter((item) => item.family === family).map((item) => ({ credit: byGroundTruth.has(item.id) ? credit(byGroundTruth.get(item.id)!) : 0, weight: importance(item), ref: item.id }));
  const contradictionRows = familyRows("contradiction").map((row) => {
    const item = gt.get(row.ref)!; const adjudication = byGroundTruth.get(row.ref); const recoveredItem = adjudication?.recoveredPropositionId ? recovered.get(adjudication.recoveredPropositionId) : undefined;
    const rubric = adjudication ? rubricByAdjudication.get(adjudication.adjudicationId)?.contradiction : undefined;
    const structural = recoveredItem && recoveredItem.relatedPropositionRefs.length >= 2 && recoveredItem.polarity === "mixed" && rubric ? (rubric.endpointFidelity + rubric.unresolvedStateFidelity + rubric.supportOppositionFidelity) / 3 : 0;
    return { ...row, credit: row.credit * structural };
  });
  const causalRows = familyRows("mechanism").map((row) => {
    const adjudication = byGroundTruth.get(row.ref); const recoveredItem = adjudication?.recoveredPropositionId ? recovered.get(adjudication.recoveredPropositionId) : undefined;
    const rubric = adjudication ? rubricByAdjudication.get(adjudication.adjudicationId)?.causal : undefined;
    const structural = recoveredItem?.modality === "causal" && rubric ? (rubric.modalityAccuracy + rubric.competingMechanismPreservation + rubric.supportOppositionFidelity + (rubric.causalOverclaim ? 0 : 1)) / 4 : 0;
    return { ...row, credit: row.credit * structural };
  });
  const confidenceRows = input.source.groundTruth.propositions.filter((item) => item.expectedConfidence).map((item) => {
    const adjudication = byGroundTruth.get(item.id); const actual = adjudication?.recoveredPropositionId ? input.structural.normalizedConfidenceByPropositionId[adjudication.recoveredPropositionId] : null;
    return { credit: compareConfidence(actual, item.expectedConfidence).overlap, weight: importance(item), ref: item.id };
  });
  const dimensions: Record<EvaluationDimension, Phase2DimensionResult> = {
    correctness: weightedMean(correctnessRows),
    materialCoverage: weightedMean(coverageRows),
    contradictionQuality: weightedMean(contradictionRows),
    causalQuality: weightedMean(causalRows),
    confidenceCalibration: weightedMean(confidenceRows, "Justified-range agreement only; outcome-based calibration is inactive."),
    uncertaintyDiscipline: weightedMean(familyRows("uncertainty").map((row) => { const adjudication = byGroundTruth.get(row.ref); const rubric = adjudication ? rubricByAdjudication.get(adjudication.adjudicationId)?.uncertainty : undefined; return { ...row, credit: row.credit * (rubric ? (rubric.appropriateAbstention + rubric.unresolvedStatePreservation + (rubric.falseCertainty ? 0 : 1) + (rubric.unsupportedCertainty ? 0 : 1)) / 4 : 0) }; })),
    evidenceGapQuality: weightedMean(familyRows("evidence-gap").map((row) => { const adjudication = byGroundTruth.get(row.ref); const rubric = adjudication ? rubricByAdjudication.get(adjudication.adjudicationId)?.evidenceGap : undefined; return { ...row, credit: row.credit * (rubric ? (rubric.relevance + rubric.utilityAgreement + rubric.feasibilityAgreement + rubric.nonredundancy + rubric.rankAgreement) / 5 : 0) }; }), "Relevance and utility are imported adjudications; no semantic utility judgment occurs here."),
    decisionRelevantUtility: weightedMean(familyRows("implication").map((row) => { const adjudication = byGroundTruth.get(row.ref); const rubric = adjudication ? rubricByAdjudication.get(adjudication.adjudicationId)?.decisionUtility : undefined; return { ...row, credit: row.credit * (rubric?.frozenRubricAgreement ?? 0) }; }), "Deterministic aggregation of imported rubric judgments only."),
  };
  const compositeScore = (Object.entries(scoringDecomposition) as Array<[EvaluationDimension, { weight: number }]>).reduce((sum, [dimension, spec]) => sum + dimensions[dimension].score * spec.weight, 0);
  return { dimensions, compositeScore, compositeActiveForCompletedImportedAdjudications: true };
}

export function buildEvaluationLedger(input: { source: Phase2EvaluationInput; structural: Phase2StructuralResult; scores?: Phase2ScoreResult }): Phase2EvaluationLedger {
  const dimensionScores = Object.fromEntries(Object.keys(scoringDecomposition).map((key) => [key, input.scores?.dimensions[key as EvaluationDimension].score ?? 0])) as EvaluationLedger["dimensionScores"];
  const componentVersions = { structuralValidator: PHASE_2_STRUCTURAL_EVALUATOR_VERSION, confidenceNormalization: CONFIDENCE_NORMALIZATION_VERSION, duplicateCollapse: DUPLICATE_COLLAPSE_VERSION, familyCompatibility: FAMILY_COMPATIBILITY_VERSION, assignment: MATCH_ASSIGNMENT_VERSION, graphIntegrity: GRAPH_INTEGRITY_VALIDATION_VERSION, importedRubric: IMPORTED_RUBRIC_VERSION, componentScorers: COMPONENT_SCORER_VERSIONS, compositeWeights: COMPOSITE_WEIGHT_VERSION, serialization: CANONICAL_SERIALIZATION_VERSION };
  const phase2Audit = { componentVersions, componentVersionsHash: canonicalHash(componentVersions), importedRubricRecordHashes: input.source.importedRubricJudgments.map((item) => item.recordHash).sort(), duplicateAuditAncestryHash: canonicalHash(input.structural.collapsedRecovered.duplicateAuditAncestry) };
  const base = {
    ledgerVersion: "evaluation-ledger/v1" as const, caseId: input.source.groundTruth.caseId, organizationId: input.source.groundTruth.organizationId,
    treatmentRunId: input.source.expectedTreatmentRunId, evaluatorVersion: "oue-001-phase-1" as const,
    propositionAdjudications: [...input.source.adjudications].sort((a, b) => a.adjudicationId.localeCompare(b.adjudicationId)), dimensionScores,
    penalties: [], blockingFailures: input.structural.blockingFailures,
    ...(input.scores ? { compositeScore: input.scores.compositeScore } : {}), classificationEligibility: input.structural.valid,
    inputHashes: [input.source.groundTruth.graphHash, input.source.recovered.inputHash].sort(), phase2Audit,
  };
  return { ...base, outputHash: canonicalHash(base) };
}
