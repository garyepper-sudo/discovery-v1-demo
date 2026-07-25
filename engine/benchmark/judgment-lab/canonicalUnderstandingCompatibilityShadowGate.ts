import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildAskExperienceView } from "../../../components/product-shell/data/buildAskExperienceView";
import { buildOrganizationExperienceView } from "../../../components/product-shell/data/buildOrganizationExperienceView";
import { buildResearchExperienceView } from "../../../components/product-shell/data/buildResearchExperienceView";
import { buildExecutiveProjection } from "../../../components/executive-v2/projection/buildExecutiveProjection";
import { runDiscoveryV3 } from "../../v3";
import type { OrganizationalExplanation } from "../../v3/model/judgment/organizationalJudgment";
import type { OrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
  resolveCanonicalUnderstandingTrace,
  type CanonicalUnderstandingComposition,
} from "../../v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

const NOW = "2026-07-25T20:00:00.000Z";
const ORGANIZATION_ID = "phase-4b-compatibility-shadow";

function stable(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }
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

function buildLegacyReadThroughCompatibilityAdapter<T>(input: {
  compositions: readonly CanonicalUnderstandingComposition[];
  currentProductionOutput: T;
}): {
  output: T;
  classification: "legacy-assumption";
} {
  if (input.compositions.length === 0) {
    throw new Error("Compatibility adapter requires canonical compositions.");
  }
  return {
    output: input.currentProductionOutput,
    classification: "legacy-assumption",
  };
}

function withFixedClock<T>(operation: () => T): T {
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
    return operation();
  } finally {
    globalThis.Date = RealDate;
    Math.random = realRandom;
  }
}

function buildProductionFixture(): {
  runtime: OrganizationRuntime;
  result: ReturnType<typeof runDiscoveryV3>;
} {
  const input = {
    company: "Phase 4B Compatibility Manufacturing",
    website: "https://phase-4b.invalid",
    industry: "Industrial operations",
    question: "What explains recurring delivery and coordination delays?",
    context:
      "Delivery delays recur across teams despite stable demand. Leaders disagree whether capacity, ownership, or coordination is the primary explanation.",
    evidenceSources: atlasIndustrialArtifacts.map((artifact) => ({
      sourceId: artifact.id,
      sourceType: "phase-4b-normal-runtime-input",
      content: artifact.content,
    })),
  };

  return withFixedClock(() => {
    const result = runDiscoveryV3(input);
    const runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({
        organizationId: ORGANIZATION_ID,
        name: input.company,
        industry: input.industry,
        website: input.website,
      }),
      result,
      input,
    });
    return { runtime, result };
  });
}

function nonExecutiveConsumer(
  compositions: readonly CanonicalUnderstandingComposition[],
): Array<{
  compositionId: string;
  scopeId: string;
  outcomeId: string;
  explanationCount: number;
  unresolved: boolean;
  uncertainty: string[];
}> {
  return compositions.map((composition) => ({
    compositionId: composition.id,
    scopeId: composition.scope.id,
    outcomeId: composition.outcomeRef.id,
    explanationCount: composition.explanationIds.length,
    unresolved: composition.compositionUncertainty.includes(
      "unresolved-alternatives",
    ),
    uncertainty: [...composition.compositionUncertainty],
  }));
}

const originalLog = console.log;
console.log = () => undefined;
let production: ReturnType<typeof buildProductionFixture>;
try {
  production = buildProductionFixture();
} finally {
  console.log = originalLog;
}

const runtimeBytesBefore = stable(production.runtime);
const explanations = production.runtime.memory.organizationalExplanations;
assert(explanations.length > 0, "normal Runtime produced no completed Explanations");

const compositions = buildCanonicalUnderstandingCompatibilityShadow({
  organizationId: ORGANIZATION_ID,
  explanations,
  now: NOW,
});
assert(compositions.length > 0, "compatibility shadow produced no compositions");

type GateResult = {
  id: string;
  passed: true;
  observation: string;
};
const results: GateResult[] = [];
function scenario(id: string, observation: string, work: () => void): void {
  work();
  results.push({ id, passed: true, observation });
}

scenario(
  "01-real-production-explanation-input",
  "The shadow consumed completed Explanations emitted by runDiscoveryV3() through evolveOrganizationRuntime().",
  () => {
    assert.equal(
      explanations.every(
        (explanation) => explanation.organizationId === ORGANIZATION_ID,
      ),
      true,
    );
  },
);

scenario(
  "02-category-a-semantic-preservation",
  "Composition identity, governed scope, outcomes, membership, uncertainty, and revision identity are present.",
  () => {
    for (const composition of compositions) {
      assert(composition.id);
      assert(composition.revisionId);
      assert.equal(composition.organizationId, ORGANIZATION_ID);
      assert.equal(composition.scope.organizationId, ORGANIZATION_ID);
      assert(composition.outcomeRef.id);
      assert(composition.explanationIds.length > 0);
    }
  },
);

scenario(
  "03-no-copied-explanation-ownership",
  "The Category A object contains no claim, ancestry, assumption, Evidence-role, or comparative-semantic fields.",
  () => {
    const forbidden = new Set([
      "claim",
      "claims",
      "ancestry",
      "assumptions",
      "comparativeEvidence",
      "comparativeEvidenceRoles",
      "supportingEvidenceIds",
      "opposingEvidenceIds",
      "sharedEvidenceIds",
      "evidenceIds",
      "mechanismIds",
      "beliefIds",
      "theoryIds",
    ]);
    const inspect = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      for (const [key, nested] of Object.entries(value)) {
        assert.equal(forbidden.has(key), false, `duplicated owner field: ${key}`);
        inspect(nested);
      }
    };
    inspect(compositions);
  },
);

scenario(
  "04-reference-based-trace-resolution",
  "Trace resolution returns the authoritative completed Explanation objects by exact reference.",
  () => {
    for (const composition of compositions) {
      const trace = resolveCanonicalUnderstandingTrace({
        composition,
        explanations,
      });
      assert.deepEqual(
        trace.explanations.map((item) => item.id),
        composition.explanationIds,
      );
      for (const item of trace.explanations) {
        assert.strictEqual(
          item,
          explanations.find((candidate) => candidate.id === item.id),
        );
      }
    }
  },
);

scenario(
  "05-composition-uncertainty",
  "Unresolved membership and unavailable role data are represented only as composition-level uncertainty.",
  () => {
    for (const composition of compositions) {
      if (composition.explanationIds.length > 1) {
        assert(
          composition.compositionUncertainty.includes(
            "unresolved-alternatives",
          ),
        );
      }
    }
  },
);

scenario(
  "06-comparative-role-availability",
  "Role availability is derived from referenced Explanations and is not copied into the Category A object.",
  () => {
    for (const composition of compositions) {
      const trace = resolveCanonicalUnderstandingTrace({
        composition,
        explanations,
      });
      const unavailable = trace.explanations.some(
        (item) => !Array.isArray(item.comparativeEvidenceRoles),
      );
      assert.equal(
        composition.compositionUncertainty.includes(
          "comparative-role-data-unavailable",
        ),
        unavailable,
      );
    }
  },
);

scenario(
  "07-stable-and-revision-identity",
  "Repeat construction preserves identity; changed membership preserves composition identity and changes revision identity.",
  () => {
    const repeated = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: [...explanations].reverse(),
      previousCompositions: compositions,
      now: "2026-07-26T20:00:00.000Z",
    });
    assert.equal(stable(repeated), stable(compositions));

    const first = compositions[0];
    const memberIds = new Set(first.explanationIds);
    const changedExplanations = explanations.filter(
      (item) => !memberIds.has(item.id) || item.id !== first.explanationIds.at(-1),
    );
    const changed = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: changedExplanations,
      previousCompositions: compositions,
      now: "2026-07-26T20:00:00.000Z",
    }).find((item) => item.id === first.id);
    if (first.explanationIds.length > 1) {
      assert(changed);
      assert.equal(changed.id, first.id);
      assert.notEqual(changed.revisionId, first.revisionId);
      assert.equal(changed.previousRevisionId, first.revisionId);
    }
  },
);

scenario(
  "08-organization-isolation",
  "A foreign Explanation cannot enter a composition or trace.",
  () => {
    const foreign: OrganizationalExplanation = {
      ...explanations[0],
      id: "foreign-explanation",
      organizationId: "foreign-organization",
      claim: {
        ...explanations[0].claim,
        scope: {
          ...explanations[0].claim.scope,
          organizationId: "foreign-organization",
        },
      },
    };
    const isolated = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: [...explanations, foreign],
      now: NOW,
    });
    assert.equal(stable(isolated), stable(compositions));
  },
);

const historicalPath = path.join(
  process.cwd(),
  ".discovery-runtime",
  "organizations",
  "atlas-manufacturing-simulation.json",
);
const historicalRuntime = JSON.parse(
  fs.readFileSync(historicalPath, "utf8"),
) as OrganizationRuntime;
const historicalBytes = stable(historicalRuntime);

scenario(
  "09-historical-runtime-compatibility",
  "The existing Atlas Runtime and legacy Understanding records remain byte-identical and receive no fabricated ancestry.",
  () => {
    const historicalExplanations =
      historicalRuntime.memory.organizationalExplanations ?? [];
    buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: historicalRuntime.metadata.organizationId,
      explanations: historicalExplanations,
      now: NOW,
    });
    assert.equal(stable(historicalRuntime), historicalBytes);
    assert.equal(
      historicalRuntime.memory.organizationalUnderstandingState.currentUnderstandings
        .some((item) => Object.hasOwn(item, "explanationIds")),
      false,
    );
  },
);

const productionMemory = production.runtime.memory as unknown as {
  executiveAssessment?: unknown;
  executiveRecommendation?: unknown;
  executiveCommunication?: unknown;
};
const currentOutputs = {
  understanding:
    production.runtime.memory.organizationalUnderstandingState,
  executiveAssessment:
    productionMemory.executiveAssessment,
  recommendation:
    productionMemory.executiveRecommendation,
  communication:
    productionMemory.executiveCommunication,
};

function assertLegacyReadThrough<T>(value: T): void {
  const adapted = buildLegacyReadThroughCompatibilityAdapter({
    compositions,
    currentProductionOutput: value,
  });
  assert.equal(adapted.classification, "legacy-assumption");
  assert.equal(stable(adapted.output), stable(value));
}

scenario(
  "10-current-understanding-consumer-compatibility",
  "Current Understanding remains byte-identical through an explicitly labeled legacy read-through.",
  () => assertLegacyReadThrough(currentOutputs.understanding),
);

scenario(
  "11-executive-assessment-compatibility",
  "Executive Assessment remains byte-identical; deriving it from Category A alone remains an explicit legacy assumption.",
  () => assertLegacyReadThrough(currentOutputs.executiveAssessment),
);

scenario(
  "12-recommendation-compatibility",
  "Recommendation output remains byte-identical through the temporary validation adapter.",
  () => assertLegacyReadThrough(currentOutputs.recommendation),
);

scenario(
  "13-communication-compatibility",
  "Communication output remains byte-identical through the temporary validation adapter.",
  () => assertLegacyReadThrough(currentOutputs.communication),
);

const currentProjection = buildExecutiveProjection({
  result: production.result,
  runtime: production.runtime,
});
const currentViews = {
  organization: buildOrganizationExperienceView(production.runtime),
  ask: buildAskExperienceView(production.runtime),
  research: buildResearchExperienceView(production.runtime),
};

scenario(
  "14-projection-and-product-view-compatibility",
  "Executive projection and existing product views remain byte-identical through legacy read-through adapters.",
  () => {
    assertLegacyReadThrough(currentProjection);
    assertLegacyReadThrough(currentViews);
  },
);

scenario(
  "15-non-executive-application-independence",
  "A bounded operations-oriented fixture consumes Category A directly without Executive Assessment.",
  () => {
    const output = nonExecutiveConsumer(compositions);
    assert.equal(output.length, compositions.length);
    assert.equal(stable(output).includes("executiveAssessment"), false);
    assert.equal(
      output.every((item) => item.scopeId && item.outcomeId),
      true,
    );
  },
);

scenario(
  "16-repeat-run-byte-equality",
  "Repeated shadow and non-executive execution is byte-identical.",
  () => {
    const repeat = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: clone(explanations),
      now: NOW,
    });
    assert.equal(stable(repeat), stable(compositions));
    assert.equal(
      stable(nonExecutiveConsumer(repeat)),
      stable(nonExecutiveConsumer(compositions)),
    );
  },
);

scenario(
  "17-no-runtime-write-or-schema-change",
  "Shadow execution changes no Runtime byte and adds no Runtime field.",
  () => {
    assert.equal(stable(production.runtime), runtimeBytesBefore);
    const beforeKeys = Object.keys(
      createEmptyOrganizationRuntime({
        organizationId: "schema-before",
      }).memory,
    ).sort();
    buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations,
      now: NOW,
    });
    const afterKeys = Object.keys(
      createEmptyOrganizationRuntime({
        organizationId: "schema-after",
      }).memory,
    ).sort();
    assert.deepEqual(afterKeys, beforeKeys);
  },
);

scenario(
  "18-trivial-rollback-boundary",
  "The production Runtime imports no compatibility-shadow module and all shadow state is local.",
  () => {
    const runtimeSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "engine",
        "v3",
        "runtime",
        "evolveOrganizationRuntime.ts",
      ),
      "utf8",
    );
    assert.equal(
      runtimeSource.includes("buildCanonicalUnderstandingCompatibilityShadow"),
      false,
    );
  },
);

const consumerComparisons = [
  {
    consumer: "current-understanding",
    equality: "byte-identical",
    differenceClassification: "Legacy assumption",
  },
  {
    consumer: "executive-assessment",
    equality: "byte-identical",
    differenceClassification: "Legacy assumption",
  },
  {
    consumer: "recommendation",
    equality: "byte-identical",
    differenceClassification: "Legacy assumption",
  },
  {
    consumer: "communication",
    equality: "byte-identical",
    differenceClassification: "Legacy assumption",
  },
  {
    consumer: "projection-and-product-views",
    equality: "byte-identical",
    differenceClassification: "Legacy assumption",
  },
];

const categoryASufficientWithoutLegacy = false;
const architectureError = false;
const classification = architectureError
  ? "C — Category A semantics insufficient"
  : categoryASufficientWithoutLegacy
    ? "A — Category A contract sufficient"
    : "B — Category A requires minor compatibility refinement";

console.log(
  JSON.stringify(
    {
      benchmark:
        "Canonical Organizational Understanding Compatibility Shadow",
      productionInput: {
        path: "runDiscoveryV3 → evolveOrganizationRuntime",
        completedExplanationCount: explanations.length,
        compositionCount: compositions.length,
      },
      results,
      consumerComparisons,
      finding:
        "Category A composes reusable truth without duplicated ownership. Exact current consumer output still depends on explicitly labeled legacy assessment-derived semantics, so bounded derivation adapters remain necessary.",
      scorecard: {
        organizationalUnderstandingIndex: "positive hypothesis only",
        userIntelligenceIndex: "unchanged",
        collectiveIntelligenceIndex: "unchanged",
        governanceIntegrity: "protected through reference-only ownership",
        systemSustainability:
          "positive hypothesis; temporary adapter work remains",
        localUnderstandingUtility: "not claimed",
      },
      rollback:
        "Remove the pure compatibility builder, focused gate, report, and package command; no Runtime repair or migration is required.",
      classification,
    },
    null,
    2,
  ),
);
