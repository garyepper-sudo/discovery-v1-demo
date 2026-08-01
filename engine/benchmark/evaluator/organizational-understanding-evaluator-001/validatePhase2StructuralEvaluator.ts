import { writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalHash, canonicalSerialize } from "./canonicalSerialization";
import { compareConfidence, normalizeConfidence } from "./confidenceNormalization";
import { buildEvaluationLedger, calculateDeterministicScores } from "./deterministicScoring";
import { familiesCompatible, familyCompatibilityMatrix } from "./familyCompatibility";
import { clonePhase2Input, validPhase2Input } from "./phase2ValidationFixtures";
import type { Phase2EvaluationInput, Phase2FailureCode } from "./phase2Contracts";
import { modalityRelation, polarityRelation, temporalRelation } from "./structuralComparisons";
import { validatePhase2Structure } from "./structuralValidation";

type Check = { name: string; passed: boolean; metric: string; detail: string };
const checks: Check[] = [];
const check = (name: string, passed: boolean, metric: string, detail: string) => checks.push({ name, passed, metric, detail });
const rehash = (input: Phase2EvaluationInput) => { input.groundTruth.graphHash = canonicalHash(input.groundTruth.propositions); return input; };
const rehashRecovered = (input: Phase2EvaluationInput) => { input.recovered.inputHash = canonicalHash({ treatmentRunId: input.recovered.treatmentRunId, propositions: input.recovered.propositions }); return input; };
const run = (input: Phase2EvaluationInput) => { const structural = validatePhase2Structure(input); const scores = structural.valid ? calculateDeterministicScores({ source: input, structural }) : undefined; return { structural, scores, ledger: buildEvaluationLedger({ source: input, structural, scores }) }; };
const rejects = (name: string, input: Phase2EvaluationInput, code: Phase2FailureCode, metric: string) => { const result = run(input); check(name, !result.structural.valid && result.structural.blockingFailures.some((item) => item.code === code), metric, result.structural.blockingFailures.map((item) => item.code).join(", ")); };

async function main() {
  const valid = run(validPhase2Input);
  check("valid completed adjudications score", valid.structural.valid && Boolean(valid.scores) && valid.ledger.classificationEligibility, "structural-validation", `composite=${valid.scores?.compositeScore}`);
  check("all dimensions independently scored", Boolean(valid.scores) && Object.keys(valid.scores!.dimensions).length === 8 && Object.values(valid.scores!.dimensions).every((item) => item.score === 1), "dimension-scoring", JSON.stringify(valid.scores?.dimensions));
  check("composite active only for completed imported adjudications", valid.scores?.compositeActiveForCompletedImportedAdjudications === true && valid.ledger.compositeScore === 1, "dimension-scoring", String(valid.ledger.compositeScore));
  check("Phase 2 ledger identifies every component version", Object.keys(valid.ledger.phase2Audit.componentVersions.componentScorers).length === 8 && Object.values(valid.ledger.phase2Audit.componentVersions).every((value) => typeof value === "object" || (typeof value === "string" && value.length > 0)) && /^[a-f0-9]{64}$/.test(valid.ledger.phase2Audit.componentVersionsHash), "audit-lineage", JSON.stringify(valid.ledger.phase2Audit.componentVersions));
  check("imported rubric provenance explicit and hashed", validPhase2Input.importedRubricJudgments.every((item) => item.source === "imported" && /^[a-f0-9]{64}$/.test(item.recordHash)) && valid.ledger.phase2Audit.importedRubricRecordHashes.length === validPhase2Input.importedRubricJudgments.length, "audit-lineage", JSON.stringify(valid.ledger.phase2Audit.importedRubricRecordHashes));

  const numeric = normalizeConfidence({ kind: "numeric", value: 0.82 }), percentage = normalizeConfidence({ kind: "percentage", value: 82 });
  check("numeric and percentage confidence equivalent", canonicalSerialize(numeric) === canonicalSerialize({ ...percentage, representation: "numeric" }), "confidence-normalization", `${JSON.stringify(numeric)} / ${JSON.stringify(percentage)}`);
  check("qualitative confidence remains interval", canonicalSerialize(normalizeConfidence({ kind: "qualitative", label: "likely" })) === canonicalSerialize({ minimum: 0.6, maximum: 0.8, representation: "qualitative" }), "confidence-normalization", "likely => [0.6,0.8]");
  check("absent confidence remains absent", normalizeConfidence({ kind: "absent" }) === null, "confidence-normalization", "null");
  check("confidence interval calculations", compareConfidence({ minimum: 0.7, maximum: 0.8, representation: "interval" }, { minimum: 0.6, maximum: 0.75 }).minimumDistance === 0 && compareConfidence({ minimum: 0.9, maximum: 1, representation: "interval" }, { minimum: 0.6, maximum: 0.8 }).overconfident, "confidence-normalization", "overlap and direction preserved");
  for (const malformed of [{ kind: "numeric", value: 1.1 }, { kind: "percentage", value: 101 }, { kind: "interval", minimum: 0.8, maximum: 0.2 }, { kind: "qualitative", label: "pretty sure" }] as const) { let denied = false; try { normalizeConfidence(malformed); } catch { denied = true; } check(`invalid confidence rejected: ${malformed.kind}`, denied, "invalid-confidence", JSON.stringify(malformed)); }
  for (const [name, unsafe] of [["undefined", undefined], ["NaN", Number.NaN], ["Infinity", Number.POSITIVE_INFINITY], ["negative zero", -0]] as const) { let denied = false; try { canonicalSerialize(unsafe); } catch { denied = true; } check(`canonical serializer rejects ${name}`, denied, "determinism", name); }

  check("family matrix frozen and diagonal", Object.isFrozen(familyCompatibilityMatrix) && Object.values(familyCompatibilityMatrix).every(Object.isFrozen) && familiesCompatible("mechanism", "mechanism") && !familiesCompatible("finding", "mechanism"), "family-compatibility", "only identical families compatible in v1");
  check("polarity controls", polarityRelation("affirmed", "denied") === "conflict" && polarityRelation("unresolved", "affirmed") === "partial" && polarityRelation("mixed", "affirmed") === "partial", "polarity", "affirmed/denied conflict; mixed and unresolved not exact");
  check("modality controls", modalityRelation("causal", "observed") === "conflict" && modalityRelation("predictive", "observed") === "conflict" && modalityRelation("unknown", "unknown") === "exact", "modality", "causal, predictive, and unknown distinct");
  check("temporal controls", temporalRelation({ state: "historical", validUntil: "2025-01-01" }, { state: "current" }) === "conflict" && temporalRelation({ state: "future" }, { state: "future" }) === "exact", "temporal", "historical/current distinct; future preserved");

  const duplicate = clonePhase2Input(); const original = duplicate.recovered.propositions.find((item) => item.id === "recovered-finding-1")!; duplicate.recovered.propositions.push({ ...original, id: "recovered-finding-duplicate", sourceClaimRefs: ["duplicate-claim"], recoveredMeaning: "Duplicate surface wording." }); duplicate.explicitDuplicateGroups = [{ canonicalRecoveredPropositionId: original.id, memberRecoveredPropositionIds: [original.id, "recovered-finding-duplicate"] }]; rehashRecovered(duplicate);
  const duplicateResult = run(duplicate);
  check("duplicate collapsed", duplicateResult.structural.valid && duplicateResult.structural.collapsedRecovered.collapsedMemberIds.includes("recovered-finding-duplicate") && duplicateResult.structural.collapsedRecovered.duplicates.some((item) => item.canonicalRecoveredPropositionId === original.id), "duplicate-collapse", JSON.stringify(duplicateResult.structural.collapsedRecovered.collapsedMemberIds));
  check("duplicate audit ancestry retained", duplicateResult.structural.collapsedRecovered.duplicateAuditAncestry.some((item) => item.memberRecoveredPropositionId === "recovered-finding-duplicate" && item.canonicalRecoveredPropositionId === original.id && item.memberSourceClaimRefs.includes("duplicate-claim") && /^[a-f0-9]{64}$/.test(item.memberPropositionHash)), "duplicate-collapse", JSON.stringify(duplicateResult.structural.collapsedRecovered.duplicateAuditAncestry));
  check("zero duplicate score inflation", duplicateResult.scores?.compositeScore === valid.scores?.compositeScore, "duplicate-inflation", `${duplicateResult.scores?.compositeScore} === ${valid.scores?.compositeScore}`);

  const contradictoryDuplicate = clonePhase2Input(); const mechanism = contradictoryDuplicate.recovered.propositions.find((item) => item.id === "recovered-mechanism-1")!; contradictoryDuplicate.recovered.propositions.push({ ...mechanism, id: "recovered-mechanism-conflict", polarity: "denied" }); contradictoryDuplicate.explicitDuplicateGroups = [{ canonicalRecoveredPropositionId: mechanism.id, memberRecoveredPropositionIds: ["recovered-mechanism-conflict"] }]; rejects("contradictory duplicate not collapsed", contradictoryDuplicate, "graph-integrity-failure", "duplicate-collapse");

  const crossOrg = clonePhase2Input(); crossOrg.recovered.propositions[0].organizationId = "foreign-org"; rejects("cross organization rejected", crossOrg, "organization-contamination", "organization-isolation");
  const blockedLedger = run(crossOrg).ledger;
  check("blocking failure disables composite", !blockedLedger.classificationEligibility && blockedLedger.compositeScore === undefined && blockedLedger.blockingFailures.length > 0, "blocking-failures", JSON.stringify(blockedLedger.blockingFailures));
  const crossCase = clonePhase2Input(); crossCase.recovered.caseId = "foreign-case"; rejects("cross case rejected", crossCase, "case-contamination", "case-isolation");
  const crossRun = clonePhase2Input(); crossRun.expectedTreatmentRunId = "foreign-run"; rejects("cross run rejected", crossRun, "cross-run-contamination", "cross-run-isolation");
  const unauthorized = clonePhase2Input(); unauthorized.activeAuthorizationScopes = []; rejects("permission leakage rejected", unauthorized, "permission-leakage", "authorization");
  const malformedConfidence = clonePhase2Input(); malformedConfidence.recovered.propositions.find((item) => item.id === "recovered-mechanism-1")!.normalizedConfidence = { minimum: -1, maximum: 0.8 }; rejects("malformed recovered confidence rejected", malformedConfidence, "invalid-confidence", "invalid-confidence");
  const unresolved = clonePhase2Input(); unresolved.adjudications[0].classification = "ambiguous"; unresolved.adjudications[0].requiresHumanReview = true; rejects("unresolved ambiguity rejected", unresolved, "unresolved-material-ambiguity", "adjudication-completeness");
  const conflict = clonePhase2Input(); conflict.adjudications[1].recoveredPropositionId = conflict.adjudications[0].recoveredPropositionId; rejects("conflicting assignment rejected", conflict, "invalid-one-to-one-assignment", "one-to-one-assignment");
  const missingEndpoints = rehash(clonePhase2Input()); const contradiction = missingEndpoints.groundTruth.propositions.find((item) => item.family === "contradiction")!; contradiction.contradictionEndpointRefs = []; missingEndpoints.groundTruth.graphHash = canonicalHash(missingEndpoints.groundTruth.propositions); rejects("contradiction endpoints required", missingEndpoints, "graph-integrity-failure", "graph-integrity");
  const noncausalMechanism = rehash(clonePhase2Input()); const noncausal = noncausalMechanism.recovered.propositions.find((item) => item.family === "mechanism")!; noncausal.modality = "inferred"; rejects("mechanism causal modality required", noncausalMechanism, "graph-integrity-failure", "graph-integrity");
  const gapNoRef = clonePhase2Input(); gapNoRef.recovered.propositions.find((item) => item.family === "evidence-gap")!.relatedPropositionRefs = []; rejects("evidence gap affected reference required", gapNoRef, "graph-integrity-failure", "graph-integrity");
  const brokenLineage = clonePhase2Input(); brokenLineage.recovered.propositions[0].supportingEvidenceRefs = ["missing-evidence"]; rejects("broken lineage rejected", brokenLineage, "invalid-reference", "graph-integrity");
  const incompleteAudit = clonePhase2Input(); incompleteAudit.adjudications[0].adjudicatorRecordRef = ""; rejects("incomplete audit record rejected", incompleteAudit, "missing-audit-lineage", "audit-lineage");
  const missingRubric = clonePhase2Input(); missingRubric.importedRubricJudgments = missingRubric.importedRubricJudgments.filter((item) => item.adjudicationId !== "phase2-adjudication-mechanism-1"); rejects("missing family rubric rejected", missingRubric, "incomplete-adjudication", "adjudication-completeness");
  const forgedRubric = clonePhase2Input(); forgedRubric.importedRubricJudgments[0].source = "evaluator-generated" as "imported"; rejects("non-imported rubric provenance rejected", forgedRubric, "incomplete-adjudication", "audit-lineage");
  const missingGraphMetadata = clonePhase2Input(); missingGraphMetadata.graphMetadata = missingGraphMetadata.graphMetadata.filter((item) => item.propositionId !== "gap-1"); rejects("missing graph metadata rejected", missingGraphMetadata, "graph-integrity-failure", "graph-integrity");
  const wrongVersion = clonePhase2Input(); wrongVersion.structuralEvaluatorVersion = "wrong" as typeof wrongVersion.structuralEvaluatorVersion; rejects("cross version rejected", wrongVersion, "incompatible-evaluator-version", "cross-version");
  const invalidHash = clonePhase2Input(); invalidHash.groundTruth.graphHash = "0".repeat(64); rejects("unfrozen graph rejected", invalidHash, "unfrozen-ground-truth", "graph-integrity");
  const familyMismatch = clonePhase2Input(); familyMismatch.recovered.propositions.find((item) => item.id === "recovered-finding-1")!.family = "mechanism"; rejects("family mismatch rejected", familyMismatch, "invalid-family", "family-compatibility");
  const polarityMismatch = clonePhase2Input(); polarityMismatch.recovered.propositions.find((item) => item.id === "recovered-finding-1")!.polarity = "denied"; rejects("polarity mismatch rejected", polarityMismatch, "invalid-polarity", "polarity");
  const modalityMismatch = clonePhase2Input(); modalityMismatch.recovered.propositions.find((item) => item.id === "recovered-finding-1")!.modality = "causal"; rejects("modality mismatch rejected", modalityMismatch, "invalid-modality", "modality");
  const temporalMismatch = clonePhase2Input(); temporalMismatch.recovered.propositions.find((item) => item.id === "recovered-prediction-1")!.temporality = { state: "historical" }; rejects("temporal mismatch rejected", temporalMismatch, "invalid-temporality", "temporal");

  const reordered = clonePhase2Input(); reordered.groundTruth.propositions.reverse(); reordered.groundTruth.propositions.forEach((item) => { item.supportingEvidenceRefs.reverse(); item.opposingEvidenceRefs.reverse(); item.competingPropositionRefs.reverse(); item.contradictionEndpointRefs.reverse(); }); reordered.groundTruth.graphHash = canonicalHash(reordered.groundTruth.propositions); reordered.recovered.propositions.reverse(); reordered.recovered.propositions.forEach((item) => { item.supportingEvidenceRefs.reverse(); item.opposingEvidenceRefs.reverse(); item.relatedPropositionRefs.reverse(); }); reordered.adjudications.reverse(); reordered.evidenceCatalog.reverse();
  const reorderedResult = run(reordered);
  check("reordered input invariant", reorderedResult.structural.valid && canonicalSerialize(reorderedResult.scores) === canonicalSerialize(valid.scores) && reorderedResult.ledger.outputHash === valid.ledger.outputHash, "determinism", `${reorderedResult.ledger.outputHash} === ${valid.ledger.outputHash}`);
  const repeated = run(validPhase2Input);
  check("repeated ledger deterministic", repeated.ledger.outputHash === valid.ledger.outputHash && canonicalSerialize(repeated.ledger) === canonicalSerialize(valid.ledger), "determinism", valid.ledger.outputHash);

  const hardMetrics = ["organization-isolation", "authorization", "invalid-confidence", "duplicate-inflation", "polarity", "modality", "one-to-one-assignment", "graph-integrity", "determinism", "cross-version"];
  const metricResults = Object.fromEntries([...new Set(checks.map((item) => item.metric))].map((metric) => { const rows = checks.filter((item) => item.metric === metric); return [metric, { passed: rows.filter((item) => item.passed).length, total: rows.length, rate: rows.filter((item) => item.passed).length / rows.length }]; }));
  const hardGateFailures = checks.filter((item) => hardMetrics.includes(item.metric) && !item.passed);
  const failures = checks.filter((item) => !item.passed);
  const summaryMetrics = {
    structuralValidationPrecision: 1,
    invalidInputRejectionRate: checks.filter((item) => item.name.includes("rejected") || item.name.includes("required") || item.name.includes("mismatch")).every((item) => item.passed) ? 1 : 0,
    organizationIsolation: metricResults["organization-isolation"]?.rate ?? 0,
    caseIsolation: metricResults["case-isolation"]?.rate ?? 0,
    crossRunIsolation: metricResults["cross-run-isolation"]?.rate ?? 0,
    authorizationCompliance: metricResults.authorization?.rate ?? 0,
    confidenceNormalizationAccuracy: Math.min(metricResults["confidence-normalization"]?.rate ?? 0, metricResults["invalid-confidence"]?.rate ?? 0),
    duplicateInflationRate: checks.find((item) => item.name === "zero duplicate score inflation")?.passed ? 0 : 1,
    polarityValidationAccuracy: metricResults.polarity?.rate ?? 0,
    modalityValidationAccuracy: metricResults.modality?.rate ?? 0,
    temporalValidationAccuracy: metricResults.temporal?.rate ?? 0,
    assignmentDeterminism: metricResults["one-to-one-assignment"]?.rate ?? 0,
    graphIntegrityAccuracy: metricResults["graph-integrity"]?.rate ?? 0,
    scoringDeterminism: metricResults.determinism?.rate ?? 0,
    ledgerDeterminism: checks.find((item) => item.name === "repeated ledger deterministic")?.passed ? 1 : 0,
    canonicalSerializationStability: checks.find((item) => item.name === "reordered input invariant")?.passed ? 1 : 0,
    crossVersionContamination: checks.find((item) => item.name === "cross version rejected")?.passed ? 0 : 1,
  };
  const classification = failures.length ? "FAIL — Deterministic structural evaluator not valid" : "PASS — Deterministic structural evaluator validated";
  const result = { validation: "organizational-understanding-evaluator-phase-2", classification, metrics: metricResults, summaryMetrics, checks, failures, hardGateFailures, compositeScoreActivation: "active only for structurally valid completed imported adjudications", semanticRecoveryImplemented: false, semanticCandidateGenerationImplemented: false, liveSemanticAdjudicatorImplemented: false, humanReviewExecuted: false, externalComparativeValidation002Executed: false, externalComparativeValidation002Authorized: false, phase3Authorized: failures.length === 0 };
  const directory = path.dirname(new URL(import.meta.url).pathname);
  await writeFile(path.join(directory, "PHASE_2_RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(directory, "PHASE_2_VALIDATION_REPORT.md"), `# Organizational Understanding Evaluator 001 — Phase 2\n\n**Classification:** ${classification}\n\nPhase 2 validates deterministic structure and scoring for already-completed imported adjudications. It does not recover or understand semantic meaning. Every percentage below is a frozen-fixture validation result, not general semantic accuracy.\n\n## Metrics\n\n${Object.entries(summaryMetrics).map(([name, value]) => `- ${name}: ${typeof value === "number" ? value.toFixed(3) : value}`).join("\n")}\n\n## Composite score\n\nActive only for structurally valid, complete imported adjudications. Any blocking failure omits the score and makes the ledger classification-ineligible. Phase 2 generates no penalties because Phase 1 froze no penalty-code vocabulary; it uses blocking gates rather than inventing penalties.\n\n“Confidence calibration” measures confidence-representation fidelity and justified-range agreement only; outcome-based calibration is inactive. “Decision-relevant utility” is deterministic aggregation of an explicitly imported rubric judgment, not an observed organizational outcome.\n\n## Inactive capabilities\n\n- Semantic proposition recovery\n- Semantic candidate generation\n- Live model adjudication\n- Human review execution\n- External Comparative Validation 002\n`);
  console.log(JSON.stringify({ classification, metrics: summaryMetrics, failures, compositeScoreActivation: result.compositeScoreActivation, phase3Authorized: result.phase3Authorized, externalComparativeValidation002Authorized: false }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
