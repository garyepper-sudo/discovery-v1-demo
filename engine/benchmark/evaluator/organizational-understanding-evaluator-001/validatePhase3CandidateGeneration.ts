import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { canonicalHash, canonicalSerialize } from "./canonicalSerialization";
import { generateDeterministicCandidates, phase3GroundTruthGraphHash, phase3RecoveredGraphHash } from "./generateSemanticCandidates";
import { clonePhase3Input, phase3CorpusSplitManifest, phase3FixtureCases } from "./phase3CandidateFixtures";
import { FAMILY_COMPATIBILITY_VERSION } from "./familyCompatibility";
import { DUPLICATE_COLLAPSE_VERSION } from "./duplicateCollapse";
import { STRUCTURAL_COMPARISON_VERSION, type Phase3Input, type Phase3Result } from "./phase3Contracts";

type Check = { scenario: string; passed: boolean; detail: string };
const checks: Check[] = [];
const check = (scenario: string, passed: boolean, detail: string) => checks.push({ scenario, passed, detail });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const refreshReceipt = (input: Phase3Input) => {
  input.groundTruth.graphHash = phase3GroundTruthGraphHash(input.groundTruth.propositions);
  const content = { evaluatorId: "organizational-understanding-evaluator-001" as const, structuralEvaluatorVersion: "oue-001-phase-2-structural/v1" as const, structuralComparisonVersion: STRUCTURAL_COMPARISON_VERSION, familyCompatibilityVersion: FAMILY_COMPATIBILITY_VERSION, duplicateCollapseVersion: DUPLICATE_COLLAPSE_VERSION, valid: true as const, organizationId: input.organizationId, caseId: input.caseId, recoveredGraphHash: phase3RecoveredGraphHash(input.collapsedRecovered.treatmentRunId, input.collapsedRecovered.propositions), groundTruthGraphHash: input.groundTruth.graphHash };
  const receiptHash = canonicalHash(content);
  input.structuralReceipt = { ...content, receiptId: `phase2-structural-${receiptHash.slice(0, 24)}`, receiptHash };
};
const pairs = (result: Phase3Result) => new Set(result.candidateSets.flatMap((set) => set.candidates.map((edge) => `${edge.recoveredPropositionId}:${edge.groundTruthPropositionId}`)));
const evaluateRecall = (caseId: string) => {
  const fixture = phase3FixtureCases.find((item) => item.id === caseId)!;
  const result = generateDeterministicCandidates(fixture.input);
  const emitted = pairs(result);
  return { result, recall: fixture.expectedCandidatePairs.length ? fixture.expectedCandidatePairs.filter((pair) => emitted.has(`${pair.recoveredPropositionId}:${pair.groundTruthPropositionId}`)).length / fixture.expectedCandidatePairs.length : 1 };
};

async function main() {
  const development = evaluateRecall("phase3-development");
  const holdout = evaluateRecall("phase3-holdout");
  const negative = evaluateRecall("phase3-negative");
  check("A exact candidate", development.recall === 1, `recall=${development.recall}`);
  check("B paraphrased holdout candidate", holdout.recall === 1, `holdout recall=${holdout.recall}`);
  check("C cross-family prohibition", development.result.rejectedProhibitedEdges.some((item) => item.rules.includes("family-incompatible")) && development.result.candidateSets.every((set) => set.candidates.every((edge) => edge.propositionFamily === development.result.candidateSets.find((item) => item.recoveredPropositionId === set.recoveredPropositionId)!.candidates[0]?.propositionFamily)), "incompatible families rejected before candidacy");
  const polarity = clonePhase3Input(); polarity.collapsedRecovered.propositions[0].polarity = polarity.groundTruth.propositions.find((item) => item.family === polarity.collapsedRecovered.propositions[0].family)!.polarity === "affirmed" ? "denied" : "affirmed"; refreshReceipt(polarity);
  check("D polarity incompatibility", generateDeterministicCandidates(polarity).rejectedProhibitedEdges.some((item) => item.recoveredPropositionId === polarity.collapsedRecovered.propositions[0].id && item.rules.includes("polarity-conflict")), "opposite polarity rejected");
  const modality = clonePhase3Input(); modality.collapsedRecovered.propositions[0].modality = "predictive"; refreshReceipt(modality);
  check("E modality incompatibility", generateDeterministicCandidates(modality).rejectedProhibitedEdges.some((item) => item.recoveredPropositionId === modality.collapsedRecovered.propositions[0].id && item.rules.includes("modality-conflict")), "modality conflict rejected");
  const temporal = clonePhase3Input(); const temporalRecovered = temporal.collapsedRecovered.propositions.find((item) => item.family === "prediction")!; temporalRecovered.temporality = { state: "current" }; refreshReceipt(temporal);
  check("F temporal incompatibility", generateDeterministicCandidates(temporal).rejectedProhibitedEdges.some((item) => item.recoveredPropositionId === temporalRecovered.id && item.rules.includes("temporal-conflict")), "temporal conflict rejected");
  const duplicates = clonePhase3Input(); const duplicateTruth = { ...clone(duplicates.groundTruth.propositions[0]), id: "ground-truth-duplicate" }; duplicates.groundTruth.propositions.push(duplicateTruth); duplicates.collapsedRecovered.duplicateAuditAncestry.push({ canonicalRecoveredPropositionId: duplicates.collapsedRecovered.propositions[0].id, memberRecoveredPropositionId: "recovered-duplicate", basis: "exact-structured-equality", canonicalSourceClaimRefs: [], memberSourceClaimRefs: [], canonicalPropositionHash: canonicalHash(duplicates.collapsedRecovered.propositions[0]), memberPropositionHash: canonicalHash(duplicates.collapsedRecovered.propositions[0]) }); refreshReceipt(duplicates);
  const duplicateResult = generateDeterministicCandidates(duplicates);
  check("G duplicate collapse", duplicateResult.duplicateAncestry.some((item) => item.graph === "ground-truth") && duplicateResult.duplicateAncestry.some((item) => item.graph === "recovered") && duplicateResult.emittedCandidateCount === development.result.emittedCandidateCount, "ancestry retained without candidate inflation");
  const organization = clonePhase3Input(); organization.collapsedRecovered.propositions[0].organizationId = "foreign"; refreshReceipt(organization);
  check("H organization isolation", !generateDeterministicCandidates(organization).eligible, "cross-organization input failed closed");
  const caseInput = clonePhase3Input(); caseInput.collapsedRecovered.propositions[0].caseId = "foreign"; refreshReceipt(caseInput);
  check("I case isolation", !generateDeterministicCandidates(caseInput).eligible, "cross-case input failed closed");
  const unauthorized = clonePhase3Input(); unauthorized.activeAuthorizationScopes = [];
  check("J authorization", !generateDeterministicCandidates(unauthorized).eligible, "withheld propositions cannot reach output");
  const tie = clonePhase3Input(); const mechanisms = tie.groundTruth.propositions.filter((item) => item.family === "mechanism"); mechanisms[1].canonicalMeaning = mechanisms[0].canonicalMeaning; mechanisms[1].predicate = mechanisms[0].predicate; mechanisms[1].subjectRefs = clone(mechanisms[0].subjectRefs); mechanisms[1].objectRefs = clone(mechanisms[0].objectRefs); mechanisms[1].supportingEvidenceRefs = clone(mechanisms[0].supportingEvidenceRefs); mechanisms[1].opposingEvidenceRefs = clone(mechanisms[0].opposingEvidenceRefs); mechanisms[1].expectedConfidence = clone(mechanisms[0].expectedConfidence); tie.configuration.maximumCandidatesPerRecovered = 1; refreshReceipt(tie);
  const tieResult = generateDeterministicCandidates(tie); const tiedSet = tieResult.candidateSets.find((item) => item.recoveredPropositionId === "recovered-mechanism-1");
  check("K candidate ambiguity", Boolean(tiedSet && tiedSet.tiedCandidateIds.length > 1), "materially equal candidates remain tied");
  check("L candidate cap tie", tiedSet?.disposition === "overflow" && tiedSet.candidates.length > tie.configuration.maximumCandidatesPerRecovered, "cap preserves the full tied group");
  check("M no-candidate disposition", negative.result.candidateSets[0]?.disposition === "no-candidate", "explicit no-candidate result emitted");
  const familyMetadataFamilies = new Set(development.result.candidateSets.flatMap((set) => set.candidates.filter((edge) => edge.featureObservations.some((item) => item.feature === "family-specific-overlap")).map((edge) => edge.propositionFamily)));
  check("N graph-specific metadata", ["contradiction", "mechanism", "evidence-gap", "prediction"].every((family) => familyMetadataFamilies.has(family as never)), [...familyMetadataFamilies].join(","));
  const permuted = clonePhase3Input(); permuted.groundTruth.propositions.reverse(); permuted.collapsedRecovered.propositions.reverse(); for (const item of permuted.groundTruth.propositions) { item.subjectRefs.reverse(); item.objectRefs.reverse(); item.supportingEvidenceRefs.reverse(); item.opposingEvidenceRefs.reverse(); item.contradictionEndpointRefs.reverse(); item.competingPropositionRefs.reverse(); } for (const item of permuted.collapsedRecovered.propositions) { item.sourceClaimRefs.reverse(); item.subjectRefs.reverse(); item.objectRefs.reverse(); item.supportingEvidenceRefs.reverse(); item.opposingEvidenceRefs.reverse(); item.relatedPropositionRefs.reverse(); } refreshReceipt(permuted);
  const permutedResult = generateDeterministicCandidates(permuted);
  check("O input permutations", permutedResult.resultHash === development.result.resultHash && canonicalSerialize(permutedResult.candidateSets) === canonicalSerialize(development.result.candidateSets) && permutedResult.ledger?.inputHash === development.result.ledger?.inputHash, "result and ledger hashes stable");
  const generatorSource = await readFile(new URL("./generateSemanticCandidates.ts", import.meta.url), "utf8");
  const retrievalSource = await readFile(new URL("./retrievalSignals.ts", import.meta.url), "utf8");
  const preregistrationSource = await readFile(new URL("./PHASE_3_PREREGISTRATION.md", import.meta.url));
  check("P label leakage", !/from ["'].+(Fixtures|Adjudication|Rubric)/u.test(`${generatorSource}\n${retrievalSource}`) && !generatorSource.includes("expectedCandidatePairs") && !retrievalSource.includes("expectedCandidatePairs"), "generator and transitive retrieval feature module import no fixtures, adjudications, rubrics, or labels");
  check("Q holdout isolation", phase3CorpusSplitManifest.holdoutLabelsAvailableToGenerator === false && !generatorSource.includes("phase3CandidateFixtures"), canonicalHash(phase3CorpusSplitManifest));
  check("preregistration content binding", createHash("sha256").update(preregistrationSource).digest("hex") === phase3FixtureCases[0].input.preregistrationHash, phase3FixtureCases[0].input.preregistrationHash);
  let unsafeRejected = false; try { canonicalSerialize({ unsafe: Number.NaN }); } catch { unsafeRejected = true; }
  check("R canonical serialization", unsafeRejected && generateDeterministicCandidates(clonePhase3Input()).resultHash === development.result.resultHash, "unsupported values rejected and hashes stable");
  check("S cross-version isolation", development.result.ledger?.inputVersion.includes("phase-3") === true && development.result.ledger?.structuralEvaluatorVersion === "oue-001-phase-2-structural/v1", "Phase 3 separately versioned and references Phase 2");
  check("T no semantic credit", development.result.semanticAdjudicationPerformed === false && development.result.assignmentPerformed === false && development.result.componentScores === null && development.result.compositeScore === null, "no adjudication, assignment, or score output");
  const malformed = clonePhase3Input(); malformed.collapsedRecovered.propositions[0].relatedPropositionRefs = ["missing"]; refreshReceipt(malformed);
  check("malformed graph rejection", !generateDeterministicCandidates(malformed).eligible, "dangling reference failed closed");
  for (const [name, mutate] of [
    ["receipt evaluator binding", (input: Phase3Input) => { input.structuralReceipt.evaluatorId = "foreign-evaluator" as Phase3Input["structuralReceipt"]["evaluatorId"]; }],
    ["receipt organization binding", (input: Phase3Input) => { input.structuralReceipt.organizationId = "foreign"; }],
    ["receipt case binding", (input: Phase3Input) => { input.structuralReceipt.caseId = "foreign"; }],
    ["receipt graph binding", (input: Phase3Input) => { input.structuralReceipt.recoveredGraphHash = "0".repeat(64); }],
    ["receipt component-version binding", (input: Phase3Input) => { input.structuralReceipt.familyCompatibilityVersion = "foreign" as Phase3Input["structuralReceipt"]["familyCompatibilityVersion"]; }],
    ["receipt identity binding", (input: Phase3Input) => { input.structuralReceipt.receiptId = "foreign"; }],
  ] as const) {
    const input = clonePhase3Input(); mutate(input);
    check(name, !generateDeterministicCandidates(input).eligible, "foreign or altered Phase 2 receipt failed closed");
  }
  check("result and ledger provenance", development.result.candidateSets.every((set) => set.candidates.every((edge) => edge.recoveredAuthorizationScope.length > 0 && edge.groundTruthAuthorizationScope.length > 0)) && development.result.ledger?.canonicalSerializationVersion === "canonical-serialization/v1" && development.result.ledger?.preregistrationHash === phase3FixtureCases[0].input.preregistrationHash && development.result.ledger?.corpusSplitHash === phase3CorpusSplitManifest.identityHash && Boolean(development.result.ledger?.structuralReceiptId && development.result.ledger.structuralReceiptHash), "scope, preregistration, split, receipt, and serialization identities preserved");
  const repeated = generateDeterministicCandidates(clonePhase3Input());
  check("repeated-run and ledger determinism", repeated.resultHash === development.result.resultHash && canonicalSerialize(repeated.ledger) === canonicalSerialize(development.result.ledger), development.result.resultHash);

  const representedFamilies = [...new Set(phase3FixtureCases.filter((item) => item.split !== "negative-control").flatMap((item) => item.expectedCandidatePairs.map((pair) => item.input.groundTruth.propositions.find((truth) => truth.id === pair.groundTruthPropositionId)!.family)))];
  const familyRecall = Object.fromEntries(representedFamilies.map((family) => { const expected = phase3FixtureCases.filter((item) => item.split !== "negative-control").flatMap((item) => item.expectedCandidatePairs.filter((pair) => item.input.groundTruth.propositions.find((truth) => truth.id === pair.groundTruthPropositionId)?.family === family)); const emitted = new Set([...pairs(development.result), ...pairs(holdout.result)]); return [family, expected.filter((pair) => emitted.has(`${pair.recoveredPropositionId}:${pair.groundTruthPropositionId}`)).length / expected.length]; }));
  const allSets = [...development.result.candidateSets, ...holdout.result.candidateSets];
  const averageCandidateCount = allSets.reduce((sum, item) => sum + item.candidates.length, 0) / allSets.length;
  const metrics = { developmentRecall: development.recall, holdoutRecall: holdout.recall, familyRecall, falseExclusionRate: 1 - ((development.recall + holdout.recall) / 2), averageCandidateCount, cartesianReduction: (development.result.reductionRatio + holdout.result.reductionRatio) / 2, ambiguityRate: allSets.filter((item) => item.disposition === "ambiguous").length / allSets.length, tieRate: allSets.filter((item) => item.tiedCandidateIds.length > 1).length / allSets.length, overflowRate: allSets.filter((item) => item.disposition === "overflow").length / allSets.length, noCandidateRate: negative.result.recoveredWithoutCandidate.length / negative.result.candidateSets.length };
  const thresholdsPass = metrics.developmentRecall >= 0.95 && metrics.holdoutRecall >= 0.95 && Object.values(metrics.familyRecall).every((value) => value === 1) && metrics.averageCandidateCount <= 4 && metrics.cartesianReduction >= 0.5;
  const failures = checks.filter((item) => !item.passed);
  const classification = failures.length === 0 && thresholdsPass ? "A — DETERMINISTIC CANDIDATE GENERATION VALIDATED" : failures.every((item) => !["H organization isolation", "I case isolation", "J authorization", "O input permutations", "P label leakage", "T no semantic credit"].includes(item.scenario)) ? "B — SAFE CANDIDATE GENERATION COMPLETE; RECALL OR WORKLOAD INSUFFICIENT" : "FAIL — PHASE 3 SAFETY OR DETERMINISM DEFECT";
  const result = { validation: "organizational-understanding-evaluator-phase-3", classification, preregistrationVersion: "oue-001-phase-3-preregistration/v1", corpusSplitHash: canonicalHash(phase3CorpusSplitManifest), metrics, checks, failures, semanticAdjudicationImplemented: false, humanReviewExecuted: false, externalComparativeValidation002Authorized: false, phase4Authorized: false };
  const directory = path.dirname(new URL(import.meta.url).pathname);
  await writeFile(path.join(directory, "PHASE_3_RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(directory, "PHASE_3_VALIDATION_REPORT.md"), `# Organizational Understanding Evaluator 001 — Phase 3\n\n**Classification:** ${classification}\n\nPhase 3 emits deterministic retrieval candidates only. Candidate edges are not semantic matches, adjudications, assignments, scores, or correctness confidence.\n\n## Preregistered frozen synthetic research corpus\n\n- Development recall: ${metrics.developmentRecall.toFixed(3)}\n- Protected synthetic holdout recall: ${metrics.holdoutRecall.toFixed(3)}\n- Average candidates per recovered proposition: ${metrics.averageCandidateCount.toFixed(3)}\n- Cartesian reduction: ${metrics.cartesianReduction.toFixed(3)}\n- Baseline ambiguity rate: ${metrics.ambiguityRate.toFixed(3)}\n- Baseline tie rate: ${metrics.tieRate.toFixed(3)}\n- Baseline overflow rate: ${metrics.overflowRate.toFixed(3)}\n- Negative-control no-candidate rate: ${metrics.noCandidateRate.toFixed(3)}\n\nThese frozen synthetic results do not establish real-world semantic generalization, independent human validation, Production-distribution performance, or semantic correctness. Zero baseline ambiguity does not imply that realistic cases are unambiguous.\n\nExternal Comparative Validation 002, semantic adjudication, human review, Runtime, Production, Scorecard, frontend, and product integration remain unauthorized.\n`);
  console.log(JSON.stringify({ classification, metrics, failures, phase4Authorized: false, externalComparativeValidation002Authorized: false }, null, 2));
  if (classification.startsWith("FAIL")) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode = 1; });
