import assert from "node:assert/strict";

import {
  classifyCanonicalEvidenceRoles,
  type CanonicalEvidenceRole,
  type CanonicalEvidenceRoleAssignment,
} from "../../components/product-shell/communication/evidenceRoles";
import { translateProductUnderstanding } from "../../components/product-shell/communication/productUnderstanding";
import { optimizeTruthfulUtility } from "../../components/product-shell/communication/truthfulUtility";
import { runDiscoveryV3 } from "../../engine/v3";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { buildOnboardingInvestigationInput } from "../../lib/onboarding/testing/buildOnboardingInvestigationInput";

type Scenario = {
  name: string;
  question: string;
  observations: string[];
  requiredRoles: CanonicalEvidenceRole[];
};

const scenarios: Scenario[] = [
  {
    name: "sales",
    question: "Why are sales slowing?",
    observations: [
      "Representatives made more outreach.",
      "Win percentage fell.",
    ],
    requiredRoles: ["execution-signal", "demand-signal", "weakens"],
  },
  {
    name: "execution",
    question: "Why is project delivery late?",
    observations: [
      "Committed work finishes later.",
      "Dependencies wait unresolved.",
    ],
    requiredRoles: ["execution-signal", "constraint-signal", "weakens"],
  },
  {
    name: "hiring",
    question: "Why is hiring capacity constrained?",
    observations: [
      "Approved openings increased.",
      "Time to fill roles lengthened.",
    ],
    requiredRoles: ["demand-signal", "capacity-signal", "temporal-trend"],
  },
  {
    name: "decisions",
    question: "Why do approvals take longer?",
    observations: [
      "Approvals require more elapsed time.",
      "Additional signoffs are now required.",
    ],
    requiredRoles: [
      "decision-signal",
      "constraint-signal",
      "leadership-observation",
    ],
  },
  {
    name: "retention",
    question: "Why are renewals weakening?",
    observations: [
      "Renewals declined.",
      "Customer complaints increased.",
    ],
    requiredRoles: ["retention-signal", "customer-observation", "weakens"],
  },
];

function runScenario(scenario: Scenario) {
  const organizationId = `onb-dev-evidence-roles-${scenario.name}`;
  const input = buildOnboardingInvestigationInput({
    company: "Evidence Role Validation",
    industry: "B2B software",
    question: scenario.question,
    messyInput: scenario.observations.join("\n"),
  });
  const originalLog = console.log;
  const originalInfo = console.info;
  console.log = () => undefined;
  console.info = () => undefined;
  try {
    const result = runDiscoveryV3(input);
    const runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({
        organizationId,
        name: "Evidence Role Validation",
        industry: "B2B software",
      }),
      result,
      input,
    });
    const roles = classifyCanonicalEvidenceRoles({
      organizationId,
      result,
      runtime,
    });
    const understanding = translateProductUnderstanding({
      organizationId,
      result,
      runtime,
    });
    return {
      organizationId,
      result,
      runtime,
      roles,
      understanding,
      utility: optimizeTruthfulUtility({
        organizationId,
        result,
        runtime,
        understanding,
      }),
    };
  } finally {
    console.log = originalLog;
    console.info = originalInfo;
  }
}

function roleSet(
  assignments: readonly CanonicalEvidenceRoleAssignment[],
): Set<CanonicalEvidenceRole> {
  return new Set(assignments.flatMap((assignment) => assignment.roles));
}

for (const scenario of scenarios) {
  const run = runScenario(scenario);
  const evidenceIds = new Set(run.result.evidence.map((item) => item.id));
  const observationIds = new Set(run.result.observations.map((item) => item.id));
  const roles = roleSet(run.roles);

  for (const requiredRole of scenario.requiredRoles) {
    assert.ok(
      roles.has(requiredRole),
      `${scenario.name} must expose ${requiredRole}`,
    );
  }
  for (const assignment of run.roles) {
    assert.ok(evidenceIds.has(assignment.evidenceId));
    assert.deepEqual(assignment.lineage.evidenceIds, [assignment.evidenceId]);
    assert.ok(
      assignment.lineage.observationIds.every((id) =>
        observationIds.has(id)
      ),
    );
  }
  assert.deepEqual(run.understanding.evidenceRoles, run.roles);
  assert.deepEqual(runScenario(scenario).roles, run.roles);
  assert.deepEqual(
    classifyCanonicalEvidenceRoles({
      organizationId: run.organizationId,
      runtime: run.runtime,
      result: {
        ...run.result,
        evidence: [...run.result.evidence].reverse(),
        observations: [...run.result.observations].reverse(),
        signals: [...run.result.signals].reverse(),
        themes: [...run.result.themes].reverse(),
      },
    }),
    run.roles,
  );
  assert.throws(
    () =>
      classifyCanonicalEvidenceRoles({
        organizationId: "onb-dev-wrong-organization",
        result: run.result,
        runtime: run.runtime,
      }),
    /organization mismatch/,
  );
}

const rejected = runScenario({
  name: "negative-controls",
  question: "Why are sales slowing?",
  observations: [
    "Commissions did not increase.",
    "Leadership asked whether sales activity increased.",
    "The software deployment pipeline increased capacity.",
    "The document retention policy changed.",
    "What is your decision time in the customer survey?",
  ],
  requiredRoles: [],
});
const rejectedTexts = new Set([
  "Commissions did not increase.",
  "Leadership asked whether sales activity increased.",
  "The software deployment pipeline increased capacity.",
  "The document retention policy changed.",
  "What is your decision time in the customer survey?",
]);
const rejectedEvidenceIds = new Set(
  rejected.result.evidence
    .filter((evidence) => rejectedTexts.has(evidence.text))
    .map((evidence) => evidence.id),
);
assert.ok(rejectedEvidenceIds.size >= rejectedTexts.size);
assert.ok(
  rejected.roles.every((assignment) =>
    !rejectedEvidenceIds.has(assignment.evidenceId)
  ),
);
assert.equal(rejected.utility.decisionImplications.length, 0);
assert.equal(rejected.utility.watchNext.length, 0);

console.table(
  scenarios.map((scenario) => {
    const run = runScenario(scenario);
    return {
      scenario: scenario.name,
      assignmentCount: run.roles.length,
      roleCount: roleSet(run.roles).size,
      utilityStatus: run.utility.status,
      boundedUtility:
        run.utility.decisionImplications.length === 1,
    };
  }),
);
console.info(
  "Canonical evidence role validation passed: deterministic classification, stable ordering, exact evidence/observation lineage, organization isolation, rejected-input exclusion, and conservative utility behavior are preserved.",
);
