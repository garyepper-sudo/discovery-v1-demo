import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { loadOrganizationRuntimeState } from "../../v3/runtime";
import type { BlindComparisonManifest } from "../judgment-lab/comparisonContracts";
import { atlasDecisionCase, atlasDecisionGroundTruth } from "./atlasDecisionPilot";
import { evaluateExecutiveDecision } from "./evaluateExecutiveDecision";
import { resolveInterventionCorrespondence } from "./interventionCorrespondence";
import { runExecutiveDecisionLab } from "./runExecutiveDecisionLab";

const fixedTimestamp = "2026-07-22T12:00:00.000Z";
const runtimeDirectory = path.join(process.cwd(), ".discovery-runtime", "organizations");
const snapshotRuntime = () => fs.existsSync(runtimeDirectory)
  ? fs.readdirSync(runtimeDirectory).sort().map((name) => ({ name, modified: fs.statSync(path.join(runtimeDirectory, name)).mtimeMs }))
  : [];
const runtimeSnapshot = snapshotRuntime();
const runtime = loadOrganizationRuntimeState(atlasDecisionCase.organizationId);
const baseline = runExecutiveDecisionLab({ decisionCase: atlasDecisionCase, runtime, fixedTimestamp });
const repeated = runExecutiveDecisionLab({ decisionCase: atlasDecisionCase, runtime, fixedTimestamp });
const baselineEvaluation = evaluateExecutiveDecision({ run: baseline, decisionCase: atlasDecisionCase, groundTruth: atlasDecisionGroundTruth });
const scenarioRuns = atlasDecisionCase.stressScenarios.map((scenario) => runExecutiveDecisionLab({ decisionCase: atlasDecisionCase, runtime, fixedTimestamp, scenario }));
const scenarioEvaluation = (id: string) => evaluateExecutiveDecision({ run: scenarioRuns.find((item) => item.scenarioId === id)!, decisionCase: atlasDecisionCase, groundTruth: atlasDecisionGroundTruth, baselineRun: baseline });
const correspondence = (label: string, decisionCase = atlasDecisionCase) => resolveInterventionCorrespondence({ generated: { label }, candidates: decisionCase.candidateInterventions, groundTruth: atlasDecisionGroundTruth });
const checks: string[] = [];
const check = (name: string, assertion: () => void) => { assertion(); checks.push(name); };

check("hidden decision ground truth never enters engine input", () => {
  assert.equal(baseline.engineInput.includes(atlasDecisionGroundTruth.id), false);
  assert.equal(baseline.engineInput.includes(atlasDecisionGroundTruth.actualDecisionFrame.rationale), false);
});
check("hidden option classifications never enter engine input", () => {
  for (const id of [...atlasDecisionGroundTruth.dominatedInterventionIds, ...atlasDecisionGroundTruth.harmfulInterventionIds]) assert.equal(baseline.engineInput.includes(id), false);
});
check("hidden semantic metadata never enters engine input", () => {
  for (const candidate of atlasDecisionCase.candidateInterventions) for (const alias of candidate.evaluationMetadata.semanticAliases) assert.equal(baseline.engineInput.includes(alias), false);
});
check("candidate ordering is deterministic", () => {
  const reversed = { ...atlasDecisionCase, candidateInterventions: [...atlasDecisionCase.candidateInterventions].reverse() };
  assert.deepEqual(runExecutiveDecisionLab({ decisionCase: reversed, runtime, fixedTimestamp }).recommendation, baseline.recommendation);
});
check("evidence ordering is deterministic", () => {
  const reversed = { ...atlasDecisionCase, decisionContext: { ...atlasDecisionCase.decisionContext, evidenceIds: [...atlasDecisionCase.decisionContext.evidenceIds].reverse() } };
  assert.deepEqual(runExecutiveDecisionLab({ decisionCase: reversed, runtime, fixedTimestamp }).recommendation, baseline.recommendation);
});
check("repeated runs and evaluations are identical", () => {
  assert.deepEqual(repeated, baseline);
  assert.deepEqual(evaluateExecutiveDecision({ run: repeated, decisionCase: atlasDecisionCase, groundTruth: atlasDecisionGroundTruth }), baselineEvaluation);
});
check("stress scenarios declare every mutation", () => {
  for (const scenario of atlasDecisionCase.stressScenarios) assert.ok(scenario.changedAssumptions.length + scenario.changedConstraints.length + scenario.changedEvidence.length > 0);
});
check("score dimensions remain separate with no aggregate", () => {
  assert.equal(Object.keys(baselineEvaluation.scorecard).length, 15);
  assert.equal("overallScore" in baselineEvaluation.scorecard, false);
  assert.ok("stressRobustness" in baselineEvaluation.scorecard && "sensitivity" in baselineEvaluation.scorecard);
});
check("option classes remain distinct", () => {
  const sets = [new Set([atlasDecisionGroundTruth.preferredInterventionId]), new Set(atlasDecisionGroundTruth.acceptableAlternativeIds), new Set(atlasDecisionGroundTruth.dominatedInterventionIds), new Set(atlasDecisionGroundTruth.harmfulInterventionIds)];
  for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) assert.equal([...sets[i]].some((id) => sets[j].has(id)), false);
});
check("approval-layer removal maps to the preferred governance intervention", () => {
  const result = correspondence("Remove one approval layer");
  assert.equal(result.candidateId, "clarify-decision-rights");
  assert.ok(["equivalent", "closely-aligned"].includes(result.classification));
});
check("approval-layer removal does not map to an approval committee", () => assert.notEqual(correspondence("Remove one approval layer").candidateId, "approval-committee"));
check("add and remove actions are directional opposites", () => {
  assert.equal(correspondence("Create a weekly executive approval committee").classification, "harmful-inverse");
  assert.equal(correspondence("Remove one approval layer").classification, "equivalent");
});
check("delegated authority maps to clarified decision rights", () => assert.equal(correspondence("Delegate routine decision authority").candidateId, "clarify-decision-rights"));
check("management capacity remains symptom-oriented or dominated", () => assert.ok(["symptom-oriented", "dominated"].includes(correspondence("Hire more program managers").classification)));
check("planning-platform replacement remains dominated", () => assert.equal(correspondence("Replace the planning platform").classification, "dominated"));
check("reduced concurrent work remains an acceptable alternative", () => assert.equal(correspondence("Limit active work in progress").classification, "acceptable-alternative"));
check("unrelated interventions remain unrelated", () => assert.equal(correspondence("Launch a customer loyalty program").classification, "unrelated"));
check("ambiguous correspondence is not forced", () => assert.equal(correspondence("Reduce operating constraints").classification, "ambiguous"));
check("candidate order does not change correspondence", () => {
  const reversed = { ...atlasDecisionCase, candidateInterventions: [...atlasDecisionCase.candidateInterventions].reverse() };
  assert.deepEqual(correspondence("Remove one approval layer", reversed), correspondence("Remove one approval layer"));
});
check("semantic alias order does not change correspondence", () => {
  const reordered = { ...atlasDecisionCase, candidateInterventions: atlasDecisionCase.candidateInterventions.map((candidate) => ({ ...candidate, evaluationMetadata: { ...candidate.evaluationMetadata, semanticAliases: [...candidate.evaluationMetadata.semanticAliases].reverse() } })) };
  assert.deepEqual(correspondence("Remove one approval layer", reordered), correspondence("Remove one approval layer"));
});
check("reworded equivalent interventions retain correspondence", () => assert.equal(correspondence("Eliminate an approval layer").candidateId, "clarify-decision-rights"));
check("executive anchoring is desirable stability", () => assert.equal(scenarioEvaluation("executive-anchoring").responseBehavior, "desirable-stability"));
check("missing evidence is appropriate change without recommendation churn", () => {
  const evaluation = scenarioEvaluation("missing-governance-evidence");
  assert.equal(evaluation.responseBehavior, "appropriate-change");
  assert.equal(evaluation.run.recommendation.interventionId, baseline.recommendation.interventionId);
});
check("reduced capacity exposes unjustified insensitivity", () => assert.equal(scenarioEvaluation("implementation-capacity-reduced").responseBehavior, "unjustified-insensitivity"));
check("localized mechanism exposes insufficient narrowing", () => assert.equal(scenarioEvaluation("approval-dependency-localized").responseBehavior, "unjustified-insensitivity"));
check("generic risks do not automatically receive full credit", () => assert.ok(baselineEvaluation.scorecard.riskRecognition.score < 5));
check("direct and upstream evidence grounding remain distinct", () => {
  assert.equal(baseline.supportingEvidenceIds.length, 0);
  assert.ok(baseline.upstreamEvidenceIds.length > 0);
  assert.equal(baselineEvaluation.scorecard.evidenceGrounding.score, 1);
});
check("generic scoring contains no Atlas labels", () => {
  for (const file of ["evaluateExecutiveDecision.ts", "interventionCorrespondence.ts"]) {
    const source = fs.readFileSync(path.join(__dirname, file), "utf8");
    assert.doesNotMatch(source, /Atlas|add-program-capacity|clarify-decision-rights|customer-segment-reorganization/i);
  }
});
check("role and benchmark metadata do not alter production cognition", () => {
  const variant = { ...atlasDecisionCase, executiveRole: "Unrelated role", evaluationUsage: "regression" as const };
  assert.deepEqual(runExecutiveDecisionLab({ decisionCase: variant, runtime, fixedTimestamp }).recommendation, baseline.recommendation);
});
check("failure classification is deterministic", () => assert.deepEqual(baselineEvaluation.failures, evaluateExecutiveDecision({ run: baseline, decisionCase: atlasDecisionCase, groundTruth: atlasDecisionGroundTruth }).failures));

const comparison: BlindComparisonManifest = {
  id: "decision-comparison-001",
  benchmarkCaseId: atlasDecisionCase.id,
  criteria: ["judgment-quality", "causal-fidelity", "evidence-grounding", "uncertainty", "executive-clarity"],
  submissions: [{ submissionId: "submission-a", comparisonId: "decision-comparison-001", anonymizedLabel: "System A", output: { dominantUnderstanding: baseline.decisionFrame.interpretedObjective, primaryConstraint: baseline.decisionFrame.primaryConstraintId, causalMechanisms: [], recommendation: baseline.recommendation.label, recommendationDisposition: baseline.recommendation.disposition, confidence: baseline.recommendation.confidence, uncertainty: baseline.uncertainty, missingEvidence: baseline.missingEvidence, supportingEvidenceIds: baseline.supportingEvidenceIds, communicationHeadline: baseline.recommendation.label, communicationSummary: baseline.recommendation.rationale } }],
  sealedSystemMapping: { "submission-a": "discovery" },
};
check("comparison artifacts exclude hidden truth and semantic metadata", () => {
  const serialized = JSON.stringify(comparison);
  assert.equal(serialized.includes(atlasDecisionGroundTruth.id), false);
  assert.equal(serialized.includes("semanticAliases"), false);
});
check("no production Runtime schema changes are required", () => assert.equal("executiveDecisionLab" in runtime.memory, false));
check("option rewording does not change production recommendation", () => {
  const variant = { ...atlasDecisionCase, candidateInterventions: atlasDecisionCase.candidateInterventions.map((item, index) => index === 0 ? { ...item, label: "Increase program leadership capacity" } : item) };
  assert.deepEqual(runExecutiveDecisionLab({ decisionCase: variant, runtime, fixedTimestamp }).recommendation, baseline.recommendation);
});
check("duplicated weak support does not change production recommendation", () => {
  const weak = atlasDecisionCase.candidateInterventions[0];
  const variant = { ...atlasDecisionCase, candidateInterventions: [...atlasDecisionCase.candidateInterventions, { ...weak, id: `${weak.id}-duplicate` }] };
  assert.deepEqual(runExecutiveDecisionLab({ decisionCase: variant, runtime, fixedTimestamp }).recommendation, baseline.recommendation);
});
check("organization renaming does not change decision quality", () => {
  const renamedRuntime = JSON.parse(JSON.stringify(runtime)) as typeof runtime;
  renamedRuntime.metadata.name = "Renamed Benchmark Organization";
  assert.deepEqual(runExecutiveDecisionLab({ decisionCase: atlasDecisionCase, runtime: renamedRuntime, fixedTimestamp }).recommendation, baseline.recommendation);
});
check("harmful options remain unselected across irrelevant changes", () => {
  for (const run of [baseline, ...scenarioRuns]) assert.notEqual(run.recommendation.label, "Create a weekly executive approval committee");
});
check("no Runtime files are left behind", () => assert.deepEqual(snapshotRuntime(), runtimeSnapshot));
check("all lab code remains benchmark-only", () => assert.ok(__dirname.includes("engine/benchmark/executive-decision-lab")));

console.log("\nEXECUTIVE DECISION LAB EVALUATION VALIDATION");
for (const name of checks) console.log(`PASS  ${name}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
