import assert from "node:assert/strict";

import { buildExecutiveProjection } from "../../../components/executive-v2/projection/buildExecutiveProjection";
import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../v3/types";
import { runEvidenceIndependenceShadow } from "./runEvidenceIndependenceShadow";

type UnknownRecord = Record<string, unknown>;

type Output = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
  projection: ReturnType<typeof buildExecutiveProjection>;
};

type StageName =
  | "themes"
  | "mechanisms"
  | "beliefs"
  | "concepts"
  | "theories"
  | "conditions"
  | "organizationalState"
  | "executiveAssessment"
  | "executiveProjection";

type Impact = {
  stage: StageName;
  changedObjects: number;
  confidenceDelta: number;
  rankingDelta: number;
  orderingDelta: boolean;
  supportIdentityDelta: number;
};

type Scenario = {
  id: string;
  input: InvestigationInput;
  equalsScenarioId?: string;
};

type ScenarioResult = {
  id: string;
  signalOnlyThemeChanges: number;
  themePolicyChanges: number;
  impacts: Impact[];
  recommendationChanged: boolean;
  risksChanged: boolean;
  opportunitiesChanged: boolean;
  primaryConstraintChanged: boolean;
  evidenceIdentityChanged: boolean;
  organizationIdentityChanged: boolean;
  productionByteStable: boolean;
  shadowByteStable: boolean;
};

const FIXED_TIME = Date.parse("2026-07-24T14:00:00.000Z");
const SUPPORT =
  "Customer complaints show repeated support response delays and churn risk.";
const SUPPORT_TWO =
  "Customer feedback reports slow support response and recurring complaints.";
const SUPPORT_THREE =
  "Renewal reviews identify customer churn risk after delayed support.";
const STRONG_SUPPORT =
  "Customer complaints increased 42% after significant support response delays.";
const IRRELEVANT =
  "Hiring plans increased recruiting coverage across three engineering regions.";
const OPPOSING =
  "Customer renewals improved despite stable support response times.";

function source(
  sourceId: string,
  content: string,
  metadata: Partial<InvestigationEvidenceSource> = {},
): InvestigationEvidenceSource {
  return {
    sourceId,
    sourceType: "theme-composition-fixture",
    content,
    ...metadata,
  };
}

function input(
  evidenceSources: InvestigationEvidenceSource[],
): InvestigationInput {
  return {
    company: "Theme Composition Company",
    website: "https://theme-composition.invalid",
    industry: "Services",
    question: "What is driving customer friction?",
    context: "",
    evidenceSources,
  };
}

function canonicalInput(value: InvestigationInput): InvestigationInput {
  return {
    ...value,
    evidenceSources: value.evidenceSources
      ?.map((item) => ({
        ...item,
        content: item.content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right))
          .join("\n"),
      }))
      .sort(
        (left, right) =>
          left.sourceId.localeCompare(right.sourceId) ||
          left.content.localeCompare(right.content),
      ),
  };
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

function withDeterminism<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  let tick = 0;
  let randomState = 0x1132026;

  class FixedDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length > 0) super(...args);
      else super(FIXED_TIME + tick++);
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
  scenarioId: string,
  rawInput: InvestigationInput,
  mode: "production" | "signal-only" | "theme-shadow",
): Output {
  const benchmarkInput = canonicalInput(rawInput);
  return withDeterminism(() =>
    withoutLogs(() => {
      const result =
        mode === "production"
          ? runDiscoveryV3(benchmarkInput)
          : runEvidenceIndependenceShadow(
              benchmarkInput,
              mode === "theme-shadow"
                ? { themeEvidenceComposition: "independent-source" }
                : {},
            );
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `theme-composition:${scenarioId}`,
          name: benchmarkInput.company,
          industry: benchmarkInput.industry,
          website: benchmarkInput.website,
        }),
        result,
        input: benchmarkInput,
      });
      return {
        result,
        runtime,
        projection: buildExecutiveProjection({ result, runtime }),
      };
    }),
  );
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function stageObjects(output: Output, stage: StageName): UnknownRecord[] {
  const memory = output.runtime.memory as unknown as UnknownRecord;
  switch (stage) {
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
    case "conditions":
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

function supportIdentities(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(supportIdentities);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as UnknownRecord).flatMap(([key, item]) => {
    if (
      /(evidence|signal|theme|mechanism|belief|concept|theory)ids$/i.test(key) &&
      Array.isArray(item)
    ) {
      return item.filter((entry): entry is string => typeof entry === "string");
    }
    return supportIdentities(item);
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

function compare(
  stage: StageName,
  production: Output,
  shadow: Output,
): Impact {
  const left = stageObjects(production, stage);
  const right = stageObjects(shadow, stage);
  const leftIds = left.map(identity);
  const rightIds = right.map(identity);
  const leftById = new Map(left.map((item, index) => [leftIds[index], item]));
  const rightById = new Map(right.map((item, index) => [rightIds[index], item]));
  const allIds = [...new Set([...leftIds, ...rightIds])];
  const changedObjects = allIds.filter((id) => {
    return stable(leftById.get(id)) !== stable(rightById.get(id));
  }).length;
  const matched = allIds.filter(
    (id) => leftById.has(id) && rightById.has(id),
  );
  const confidenceDelta = matched.reduce((sum, id) => {
    const before = confidence(leftById.get(id)!);
    const after = confidence(rightById.get(id)!);
    return before === undefined || after === undefined
      ? sum
      : sum + after - before;
  }, 0);
  const rankingDelta = matched.reduce(
    (sum, id) =>
      sum + Math.abs(leftIds.indexOf(id) - rightIds.indexOf(id)),
    0,
  );

  return {
    stage,
    changedObjects,
    confidenceDelta: Number(confidenceDelta.toFixed(12)),
    rankingDelta,
    orderingDelta: stable(leftIds) !== stable(rightIds),
    supportIdentityDelta: symmetricDifference(
      supportIdentities(left),
      supportIdentities(right),
    ),
  };
}

function projectionSlices(output: Output): {
  recommendation: unknown;
  risks: unknown;
  opportunities: unknown;
  primaryConstraint: unknown;
} {
  const memory = output.runtime.memory as unknown as UnknownRecord;
  const recommendation = record(memory.executiveRecommendation);
  return {
    recommendation,
    risks: recommendation.risks ?? [],
    opportunities:
      record(output.projection).investigationOpportunities ?? [],
    primaryConstraint: memory.primaryExecutiveConstraint ?? null,
  };
}

const repeatedTen = Array.from({ length: 10 }, () =>
  source("source:A", SUPPORT),
);
const repeatedForty = Array.from({ length: 40 }, () =>
  source("source:A", SUPPORT),
);
const independentThree = [
  source("source:A", SUPPORT),
  source("source:B", SUPPORT_TWO),
  source("source:C", SUPPORT_THREE),
];

const scenarios: Scenario[] = [
  {
    id: "baseline-independent",
    input: input(independentThree),
  },
  {
    id: "exact-duplicate",
    input: input([
      source("source:A", SUPPORT),
      source("source:A", SUPPORT),
    ]),
  },
  {
    id: "ten-repeated-one-source",
    input: input(repeatedTen),
  },
  {
    id: "three-independent",
    input: input(independentThree),
  },
  {
    id: "adversarial-a10-b1-c1",
    input: input([
      ...repeatedTen,
      source("source:B", SUPPORT_TWO),
      source("source:C", SUPPORT_THREE),
    ]),
  },
  {
    id: "large-one-source-volume",
    input: input(repeatedForty),
  },
  {
    id: "smaller-distributed-support",
    input: input(independentThree),
  },
  {
    id: "one-strong-source",
    input: input([source("source:strong", STRONG_SUPPORT)]),
  },
  {
    id: "irrelevant-plausible",
    input: input([
      ...independentThree,
      source("source:irrelevant", IRRELEVANT),
    ]),
  },
  {
    id: "contradiction-held-constant",
    input: input([
      ...independentThree,
      source("source:opposition", OPPOSING),
    ]),
  },
  {
    id: "reliability-unused",
    input: input(
      independentThree.map((item, index) => ({
        ...item,
        reliability: [0.05, 0.5, 0.99][index],
      })),
    ),
    equalsScenarioId: "baseline-independent",
  },
  {
    id: "timestamp-unused",
    input: input(
      independentThree.map((item, index) => ({
        ...item,
        observedAt: [
          "2020-01-01T00:00:00.000Z",
          "2026-07-24T00:00:00.000Z",
          "2030-01-01T00:00:00.000Z",
        ][index],
      })),
    ),
    equalsScenarioId: "baseline-independent",
  },
  {
    id: "reverse-evidence-order",
    input: input([
      source("source:A", [SUPPORT, SUPPORT_TWO, SUPPORT_THREE].reverse().join("\n")),
    ]),
    equalsScenarioId: "forward-evidence-order",
  },
  {
    id: "forward-evidence-order",
    input: input([
      source("source:A", [SUPPORT, SUPPORT_TWO, SUPPORT_THREE].join("\n")),
    ]),
  },
  {
    id: "reverse-source-order",
    input: input([...independentThree].reverse()),
    equalsScenarioId: "baseline-independent",
  },
  {
    id: "unprovenanced-control",
    input: {
      ...input([]),
      context: [SUPPORT, SUPPORT_TWO, SUPPORT_THREE].join("\n"),
    },
  },
];

const stages: StageName[] = [
  "themes",
  "mechanisms",
  "beliefs",
  "concepts",
  "theories",
  "conditions",
  "organizationalState",
  "executiveAssessment",
  "executiveProjection",
];

const scenarioResults: ScenarioResult[] = scenarios.map((scenario) => {
  const production = execute(scenario.id, scenario.input, "production");
  const productionRepeat = execute(scenario.id, scenario.input, "production");
  const signalOnly = execute(scenario.id, scenario.input, "signal-only");
  const shadow = execute(scenario.id, scenario.input, "theme-shadow");
  const shadowRepeat = execute(scenario.id, scenario.input, "theme-shadow");

  assert.equal(stable(production), stable(productionRepeat));
  assert.equal(stable(shadow), stable(shadowRepeat));
  assert.deepEqual(
    production.result.evidence.map((item) => item.id),
    shadow.result.evidence.map((item) => item.id),
  );
  assert.equal(
    production.runtime.metadata.organizationId,
    shadow.runtime.metadata.organizationId,
  );

  const productionProjection = projectionSlices(production);
  const shadowProjection = projectionSlices(shadow);

  return {
    id: scenario.id,
    signalOnlyThemeChanges: compare(
      "themes",
      production,
      signalOnly,
    ).changedObjects,
    themePolicyChanges: compare(
      "themes",
      signalOnly,
      shadow,
    ).changedObjects,
    impacts: stages.map((stage) => compare(stage, production, shadow)),
    recommendationChanged:
      stable(productionProjection.recommendation) !==
      stable(shadowProjection.recommendation),
    risksChanged:
      stable(productionProjection.risks) !== stable(shadowProjection.risks),
    opportunitiesChanged:
      stable(productionProjection.opportunities) !==
      stable(shadowProjection.opportunities),
    primaryConstraintChanged:
      stable(productionProjection.primaryConstraint) !==
      stable(shadowProjection.primaryConstraint),
    evidenceIdentityChanged: false,
    organizationIdentityChanged: false,
    productionByteStable: true,
    shadowByteStable: true,
  };
});

for (const scenario of scenarios) {
  if (!scenario.equalsScenarioId) continue;
  const expectedScenario = scenarios.find(
    (item) => item.id === scenario.equalsScenarioId,
  )!;
  const currentOutput = execute(
    scenario.id,
    scenario.input,
    "theme-shadow",
  );
  const expectedOutput = execute(
    scenario.id,
    expectedScenario.input,
    "theme-shadow",
  );
  const cognitionAndProjection = (output: Output): unknown => ({
    stages: stages.map((stage) => stageObjects(output, stage)),
    projection: projectionSlices(output),
  });
  assert.equal(
    stable(cognitionAndProjection(currentOutput)),
    stable(cognitionAndProjection(expectedOutput)),
  );
}

const aggregate = stages.map((stage) => {
  const impacts = scenarioResults.map(
    (scenario) => scenario.impacts.find((impact) => impact.stage === stage)!,
  );
  return {
    stage,
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
    supportIdentityDelta: impacts.reduce(
      (sum, impact) => sum + impact.supportIdentityDelta,
      0,
    ),
  } satisfies Impact;
});

const themeChanges =
  aggregate.find((impact) => impact.stage === "themes")?.changedObjects ?? 0;
const postThemeChanges = aggregate
  .filter((impact) => impact.stage !== "themes")
  .reduce((sum, impact) => sum + impact.changedObjects, 0);
const identityOrOrderingInstability =
  aggregate.some(
    (impact) =>
      impact.supportIdentityDelta > 0 ||
      impact.orderingDelta,
  ) ||
  scenarioResults.some(
    (scenario) =>
      scenario.evidenceIdentityChanged ||
      scenario.organizationIdentityChanged,
  );

const classification = identityOrOrderingInstability
  ? "D — Unsafe or ambiguous"
  : themeChanges === 0
    ? "C — Theme raw counts are not materially responsible"
    : postThemeChanges === 0
      ? "B — Theme correction helps but downstream composition still masks it"
      : "B — Theme correction helps but downstream composition still masks it";

console.log("THEME EVIDENCE COMPOSITION ISOLATION");
for (const scenario of scenarioResults) {
  const theme = scenario.impacts.find((impact) => impact.stage === "themes")!;
  console.log(
    [
      `SCENARIO ${scenario.id}`,
      `themeChanges=${theme.changedObjects}`,
      `confidenceDelta=${theme.confidenceDelta.toFixed(3)}`,
      `signalOnlyThemeChanges=${scenario.signalOnlyThemeChanges}`,
      `themePolicyChanges=${scenario.themePolicyChanges}`,
      `recommendationChanged=${scenario.recommendationChanged}`,
    ].join("  "),
  );
}
console.log("");
for (const impact of aggregate) {
  console.log(
    [
      impact.stage.padEnd(24),
      `changed=${impact.changedObjects}`,
      `confidenceDelta=${impact.confidenceDelta.toFixed(3)}`,
      `rankingDelta=${impact.rankingDelta}`,
      `orderingDelta=${impact.orderingDelta}`,
      `supportIdentityDelta=${impact.supportIdentityDelta}`,
    ].join("  "),
  );
}
console.log("");
console.log(
  `Recommendation changes: ${scenarioResults.filter((item) => item.recommendationChanged).length}/${scenarioResults.length}`,
);
console.log(
  `Risk changes: ${scenarioResults.filter((item) => item.risksChanged).length}/${scenarioResults.length}`,
);
console.log(
  `Opportunity changes: ${scenarioResults.filter((item) => item.opportunitiesChanged).length}/${scenarioResults.length}`,
);
console.log(
  `Primary constraint changes: ${scenarioResults.filter((item) => item.primaryConstraintChanged).length}/${scenarioResults.length}`,
);
console.log(`Classification: ${classification}`);
console.log("Production replay: byte-identical");
console.log("Shadow replay: byte-identical");
