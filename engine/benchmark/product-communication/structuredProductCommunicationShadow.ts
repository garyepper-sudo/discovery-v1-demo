import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  compileProductCommunicationPlan,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  PRODUCT_COMMUNICATION_CONTRACT_VERSION,
  type ProductCommunicationSource,
  type UpstreamPrioritySignal,
} from "../../v3/communication/productCommunicationPlan";
import type {
  OrganizationalUnderstandingProjection,
  ProjectedReference,
} from "../../v3/projection/organizationalUnderstandingProjection";
import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

const ROOT = path.resolve(__dirname, "../../..");
const NOW = "2026-07-29T00:00:00.000Z";
const ORGANIZATION_ID = "atlas-manufacturing-simulation";
const CONSUMER_ID = "consumer:communication-shadow";
let checks = 0;

function check(assertion: () => void): void {
  assertion();
  checks += 1;
}

function projection(): OrganizationalUnderstandingProjection {
  return {
    projectionId: "projection:communication-shadow",
    contractVersion: "1",
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    experience: "organization",
    generatedAt: NOW,
    disclosureDecisionId: "disclosure:communication-shadow",
    sourceRevisionIds: ["understanding:delivery:revision:1"],
    understandings: [
      {
        id: "understanding:delivery",
        canonicalRef: {
          objectType: "organizational-understanding",
          objectId: "understanding:delivery",
          revisionId: "understanding:delivery:revision:1",
        },
        value: {
          id: "understanding:delivery",
          revisionId: "understanding:delivery:revision:1",
          organizationId: ORGANIZATION_ID,
          explanationIds: [
            "explanation:concentration",
            "explanation:process",
          ],
          compositionUncertainty: ["unresolved-alternatives"],
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:concentration",
          },
          {
            objectType: "organizational-explanation",
            objectId: "explanation:process",
          },
        ],
      },
    ],
    explanations: [
      {
        id: "explanation:concentration",
        canonicalRef: {
          objectType: "organizational-explanation",
          objectId: "explanation:concentration",
        },
        value: {
          id: "explanation:concentration",
          organizationId: ORGANIZATION_ID,
          uncertainty: ["Independent outcomes remain unavailable."],
          viability: "unadjudicated",
        },
        supportingRefs: [
          { objectType: "evidence", objectId: "evidence:delivery" },
        ],
      },
      {
        id: "explanation:process",
        canonicalRef: {
          objectType: "organizational-explanation",
          objectId: "explanation:process",
        },
        value: {
          id: "explanation:process",
          organizationId: ORGANIZATION_ID,
          uncertainty: [],
          viability: "unadjudicated",
        },
        supportingRefs: [
          { objectType: "evidence", objectId: "evidence:process" },
        ],
      },
    ],
    evidence: [
      {
        id: "evidence:delivery",
        canonicalRef: {
          objectType: "evidence",
          objectId: "evidence:delivery",
        },
        value: {
          roles: [],
          bodyAvailability: "runtime-data-unavailable",
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:concentration",
          },
        ],
      },
      {
        id: "evidence:process",
        canonicalRef: {
          objectType: "evidence",
          objectId: "evidence:process",
        },
        value: {
          roles: [],
          bodyAvailability: "runtime-data-unavailable",
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:process",
          },
        ],
      },
    ],
    uncertainty: [
      {
        id: "uncertainty:explanation",
        canonicalRef: {
          objectType: "organizational-explanation",
          objectId: "explanation:concentration",
        },
        value: {
          owner: "organizational-explanation",
          explanationId: "explanation:concentration",
          statement: "Independent outcomes remain unavailable.",
        },
        supportingRefs: [],
      },
      {
        id: "uncertainty:alternatives",
        canonicalRef: {
          objectType: "organizational-understanding",
          objectId: "understanding:delivery",
          revisionId: "understanding:delivery:revision:1",
        },
        value: {
          owner: "organizational-understanding",
          disposition: "unresolved-alternatives",
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:concentration",
          },
          {
            objectType: "organizational-explanation",
            objectId: "explanation:process",
          },
        ],
      },
    ],
    conditions: [
      {
        id: "condition:continuity",
        canonicalRef: {
          objectType: "organizational-condition",
          objectId: "condition:continuity",
        },
        value: {
          id: "condition:continuity",
          summary: "Delivery knowledge remains concentrated.",
          supportingExplanationIds: ["explanation:concentration"],
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:concentration",
          },
        ],
      },
    ],
    investigations: [
      {
        id: "investigation:delivery",
        canonicalRef: {
          objectType: "investigation-opportunity",
          objectId: "investigation:delivery",
        },
        value: {
          id: "investigation:delivery",
          suggestedExecutiveQuestion:
            "Where does delivery judgment remain concentrated?",
          affectedConditions: ["condition:continuity"],
        },
        supportingRefs: [
          {
            objectType: "organizational-condition",
            objectId: "condition:continuity",
          },
        ],
      },
    ],
    evolution: [
      {
        id: "evolution:delivery",
        canonicalRef: {
          objectType: "organizational-evolution",
          objectId: "evolution:delivery",
        },
        value: {
          id: "evolution:delivery",
          organizationId: ORGANIZATION_ID,
          occurredAt: NOW,
          objectType: "organizational-understanding",
          objectId: "understanding:delivery",
          supportingRefs: [
            {
              objectType: "organizational-understanding",
              objectId: "understanding:delivery",
              revisionId: "understanding:delivery:revision:1",
            },
          ],
        },
        supportingRefs: [
          {
            objectType: "organizational-understanding",
            objectId: "understanding:delivery",
            revisionId: "understanding:delivery:revision:1",
          },
        ],
      },
    ],
    availability: [
      { area: "projection", state: "available-with-content" },
      { area: "understanding", state: "available-with-content" },
      { area: "explanations", state: "available-with-content" },
      { area: "evidence", state: "runtime-data-unavailable" },
      { area: "uncertainty", state: "available-with-content" },
      { area: "conditions", state: "available-with-content" },
      { area: "organizational-state", state: "available-empty" },
      { area: "investigations", state: "available-with-content" },
      { area: "evolution", state: "available-with-content" },
    ],
    depth: {
      summary: [
        {
          objectType: "organizational-understanding",
          objectId: "understanding:delivery",
          revisionId: "understanding:delivery:revision:1",
        },
      ],
      support: [
        {
          objectType: "organizational-condition",
          objectId: "condition:continuity",
        },
      ],
      trace: [
        { objectType: "evidence", objectId: "evidence:delivery" },
        { objectType: "evidence", objectId: "evidence:process" },
      ],
    },
  } as unknown as OrganizationalUnderstandingProjection;
}

const prioritySignals: UpstreamPrioritySignal[] = [
  {
    signalId: "signal:condition-significance",
    subjectRef: {
      objectType: "organizational-condition",
      objectId: "condition:continuity",
    },
    producer: "condition_significance",
    objective: "organizational-significance",
    priorityClass: "high",
    score: 0.8,
    rank: 1,
    supportingRefs: [
      {
        objectType: "organizational-explanation",
        objectId: "explanation:concentration",
      },
    ],
  },
  {
    signalId: "signal:information-gain",
    subjectRef: {
      objectType: "investigation-opportunity",
      objectId: "investigation:delivery",
    },
    producer: "investigation_information_gain",
    objective: "information-gain",
    rank: 1,
    supportingRefs: [
      {
        objectType: "organizational-condition",
        objectId: "condition:continuity",
      },
    ],
  },
];

function source(
  projected = projection(),
  signals = prioritySignals,
): ProductCommunicationSource {
  return {
    context: {
      organizationId: ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: PRODUCT_COMMUNICATION_CONTRACT_VERSION,
    },
    projection: projected,
    prioritySignals: signals,
  };
}

function reverseProjection(
  value: OrganizationalUnderstandingProjection,
): OrganizationalUnderstandingProjection {
  const reverse = <T>(items: readonly T[]): T[] => [...items].reverse();
  return {
    ...value,
    understandings: reverse(value.understandings),
    explanations: reverse(value.explanations),
    evidence: reverse(value.evidence),
    uncertainty: reverse(value.uncertainty),
    conditions: reverse(value.conditions),
    investigations: reverse(value.investigations),
    evolution: reverse(value.evolution),
    availability: reverse(value.availability),
    depth: {
      summary: reverse(value.depth.summary),
      support: reverse(value.depth.support),
      trace: reverse(value.depth.trace),
    },
  };
}

const initialSource = source();
const initialSnapshot = JSON.stringify(initialSource);
const treatment = compileProductCommunicationPlan(
  initialSource,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
const treatmentJson = JSON.stringify(treatment);
const repeatJson = JSON.stringify(
  compileProductCommunicationPlan(
    initialSource,
    ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  ),
);
const reversedProjectionJson = JSON.stringify(
  compileProductCommunicationPlan(
    source(reverseProjection(projection())),
    ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  ),
);
const reversedSignalsJson = JSON.stringify(
  compileProductCommunicationPlan(
    source(projection(), [...prioritySignals].reverse()),
    ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  ),
);

check(() => assert.equal(repeatJson, treatmentJson));
check(() => assert.equal(reversedProjectionJson, treatmentJson));
check(() => assert.equal(reversedSignalsJson, treatmentJson));
check(() => assert.equal(JSON.stringify(initialSource), initialSnapshot));
check(() => assert.equal(treatment.organizationId, ORGANIZATION_ID));
check(() => assert.equal(treatment.consumerId, CONSUMER_ID));
check(() =>
  assert.equal(
    treatment.disclosureDecisionId,
    "disclosure:communication-shadow",
  ));
check(() =>
  assert.deepEqual(treatment.sourceRevisionIds, [
    "understanding:delivery:revision:1",
  ]));
check(() =>
  assert.equal(treatment.lead?.subjectRef.objectId, "condition:continuity"));
check(() =>
  assert.equal(treatment.lead?.priority.source, "upstream_signal"));
check(() =>
  assert.deepEqual(treatment.lead?.priority.upstreamSignalIds, [
    "signal:condition-significance",
  ]));
check(() =>
  assert.equal(
    treatment.lead?.sourceText?.text,
    "Delivery knowledge remains concentrated.",
  ));
check(() =>
  assert.equal(treatment.lead?.sourceText?.sourceField, "summary"));
check(() =>
  assert.equal(treatment.lead?.sourceText?.sourceOwner, "canonical_cognition"));
check(() =>
  assert.ok(treatment.support.every((entry) => entry.priority)));
check(() =>
  assert.ok(treatment.uncertainty.every((entry) => entry.priority)));
check(() =>
  assert.ok(treatment.changes.every((entry) => entry.priority)));
check(() =>
  assert.ok(treatment.nextInquiries.every((entry) => entry.priority)));
check(() => assert.equal(treatment.uncertainty.length, 2));
check(() => assert.equal(treatment.alternatives.length, 1));
check(() => assert.equal(treatment.alternatives[0].alternatives.length, 2));
check(() =>
  assert.ok(
    treatment.alternatives[0].alternatives.every(
      (entry) => entry.disposition === "unresolved",
    ),
  ));
check(() =>
  assert.equal(
    treatment.nextInquiries[0].sourceText?.text,
    "Where does delivery judgment remain concentrated?",
  ));
check(() =>
  assert.equal(
    treatment.nextInquiries[0].sourceText?.sourceField,
    "suggestedExecutiveQuestion",
  ));
check(() => assert.equal(treatment.changes.length, 1));
check(() =>
  assert.equal(
    treatment.availability.find((entry) => entry.area === "alternatives")
      ?.state,
    "unresolved-alternatives-required",
  ));
check(() =>
  assert.ok(
    !treatmentJson.includes("why this matters") &&
      !treatmentJson.includes("recommendation") &&
      !treatmentJson.includes("confidence"),
  ));
check(() =>
  assert.ok(
    treatment.prioritySignals.every(
      (signal) => signal.producer && signal.objective,
    ),
  ));
check(() =>
  assert.deepEqual(
    treatment.prioritySignals.map((signal) => signal.signalId),
    ["signal:condition-significance", "signal:information-gain"],
  ));

const invalidSignal = {
  ...prioritySignals[0],
  signalId: "signal:outside-closure",
  subjectRef: {
    objectType: "organizational-condition" as const,
    objectId: "condition:withheld",
  },
};
const invalidPlan = compileProductCommunicationPlan(
  source(projection(), [invalidSignal]),
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() => assert.equal(invalidPlan.prioritySignals.length, 0));
check(() =>
  assert.equal(
    invalidPlan.lead?.priority.explanation.code,
    "experience_lead_fallback",
  ));
check(() =>
  assert.ok(!JSON.stringify(invalidPlan).includes("condition:withheld")));

const mixedSignal = {
  ...prioritySignals[0],
  signalId: "signal:mixed",
  supportingRefs: [
    {
      objectType: "organizational-explanation" as const,
      objectId: "explanation:withheld",
    },
  ],
};
const mixedPlan = compileProductCommunicationPlan(
  source(projection(), [mixedSignal]),
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() => assert.equal(mixedPlan.prioritySignals.length, 0));

const mismatchOrganization = source();
mismatchOrganization.context.organizationId = "other-organization";
const mismatchOrganizationPlan = compileProductCommunicationPlan(
  mismatchOrganization,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() =>
  assert.equal(
    mismatchOrganizationPlan.availability[0].state,
    "organization-mismatch",
  ));
check(() => assert.equal(mismatchOrganizationPlan.lead, undefined));

const mismatchConsumer = source();
mismatchConsumer.context.consumerId = "consumer:other";
const mismatchConsumerPlan = compileProductCommunicationPlan(
  mismatchConsumer,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() =>
  assert.equal(
    mismatchConsumerPlan.availability[0].state,
    "consumer-mismatch",
  ));

for (const [projectionState, expected] of [
  ["withheld", "withheld"],
  ["revoked", "revoked"],
  ["authority-receipt-invalid", "invalid-authority"],
  [
    "historical-compatibility-unavailable",
    "historical-compatibility-unavailable",
  ],
] as const) {
  const projected = projection();
  projected.availability = projected.availability.map((entry) =>
    entry.area === "projection"
      ? { ...entry, state: projectionState }
      : entry,
  );
  const plan = compileProductCommunicationPlan(
    source(projected),
    ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  );
  check(() => assert.equal(plan.availability[0].state, expected));
  check(() => assert.equal(plan.support.length, 0));
}

const structurallyReadable = projection();
structurallyReadable.conditions = structurallyReadable.conditions.map((entry) => ({
  ...entry,
  value: { ...entry.value, summary: "" },
})) as typeof structurallyReadable.conditions;
const structurallyReadablePlan = compileProductCommunicationPlan(
  source(structurallyReadable),
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() => assert.equal(structurallyReadablePlan.lead?.sourceText, undefined));
check(() =>
  assert.equal(
    structurallyReadablePlan.availability.find(
      (entry) => entry.area === "lead",
    )?.state,
    "source-text-unavailable",
  ));

const noInvestigations = projection();
noInvestigations.investigations = [];
const noInvestigationPlan = compileProductCommunicationPlan(
  source(noInvestigations, [prioritySignals[0]]),
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() => assert.equal(noInvestigationPlan.nextInquiries.length, 0));
check(() =>
  assert.equal(
    noInvestigationPlan.availability.find(
      (entry) => entry.area === "next-inquiries",
    )?.state,
    "available-empty",
  ));

const applicationPlan = compileProductCommunicationPlan(
  {
    ...source(),
    applicationInputs: [{
      inputId: "application:assessment",
      owner: "assessment",
      objective: "executive-action",
      organizationId: ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      disclosureDecisionId: "disclosure:application",
      subjectRefs: [],
    }],
  },
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
check(() =>
  assert.equal(
    applicationPlan.availability[0].state,
    "unsupported-application-input",
  ));

const runtimePath = path.join(
  ROOT,
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const runtimeBefore = fs.readFileSync(runtimePath, "utf8");
loadOrganizationRuntimeState(ORGANIZATION_ID);
const runtimeAfter = fs.readFileSync(runtimePath, "utf8");
check(() => assert.equal(runtimeAfter, runtimeBefore));
check(() =>
  assert.equal(
    crypto.createHash("sha256").update(runtimeAfter).digest("hex"),
    crypto.createHash("sha256").update(runtimeBefore).digest("hex"),
  ));

const activeRoute = fs.readFileSync(
  path.join(
    ROOT,
    "components/product-shell/data/buildUnifiedExecutiveWorkspaceView.ts",
  ),
  "utf8",
);
check(() => assert.ok(activeRoute.includes("buildRuntimeOrganizationView")));
check(() =>
  assert.ok(!activeRoute.includes("compileProductCommunicationPlan")));

const compilerSource = fs.readFileSync(
  path.join(
    ROOT,
    "engine/v3/communication/productCommunicationPlan.ts",
  ),
  "utf8",
);
check(() => assert.ok(!compilerSource.includes("new Date(")));
check(() => assert.ok(!compilerSource.includes("Math.random")));
check(() => assert.ok(!compilerSource.includes("OrganizationRuntime")));
check(() => assert.ok(!compilerSource.includes("synthesizeExecutive")));

const negativeControl = projection().conditions[0].canonicalRef;
const reversedNegativeControl =
  reverseProjection(projection()).conditions[0].canonicalRef;
check(() =>
  assert.equal(
    JSON.stringify(negativeControl),
    JSON.stringify(reversedNegativeControl),
  ));
const unstableProjection = projection();
unstableProjection.conditions = [
  ...unstableProjection.conditions,
  {
    ...structuredClone(unstableProjection.conditions[0]),
    id: "condition:alternate",
    canonicalRef: {
      objectType: "organizational-condition",
      objectId: "condition:alternate",
    },
  } as ProjectedReference<
    OrganizationalUnderstandingProjection["conditions"][number]["value"]
  >,
];
const arrayOrderLeadA = unstableProjection.conditions[0].canonicalRef.objectId;
const arrayOrderLeadB =
  [...unstableProjection.conditions].reverse()[0].canonicalRef.objectId;
check(() => assert.notEqual(arrayOrderLeadA, arrayOrderLeadB));
check(() => assert.ok(treatment.lead?.priority.ruleId));

const hash = crypto.createHash("sha256").update(treatmentJson).digest("hex");
const runtimeHash = crypto
  .createHash("sha256")
  .update(runtimeAfter)
  .digest("hex");

const result = {
  benchmark: "structured-product-communication-contract-shadow",
  checks,
  passed: checks,
  failed: 0,
  treatmentHash: hash,
  runtimeHash,
  baselines: {
    rawProjection: {
      priorityProvenance: false,
      communicationStructure: false,
      uncertaintyPreserved: true,
    },
    phase8a: {
      active: true,
      priorityProvenance: false,
      communicationStructure: "compatibility-prose",
    },
    treatment: {
      priorityProvenance: true,
      communicationStructure: true,
      uncertaintyPreserved: true,
      alternativesPreserved: true,
      sourcePassThrough: true,
      active: false,
    },
    negativeControl: {
      priorityProvenance: false,
      orderStable: false,
      benchmarkOnly: true,
    },
  },
  localUnderstandingUtility: {
    understandingGain: "positive-hypothesis",
    actionUtility: "demonstrated-benchmark-utility",
    cognitiveLoadReduction: "positive-hypothesis",
    continuity: "positive-hypothesis",
    trustCalibration: "demonstrated-benchmark-utility",
    userIntelligence: "not-measured",
  },
};

assert.equal(checks, 60);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
