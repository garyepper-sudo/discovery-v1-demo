import assert from "node:assert/strict";

import {
  atlasDecisiveEvidenceIds,
  atlasIndustrialArtifacts,
  atlasIndustrialOrganization,
} from "./atlasIndustrialPilot";
import type { JudgmentFailure, JudgmentLabRunResult } from "./contracts";
import { buildFailureMemory } from "./failureMemory";
import { mechanismLibrary, mechanismLibraryForUsage } from "./mechanismLibrary";
import {
  buildMetamorphicCase,
  evaluateMetamorphicRelation,
  metamorphicExpectations,
  type MetamorphicRelation,
} from "./metamorphic";

const checks: string[] = [];
const check = (name: string, assertion: () => void) => {
  assertion();
  checks.push(name);
};

check("mechanism library contains the five canonical mechanisms", () => {
  assert.deepEqual(
    mechanismLibrary.map((item) => item.id),
    ["decision-authority", "coordination-failure", "founder-dependency", "strategic-misalignment", "knowledge-fragmentation"],
  );
});

check("every mechanism spans multiple industries", () => {
  for (const item of mechanismLibrary) {
    assert.ok(new Set(item.contexts.map((context) => context.industry)).size >= 3);
  }
});

check("every mechanism supports multiple perspectives and evidence subsets", () => {
  for (const item of mechanismLibrary) {
    assert.ok(item.perspectives.length >= 3);
    assert.ok(item.evidenceSubsets.length >= 3);
  }
});

check("every mechanism has exactly one hidden ground truth", () => {
  for (const item of mechanismLibrary) {
    assert.ok(item.hiddenGroundTruth.id);
    assert.ok(item.hiddenGroundTruth.dominantConstraint.label);
  }
});

check("mechanism definitions do not duplicate organization fixtures", () => {
  for (const item of mechanismLibrary) {
    assert.equal("artifacts" in item, false);
    assert.equal("organization" in item, false);
  }
});

check("development, regression, and holdout usage are supported", () => {
  const usages = ["development", "regression", "holdout"] as const;
  for (const usage of usages) assert.ok(Array.isArray(mechanismLibraryForUsage(usage)));
});

const relations = Object.keys(metamorphicExpectations) as MetamorphicRelation[];
const metamorphicCases = relations.map((relation) =>
  buildMetamorphicCase({
    relation,
    artifacts: atlasIndustrialArtifacts,
    organization: atlasIndustrialOrganization,
    decisiveEvidenceIds: atlasDecisiveEvidenceIds,
  }),
);

check("all six metamorphic relations are defined", () => {
  assert.deepEqual(relations, ["document-order", "duplicate-evidence", "evidence-removal", "terminology-change", "department-renaming", "industry-substitution"]);
});

check("metamorphic transformations are deterministic", () => {
  for (const relation of relations) {
    const first = buildMetamorphicCase({ relation, artifacts: atlasIndustrialArtifacts, organization: atlasIndustrialOrganization, decisiveEvidenceIds: atlasDecisiveEvidenceIds });
    const second = buildMetamorphicCase({ relation, artifacts: atlasIndustrialArtifacts, organization: atlasIndustrialOrganization, decisiveEvidenceIds: atlasDecisiveEvidenceIds });
    assert.deepEqual(first, second);
  }
});

check("metamorphic result evaluation is deterministic", () => {
  const output = { causalMechanisms: ["mechanism"], uncertainty: [], missingEvidence: [], supportingEvidenceIds: [] };
  for (const testCase of metamorphicCases) {
    const variant = testCase.relation === "evidence-removal"
      ? { ...output, uncertainty: ["Evidence was removed."] }
      : output;
    const params = { testCase, baseline: output, variant };
    assert.deepEqual(evaluateMetamorphicRelation(params), evaluateMetamorphicRelation(params));
    assert.equal(evaluateMetamorphicRelation(params).passed, true);
  }
});

check("metamorphic transformations do not mutate source fixtures", () => {
  assert.equal(atlasIndustrialArtifacts.length, 16);
  assert.equal(atlasIndustrialOrganization.industry, "Industrial automation and engineered equipment");
});

check("evidence removal identifies only declared decisive evidence", () => {
  const item = metamorphicCases.find((candidate) => candidate.relation === "evidence-removal")!;
  assert.deepEqual(item.removedArtifactIds, [...atlasDecisiveEvidenceIds].sort());
});

check("duplicate evidence preserves content with a distinct benchmark ID", () => {
  const item = metamorphicCases.find((candidate) => candidate.relation === "duplicate-evidence")!;
  assert.equal(item.artifacts.length, atlasIndustrialArtifacts.length + 1);
  assert.equal(item.artifacts.at(-1)?.content, atlasIndustrialArtifacts[0].content);
  assert.notEqual(item.artifacts.at(-1)?.id, atlasIndustrialArtifacts[0].id);
});

const run: JudgmentLabRunResult = {
  organizationId: "organization-1",
  perspectiveId: "perspective-1",
  fixedTimestamp: "2026-07-01T12:00:00.000Z",
  evidenceArtifactIds: ["A1"],
  engineInput: "evidence",
  output: { causalMechanisms: [], uncertainty: [], missingEvidence: [], supportingEvidenceIds: [] },
};
const failures: JudgmentFailure[] = [
  { type: "ancestry-loss", severity: "medium", description: "Missing ancestry", supportingEvidence: ["A1"], likelyProducerArea: "Executive Understanding" },
  { type: "condition-ranking", severity: "high", description: "Wrong condition", supportingEvidence: [], likelyProducerArea: "Primary Executive Constraint" },
];
const memoryParams = { failures, run, benchmarkCategory: "metamorphic" as const, benchmarkCaseId: "case-1" };

check("failure memory is deterministic", () => {
  assert.deepEqual(buildFailureMemory(memoryParams), buildFailureMemory(memoryParams));
});

check("every failure creates complete failure memory", () => {
  const memory = buildFailureMemory(memoryParams);
  assert.equal(memory.length, failures.length);
  for (const item of memory) {
    assert.match(item.regressionId, /^jl-[a-f0-9]{8}$/);
    assert.ok(item.failureType);
    assert.ok(item.severity);
    assert.ok(item.producerBoundary);
    assert.equal(item.benchmarkCategory, "metamorphic");
  }
});

check("non-failure results do not create failure memory", () => {
  assert.deepEqual(buildFailureMemory({ ...memoryParams, failures: [{ type: "none", severity: "low", description: "No failure", supportingEvidence: [] }] }), []);
});

console.log("\nJUDGMENT LAB EXPANSION VALIDATION");
for (const name of checks) console.log(`PASS  ${name}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
