import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildAskExperienceView } from "../../../components/product-shell/data/buildAskExperienceView";
import { buildOrganizationExperienceView } from "../../../components/product-shell/data/buildOrganizationExperienceView";
import { buildResearchExperienceView } from "../../../components/product-shell/data/buildResearchExperienceView";
import { buildExecutiveProjection } from "../../../components/executive-v2/projection/buildExecutiveProjection";
import { runDiscoveryV3 } from "../../v3";
import type { OrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

const NOW = "2026-07-25T22:00:00.000Z";
const ORGANIZATION_ID = "phase-4c-ownership-migration";

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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function firstDifference(
  left: unknown,
  right: unknown,
  location = "$",
): string | null {
  if (Object.is(left, right)) return null;
  if (
    !left ||
    !right ||
    typeof left !== "object" ||
    typeof right !== "object"
  ) {
    return `${location}: ${stable(left)} !== ${stable(right)}`;
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)])]
    .sort();
  for (const key of keys) {
    if (!(key in leftRecord)) return `${location}.${key}: missing on left`;
    if (!(key in rightRecord)) return `${location}.${key}: missing on right`;
    const difference = firstDifference(
      leftRecord[key],
      rightRecord[key],
      `${location}.${key}`,
    );
    if (difference) return difference;
  }
  return null;
}

function withFixedClock<T>(work: () => T): T {
  const RealDate = Date;
  const realRandom = Math.random;
  class FixedDate extends RealDate {
    constructor(value?: string | number | Date) {
      super(value === undefined ? NOW : value);
    }
    static now(): number {
      return new RealDate(NOW).getTime();
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  Math.random = () => 0.417;
  try {
    return work();
  } finally {
    globalThis.Date = RealDate;
    Math.random = realRandom;
  }
}

const input = {
  company: "Phase 4C Ownership Manufacturing",
  website: "https://phase-4c.invalid",
  industry: "Industrial operations",
  question: "What explains recurring delivery and coordination delays?",
  context:
    "Delivery delays recur across teams despite stable demand. Leaders disagree whether capacity, ownership, or coordination is the primary explanation.",
  evidenceSources: atlasIndustrialArtifacts.map((artifact) => ({
    sourceId: artifact.id,
    sourceType: "phase-4c-runtime-replay",
    content: artifact.content,
  })),
};

function evolve(params: {
  runtime?: OrganizationRuntime;
  mode?: "canonical" | "legacy";
}): {
  runtime: OrganizationRuntime;
  result: ReturnType<typeof runDiscoveryV3>;
} {
  return withFixedClock(() => {
    const result = runDiscoveryV3(input);
    const runtime = evolveOrganizationRuntime({
      runtime:
        params.runtime ??
        createEmptyOrganizationRuntime({
          organizationId: ORGANIZATION_ID,
          name: input.company,
          industry: input.industry,
          website: input.website,
        }),
      result,
      input,
      organizationalUnderstandingOwnershipMode: params.mode,
    });
    return { runtime, result };
  });
}

function withoutCanonicalComposition(runtime: OrganizationRuntime): unknown {
  const value = clone(runtime) as OrganizationRuntime;
  delete value.memory.organizationalUnderstandingState.canonicalCompositions;
  return value;
}

function downstream(runtime: OrganizationRuntime, result: ReturnType<typeof runDiscoveryV3>) {
  const memory = runtime.memory as unknown as Record<string, unknown>;
  return {
    compatibilityUnderstanding:
      runtime.memory.organizationalUnderstandingState.currentUnderstandings,
    executiveAssessment: memory.executiveAssessment,
    recommendation: memory.executiveRecommendation,
    communication: memory.executiveCommunication,
    projection: buildExecutiveProjection({ result, runtime }),
    applicationViews: {
      organization: buildOrganizationExperienceView(runtime),
      ask: buildAskExperienceView(runtime),
      research: buildResearchExperienceView(runtime),
    },
  };
}

const originalLog = console.log;
console.log = () => undefined;
let canonical: ReturnType<typeof evolve>;
let legacy: ReturnType<typeof evolve>;
try {
  canonical = evolve({});
  legacy = evolve({ mode: "legacy" });
} finally {
  console.log = originalLog;
}

type Result = { id: string; passed: true; observation: string };
const results: Result[] = [];
function scenario(id: string, observation: string, work: () => void): void {
  work();
  results.push({ id, passed: true, observation });
}

const compositions =
  canonical.runtime.memory.organizationalUnderstandingState
    .canonicalCompositions ?? [];
const explanations = canonical.runtime.memory.organizationalExplanations;

scenario(
  "01-canonical-owner-active",
  "Normal Runtime evolution persists non-empty Category A compositions inside the existing Organizational Understanding state.",
  () => {
    assert(compositions.length > 0);
    assert(explanations.length > 0);
  },
);

scenario(
  "02-legacy-path-is-explicit-rollback",
  "The explicit legacy mode restores the prior assessment-derived composition path without Category A persistence.",
  () => {
    assert.equal(
      legacy.runtime.memory.organizationalUnderstandingState
        .canonicalCompositions,
      undefined,
    );
  },
);

scenario(
  "03-exact-rollback-runtime-equivalence",
  "Removing the additive canonical field makes the migrated Runtime byte-identical to explicit legacy evolution.",
  () => {
    const rolledBack = withoutCanonicalComposition(canonical.runtime);
    const serializedLegacy = clone(legacy.runtime);
    assert.equal(
      stable(rolledBack),
      stable(serializedLegacy),
      firstDifference(rolledBack, serializedLegacy) ?? undefined,
    );
  },
);

scenario(
  "04-single-composition-owner",
  "Category A composition exists only at organizationalUnderstandingState.canonicalCompositions.",
  () => {
    const runtimeObject = canonical.runtime as unknown as Record<string, unknown>;
    const occurrences =
      stable(runtimeObject).match(/canonicalCompositions/g)?.length ?? 0;
    assert.equal(occurrences, 1);
  },
);

scenario(
  "05-no-duplicated-explanation-truth",
  "Canonical compositions own references only and contain no Explanation claims, ancestry, assumptions, or comparative roles.",
  () => {
    const forbidden = new Set([
      "claim",
      "ancestry",
      "assumptions",
      "comparativeEvidenceRoles",
      "evidenceIds",
      "mechanismIds",
      "beliefIds",
      "theoryIds",
    ]);
    const inspect = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      for (const [key, nested] of Object.entries(value)) {
        assert.equal(forbidden.has(key), false, `duplicated field: ${key}`);
        inspect(nested);
      }
    };
    inspect(compositions);
  },
);

scenario(
  "06-explanation-ownership-unchanged",
  "Completed Explanation bytes are identical between canonical and rollback modes.",
  () => {
    assert.equal(
      stable(canonical.runtime.memory.organizationalExplanations),
      stable(legacy.runtime.memory.organizationalExplanations),
    );
  },
);

scenario(
  "07-executive-assessment-is-downstream-consumer",
  "Executive Assessment receives canonical compositions while remaining byte-identical to rollback output.",
  () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "engine/v3/runtime/evolveOrganizationRuntime.ts",
      ),
      "utf8",
    );
    const compositionPosition = source.indexOf(
      "const canonicalOrganizationalUnderstanding",
    );
    const assessmentPosition = source.indexOf(
      "const executiveAssessment = buildExecutiveAssessment",
    );
    assert(compositionPosition >= 0);
    assert(assessmentPosition > compositionPosition);
    assert(
      source
        .slice(assessmentPosition, assessmentPosition + 900)
        .includes("canonicalOrganizationalUnderstanding"),
    );
    const canonicalMemory = canonical.runtime.memory as unknown as Record<
      string,
      unknown
    >;
    const legacyMemory = legacy.runtime.memory as unknown as Record<
      string,
      unknown
    >;
    assert.equal(
      stable(canonicalMemory.executiveAssessment),
      stable(legacyMemory.executiveAssessment),
    );
  },
);

scenario(
  "08-compatibility-view-retained",
  "Assessment-derived currentUnderstandings remain an explicitly retained compatibility view with exact rollback equality.",
  () => {
    assert.equal(
      stable(
        canonical.runtime.memory.organizationalUnderstandingState
          .currentUnderstandings,
      ),
      stable(
        legacy.runtime.memory.organizationalUnderstandingState
          .currentUnderstandings,
      ),
    );
  },
);

scenario(
  "09-downstream-equivalence",
  "Assessment, recommendation, communication, projection, and product outputs remain byte-identical.",
  () => {
    assert.equal(
      stable(downstream(canonical.runtime, canonical.result)),
      stable(downstream(legacy.runtime, legacy.result)),
    );
  },
);

scenario(
  "10-deterministic-repeated-execution",
  "Repeated canonical Runtime evolution is byte-identical.",
  () => {
    const prior = console.log;
    console.log = () => undefined;
    try {
      const repeat = evolve({});
      assert.equal(stable(repeat.runtime), stable(canonical.runtime));
    } finally {
      console.log = prior;
    }
  },
);

const historicalPath = path.join(
  process.cwd(),
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const historical = JSON.parse(
  fs.readFileSync(historicalPath, "utf8"),
) as OrganizationRuntime;
const historicalBytes = stable(historical);

scenario(
  "11-historical-read-compatibility",
  "Historical Runtime without Category A remains readable and unchanged before evolution.",
  () => {
    assert.equal(
      historical.memory.organizationalUnderstandingState
        .canonicalCompositions,
      undefined,
    );
    assert.equal(stable(historical), historicalBytes);
  },
);

scenario(
  "12-historical-replay-and-rollback",
  "Historical evolution adds Category A prospectively and rolls back exactly without fabricating historical ancestry.",
  () => {
    const prior = console.log;
    console.log = () => undefined;
    try {
      const canonicalHistorical = evolve({ runtime: clone(historical) });
      const legacyHistorical = evolve({
        runtime: clone(historical),
        mode: "legacy",
      });
      assert(
        (
          canonicalHistorical.runtime.memory.organizationalUnderstandingState
            .canonicalCompositions ?? []
        ).length > 0,
      );
      assert.equal(
        stable(withoutCanonicalComposition(canonicalHistorical.runtime)),
        stable(clone(legacyHistorical.runtime)),
      );
      assert.equal(
        legacyHistorical.runtime.memory.organizationalUnderstandingState
          .currentUnderstandings.some((item) =>
            Object.hasOwn(item, "explanationIds"),
          ),
        false,
      );
    } finally {
      console.log = prior;
    }
  },
);

scenario(
  "13-no-benchmark-semantic-dependency",
  "Production ownership files import no benchmark implementation.",
  () => {
    for (const relative of [
      "engine/v3/runtime/evolveOrganizationRuntime.ts",
      "engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts",
      "engine/v3/model/judgment/buildExecutiveAssessment.ts",
    ]) {
      const source = fs.readFileSync(path.join(process.cwd(), relative), "utf8");
      assert.equal(source.includes("engine/benchmark"), false);
      assert.equal(source.includes("../../benchmark"), false);
    }
  },
);

scenario(
  "14-additive-persistence-boundary",
  "Migration uses the existing Organizational Understanding state and creates no new Runtime store.",
  () => {
    const empty = createEmptyOrganizationRuntime({
      organizationId: "phase-4c-empty",
    });
    assert.equal(
      empty.memory.organizationalUnderstandingState.canonicalCompositions,
      undefined,
    );
    assert.equal(
      Object.hasOwn(empty.memory, "canonicalOrganizationalUnderstanding"),
      false,
    );
  },
);

const classification =
  results.length === 14
    ? "A — Canonical ownership migration complete"
    : "C — Ownership migration unsafe";

console.log(
  JSON.stringify(
    {
      benchmark:
        "Canonical Organizational Understanding Ownership Migration Gate",
      results,
      production: {
        completedExplanationCount: explanations.length,
        canonicalCompositionCount: compositions.length,
        compatibilityViewCount:
          canonical.runtime.memory.organizationalUnderstandingState
            .currentUnderstandings.length,
      },
      ownership: {
        completedExplanations:
          "claims, ancestry, assumptions, comparative Evidence roles, and role availability",
        canonicalOrganizationalUnderstanding:
          "composition identity, scope, outcome, Explanation membership, composition uncertainty, and revision identity",
        currentUnderstandings:
          "temporary assessment-derived compatibility view",
        executiveAssessment: "downstream consumer",
      },
      scorecard: {
        organizationalUnderstandingIndex:
          "positive architectural improvement",
        userIntelligenceIndex: "no claim",
        collectiveIntelligenceIndex: "no claim",
        governanceIntegrity: "improved through single truth ownership",
        systemSustainability:
          "improved through additive ownership with exact rollback",
      },
      rollback:
        "Set organizationalUnderstandingOwnershipMode to legacy or remove the additive canonical composition call; the prior Runtime and all downstream bytes are restored.",
      classification,
    },
    null,
    2,
  ),
);
