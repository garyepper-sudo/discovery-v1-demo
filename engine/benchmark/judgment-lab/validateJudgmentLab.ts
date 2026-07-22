import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

import { atlasDecisiveEvidenceIds, atlasFullCorpusPerspective, atlasIndustrialArtifacts, atlasIndustrialGroundTruth, atlasIndustrialOrganization, atlasNarrowPerspective } from "./atlasIndustrialPilot";
import { evaluateJudgment } from "./evaluateJudgment";
import { buildEngineEvidenceContext, runJudgmentLab, selectPerspectiveArtifacts } from "./runJudgmentLab";

const fixedTimestamp = "2026-07-01T12:00:00.000Z";
const checks: string[] = [];
const check = (name: string, assertion: () => void) => { assertion(); checks.push(name); };

const full = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: atlasFullCorpusPerspective, fixedTimestamp });
const repeated = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: atlasFullCorpusPerspective, fixedTimestamp });
const reordered = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: [...atlasIndustrialArtifacts].reverse(), perspective: atlasFullCorpusPerspective, fixedTimestamp });
const narrow = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: atlasNarrowPerspective, fixedTimestamp });
const removed = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: atlasFullCorpusPerspective, fixedTimestamp, removedArtifactIds: atlasDecisiveEvidenceIds });
const stableOutput = (left: typeof full, right: typeof full) => JSON.stringify(left.output) === JSON.stringify(right.output);
const strongSensitivity =
  full.output.dominantUnderstanding !== removed.output.dominantUnderstanding ||
  full.output.primaryConstraint !== removed.output.primaryConstraint ||
  full.output.recommendation !== removed.output.recommendation ||
  full.output.confidence !== removed.output.confidence ||
  JSON.stringify(full.output.uncertainty) !== JSON.stringify(removed.output.uncertainty);
const limitedSensitivity = JSON.stringify(full.output.missingEvidence) !== JSON.stringify(removed.output.missingEvidence);
const sensitivityObserved = strongSensitivity ? "strong" : limitedSensitivity ? "limited" : "none";
const evaluation = evaluateJudgment({ run: full, groundTruth: atlasIndustrialGroundTruth, perspective: atlasFullCorpusPerspective, repeatedStable: stableOutput(full, repeated), orderStable: stableOutput(full, reordered), sensitivityObserved });

check("Hidden ground truth is absent from engine evidence", () => {
  assert.equal(full.engineInput.includes(atlasIndustrialGroundTruth.id), false);
  assert.equal(full.engineInput.includes(atlasIndustrialGroundTruth.dominantConstraint.rationale), false);
});
check("Perspective filtering includes only authorized artifacts", () => assert.deepEqual(selectPerspectiveArtifacts(atlasIndustrialArtifacts, atlasNarrowPerspective).map((item) => item.id), atlasNarrowPerspective.evidenceAccess.includedArtifactIds.slice().sort()));
check("Repeated runs are deterministic", () => assert.equal(stableOutput(full, repeated), true));
check("Input reordering is stable", () => assert.equal(stableOutput(full, reordered), true));
check("Full and narrow evidence scenarios remain distinct", () => assert.notDeepEqual(full.evidenceArtifactIds, narrow.evidenceArtifactIds));
check("Decisive-evidence sensitivity is evaluated", () => assert.equal(evaluation.scorecard.sensitivity.score, sensitivityObserved === "strong" ? 5 : sensitivityObserved === "limited" ? 3 : 1));
check("Scorecard dimensions remain separate", () => assert.equal(Object.keys(evaluation.scorecard).length, 10));
check("No aggregate score is produced", () => assert.equal("overallScore" in evaluation.scorecard, false));
check("Failure classification is deterministic", () => assert.deepEqual(evaluation.failures, evaluateJudgment({ run: full, groundTruth: atlasIndustrialGroundTruth, perspective: atlasFullCorpusPerspective, repeatedStable: true, orderStable: true, sensitivityObserved }).failures));
check("Scoring contains no pilot-specific wording", () => {
  const scoring = fs.readFileSync(path.join(__dirname, "evaluateJudgment.ts"), "utf8");
  assert.doesNotMatch(scoring, /Atlas Industrial|decision authority ambiguity/i);
});
check("Role metadata does not alter engine cognition", () => {
  const metadataVariant = { ...atlasFullCorpusPerspective, id: "metadata-variant", role: "Unrelated role", defaultHypotheses: ["unrelated hypothesis"] };
  const variant = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: metadataVariant, fixedTimestamp });
  assert.deepEqual(variant.output, full.output);
});
check("Ground-truth tags never enter ingestion", () => {
  const context = buildEngineEvidenceContext(atlasIndustrialArtifacts);
  for (const item of atlasIndustrialArtifacts.flatMap((artifact) => artifact.groundTruthTags ?? [])) assert.equal(context.includes(item), false);
});
check("Visible communication passes language checks", () => assert.equal(evaluation.scorecard.executiveCommunication.score, 5));
check("No production Runtime schema is used for evaluation metadata", () => assert.equal(full.engineInput.includes("groundTruthTags"), false));
check("Fixed timestamp is retained by the evaluation result", () => assert.equal(full.fixedTimestamp, fixedTimestamp));

console.log("\nJUDGMENT LAB FRAMEWORK VALIDATION");
for (const name of checks) console.log(`PASS  ${name}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
console.log(`Sensitivity observed: ${sensitivityObserved}`);
