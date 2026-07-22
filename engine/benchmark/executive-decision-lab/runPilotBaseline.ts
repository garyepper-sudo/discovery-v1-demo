import { loadOrganizationRuntimeState } from "../../v3/runtime";
import { atlasDecisionCase, atlasDecisionGroundTruth } from "./atlasDecisionPilot";
import { evaluateExecutiveDecision } from "./evaluateExecutiveDecision";
import { runExecutiveDecisionLab } from "./runExecutiveDecisionLab";

const fixedTimestamp = "2026-07-22T12:00:00.000Z";
const runtime = loadOrganizationRuntimeState(atlasDecisionCase.organizationId);
const baseline = runExecutiveDecisionLab({ decisionCase: atlasDecisionCase, runtime, fixedTimestamp });
const scenarios = atlasDecisionCase.stressScenarios.map((scenario) => runExecutiveDecisionLab({ decisionCase: atlasDecisionCase, runtime, fixedTimestamp, scenario }));
const runs = [baseline, ...scenarios];

console.log("\nEXECUTIVE DECISION LAB — ATLAS PILOT BASELINE");
for (const run of runs) {
  const evaluation = evaluateExecutiveDecision({ run, decisionCase: atlasDecisionCase, groundTruth: atlasDecisionGroundTruth, baselineRun: run.scenarioId ? baseline : undefined });
  console.log(`\n--- ${run.scenarioId ?? "full-evidence"} ---`);
  console.log(`Frame: ${run.decisionFrame.statedQuestion}`);
  console.log(`Objective: ${run.decisionFrame.interpretedObjective ?? "none"}`);
  console.log(`Constraint: ${run.decisionFrame.primaryConstraintId ?? "none"}`);
  console.log(`Options: ${run.options.map((option) => `${option.rank ?? "-"}. ${option.label}`).join(" | ")}`);
  console.log(`Recommendation: ${run.recommendation.label ?? "none"}`);
  console.log(`Generated scope: ${run.options.find((option) => option.id === run.recommendation.optionId)?.scope ?? "none"}`);
  console.log(`Simulated scope: ${run.simulations.find((simulation) => simulation.optionId === run.recommendation.optionId)?.scope ?? "none"}`);
  console.log(`Recommendation scope: ${run.recommendation.scope ?? "none"}`);
  console.log(`Mapped candidate: ${evaluation.correspondence.candidateId ?? "none"}`);
  console.log(`Correspondence: ${evaluation.correspondence.classification} (${evaluation.correspondence.confidence})`);
  console.log(`Response behavior: ${evaluation.responseBehavior}`);
  console.log(`Disposition: ${run.recommendation.disposition ?? "not attached"}`);
  console.log(`Confidence: ${run.recommendation.confidence ?? "not attached"}`);
  console.log(`Assumptions: ${run.assumptions.join(" | ") || "none"}`);
  console.log(`Risks: ${run.risks.join(" | ") || "none"}`);
  console.log(`Uncertainty: ${run.uncertainty.join(" | ") || "none"}`);
  console.log(`Missing evidence: ${run.missingEvidence.join(" | ") || "none"}`);
  console.log(`Supporting evidence: ${run.supportingEvidenceIds.length}`);
  console.log(`Upstream resolvable evidence: ${run.upstreamEvidenceIds.length}`);
  console.log(`Scores: ${Object.entries(evaluation.scorecard).map(([key, value]) => `${key}=${value.score}/5`).join(" | ")}`);
  console.log(`Failures: ${evaluation.failures.map((failure) => failure.type).join(", ")}`);
}
