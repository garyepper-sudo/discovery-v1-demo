import type { EvaluationGateFailure, OrganizationalUnderstandingProposition, RecoveredProposition } from "./contracts";
import { canonicalHash } from "./canonicalSerialization";
import { normalizeConfidence } from "./confidenceNormalization";
import { collapseExplicitDuplicates } from "./duplicateCollapse";
import { familiesCompatible } from "./familyCompatibility";
import { assignCompletedAdjudications } from "./matchAssignment";
import { PHASE_2_STRUCTURAL_EVALUATOR_VERSION, type Phase2BlockingFailure, type Phase2EvaluationInput, type Phase2FailureCode, type Phase2StructuralResult } from "./phase2Contracts";
import { modalityRelation, polarityRelation, temporalRelation } from "./structuralComparisons";
import { importedRubricRecordHash } from "./importedRubric";
import { IMPORTED_RUBRIC_VERSION } from "./phase2Contracts";

export const GRAPH_INTEGRITY_VALIDATION_VERSION = "graph-integrity-validation/v1" as const;

const failure = (code: Phase2FailureCode, justification: string, propositionRefs: string[] = []): Phase2BlockingFailure => ({ code, blocking: true, justification, propositionRefs: [...new Set(propositionRefs)].sort() });
const subset = (required: string[], active: Set<string>) => required.every((item) => active.has(item));
const validId = (value: string) => typeof value === "string" && value.trim().length > 0;
const validScore = (value: number) => Number.isFinite(value) && value >= 0 && value <= 1;
const propositionRefs = (item: OrganizationalUnderstandingProposition) => [...item.contradictionEndpointRefs, ...item.competingPropositionRefs];
const recoveredRefs = (item: RecoveredProposition) => item.relatedPropositionRefs;

export function validatePhase2Structure(input: Phase2EvaluationInput): Phase2StructuralResult {
  const failures: Phase2BlockingFailure[] = [];
  const add = (code: Phase2FailureCode, detail: string, refs: string[] = []) => failures.push(failure(code, detail, refs));
  const activeScopes = new Set(input.activeAuthorizationScopes);
  if (input.structuralEvaluatorVersion !== PHASE_2_STRUCTURAL_EVALUATOR_VERSION) add("incompatible-evaluator-version", "Structural evaluator version mismatch.");
  if (input.groundTruth.evaluatorVersion !== "oue-001-phase-1" || input.recovered.evaluatorVersion !== "oue-001-phase-1") add("incompatible-evaluator-version", "Phase 1 contract version mismatch.");
  const calculatedGraphHash = canonicalHash(input.groundTruth.propositions);
  if (!input.groundTruth.frozenBeforeTreatmentObservation || input.groundTruth.graphHash !== calculatedGraphHash) add("unfrozen-ground-truth", "Ground-truth graph hash is absent or does not match its propositions.");
  if (input.groundTruth.organizationId !== input.recovered.organizationId) add("organization-contamination", "Ground truth and recovered graph organizations differ.");
  if (input.groundTruth.caseId !== input.recovered.caseId) add("case-contamination", "Ground truth and recovered graph cases differ.");
  if (input.recovered.treatmentRunId !== input.expectedTreatmentRunId) add("cross-run-contamination", "Treatment run identity differs from expected run.");
  if (!/^[a-f0-9]{64}$/.test(input.recovered.inputHash)) add("missing-audit-lineage", "Recovered graph input hash is invalid.");
  const recoveredHash = canonicalHash({ treatmentRunId: input.recovered.treatmentRunId, propositions: input.recovered.propositions });
  if (input.recovered.inputHash !== recoveredHash) add("missing-audit-lineage", "Recovered graph input hash does not match its propositions.");
  const groundTruthById = new Map(input.groundTruth.propositions.map((item) => [item.id, item]));
  const recoveredById = new Map(input.recovered.propositions.map((item) => [item.id, item]));
  if (groundTruthById.size !== input.groundTruth.propositions.length || recoveredById.size !== input.recovered.propositions.length || [...groundTruthById.keys(), ...recoveredById.keys()].some((id) => !validId(id))) add("invalid-proposition", "Proposition identifiers must be nonempty and unique.");
  const evidenceById = new Map(input.evidenceCatalog.map((item) => [item.id, item]));
  if (evidenceById.size !== input.evidenceCatalog.length) add("invalid-reference", "Evidence catalog identifiers must be unique.");
  for (const item of input.evidenceCatalog) {
    if (item.organizationId !== input.groundTruth.organizationId) add("organization-contamination", "Evidence crosses organization boundary.", [item.id]);
    if (item.caseId !== input.groundTruth.caseId) add("case-contamination", "Evidence crosses case boundary.", [item.id]);
    if (!subset(item.authorizationScope, activeScopes)) add("permission-leakage", "Evidence authorization scope is unavailable.", [item.id]);
  }
  for (const item of input.groundTruth.propositions) {
    if (item.organizationId !== input.groundTruth.organizationId) add("organization-contamination", "Ground-truth proposition crosses organization boundary.", [item.id]);
    if (item.caseId !== input.groundTruth.caseId) add("case-contamination", "Ground-truth proposition crosses case boundary.", [item.id]);
    if (!subset(item.authorizationScope, activeScopes)) add("permission-leakage", "Ground-truth proposition is unauthorized.", [item.id]);
    if (!validScore(item.importance) || !validScore(item.decisionRelevance)) add("invalid-proposition", "Importance and decision relevance must be bounded.", [item.id]);
    if (item.expectedConfidence) try { normalizeConfidence({ kind: "interval", minimum: item.expectedConfidence.minimum, maximum: item.expectedConfidence.maximum }); } catch { add("invalid-confidence", "Expected confidence is invalid.", [item.id]); }
    for (const ref of propositionRefs(item)) if (!groundTruthById.has(ref)) add("invalid-reference", "Ground-truth relationship is dangling.", [item.id, ref]);
    for (const ref of [...item.supportingEvidenceRefs, ...item.opposingEvidenceRefs]) if (!evidenceById.has(ref)) add("invalid-reference", "Ground-truth Evidence reference is dangling.", [item.id, ref]);
    validateGroundTruthIntegrity(item, groundTruthById, add);
  }
  const normalizedConfidenceByPropositionId: Phase2StructuralResult["normalizedConfidenceByPropositionId"] = {};
  for (const item of input.recovered.propositions) {
    if (item.organizationId !== input.recovered.organizationId) add("organization-contamination", "Recovered proposition crosses organization boundary.", [item.id]);
    if (item.caseId !== input.recovered.caseId) add("case-contamination", "Recovered proposition crosses case boundary.", [item.id]);
    if (!subset(item.authorizationScope, activeScopes)) add("permission-leakage", "Recovered proposition is unauthorized.", [item.id]);
    try { normalizedConfidenceByPropositionId[item.id] = item.normalizedConfidence ? normalizeConfidence({ kind: "interval", minimum: item.normalizedConfidence.minimum, maximum: item.normalizedConfidence.maximum }) : null; } catch { add("invalid-confidence", "Recovered confidence is invalid.", [item.id]); }
    for (const ref of recoveredRefs(item)) if (!recoveredById.has(ref)) add("invalid-reference", "Recovered relationship is dangling.", [item.id, ref]);
    for (const ref of [...item.supportingEvidenceRefs, ...item.opposingEvidenceRefs]) if (!evidenceById.has(ref)) add("invalid-reference", "Recovered Evidence reference is dangling.", [item.id, ref]);
    validateRecoveredIntegrity(item, recoveredById, add);
  }
  for (const item of input.adjudications) {
    const gt = groundTruthById.get(item.groundTruthPropositionId), recovered = item.recoveredPropositionId ? recoveredById.get(item.recoveredPropositionId) : undefined;
    if (!gt || (item.recoveredPropositionId && !recovered)) { add("invalid-reference", "Adjudication references an unknown proposition.", [item.groundTruthPropositionId, item.recoveredPropositionId ?? ""]); continue; }
    if (!item.adjudicatorRecordRef || !item.justification) add("missing-audit-lineage", "Adjudication audit record is incomplete.", [item.groundTruthPropositionId]);
    if (!validScore(item.meaningAgreement) || !validScore(item.adjudicatorConfidence)) add("invalid-proposition", "Adjudication scores are invalid.", [item.groundTruthPropositionId]);
    if (item.classification === "ambiguous" || item.requiresHumanReview) add("unresolved-material-ambiguity", "Adjudication remains unresolved.", [item.groundTruthPropositionId]);
    if (gt && recovered && ["exact", "equivalent"].includes(item.classification)) {
      if (!familiesCompatible(gt.family, recovered.family)) add("invalid-family", "Exact or equivalent adjudication crosses incompatible families.", [gt.id, recovered.id]);
      if (polarityRelation(gt.polarity, recovered.polarity) !== "exact") add("invalid-polarity", "Exact or equivalent adjudication conflicts in polarity.", [gt.id, recovered.id]);
      if (modalityRelation(gt.modality, recovered.modality) !== "exact") add("invalid-modality", "Exact or equivalent adjudication conflicts in modality.", [gt.id, recovered.id]);
      if (temporalRelation(gt.temporality, recovered.temporality) === "conflict") add("invalid-temporality", "Exact or equivalent adjudication conflicts in time.", [gt.id, recovered.id]);
    }
  }
  if (new Set(input.adjudications.map((item) => item.adjudicationId)).size !== input.adjudications.length) add("incomplete-adjudication", "Adjudication identifiers must be unique.");
  const adjudicatedIds = new Set(input.adjudications.map((item) => item.groundTruthPropositionId));
  const missing = input.groundTruth.propositions.filter((item) => item.requiredForCoverage && !adjudicatedIds.has(item.id));
  if (missing.length) add("incomplete-adjudication", "Required propositions lack adjudication.", missing.map((item) => item.id));
  const rubricByAdjudication = new Map(input.importedRubricJudgments.map((item) => [item.adjudicationId, item]));
  if (rubricByAdjudication.size !== input.importedRubricJudgments.length || input.importedRubricJudgments.some((item) => !input.adjudications.some((adjudication) => adjudication.adjudicationId === item.adjudicationId))) add("incomplete-adjudication", "Imported rubric judgments must uniquely reference active adjudications.");
  const boundedRubric = (values: number[]) => values.every(validScore);
  for (const adjudication of input.adjudications) {
    const family = groundTruthById.get(adjudication.groundTruthPropositionId)?.family;
    const rubric = rubricByAdjudication.get(adjudication.adjudicationId);
    if (!rubric || rubric.source !== "imported" || rubric.rubricVersion !== IMPORTED_RUBRIC_VERSION || rubric.recordHash !== importedRubricRecordHash(rubric)) add("incomplete-adjudication", "Imported rubric provenance, version, or record hash is invalid.", [adjudication.groundTruthPropositionId]);
    const complete = family === "contradiction" ? Boolean(rubric?.contradiction && boundedRubric([rubric.contradiction.endpointFidelity, rubric.contradiction.unresolvedStateFidelity, rubric.contradiction.supportOppositionFidelity]))
      : family === "mechanism" ? Boolean(rubric?.causal && boundedRubric([rubric.causal.modalityAccuracy, rubric.causal.competingMechanismPreservation, rubric.causal.supportOppositionFidelity]))
      : family === "uncertainty" ? Boolean(rubric?.uncertainty && boundedRubric([rubric.uncertainty.appropriateAbstention, rubric.uncertainty.unresolvedStatePreservation]))
      : family === "evidence-gap" ? Boolean(rubric?.evidenceGap && boundedRubric([rubric.evidenceGap.relevance, rubric.evidenceGap.utilityAgreement, rubric.evidenceGap.feasibilityAgreement, rubric.evidenceGap.nonredundancy, rubric.evidenceGap.rankAgreement]))
      : family === "implication" ? Boolean(rubric?.decisionUtility && boundedRubric([rubric.decisionUtility.frozenRubricAgreement])) : true;
    if (!complete) add("incomplete-adjudication", "Imported family-specific rubric judgment is missing or invalid.", [adjudication.groundTruthPropositionId]);
  }
  const metadataByProposition = new Map(input.graphMetadata.map((item) => [item.propositionId, item]));
  if (metadataByProposition.size !== input.graphMetadata.length || input.graphMetadata.some((item) => !groundTruthById.has(item.propositionId))) add("graph-integrity-failure", "Graph metadata must uniquely reference active ground-truth propositions.");
  for (const item of input.groundTruth.propositions) {
    const metadata = metadataByProposition.get(item.id);
    if (item.family === "mechanism" && (!metadata?.mechanism?.explanandumRefs.length || metadata.mechanism.explanandumRefs.some((ref) => !groundTruthById.has(ref)))) add("graph-integrity-failure", "Mechanism explanandum metadata is missing or invalid.", [item.id]);
    if (item.family === "evidence-gap" && (!metadata?.evidenceGap || !validScore(metadata.evidenceGap.priority) || !metadata.evidenceGap.justification || (metadata.evidenceGap.expectedUtility !== undefined && !validScore(metadata.evidenceGap.expectedUtility)))) add("graph-integrity-failure", "Evidence-gap priority, justification, utility, or feasibility metadata is invalid.", [item.id]);
    if (item.family === "prediction" && !metadata?.prediction?.evaluationStatus) add("graph-integrity-failure", "Prediction evaluation status is missing.", [item.id]);
  }
  let collapsedRecovered;
  try { collapsedRecovered = collapseExplicitDuplicates({ graph: input.recovered, groups: input.explicitDuplicateGroups }); } catch (error) { add("graph-integrity-failure", error instanceof Error ? error.message : String(error)); collapsedRecovered = { ...input.recovered, collapsedMemberIds: [], duplicateAuditAncestry: [] }; }
  let assignment: Phase2StructuralResult["assignment"] = [];
  try { assignment = assignCompletedAdjudications(input.adjudications.filter((item) => !collapsedRecovered.collapsedMemberIds.includes(item.recoveredPropositionId ?? ""))); } catch (error) { add("invalid-one-to-one-assignment", error instanceof Error ? error.message : String(error)); }
  return { valid: failures.length === 0, blockingFailures: canonicalFailures(failures), normalizedConfidenceByPropositionId, collapsedRecovered, assignment };
}

function validateGroundTruthIntegrity(item: OrganizationalUnderstandingProposition, byId: Map<string, OrganizationalUnderstandingProposition>, add: (code: Phase2FailureCode, detail: string, refs?: string[]) => void) {
  if (item.family === "contradiction" && (item.contradictionEndpointRefs.length < 2 || item.polarity !== "mixed")) add("graph-integrity-failure", "Contradiction requires at least two endpoints and mixed polarity.", [item.id]);
  if (item.family === "mechanism" && (item.modality !== "causal" || !item.expectedConfidence)) add("graph-integrity-failure", "Mechanism requires causal modality and confidence.", [item.id]);
  if (item.family === "evidence-gap" && (!item.competingPropositionRefs.length && !item.subjectRefs.length)) add("graph-integrity-failure", "Evidence gap lacks an affected proposition or understanding reference.", [item.id]);
  if (item.family === "prediction" && item.temporality?.state !== "future") add("graph-integrity-failure", "Prediction requires future temporality.", [item.id]);
  if (item.id && propositionRefs(item).includes(item.id)) add("graph-integrity-failure", "Self-referential graph edge is prohibited.", [item.id]);
  void byId;
}

function validateRecoveredIntegrity(item: RecoveredProposition, byId: Map<string, RecoveredProposition>, add: (code: Phase2FailureCode, detail: string, refs?: string[]) => void) {
  if (item.family === "contradiction" && (item.relatedPropositionRefs.length < 2 || item.polarity !== "mixed")) add("graph-integrity-failure", "Recovered contradiction lacks endpoints or mixed polarity.", [item.id]);
  if (item.family === "mechanism" && (item.modality !== "causal" || !item.normalizedConfidence)) add("graph-integrity-failure", "Recovered mechanism lacks causal modality or confidence.", [item.id]);
  if (item.family === "evidence-gap" && !item.relatedPropositionRefs.length) add("graph-integrity-failure", "Recovered evidence gap lacks an affected proposition.", [item.id]);
  if (item.family === "prediction" && item.temporality.state !== "future") add("graph-integrity-failure", "Recovered prediction lacks future temporality.", [item.id]);
  if (recoveredRefs(item).includes(item.id)) add("graph-integrity-failure", "Recovered graph contains a prohibited self-cycle.", [item.id]);
  void byId;
}

function canonicalFailures(items: Phase2BlockingFailure[]) { return [...new Map(items.map((item) => [`${item.code}:${item.justification}:${item.propositionRefs.join(",")}`, item])).values()].sort((a, b) => a.code.localeCompare(b.code) || a.justification.localeCompare(b.justification) || a.propositionRefs.join().localeCompare(b.propositionRefs.join())); }

export const structuralInputHash = (input: Phase2EvaluationInput) => canonicalHash(input);
