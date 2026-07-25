import assert from "node:assert/strict";
import { runCandidateIntelligenceEcologyBenchmark } from "./runCandidateIntelligenceEcologyBenchmark";

const report = runCandidateIntelligenceEcologyBenchmark();
assert.equal(report.results.length, 32);
assert.equal(report.fairness.policySpecificSemanticRules, 0);
assert.equal(report.determinism.repeatedRunByteEqual, true);
assert.equal(report.determinism.reversedOrderPassed, true);
assert.equal(report.adversarial.passed, true);
assert.equal(report.isolation.runtimeHashBefore, report.isolation.runtimeHashAfter);
assert.equal(report.isolation.fixtureHashBefore, report.isolation.fixtureHashAfter);
assert.equal(report.isolation.organizationIdentityStable, true);
assert.equal(report.summaries.ecology.criticalFailures, 0);
assert.equal(report.summaries.ecology.validNovelInsightRecall, 1);
assert.equal(report.summaries.ecology.falsePromotionRate, 0);
assert.equal(report.summaries.strict.validNovelInsightRecall < report.summaries.ecology.validNovelInsightRecall, true);
assert.equal(report.summaries.direct.falsePromotionRate > report.summaries.ecology.falsePromotionRate, true);
assert.equal(report.summaries.direct.criticalFailures > 0, true);
assert.equal(report.summaries["ecology-undisciplined"].criticalFailures > 0, true);
assert.equal(report.classification, "A_CANDIDATE_INTELLIGENCE_ECOLOGY_VALIDATED_FOR_TESTED_SCOPE");

console.log("DISCOVERY BOUNDARY ECOLOGY BENCHMARK");
console.log(`Classification: ${report.classification}`);
console.log(`Development: ${report.partition.development.join(", ")}`);
console.log(`Held-out: ${report.partition.heldOut.join(", ")}`);
console.log(`Permission validation: ${report.partition.permissionValidation.join(", ")}`);
for (const policyId of ["direct", "strict", "ecology", "ecology-undisciplined"] as const) {
  const summary = report.summaries[policyId];
  console.log(`\n${policyId.toUpperCase()}`);
  console.log(`Critical / major failures: ${summary.criticalFailures} / ${summary.majorFailures}`);
  console.log(`Valid Novel Insight Recall: ${summary.validNovelInsightRecall.toFixed(3)}`);
  console.log(`False Promotion Rate: ${summary.falsePromotionRate.toFixed(3)}`);
  console.log(`Premature Suppression Rate: ${summary.prematureSuppressionRate.toFixed(3)}`);
  console.log(`Premature Convergence Rate: ${summary.prematureConvergenceRate.toFixed(3)}`);
  console.log(`Candidate Efficiency: ${summary.candidateEfficiency.toFixed(3)}`);
  console.log(`Mean Time to Valid Promotion: ${summary.meanTimeToValidPromotion.toFixed(3)}`);
  console.log(`Candidates / final authority / transitions: ${summary.candidateObjects} / ${summary.authoritativeObjects} / ${summary.transitions}`);
}
console.log("\nDETERMINISM AND ISOLATION");
console.log(`Repeated byte equality: ${report.determinism.repeatedRunByteEqual ? "PASS" : "FAIL"}`);
console.log(`Reversed ordering: ${report.determinism.reversedOrderPassed ? "PASS" : "FAIL"}`);
console.log(`Adversarial checks: ${report.adversarial.passed ? "PASS" : "FAIL"} (${report.adversarial.checks.length})`);
console.log(`Runtime hash: ${report.isolation.runtimeHashBefore}`);
console.log(`Fixture hash: ${report.isolation.fixtureHashBefore}`);
