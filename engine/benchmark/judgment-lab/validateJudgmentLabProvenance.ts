import assert from "node:assert/strict";

import type { InvestigationEvidenceSource } from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import {
  atlasIndustrialProvenanceCases,
  buildLegacyArtifactContext,
} from "./atlasIndustrialProvenancePilot";
import { atlasIndustrialOrganization } from "./atlasIndustrialPilot";

const fixedTimestamp = "2026-07-01T12:00:00.000Z";
const checks: string[] = [];

function check(name: string, assertion: () => void): void {
  assertion();
  checks.push(name);
}

function withFixedClock<T>(work: () => T): T {
  const NativeDate = Date;
  const fixedTime = NativeDate.parse(fixedTimestamp);
  class FixedDate extends NativeDate {
    constructor(value?: string | number | Date) {
      super(value === undefined ? fixedTime : value);
    }
    static now(): number {
      return fixedTime;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  try {
    return work();
  } finally {
    globalThis.Date = NativeDate;
  }
}

function run(
  context: string,
  evidenceSources?: InvestigationEvidenceSource[],
) {
  return withFixedClock(() => {
    const input = {
      company: atlasIndustrialOrganization.name,
      website: "https://judgment-lab.invalid",
      industry: atlasIndustrialOrganization.industry,
      question: atlasIndustrialOrganization.investigationQuestion,
      context,
      evidenceSources,
    };
    const originalLog = console.log;
    try {
      console.log = () => undefined;
      const result = runDiscoveryV3(input);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: atlasIndustrialOrganization.id,
          name: atlasIndustrialOrganization.name,
          industry: atlasIndustrialOrganization.industry,
        }),
        result,
        input,
      });
      return { result, runtime };
    } finally {
      console.log = originalLog;
    }
  });
}

function stripProvenance<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripProvenance) as T;
  }
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) =>
        !["sourceId", "sourceType", "observedAt", "reliability"].includes(key)
      )
      .map(([key, item]) => [key, stripProvenance(item)]),
  ) as T;
}

function substantiveRuntime(runtime: ReturnType<typeof evolveOrganizationRuntime>) {
  const memory = runtime.memory as typeof runtime.memory & {
    primaryExecutiveConstraint?: unknown;
    executiveAssessment?: unknown;
    executiveRecommendation?: unknown;
    investigationOpportunities?: unknown;
  };
  return {
    metadata: runtime.metadata,
    organizationModel: runtime.organizationModel,
    primaryExecutiveConstraint: memory.primaryExecutiveConstraint,
    executiveAssessment: memory.executiveAssessment,
    executiveRecommendation: memory.executiveRecommendation,
    investigationOpportunities: memory.investigationOpportunities,
    organizationalConditions: memory.organizationalConditions,
    organizationalState: memory.organizationalState,
  };
}

for (const testCase of atlasIndustrialProvenanceCases) {
  const legacy = run(buildLegacyArtifactContext(testCase.artifacts));
  const structured = run("", testCase.evidenceSources);

  check(`${testCase.id}: structured provenance preserves canonical cognition`, () => {
    assert.deepEqual(
      stripProvenance(structured.result),
      stripProvenance(legacy.result),
    );
    assert.deepEqual(
      stripProvenance(substantiveRuntime(structured.runtime)),
      stripProvenance(substantiveRuntime(legacy.runtime)),
    );
  });

  check(`${testCase.id}: structured evidence preserves source identity`, () => {
    const sourceIds = structured.result.evidence
      .map((item) => item.sourceId)
      .filter((item): item is string => Boolean(item));
    assert.ok(sourceIds.length > 0);
  });
}

check("exact duplicates share one source identity", () => {
  const testCase = atlasIndustrialProvenanceCases.find(
    (item) => item.id === "exact-duplicate",
  )!;
  const structured = run("", testCase.evidenceSources);
  assert.ok(
    structured.result.evidence.filter(
      (item) => item.sourceId === "artifact:A04",
    ).length > 8,
  );
});

check("independent A04 and A11 evidence retains distinct source identities", () => {
  const baseline = atlasIndustrialProvenanceCases.find(
    (item) => item.id === "baseline",
  )!;
  const structured = run("", baseline.evidenceSources);
  const sourceIds = new Set(
    structured.result.evidence.map((item) => item.sourceId),
  );
  assert.ok(sourceIds.has("artifact:A04"));
  assert.ok(sourceIds.has("artifact:A11"));
});

check("weakened evidence retains lower reliability", () => {
  const testCase = atlasIndustrialProvenanceCases.find(
    (item) => item.id === "weakened",
  )!;
  const structured = run("", testCase.evidenceSources);
  assert.ok(
    structured.result.evidence
      .filter((item) => item.sourceId === "artifact:A04")
      .every((item) => item.reliability === 0.4),
  );
});

check("stale evidence retains older observed time", () => {
  const testCase = atlasIndustrialProvenanceCases.find(
    (item) => item.id === "stale",
  )!;
  const structured = run("", testCase.evidenceSources);
  assert.ok(
    structured.result.evidence
      .filter((item) => item.sourceId === "artifact:A04")
      .every((item) => item.observedAt === "2023-06-04T12:00:00.000Z"),
  );
});

check("contradictory evidence retains independent source identity", () => {
  const testCase = atlasIndustrialProvenanceCases.find(
    (item) => item.id === "contradicted",
  )!;
  const structured = run("", testCase.evidenceSources);
  assert.ok(
    structured.result.evidence.some(
      (item) => item.sourceId === "artifact:A17",
    ),
  );
});

check("repeated structured runs are deterministic", () => {
  const baseline = atlasIndustrialProvenanceCases[0];
  const first = run("", baseline.evidenceSources);
  const second = run("", baseline.evidenceSources);
  assert.deepEqual(first.result.evidence, second.result.evidence);
  assert.deepEqual(
    stripProvenance(substantiveRuntime(first.runtime)),
    stripProvenance(substantiveRuntime(second.runtime)),
  );
});

console.log("JUDGMENT LAB STRUCTURED PROVENANCE");
for (const name of checks) console.log(`PASS  ${name}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
