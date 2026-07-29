import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  buildOrganizationExperienceFromProjection,
} from "../../components/product-shell/data/buildOrganizationExperienceFromProjection";
import {
  buildYourOrganizationCommunicationView,
} from "../../components/product-shell/data/buildYourOrganizationCommunicationView";
import {
  compileProductCommunicationPlan,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
} from "../../engine/v3/communication/productCommunicationPlan";
import {
  ALPHA_ALLOWLIST_POLICY_ID,
  ALPHA_ALLOWLIST_POLICY_VERSION,
  buildAlphaCanonicalAuthorityReceipt,
  preflightAlphaOrganizationAccess,
  resolveAlphaAllowlistDisclosureDecision,
  runAlphaAllowlistDisclosureShadow,
  type AlphaAccessRecordReader,
  type AlphaCanonicalAuthorityReceipt,
  type AlphaDisclosureDecisionAuditEvent,
  type AlphaOrganizationAccessRecord,
  type AlphaRuntimeCompositionLoader,
  type VerifiedConsumerIdentity,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  compileOrganizationalUnderstandingProjection,
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import type {
  OrganizationalExplanation,
} from "../../engine/v3/model/judgment/organizationalJudgment";
import {
  loadOrganizationRuntimeState,
  type OrganizationRuntime,
} from "../../engine/v3/runtime";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
  type CanonicalUnderstandingComposition,
} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";

const ROOT = path.resolve(__dirname, "../..");
const ORGANIZATION_ID = "atlas-manufacturing-simulation";
const CONSUMER_ID = "consumer:alpha-shadow";
const OTHER_CONSUMER_ID = "consumer:other";
const OTHER_ORGANIZATION_ID = "other-organization";
const NOW = "2026-08-01T00:00:00.000Z";
const EARLIER = "2026-07-31T00:00:00.000Z";
const LATER = "2026-08-02T00:00:00.000Z";

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

function sha256(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

type ScenarioResult = {
  id: string;
  passed: true;
  observation: string;
};

const results: ScenarioResult[] = [];
function scenario(id: string, observation: string, work: () => void): void {
  work();
  results.push({ id, passed: true, observation });
}

function identity(
  overrides: Partial<VerifiedConsumerIdentity> = {},
): VerifiedConsumerIdentity {
  return {
    consumerId: CONSUMER_ID,
    provider: "clerk",
    verificationId: "benchmark-verification:alpha-shadow",
    verifiedAt: EARLIER,
    ...overrides,
  };
}

function accessRecord(
  overrides: Partial<AlphaOrganizationAccessRecord> = {},
): AlphaOrganizationAccessRecord {
  return {
    accessRecordId: "alpha-access:atlas:consumer",
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId: CONSUMER_ID,
    organizationId: ORGANIZATION_ID,
    relationship: "allowed_alpha_user",
    supportedExperiences: ["organization"],
    scope: {
      type: "organization",
      organizationId: ORGANIZATION_ID,
    },
    status: "active",
    createdAt: EARLIER,
    ...overrides,
  };
}

class InjectedReader implements AlphaAccessRecordReader {
  calls = 0;

  constructor(
    readonly records: readonly AlphaOrganizationAccessRecord[],
    readonly failure = false,
  ) {}

  findAccessRecords(): readonly AlphaOrganizationAccessRecord[] {
    this.calls += 1;
    if (this.failure) throw new Error("Injected access-reader failure");
    return structuredClone(this.records);
  }
}

class AppendOnlyAuditSink {
  readonly events: AlphaDisclosureDecisionAuditEvent[] = [];

  append(event: AlphaDisclosureDecisionAuditEvent): void {
    assert.equal(
      this.events.some((candidate) => candidate.eventId === event.eventId),
      false,
    );
    this.events.push(structuredClone(event));
  }
}

let persistedRuntime: OrganizationRuntime | undefined;
let persistedCompositions: CanonicalUnderstandingComposition[] = [];
let persistedReceipts: AlphaCanonicalAuthorityReceipt[] = [];
let runtimeLoadCalls = 0;

const shadowExplanation: OrganizationalExplanation = {
  id: "explanation:alpha-allowlist-shadow",
  organizationId: ORGANIZATION_ID,
  semanticKey: "semantic:alpha-allowlist-shadow",
  claim: {
    scope: {
      organizationId: ORGANIZATION_ID,
      type: "organization",
      id: ORGANIZATION_ID,
    },
    rootMechanismIds: ["mechanism:alpha-allowlist-shadow"],
    outcomeRefs: [{ type: "phenomenon", id: "outcome:alpha-allowlist-shadow" }],
    causalRelationFamily: "constraint",
  },
  explanationSeedIds: ["seed:alpha-allowlist-shadow"],
  reasoningPathIds: ["path:alpha-allowlist-shadow"],
  mechanismIds: ["mechanism:alpha-allowlist-shadow"],
  beliefIds: [],
  theoryIds: [],
  evidenceIds: ["evidence:alpha-allowlist-shadow"],
  contradictionIds: [],
  assumptions: [],
  comparativeEvidenceRoles: [{
    evidenceId: "evidence:alpha-allowlist-shadow",
    role: "supports",
    basis: {
      kind: "evidence-relationship",
      referenceIds: ["relationship:alpha-allowlist-shadow"],
    },
    relatedExplanationIds: [],
  }],
  viability: "unadjudicated",
  uncertainty: ["Independent outcome evidence remains unavailable."],
  createdAt: NOW,
  updatedAt: NOW,
};

const persistedRuntimeLoader: AlphaRuntimeCompositionLoader = {
  load({ organizationId }) {
    runtimeLoadCalls += 1;
    const runtime = loadOrganizationRuntimeState(organizationId);
    const compositions = buildCanonicalUnderstandingCompatibilityShadow({
      organizationId,
      explanations: [shadowExplanation],
      now: NOW,
    }).slice(0, 1);
    const receipts = compositions.flatMap((composition) => {
      const receipt = buildAlphaCanonicalAuthorityReceipt(composition);
      return receipt ? [receipt] : [];
    });
    persistedRuntime = runtime;
    persistedCompositions = compositions;
    persistedReceipts = receipts;
    return {
      organizationId: runtime.metadata.organizationId,
      compositions,
      authorityReceipts: receipts,
    };
  },
};

const initialRuntimeBytes = fs.readFileSync(
  path.join(
    ROOT,
    ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
  ),
  "utf8",
);
const reader = new InjectedReader([accessRecord()]);
const successfulShadow = runAlphaAllowlistDisclosureShadow(
  {
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    resolvedAt: NOW,
  },
  {
    accessReader: reader,
    runtimeLoader: persistedRuntimeLoader,
  },
);

assert.equal(successfulShadow.runtimeLoadState, "loaded");
assert.ok(successfulShadow.resolution);
assert.ok(persistedRuntime);
assert.equal(persistedCompositions.length, 1);
assert.equal(persistedReceipts.length, 1);

const eligiblePreflight = successfulShadow.preflight;
const successfulResolution = successfulShadow.resolution;

scenario("01-explicit-verified-identity", "A successful preflight preserves the explicit verified consumer identity.", () => {
  assert.equal(eligiblePreflight.consumerId, CONSUMER_ID);
  assert.equal(eligiblePreflight.disposition, "eligible");
});

scenario("02-versioned-policy", "Preflight preserves the stable Alpha policy ID and version.", () => {
  assert.equal(eligiblePreflight.policyId, ALPHA_ALLOWLIST_POLICY_ID);
  assert.equal(eligiblePreflight.policyVersion, ALPHA_ALLOWLIST_POLICY_VERSION);
});

scenario("03-explicit-allowlist-success", "One exact active allowlist record permits organization preflight.", () => {
  assert.equal(eligiblePreflight.accessRecord?.accessRecordId, accessRecord().accessRecordId);
  assert.deepEqual(eligiblePreflight.reasonCodes, ["active-explicit-access"]);
});

scenario("04-preflight-byte-stability", "Repeated preflight output is byte-stable.", () => {
  const input = {
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    resolvedAt: NOW,
  };
  assert.equal(
    stable(preflightAlphaOrganizationAccess(input, new InjectedReader([accessRecord()]))),
    stable(preflightAlphaOrganizationAccess(input, new InjectedReader([accessRecord()]))),
  );
});

scenario("05-decision-byte-stability", "Repeated composition decisions are byte-stable.", () => {
  const input = {
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization" as const,
    requestedCompositions: persistedCompositions,
    authorityReceipts: persistedReceipts,
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  };
  assert.equal(
    stable(resolveAlphaAllowlistDisclosureDecision(input)),
    stable(resolveAlphaAllowlistDisclosureDecision(input)),
  );
});

scenario("06-record-order-independence", "A valid supersession chain is independent of reader record order.", () => {
  const original = accessRecord({ accessRecordId: "access:original" });
  const revoked = accessRecord({
    accessRecordId: "access:revoked",
    status: "revoked",
    revokedAt: NOW,
    supersedesAccessRecordId: original.accessRecordId,
  });
  const request = {
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    resolvedAt: NOW,
  };
  assert.equal(
    stable(preflightAlphaOrganizationAccess(request, new InjectedReader([original, revoked]))),
    stable(preflightAlphaOrganizationAccess(request, new InjectedReader([revoked, original]))),
  );
});

scenario("07-composition-order-independence", "Reversed composition order preserves normalized decision output.", () => {
  const second = {
    ...structuredClone(persistedCompositions[0]),
    id: `${persistedCompositions[0].id}:second`,
    revisionId: `${persistedCompositions[0].revisionId}:second`,
  };
  const secondReceipt = buildAlphaCanonicalAuthorityReceipt(second);
  assert.ok(secondReceipt);
  const base = {
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization" as const,
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  };
  const forward = resolveAlphaAllowlistDisclosureDecision({
    ...base,
    requestedCompositions: [persistedCompositions[0], second],
    authorityReceipts: [persistedReceipts[0], secondReceipt],
  });
  const reverse = resolveAlphaAllowlistDisclosureDecision({
    ...base,
    requestedCompositions: [second, persistedCompositions[0]],
    authorityReceipts: [persistedReceipts[0], secondReceipt],
  });
  assert.equal(stable(forward), stable(reverse));
});

scenario("08-receipt-order-independence", "Reversed authority-receipt order preserves normalized decision output.", () => {
  const composition = persistedCompositions[0];
  const second = {
    ...structuredClone(composition),
    id: `${composition.id}:receipt-order`,
    revisionId: `${composition.revisionId}:receipt-order`,
  };
  const secondReceipt = buildAlphaCanonicalAuthorityReceipt(second);
  assert.ok(secondReceipt);
  const base = {
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization" as const,
    requestedCompositions: [composition, second],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  };
  assert.equal(
    stable(resolveAlphaAllowlistDisclosureDecision({
      ...base,
      authorityReceipts: [persistedReceipts[0], secondReceipt],
    })),
    stable(resolveAlphaAllowlistDisclosureDecision({
      ...base,
      authorityReceipts: [secondReceipt, persistedReceipts[0]],
    })),
  );
});

scenario("09-exact-organization", "The successful decision preserves exact organization identity.", () => {
  assert.equal(successfulResolution.decision.organizationId, ORGANIZATION_ID);
  assert.equal(successfulResolution.provenance.organizationId, ORGANIZATION_ID);
});

scenario("10-exact-consumer", "The successful decision preserves exact consumer identity.", () => {
  assert.equal(successfulResolution.decision.consumerId, CONSUMER_ID);
  assert.equal(successfulResolution.provenance.consumerId, CONSUMER_ID);
});

scenario("11-exact-experience", "The producer preserves the organization experience.", () => {
  assert.equal(successfulResolution.provenance.experience, "organization");
});

scenario("12-exact-composition-and-revision", "The producer preserves exact composition and revision identity.", () => {
  assert.deepEqual(successfulResolution.provenance.disclosedCompositionRefs, [{
    compositionId: persistedCompositions[0].id,
    revisionId: persistedCompositions[0].revisionId,
    authorityReceiptId: persistedReceipts[0].receiptId,
  }]);
});

scenario("13-exact-authority-receipt", "The audit preserves the exact validated authority receipt.", () => {
  assert.deepEqual(successfulResolution.auditEvent.authorityReceiptIds, [
    persistedReceipts[0].receiptId,
  ]);
});

scenario("14-deterministic-decision-id", "The decision ID is deterministic SHA-256 provenance.", () => {
  assert.match(successfulResolution.decision.id, /^alpha-disclosure-decision:[a-f0-9]{64}$/);
});

scenario("15-deterministic-audit-id", "The audit-event ID is deterministic SHA-256 provenance.", () => {
  assert.match(successfulResolution.auditEvent.eventId, /^alpha-disclosure-audit-event:[a-f0-9]{64}$/);
});

scenario("16-missing-identity-denies", "Missing identity fails closed before Runtime loading.", () => {
  let loads = 0;
  const output = runAlphaAllowlistDisclosureShadow(
    { identity: null, organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    {
      accessReader: new InjectedReader([accessRecord()]),
      runtimeLoader: { load: () => { loads += 1; throw new Error("must not load"); } },
    },
  );
  assert.equal(output.preflight.disposition, "invalid");
  assert.equal(loads, 0);
});

scenario("17-malformed-identity-denies", "Malformed verified identity fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity({ consumerId: "*" }), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord()]),
  );
  assert.equal(output.disposition, "invalid");
  assert.deepEqual(output.reasonCodes, ["identity-invalid"]);
});

scenario("18-unsupported-provider-denies", "A caller-asserted unsupported provider fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    {
      identity: { ...identity(), provider: "benchmark" } as unknown as VerifiedConsumerIdentity,
      organizationId: ORGANIZATION_ID,
      experience: "organization",
      resolvedAt: NOW,
    },
    new InjectedReader([accessRecord()]),
  );
  assert.equal(output.disposition, "invalid");
});

scenario("19-future-verification-denies", "A future-dated verification fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity({ verifiedAt: LATER }), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord()]),
  );
  assert.equal(output.disposition, "invalid");
});

scenario("20-missing-access-denies", "Missing explicit access denies and does not load Runtime.", () => {
  let loads = 0;
  const output = runAlphaAllowlistDisclosureShadow(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    {
      accessReader: new InjectedReader([]),
      runtimeLoader: { load: () => { loads += 1; throw new Error("must not load"); } },
    },
  );
  assert.equal(output.preflight.disposition, "denied");
  assert.equal(output.resolution?.decision.disposition, "withheld");
  assert.equal(loads, 0);
});

scenario("21-revoked-access-denies", "A terminal revoked record produces revocation.", () => {
  const original = accessRecord({ accessRecordId: "access:active" });
  const revoked = accessRecord({
    accessRecordId: "access:terminal-revoked",
    status: "revoked",
    revokedAt: NOW,
    supersedesAccessRecordId: original.accessRecordId,
  });
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([original, revoked]),
  );
  assert.equal(output.disposition, "revoked");
});

scenario("22-wrong-consumer-denies", "An access record for another consumer fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord({ consumerId: OTHER_CONSUMER_ID })]),
  );
  assert.equal(output.disposition, "invalid");
});

scenario("23-guessed-organization-denies", "A guessed organization ID cannot use an access record for another organization.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: OTHER_ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord()]),
  );
  assert.notEqual(output.disposition, "eligible");
});

scenario("24-wrong-experience-denies", "Unsupported experience fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "research", resolvedAt: NOW },
    new InjectedReader([accessRecord()]),
  );
  assert.equal(output.disposition, "denied");
});

scenario("25-malformed-scope-denies", "A mismatched organization scope fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord({
      scope: { type: "organization", organizationId: OTHER_ORGANIZATION_ID },
    })]),
  );
  assert.equal(output.disposition, "invalid");
});

scenario("26-wildcard-access-denies", "Wildcard consumer and organization access are rejected.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord({ consumerId: "*", organizationId: "*" })]),
  );
  assert.notEqual(output.disposition, "eligible");
});

scenario("27-duplicate-records-deny", "Duplicate access-record identities fail closed.", () => {
  const record = accessRecord();
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([record, structuredClone(record)]),
  );
  assert.equal(output.disposition, "invalid");
  assert.deepEqual(output.reasonCodes, ["access-record-conflict"]);
});

scenario("28-conflicting-records-deny", "Unrelated active records fail closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([
      accessRecord({ accessRecordId: "access:one" }),
      accessRecord({ accessRecordId: "access:two" }),
    ]),
  );
  assert.equal(output.disposition, "invalid");
});

scenario("29-reactivation-denies", "An active successor after revocation is not silently accepted.", () => {
  const original = accessRecord({ accessRecordId: "access:original" });
  const revoked = accessRecord({
    accessRecordId: "access:revoked",
    status: "revoked",
    revokedAt: NOW,
    supersedesAccessRecordId: original.accessRecordId,
  });
  const reactivated = accessRecord({
    accessRecordId: "access:reactivated",
    supersedesAccessRecordId: revoked.accessRecordId,
  });
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([original, revoked, reactivated]),
  );
  assert.equal(output.disposition, "invalid");
});

scenario("30-expired-access-denies", "Expired bounded access fails closed.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([accessRecord({ validUntil: EARLIER })]),
  );
  assert.equal(output.disposition, "denied");
});

scenario("31-reader-failure-denies", "An access-reader failure fails closed without Runtime loading.", () => {
  const output = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    new InjectedReader([], true),
  );
  assert.equal(output.disposition, "denied");
  assert.deepEqual(output.reasonCodes, ["access-record-reader-unavailable"]);
});

scenario("32-denied-loader-isolation", "Denied preflight never invokes the Runtime loader.", () => {
  let loads = 0;
  runAlphaAllowlistDisclosureShadow(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    {
      accessReader: new InjectedReader([]),
      runtimeLoader: { load: () => { loads += 1; throw new Error("must not load"); } },
    },
  );
  assert.equal(loads, 0);
});

scenario("33-success-loader-once", "Successful preflight invokes the injected persisted Runtime loader exactly once.", () => {
  assert.equal(runtimeLoadCalls, 1);
});

scenario("34-loader-failure-contained", "Runtime failure after eligible preflight is explicit and discloses nothing.", () => {
  const output = runAlphaAllowlistDisclosureShadow(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    {
      accessReader: new InjectedReader([accessRecord()]),
      runtimeLoader: { load: () => { throw new Error("injected Runtime failure"); } },
    },
  );
  assert.equal(output.runtimeLoadState, "failed");
  assert.equal(output.resolution, undefined);
});

scenario("35-runtime-mismatch-contained", "A Runtime organization mismatch fails closed.", () => {
  const output = runAlphaAllowlistDisclosureShadow(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    {
      accessReader: new InjectedReader([accessRecord()]),
      runtimeLoader: {
        load: () => ({
          organizationId: OTHER_ORGANIZATION_ID,
          compositions: persistedCompositions,
          authorityReceipts: persistedReceipts,
        }),
      },
    },
  );
  assert.equal(output.runtimeLoadState, "identity-mismatch");
  assert.equal(output.resolution, undefined);
});

scenario("36-composition-organization-mismatch", "A foreign composition cannot disclose.", () => {
  const foreign = {
    ...structuredClone(persistedCompositions[0]),
    organizationId: OTHER_ORGANIZATION_ID,
  };
  const receipt = buildAlphaCanonicalAuthorityReceipt(foreign);
  assert.ok(receipt);
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: [foreign],
    authorityReceipts: [receipt],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.equal(output.disclosure.disclosedCompositions.length, 0);
});

scenario("37-missing-receipt-withholds", "A missing authority receipt withholds the composition.", () => {
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: persistedCompositions,
    authorityReceipts: [],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.equal(output.provenance.disposition, "withheld");
  assert.equal(output.disclosure.disclosedCompositions.length, 0);
});

scenario("38-invalid-receipt-withholds", "A modified authority receipt withholds the composition.", () => {
  const invalid = {
    ...structuredClone(persistedReceipts[0]),
    receiptId: "alpha-authority-receipt:invalid",
  };
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: persistedCompositions,
    authorityReceipts: [invalid],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.equal(output.disclosure.disclosedCompositions.length, 0);
});

scenario("39-foreign-receipt-withholds", "A receipt for another composition cannot authorize disclosure.", () => {
  const invalid = {
    ...structuredClone(persistedReceipts[0]),
    compositionId: "foreign-composition",
  };
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: persistedCompositions,
    authorityReceipts: [invalid],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.equal(output.provenance.disposition, "invalid");
  assert.equal(output.disclosure.disclosedCompositions.length, 0);
});

scenario("40-revision-change-requires-new-decision", "A composition revision change invalidates the old receipt and changes decision identity.", () => {
  const revised = {
    ...structuredClone(persistedCompositions[0]),
    revisionId: `${persistedCompositions[0].revisionId}:revised`,
  };
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: [revised],
    authorityReceipts: persistedReceipts,
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.notEqual(output.decision.id, successfulResolution.decision.id);
  assert.equal(output.disclosure.disclosedCompositions.length, 0);
});

scenario("41-historical-missing-authority", "Historical composition without an authority transition remains withheld.", () => {
  const historical = {
    ...structuredClone(persistedCompositions[0]),
    authorityTransition: undefined,
  };
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: [historical],
    authorityReceipts: [],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.equal(output.disclosure.disclosedCompositions.length, 0);
});

scenario("42-supporting-object-no-bypass", "Supporting cognition cannot enter disclosure without a canonical composition.", () => {
  const output = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: [],
    authorityReceipts: [],
    resolvedAt: NOW,
    preflight: eligiblePreflight,
  });
  assert.deepEqual(output.disclosure.disclosedCompositions, []);
});

scenario("43-stale-decision-not-current", "A request-time decision changes when resolution time changes.", () => {
  const nextPreflight = preflightAlphaOrganizationAccess(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: LATER },
    new InjectedReader([accessRecord()]),
  );
  const next = resolveAlphaAllowlistDisclosureDecision({
    identity: identity(),
    organizationId: ORGANIZATION_ID,
    experience: "organization",
    requestedCompositions: persistedCompositions,
    authorityReceipts: persistedReceipts,
    resolvedAt: LATER,
    preflight: nextPreflight,
  });
  assert.notEqual(next.decision.id, successfulResolution.decision.id);
});

scenario("44-revocation-next-request", "Revocation suppresses the next request without rewriting the prior disclosure.", () => {
  const prior = stable(successfulResolution);
  let loads = 0;
  const revoked = accessRecord({ status: "revoked", revokedAt: LATER });
  const output = runAlphaAllowlistDisclosureShadow(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: LATER },
    {
      accessReader: new InjectedReader([revoked]),
      runtimeLoader: { load: () => { loads += 1; throw new Error("must not load"); } },
    },
  );
  assert.equal(output.preflight.disposition, "revoked");
  assert.equal(output.resolution?.decision.disposition, "revoked");
  assert.equal(loads, 0);
  assert.equal(stable(successfulResolution), prior);
});

scenario("45-shared-password-no-authority", "The production module does not inspect Alpha password environment variables.", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "engine/v3/governance/alphaAllowlistDisclosureProducer.ts"),
    "utf8",
  );
  assert.equal(source.includes("ALPHA_ACCESS_PASSWORD"), false);
  assert.equal(source.includes("process.env"), false);
});

scenario("46-query-parameter-no-authority", "The producer accepts no route, query, request, or HTTP object.", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "engine/v3/governance/alphaAllowlistDisclosureProducer.ts"),
    "utf8",
  );
  for (const forbidden of ["searchParams", "NextRequest", "URLSearchParams", "cookies()"]) {
    assert.equal(source.includes(forbidden), false);
  }
});

scenario("47-audit-no-narrative", "The audit event contains references and reason codes but no protected narrative.", () => {
  const serialized = stable(successfulResolution.auditEvent);
  for (const forbidden of ["evidenceBody", "statement", "summary", "headline", "recommendation"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

scenario("48-audit-append-only-shape", "The injected benchmark audit sink appends immutable event copies.", () => {
  const sink = new AppendOnlyAuditSink();
  sink.append(successfulResolution.auditEvent);
  const before = stable(sink.events);
  const external = structuredClone(successfulResolution.auditEvent);
  external.reasonCodes.push("policy-input-invalid");
  assert.equal(stable(sink.events), before);
  assert.throws(() => sink.append(successfulResolution.auditEvent));
});

scenario("49-runtime-byte-stability", "The persisted Runtime file remains byte-identical after shadow replay.", () => {
  const after = fs.readFileSync(
    path.join(ROOT, ".discovery-runtime/organizations/atlas-manufacturing-simulation.json"),
    "utf8",
  );
  assert.equal(after, initialRuntimeBytes);
});

const projection = compileOrganizationalUnderstandingProjection({
  context: {
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    experience: "organization",
    generatedAt: NOW,
    contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  },
  disclosure: successfulResolution.disclosure,
  compositions: persistedCompositions,
  explanations: [shadowExplanation],
  conditions: persistedRuntime.memory.organizationalConditions,
  ...(persistedRuntime.memory.organizationalState
    ? { organizationalState: persistedRuntime.memory.organizationalState }
    : {}),
  ...(persistedRuntime.memory.organizationalUncertainty
    ? { uncertainty: persistedRuntime.memory.organizationalUncertainty }
    : {}),
  investigations: [],
  evolution: [],
});

const communicationPlan = compileProductCommunicationPlan(
  {
    context: {
      organizationId: ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: "1",
    },
    projection,
    prioritySignals: [],
  },
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
);
const communicationView = buildYourOrganizationCommunicationView({
  plan: communicationPlan,
});
const candidateView = buildOrganizationExperienceFromProjection({ projection });

scenario("50-projection-chain", "Existing projection consumes only the disclosed composition.", () => {
  assert.equal(projection.disclosureDecisionId, successfulResolution.decision.id);
  assert.equal(projection.understandings.length, 1);
});

scenario("51-product-communication-chain", "Existing Product Communication preserves disclosure provenance.", () => {
  assert.equal(communicationPlan.disclosureDecisionId, successfulResolution.decision.id);
  assert.equal(communicationPlan.organizationId, ORGANIZATION_ID);
});

scenario("52-your-organization-adapter-chain", "The inactive Your Organization adapter preserves plan and decision identity.", () => {
  assert.equal(communicationView.planId, communicationPlan.planId);
  assert.equal(communicationView.disclosureDecisionId, successfulResolution.decision.id);
});

scenario("53-candidate-view-chain", "The compatibility candidate is shaped only from the disclosed projection.", () => {
  assert.equal(
    candidateView.currentUnderstanding.projectionMetadata?.organizationId,
    ORGANIZATION_ID,
  );
  assert.equal(
    candidateView.currentUnderstanding.projectionMetadata?.projectionId,
    projection.projectionId,
  );
});

scenario("54-bounded-route-activation", "Only the feature-flagged Your Organization activation loader and composer import the Alpha producer.", () => {
  const appAndComponents = [
    ...fs.readdirSync(path.join(ROOT, "app"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
      .map((entry) => path.join(entry.parentPath, entry.name)),
    ...fs.readdirSync(path.join(ROOT, "components"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
      .map((entry) => path.join(entry.parentPath, entry.name)),
  ];
  const matches = appAndComponents
    .filter((file) =>
      fs.readFileSync(file, "utf8").includes("alphaAllowlistDisclosureProducer"),
    )
    .map((file) => path.relative(ROOT, file))
    .sort();
  assert.deepEqual(matches, [
    "components/product-shell/data/composeActivatedYourOrganization.ts",
    "components/product-shell/data/loadActivatedYourOrganization.ts",
  ]);
});

scenario("55-clerk-sdk-isolated", "The Alpha policy producer does not import the Clerk SDK.", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "engine/v3/governance/alphaAllowlistDisclosureProducer.ts"),
    "utf8",
  );
  assert.equal(source.includes("@clerk/"), false);
});

scenario("56-no-production-store", "The producer depends on injected readers and loaders and contains no persistence implementation.", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "engine/v3/governance/alphaAllowlistDisclosureProducer.ts"),
    "utf8",
  );
  for (const forbidden of ["writeFile", "persistOrganization", "saveOrganization", "DATABASE_URL"]) {
    assert.equal(source.includes(forbidden), false);
  }
});

scenario("57-no-benchmark-import-in-producer", "The production-shaped producer imports no benchmark fixture.", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "engine/v3/governance/alphaAllowlistDisclosureProducer.ts"),
    "utf8",
  );
  assert.equal(source.includes("engine/benchmark"), false);
  assert.equal(source.includes("../../benchmark"), false);
});

scenario("58-request-bound-validity", "The producer documents no reusable cross-request cache or durable decision store.", () => {
  assert.equal(successfulResolution.decision.effectiveAt, NOW);
  assert.equal(successfulResolution.provenance.resolvedAt, NOW);
  assert.equal("validUntil" in successfulResolution.decision, false);
});

scenario("59-denied-audit-safety", "A denied consumer-specific event exposes no composition or receipt identities.", () => {
  const output = runAlphaAllowlistDisclosureShadow(
    { identity: identity(), organizationId: ORGANIZATION_ID, experience: "organization", resolvedAt: NOW },
    {
      accessReader: new InjectedReader([]),
      runtimeLoader: { load: () => { throw new Error("must not load"); } },
    },
  );
  assert.deepEqual(output.resolution?.auditEvent.sourceRevisionIds, []);
  assert.deepEqual(output.resolution?.auditEvent.authorityReceiptIds, []);
});

scenario("60-no-user-intelligence-claim", "The shadow result contains no User Intelligence or Local Understanding Utility claim.", () => {
  const serialized = stable({
    preflight: successfulShadow.preflight,
    resolution: successfulShadow.resolution,
  });
  assert.equal(serialized.includes("User Intelligence"), false);
  assert.equal(serialized.includes("Local Understanding Utility"), false);
});

scenario("61-reversible-active-path", "Your Organization activation retains the byte-identical Phase 8A rollback adapters.", () => {
  for (const relativePath of [
    "components/product-shell/ProductWorkspace.tsx",
    "components/product-shell/data/buildRuntimeOrganizationView.ts",
  ]) {
    const current = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
    const head = execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.equal(current, head);
  }
  const route = fs.readFileSync(
    path.join(ROOT, "app/(product)/your-organization/page.tsx"),
    "utf8",
  );
  assert.equal(
    route.includes("isYourOrganizationAlphaPresentationEnabled"),
    true,
  );
  assert.equal(route.includes("<ProductWorkspace"), true);
});

const output = {
  validator: "Alpha Explicit Allowlist Disclosure Producer Shadow",
  policy: {
    id: ALPHA_ALLOWLIST_POLICY_ID,
    version: ALPHA_ALLOWLIST_POLICY_VERSION,
  },
  results,
  counts: {
    passed: results.length,
    failed: 0,
  },
  hashes: {
    preflightSha256: sha256(eligiblePreflight),
    decisionSha256: sha256(successfulResolution),
    auditEventSha256: sha256(successfulResolution.auditEvent),
    projectionSha256: sha256(projection),
    communicationPlanSha256: sha256(communicationPlan),
    communicationViewSha256: sha256(communicationView),
    candidateViewSha256: sha256(candidateView),
    runtimeBeforeSha256: createHash("sha256").update(initialRuntimeBytes).digest("hex"),
    runtimeAfterSha256: createHash("sha256")
      .update(
        fs.readFileSync(
          path.join(ROOT, ".discovery-runtime/organizations/atlas-manufacturing-simulation.json"),
          "utf8",
        ),
      )
      .digest("hex"),
  },
  runtime: {
    loaderCallsForSuccessfulReplay: runtimeLoadCalls,
    mutated: false,
  },
  activeRoute: "feature-flagged-your-organization-only",
  productionActivation: "bounded-local-validation",
  classification:
    results.length === 61
      ? "A — PRODUCER ACTIVE AT FEATURE-FLAGGED YOUR ORGANIZATION BOUNDARY"
      : "C — ALPHA DISCLOSURE PRODUCER BLOCKED",
};

console.log(JSON.stringify(output, null, 2));
