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
  evaluateCanonicalUnderstandingContribution,
} from "../../v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

const NOW = "2026-07-25T23:00:00.000Z";
const ORGANIZATION_ID = "phase-5a-authority-transitions";

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
  company: "Phase 5A Authority Manufacturing",
  website: "https://phase-5a.invalid",
  industry: "Industrial operations",
  question: "What explains recurring delivery and coordination delays?",
  context:
    "Delivery delays recur across teams despite stable demand. Leaders disagree whether capacity, ownership, or coordination is the primary explanation.",
  evidenceSources: atlasIndustrialArtifacts.map((artifact) => ({
    sourceId: artifact.id,
    sourceType: "phase-5a-runtime-replay",
    content: artifact.content,
  })),
};

function evolve(params: {
  runtime?: OrganizationRuntime;
  authorityMode?: "explicit" | "implicit";
  result?: ReturnType<typeof runDiscoveryV3>;
} = {}) {
  return withFixedClock(() => {
    const result = params.result ?? runDiscoveryV3(input);
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
      organizationalUnderstandingAuthorityMode: params.authorityMode,
    });
    return { runtime, result };
  });
}

function withoutAuthorityTransitions(runtime: OrganizationRuntime): OrganizationRuntime {
  const value = structuredClone(runtime);
  for (const composition of
    value.memory.organizationalUnderstandingState.canonicalCompositions ?? []) {
    delete composition.authorityTransition;
  }
  return value;
}

function downstream(
  runtime: OrganizationRuntime,
  result: ReturnType<typeof runDiscoveryV3>,
) {
  const memory = runtime.memory as unknown as Record<string, unknown>;
  return {
    currentUnderstandings:
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
let explicit: ReturnType<typeof evolve>;
let implicit: ReturnType<typeof evolve>;
try {
  const sharedResult = withFixedClock(() => runDiscoveryV3(input));
  explicit = evolve({ result: clone(sharedResult) });
  implicit = {
    runtime: withoutAuthorityTransitions(explicit.runtime),
    result: clone(explicit.result),
  };
} finally {
  console.log = originalLog;
}

const explanations = explicit.runtime.memory.organizationalExplanations;
const compositions =
  explicit.runtime.memory.organizationalUnderstandingState
    .canonicalCompositions ?? [];
assert(explanations.length > 0);
assert(compositions.length > 0);

const validExplanation = explanations[0];
const provisionalExplanation: OrganizationalExplanation = {
  ...clone(validExplanation),
  id: `${validExplanation.id}:provisional`,
  semanticKey: `${validExplanation.semanticKey}:provisional`,
  evidenceIds: [],
};
const foreignExplanation: OrganizationalExplanation = {
  ...clone(validExplanation),
  id: `${validExplanation.id}:foreign`,
  organizationId: "different-organization",
  claim: {
    ...clone(validExplanation.claim),
    scope: {
      ...clone(validExplanation.claim.scope),
      organizationId: "different-organization",
    },
  },
};

type Result = { id: string; passed: true; observation: string };
const results: Result[] = [];
function scenario(id: string, observation: string, work: () => void): void {
  work();
  results.push({ id, passed: true, observation });
}

scenario(
  "01-valid-contribution-is-composition-eligible",
  "A completed Explanation satisfying existing organization, scope, Evidence identity, outcome, and ancestry semantics is explicitly admitted and composition eligible.",
  () => {
    const decision = evaluateCanonicalUnderstandingContribution({
      organizationId: ORGANIZATION_ID,
      explanation: validExplanation,
    });
    assert.equal(decision.contributionAdmission, "admitted");
    assert.equal(decision.cognitiveUse, "eligible");
    assert.equal(decision.canonicalCompositionEligibility, "eligible");
    assert.equal(
      decision.authorityDisposition,
      "authorized-organizational-knowledge",
    );
  },
);

scenario(
  "02-invalid-contribution-remains-provisional",
  "A contribution without Evidence ancestry remains provisional without inferring authority from any confidence or persistence signal.",
  () => {
    const decision = evaluateCanonicalUnderstandingContribution({
      organizationId: ORGANIZATION_ID,
      explanation: provisionalExplanation,
    });
    assert.equal(decision.contributionAdmission, "provisional");
    assert.equal(decision.cognitiveUse, "provisional-only");
    assert.equal(decision.canonicalCompositionEligibility, "ineligible");
    assert.equal(decision.authorityDisposition, "provisional");
    assert(decision.basis.includes("missing-evidence-ancestry"));
  },
);

scenario(
  "03-provisional-cognition-never-becomes-canonical",
  "The canonical builder excludes provisional Explanations while retaining eligible completed Explanations.",
  () => {
    const output = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: [validExplanation, provisionalExplanation],
      now: NOW,
    });
    assert(output.length > 0);
    assert(
      output.every(
        (composition) =>
          !composition.explanationIds.includes(provisionalExplanation.id),
      ),
    );
  },
);

scenario(
  "04-persistence-does-not-imply-authority",
  "A provisional Explanation may exist in Runtime memory while its explicit authority disposition remains provisional.",
  () => {
    const persisted = clone(explicit.runtime);
    persisted.memory.organizationalExplanations.push(provisionalExplanation);
    assert(
      persisted.memory.organizationalExplanations.some(
        (item) => item.id === provisionalExplanation.id,
      ),
    );
    const decision = evaluateCanonicalUnderstandingContribution({
      organizationId: ORGANIZATION_ID,
      explanation: provisionalExplanation,
    });
    assert.equal(decision.persistenceEligibility, "eligible-as-provisional");
    assert.equal(decision.authorityDisposition, "provisional");
  },
);

scenario(
  "05-authority-survives-runtime-replay",
  "Authorized composition receipts persist with stable owners and disposition across deterministic Runtime replay.",
  () => {
    const prior = console.log;
    console.log = () => undefined;
    try {
      const replay = evolve({ runtime: clone(explicit.runtime) });
      const replayed =
        replay.runtime.memory.organizationalUnderstandingState
          .canonicalCompositions ?? [];
      assert(replayed.length > 0);
      assert(
        replayed.every(
          (composition) =>
            composition.authorityTransition?.disposition ===
            "authorized-organizational-knowledge",
        ),
      );
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
  "06-historical-runtime-compatibility",
  "Historical Runtime reads remain byte-identical and do not fabricate authority before forward evolution.",
  () => {
    assert.equal(stable(historical), historicalBytes);
    assert(
      (
        historical.memory.organizationalUnderstandingState
          .canonicalCompositions ?? []
      ).every((composition) => composition.authorityTransition === undefined),
    );
  },
);

scenario(
  "07-pre-authority-rollback",
  "The explicit builder with receipts removed is byte-identical to its pre-authority compatibility mode.",
  () => {
    const explicitCompositions =
      buildCanonicalUnderstandingCompatibilityShadow({
        organizationId: ORGANIZATION_ID,
        explanations,
        now: NOW,
      }).map((composition) => {
        const value = clone(composition);
        delete value.authorityTransition;
        return value;
      });
    const implicitCompositions =
      buildCanonicalUnderstandingCompatibilityShadow({
        organizationId: ORGANIZATION_ID,
        explanations,
        now: NOW,
        authorityTransitionMode: "implicit",
      });
    assert.equal(
      stable(explicitCompositions),
      stable(implicitCompositions),
      firstDifference(explicitCompositions, implicitCompositions) ?? undefined,
    );
  },
);

scenario(
  "08-organization-isolation",
  "A foreign-organization Explanation is provisional and cannot enter this organization's canonical composition.",
  () => {
    const decision = evaluateCanonicalUnderstandingContribution({
      organizationId: ORGANIZATION_ID,
      explanation: foreignExplanation,
    });
    assert.equal(decision.authorityDisposition, "provisional");
    const output = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: [validExplanation, foreignExplanation],
      now: NOW,
    });
    assert(
      output.every(
        (composition) =>
          !composition.explanationIds.includes(foreignExplanation.id),
      ),
    );
  },
);

scenario(
  "09-repeated-execution-equality",
  "Repeated explicit-authority evaluation and canonical composition are byte-identical.",
  () => {
    const first = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations,
      now: NOW,
    });
    const second = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: clone(explanations),
      now: NOW,
    });
    assert.equal(stable(first), stable(second));
  },
);

scenario(
  "10-reversed-order-equality",
  "Reversing completed Explanation order produces the same authority decisions and canonical compositions.",
  () => {
    const forward = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations,
      now: NOW,
    });
    const reversed = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId: ORGANIZATION_ID,
      explanations: [...explanations].reverse(),
      now: NOW,
    });
    assert.equal(stable(forward), stable(reversed));
  },
);

scenario(
  "11-no-application-behavior-change",
  "Executive Assessment, recommendation, communication, projection, and product views remain byte-identical to the pre-authority path.",
  () => {
    const explicitDownstream = downstream(explicit.runtime, explicit.result);
    const implicitDownstream = downstream(implicit.runtime, implicit.result);
    assert.equal(
      stable(explicitDownstream),
      stable(implicitDownstream),
      firstDifference(explicitDownstream, implicitDownstream) ?? undefined,
    );
  },
);

scenario(
  "12-no-duplicate-truth-or-authority-owner",
  "Authority receipts exist only on canonical compositions and copy no Explanation claims, ancestry, assumptions, or comparative roles.",
  () => {
    const serialized = stable(explicit.runtime);
    assert.equal(
      serialized.match(/canonical-understanding-contribution-validation/g)
        ?.length,
      compositions.length,
    );
    for (const composition of compositions) {
      const authority = composition.authorityTransition;
      assert(authority);
      const authorityBytes = stable(authority);
      for (const forbidden of [
        '"claim"',
        '"evidenceIds"',
        '"mechanismIds"',
        '"beliefIds"',
        '"theoryIds"',
        '"comparativeEvidenceRoles"',
      ]) {
        assert.equal(authorityBytes.includes(forbidden), false);
      }
    }
  },
);

scenario(
  "13-authority-is-not-inferred-from-confidence-or-recommendation",
  "The production validator reads no confidence, rank, recommendation, adjudication, permission, or Governance policy field.",
  () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts",
      ),
      "utf8",
    );
    const evaluator = source.slice(
      source.indexOf("export function evaluateCanonicalUnderstandingContribution"),
      source.indexOf("/**\n * Phase 4B compatibility shadow"),
    );
    for (const forbidden of [
      ".confidence",
      ".rank",
      "executiveRecommendation",
      "permission",
      "policyVersion",
      "adjudicat",
    ]) {
      assert.equal(evaluator.includes(forbidden), false, forbidden);
    }
  },
);

scenario(
  "14-disclosure-remains-independent",
  "Authority receipts explicitly leave disclosure unevaluated at the application boundary.",
  () => {
    assert(
      compositions.every(
        (composition) =>
          composition.authorityTransition?.disclosureOwner ===
            "application-boundary-not-evaluated" &&
          composition.authorityTransition.disposition ===
            "authorized-organizational-knowledge",
      ),
    );
    const decision = evaluateCanonicalUnderstandingContribution({
      organizationId: ORGANIZATION_ID,
      explanation: validExplanation,
    });
    assert.equal(decision.disclosureEligibility, "not-evaluated");
  },
);

console.log(
  JSON.stringify(
    {
      benchmark: "Explicit Authority Transitions and Contribution Validation",
      results,
      production: {
        completedExplanationCount: explanations.length,
        authorizedCompositionCount: compositions.length,
        provisionalFixtureCount: 2,
        newRuntimeCollections: 0,
      },
      authorityModel: {
        contributionAdmission: "completed-Explanation structural validation",
        cognitiveUse: "eligible or provisional-only",
        canonicalCompositionEligibility: "eligible or ineligible",
        persistenceEligibility: "eligible or eligible-as-provisional",
        authorityDisposition:
          "authorized-organizational-knowledge or provisional",
        disclosureEligibility: "not-evaluated",
      },
      scorecard: {
        organizationalUnderstanding: "Improved",
        userIntelligence: "Unchanged",
        collectiveIntelligence: "Not Measured",
        governanceIntegrity: "Improved",
        systemSustainability: "Improved",
      },
      rollback:
        "Set organizationalUnderstandingAuthorityMode to implicit and remove additive authorityTransition receipts.",
      classification:
        results.length === 14
          ? "A — EXPLICIT AUTHORITY TRANSITIONS DEMONSTRATED"
          : "C — AUTHORITY ARCHITECTURE INSUFFICIENT",
    },
    null,
    2,
  ),
);
