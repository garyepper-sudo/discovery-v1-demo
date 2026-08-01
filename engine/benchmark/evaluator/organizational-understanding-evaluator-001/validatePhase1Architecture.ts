import { writeFile } from "node:fs/promises";
import path from "node:path";
import { ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION } from "./contracts";
import { evaluatorValidationGates, scoringDecomposition } from "./scoringDecomposition";
import { evaluatorComponentVersions, frozenSemanticRules, matchClassifications, propositionFamilies, qualitativeConfidenceRanges } from "./frozenSemantics";
import { assertPhase1Scoreable, phase1UnavailableImplementations } from "./interfaces";
import { phase1ExpectedAdjudicationFixtures, phase1GroundTruthFixture, phase1RecoveredFixture } from "./validationFixtures";

async function main() {
  const checks: Array<{ name: string; passed: boolean; detail: string }> = [];
  const check = (name: string, passed: boolean, detail: string) => checks.push({ name, passed, detail });
  check("version frozen", ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION === "oue-001-phase-1", ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION);
  check("critical components independently versioned", Object.values(evaluatorComponentVersions).every(Boolean) && evaluatorComponentVersions.adjudicatorModel === "not-implemented" && evaluatorComponentVersions.deterministicScorer === "not-implemented", JSON.stringify(evaluatorComponentVersions));
  check("ten proposition families", propositionFamilies.length === 10 && new Set(propositionFamilies).size === 10, propositionFamilies.join(", "));
  check("ten match classifications", matchClassifications.length === 10 && matchClassifications.includes("ambiguous") && matchClassifications.includes("contradictory"), matchClassifications.join(", "));
  const ranges = Object.values(qualitativeConfidenceRanges);
  check("confidence ranges bounded", ranges.every((item) => item.minimum >= 0 && item.maximum <= 1 && item.minimum <= item.maximum), JSON.stringify(ranges));
  check("confidence range continuum", ranges[0].minimum === 0 && ranges.at(-1)?.maximum === 1 && ranges.slice(1).every((item, index) => item.minimum === ranges[index].maximum), "0 through 1 without gaps");
  check("scoring weights sum to one", Math.abs(Object.values(scoringDecomposition).reduce((sum, item) => sum + item.weight, 0) - 1) < 1e-12, String(Object.values(scoringDecomposition).reduce((sum, item) => sum + item.weight, 0)));
  check("scoring decomposed", Object.keys(scoringDecomposition).length === 8 && Object.values(scoringDecomposition).every((item) => item.numerator && item.denominator && item.prohibitedCredit.length), "eight independently reportable components");
  check("scoring semantics deeply frozen", Object.isFrozen(scoringDecomposition) && Object.values(scoringDecomposition).every((item) => Object.isFrozen(item) && Object.isFrozen(item.prohibitedCredit)), "weights, formulas, and prohibited-credit rules immutable");
  check("strict pre-comparative gates", evaluatorValidationGates.semanticEquivalenceRecallMinimum === 0.95 && evaluatorValidationGates.semanticDistinctionPrecisionMinimum === 0.98 && evaluatorValidationGates.humanConsensusAgreementMinimum === 0.9, JSON.stringify(evaluatorValidationGates));
  check("ground truth frozen before treatment", phase1GroundTruthFixture.frozenBeforeTreatmentObservation && /^[a-f0-9]{64}$/.test(phase1GroundTruthFixture.graphHash), phase1GroundTruthFixture.graphHash);
  check("fixture identity aligned", phase1GroundTruthFixture.organizationId === phase1RecoveredFixture.organizationId && phase1GroundTruthFixture.caseId === phase1RecoveredFixture.caseId, `${phase1GroundTruthFixture.organizationId}/${phase1GroundTruthFixture.caseId}`);
  check("all proposition families fixture-covered", propositionFamilies.every((family) => phase1GroundTruthFixture.propositions.some((item) => item.family === family) && phase1RecoveredFixture.propositions.some((item) => item.family === family)), `${new Set(phase1GroundTruthFixture.propositions.map((item) => item.family)).size}/${propositionFamilies.length} families`);
  check("equivalence and distinction fixtures", phase1ExpectedAdjudicationFixtures.some((item) => item.expectedClassification === "equivalent") && phase1ExpectedAdjudicationFixtures.some((item) => item.expectedClassification === "contradictory") && phase1ExpectedAdjudicationFixtures.some((item) => item.expectedClassification === "partial"), `${phase1ExpectedAdjudicationFixtures.length} fixtures`);
  check("ambiguity requires human review", phase1ExpectedAdjudicationFixtures.filter((item) => item.expectedClassification === "ambiguous").every((item) => item.expectedHumanReview), "all ambiguous fixtures routed to review");
  check("duplicates retained without credit semantics", phase1RecoveredFixture.duplicates.length === 1 && frozenSemanticRules.duplicatedClaimsProduceAdditionalCredit === false, JSON.stringify(phase1RecoveredFixture.duplicates));
  let missingAdjudicationDenied = false;
  try { assertPhase1Scoreable({ groundTruth: phase1GroundTruthFixture, recovered: phase1RecoveredFixture, adjudications: [] }); } catch { missingAdjudicationDenied = true; }
  check("missing adjudication fails closed", missingAdjudicationDenied, "required propositions cannot be scored without adjudications");
  let ambiguityDenied = false;
  try { assertPhase1Scoreable({ groundTruth: phase1GroundTruthFixture, recovered: phase1RecoveredFixture, adjudications: phase1GroundTruthFixture.propositions.map((item) => ({ adjudicationId: `a-${item.id}`, groundTruthPropositionId: item.id, classification: item.id === "mechanism-1" ? "ambiguous" : "missing", meaningAgreement: 0, polarityAgreement: false, modalityAgreement: false, temporalAgreement: false, justification: "fixture", adjudicatorConfidence: 0.5, requiresHumanReview: item.id === "mechanism-1", adjudicatorRecordRef: "fixture-record" })) }); } catch { ambiguityDenied = true; }
  check("unresolved ambiguity fails closed", ambiguityDenied, "ambiguous material adjudication cannot be scored");
  let unknownReferenceDenied = false;
  try { assertPhase1Scoreable({ groundTruth: phase1GroundTruthFixture, recovered: phase1RecoveredFixture, adjudications: [{ adjudicationId: "unknown", groundTruthPropositionId: "unknown", recoveredPropositionId: "unknown", classification: "equivalent", meaningAgreement: 1, polarityAgreement: true, modalityAgreement: true, temporalAgreement: true, justification: "fixture", adjudicatorConfidence: 1, requiresHumanReview: false, adjudicatorRecordRef: "fixture-record" }] }); } catch { unknownReferenceDenied = true; }
  check("unknown adjudication references fail closed", unknownReferenceDenied, "unrecognized ground-truth or recovered references cannot be scored");
  check("live implementations absent", Object.values(phase1UnavailableImplementations).every((item) => item === "not-implemented" || item === "prohibited"), JSON.stringify(phase1UnavailableImplementations));
  const failed = checks.filter((item) => !item.passed);
  const result = { validation: "organizational-understanding-evaluator-phase-1", classification: failed.length ? "FAIL — Phase 1 architecture incomplete" : "PASS — Phase 1 architecture complete; evaluator inactive", evaluatorVersion: ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION, checks, failures: failed, liveSemanticAdjudicatorImplemented: false, externalComparativeValidation002Executed: false, externalComparativeValidation002Authorized: false };
  const directory = path.dirname(new URL(import.meta.url).pathname);
  await writeFile(path.join(directory, "PHASE_1_VALIDATION_REPORT.md"), `# Organizational Understanding Evaluator — Phase 1 Validation\n\n**Classification:** ${result.classification}\n\nContracts, frozen semantics, scoring decomposition, fixtures, and fail-closed ports are present. Proposition recovery, candidate generation, live semantic adjudication, deterministic scoring, and comparative execution remain deliberately unavailable.\n\n${checks.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.name} — ${item.detail}`).join("\n")}\n`);
  await writeFile(path.join(directory, "PHASE_1_RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
