import { writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalHash, canonicalSerialize } from "./canonicalSerialization";
import { processImportedSemanticAdjudications, adjudicationInputHash, adjudicationOutputHash } from "./processImportedSemanticAdjudications";
import { clonePhase4Input, createFixtureHumanResolution, createImportedAdjudication, validPhase4Input } from "./phase4ValidationFixtures";
import type { ImportedSemanticAdjudication, Phase4FailureCode, Phase4Input } from "./phase4Contracts";
import type { MatchClassification } from "./contracts";
import { semanticClassificationRubric } from "./semanticAdjudicationRubric";

type Check = { name: string; passed: boolean; metric: string; detail: string };
const checks: Check[] = [];
const check = (name: string, passed: boolean, metric: string, detail: string) => checks.push({ name, passed, metric, detail });
const seal = (item: ImportedSemanticAdjudication) => { item.inputHash = adjudicationInputHash(item); item.outputHash = adjudicationOutputHash(item); return item; };
const first = (input: Phase4Input) => input.importedAdjudications[0];
const rejects = (name: string, mutate: (input: Phase4Input) => void, code: Phase4FailureCode, metric: string) => {
  const input = clonePhase4Input(); mutate(input); const result = processImportedSemanticAdjudications(input);
  check(name, !result.valid && result.failures.some((failure) => failure.code === code) && !result.scores && !result.semanticLedger.compositeScoreEligible, metric, result.failures.map((failure) => failure.code).join(", "));
};

async function main() {
  const baseline = processImportedSemanticAdjudications(validPhase4Input);
  check("complete imported set scores", baseline.valid && Boolean(baseline.scores) && baseline.semanticLedger.compositeScoreEligible, "valid-import", baseline.semanticLedger.outputHash);
  check("all ten proposition families adjudicated", new Set(baseline.completedAdjudications.map((item) => validPhase4Input.phase2Template.groundTruth.propositions.find((truth) => truth.id === item.groundTruthPropositionId)?.family)).size === 10, "family-specific", "10/10 families");
  check("semantic ledger complete", Boolean(baseline.semanticLedger.phase2LedgerHash) && baseline.semanticLedger.importedAdjudicationHashes.length === validPhase4Input.importedAdjudications.length && baseline.semanticLedger.selectedAdjudications.length === validPhase4Input.phase2Template.recovered.propositions.length, "ledger", baseline.semanticLedger.outputHash);
  check("exact versus equivalent bounded reconciliation", baseline.reconciliations.some((item) => item.state === "bounded-reconciliation" && item.selectedClassification === "equivalent"), "reconciliation", "adjacent frozen policy applied");
  check("no live adjudicator or human review", !baseline.liveSemanticAdjudicatorImplemented && !baseline.humanReviewExecuted, "boundary", "imports only");
  check("all families and neutral writing styles frozen", semanticClassificationRubric.examples.length === 10 && semanticClassificationRubric.styleNeutralEquivalentExamples.length === 6, "rubric-consistency", "10 family controls and 6 neutral styles");

  for (const classification of ["exact", "equivalent", "partial", "overgeneralized", "undergeneralized", "contradictory", "unsupported", "irrelevant"] as MatchClassification[]) {
    const input = clonePhase4Input();
    const item = input.importedAdjudications.find((entry) => entry.groundTruthCandidatePropositionId === "condition-1")!;
    item.classification = classification; item.meaningAgreement = ["exact", "equivalent"].includes(classification) ? 1 : ["partial", "overgeneralized", "undergeneralized"].includes(classification) ? 0.5 : 0;
    if (classification === "contradictory") { item.polarityAgreement = false; item.justification.materialConflict = "The imported statement materially denies the candidate condition."; }
    seal(item); const result = processImportedSemanticAdjudications(input);
    check(`rubric classification accepted: ${classification}`, result.valid, "rubric-consistency", result.failures.map((failure) => failure.code).join(", "));
  }
  rejects("ambiguous classification escalates", (input) => { const item = first(input); item.classification = "ambiguous"; item.requiresHumanReview = true; seal(item); }, "unresolved-disagreement", "disagreement-blocking");
  rejects("missing cannot select recovered pair", (input) => { const item = first(input); item.classification = "missing"; seal(item); }, "rubric-inconsistency", "rubric-consistency");
  rejects("exact polarity disagreement rejected", (input) => { const item = first(input); item.classification = "exact"; item.polarityAgreement = false; seal(item); }, "rubric-inconsistency", "rubric-consistency");
  rejects("mechanism without causal agreement rejected", (input) => { const item = input.importedAdjudications.find((entry) => entry.groundTruthCandidatePropositionId === "mechanism-1")!; item.causalAgreement = false; seal(item); }, "family-requirement-failure", "family-specific");
  rejects("contradiction endpoint loss rejected", (input) => { const item = input.importedAdjudications.find((entry) => entry.groundTruthCandidatePropositionId === "contradiction-1")!; item.familyAssessment.endpointFidelity = 0.5; seal(item); }, "family-requirement-failure", "family-specific");
  rejects("family requirements cannot be omitted", (input) => { const item = first(input); item.familyAssessment.requiredElementsConsidered = []; seal(item); }, "family-requirement-failure", "family-specific");

  rejects("candidate hash mismatch rejected", (input) => { const item = first(input); item.candidateSetHash = "0".repeat(64); seal(item); }, "candidate-binding-failure", "candidate-binding");
  rejects("candidate absent rejected", (input) => { const item = first(input); item.groundTruthCandidatePropositionId = "mechanism-1"; seal(item); }, "candidate-binding-failure", "candidate-binding");
  rejects("cross organization rejected", (input) => { const item = first(input); item.organizationId = "foreign-org"; seal(item); }, "organization-contamination", "isolation");
  rejects("cross case rejected", (input) => { const item = first(input); item.caseId = "foreign-case"; seal(item); }, "case-contamination", "isolation");
  rejects("treatment run mismatch rejected", (input) => { const item = first(input); item.treatmentRunId = "foreign-run"; seal(item); }, "treatment-run-contamination", "isolation");
  rejects("evaluator version mismatch rejected", (input) => { const item = first(input); item.evaluatorVersion = "wrong" as typeof item.evaluatorVersion; seal(item); }, "version-contamination", "version");
  rejects("rubric version mismatch rejected", (input) => { const item = first(input); item.adjudicationRubricVersion = "wrong" as typeof item.adjudicationRubricVersion; seal(item); }, "version-contamination", "version");
  rejects("invalid output hash rejected", (input) => { first(input).outputHash = "0".repeat(64); }, "invalid-import", "invalid-import");

  const confidenceEquivalent = clonePhase4Input();
  const numeric = confidenceEquivalent.importedAdjudications[0]; numeric.adjudicatorConfidence = { kind: "numeric", value: 0.82 }; seal(numeric);
  const percentage = confidenceEquivalent.importedAdjudications[1]; percentage.adjudicatorConfidence = { kind: "percentage", value: 82 }; seal(percentage);
  check("confidence representations normalize equivalently", processImportedSemanticAdjudications(confidenceEquivalent).valid, "confidence", "0.82 and 82% eligible");
  const rangedConfidence = clonePhase4Input();
  const qualitative = rangedConfidence.importedAdjudications[2]; qualitative.adjudicatorConfidence = { kind: "qualitative", label: "highly likely" }; seal(qualitative);
  const interval = rangedConfidence.importedAdjudications[3]; interval.adjudicatorConfidence = { kind: "interval", minimum: 0.8, maximum: 0.9 }; seal(interval);
  check("qualitative and interval confidence remain bounded", processImportedSemanticAdjudications(rangedConfidence).valid, "confidence", "highly likely and [0.8,0.9] eligible without point collapse");
  rejects("low confidence escalates", (input) => { const item = first(input); item.adjudicatorConfidence = { kind: "numeric", value: 0.4 }; seal(item); }, "low-adjudicator-confidence", "confidence");
  rejects("absent confidence escalates", (input) => { const item = first(input); item.adjudicatorConfidence = { kind: "absent" }; seal(item); }, "low-adjudicator-confidence", "confidence");

  rejects("material adjudicator disagreement blocks", (input) => { const source = first(input); const conflict = createImportedAdjudication(source.recoveredPropositionId, source.groundTruthCandidatePropositionId, { adjudicatorId: "conflicting-blinded-fixture", classification: "contradictory", polarityAgreement: false, justification: { ...source.justification, materialConflict: "Material opposition." } }); input.importedAdjudications.push(conflict); }, "unresolved-disagreement", "disagreement-blocking");
  rejects("unresolved high-importance ambiguity blocks", (input) => { const source = first(input); const ambiguous = createImportedAdjudication(source.recoveredPropositionId, source.groundTruthCandidatePropositionId, { adjudicatorId: "ambiguous-blinded-fixture", classification: "ambiguous", requiresHumanReview: true }); input.importedAdjudications.push(ambiguous); }, "unresolved-disagreement", "disagreement-blocking");
  rejects("non-blinded confirmatory import rejected", (input) => { const item = first(input); item.blinding.treatmentIdentity = false; seal(item); }, "treatment-identity-leakage", "independence");
  rejects("non-blinded exploratory import cannot score", (input) => { const item = first(input); item.confirmatory = false; item.blinding.treatmentIdentity = false; seal(item); }, "incomplete-adjudication-set", "independence");
  rejects("incomplete set rejected", (input) => { input.importedAdjudications = input.importedAdjudications.filter((item) => item.groundTruthCandidatePropositionId !== "constraint-1"); }, "incomplete-adjudication-set", "completed-set");
  rejects("duplicate semantic credit rejected", (input) => { const item = input.importedAdjudications.find((entry) => entry.groundTruthCandidatePropositionId === "mechanism-2")!; item.groundTruthCandidatePropositionId = "mechanism-1"; const list = input.candidateResult.candidateLists.find((entry) => entry.recoveredPropositionId === item.recoveredPropositionId)!; item.candidateSetHash = canonicalHash(list); seal(item); }, "duplicate-semantic-credit", "completed-set");

  const human = clonePhase4Input();
  const originalFinding = human.importedAdjudications.filter((item) => item.groundTruthCandidatePropositionId === "finding-1");
  const conflict = createImportedAdjudication(originalFinding[0].recoveredPropositionId, "finding-1", { adjudicatorId: "material-conflict-fixture", classification: "contradictory", polarityAgreement: false, justification: { ...originalFinding[0].justification, materialConflict: "Material opposition." } });
  human.importedAdjudications = human.importedAdjudications.filter((item) => item.groundTruthCandidatePropositionId !== "finding-1").concat(originalFinding[0], conflict);
  human.humanResolutions = [createFixtureHumanResolution([originalFinding[0], conflict])];
  const humanResult = processImportedSemanticAdjudications(human);
  check("fixture-authored human resolution imports", humanResult.valid && humanResult.reconciliations.some((item) => item.state === "human-resolved") && !humanResult.humanReviewExecuted, "human-resolution", humanResult.failures.map((failure) => failure.code).join(", "));
  rejects("malformed human resolution rejected", (input) => { const pair = input.importedAdjudications.slice(0, 2); const resolution = createFixtureHumanResolution(pair); resolution.outputHash = "0".repeat(64); input.humanResolutions = [resolution]; }, "invalid-human-resolution", "human-resolution");

  const reordered = clonePhase4Input(); reordered.importedAdjudications.reverse(); reordered.candidateResult.candidateLists.reverse(); reordered.candidateResult.candidateLists.forEach((list) => list.candidates.reverse()); reordered.phase2Template.groundTruth.propositions.reverse(); reordered.phase2Template.recovered.propositions.reverse(); reordered.phase2Template.adjudications.reverse(); reordered.phase2Template.importedRubricJudgments.reverse(); reordered.phase2Template.graphMetadata.reverse(); reordered.phase2Template.evidenceCatalog.reverse();
  const reorderedResult = processImportedSemanticAdjudications(reordered);
  check("reordered input deterministic", reorderedResult.valid && reorderedResult.semanticLedger.outputHash === baseline.semanticLedger.outputHash && canonicalSerialize(reorderedResult.scores) === canonicalSerialize(baseline.scores), "determinism", `${reorderedResult.semanticLedger.outputHash} === ${baseline.semanticLedger.outputHash}`);
  const repeated = processImportedSemanticAdjudications(validPhase4Input);
  check("repeated run deterministic", repeated.semanticLedger.outputHash === baseline.semanticLedger.outputHash && canonicalSerialize(repeated) === canonicalSerialize(baseline), "determinism", baseline.semanticLedger.outputHash);
  check("downstream scoring stable", repeated.scores?.compositeScore === baseline.scores?.compositeScore && canonicalSerialize(repeated.scores?.dimensions) === canonicalSerialize(baseline.scores?.dimensions), "scoring", String(baseline.scores?.compositeScore));

  const failures = checks.filter((item) => !item.passed);
  const rate = (metric: string) => { const rows = checks.filter((item) => item.metric === metric); return rows.length ? rows.filter((item) => item.passed).length / rows.length : 0; };
  const metrics = { validImportAcceptanceRate: rate("valid-import"), invalidImportRejectionRate: Math.min(rate("invalid-import"), rate("isolation"), rate("version")), candidateSetBindingAccuracy: rate("candidate-binding"), rubricConsistencyValidationAccuracy: rate("rubric-consistency"), familySpecificValidationAccuracy: rate("family-specific"), adjudicatorIndependenceEnforcement: rate("independence"), lowConfidenceEscalationAccuracy: rate("confidence"), multiAdjudicatorReconciliationDeterminism: rate("reconciliation"), unresolvedDisagreementBlockingRate: rate("disagreement-blocking"), completedSetValidationAccuracy: rate("completed-set"), semanticLedgerCompleteness: rate("ledger"), downstreamDeterministicScoringStability: rate("scoring"), inputOrderInvariance: checks.find((item) => item.name === "reordered input deterministic")?.passed ? 1 : 0, repeatedRunDeterminism: checks.find((item) => item.name === "repeated run deterministic")?.passed ? 1 : 0, canonicalSerializationStability: checks.find((item) => item.name === "repeated run deterministic")?.passed ? 1 : 0, crossVersionContamination: rate("version") === 1 ? 0 : 1, treatmentIdentityLeakage: rate("independence") === 1 ? 0 : 1, duplicateSemanticCreditInflation: checks.find((item) => item.name === "duplicate semantic credit rejected")?.passed ? 0 : 1 };
  const classification = failures.length ? "FAIL — Imported adjudication boundary not valid" : "PASS — Imported semantic adjudication boundary validated";
  const result = { validation: "organizational-understanding-evaluator-phase-4", classification, metrics, checks, failures, liveSemanticAdjudicatorImplemented: false, humanReviewExecuted: false, externalComparativeValidation002Executed: false, liveOrHumanAdjudicatorDevelopmentAuthorized: failures.length === 0, externalComparativeValidation002Authorized: false };
  const directory = path.dirname(new URL(import.meta.url).pathname);
  await writeFile(path.join(directory, "PHASE_4_RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(directory, "PHASE_4_VALIDATION_REPORT.md"), `# Organizational Understanding Evaluator 001 — Phase 4\n\n**Classification:** ${classification}\n\nFixture-authored or manually imported judgments are validated, reconciled, and bound to exact Phase 3 candidate sets before the unchanged Phase 2 scorer runs. No semantic judgment or human review is executed here.\n\n## Metrics\n\n${Object.entries(metrics).map(([name, value]) => `- ${name}: ${value.toFixed(3)}`).join("\n")}\n\n## Boundary\n\nA PASS authorizes separately validated live or human adjudicator development only. External Comparative Validation 002 remains unauthorized.\n`);
  console.log(JSON.stringify({ classification, metrics, failures, liveOrHumanAdjudicatorDevelopmentAuthorized: result.liveOrHumanAdjudicatorDevelopmentAuthorized, externalComparativeValidation002Authorized: false }, null, 2));
  if (failures.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
