import assert from "node:assert/strict";

import { buildExecutiveProjection } from "../../../components/executive-v2/projection/buildExecutiveProjection";
import type { InvestigationInput } from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../v3/types";
import { atlasIndustrialProvenanceCases } from "./atlasIndustrialProvenancePilot";
import { runEvidenceIndependenceShadow } from "./runEvidenceIndependenceShadow";

type UnknownRecord = Record<string, unknown>;

type PipelineOutput = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
  projection: ReturnType<typeof buildExecutiveProjection>;
};

type StageName =
  | "signals"
  | "themes"
  | "mechanisms"
  | "beliefs"
  | "concepts"
  | "theories"
  | "organizationalConditions"
  | "organizationalState"
  | "executiveAssessment"
  | "executiveProjection";

type StageImpact = {
  stage: StageName;
  productionObjects: number;
  shadowObjects: number;
  unchangedObjects: number;
  changedObjects: number;
  confidenceDelta: number;
  rankingDelta: number;
  orderingDelta: boolean;
  evidenceDelta: number;
};

type ScenarioImpact = {
  scenarioId: string;
  productionByteStable: boolean;
  shadowByteStable: boolean;
  organizationIdentityStable: boolean;
  evidenceIdentityStable: boolean;
  stageImpacts: StageImpact[];
  recommendationChanged: boolean;
  risksChanged: boolean;
  opportunitiesChanged: boolean;
};

type ShadowEvaluationResult = {
  classification:
    | "A — Safe localized production change"
    | "B — Beneficial but broader propagation"
    | "C — Minimal downstream effect"
    | "D — Unsafe";
  scenarios: ScenarioImpact[];
  aggregate: StageImpact[];
};

const FIXED_TIME = Date.parse("2026-07-24T12:00:00.000Z");

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as UnknownRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function withFixedClock<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  let tick = 0;
  let randomState = 0x1112026;

  class FixedDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length > 0) {
        super(...args);
      } else {
        super(FIXED_TIME + tick++);
      }
    }

    static now(): number {
      return FIXED_TIME + tick++;
    }
  }

  globalThis.Date = FixedDate as DateConstructor;
  Math.random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };
  try {
    return operation();
  } finally {
    globalThis.Date = OriginalDate;
    Math.random = originalRandom;
  }
}

function withoutLogs<T>(operation: () => T): T {
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    return operation();
  } finally {
    console.log = originalLog;
  }
}

function execute(
  input: InvestigationInput,
  organizationId: string,
  mode: "production" | "shadow",
): PipelineOutput {
  return withFixedClock(() =>
    withoutLogs(() => {
      const result =
        mode === "production"
          ? runDiscoveryV3(input)
          : runEvidenceIndependenceShadow(input);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId,
          name: input.company,
          industry: input.industry,
          website: input.website,
        }),
        result,
        input,
      });
      const projection = buildExecutiveProjection({ result, runtime });
      return { result, runtime, projection };
    }),
  );
}

function stageObjects(
  output: PipelineOutput,
  stage: StageName,
): UnknownRecord[] {
  const memory = output.runtime.memory as unknown as UnknownRecord;
  switch (stage) {
    case "signals":
      return records(output.result.signals);
    case "themes":
      return records(output.result.themes);
    case "mechanisms":
      return records(output.result.mechanisms);
    case "beliefs":
      return records(output.result.beliefs);
    case "concepts":
      return records(memory.organizationalConcepts);
    case "theories":
      return records(memory.theories);
    case "organizationalConditions":
      return records(memory.organizationalConditions);
    case "organizationalState":
      return memory.organizationalState
        ? [record(memory.organizationalState)]
        : [];
    case "executiveAssessment":
      return memory.executiveAssessment
        ? [record(memory.executiveAssessment)]
        : [];
    case "executiveProjection":
      return [record(output.projection)];
  }
}

function identity(item: UnknownRecord, index: number): string {
  for (const key of ["id", "conditionId", "title", "name", "label"]) {
    if (typeof item[key] === "string" && item[key]) return String(item[key]);
  }
  return `index:${index}`;
}

function confidence(item: UnknownRecord): number | undefined {
  for (const key of ["confidence", "stability", "strength"]) {
    if (typeof item[key] === "number") return item[key] as number;
  }
  return undefined;
}

function evidenceIdentities(item: unknown): string[] {
  if (Array.isArray(item)) return item.flatMap(evidenceIdentities);
  if (!item || typeof item !== "object") return [];

  return Object.entries(item as UnknownRecord).flatMap(([key, value]) => {
    if (
      /evidenceids$/i.test(key) &&
      Array.isArray(value)
    ) {
      return value.filter((entry): entry is string => typeof entry === "string");
    }
    return evidenceIdentities(value);
  });
}

function symmetricDifference(left: string[], right: string[]): number {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return (
    [...leftSet].filter((item) => !rightSet.has(item)).length +
    [...rightSet].filter((item) => !leftSet.has(item)).length
  );
}

function compareStage(
  stage: StageName,
  production: PipelineOutput,
  shadow: PipelineOutput,
): StageImpact {
  const productionObjects = stageObjects(production, stage);
  const shadowObjects = stageObjects(shadow, stage);
  const productionIds = productionObjects.map(identity);
  const shadowIds = shadowObjects.map(identity);
  const productionById = new Map(
    productionObjects.map((item, index) => [productionIds[index], item]),
  );
  const shadowById = new Map(
    shadowObjects.map((item, index) => [shadowIds[index], item]),
  );
  const allIds = [...new Set([...productionIds, ...shadowIds])];
  const unchangedObjects = allIds.filter((id) => {
    const left = productionById.get(id);
    const right = shadowById.get(id);
    return left !== undefined && right !== undefined && stable(left) === stable(right);
  }).length;

  const matchedIds = allIds.filter(
    (id) => productionById.has(id) && shadowById.has(id),
  );
  const confidenceDeltas = matchedIds.flatMap((id) => {
    const left = confidence(productionById.get(id)!);
    const right = confidence(shadowById.get(id)!);
    return left === undefined || right === undefined ? [] : [right - left];
  });
  const rankingDelta = matchedIds.reduce((sum, id) => {
    return (
      sum +
      Math.abs(productionIds.indexOf(id) - shadowIds.indexOf(id))
    );
  }, 0);

  return {
    stage,
    productionObjects: productionObjects.length,
    shadowObjects: shadowObjects.length,
    unchangedObjects,
    changedObjects: allIds.length - unchangedObjects,
    confidenceDelta: Number(
      confidenceDeltas.reduce((sum, value) => sum + value, 0).toFixed(12),
    ),
    rankingDelta,
    orderingDelta: stable(productionIds) !== stable(shadowIds),
    evidenceDelta: symmetricDifference(
      evidenceIdentities(productionObjects),
      evidenceIdentities(shadowObjects),
    ),
  };
}

function projectionSlices(output: PipelineOutput): {
  recommendation: unknown;
  risks: unknown;
  opportunities: unknown;
} {
  const memory = output.runtime.memory as unknown as UnknownRecord;
  const recommendation = record(memory.executiveRecommendation);
  return {
    recommendation,
    risks: recommendation.risks ?? [],
    opportunities:
      record(output.projection).investigationOpportunities ?? [],
  };
}

const stages: StageName[] = [
  "signals",
  "themes",
  "mechanisms",
  "beliefs",
  "concepts",
  "theories",
  "organizationalConditions",
  "organizationalState",
  "executiveAssessment",
  "executiveProjection",
];

function compareScenario(
  scenarioId: string,
  input: InvestigationInput,
): ScenarioImpact {
  const organizationId = `shadow-evidence-independence:${scenarioId}`;
  const production = execute(input, organizationId, "production");
  const productionRepeat = execute(input, organizationId, "production");
  const shadow = execute(input, organizationId, "shadow");
  const shadowRepeat = execute(input, organizationId, "shadow");

  assert.equal(stable(production), stable(productionRepeat));
  assert.equal(stable(shadow), stable(shadowRepeat));
  assert.equal(
    production.runtime.metadata.organizationId,
    shadow.runtime.metadata.organizationId,
  );
  assert.deepEqual(
    production.result.evidence.map((item) => item.id),
    shadow.result.evidence.map((item) => item.id),
  );

  const productionProjection = projectionSlices(production);
  const shadowProjection = projectionSlices(shadow);

  return {
    scenarioId,
    productionByteStable: true,
    shadowByteStable: true,
    organizationIdentityStable: true,
    evidenceIdentityStable: true,
    stageImpacts: stages.map((stage) =>
      compareStage(stage, production, shadow),
    ),
    recommendationChanged:
      stable(productionProjection.recommendation) !==
      stable(shadowProjection.recommendation),
    risksChanged:
      stable(productionProjection.risks) !== stable(shadowProjection.risks),
    opportunitiesChanged:
      stable(productionProjection.opportunities) !==
      stable(shadowProjection.opportunities),
  };
}

const provenanceScenarios = atlasIndustrialProvenanceCases.map((scenario) => ({
  id: `judgment-provenance:${scenario.id}`,
  input: {
    company: "Atlas Industrial Systems",
    website: "https://atlas.invalid",
    industry: "Industrial manufacturing",
    question: "What is constraining reliable execution?",
    context: "",
    evidenceSources: scenario.evidenceSources,
  } satisfies InvestigationInput,
}));

const legacyScenario = {
  id: "legacy-unprovenanced-control",
  input: {
    company: "Continuity Advisory",
    website: "https://continuity.invalid",
    industry: "Professional services",
    question: "What constrains reliable delivery?",
    context:
      "Client delivery depends heavily on founder expertise. Teams repeatedly escalate unfamiliar decisions. Delivery slows when ownership is unclear.",
  } satisfies InvestigationInput,
};

const scenarios = [...provenanceScenarios, legacyScenario].map((scenario) =>
  compareScenario(scenario.id, scenario.input),
);

const aggregate = stages.map((stage) => {
  const impacts = scenarios.map(
    (scenario) =>
      scenario.stageImpacts.find((impact) => impact.stage === stage)!,
  );
  return {
    stage,
    productionObjects: impacts.reduce(
      (sum, impact) => sum + impact.productionObjects,
      0,
    ),
    shadowObjects: impacts.reduce(
      (sum, impact) => sum + impact.shadowObjects,
      0,
    ),
    unchangedObjects: impacts.reduce(
      (sum, impact) => sum + impact.unchangedObjects,
      0,
    ),
    changedObjects: impacts.reduce(
      (sum, impact) => sum + impact.changedObjects,
      0,
    ),
    confidenceDelta: Number(
      impacts
        .reduce((sum, impact) => sum + impact.confidenceDelta, 0)
        .toFixed(12),
    ),
    rankingDelta: impacts.reduce(
      (sum, impact) => sum + impact.rankingDelta,
      0,
    ),
    orderingDelta: impacts.some((impact) => impact.orderingDelta),
    evidenceDelta: impacts.reduce(
      (sum, impact) => sum + impact.evidenceDelta,
      0,
    ),
  } satisfies StageImpact;
});

const downstreamChanges = aggregate
  .filter(
    (impact) =>
      !["signals", "themes"].includes(impact.stage) &&
      impact.changedObjects > 0,
  )
  .reduce((sum, impact) => sum + impact.changedObjects, 0);
const recommendationChanges = scenarios.filter(
  (scenario) => scenario.recommendationChanged,
).length;

const classification: ShadowEvaluationResult["classification"] =
  recommendationChanges > 0 || downstreamChanges > 0
    ? "B — Beneficial but broader propagation"
    : aggregate.find((impact) => impact.stage === "signals")!.changedObjects > 0
      ? "C — Minimal downstream effect"
      : "D — Unsafe";

const evaluation: ShadowEvaluationResult = {
  classification,
  scenarios,
  aggregate,
};

console.log("EVIDENCE INDEPENDENCE SHADOW EVALUATION");
for (const scenario of scenarios) {
  const signalImpact = scenario.stageImpacts.find(
    (impact) => impact.stage === "signals",
  )!;
  console.log(
    [
      `SCENARIO ${scenario.scenarioId}`,
      `signalChanges=${signalImpact.changedObjects}`,
      `signalConfidenceDelta=${signalImpact.confidenceDelta.toFixed(6)}`,
      `recommendationChanged=${scenario.recommendationChanged}`,
    ].join("  "),
  );
}
console.log("");
for (const impact of aggregate) {
  console.log(
    [
      impact.stage.padEnd(26),
      `unchanged=${impact.unchangedObjects}`,
      `changed=${impact.changedObjects}`,
      `confidenceDelta=${impact.confidenceDelta.toFixed(6)}`,
      `rankingDelta=${impact.rankingDelta}`,
      `orderingDelta=${impact.orderingDelta}`,
      `evidenceDelta=${impact.evidenceDelta}`,
    ].join("  "),
  );
}
console.log("");
console.log(
  `Recommendation changes: ${recommendationChanges}/${scenarios.length}`,
);
console.log(
  `Risk changes: ${scenarios.filter((item) => item.risksChanged).length}/${scenarios.length}`,
);
console.log(
  `Opportunity changes: ${scenarios.filter((item) => item.opportunitiesChanged).length}/${scenarios.length}`,
);
console.log(`Classification: ${evaluation.classification}`);
console.log(`Scenarios: ${scenarios.length}`);
console.log("Production replay: byte-identical");
console.log("Shadow replay: byte-identical");
