import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import postgres from "postgres";

import { composeActivatedYourOrganization } from "../../components/product-shell/data/composeActivatedYourOrganization";
import { isYourOrganizationAlphaActivationEnabled } from "../../lib/alpha-activation/config";
import {
  runDurableAlphaDisclosureTransaction,
} from "../../db/governance/disclosureTransactionShadow";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { requireDiscoveryDatabaseUrl } from "../../db/config";
import {
  buildAlphaCanonicalAuthorityReceipt,
  type AlphaRuntimeCompositionLoader,
  type VerifiedConsumerIdentity,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { normalizeClerkVerifiedConsumerIdentity } from "../../engine/v3/governance/clerkVerifiedConsumerIdentity";
import type { OrganizationalExplanation } from "../../engine/v3/model/judgment/organizationalJudgment";
import type { OrganizationalCondition } from "../../engine/v3/model/state/inferOrganizationalConditions";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";
import { buildCanonicalUnderstandingCompatibilityShadow } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";

const ROOT = path.resolve(__dirname, "../..");
const NOW = "2026-08-01T12:00:00.000Z";
const ORGANIZATION_ID = "alpha-design-partner";
const CONSUMER_ID = "user_alpha_design_partner";
const CONDITION_SUMMARY =
  "Decision ownership is constraining cross-functional execution.";
let checks = 0;

function check(assertion: () => void): void {
  assertion();
  checks += 1;
}

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

const identityResolution = normalizeClerkVerifiedConsumerIdentity({
  auth: {
    isAuthenticated: true,
    userId: CONSUMER_ID,
    sessionId: "sess_alpha_design_partner",
  },
  verifiedAt: NOW,
});
assert.equal(identityResolution.status, "verified");
if (identityResolution.status !== "verified") {
  throw new Error("Authenticated identity fixture did not resolve.");
}
const identity = identityResolution.identity;

const explanation: OrganizationalExplanation = {
  id: "explanation:alpha-design-partner",
  organizationId: ORGANIZATION_ID,
  semanticKey: "semantic:alpha-design-partner",
  claim: {
    scope: {
      organizationId: ORGANIZATION_ID,
      type: "organization",
      id: ORGANIZATION_ID,
    },
    rootMechanismIds: ["mechanism:decision-ownership"],
    outcomeRefs: [{ type: "phenomenon", id: "outcome:execution-friction" }],
    causalRelationFamily: "constraint",
  },
  explanationSeedIds: ["seed:decision-ownership"],
  reasoningPathIds: ["path:decision-ownership"],
  mechanismIds: ["mechanism:decision-ownership"],
  beliefIds: [],
  theoryIds: [],
  evidenceIds: ["evidence:decision-ownership"],
  contradictionIds: [],
  assumptions: [],
  comparativeEvidenceRoles: [{
    evidenceId: "evidence:decision-ownership",
    role: "supports",
    basis: {
      kind: "evidence-relationship",
      referenceIds: ["relationship:decision-ownership"],
    },
    relatedExplanationIds: [],
  }],
  viability: "unadjudicated",
  uncertainty: ["Independent outcome evidence remains incomplete."],
  createdAt: NOW,
  updatedAt: NOW,
};

const compositions = buildCanonicalUnderstandingCompatibilityShadow({
  organizationId: ORGANIZATION_ID,
  explanations: [explanation],
  now: NOW,
});
assert.equal(compositions.length, 1);

const condition: OrganizationalCondition = {
  id: "condition-decision-flow",
  name: "Decision Flow",
  domain: "decisionFlow",
  status: "constrained",
  priority: "high",
  confidence: 0.74,
  strength: 0.81,
  trend: "stable",
  summary: CONDITION_SUMMARY,
  whyItMatters: "Unclear decision ownership slows coordinated work.",
  supportingConceptIds: [],
  supportingBeliefIds: [],
  supportingMechanismIds: ["mechanism:decision-ownership"],
  supportingTheoryIds: [],
  supportingExplanationIds: [explanation.id],
  upstreamConditionIds: [],
  downstreamConditionIds: [],
  recommendedExecutiveAction: "Clarify decision ownership.",
  uncertaintySummary: "Outcome evidence remains incomplete.",
  confidenceLimiters: ["Only one operating cycle is represented."],
  missingEvidence: ["Decision-cycle outcome evidence."],
  lastUpdatedAt: NOW,
};

const runtime = createEmptyOrganizationRuntime({
  organizationId: ORGANIZATION_ID,
  name: "Design Partner",
});
runtime.metadata.investigationCount = 1;
runtime.memory.organizationalExplanations = [explanation];
runtime.memory.organizationalConditions = [condition];
runtime.memory.organizationalUnderstandingState.canonicalCompositions =
  compositions;
(runtime.memory as unknown as {
  executiveAssessment: {
    primaryJudgment: { dominantConditionId: string };
  };
}).executiveAssessment = {
  primaryJudgment: { dominantConditionId: condition.id },
};
(runtime.memory as unknown as {
  investigationOpportunities: Array<{
    id: string;
    topic: string;
    reason: string;
    expectedConfidenceGain: number;
    executiveLeverage: "high";
    affectedConditions: string[];
    missingEvidence: string[];
    suggestedExecutiveQuestion: string;
  }>;
}).investigationOpportunities = [{
  id: "investigation:decision-authority",
  topic: "Decision Authority",
  reason: "This would discriminate among explanations.",
  expectedConfidenceGain: 12,
  executiveLeverage: "high",
  affectedConditions: ["Decision Flow"],
  missingEvidence: ["Approval-path observations."],
  suggestedExecutiveQuestion:
    "Which operational decisions still require escalation?",
}];

const runtimeBytes = stable(runtime);
const runtimeLoader: AlphaRuntimeCompositionLoader = {
  load({ organizationId }) {
    if (organizationId !== runtime.metadata.organizationId) {
      throw new Error("Runtime organization mismatch");
    }
    return {
      organizationId,
      compositions,
      authorityReceipts: compositions.flatMap((composition) => {
        const receipt = buildAlphaCanonicalAuthorityReceipt(composition);
        return receipt ? [receipt] : [];
      }),
    };
  },
};

async function main(): Promise<void> {
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  const access = new PostgresAlphaAccessRecordRepository(sql);
  try {
    await access.grantAccess({
      accessRecordId: "alpha-access:activation-owner",
      consumerId: CONSUMER_ID,
      organizationId: ORGANIZATION_ID,
      experience: "organization",
      actor: "activation-validator",
      reasonCode: "first-design-partner-validation",
      idempotencyKey: "activation-owner-grant",
      grantedAt: NOW,
    });

    const owner = await runDurableAlphaDisclosureTransaction({
      sql,
      identity,
      organizationId: ORGANIZATION_ID,
      experience: "organization",
      resolvedAt: NOW,
      runtimeLoader,
    });
    check(() => assert.equal(owner.status, "committed"));
    if (owner.status !== "committed") {
      throw new Error("Owner disclosure did not commit.");
    }
    check(() => assert.equal(owner.runtimeLoaderInvocations, 1));

    const activated = composeActivatedYourOrganization({
      runtime,
      identity,
      resolution: owner.resolution,
      resolvedAt: NOW,
    });
    check(() => assert.equal(activated.status, "available"));
    if (activated.status !== "available") {
      throw new Error("Activated view was unavailable.");
    }
    check(() => assert.equal(
      activated.projection.disclosureDecisionId,
      owner.resolution.decision.id,
    ));
    check(() => assert.equal(
      activated.view.insights[0]?.headline,
      CONDITION_SUMMARY,
    ));
    check(() => assert.equal(
      activated.communicationPlanId.length > 0,
      true,
    ));
    check(() => assert.equal(
      activated.communicationViewId.length > 0,
      true,
    ));

    const unauthorizedIdentity: VerifiedConsumerIdentity = {
      ...identity,
      consumerId: "user_unauthorized",
    };
    const unauthorized = await runDurableAlphaDisclosureTransaction({
      sql,
      identity: unauthorizedIdentity,
      organizationId: ORGANIZATION_ID,
      experience: "organization",
      resolvedAt: NOW,
      runtimeLoader,
    });
    check(() => assert.equal(unauthorized.status, "denied"));
    check(() => assert.equal(unauthorized.runtimeLoaderInvocations, 0));

    const wrongOrganization = await runDurableAlphaDisclosureTransaction({
      sql,
      identity,
      organizationId: "another-organization",
      experience: "organization",
      resolvedAt: NOW,
      runtimeLoader,
    });
    check(() => assert.equal(wrongOrganization.status, "denied"));
    check(() => assert.equal(wrongOrganization.runtimeLoaderInvocations, 0));

    await access.grantAccess({
      accessRecordId: "alpha-access:missing-runtime",
      consumerId: CONSUMER_ID,
      organizationId: "missing-runtime",
      experience: "organization",
      actor: "activation-validator",
      reasonCode: "missing-runtime-validation",
      idempotencyKey: "activation-missing-runtime-grant",
      grantedAt: NOW,
    });
    const missingRuntime = await runDurableAlphaDisclosureTransaction({
      sql,
      identity,
      organizationId: "missing-runtime",
      experience: "organization",
      resolvedAt: NOW,
      runtimeLoader: {
        load() {
          throw new Error("Runtime unavailable");
        },
      },
    });
    check(() => assert.equal(missingRuntime.status, "denied"));
    check(() => assert.equal(
      missingRuntime.status === "denied" && missingRuntime.reason,
      "runtime-unavailable",
    ));

    const missingProjectionRuntime = structuredClone(runtime);
    missingProjectionRuntime.memory.organizationalUnderstandingState
      .canonicalCompositions = [];
    const missingProjection = composeActivatedYourOrganization({
      runtime: missingProjectionRuntime,
      identity,
      resolution: owner.resolution,
      resolvedAt: NOW,
    });
    check(() => assert.equal(
      missingProjection.status,
      "projection-unavailable",
    ));

    const missingCommunicationRuntime = structuredClone(runtime);
    missingCommunicationRuntime.memory.organizationalConditions = [];
    const missingCommunication = composeActivatedYourOrganization({
      runtime: missingCommunicationRuntime,
      identity,
      resolution: owner.resolution,
      resolvedAt: NOW,
    });
    check(() => assert.equal(
      missingCommunication.status,
      "communication-unavailable",
    ));

    await access.revokeAccess({
      accessRecordId: "alpha-access:activation-owner",
      actor: "activation-validator",
      reasonCode: "revoked-user-validation",
      idempotencyKey: "activation-owner-revoke",
      revokedAt: "2026-08-01T12:01:00.000Z",
    });
    const revoked = await runDurableAlphaDisclosureTransaction({
      sql,
      identity,
      organizationId: ORGANIZATION_ID,
      experience: "organization",
      resolvedAt: "2026-08-01T12:02:00.000Z",
      runtimeLoader,
    });
    check(() => assert.equal(revoked.status, "denied"));
    check(() => assert.equal(revoked.runtimeLoaderInvocations, 0));

    const signedOut = normalizeClerkVerifiedConsumerIdentity({
      auth: { isAuthenticated: false, userId: null, sessionId: null },
      verifiedAt: NOW,
    });
    check(() => assert.equal(signedOut.status, "denied"));
    check(() => assert.equal(
      isYourOrganizationAlphaActivationEnabled({
        DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
      }),
      false,
    ));
    check(() => assert.equal(stable(runtime), runtimeBytes));

    const auditRows = await sql<{ count: string }[]>`
      SELECT count(*)::text AS count
      FROM alpha_disclosure_audit_events
      WHERE consumer_id = ${CONSUMER_ID}
        AND organization_id = ${ORGANIZATION_ID}
    `;
    check(() => assert.equal(Number(auditRows[0]?.count) >= 1, true));

    const routeSource = fs.readFileSync(
      path.join(ROOT, "app/(product)/your-organization/page.tsx"),
      "utf8",
    );
    check(() => assert.equal(
      routeSource.includes("isYourOrganizationAlphaActivationEnabled"),
      true,
    ));
    check(() => assert.equal(routeSource.includes("<ProductWorkspace"), true));

    console.log(JSON.stringify({
      validation: "alpha-your-organization-activation",
      result: "PASS",
      checks,
      activation: "feature-flagged",
      authenticatedReplay: "complete",
      runtimeMutated: false,
      disclosureDecisionId: owner.resolution.decision.id,
      projectionId: activated.projection.projectionId,
      communicationPlanId: activated.communicationPlanId,
      communicationViewId: activated.communicationViewId,
    }, null, 2));
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
