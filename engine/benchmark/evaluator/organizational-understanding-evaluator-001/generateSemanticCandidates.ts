import type { OrganizationalUnderstandingProposition, RecoveredProposition } from "./contracts";
import { canonicalHash } from "./canonicalSerialization";
import { familiesCompatible, FAMILY_COMPATIBILITY_VERSION } from "./familyCompatibility";
import { DUPLICATE_COLLAPSE_VERSION } from "./duplicateCollapse";
import { modalityRelation, polarityRelation, temporalRelation } from "./structuralComparisons";
import { collectPhase3Features } from "./retrievalSignals";
import {
  PHASE_3_CANDIDATE_GENERATOR_VERSION,
  PHASE_3_CONFIGURATION_VERSION,
  PHASE_3_FEATURE_VERSION,
  PHASE_3_INPUT_VERSION,
  PHASE_3_LEDGER_VERSION,
  PHASE_3_RESULT_VERSION,
  PHASE_3_PREREGISTRATION_VERSION,
  PHASE_3_CORPUS_SPLIT_VERSION,
  STRUCTURAL_COMPARISON_VERSION,
  type Phase3CandidateEdge,
  type Phase3CandidateSet,
  type Phase3DuplicateAncestry,
  type Phase3Failure,
  type Phase3Input,
  type Phase3RejectedEdge,
  type Phase3Result,
  type CandidateGenerationInput,
  type CandidateGenerationResult,
} from "./phase3Contracts";

const families = ["finding", "condition", "constraint", "conclusion", "prediction", "contradiction", "mechanism", "uncertainty", "evidence-gap", "implication"] as const;
const emptyFamilyCounts = () => Object.fromEntries(families.map((family) => [family, 0])) as Phase3Result["candidateCountByFamily"];
const normalizedStructure = (item: OrganizationalUnderstandingProposition) => canonicalHash({ family: item.family, subjectRefs: [...item.subjectRefs].sort(), predicate: item.predicate, objectRefs: [...item.objectRefs].sort(), polarity: item.polarity, modality: item.modality, temporality: item.temporality, supportingEvidenceRefs: [...item.supportingEvidenceRefs].sort(), opposingEvidenceRefs: [...item.opposingEvidenceRefs].sort(), contradictionEndpointRefs: [...item.contradictionEndpointRefs].sort(), competingPropositionRefs: [...item.competingPropositionRefs].sort(), authorizationScope: [...item.authorizationScope].sort() });
const canonicalTruth = (item: OrganizationalUnderstandingProposition) => ({ ...item, subjectRefs: [...item.subjectRefs].sort(), objectRefs: [...item.objectRefs].sort(), supportingEvidenceRefs: [...item.supportingEvidenceRefs].sort(), opposingEvidenceRefs: [...item.opposingEvidenceRefs].sort(), contradictionEndpointRefs: [...item.contradictionEndpointRefs].sort(), competingPropositionRefs: [...item.competingPropositionRefs].sort(), authorizationScope: [...item.authorizationScope].sort(), allowedEquivalentMeanings: [...item.allowedEquivalentMeanings].sort(), prohibitedInterpretations: [...item.prohibitedInterpretations].sort() });
const canonicalRecovered = (item: RecoveredProposition) => ({ ...item, sourceClaimRefs: [...item.sourceClaimRefs].sort(), subjectRefs: [...item.subjectRefs].sort(), objectRefs: [...item.objectRefs].sort(), supportingEvidenceRefs: [...item.supportingEvidenceRefs].sort(), opposingEvidenceRefs: [...item.opposingEvidenceRefs].sort(), relatedPropositionRefs: [...item.relatedPropositionRefs].sort(), authorizationScope: [...item.authorizationScope].sort() });
export const phase3GroundTruthGraphHash = (items: OrganizationalUnderstandingProposition[]) => canonicalHash([...items].map(canonicalTruth).sort((a, b) => a.id.localeCompare(b.id)));
export const phase3RecoveredGraphHash = (treatmentRunId: string, items: RecoveredProposition[]) => canonicalHash({ treatmentRunId, propositions: [...items].map(canonicalRecovered).sort((a, b) => a.id.localeCompare(b.id)) });

function collapseGroundTruth(items: OrganizationalUnderstandingProposition[]) {
  const retained: OrganizationalUnderstandingProposition[] = [];
  const byStructure = new Map<string, OrganizationalUnderstandingProposition>();
  const ancestry: Phase3DuplicateAncestry[] = [];
  for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id))) {
    const structure = normalizedStructure(item);
    const canonical = byStructure.get(structure);
    if (!canonical) { byStructure.set(structure, item); retained.push(item); continue; }
    ancestry.push({ graph: "ground-truth", canonicalPropositionId: canonical.id, memberPropositionId: item.id, canonicalHash: canonicalHash(canonical), memberHash: canonicalHash(item) });
  }
  return { retained, ancestry };
}

const failureResult = (failures: Phase3Failure[]): Phase3Result => ({ resultVersion: PHASE_3_RESULT_VERSION, eligible: false, failures: failures.sort((a, b) => `${a.code}:${a.detail}`.localeCompare(`${b.code}:${b.detail}`)), candidateSets: [], rejectedProhibitedEdges: [], recoveredWithoutCandidate: [], groundTruthWithoutCandidate: [], ambiguousRecovered: [], materiallyTiedRecovered: [], overflowRecovered: [], duplicateAncestry: [], cartesianComparisonCount: 0, structurallyEligibleComparisonCount: 0, emittedCandidateCount: 0, reductionRatio: 0, candidateCountByFamily: emptyFamilyCounts(), resultHash: canonicalHash({ failures }), ledger: null, semanticAdjudicationPerformed: false, assignmentPerformed: false, componentScores: null, compositeScore: null });

function validateInput(input: Phase3Input): Phase3Failure[] {
  const failures: Phase3Failure[] = [];
  const add = (code: Phase3Failure["code"], detail: string, refs: string[] = []) => failures.push({ code, detail, propositionRefs: [...refs].sort() });
  if (input.inputVersion !== PHASE_3_INPUT_VERSION) add("invalid-version", "Phase 3 input version is invalid.");
  if (input.configuration.version !== PHASE_3_CONFIGURATION_VERSION || !Number.isInteger(input.configuration.maximumCandidatesPerRecovered) || input.configuration.maximumCandidatesPerRecovered < 1 || input.configuration.maximumCandidatesPerRecovered > 100 || !Number.isFinite(input.configuration.minimumFeatureScore) || input.configuration.minimumFeatureScore < 0 || input.configuration.minimumFeatureScore > 1) add("invalid-configuration", "Candidate configuration is invalid.");
  const receiptContent = { evaluatorId: input.structuralReceipt.evaluatorId, structuralEvaluatorVersion: input.structuralReceipt.structuralEvaluatorVersion, structuralComparisonVersion: input.structuralReceipt.structuralComparisonVersion, familyCompatibilityVersion: input.structuralReceipt.familyCompatibilityVersion, duplicateCollapseVersion: input.structuralReceipt.duplicateCollapseVersion, valid: input.structuralReceipt.valid, organizationId: input.structuralReceipt.organizationId, caseId: input.structuralReceipt.caseId, recoveredGraphHash: input.structuralReceipt.recoveredGraphHash, groundTruthGraphHash: input.structuralReceipt.groundTruthGraphHash };
  const receiptHash = canonicalHash(receiptContent);
  if (input.structuralReceipt.evaluatorId !== input.evaluatorId || input.structuralReceipt.structuralComparisonVersion !== STRUCTURAL_COMPARISON_VERSION || input.structuralReceipt.familyCompatibilityVersion !== FAMILY_COMPATIBILITY_VERSION || input.structuralReceipt.duplicateCollapseVersion !== DUPLICATE_COLLAPSE_VERSION || input.structuralReceipt.receiptHash !== receiptHash || input.structuralReceipt.receiptId !== `phase2-structural-${receiptHash.slice(0, 24)}`) add("invalid-structural-receipt", "Phase 2 structural receipt identity, component versions, or hash is invalid.");
  if (input.preregistrationVersion !== PHASE_3_PREREGISTRATION_VERSION || input.corpusSplitVersion !== PHASE_3_CORPUS_SPLIT_VERSION || !/^[a-f0-9]{64}$/u.test(input.preregistrationHash) || !/^[a-f0-9]{64}$/u.test(input.corpusSplitHash)) add("invalid-version", "Preregistration or corpus-split identity is invalid.");
  if (input.organizationId !== input.groundTruth.organizationId || input.organizationId !== input.collapsedRecovered.organizationId || input.organizationId !== input.structuralReceipt.organizationId) add("organization-contamination", "Organization identity is inconsistent.");
  if (input.caseId !== input.groundTruth.caseId || input.caseId !== input.collapsedRecovered.caseId || input.caseId !== input.structuralReceipt.caseId) add("case-contamination", "Case identity is inconsistent.");
  const groundTruthHash = phase3GroundTruthGraphHash(input.groundTruth.propositions);
  const recoveredHash = phase3RecoveredGraphHash(input.collapsedRecovered.treatmentRunId, input.collapsedRecovered.propositions);
  if (input.groundTruth.graphHash !== groundTruthHash || input.structuralReceipt.groundTruthGraphHash !== groundTruthHash || input.structuralReceipt.recoveredGraphHash !== recoveredHash) add("invalid-graph-hash", "Input graph hash does not match the structurally validated receipt.");
  const scopes = new Set(input.activeAuthorizationScopes);
  const groundTruthIds = new Set(input.groundTruth.propositions.map((item) => item.id));
  const recoveredIds = new Set(input.collapsedRecovered.propositions.map((item) => item.id));
  for (const item of [...input.groundTruth.propositions, ...input.collapsedRecovered.propositions]) {
    if (item.organizationId !== input.organizationId) add("organization-contamination", "Proposition crosses the organization boundary.", [item.id]);
    if (item.caseId !== input.caseId) add("case-contamination", "Proposition crosses the case boundary.", [item.id]);
    if (!item.authorizationScope.every((scope) => scopes.has(scope))) add("permission-leakage", "Proposition is not authorized.", [item.id]);
    const meaning = "canonicalMeaning" in item ? item.canonicalMeaning : item.recoveredMeaning;
    if (!item.id.trim() || !item.predicate.trim() || !meaning.trim() || !item.authorizationScope.length) add("invalid-proposition", "Material proposition fields are missing.", [item.id]);
  }
  if (new Set(input.groundTruth.propositions.map((item) => item.id)).size !== input.groundTruth.propositions.length || new Set(input.collapsedRecovered.propositions.map((item) => item.id)).size !== input.collapsedRecovered.propositions.length) add("invalid-proposition", "Proposition identities must be unique.");
  for (const item of input.groundTruth.propositions) {
    for (const ref of [...item.contradictionEndpointRefs, ...item.competingPropositionRefs]) if (!groundTruthIds.has(ref) || ref === item.id) add("invalid-reference", "Ground-truth relationship is dangling or self-referential.", [item.id, ref]);
  }
  for (const item of input.collapsedRecovered.propositions) {
    for (const ref of item.relatedPropositionRefs) if (!recoveredIds.has(ref) || ref === item.id) add("invalid-reference", "Recovered relationship is dangling or self-referential.", [item.id, ref]);
  }
  return failures;
}

function structuralEligibility(recovered: RecoveredProposition, truth: OrganizationalUnderstandingProposition) {
  const rules: string[] = [];
  if (!familiesCompatible(truth.family, recovered.family)) rules.push("family-incompatible");
  const polarity = polarityRelation(truth.polarity, recovered.polarity);
  if (polarity === "conflict") rules.push("polarity-conflict");
  const modality = modalityRelation(truth.modality, recovered.modality);
  if (modality === "conflict") rules.push("modality-conflict");
  const temporality = temporalRelation(truth.temporality, recovered.temporality);
  if (temporality === "conflict") rules.push("temporal-conflict");
  return { eligible: rules.length === 0, rules, polarity, modality, temporality };
}

export function generateDeterministicCandidates(input: Phase3Input): Phase3Result {
  const failures = validateInput(input);
  if (failures.length) return failureResult(failures);
  const groundTruthCollapse = collapseGroundTruth(input.groundTruth.propositions);
  const recoveredAncestry: Phase3DuplicateAncestry[] = input.collapsedRecovered.duplicateAuditAncestry.map((item) => ({ graph: "recovered", canonicalPropositionId: item.canonicalRecoveredPropositionId, memberPropositionId: item.memberRecoveredPropositionId, canonicalHash: item.canonicalPropositionHash, memberHash: item.memberPropositionHash }));
  const configurationHash = canonicalHash(input.configuration);
  const rejected: Phase3RejectedEdge[] = [];
  const candidateSets: Phase3CandidateSet[] = [];
  let structurallyEligibleComparisonCount = 0;
  for (const recovered of [...input.collapsedRecovered.propositions].sort((a, b) => a.id.localeCompare(b.id))) {
    const eligible: Phase3CandidateEdge[] = [];
    for (const truth of groundTruthCollapse.retained) {
      const structural = structuralEligibility(recovered, truth);
      if (!structural.eligible) { rejected.push({ recoveredPropositionId: recovered.id, groundTruthPropositionId: truth.id, rules: structural.rules.sort(), edgeHash: canonicalHash({ recoveredPropositionId: recovered.id, groundTruthPropositionId: truth.id, rules: structural.rules.sort() }) }); continue; }
      structurallyEligibleComparisonCount += 1;
      const observations = collectPhase3Features(recovered, truth);
      const featureScore = Number((observations.reduce((sum, item) => sum + item.value, 0) / observations.length).toFixed(6));
      if (featureScore < input.configuration.minimumFeatureScore) continue;
      const edgeBase = { recoveredPropositionId: recovered.id, groundTruthPropositionId: truth.id, organizationId: input.organizationId, caseId: input.caseId, propositionFamily: truth.family, recoveredAuthorizationScope: [...recovered.authorizationScope].sort(), groundTruthAuthorizationScope: [...truth.authorizationScope].sort(), candidateGeneratorVersion: PHASE_3_CANDIDATE_GENERATOR_VERSION, recoveredGraphHash: input.structuralReceipt.recoveredGraphHash, groundTruthGraphHash: input.structuralReceipt.groundTruthGraphHash, applicableStructuralGates: ["authorization", "organization", "case", "family", "polarity", "modality", "temporality"], featureObservations: observations, polarityCompatibility: structural.polarity as "exact" | "partial", modalityCompatibility: "exact" as const, temporalCompatibility: structural.temporality as "exact" | "partial", featureScore, inclusionReasons: observations.filter((item) => item.value > 0).map((item) => item.feature).sort(), evaluatedExclusionRules: ["family-incompatible", "polarity-conflict", "modality-conflict", "temporal-conflict"], configurationId: input.configuration.version, configurationHash };
      const canonicalEdgeHash = canonicalHash(edgeBase);
      eligible.push({ ...edgeBase, candidateEdgeId: `candidate-${canonicalEdgeHash.slice(0, 24)}`, canonicalEdgeHash, candidateTier: 0 });
    }
    const scoreGroups = [...new Set(eligible.map((item) => item.featureScore))].sort((a, b) => b - a);
    const ranked = eligible.map((item) => ({ ...item, candidateTier: scoreGroups.indexOf(item.featureScore) + 1 })).sort((a, b) => a.candidateTier - b.candidateTier || a.canonicalEdgeHash.localeCompare(b.canonicalEdgeHash));
    const cap = input.configuration.maximumCandidatesPerRecovered;
    const cutoffTier = ranked[cap - 1]?.candidateTier;
    const included = cutoffTier === undefined ? ranked : ranked.filter((item) => item.candidateTier <= cutoffTier);
    const overflow = included.length > cap ? included.filter((item) => item.candidateTier === cutoffTier).map((item) => item.candidateEdgeId).sort() : [];
    const topTier = included[0]?.candidateTier;
    const tied = topTier === undefined ? [] : included.filter((item) => item.candidateTier === topTier).map((item) => item.candidateEdgeId).sort();
    const disposition = overflow.length ? "overflow" : tied.length > 1 ? "ambiguous" : included.length ? "candidates" : "no-candidate";
    candidateSets.push({ recoveredPropositionId: recovered.id, candidates: included, disposition, tiedCandidateIds: tied.length > 1 ? tied : [], overflowCandidateIds: overflow });
  }
  const emittedEdges = candidateSets.flatMap((item) => item.candidates);
  const emittedTruthIds = new Set(emittedEdges.map((item) => item.groundTruthPropositionId));
  const candidateCountByFamily = emptyFamilyCounts();
  for (const edge of emittedEdges) candidateCountByFamily[edge.propositionFamily] += 1;
  const cartesianComparisonCount = input.collapsedRecovered.propositions.length * groundTruthCollapse.retained.length;
  const resultBody = { resultVersion: PHASE_3_RESULT_VERSION, candidateSets, rejectedProhibitedEdges: rejected.sort((a, b) => a.edgeHash.localeCompare(b.edgeHash)), recoveredWithoutCandidate: candidateSets.filter((item) => item.candidates.length === 0).map((item) => item.recoveredPropositionId).sort(), groundTruthWithoutCandidate: groundTruthCollapse.retained.filter((item) => !emittedTruthIds.has(item.id)).map((item) => item.id).sort(), ambiguousRecovered: candidateSets.filter((item) => item.disposition === "ambiguous").map((item) => item.recoveredPropositionId).sort(), materiallyTiedRecovered: candidateSets.filter((item) => item.tiedCandidateIds.length > 1).map((item) => item.recoveredPropositionId).sort(), overflowRecovered: candidateSets.filter((item) => item.disposition === "overflow").map((item) => item.recoveredPropositionId).sort(), duplicateAncestry: [...recoveredAncestry, ...groundTruthCollapse.ancestry].sort((a, b) => `${a.graph}:${a.memberPropositionId}`.localeCompare(`${b.graph}:${b.memberPropositionId}`)), cartesianComparisonCount, structurallyEligibleComparisonCount, emittedCandidateCount: emittedEdges.length, reductionRatio: cartesianComparisonCount === 0 ? 0 : Number((1 - emittedEdges.length / cartesianComparisonCount).toFixed(6)), candidateCountByFamily };
  const resultHash = canonicalHash(resultBody);
  const inputHash = canonicalHash({ ...input, activeAuthorizationScopes: [...input.activeAuthorizationScopes].sort(), groundTruth: { ...input.groundTruth, propositions: [...input.groundTruth.propositions].map(canonicalTruth).sort((a, b) => a.id.localeCompare(b.id)) }, collapsedRecovered: { ...input.collapsedRecovered, propositions: [...input.collapsedRecovered.propositions].map(canonicalRecovered).sort((a, b) => a.id.localeCompare(b.id)), collapsedMemberIds: [...input.collapsedRecovered.collapsedMemberIds].sort(), duplicateAuditAncestry: [...input.collapsedRecovered.duplicateAuditAncestry].sort((a, b) => a.memberRecoveredPropositionId.localeCompare(b.memberRecoveredPropositionId)) } });
  const ledger = { ledgerVersion: PHASE_3_LEDGER_VERSION, candidateGeneratorVersion: PHASE_3_CANDIDATE_GENERATOR_VERSION, inputVersion: PHASE_3_INPUT_VERSION, resultVersion: PHASE_3_RESULT_VERSION, featureVersion: PHASE_3_FEATURE_VERSION, configurationVersion: PHASE_3_CONFIGURATION_VERSION, structuralEvaluatorVersion: input.structuralReceipt.structuralEvaluatorVersion, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: input.structuralReceipt.familyCompatibilityVersion, duplicateCollapseVersion: input.structuralReceipt.duplicateCollapseVersion, canonicalSerializationVersion: "canonical-serialization/v1" as const, preregistrationVersion: input.preregistrationVersion, preregistrationHash: input.preregistrationHash, corpusSplitVersion: input.corpusSplitVersion, corpusSplitHash: input.corpusSplitHash, structuralReceiptId: input.structuralReceipt.receiptId, structuralReceiptHash: input.structuralReceipt.receiptHash, inputHash, configurationHash, resultHash, evaluatedAt: input.evaluatedAt, importedAdjudicationHash: null } as const;
  return { ...resultBody, eligible: true, failures: [], resultHash, ledger, semanticAdjudicationPerformed: false, assignmentPerformed: false, componentScores: null, compositeScore: null };
}

function adaptLegacyInput(input: CandidateGenerationInput): Phase3Input {
  const collapsedRecovered: Phase3Input["collapsedRecovered"] = { ...input.recovered, collapsedMemberIds: [], duplicateAuditAncestry: [] };
  const groundTruthGraphHash = phase3GroundTruthGraphHash(input.groundTruth.propositions);
  const recoveredGraphHash = phase3RecoveredGraphHash(input.recovered.treatmentRunId, input.recovered.propositions);
  const receiptContent = { evaluatorId: "organizational-understanding-evaluator-001" as const, structuralEvaluatorVersion: "oue-001-phase-2-structural/v1" as const, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: FAMILY_COMPATIBILITY_VERSION, duplicateCollapseVersion: DUPLICATE_COLLAPSE_VERSION, valid: true as const, organizationId: input.groundTruth.organizationId, caseId: input.groundTruth.caseId, recoveredGraphHash, groundTruthGraphHash };
  const receiptHash = canonicalHash(receiptContent);
  return { inputVersion: PHASE_3_INPUT_VERSION, evaluatorId: "organizational-understanding-evaluator-001", organizationId: input.groundTruth.organizationId, caseId: input.groundTruth.caseId, activeAuthorizationScopes: input.activeAuthorizationScopes, groundTruth: { ...input.groundTruth, graphHash: groundTruthGraphHash }, collapsedRecovered, structuralReceipt: { ...receiptContent, receiptId: `phase2-structural-${receiptHash.slice(0, 24)}`, receiptHash }, configuration: { version: PHASE_3_CONFIGURATION_VERSION, maximumCandidatesPerRecovered: input.maximumCandidates ?? 10, minimumFeatureScore: 0 }, preregistrationVersion: PHASE_3_PREREGISTRATION_VERSION, preregistrationHash: canonicalHash({ compatibilityOnly: true, version: PHASE_3_PREREGISTRATION_VERSION }), corpusSplitVersion: PHASE_3_CORPUS_SPLIT_VERSION, corpusSplitHash: canonicalHash({ compatibilityOnly: true, version: PHASE_3_CORPUS_SPLIT_VERSION }), evaluatedAt: "2026-07-31T12:00:00.000Z" };
}

export function generateSemanticCandidates(input: CandidateGenerationInput): CandidateGenerationResult;
export function generateSemanticCandidates(input: Phase3Input): Phase3Result;
export function generateSemanticCandidates(input: CandidateGenerationInput | Phase3Input): CandidateGenerationResult | Phase3Result {
  if ("inputVersion" in input) return generateDeterministicCandidates(input);
  const result = generateDeterministicCandidates(adaptLegacyInput(input));
  return { candidateGeneratorVersion: PHASE_3_CANDIDATE_GENERATOR_VERSION, valid: result.eligible, failures: result.failures, candidateLists: result.candidateSets.map((set) => ({ recoveredPropositionId: set.recoveredPropositionId, candidates: set.candidates.map((edge) => ({ groundTruthPropositionId: edge.groundTruthPropositionId, retrievalReason: edge.inclusionReasons.join("; "), retrievalFeatureScore: edge.featureScore, supportingStructuralSignals: edge.featureObservations })) })), outputHash: result.resultHash, semanticAdjudicationPerformed: false, benchmarkCreditAssigned: false };
}
