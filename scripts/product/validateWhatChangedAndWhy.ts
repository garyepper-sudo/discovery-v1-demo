import assert from "node:assert/strict";

import {
  buildActivatedEvolutionCandidates,
} from "../../components/product-shell/data/composeActivatedYourOrganization";
import {
  buildActivatedYourOrganizationView,
} from "../../components/product-shell/data/buildActivatedYourOrganizationView";
import {
  buildDiscoveryExperienceView,
} from "../../components/product-shell/data/buildDiscoveryExperienceView";
import {
  buildYourOrganizationCommunicationView,
} from "../../components/product-shell/data/buildYourOrganizationCommunicationView";
import {
  compileProductCommunicationPlan,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  PRODUCT_COMMUNICATION_CONTRACT_VERSION,
} from "../../engine/v3/communication/productCommunicationPlan";
import type {
  OrganizationalExplanation,
} from "../../engine/v3/model/judgment/organizationalJudgment";
import {
  compileOrganizationalUnderstandingProjection,
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  type CanonicalEvolutionReference,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  createEmptyOrganizationRuntime,
} from "../../engine/v3/runtime";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  discloseCanonicalOrganizationalUnderstanding,
  type OrganizationalUnderstandingDisclosureDecision,
} from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";

const ORGANIZATION_ID = "org-what-changed-validation";
const CONSUMER_ID = "user-what-changed-validation";
const NOW = "2026-08-02T12:00:00.000Z";

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

const explanation: OrganizationalExplanation = {
  id: "explanation:decision-flow",
  organizationId: ORGANIZATION_ID,
  semanticKey: "semantic:decision-flow",
  claim: {
    scope: {
      organizationId: ORGANIZATION_ID,
      type: "organization",
      id: ORGANIZATION_ID,
    },
    rootMechanismIds: ["mechanism:decision-flow"],
    outcomeRefs: [{ type: "phenomenon", id: "outcome:execution" }],
    causalRelationFamily: "constraint",
  },
  explanationSeedIds: ["seed:decision-flow"],
  reasoningPathIds: ["path:decision-flow"],
  mechanismIds: ["mechanism:decision-flow"],
  beliefIds: ["belief:decision-flow"],
  theoryIds: ["theory:decision-flow"],
  evidenceIds: ["evidence:decision-flow"],
  contradictionIds: [],
  assumptions: [],
  comparativeEvidenceRoles: [],
  viability: "unadjudicated",
  uncertainty: ["Independent outcomes remain incomplete."],
  createdAt: NOW,
  updatedAt: NOW,
};
const compositions = buildCanonicalUnderstandingCompatibilityShadow({
  organizationId: ORGANIZATION_ID,
  explanations: [explanation],
  now: NOW,
});
const composition = compositions[0]!;

function decision(
  disposition: OrganizationalUnderstandingDisclosureDecision["disposition"],
): OrganizationalUnderstandingDisclosureDecision {
  return {
    id: `disclosure:${disposition}`,
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    disposition,
    effectiveAt: NOW,
    basis: ["focused-sprint-2-validation"],
  };
}

function projection(input: {
  evolution?: CanonicalEvolutionReference[];
  disposition?: OrganizationalUnderstandingDisclosureDecision["disposition"];
  organizationId?: string;
}) {
  const disclosure = discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision(input.disposition ?? "eligible"),
    compositions,
  });
  return compileOrganizationalUnderstandingProjection({
    context: {
      organizationId: input.organizationId ?? ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
    },
    disclosure,
    compositions,
    explanations: [explanation],
    conditions: [],
    investigations: [],
    evolution: input.evolution ?? [],
  });
}

function plan(projected: ReturnType<typeof projection>) {
  return compileProductCommunicationPlan({
    context: {
      organizationId: projected.organizationId,
      consumerId: projected.consumerId,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: PRODUCT_COMMUNICATION_CONTRACT_VERSION,
    },
    projection: projected,
    prioritySignals: [],
  }, ORGANIZATION_PRODUCT_COMMUNICATION_POLICY);
}

function learningRuntime(input: {
  changeType?: string;
  reason?: string;
  previousRevisionId?: string | null;
}) {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: ORGANIZATION_ID,
    name: "What Changed Validation",
  });
  runtime.memory.organizationalExplanations = [structuredClone(explanation)];
  runtime.memory.organizationalUnderstandingState.canonicalCompositions = [{
    ...composition,
    previousRevisionId: input.previousRevisionId ?? null,
  }];
  (runtime.memory as unknown as {
    learningEvents: Array<Record<string, unknown>>;
  }).learningEvents = input.changeType
    ? [{
        id: `learning:${input.changeType}`,
        investigationId: "investigation:current",
        timestamp: NOW,
        objectType: "belief",
        objectId: "belief:decision-flow",
        changeType: input.changeType,
        reason: input.reason ?? "",
      }]
    : [];
  return runtime;
}

const firstRuntime = learningRuntime({});
const firstBytes = stable(firstRuntime);
assert.deepEqual(buildActivatedEvolutionCandidates(firstRuntime), []);
assert.equal(
  plan(projection({})).availability.find((entry) => entry.area === "changes")
    ?.state,
  "first-supported-understanding",
);
const priorProjection = structuredClone(projection({}));
priorProjection.understandings[0]!.value.previousRevisionId =
  "revision:previous";
assert.equal(
  plan(priorProjection).availability.find((entry) => entry.area === "changes")
    ?.state,
  "no-meaningful-change",
);
const unavailableProjection = structuredClone(projection({}));
unavailableProjection.availability = unavailableProjection.availability.map(
  (entry) => entry.area === "evolution"
    ? { ...entry, state: "runtime-data-unavailable" }
    : entry,
);
assert.equal(
  plan(unavailableProjection).availability.find(
    (entry) => entry.area === "changes",
  )?.state,
  "projection-data-unavailable",
);

for (const [changeType, direction] of [
  ["strengthening", "strengthened"],
  ["weakening", "weakened"],
  ["unresolved", "unresolved"],
] as const) {
  const runtime = learningRuntime({
    changeType,
    reason: `Supported ${changeType} reason.`,
    previousRevisionId: "revision:previous",
  });
  const candidates = buildActivatedEvolutionCandidates(runtime);
  assert.equal(candidates.length, 1);
  const output = plan(projection({ evolution: candidates }));
  assert.equal(output.changes[0]?.change?.direction, direction);
  assert.equal(
    output.changes[0]?.sourceText?.text,
    `Supported ${changeType} reason.`,
  );
}

const revisedRuntime = learningRuntime({
  previousRevisionId: "revision:previous",
});
const revisedCandidates = buildActivatedEvolutionCandidates(revisedRuntime);
assert.equal(revisedCandidates[0]?.changeType, "revised");
const revisedPlan = plan(projection({ evolution: revisedCandidates }));
assert.equal(revisedPlan.changes[0]?.change?.direction, "revised");
assert.equal(
  revisedPlan.availability.find((entry) => entry.area === "changes")?.state,
  "change-reason-unavailable",
);

const missingReasonRuntime = learningRuntime({
  changeType: "strengthening",
  previousRevisionId: "revision:previous",
});
const missingReasonPlan = plan(projection({
  evolution: buildActivatedEvolutionCandidates(missingReasonRuntime),
}));
assert.equal(missingReasonPlan.changes[0]?.sourceText, undefined);
assert.equal(
  missingReasonPlan.availability.find((entry) => entry.area === "changes")
    ?.state,
  "change-reason-unavailable",
);

const unauthorizedEvolution: CanonicalEvolutionReference = {
  id: "evolution:unauthorized",
  organizationId: ORGANIZATION_ID,
  occurredAt: NOW,
  objectType: "organizational-understanding",
  objectId: "understanding:unauthorized",
  changeType: "strengthened",
  reason: "This reason must not be disclosed.",
  supportingRefs: [{
    objectType: "organizational-explanation",
    objectId: "explanation:unauthorized",
  }],
};
const unauthorizedProjection = projection({
  evolution: [unauthorizedEvolution],
});
assert.equal(unauthorizedProjection.evolution.length, 0);
assert.equal(
  unauthorizedProjection.availability.find((entry) => entry.area === "evolution")
    ?.state,
  "referenced-data-missing",
);
assert.equal(
  plan(unauthorizedProjection).availability.find(
    (entry) => entry.area === "changes",
  )?.state,
  "history-not-authorized",
);

const wrongOrganization = projection({
  evolution: [{
    ...unauthorizedEvolution,
    objectId: composition.id,
    organizationId: "org-foreign",
    supportingRefs: [{
      objectType: "organizational-explanation",
      objectId: explanation.id,
    }],
  }],
});
assert.equal(wrongOrganization.evolution.length, 0);

const revoked = projection({
  evolution: buildActivatedEvolutionCandidates(learningRuntime({
    changeType: "strengthening",
    reason: "Must remain revoked.",
  })),
  disposition: "revoked",
});
assert.equal(revoked.evolution.length, 0);
assert.equal(revoked.availability[0]?.state, "revoked");

const evidenceArrivalOnly = learningRuntime({});
evidenceArrivalOnly.memory.organizationalExplanations[0]!.evidenceIds.push(
  "evidence:new-arrival",
);
assert.deepEqual(
  buildActivatedEvolutionCandidates(evidenceArrivalOnly),
  [],
  "Evidence arrival alone must not create an understanding change.",
);

const initialLearningRuntime = learningRuntime({
  changeType: "new",
  reason: "A new belief was admitted.",
});
assert.deepEqual(
  buildActivatedEvolutionCandidates(initialLearningRuntime),
  [],
  "A first understanding must not be presented as revision history.",
);

const staleLearningRuntime = learningRuntime({
  changeType: "strengthening",
  reason: "An older event must not explain a later revision.",
  previousRevisionId: "revision:previous",
});
(staleLearningRuntime.memory as unknown as {
  learningEvents: Array<{ timestamp: string }>;
}).learningEvents[0]!.timestamp = "2026-01-01T00:00:00.000Z";
assert.equal(
  buildActivatedEvolutionCandidates(staleLearningRuntime)[0]?.changeType,
  "revised",
  "An event from another Runtime evolution must not be attributed as the reason.",
);

const strengthenedRuntime = learningRuntime({
  changeType: "strengthening",
  reason: "Repeated escalation evidence strengthened the understanding.",
  previousRevisionId: "revision:previous",
});
const orderingRuntime = structuredClone(strengthenedRuntime);
(orderingRuntime.memory as unknown as {
  learningEvents: Array<Record<string, unknown>>;
}).learningEvents.push({
  id: "learning:weakening",
  investigationId: "investigation:current",
  timestamp: NOW,
  objectType: "theory",
  objectId: "theory:decision-flow",
  changeType: "weakening",
  reason: "A competing outcome weakened the understanding.",
});
const orderedCandidates = buildActivatedEvolutionCandidates(orderingRuntime);
(orderingRuntime.memory as unknown as {
  learningEvents: Array<Record<string, unknown>>;
}).learningEvents.reverse();
assert.deepEqual(
  buildActivatedEvolutionCandidates(orderingRuntime),
  orderedCandidates,
  "Runtime event order must not affect projected evolution order.",
);
const strengthenedBytes = stable(strengthenedRuntime);
const strengthenedProjection = projection({
  evolution: buildActivatedEvolutionCandidates(strengthenedRuntime),
});
const strengthenedPlan = plan(strengthenedProjection);
const communication = buildYourOrganizationCommunicationView({
  plan: strengthenedPlan,
});
const activated = buildActivatedYourOrganizationView({
  runtime: strengthenedRuntime,
  projection: strengthenedProjection,
  communication,
});
const experience = buildDiscoveryExperienceView({
  runtime: strengthenedRuntime,
  view: activated,
});
assert.equal(experience.understanding.changeDisclosure?.state, "available");
assert.equal(
  experience.understanding.changeDisclosure?.changes[0]?.reason,
  "Repeated escalation evidence strengthened the understanding.",
);
assert.equal(
  stable(experience),
  stable(buildDiscoveryExperienceView({
    runtime: strengthenedRuntime,
    view: buildActivatedYourOrganizationView({
      runtime: strengthenedRuntime,
      projection: strengthenedProjection,
      communication,
    }),
  })),
);
assert.equal(stable(experience).includes("belief:decision-flow"), false);
assert.equal(stable(experience).includes("theory:decision-flow"), false);
assert.equal(stable(experience).includes(composition.id), false);
assert.equal(stable(firstRuntime), firstBytes);
assert.equal(stable(strengthenedRuntime), strengthenedBytes);

console.log(JSON.stringify({
  validation: "what-changed-and-why",
  result: "PASS",
  states: [
    "first-supported-understanding",
    "strengthened",
    "weakened",
    "revised",
    "unresolved",
    "change-reason-unavailable",
    "history-not-authorized",
    "projection-data-unavailable",
    "no-meaningful-change",
  ],
  deterministic: true,
  organizationIsolated: true,
  revokedFailsClosed: true,
  rawIdentifiersDisclosed: false,
  evidenceArrivalCreatesChange: false,
  runtimeMutated: false,
}, null, 2));
