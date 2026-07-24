import assert from "node:assert/strict";

import type { InvestigationEvidenceSource } from "../../types";
import { buildEvidence } from "../../v3/evidence";
import type { V3Evidence } from "../../v3/types";

type TargetRelation = "supports" | "opposes" | "irrelevant";

type BenchmarkSource = InvestigationEvidenceSource & {
  relation: TargetRelation;
};

type SourceContribution = {
  sourceId: string;
  contribution: number;
  evidenceText: string;
};

type IndependenceResult = {
  evidenceRecordCount: number;
  supportingRecordCount: number;
  independentSourceCount: number;
  rawRecordContribution: number;
  independentSourceContribution: number;
  sourceContributions: SourceContribution[];
  opposingSourceIds: string[];
  irrelevantSourceIds: string[];
};

type CheckResult = {
  name: string;
  result: IndependenceResult;
};

const SUPPORT_TEXT =
  "Decision ownership delays delivery across three active initiatives.";
const SUPPORT_VARIANTS = [
  "Decision ownership delays delivery across three active initiatives.",
  "Teams report repeated delivery delays when decision ownership is unclear.",
  "Project reviews show significant approval delays after work begins.",
];
const OPPOSING_TEXT =
  "Independent review reports decision ownership does not delay delivery.";
const IRRELEVANT_TEXT =
  "Customer renewal planning increased coverage across three regions.";

function source(
  sourceId: string,
  content: string,
  relation: TargetRelation = "supports",
  metadata: Partial<InvestigationEvidenceSource> = {},
): BenchmarkSource {
  return {
    sourceId,
    sourceType: "benchmark-observation",
    content,
    relation,
    ...metadata,
  };
}

function boundedContribution(evidence: V3Evidence): number {
  return Math.max(0, Math.min(1, evidence.confidence));
}

function stableStrongestEvidence(
  left: V3Evidence,
  right: V3Evidence,
): V3Evidence {
  const confidenceDelta =
    boundedContribution(right) - boundedContribution(left);
  if (confidenceDelta !== 0) return confidenceDelta < 0 ? left : right;

  const textOrder = left.text.localeCompare(right.text);
  if (textOrder !== 0) return textOrder < 0 ? left : right;
  return left.id.localeCompare(right.id) <= 0 ? left : right;
}

function round(value: number): number {
  return Number(value.toFixed(6));
}

/**
 * Benchmark-only source-aware contribution adapter.
 *
 * The target relation is fixture-owned so this experiment measures source
 * independence only. It performs no semantic matching, reliability weighting,
 * recency weighting, contradiction scoring, or production confidence update.
 */
export function evaluateIndependentSourceContribution(
  sources: BenchmarkSource[],
): IndependenceResult {
  const evidence = buildEvidence("", sources);
  const relationBySourceId = new Map(
    sources.map((item) => [item.sourceId, item.relation]),
  );

  assert.equal(
    evidence.length,
    sources.reduce(
      (count, item) =>
        count +
        item.content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean).length,
      0,
    ),
    "all structured benchmark records should preserve source identity",
  );

  const supporting = evidence.filter(
    (item) => relationBySourceId.get(item.sourceId ?? "") === "supports",
  );
  const strongestBySource = new Map<string, V3Evidence>();

  for (const item of supporting) {
    assert.ok(item.sourceId, "benchmark evidence requires stable sourceId");
    const current = strongestBySource.get(item.sourceId);
    strongestBySource.set(
      item.sourceId,
      current ? stableStrongestEvidence(current, item) : item,
    );
  }

  const sourceContributions = [...strongestBySource.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceId, item]) => ({
      sourceId,
      contribution: boundedContribution(item),
      evidenceText: item.text,
    }));

  const sourceIdsFor = (relation: TargetRelation): string[] =>
    [
      ...new Set(
        evidence
          .filter(
            (item) =>
              relationBySourceId.get(item.sourceId ?? "") === relation,
          )
          .map((item) => item.sourceId!),
      ),
    ].sort((left, right) => left.localeCompare(right));

  return {
    evidenceRecordCount: evidence.length,
    supportingRecordCount: supporting.length,
    independentSourceCount: sourceContributions.length,
    rawRecordContribution: round(
      supporting.reduce(
        (sum, item) => sum + boundedContribution(item),
        0,
      ),
    ),
    independentSourceContribution: round(
      sourceContributions.reduce(
        (sum, item) => sum + item.contribution,
        0,
      ),
    ),
    sourceContributions,
    opposingSourceIds: sourceIdsFor("opposes"),
    irrelevantSourceIds: sourceIdsFor("irrelevant"),
  };
}

const checks: CheckResult[] = [];

function check(
  name: string,
  sources: BenchmarkSource[],
  assertion: (result: IndependenceResult) => void,
): IndependenceResult {
  const result = evaluateIndependentSourceContribution(sources);
  assertion(result);
  checks.push({ name, result });
  return result;
}

const baselineSources = [
  source("source:A", SUPPORT_VARIANTS[0]),
  source("source:B", SUPPORT_VARIANTS[1]),
  source("source:C", SUPPORT_VARIANTS[2]),
];

const baseline = check(
  "baseline independent sources",
  baselineSources,
  (result) => {
    assert.equal(result.supportingRecordCount, 3);
    assert.equal(result.independentSourceCount, 3);
    assert.equal(
      result.rawRecordContribution,
      result.independentSourceContribution,
    );
  },
);

check(
  "exact duplicate records from one source",
  [
    source("source:A", SUPPORT_TEXT),
    source("source:A", SUPPORT_TEXT),
  ],
  (result) => {
    assert.equal(result.supportingRecordCount, 2);
    assert.equal(result.independentSourceCount, 1);
    assert.equal(
      result.independentSourceContribution,
      boundedContribution(buildEvidence("", [source("source:A", SUPPORT_TEXT)])[0]),
    );
    assert.ok(
      result.rawRecordContribution > result.independentSourceContribution,
    );
  },
);

check(
  "semantically repeated records sharing one source",
  [source("source:A", SUPPORT_VARIANTS.join("\n"))],
  (result) => {
    assert.equal(result.supportingRecordCount, 3);
    assert.equal(result.independentSourceCount, 1);
    assert.equal(result.sourceContributions.length, 1);
  },
);

check(
  "identical observations from independent sources",
  [
    source("source:A", SUPPORT_TEXT),
    source("source:B", SUPPORT_TEXT),
    source("source:C", SUPPORT_TEXT),
  ],
  (result) => {
    assert.equal(result.supportingRecordCount, 3);
    assert.equal(result.independentSourceCount, 3);
    assert.equal(
      result.rawRecordContribution,
      result.independentSourceContribution,
    );
  },
);

check(
  "removing one independent source removes one contribution",
  baselineSources.slice(0, 2),
  (result) => {
    assert.equal(result.independentSourceCount, 2);
    assert.ok(
      result.independentSourceContribution <
        baseline.independentSourceContribution,
    );
  },
);

check(
  "one strong independent source remains one contribution",
  [
    source(
      "source:strong",
      "A significant 42% approval delay repeatedly affected delivery.",
    ),
  ],
  (result) => {
    assert.equal(result.independentSourceCount, 1);
    assert.equal(result.sourceContributions[0]?.contribution, 0.84);
  },
);

const tenDuplicates = Array.from({ length: 10 }, () =>
  source("source:A", SUPPORT_TEXT),
);
const threeIndependent = ["source:A", "source:B", "source:C"].map((sourceId) =>
  source(sourceId, SUPPORT_TEXT),
);

const duplicateVolume = check(
  "ten duplicate records remain one independent contribution",
  tenDuplicates,
  (result) => {
    assert.equal(result.supportingRecordCount, 10);
    assert.equal(result.independentSourceCount, 1);
  },
);
const distributed = check(
  "three independent observations preserve corroboration",
  threeIndependent,
  (result) => {
    assert.equal(result.supportingRecordCount, 3);
    assert.equal(result.independentSourceCount, 3);
    assert.ok(
      result.independentSourceContribution >
        duplicateVolume.independentSourceContribution,
    );
  },
);

check(
  "large single-source volume cannot outrank distributed corroboration",
  [
    source("source:volume", Array.from({ length: 40 }, () => SUPPORT_TEXT).join("\n")),
  ],
  (result) => {
    assert.equal(result.supportingRecordCount, 40);
    assert.equal(result.independentSourceCount, 1);
    assert.ok(
      result.independentSourceContribution <
        distributed.independentSourceContribution,
    );
  },
);

check(
  "irrelevant plausible evidence does not affect targeted support",
  [...baselineSources, source("source:irrelevant", IRRELEVANT_TEXT, "irrelevant")],
  (result) => {
    assert.equal(
      result.independentSourceContribution,
      baseline.independentSourceContribution,
    );
    assert.deepEqual(result.irrelevantSourceIds, ["source:irrelevant"]);
  },
);

check(
  "contradictory evidence is held constant without contradiction scoring",
  [...baselineSources, source("source:opposition", OPPOSING_TEXT, "opposes")],
  (result) => {
    assert.equal(
      result.independentSourceContribution,
      baseline.independentSourceContribution,
    );
    assert.deepEqual(result.opposingSourceIds, ["source:opposition"]);
  },
);

check(
  "reverse evidence order is deterministic",
  [
    source("source:A", [...SUPPORT_VARIANTS].reverse().join("\n")),
    source("source:B", SUPPORT_TEXT),
  ],
  (reversed) => {
    const forward = evaluateIndependentSourceContribution([
      source("source:A", SUPPORT_VARIANTS.join("\n")),
      source("source:B", SUPPORT_TEXT),
    ]);
    assert.deepEqual(reversed, forward);
  },
);

check(
  "reverse source order is deterministic",
  [...baselineSources].reverse(),
  (result) => {
    assert.deepEqual(result, baseline);
  },
);

check(
  "reliability metadata is present and intentionally ignored",
  baselineSources.map((item, index) => ({
    ...item,
    reliability: [0.05, 0.5, 0.99][index],
  })),
  (result) => {
    assert.deepEqual(result, baseline);
  },
);

check(
  "timestamp metadata is present and intentionally ignored",
  baselineSources.map((item, index) => ({
    ...item,
    observedAt: [
      "2021-01-01T00:00:00.000Z",
      "2026-07-24T00:00:00.000Z",
      "2030-12-31T00:00:00.000Z",
    ][index],
  })),
  (result) => {
    assert.deepEqual(result, baseline);
  },
);

const adversarial = check(
  "adversarial repeated observer versus three independent observations",
  [
    ...tenDuplicates,
    source("source:B", SUPPORT_TEXT),
    source("source:C", SUPPORT_TEXT),
  ],
  (result) => {
    assert.equal(result.evidenceRecordCount, 12);
    assert.equal(result.independentSourceCount, 3);
    assert.equal(
      result.independentSourceContribution,
      distributed.independentSourceContribution,
    );
    assert.ok(
      result.rawRecordContribution >
        result.independentSourceContribution,
    );
  },
);

const repeatedAdversarial = evaluateIndependentSourceContribution([
  ...tenDuplicates,
  source("source:B", SUPPORT_TEXT),
  source("source:C", SUPPORT_TEXT),
]);
assert.deepEqual(adversarial, repeatedAdversarial);

console.log("EVIDENCE INDEPENDENCE BENCHMARK");
for (const { name, result } of checks) {
  console.log(
    `PASS  ${name} — records=${result.supportingRecordCount}, independentSources=${result.independentSourceCount}, raw=${result.rawRecordContribution.toFixed(2)}, independent=${result.independentSourceContribution.toFixed(2)}`,
  );
}
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
console.log(
  `Adversarial result: 12 records → ${adversarial.independentSourceCount} independent sources`,
);
