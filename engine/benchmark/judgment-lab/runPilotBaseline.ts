import { atlasDecisiveEvidenceIds, atlasFullCorpusPerspective, atlasIndustrialArtifacts, atlasIndustrialGroundTruth, atlasIndustrialOrganization, atlasIndustrialPerspectives, atlasNarrowPerspective } from "./atlasIndustrialPilot";
import { evaluateJudgment } from "./evaluateJudgment";
import { runJudgmentLab } from "./runJudgmentLab";
import type { ExecutivePerspective, JudgmentEvaluation, JudgmentLabRunResult } from "./contracts";

const fixedTimestamp = "2026-07-01T12:00:00.000Z";
const stable = (left: JudgmentLabRunResult, right: JudgmentLabRunResult) => JSON.stringify(left.output) === JSON.stringify(right.output);
const perspectives: ExecutivePerspective[] = [...atlasIndustrialPerspectives, atlasFullCorpusPerspective, atlasNarrowPerspective];
const full = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: atlasFullCorpusPerspective, fixedTimestamp });
const removed = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective: atlasFullCorpusPerspective, fixedTimestamp, removedArtifactIds: atlasDecisiveEvidenceIds });
const strongSensitivity =
  full.output.dominantUnderstanding !== removed.output.dominantUnderstanding ||
  full.output.primaryConstraint !== removed.output.primaryConstraint ||
  full.output.recommendation !== removed.output.recommendation ||
  full.output.confidence !== removed.output.confidence ||
  JSON.stringify(full.output.uncertainty) !== JSON.stringify(removed.output.uncertainty);
const limitedSensitivity = JSON.stringify(full.output.missingEvidence) !== JSON.stringify(removed.output.missingEvidence);
const sensitivityObserved = strongSensitivity ? "strong" : limitedSensitivity ? "limited" : "none";

const evaluations: JudgmentEvaluation[] = perspectives.map((perspective) => {
  const run = perspective.id === atlasFullCorpusPerspective.id ? full : runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective, fixedTimestamp });
  const repeated = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: atlasIndustrialArtifacts, perspective, fixedTimestamp });
  const reordered = runJudgmentLab({ organization: atlasIndustrialOrganization, artifacts: [...atlasIndustrialArtifacts].reverse(), perspective, fixedTimestamp });
  return evaluateJudgment({ run, groundTruth: atlasIndustrialGroundTruth, perspective, repeatedStable: stable(run, repeated), orderStable: stable(run, reordered), sensitivityObserved: perspective.id === atlasFullCorpusPerspective.id ? sensitivityObserved : undefined });
});

console.log("\n============================================================");
console.log("JUDGMENT LAB — ATLAS INDUSTRIAL SYSTEMS PILOT BASELINE");
console.log("============================================================");
console.log(`Artifacts: ${atlasIndustrialArtifacts.length}`);
console.log(`Hidden truth passed to engine: no`);
console.log(`Fixed evaluation timestamp: ${fixedTimestamp}\n`);

for (const evaluation of evaluations) {
  const { run, scorecard, failures } = evaluation;
  console.log(`--- ${run.perspectiveId} (${run.evidenceArtifactIds.length} artifacts) ---`);
  console.log(`Understanding: ${run.output.dominantUnderstanding ?? "none"}`);
  console.log(`Constraint: ${run.output.primaryConstraint ?? "none"}`);
  console.log(`Recommendation: ${run.output.recommendation ?? "none"}`);
  console.log(`Disposition: ${run.output.recommendationDisposition ?? "not attached"}`);
  console.log(`Confidence: ${run.output.confidence === undefined ? "not attached" : Math.round(run.output.confidence * 100) + "%"}`);
  console.log(`Key uncertainty: ${run.output.uncertainty[0] ?? run.output.missingEvidence[0] ?? "none"}`);
  console.log(`Scores: ${Object.entries(scorecard).map(([name, value]) => `${name}=${value.score}/5`).join(" | ")}`);
  console.log(`Failures: ${failures.map((failure) => failure.type).join(", ")}\n`);
}

console.log("--- decisive-evidence removal ---");
console.log(`Removed: ${atlasDecisiveEvidenceIds.join(", ")}`);
console.log(`Baseline constraint: ${full.output.primaryConstraint ?? "none"}`);
console.log(`Variant constraint: ${removed.output.primaryConstraint ?? "none"}`);
console.log(`Baseline understanding: ${full.output.dominantUnderstanding ?? "none"}`);
console.log(`Variant understanding: ${removed.output.dominantUnderstanding ?? "none"}`);
console.log(`Baseline recommendation: ${full.output.recommendation ?? "none"}`);
console.log(`Variant recommendation: ${removed.output.recommendation ?? "none"}`);
console.log(`Baseline confidence: ${full.output.confidence ?? "none"}`);
console.log(`Variant confidence: ${removed.output.confidence ?? "none"}`);
console.log(`Baseline uncertainty: ${full.output.uncertainty[0] ?? "none"}`);
console.log(`Variant uncertainty: ${removed.output.uncertainty[0] ?? "none"}`);
console.log(`Missing-evidence changed: ${JSON.stringify(full.output.missingEvidence) !== JSON.stringify(removed.output.missingEvidence) ? "yes" : "no"}`);
console.log(`Sensitivity observed: ${sensitivityObserved}`);
