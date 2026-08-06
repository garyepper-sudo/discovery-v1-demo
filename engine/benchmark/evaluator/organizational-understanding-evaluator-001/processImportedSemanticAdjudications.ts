import type { MatchClassification, SemanticAdjudication } from "./contracts";
import { canonicalHash } from "./canonicalSerialization";
import { normalizeConfidence } from "./confidenceNormalization";
import { buildEvaluationLedger, calculateDeterministicScores } from "./deterministicScoring";
import { validatePhase2Structure } from "./structuralValidation";
import {
  PHASE_3_CANDIDATE_GENERATOR_VERSION,
  type RecoveredPropositionCandidateList,
} from "./phase3Contracts";
import {
  HUMAN_RESOLUTION_IMPORT_VERSION,
  PHASE_4_ADJUDICATION_IMPORT_VERSION,
  RECONCILIATION_POLICY_VERSION,
  SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
  SEMANTIC_LEDGER_VERSION,
  type HumanResolutionImport,
  type ImportedSemanticAdjudication,
  type Phase4Failure,
  type Phase4Input,
  type Phase4Result,
  type ReconciliationRecord,
  type SemanticAdjudicationLedger,
} from "./phase4Contracts";
import { ADJUDICATOR_CONFIDENCE_THRESHOLD, adjacentBoundedClassifications, familyAdjudicationRequirements } from "./semanticAdjudicationRubric";

const bounded = (value: number | undefined) => value === undefined || (Number.isFinite(value) && value >= 0 && value <= 1);
const allBlinded = (value: ImportedSemanticAdjudication["blinding"]) => Object.values(value).every(Boolean);
const pairId = (item: ImportedSemanticAdjudication) => `${item.recoveredPropositionId}::${item.groundTruthCandidatePropositionId}`;
export const candidateSetHash = (list: RecoveredPropositionCandidateList) => canonicalHash(list);
export const adjudicationInputHash = (item: ImportedSemanticAdjudication) => canonicalHash({
  organizationId: item.organizationId, caseId: item.caseId, treatmentRunId: item.treatmentRunId,
  evaluatorVersion: item.evaluatorVersion, recoveredPropositionId: item.recoveredPropositionId,
  groundTruthCandidatePropositionId: item.groundTruthCandidatePropositionId,
  candidateGeneratorVersion: item.candidateGeneratorVersion, candidateSetHash: item.candidateSetHash,
  adjudicationRubricVersion: item.adjudicationRubricVersion,
});
export const adjudicationOutputHash = (item: ImportedSemanticAdjudication) => {
  const { outputHash: _outputHash, ...content } = item;
  return canonicalHash(content);
};
const humanOutputHash = (item: HumanResolutionImport) => { const { outputHash: _outputHash, ...content } = item; return canonicalHash(content); };

function validateHumanResolution(item: HumanResolutionImport, activeHashes: Set<string>): string | null {
  if (item.importVersion !== HUMAN_RESOLUTION_IMPORT_VERSION || !item.fixtureAuthored) return "human resolution version or fixture boundary is invalid";
  if (!item.reviewerIds.length || item.reviewerIds.some((id) => !id) || item.blindingAttestations.length !== item.reviewerIds.length || item.blindingAttestations.some((attestation) => !Object.values(attestation).every(Boolean))) return "reviewer identities and blinding attestations are incomplete";
  if (item.rubricVersion !== SEMANTIC_ADJUDICATION_RUBRIC_VERSION || item.independentAdjudicationHashes.some((hash) => !activeHashes.has(hash))) return "human resolution references incompatible rubric or adjudications";
  if (!item.rationale || !item.disagreementRecord || !item.evidencePacketHash || Date.parse(item.startedAt) > Date.parse(item.completedAt)) return "human resolution audit fields are malformed";
  if (item.inputHash !== canonicalHash({ evidencePacketHash: item.evidencePacketHash, independentAdjudicationHashes: [...item.independentAdjudicationHashes].sort(), disagreementRecord: item.disagreementRecord })) return "human resolution input hash is invalid";
  if (item.outputHash !== humanOutputHash(item)) return "human resolution output hash is invalid";
  try { const confidence = normalizeConfidence(item.confidence); if (!confidence || confidence.minimum < ADJUDICATOR_CONFIDENCE_THRESHOLD.confirmatoryMinimum) return "human resolution confidence is insufficient"; } catch { return "human resolution confidence is invalid"; }
  return null;
}

function reconcile(items: ImportedSemanticAdjudication[], resolution?: HumanResolutionImport): ReconciliationRecord {
  const id = pairId(items[0]);
  const hashes = items.map((item) => item.outputHash).sort();
  if (resolution) return { pairId: id, policyVersion: RECONCILIATION_POLICY_VERSION, sourceAdjudicationHashes: hashes, state: "human-resolved", selectedClassification: resolution.finalResolution.classification, selectedAdjudicationHash: resolution.finalResolution.outputHash, reason: "fixture-authored human resolution imported; no human review executed" };
  if (items.some((item) => item.requiresHumanReview || item.classification === "ambiguous")) return { pairId: id, policyVersion: RECONCILIATION_POLICY_VERSION, sourceAdjudicationHashes: hashes, state: "escalation-required", reason: "ambiguity or explicit review requirement remains" };
  const classifications: MatchClassification[] = [...new Set(items.map((item) => item.classification))].sort();
  const materialFieldsAgree = new Set(items.map((item) => `${item.polarityAgreement}:${item.modalityAgreement}:${item.temporalAgreement}:${item.causalAgreement ?? "na"}`)).size === 1;
  if (classifications.length === 1 && materialFieldsAgree) return { pairId: id, policyVersion: RECONCILIATION_POLICY_VERSION, sourceAdjudicationHashes: hashes, state: "accepted", selectedClassification: classifications[0], selectedAdjudicationHash: [...items].sort((a, b) => a.outputHash.localeCompare(b.outputHash))[0].outputHash, reason: "full material agreement" };
  const adjacent = adjacentBoundedClassifications.some((pair) => classifications.length === 2 && pair.every((classification) => classifications.includes(classification as MatchClassification)));
  if (adjacent && materialFieldsAgree) {
    const selected: MatchClassification = classifications.includes("equivalent") ? "equivalent" : classifications.includes("undergeneralized") ? "undergeneralized" : "overgeneralized";
    return { pairId: id, policyVersion: RECONCILIATION_POLICY_VERSION, sourceAdjudicationHashes: hashes, state: "bounded-reconciliation", selectedClassification: selected, selectedAdjudicationHash: [...items].sort((a, b) => a.outputHash.localeCompare(b.outputHash))[0].outputHash, reason: "frozen adjacent bounded disagreement policy" };
  }
  return { pairId: id, policyVersion: RECONCILIATION_POLICY_VERSION, sourceAdjudicationHashes: hashes, state: "escalation-required", reason: "material classification or field-level disagreement" };
}

export function processImportedSemanticAdjudications(input: Phase4Input): Phase4Result {
  const failures: Phase4Failure[] = [];
  const fail = (code: Phase4Failure["code"], refs: string[], detail: string) => failures.push({ code, refs: [...new Set(refs)].sort(), detail });
  const candidateLists = new Map(input.candidateResult.candidateLists.map((list) => [list.recoveredPropositionId, list]));
  const groundTruth = new Map(input.phase2Template.groundTruth.propositions.map((item) => [item.id, item]));
  const recovered = new Map(input.phase2Template.recovered.propositions.map((item) => [item.id, item]));
  const activeHashes = new Set(input.importedAdjudications.map((item) => item.outputHash));
  const validHuman = new Map<string, HumanResolutionImport>();
  for (const resolution of input.humanResolutions) {
    const error = validateHumanResolution(resolution, activeHashes);
    const final = resolution.finalResolution;
    const list = candidateLists.get(final.recoveredPropositionId);
    const bindingInvalid = final.organizationId !== input.phase2Template.groundTruth.organizationId
      || final.caseId !== input.phase2Template.groundTruth.caseId
      || final.treatmentRunId !== input.phase2Template.expectedTreatmentRunId
      || final.inputHash !== adjudicationInputHash(final)
      || final.outputHash !== adjudicationOutputHash(final)
      || !allBlinded(final.blinding)
      || !list?.candidates.some((candidate) => candidate.groundTruthPropositionId === final.groundTruthCandidatePropositionId)
      || final.candidateSetHash !== (list ? candidateSetHash(list) : "");
    if (error || bindingInvalid) fail("invalid-human-resolution", resolution.independentAdjudicationHashes, error ?? "human resolution is not bound to the active candidate pair");
    else validHuman.set(pairId(final), resolution);
  }
  const eligible: ImportedSemanticAdjudication[] = [];
  for (const item of input.importedAdjudications) {
    const refs = [item.recoveredPropositionId, item.groundTruthCandidatePropositionId];
    if (item.importVersion !== PHASE_4_ADJUDICATION_IMPORT_VERSION || item.evaluatorVersion !== "oue-001-phase-1") fail("version-contamination", refs, "import or evaluator version differs");
    if (item.candidateGeneratorVersion !== PHASE_3_CANDIDATE_GENERATOR_VERSION || item.adjudicationRubricVersion !== SEMANTIC_ADJUDICATION_RUBRIC_VERSION) fail("version-contamination", refs, "candidate or rubric version differs");
    if (item.organizationId !== input.phase2Template.groundTruth.organizationId) fail("organization-contamination", refs, "adjudication organization differs");
    if (item.caseId !== input.phase2Template.groundTruth.caseId) fail("case-contamination", refs, "adjudication case differs");
    if (item.treatmentRunId !== input.phase2Template.expectedTreatmentRunId) fail("treatment-run-contamination", refs, "adjudication treatment run differs");
    const list = candidateLists.get(item.recoveredPropositionId);
    if (!list || !list.candidates.some((candidate) => candidate.groundTruthPropositionId === item.groundTruthCandidatePropositionId) || item.candidateSetHash !== (list ? candidateSetHash(list) : "") || canonicalHash([...item.consideredCandidateIds].sort()) !== canonicalHash((list?.candidates.map((candidate) => candidate.groundTruthPropositionId) ?? []).sort())) fail("candidate-binding-failure", refs, "adjudication is not bound to the exact active candidate set");
    if (!groundTruth.has(item.groundTruthCandidatePropositionId) || !recovered.has(item.recoveredPropositionId)) fail("candidate-binding-failure", refs, "adjudication references an inactive proposition");
    if (item.inputHash !== adjudicationInputHash(item) || item.outputHash !== adjudicationOutputHash(item) || !item.adjudicatorId || !item.justification.summary || !Number.isFinite(Date.parse(item.adjudicatedAt)) || !bounded(item.meaningAgreement) || !bounded(item.lineageAgreement)) fail("invalid-import", refs, "adjudication audit hashes or required bounded fields are invalid");
    if (item.confirmatory && !allBlinded(item.blinding)) fail("treatment-identity-leakage", refs, "confirmatory adjudication is not fully blinded");
    if (!item.confirmatory && !allBlinded(item.blinding)) continue;
    let confidenceMinimum = -1;
    try { confidenceMinimum = normalizeConfidence(item.adjudicatorConfidence)?.minimum ?? -1; } catch { fail("invalid-import", refs, "adjudicator confidence representation is invalid"); }
    if (confidenceMinimum < ADJUDICATOR_CONFIDENCE_THRESHOLD.confirmatoryMinimum) fail("low-adjudicator-confidence", refs, "adjudicator confidence requires escalation and cannot reduce semantic credit");
    const truth = groundTruth.get(item.groundTruthCandidatePropositionId);
    const required = truth ? familyAdjudicationRequirements[truth.family] : [];
    if (!truth || item.familyAssessment.family !== truth.family || !item.familyAssessment.definingStructurePreserved || required.some((requirement) => !item.familyAssessment.requiredElementsConsidered.includes(requirement))) fail("family-requirement-failure", refs, "family-defining adjudication requirements are incomplete");
    if (["exact", "equivalent"].includes(item.classification) && (!item.polarityAgreement || !item.modalityAgreement || !item.temporalAgreement)) fail("rubric-inconsistency", refs, "exact or equivalent classification conflicts with material structured fields");
    if (item.classification === "contradictory" && !item.justification.materialConflict) fail("rubric-inconsistency", refs, "contradictory classification lacks a material conflict");
    if (item.classification === "ambiguous" && !item.requiresHumanReview) fail("rubric-inconsistency", refs, "ambiguous classification must require review");
    if (item.classification === "missing") fail("rubric-inconsistency", refs, "missing cannot select a recovered proposition pair");
    if (truth?.family === "mechanism" && ["exact", "equivalent"].includes(item.classification) && item.causalAgreement !== true) fail("family-requirement-failure", refs, "mechanism equivalence requires causal agreement");
    if (truth?.family === "contradiction" && ["exact", "equivalent"].includes(item.classification) && (item.familyAssessment.endpointFidelity ?? 0) < 1) fail("family-requirement-failure", refs, "contradiction equivalence requires endpoint fidelity");
    if (!failures.some((failure) => failure.refs.some((ref) => refs.includes(ref)))) eligible.push(item);
  }

  const grouped = new Map<string, ImportedSemanticAdjudication[]>();
  for (const item of eligible) grouped.set(pairId(item), [...(grouped.get(pairId(item)) ?? []), item]);
  for (const [id, resolution] of validHuman) {
    const expectedHashes = (grouped.get(id) ?? []).map((item) => item.outputHash).sort();
    if (canonicalHash(expectedHashes) !== canonicalHash([...resolution.independentAdjudicationHashes].sort())) {
      fail("invalid-human-resolution", resolution.independentAdjudicationHashes, "human resolution does not reference exactly the active disagreement records");
      validHuman.delete(id);
    }
  }
  const reconciliations = [...grouped.entries()].map(([id, items]) => reconcile(items, validHuman.get(id))).sort((a, b) => a.pairId.localeCompare(b.pairId));
  for (const item of reconciliations.filter((record) => record.state === "escalation-required")) fail("unresolved-disagreement", [item.pairId], item.reason);
  const selected: SemanticAdjudication[] = [];
  for (const reconciliation of reconciliations.filter((record) => record.selectedClassification && record.selectedAdjudicationHash)) {
    const resolution = validHuman.get(reconciliation.pairId);
    const source = resolution?.finalResolution ?? eligible.find((item) => item.outputHash === reconciliation.selectedAdjudicationHash);
    if (!source) continue;
    selected.push({ adjudicationId: `phase4-${canonicalHash(reconciliation).slice(0, 20)}`, groundTruthPropositionId: source.groundTruthCandidatePropositionId, recoveredPropositionId: source.recoveredPropositionId, classification: reconciliation.selectedClassification!, meaningAgreement: source.meaningAgreement, polarityAgreement: source.polarityAgreement, modalityAgreement: source.modalityAgreement, temporalAgreement: source.temporalAgreement, ...(source.causalAgreement !== undefined ? { causalAgreement: source.causalAgreement } : {}), ...(source.confidenceAgreement ? { confidenceAgreement: source.confidenceAgreement } : {}), ...(source.lineageAgreement !== undefined ? { lineageAgreement: source.lineageAgreement } : {}), justification: source.justification.summary, adjudicatorConfidence: normalizeConfidence(source.adjudicatorConfidence)?.minimum ?? 0, requiresHumanReview: false, adjudicatorRecordRef: source.outputHash });
  }
  const selectedRecovered = new Set(selected.map((item) => item.recoveredPropositionId));
  const selectedTruth = new Set(selected.map((item) => item.groundTruthPropositionId));
  if (selectedRecovered.size !== selected.length || selectedTruth.size !== selected.length) fail("duplicate-semantic-credit", selected.flatMap((item) => [item.recoveredPropositionId ?? "", item.groundTruthPropositionId]), "selected adjudications attempt duplicate semantic credit");
  const missingRecovered = [...recovered.keys()].filter((id) => !selectedRecovered.has(id));
  const missingTruth = [...groundTruth.values()].filter((item) => item.requiredForCoverage && !selectedTruth.has(item.id)).map((item) => item.id);
  if (missingRecovered.length || missingTruth.length) fail("incomplete-adjudication-set", [...missingRecovered, ...missingTruth], "every recovered and required ground-truth proposition needs a resolved selected or explicit unmatched state");

  let scores; let phase2LedgerHash: string | undefined; let dimensions;
  if (!failures.length) {
    const rubricByOriginalAdjudication = new Map(input.phase2Template.importedRubricJudgments.map((item) => [item.adjudicationId, item]));
    const rubricByTruth = new Map(input.phase2Template.adjudications.map((item) => [item.groundTruthPropositionId, rubricByOriginalAdjudication.get(item.adjudicationId)!]));
    const phase2Input = { ...input.phase2Template, adjudications: selected, importedRubricJudgments: selected.map((item) => ({ ...rubricByTruth.get(item.groundTruthPropositionId)!, adjudicationId: item.adjudicationId })) };
    const structural = validatePhase2Structure(phase2Input);
    if (!structural.valid) for (const failure of structural.blockingFailures) fail("incomplete-adjudication-set", failure.propositionRefs, `Phase 2 gate: ${failure.code}: ${failure.justification}`);
    else { scores = calculateDeterministicScores({ source: phase2Input, structural }); const ledger = buildEvaluationLedger({ source: phase2Input, structural, scores }); phase2LedgerHash = ledger.outputHash; dimensions = scores.dimensions; }
  }
  const ledgerBase: Omit<SemanticAdjudicationLedger, "outputHash"> = { ledgerVersion: SEMANTIC_LEDGER_VERSION, organizationId: input.phase2Template.groundTruth.organizationId, caseId: input.phase2Template.groundTruth.caseId, treatmentRunId: input.phase2Template.expectedTreatmentRunId, observableInputHash: input.phase2Template.recovered.inputHash, recoveredGraphHash: canonicalHash(input.phase2Template.recovered), candidateGeneratorVersion: input.candidateResult.candidateGeneratorVersion, candidateSetHashes: [...candidateLists.values()].map(candidateSetHash).sort(), importedAdjudicationHashes: input.importedAdjudications.map((item) => item.outputHash).sort(), reconciliations, selectedAdjudications: selected.sort((a, b) => a.adjudicationId.localeCompare(b.adjudicationId)), ...(phase2LedgerHash ? { phase2LedgerHash } : {}), ...(dimensions ? { dimensionScores: dimensions } : {}), compositeScoreEligible: failures.length === 0 && Boolean(scores) };
  const semanticLedger = { ...ledgerBase, outputHash: canonicalHash(ledgerBase) };
  return { valid: failures.length === 0, failures: [...new Map(failures.map((item) => [`${item.code}:${item.refs.join(",")}:${item.detail}`, item])).values()].sort((a, b) => a.code.localeCompare(b.code) || a.refs.join().localeCompare(b.refs.join())), reconciliations, completedAdjudications: selected, ...(scores ? { scores } : {}), semanticLedger, humanReviewExecuted: false, liveSemanticAdjudicatorImplemented: false };
}
