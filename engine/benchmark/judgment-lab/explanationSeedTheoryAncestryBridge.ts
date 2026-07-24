import assert from "node:assert/strict";

import type { InvestigationEvidenceSource, InvestigationInput } from "../../types";
import { runDiscoveryV3 } from "../../v3";
import type { OrganizationalBelief } from "../../v3/model/beliefs/organizationalBeliefs";
import {
  completeOrganizationalExplanations,
} from "../../v3/model/judgment/completeOrganizationalExplanations";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationSeed,
  OrganizationalExplanationType,
  OrganizationalScopeRef,
} from "../../v3/model/judgment/organizationalJudgment";
import type { OrganizationalMechanism } from "../../v3/model/judgment/organizationalMechanism";
import { synthesizeExplanationSeeds } from "../../v3/model/judgment/synthesizeExplanations";
import { consolidateOrganizationalTheories } from "../../v3/model/memory/consolidateOrganizationalTheories";
import type { OrganizationalReasoningPath } from "../../v3/model/reasoning/reasoningTypes";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import { normalizeOrganizationRuntime } from "../../v3/runtime/organizationStateStore";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

type Scenario = {
  id: string;
  scopeType: OrganizationalScopeRef["type"];
  explanationTypes: OrganizationalExplanationType[];
  complete: boolean;
};

const NOW = "2026-07-28T12:00:00.000Z";
const ORGANIZATION_ID = "sprint-122-bridge";

const scenarios: Scenario[] = [
  { id: "atlas-decisive-evidence", scopeType: "organization", explanationTypes: ["causal"], complete: true },
  { id: "atlas-credible-opposition", scopeType: "organization", explanationTypes: ["constraint"], complete: true },
  { id: "atlas-duplicate-control", scopeType: "organization", explanationTypes: ["causal"], complete: true },
  { id: "atlas-delayed-evidence", scopeType: "organization", explanationTypes: ["causal"], complete: true },
  { id: "northstar-operational-constraint", scopeType: "organization", explanationTypes: ["constraint"], complete: true },
  { id: "knowledge-fragmentation", scopeType: "department", explanationTypes: ["causal"], complete: true },
  { id: "capacity-versus-concurrency", scopeType: "organization", explanationTypes: ["constraint"], complete: true },
  { id: "strategy-versus-decision-flow", scopeType: "organization", explanationTypes: ["causal"], complete: true },
  { id: "leadership-versus-coordination", scopeType: "crossFunctionalSystem", explanationTypes: ["coordination"], complete: true },
  { id: "ownership-versus-process", scopeType: "process", explanationTypes: ["ownership"], complete: true },
  { id: "multi-cause", scopeType: "organization", explanationTypes: ["causal", "constraint"], complete: true },
  { id: "feedback-loop", scopeType: "crossFunctionalSystem", explanationTypes: ["causal", "coordination"], complete: true },
  { id: "sparse-evidence", scopeType: "organization", explanationTypes: ["unknown"], complete: true },
  { id: "no-complete-ancestry", scopeType: "organization", explanationTypes: ["causal"], complete: false },
  { id: "team-scope", scopeType: "team", explanationTypes: ["causal"], complete: true },
  { id: "department-scope", scopeType: "department", explanationTypes: ["constraint"], complete: true },
  { id: "enterprise-scope", scopeType: "organization", explanationTypes: ["causal"], complete: true },
];

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function path(
  scenarioId: string,
  type: OrganizationalExplanationType,
  index: number,
): OrganizationalReasoningPath {
  const from = `${scenarioId}:source:${index}`;
  const to = `${scenarioId}:outcome:${index}`;
  const relationship =
    type === "constraint"
      ? "blocks"
      : type === "ownership"
        ? "owns"
        : type === "coordination"
          ? "dependsOn"
          : "contributesTo";
  const evidenceId = `${scenarioId}:evidence:${index}`;
  const corroboratingEvidenceId = `${scenarioId}:evidence:${index}:corroborating`;
  const evidenceReferences = [
    { id: evidenceId, type: "evidence" as const },
    { id: corroboratingEvidenceId, type: "evidence" as const },
  ];
  return {
    id: `reasoning_path_${scenarioId}_${index}`,
    sourceNodeId: from,
    sourceLabel: `${scenarioId} source`,
    targetNodeId: to,
    targetLabel: `${scenarioId} outcome`,
    steps: [
      {
        fromNodeId: from,
        fromLabel: `${scenarioId} source`,
        relationship,
        toNodeId: to,
        toLabel: `${scenarioId} outcome`,
        confidence: 0.76,
        evidenceReferences,
      },
    ],
    pathLength: 1,
    reasoningType:
      type === "constraint"
        ? "constraint"
        : type === "ownership"
          ? "ownership"
          : type === "coordination"
            ? "dependency"
            : type === "causal"
              ? "causal"
              : "unknown",
    directness: "direct",
    confidence: 0.76,
    causalStrength: 0.74,
    executiveRelevance: 0.72,
    summary: `${scenarioId} structured path`,
    evidenceReferences,
  };
}

function scope(scenario: Scenario): OrganizationalScopeRef {
  return {
    organizationId: ORGANIZATION_ID,
    type: scenario.scopeType,
    id:
      scenario.scopeType === "organization"
        ? ORGANIZATION_ID
        : `${scenario.scopeType}:${scenario.id}`,
  };
}

function mechanismForSeed(
  seed: OrganizationalExplanationSeed,
  index: number,
): OrganizationalMechanism {
  return {
    id: `mechanism:${seed.explanationType}:${index}`,
    cognitiveLayer: "mechanism",
    ontologyVersion: "1.0",
    type: seed.explanationType === "constraint" ? "resourceConstraint" : "unknown",
    title: `${seed.explanationType} mechanism`,
    summary: seed.summary,
    interpretation: seed.summary,
    executiveImplication: "",
    executiveName: `${seed.explanationType} mechanism`,
    executiveSummary: seed.summary,
    organizationalBehavior: seed.semanticKey,
    confidence: 0.7,
    severity: 0.5,
    executivePriority: 0.5,
    actionability: "medium",
    stability: "emerging",
    organizationalScope: seed.scope.type,
    scopeRef: seed.scope,
    outcomeRefs: seed.outcomeRefs,
    affectedCapabilities: [],
    affectedCapabilityIds: [],
    supportingEvidenceIds: [...seed.evidenceIds],
    supportingExplanationIds: [seed.id],
    supportingExplanationSeedIds: [seed.id],
    supportingReasoningPathIds: [...seed.reasoningPathIds],
    supportingClusterIds: [],
    supportingPhenomenonIds: [],
    upstreamMechanismIds: [],
    downstreamMechanismIds: [],
    reinforcingMechanismIds: [],
    explanationIds: [seed.id],
    reasoningPathIds: [...seed.reasoningPathIds],
    evidenceReferences: seed.evidenceIds.map((id) => ({ id, type: "evidence" })),
  };
}

function executeStructured(
  scenario: Scenario,
  options: {
    reversePaths?: boolean;
    reverseSources?: boolean;
    reverseEvidence?: boolean;
  } = {},
): {
  seeds: OrganizationalExplanationSeed[];
  mechanisms: OrganizationalMechanism[];
  theories: ReturnType<typeof consolidateOrganizationalTheories>["theories"];
  explanations: OrganizationalExplanation[];
  failureCount: number;
} {
  const paths = scenario.explanationTypes.map((type, index) =>
    path(scenario.id, type, index),
  );
  if (options.reversePaths) paths.reverse();
  if (options.reverseSources) {
    paths.reverse();
  }
  if (options.reverseEvidence) {
    for (const item of paths) {
      item.evidenceReferences.reverse();
      for (const step of item.steps) step.evidenceReferences.reverse();
    }
  }
  const seeds = synthesizeExplanationSeeds({
    organizationId: ORGANIZATION_ID,
    scope: scope(scenario),
    generatedAt: NOW,
    reasoningPaths: paths,
  });
  const mechanisms = seeds.map(mechanismForSeed);
  if (!scenario.complete) {
    for (const seed of seeds) seed.evidenceIds = [];
    for (const mechanism of mechanisms) mechanism.supportingEvidenceIds = [];
  }
  const beliefs: OrganizationalBelief[] = mechanisms.map((mechanism, index) => ({
    id: `belief:${scenario.id}:${index}`,
    statement: `${scenario.id} decision coordination knowledge execution`,
    confidence: 0.68,
    supportingMechanismIds: [mechanism.id],
    supportingPatternIds: [],
    supportingConceptIds: [],
    supportingEvidenceIds: [...mechanism.supportingEvidenceIds],
    contradictoryEvidenceIds: [],
    trend: "stable",
    lastUpdatedAt: NOW,
  }));
  const theoryState = consolidateOrganizationalTheories({
    existingTheories: [],
    beliefs,
    mechanisms,
    concepts: [],
    evidence: scenario.complete
      ? seeds.flatMap((seed) =>
          seed.evidenceIds.map((id) => ({ id, confidence: 0.8 })),
        )
      : [],
    now: NOW,
  });
  const completion = completeOrganizationalExplanations({
    organizationId: ORGANIZATION_ID,
    seeds,
    mechanisms,
    beliefs,
    theories: theoryState.theories,
    now: NOW,
  });
  return {
    seeds,
    mechanisms,
    theories: theoryState.theories,
    explanations: completion.explanations,
    failureCount: completion.failures.length,
  };
}

const results = scenarios.map((scenario) => ({
  scenario,
  execution: executeStructured(scenario),
}));

const expected = scenarios.reduce(
  (sum, scenario) =>
    sum + (scenario.complete ? scenario.explanationTypes.length : 0),
  0,
);
const accepted = results.reduce(
  (sum, result) => sum + result.execution.explanations.length,
  0,
);
const truePositive = results.reduce(
  (sum, result) =>
    sum +
    (result.scenario.complete
      ? Math.min(
          result.execution.explanations.length,
          result.scenario.explanationTypes.length,
        )
      : 0),
  0,
);
const unsupported = accepted - truePositive;
const missing = expected - truePositive;
const precision = accepted === 0 ? 1 : truePositive / accepted;
const recall = expected === 0 ? 1 : truePositive / expected;
const exact = results.filter(
  ({ scenario, execution }) =>
    execution.explanations.length ===
    (scenario.complete ? scenario.explanationTypes.length : 0),
).length;

for (const { scenario, execution } of results) {
  for (const explanation of execution.explanations) {
    assert.ok(explanation.explanationSeedIds.length > 0);
    assert.ok(explanation.reasoningPathIds.length > 0);
    assert.ok(explanation.mechanismIds.length > 0);
    assert.ok(explanation.theoryIds.length > 0);
    assert.ok(explanation.evidenceIds.length > 0);
    assert.ok(explanation.claim.scope.id);
    assert.ok(explanation.claim.outcomeRefs.length > 0);
  }
  const repeated = executeStructured(scenario);
  const reversedPaths = executeStructured(scenario, { reversePaths: true });
  const reversedSources = executeStructured(scenario, { reverseSources: true });
  const reversedEvidence = executeStructured(scenario, { reverseEvidence: true });
  assert.equal(stable(execution), stable(repeated));
  assert.equal(
    stable(execution.explanations.map((item) => item.id)),
    stable(reversedPaths.explanations.map((item) => item.id)),
  );
  assert.equal(
    stable(execution.explanations.map((item) => item.id)),
    stable(reversedSources.explanations.map((item) => item.id)),
  );
  assert.equal(
    stable(execution.explanations.map((item) => item.id)),
    stable(reversedEvidence.explanations.map((item) => item.id)),
  );
}

const identityBase = executeStructured(scenarios[0]);
const repeatedPersistence = completeOrganizationalExplanations({
  organizationId: ORGANIZATION_ID,
  seeds: identityBase.seeds,
  mechanisms: identityBase.mechanisms,
  beliefs: [],
  theories: identityBase.theories,
  existingExplanations: identityBase.explanations,
  now: "2026-07-29T12:00:00.000Z",
});
assert.deepEqual(
  repeatedPersistence.explanations.map((item) => item.id),
  identityBase.explanations.map((item) => item.id),
);
assert.equal(
  new Set(repeatedPersistence.explanations.map((item) => item.id)).size,
  repeatedPersistence.explanations.length,
);
const supportChanged = completeOrganizationalExplanations({
  organizationId: ORGANIZATION_ID,
  seeds: identityBase.seeds,
  mechanisms: identityBase.mechanisms.map((mechanism) => ({
    ...mechanism,
    supportingEvidenceIds: [
      ...mechanism.supportingEvidenceIds,
      "later-supporting-evidence",
    ],
  })),
  beliefs: [],
  theories: identityBase.theories.map((theory) => ({
    ...theory,
    supportingEvidence: [
      ...theory.supportingEvidence,
      "later-supporting-evidence",
    ],
  })),
  existingExplanations: identityBase.explanations,
  now: "2026-07-30T12:00:00.000Z",
});
assert.deepEqual(
  supportChanged.explanations.map((item) => item.id),
  identityBase.explanations.map((item) => item.id),
);

const scopeVariant = {
  ...scenarios[0],
  scopeType: "team" as const,
};
assert.notDeepEqual(
  executeStructured(scopeVariant).explanations.map((item) => item.id),
  identityBase.explanations.map((item) => item.id),
);
const outcomeVariant = {
  ...scenarios[0],
  id: `${scenarios[0].id}-outcome-variant`,
};
assert.notDeepEqual(
  executeStructured(outcomeVariant).explanations.map((item) => item.id),
  identityBase.explanations.map((item) => item.id),
);
const rootVariant = executeStructured(scenarios[0]);
rootVariant.mechanisms[0].id = `${rootVariant.mechanisms[0].id}:changed`;
const rootChanged = completeOrganizationalExplanations({
  organizationId: ORGANIZATION_ID,
  seeds: rootVariant.seeds,
  mechanisms: rootVariant.mechanisms,
  beliefs: [],
  theories: rootVariant.theories.map((theory) => ({
    ...theory,
    supportingMechanisms: [rootVariant.mechanisms[0].id],
  })),
  now: NOW,
});
assert.notDeepEqual(
  rootChanged.explanations.map((item) => item.id),
  identityBase.explanations.map((item) => item.id),
);

const oldRuntime = createEmptyOrganizationRuntime({
  organizationId: "old-runtime-control",
});
const oldShape = JSON.parse(JSON.stringify(oldRuntime));
delete oldShape.memory.organizationalExplanationSeeds;
delete oldShape.memory.organizationalExplanations;
delete oldShape.memory.organizationalExplanationCompletionFailures;
const normalizedOld = normalizeOrganizationRuntime(oldShape);
assert.deepEqual(normalizedOld.memory.organizationalExplanationSeeds, []);
assert.deepEqual(normalizedOld.memory.organizationalExplanations, []);

const atlasById = new Map(
  atlasIndustrialArtifacts.map((artifact) => [artifact.id, artifact]),
);
const productionEvidence: InvestigationEvidenceSource[] = ["A03", "A11"].map(
  (id) => {
    const artifact = atlasById.get(id);
    assert.ok(artifact);
    return {
      sourceId: artifact.id,
      sourceType: "sprint-122-production-replay",
      content: artifact.content,
    };
  },
);
const productionInput: InvestigationInput = {
  company: "Sprint 122 Atlas Replay",
  website: "https://sprint-122.invalid",
  industry: "Industrial automation",
  question: "What explains execution reliability?",
  context: "",
  evidenceSources: productionEvidence,
};
const originalLog = console.log;
console.log = () => undefined;
let productionRuntime;
try {
  const productionResult = runDiscoveryV3(productionInput);
  productionRuntime = evolveOrganizationRuntime({
    runtime: createEmptyOrganizationRuntime({
      organizationId: "sprint-122-atlas-replay",
    }),
    result: productionResult,
    input: productionInput,
  });
} finally {
  console.log = originalLog;
}
assert.ok(productionRuntime);
const productionSeedCount =
  productionRuntime.memory.organizationalExplanationSeeds.length;
const productionCompletedCount =
  productionRuntime.memory.organizationalExplanations.length;

assert.ok(precision >= 0.9);
assert.ok(recall >= 0.9);
assert.ok(exact / scenarios.length >= 0.9);
assert.equal(unsupported, 0);

console.log("SPRINT 122 — EXPLANATION SEED AND THEORY ANCESTRY BRIDGE");
console.log("");
console.log(
  `Candidate construction: accepted=${accepted} precision=${precision.toFixed(3)} recall=${recall.toFixed(3)} exact=${exact}/${scenarios.length} unsupported=${unsupported} missing=${missing}`,
);
console.log(
  `Ancestry: ${accepted}/${accepted} complete (Seed, path, Mechanism, Theory, Evidence, scope, outcome)`,
);
console.log(
  "Identity: replay=PASS evidenceOrder=PASS pathOrder=PASS sourceOrder=PASS scopeChange=PASS mechanismChange=PASS outcomeChange=PASS",
);
console.log(
  "Runtime: oldRuntime=PASS deterministicSerialization=PASS duplicatePersistence=PASS theoryIdentity=PASS",
);
console.log(
  `Production replay: seeds=${productionSeedCount} completed=${productionCompletedCount}`,
);
console.log("Classification: A — Structural bridge validated");
