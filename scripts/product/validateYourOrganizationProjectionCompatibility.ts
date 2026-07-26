import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildOrganizationExperienceFromProjection,
} from "../../components/product-shell/data/buildOrganizationExperienceFromProjection";
import {
  buildRuntimeOrganizationView,
} from "../../components/product-shell/data/buildRuntimeOrganizationView";
import type {
  OrganizationalUnderstandingProjection,
  ProjectionAvailabilityState,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  loadOrganizationRuntimeState,
} from "../../engine/v3/runtime";

const NOW = "2026-07-28T00:00:00.000Z";
let checks = 0;

function check(assertion: () => void): void {
  assertion();
  checks += 1;
}

function projection(): OrganizationalUnderstandingProjection {
  return {
    projectionId: "projection:compatibility",
    contractVersion: "1",
    organizationId: "atlas-manufacturing-simulation",
    consumerId: "consumer:compatibility-shadow",
    experience: "organization",
    generatedAt: NOW,
    disclosureDecisionId: "disclosure:compatibility-shadow",
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
          previousRevisionId: null,
          organizationId: "atlas-manufacturing-simulation",
          scope: {
            organizationId: "atlas-manufacturing-simulation",
            type: "organization",
            id: "atlas-manufacturing-simulation",
          },
          outcomeRef: { type: "phenomenon", id: "outcome:delivery" },
          explanationIds: ["explanation:delivery"],
          authorityTransition: {
            authorityOwner: "canonical-organizational-understanding",
            contributionDecisionOwner:
              "canonical-understanding-contribution-validation",
            persistenceOwner: "organization-runtime",
            disclosureOwner: "application-boundary-not-evaluated",
            explanationIds: ["explanation:delivery"],
            disposition: "authorized-organizational-knowledge",
            basis: ["existing-production-semantics-satisfied"],
          },
          compositionUncertainty: ["unresolved-alternatives"],
          createdAt: NOW,
          updatedAt: NOW,
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:delivery",
          },
        ],
      },
    ],
    explanations: [
      {
        id: "explanation:delivery",
        canonicalRef: {
          objectType: "organizational-explanation",
          objectId: "explanation:delivery",
        },
        value: {
          id: "explanation:delivery",
          organizationId: "atlas-manufacturing-simulation",
          semanticKey: "delivery",
          claim: {
            scope: {
              organizationId: "atlas-manufacturing-simulation",
              type: "organization",
              id: "atlas-manufacturing-simulation",
            },
            rootMechanismIds: ["mechanism:delivery"],
            outcomeRefs: [{ type: "phenomenon", id: "outcome:delivery" }],
            causalRelationFamily: "constraint",
          },
          explanationSeedIds: ["seed:delivery"],
          reasoningPathIds: ["path:delivery"],
          mechanismIds: ["mechanism:delivery"],
          beliefIds: [],
          theoryIds: [],
          evidenceIds: ["evidence:delivery"],
          contradictionIds: [],
          assumptions: [],
          comparativeEvidenceRoles: [
            {
              evidenceId: "evidence:delivery",
              role: "supports",
              basis: {
                kind: "evidence-relationship",
                referenceIds: ["relationship:delivery"],
              },
              relatedExplanationIds: [],
            },
          ],
          viability: "unadjudicated",
          uncertainty: ["Independent outcomes remain unavailable."],
          createdAt: NOW,
          updatedAt: NOW,
        },
        supportingRefs: [
          { objectType: "evidence", objectId: "evidence:delivery" },
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
          roles: [
            {
              explanationId: "explanation:delivery",
              role: "supports",
              basisKind: "evidence-relationship",
              basisReferenceIds: ["relationship:delivery"],
              relatedExplanationIds: [],
            },
          ],
          bodyAvailability: "runtime-data-unavailable",
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:delivery",
          },
        ],
      },
    ],
    uncertainty: [
      {
        id: "explanation:delivery:uncertainty",
        canonicalRef: {
          objectType: "organizational-explanation",
          objectId: "explanation:delivery",
        },
        value: {
          owner: "organizational-explanation",
          explanationId: "explanation:delivery",
          statement: "Independent outcomes remain unavailable.",
        },
        supportingRefs: [],
      },
      {
        id: "understanding:delivery:uncertainty",
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
            objectId: "explanation:delivery",
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
          name: "Knowledge Continuity",
          domain: "knowledgeContinuity",
          status: "constrained",
          priority: "high",
          confidence: 0.7,
          strength: 0.7,
          trend: "stable",
          summary: "Delivery knowledge remains concentrated.",
          whyItMatters: "Reusable judgment is limited.",
          supportingConceptIds: [],
          supportingBeliefIds: [],
          supportingMechanismIds: ["mechanism:delivery"],
          supportingTheoryIds: [],
          supportingExplanationIds: ["explanation:delivery"],
          upstreamConditionIds: [],
          downstreamConditionIds: [],
          recommendedExecutiveAction: "Preserve reusable judgment.",
          uncertaintySummary: "Independent outcomes are missing.",
          confidenceLimiters: [],
          missingEvidence: ["Independent outcomes."],
          lastUpdatedAt: NOW,
        },
        supportingRefs: [
          {
            objectType: "organizational-explanation",
            objectId: "explanation:delivery",
          },
        ],
      },
    ],
    organizationalState: {
      id: "state:current",
      canonicalRef: {
        objectType: "organizational-state",
        objectId: "state:current",
      },
      value: {
        id: "state:current",
        summary: "Delivery remains constrained by concentrated knowledge.",
        status: "strained",
        confidence: 0.7,
        dominantConditions: ["condition:continuity"],
        improvingConditions: [],
        deterioratingConditions: [],
        unresolvedTensions: [],
        executiveImplication: "Preserve reusable judgment.",
        recommendedFocus: ["Knowledge Continuity"],
        lastUpdatedAt: NOW,
      },
      supportingRefs: [
        {
          objectType: "organizational-condition",
          objectId: "condition:continuity",
        },
      ],
    },
    investigations: [
      {
        id: "investigation:delivery",
        canonicalRef: {
          objectType: "investigation-opportunity",
          objectId: "investigation:delivery",
        },
        value: {
          id: "investigation:delivery",
          topic: "Delivery independence",
          reason: "Independent outcomes would reduce uncertainty.",
          expectedConfidenceGain: 0.1,
          executiveLeverage: "high",
          affectedConditions: ["condition:continuity"],
          missingEvidence: ["Independent outcomes."],
          suggestedExecutiveQuestion:
            "Where does delivery judgment remain concentrated?",
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
          revisionId: "understanding:delivery:revision:1",
        },
        value: {
          id: "evolution:delivery",
          organizationId: "atlas-manufacturing-simulation",
          occurredAt: NOW,
          objectType: "organizational-understanding",
          objectId: "understanding:delivery",
          revisionId: "understanding:delivery:revision:1",
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
      "projection",
      "understanding",
      "explanations",
      "evidence",
      "uncertainty",
      "conditions",
      "organizational-state",
      "investigations",
      "evolution",
    ].map((area) => ({
      area: area as OrganizationalUnderstandingProjection["availability"][number]["area"],
      state: "available-with-content" as const,
    })),
    depth: { summary: [], support: [], trace: [] },
  };
}

function rejected(
  state: ProjectionAvailabilityState,
): OrganizationalUnderstandingProjection {
  const value = projection();
  return {
    ...value,
    sourceRevisionIds: [],
    understandings: [],
    explanations: [],
    evidence: [],
    uncertainty: [],
    conditions: [],
    organizationalState: undefined,
    investigations: [],
    evolution: [],
    availability: value.availability.map((item) => ({ ...item, state })),
  };
}

const source = projection();
const sourceBytes = JSON.stringify(source);
const candidate = buildOrganizationExperienceFromProjection({
  projection: source,
});

check(() => assert.equal(
  JSON.stringify(buildOrganizationExperienceFromProjection({ projection: source })),
  JSON.stringify(candidate),
));
check(() => assert.equal(JSON.stringify(source), sourceBytes));
const reversed = {
  ...source,
  uncertainty: [...source.uncertainty].reverse(),
  conditions: [...source.conditions].reverse(),
  investigations: [...source.investigations].reverse(),
  evolution: [...source.evolution].reverse(),
};
check(() => assert.deepEqual(
  buildOrganizationExperienceFromProjection({ projection: reversed }),
  candidate,
));
check(() => assert.equal(
  candidate.currentUnderstanding.projectionMetadata?.sourceRevisionIds[0],
  "understanding:delivery:revision:1",
));
check(() => assert.equal(
  candidate.currentUnderstanding.references?.[0]?.objectId,
  "understanding:delivery",
));
check(() => assert.equal(
  candidate.currentUnderstanding.references?.[0]?.revisionId,
  "understanding:delivery:revision:1",
));
check(() => assert.equal(
  candidate.explanations.references?.[0]?.objectId,
  "explanation:delivery",
));
check(() => assert.equal(
  candidate.uncertainty.items[0],
  "Independent outcomes remain unavailable.",
));
check(() => assert.equal(
  candidate.currentUnderstanding.projectionMetadata?.evidenceRoles[0]?.role,
  "supports",
));
check(() => assert.equal(candidate.evidence.available, false));
check(() => assert.equal(
  candidate.evidence.availability?.state,
  "runtime-data-unavailable",
));
check(() => assert.equal(
  candidate.currentUnderstanding.availability?.state,
  "communication-synthesis-unavailable",
));
check(() => assert.equal(
  candidate.explanations.availability?.state,
  "communication-synthesis-unavailable",
));
check(() => assert.equal(candidate.conditions.available, true));
check(() => assert.equal(candidate.organizationalState.available, true));
check(() => assert.equal(candidate.investigations.available, true));
check(() => assert.equal(
  candidate.recentChanges.availability?.state,
  "communication-synthesis-unavailable",
));
check(() => assert.equal(JSON.stringify(candidate).includes("fixture-only"), false));
check(() => assert.equal(JSON.stringify(candidate).includes("\"confidence\""), false));
check(() => assert.equal(JSON.stringify(candidate).includes("\"ranking\""), false));
check(() => assert.equal(JSON.stringify(candidate).includes("\"recommendation\""), false));
check(() => assert.equal(JSON.stringify(candidate).includes("why this matters"), false));

for (const state of [
  "withheld",
  "revoked",
  "organization-mismatch",
  "consumer-mismatch",
  "authority-receipt-invalid",
  "historical-compatibility-unavailable",
] as const) {
  const view = buildOrganizationExperienceFromProjection({
    projection: rejected(state),
  });
  check(() => assert.equal(view.currentUnderstanding.availability?.state, state));
  check(() => assert.equal(view.currentUnderstanding.available, false));
}

const empty = rejected("available-empty");
const emptyView = buildOrganizationExperienceFromProjection({ projection: empty });
check(() => assert.equal(emptyView.conditions.availability?.state, "available-empty"));
check(() => assert.deepEqual(emptyView.conditions.items, []));
const runtimeUnavailable = buildOrganizationExperienceFromProjection({
  projection: rejected("runtime-data-unavailable"),
});
check(() => assert.equal(
  runtimeUnavailable.conditions.availability?.state,
  "runtime-data-unavailable",
));

const workspaceBuilder = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "components/product-shell/data/buildUnifiedExecutiveWorkspaceView.ts",
  ),
  "utf8",
);
check(() => assert.equal(
  workspaceBuilder.includes("buildOrganizationExperienceFromProjection"),
  false,
));
check(() => assert.equal(workspaceBuilder.includes("buildRuntimeOrganizationView(runtime)"), true));
check(() => assert.equal(Object.keys(candidate).length, 9));

const replay = loadOrganizationRuntimeState("atlas-manufacturing-simulation");
const replayBefore = JSON.stringify(replay);
const activeBefore = buildRuntimeOrganizationView(replay);
const activeAfter = buildRuntimeOrganizationView(replay);
check(() => assert.equal(JSON.stringify(replay), replayBefore));
check(() => assert.deepEqual(activeAfter, activeBefore));
check(() => assert.equal(
  activeBefore.currentUnderstanding.projectionMetadata,
  undefined,
));

console.log(
  `Your Organization projection compatibility validation: ${checks} checks passed.`,
);
