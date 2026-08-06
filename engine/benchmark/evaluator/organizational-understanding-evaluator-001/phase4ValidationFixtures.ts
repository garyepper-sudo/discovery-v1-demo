import type { MatchClassification } from "./contracts";
import { canonicalHash } from "./canonicalSerialization";
import { generateSemanticCandidates } from "./generateSemanticCandidates";
import { PHASE_3_CANDIDATE_GENERATOR_VERSION, type CandidateGenerationInput } from "./phase3Contracts";
import { clonePhase2Input, validPhase2Input } from "./phase2ValidationFixtures";
import {
  HUMAN_RESOLUTION_IMPORT_VERSION,
  PHASE_4_ADJUDICATION_IMPORT_VERSION,
  SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
  type HumanResolutionImport,
  type ImportedSemanticAdjudication,
  type Phase4Input,
} from "./phase4Contracts";
import { familyAdjudicationRequirements } from "./semanticAdjudicationRubric";
import { adjudicationInputHash, adjudicationOutputHash, candidateSetHash } from "./processImportedSemanticAdjudications";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
export const phase4CandidateInput: CandidateGenerationInput = {
  candidateGeneratorVersion: PHASE_3_CANDIDATE_GENERATOR_VERSION,
  groundTruth: clone(validPhase2Input.groundTruth),
  recovered: clone(validPhase2Input.recovered),
  activeAuthorizationScopes: [...validPhase2Input.activeAuthorizationScopes],
};
export const phase4CandidateResult = generateSemanticCandidates(phase4CandidateInput);

export function createImportedAdjudication(
  recoveredPropositionId: string,
  groundTruthCandidatePropositionId: string,
  changes: Partial<ImportedSemanticAdjudication> = {},
): ImportedSemanticAdjudication {
  const list = phase4CandidateResult.candidateLists.find((item) => item.recoveredPropositionId === recoveredPropositionId);
  const truth = validPhase2Input.groundTruth.propositions.find((item) => item.id === groundTruthCandidatePropositionId);
  if (!list || !truth || !list.candidates.some((candidate) => candidate.groundTruthPropositionId === groundTruthCandidatePropositionId)) throw new Error(`Fixture pair is not a Phase 3 candidate: ${recoveredPropositionId}/${groundTruthCandidatePropositionId}`);
  const base: ImportedSemanticAdjudication = {
    importVersion: PHASE_4_ADJUDICATION_IMPORT_VERSION,
    organizationId: validPhase2Input.groundTruth.organizationId,
    caseId: validPhase2Input.groundTruth.caseId,
    treatmentRunId: validPhase2Input.expectedTreatmentRunId,
    evaluatorVersion: "oue-001-phase-1",
    recoveredPropositionId,
    groundTruthCandidatePropositionId,
    candidateGeneratorVersion: PHASE_3_CANDIDATE_GENERATOR_VERSION,
    candidateSetHash: candidateSetHash(list),
    consideredCandidateIds: list.candidates.map((candidate) => candidate.groundTruthPropositionId).sort(),
    adjudicatorId: `blinded-fixture-${recoveredPropositionId}`,
    adjudicationRubricVersion: SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
    adjudicatedAt: "2026-07-31T12:00:00.000Z",
    classification: "equivalent",
    meaningAgreement: 1,
    polarityAgreement: true,
    modalityAgreement: true,
    temporalAgreement: true,
    ...(truth.family === "mechanism" ? { causalAgreement: true, confidenceAgreement: { overlap: 1, absoluteError: 0, directionallyCorrect: true } } : {}),
    lineageAgreement: 1,
    adjudicatorConfidence: { kind: "numeric", value: 0.95 },
    requiresHumanReview: false,
    confirmatory: true,
    blinding: { treatmentIdentity: true, aggregateScore: true, otherTreatmentOutputs: true, expectedWinner: true, commercialImplications: true, discoveryOrigin: true, benchmarkClassification: true },
    familyAssessment: { family: truth.family, requiredElementsConsidered: [...familyAdjudicationRequirements[truth.family]], definingStructurePreserved: true, ...(truth.family === "contradiction" ? { endpointFidelity: 1, unresolvedStatusPreserved: true } : {}), ...(truth.family === "mechanism" ? { causalAgreement: true } : {}) },
    justification: { summary: "Fixture-authored imported semantic judgment; no semantic judgment executed by Phase 4.", preservedElements: [...familyAdjudicationRequirements[truth.family]], omittedOrConflictingElements: [] },
    inputHash: "",
    outputHash: "",
  };
  const item = { ...base, ...changes };
  item.inputHash = changes.inputHash ?? adjudicationInputHash(item);
  item.outputHash = changes.outputHash ?? adjudicationOutputHash(item);
  return item;
}

const imported = validPhase2Input.adjudications.map((item) => createImportedAdjudication(item.recoveredPropositionId!, item.groundTruthPropositionId));
const finding = imported.find((item) => item.groundTruthCandidatePropositionId === "finding-1")!;
imported.push(createImportedAdjudication(finding.recoveredPropositionId, finding.groundTruthCandidatePropositionId, { adjudicatorId: "second-independent-blinded-fixture", classification: "exact", adjudicatedAt: "2026-07-31T12:01:00.000Z" }));

export const validPhase4Input: Phase4Input = {
  candidateInput: phase4CandidateInput,
  candidateResult: phase4CandidateResult,
  phase2Template: clonePhase2Input(),
  importedAdjudications: imported,
  humanResolutions: [],
};
export const clonePhase4Input = () => clone(validPhase4Input);

export function createFixtureHumanResolution(items: ImportedSemanticAdjudication[], classification: MatchClassification = "equivalent"): HumanResolutionImport {
  const finalResolution = createImportedAdjudication(items[0].recoveredPropositionId, items[0].groundTruthCandidatePropositionId, { adjudicatorId: "fixture-human-resolution", classification });
  const base: HumanResolutionImport = {
    importVersion: HUMAN_RESOLUTION_IMPORT_VERSION,
    reviewerIds: ["blinded-reviewer-a", "blinded-reviewer-b"],
    blindingAttestations: [finalResolution.blinding, finalResolution.blinding],
    rubricVersion: SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
    evidencePacketHash: canonicalHash({ pair: `${finalResolution.recoveredPropositionId}/${finalResolution.groundTruthCandidatePropositionId}` }),
    independentAdjudicationHashes: items.map((item) => item.outputHash).sort(),
    disagreementRecord: "Fixture-authored disagreement record; no human review executed.",
    finalResolution,
    rationale: "Fixture-authored bounded resolution.",
    confidence: { kind: "numeric", value: 0.9 },
    startedAt: "2026-07-31T13:00:00.000Z",
    completedAt: "2026-07-31T13:05:00.000Z",
    inputHash: "",
    outputHash: "",
    fixtureAuthored: true,
  };
  base.inputHash = canonicalHash({ evidencePacketHash: base.evidencePacketHash, independentAdjudicationHashes: [...base.independentAdjudicationHashes].sort(), disagreementRecord: base.disagreementRecord });
  const { outputHash: _outputHash, ...content } = base;
  base.outputHash = canonicalHash(content);
  return base;
}

