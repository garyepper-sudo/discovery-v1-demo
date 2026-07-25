import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import type { OrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
  type CanonicalUnderstandingComposition,
} from "../../v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  discloseCanonicalOrganizationalUnderstanding,
  type OrganizationalUnderstandingDisclosureDecision,
} from "../../v3/understanding/discloseCanonicalOrganizationalUnderstanding";

const NOW = "2026-07-26T00:00:00.000Z";
const ORGANIZATION_ID = "phase-5b-disclosure";
const CONSUMER_ID = "executive-projection-contract";

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

function decision(
  disposition: "eligible" | "withheld" | "revoked",
  overrides: Partial<OrganizationalUnderstandingDisclosureDecision> = {},
): OrganizationalUnderstandingDisclosureDecision {
  return {
    id: `disclosure:${disposition}`,
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    disposition,
    effectiveAt: NOW,
    basis: [`phase-5b-${disposition}-fixture`],
    ...overrides,
  };
}

const explanation = {
  id: "explanation-phase-5b",
  semanticKey: "phase-5b-explanation",
  organizationId: ORGANIZATION_ID,
  viability: "unadjudicated" as const,
  confidence: 0.7,
  claim: {
    scope: {
      organizationId: ORGANIZATION_ID,
      type: "organization" as const,
      id: ORGANIZATION_ID,
    },
    rootMechanismIds: ["mechanism-phase-5b"],
    outcomeRefs: [{ type: "phenomenon" as const, id: "delivery" }],
    causalRelationFamily: "coordination" as const,
  },
  evidenceIds: ["evidence-phase-5b"],
  observationIds: [],
  signalIds: [],
  contradictionIds: [],
  phenomenonIds: [],
  mechanismIds: ["mechanism-phase-5b"],
  beliefIds: [],
  conceptIds: [],
  theoryIds: [],
  conditionIds: [],
  reasoningPathIds: ["reasoning-phase-5b"],
  explanationSeedIds: [],
  assumptions: [],
  comparativeEvidenceRoles: [],
  uncertainty: ["unresolved-alternatives"],
  createdAt: NOW,
  updatedAt: NOW,
};

const compositions = buildCanonicalUnderstandingCompatibilityShadow({
  organizationId: ORGANIZATION_ID,
  explanations: [explanation],
  now: NOW,
});
assert.equal(compositions.length, 1);

type Result = { id: string; passed: true; observation: string };
const results: Result[] = [];
function scenario(id: string, observation: string, work: () => void): void {
  work();
  results.push({ id, passed: true, observation });
}

scenario("01-authorized-disclosure", "An eligible resolved decision discloses authorized canonical Understanding.", () => {
  const output = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("eligible"),
    compositions,
  });
  assert.equal(output.disclosedCompositions.length, 1);
  assert.equal(output.suppressedCompositionIds.length, 0);
});

scenario("02-unauthorized-disclosure-blocked", "A withheld decision returns no canonical Understanding.", () => {
  const output = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("withheld"),
    compositions,
  });
  assert.equal(output.disclosedCompositions.length, 0);
  assert.deepEqual(output.suppressedCompositionIds, [compositions[0].id]);
});

scenario("03-projection-suppression", "A projection boundary receives an empty disclosure set when disclosure is withheld.", () => {
  const projectionInput = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("withheld"),
    compositions,
  }).disclosedCompositions;
  assert.deepEqual(projectionInput, []);
});

scenario("04-canonical-truth-unchanged", "Disclosure and revocation decisions never mutate canonical Understanding.", () => {
  const before = stable(compositions);
  for (const disposition of ["eligible", "withheld", "revoked"] as const) {
    discloseCanonicalOrganizationalUnderstanding({
      organizationId: ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      decision: decision(disposition),
      compositions,
    });
  }
  assert.equal(stable(compositions), before);
});

scenario("05-revocation-future-read", "A revocation suppresses future disclosure without deleting truth or provenance.", () => {
  const eligible = decision("eligible");
  const before = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: eligible,
    compositions,
  });
  const revoked = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("revoked", {
      id: "disclosure:revoked:successor",
      supersedesDecisionId: eligible.id,
    }),
    compositions,
  });
  assert.equal(before.disclosedCompositions.length, 1);
  assert.equal(revoked.disclosedCompositions.length, 0);
  assert.equal(stable(compositions), stable(before.disclosedCompositions));
});

const historicalPath = path.join(
  process.cwd(),
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const historical = JSON.parse(
  fs.readFileSync(historicalPath, "utf8"),
) as OrganizationRuntime;

scenario("06-historical-replay", "Historical Runtime remains unchanged and missing authority receipts fail closed.", () => {
  const before = stable(historical);
  const historicalCompositions =
    historical.memory.organizationalUnderstandingState.canonicalCompositions ??
    [];
  const output = discloseCanonicalOrganizationalUnderstanding({
    organizationId: historical.metadata.organizationId,
    consumerId: CONSUMER_ID,
    decision: decision("eligible", {
      organizationId: historical.metadata.organizationId,
    }),
    compositions: historicalCompositions,
  });
  assert.equal(output.disclosedCompositions.length, 0);
  assert.equal(stable(historical), before);
});

scenario("07-organization-isolation", "A decision for another organization fails closed.", () => {
  const output = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("eligible", { organizationId: "foreign-organization" }),
    compositions,
  });
  assert.equal(output.disposition, "withheld");
  assert.equal(output.disclosedCompositions.length, 0);
});

scenario("08-consumer-isolation", "A decision for another consumer fails closed.", () => {
  const output = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("eligible", { consumerId: "foreign-consumer" }),
    compositions,
  });
  assert.equal(output.disposition, "withheld");
  assert.equal(output.disclosedCompositions.length, 0);
});

scenario("09-deterministic-repeat", "Repeated disclosure evaluation is byte-identical.", () => {
  const input = {
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("eligible"),
    compositions,
  };
  assert.equal(
    stable(discloseCanonicalOrganizationalUnderstanding(input)),
    stable(discloseCanonicalOrganizationalUnderstanding(input)),
  );
});

scenario("10-reversed-order", "Disclosure output ordering is independent of canonical input order.", () => {
  const second: CanonicalUnderstandingComposition = {
    ...structuredClone(compositions[0]),
    id: `${compositions[0].id}:second`,
    revisionId: `${compositions[0].revisionId}:second`,
  };
  const forward = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("eligible"),
    compositions: [compositions[0], second],
  });
  const reverse = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("eligible"),
    compositions: [second, compositions[0]],
  });
  assert.equal(stable(forward), stable(reverse));
});

scenario("11-rollback", "Removing the disclosure call restores the exact canonical composition input.", () => {
  const before = stable(compositions);
  discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision("withheld"),
    compositions,
  });
  assert.equal(stable(compositions), before);
});

scenario("12-no-runtime-corruption", "The contract is pure and creates no Runtime collection or history rewrite.", () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts",
    ),
    "utf8",
  );
  assert.equal(source.includes("memory."), false);
  assert.equal(source.includes("push("), false);
  assert.equal(source.includes("splice("), false);
});

scenario("13-no-duplicate-truth-owner", "Disclosure returns canonical compositions without creating claims, summaries, or presentation semantics.", () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts",
    ),
    "utf8",
  );
  for (const forbidden of ["statement:", "summary:", "headline:", "recommendation:"]) {
    assert.equal(source.includes(forbidden), false);
  }
});

scenario("14-no-policy-system", "The contract consumes a resolved decision and defines no permissions, membership, scope, or policy engine.", () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts",
    ),
    "utf8",
  );
  for (const forbidden of ["roleId", "membershipId", "policyVersion", "permissionIds", "IntelligenceScope"]) {
    assert.equal(source.includes(forbidden), false);
  }
});

console.log(
  JSON.stringify(
    {
      benchmark: "Disclosure Eligibility and Revocation Contract Gate",
      results,
      production: {
        contract: "active",
        applicationEnforcement: "blocked-no-canonical-decision-producer",
        revocationPersistence: "blocked-no-canonical-decision-history-owner",
        newRuntimeCollections: 0,
      },
      scorecard: {
        organizationalUnderstanding: "Unchanged",
        userIntelligence: "Unchanged",
        collectiveIntelligence: "Not Measured",
        governanceIntegrity: "Improved",
        systemSustainability: "Improved",
      },
      classification:
        results.length === 14
          ? "B — DISCLOSURE CONTRACT VALID, ACTIVATION BLOCKED"
          : "C — DISCLOSURE ARCHITECTURE INSUFFICIENT",
    },
    null,
    2,
  ),
);
