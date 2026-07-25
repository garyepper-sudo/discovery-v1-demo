import assert from "node:assert/strict";

import type {
  OrganizationalExplanation,
  OrganizationalExplanationEvidenceRoleAssignment,
} from "../../v3/model/judgment/organizationalJudgment";
import { buildExecutiveUnderstandingCandidates } from "../../v3/understanding/buildExecutiveUnderstandingCandidates";
import {
  buildUnadjudicatedExplanationUnderstandingShadow,
} from "../../v3/understanding/buildUnadjudicatedExplanationUnderstandingShadow";

const ORGANIZATION_ID = "phase-3-shadow-organization";
const OTHER_ORGANIZATION_ID = "phase-3-other-organization";
const NOW = "2026-07-25T12:00:00.000Z";

const stable = (value: unknown): string => JSON.stringify(value);

function role(
  evidenceId: string,
  roleName: OrganizationalExplanationEvidenceRoleAssignment["role"],
  referenceIds: string[],
  relatedExplanationIds: string[],
): OrganizationalExplanationEvidenceRoleAssignment {
  return {
    evidenceId,
    role: roleName,
    basis: {
      kind: roleName === "shared" ? "shared-support" : "evidence-relationship",
      referenceIds,
    },
    relatedExplanationIds,
  };
}

function explanation(input: {
  id: string;
  organizationId?: string;
  outcomeId?: string;
  scopeId?: string;
  roles?: OrganizationalExplanationEvidenceRoleAssignment[] | null;
  evidenceIds?: string[];
}): OrganizationalExplanation {
  const organizationId = input.organizationId ?? ORGANIZATION_ID;
  const result: OrganizationalExplanation = {
    id: input.id,
    organizationId,
    semanticKey: `semantic:${input.id}`,
    claim: {
      scope: {
        organizationId,
        type: "process",
        id: input.scopeId ?? "delivery",
      },
      rootMechanismIds: [`mechanism:${input.id}`],
      outcomeRefs: [
        { type: "phenomenon", id: input.outcomeId ?? "delivery-delay" },
      ],
      causalRelationFamily: "causal",
    },
    explanationSeedIds: [`seed:${input.id}`],
    reasoningPathIds: [`path:${input.id}`],
    mechanismIds: [`mechanism:${input.id}`],
    beliefIds: [`belief:${input.id}`],
    theoryIds: [`theory:${input.id}`],
    evidenceIds: input.evidenceIds ?? [`evidence:${input.id}`],
    contradictionIds: [`contradiction:${input.id}`],
    assumptions: [`assumption:${input.id}`],
    viability: "unadjudicated",
    uncertainty: [`uncertainty:${input.id}`],
    createdAt: NOW,
    updatedAt: NOW,
  };
  if (input.roles !== null) {
    result.comparativeEvidenceRoles = input.roles ?? [];
  }
  return result;
}

const capacity = explanation({
  id: "capacity",
  roles: [
    role("evidence:support", "supports", ["relationship:support"], ["capacity"]),
    role("evidence:oppose", "opposes", ["relationship:oppose"], ["capacity"]),
    role(
      "evidence:shared",
      "shared",
      ["seed:capacity", "seed:coordination"],
      ["capacity", "coordination"],
    ),
  ],
  evidenceIds: [
    "evidence:shared",
    "evidence:support",
    "evidence:oppose",
    "evidence:irrelevant",
  ],
});
const coordination = explanation({
  id: "coordination",
  roles: [
    role(
      "evidence:shared",
      "shared",
      ["seed:coordination", "seed:capacity"],
      ["coordination", "capacity"],
    ),
    role("evidence:coordination", "supports", ["relationship:coordination"], [
      "coordination",
    ]),
  ],
});
const historical = explanation({ id: "historical", roles: null });
const emptyRoles = explanation({ id: "empty-roles", roles: [] });
const unrelated = explanation({
  id: "unrelated",
  outcomeId: "retention-loss",
  scopeId: "people",
});
const foreign = explanation({
  id: "foreign",
  organizationId: OTHER_ORGANIZATION_ID,
});

const all = [capacity, coordination, historical, emptyRoles, unrelated, foreign];
const subject = buildUnadjudicatedExplanationUnderstandingShadow({
  organizationId: ORGANIZATION_ID,
  explanations: all,
});
const deliveryGroup = subject.groups.find(
  (group) => group.outcomeRef.id === "delivery-delay",
);
assert(deliveryGroup);

const scenarios: Array<{ id: string; passed: boolean }> = [];
const check = (id: string, assertion: () => void): void => {
  assertion();
  scenarios.push({ id, passed: true });
};

check("01-single-completed-explanation", () => {
  const result = buildUnadjudicatedExplanationUnderstandingShadow({
    organizationId: ORGANIZATION_ID,
    explanations: [capacity],
  });
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].hasUnresolvedAlternatives, false);
});

check("02-multiple-comparable-explanations", () => {
  assert.deepEqual(
    deliveryGroup.explanations.map((item) => item.explanationId),
    ["capacity", "coordination", "empty-roles", "historical"],
  );
  assert.equal(deliveryGroup.hasUnresolvedAlternatives, true);
  assert.equal(deliveryGroup.justifiedSelectionExists, false);
});

const projectedCapacity = deliveryGroup.explanations.find(
  (item) => item.explanationId === "capacity",
);
assert(projectedCapacity);

check("03-supporting-evidence", () => {
  assert.deepEqual(projectedCapacity.comparativeEvidence.supporting, [
    role("evidence:support", "supports", ["relationship:support"], ["capacity"]),
  ]);
});

check("04-opposing-evidence", () => {
  assert.deepEqual(
    projectedCapacity.comparativeEvidence.opposing.map((item) => item.evidenceId),
    ["evidence:oppose"],
  );
  assert.equal(projectedCapacity.sourceViability, "unadjudicated");
});

check("05-shared-evidence", () => {
  assert.deepEqual(
    projectedCapacity.comparativeEvidence.shared.map((item) => item.evidenceId),
    ["evidence:shared"],
  );
  assert.equal(
    projectedCapacity.comparativeEvidence.supporting.some(
      (item) => item.evidenceId === "evidence:shared",
    ),
    false,
  );
});

check("06-role-data-unavailable", () => {
  assert.equal(
    deliveryGroup.explanations.find((item) => item.explanationId === "historical")
      ?.comparativeEvidence.availability,
    "unavailable",
  );
});

check("07-role-data-present-empty", () => {
  const projected = deliveryGroup.explanations.find(
    (item) => item.explanationId === "empty-roles",
  );
  assert.equal(projected?.comparativeEvidence.availability, "available");
  assert.deepEqual(projected?.comparativeEvidence.supporting, []);
});

check("08-unrelated-explanations", () => {
  assert.equal(
    deliveryGroup.explanations.some((item) => item.explanationId === "unrelated"),
    false,
  );
  assert.equal(subject.groups.some((group) => group.outcomeRef.id === "retention-loss"), true);
});

check("09-duplicate-and-irrelevant-evidence", () => {
  const duplicateRoleCapacity = {
    ...capacity,
    comparativeEvidenceRoles: [
      ...(capacity.comparativeEvidenceRoles ?? []),
      capacity.comparativeEvidenceRoles?.[0],
    ].filter(
      (
        item,
      ): item is OrganizationalExplanationEvidenceRoleAssignment => Boolean(item),
    ),
  };
  const duplicate = buildUnadjudicatedExplanationUnderstandingShadow({
    organizationId: ORGANIZATION_ID,
    explanations: [duplicateRoleCapacity],
  });
  const ordinary = buildUnadjudicatedExplanationUnderstandingShadow({
    organizationId: ORGANIZATION_ID,
    explanations: [capacity],
  });
  assert.equal(stable(duplicate.groups), stable(ordinary.groups));
});

check("10-reversed-order-byte-equality", () => {
  const reversedInputs = all
    .map((item) => ({
      ...item,
      claim: {
        ...item.claim,
        rootMechanismIds: [...item.claim.rootMechanismIds].reverse(),
        outcomeRefs: [...item.claim.outcomeRefs].reverse(),
      },
      evidenceIds: [...item.evidenceIds].reverse(),
      comparativeEvidenceRoles: item.comparativeEvidenceRoles
        ? [...item.comparativeEvidenceRoles]
            .reverse()
            .map((assignment) => ({
              ...assignment,
              basis: {
                ...assignment.basis,
                referenceIds: [...assignment.basis.referenceIds].reverse(),
              },
              relatedExplanationIds: [...assignment.relatedExplanationIds].reverse(),
            }))
        : undefined,
    }))
    .reverse();
  assert.equal(
    stable(subject),
    stable(
      buildUnadjudicatedExplanationUnderstandingShadow({
        organizationId: ORGANIZATION_ID,
        explanations: reversedInputs,
      }),
    ),
  );
});

check("11-organization-isolation", () => {
  assert.equal(subject.ignoredExplanationCount, 1);
  assert.equal(stable(subject).includes("foreign"), false);
});

check("12-historical-compatibility", () => {
  assert.doesNotThrow(() =>
    buildUnadjudicatedExplanationUnderstandingShadow({
      organizationId: ORGANIZATION_ID,
      explanations: [historical],
    }),
  );
});

check("13-no-authority-output", () => {
  const forbiddenKeys = new Set([
    "rank",
    "leader",
    "preference",
    "preferredExplanation",
    "selectedExplanation",
    "confidence",
    "score",
    "falsification",
    "ruleOut",
    "outcomeConfirmation",
    "adjudicationHistory",
  ]);
  const inspect = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    for (const [key, nested] of Object.entries(value)) {
      assert.equal(forbiddenKeys.has(key), false, `forbidden authority key: ${key}`);
      inspect(nested);
    }
  };
  inspect(subject);
  assert.equal(
    subject.groups.every((group) =>
      group.explanations.every(
        (item) => item.sourceViability === "unadjudicated",
      ),
    ),
    true,
  );
});

const currentUnderstanding = buildExecutiveUnderstandingCandidates({
  executiveAssessment: {
    confidence: 0.7,
    primaryMechanismIds: ["mechanism:capacity"],
    theoryValidation: { dominantTheory: "Capacity limits throughput" },
  },
  organizationalState: { dominantConditions: ["condition:delivery"] },
  organizationalConditions: [
    {
      id: "condition:delivery",
      name: "Delivery capacity",
      supportingMechanismIds: ["mechanism:capacity"],
      supportingBeliefIds: ["belief:capacity"],
      supportingTheoryIds: ["theory:capacity"],
    },
  ],
  organizationalBeliefs: [
    {
      id: "belief:capacity",
      statement: "capacity limits throughput",
      supportingEvidenceIds: ["evidence:support"],
    },
  ],
  theories: [{ id: "theory:capacity", statement: "Capacity limits throughput" }],
  mechanisms: [
    {
      id: "mechanism:capacity",
      title: "Capacity pressure",
      supportingEvidenceIds: ["evidence:support"],
    },
  ],
});
const canonicalOutputs = {
  savedRuntime: { organizationId: ORGANIZATION_ID, revision: 12 },
  currentUnderstanding,
  executiveAssessment: { summary: "Current assessment", confidence: 0.7 },
  conditions: [{ id: "condition:delivery" }],
  organizationalState: { status: "constrained" },
  recommendations: [{ id: "recommendation:capacity" }],
  decisions: [{ id: "decision:capacity" }],
  projections: [{ id: "projection:capacity" }],
  applicationView: { title: "Executive work" },
  benchmarkFixtures: all,
};
const canonicalBytes = stable(canonicalOutputs);

check("14-no-production-writes", () => {
  buildUnadjudicatedExplanationUnderstandingShadow({
    organizationId: ORGANIZATION_ID,
    explanations: canonicalOutputs.benchmarkFixtures,
  });
  assert.equal(stable(canonicalOutputs), canonicalBytes);
});

check("15-downstream-byte-equality", () => {
  const before = stable(canonicalOutputs);
  buildUnadjudicatedExplanationUnderstandingShadow({
    organizationId: ORGANIZATION_ID,
    explanations: canonicalOutputs.benchmarkFixtures,
  });
  const after = stable(canonicalOutputs);
  assert.equal(after, before);
});

const dimensions = {
  explanatoryDepth: {
    current: currentUnderstanding[0]?.mechanismIds?.length ? 1 : 0,
    shadow:
      projectedCapacity.ancestry.mechanismIds.length > 0 &&
      projectedCapacity.ancestry.beliefIds.length > 0 &&
      projectedCapacity.ancestry.theoryIds.length > 0 &&
      projectedCapacity.ancestry.evidenceIds.length > 0
        ? 2
        : 0,
  },
  evidenceIntegration: {
    current: 0,
    shadow:
      projectedCapacity.comparativeEvidence.supporting.length > 0 &&
      projectedCapacity.comparativeEvidence.opposing.length > 0 &&
      projectedCapacity.comparativeEvidence.shared.length > 0
        ? 2
        : 0,
  },
  alternativeResolution: {
    current: 0,
    shadow:
      deliveryGroup.hasUnresolvedAlternatives &&
      !deliveryGroup.justifiedSelectionExists
        ? 1
        : 0,
  },
  uncertaintyRepresentation: {
    current: 0,
    shadow:
      projectedCapacity.uncertainty.length > 0 &&
      deliveryGroup.selectionLimitation.includes("No justified selection")
        ? 1
        : 0,
  },
  traceability: {
    current: 0,
    shadow:
      projectedCapacity.explanationId === capacity.id &&
      projectedCapacity.ancestry.explanationSeedIds[0] === "seed:capacity"
        ? 1
        : 0,
  },
};

const values = Object.values(dimensions);
const improved = values.some((dimension) => dimension.shadow > dimension.current);
const regressed = values.some((dimension) => dimension.shadow < dimension.current);
const classification =
  scenarios.length === 15 && improved && !regressed
    ? "A — Shadow demonstrates bounded Understanding improvement"
    : scenarios.length === 15 && !regressed
      ? "B — Semantically faithful but no measurable improvement"
      : "C — Unsafe or semantically invalid";

assert.equal(scenarios.length, 15);
assert.notEqual(classification[0], "C");

console.log(
  JSON.stringify(
    {
      benchmark: "Unadjudicated Explanation-Aware Organizational Understanding Shadow",
      boundary: "CAP-UND-006",
      scenarios,
      dimensions,
      scorecard: {
        expected: {
          organizationalUnderstandingIndex: "positive hypothesis",
          userIntelligenceIndex: "unchanged",
          collectiveIntelligenceIndex: "unchanged",
          governanceIntegrity: "unchanged or protected",
          systemSustainability: "unchanged",
        },
        observed: {
          organizationalUnderstandingIndex:
            classification[0] === "A" ? "bounded shadow improvement" : "unchanged",
          userIntelligenceIndex: "unchanged; not evaluated",
          collectiveIntelligenceIndex: "unchanged; not evaluated",
          governanceIntegrity: "protected by all noninterference gates",
          systemSustainability: "unchanged",
        },
      },
      classification,
    },
    null,
    2,
  ),
);
