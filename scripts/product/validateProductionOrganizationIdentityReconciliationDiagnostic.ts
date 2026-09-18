import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { OrganizationIdentityReconciliationOperationError, reconcileProductionOrganizationIdentity } from "../../lib/alpha-provisioning/productionOrganizationIdentityReconciliationOperation";
import { createOrganizationIdentityReconciliationPostHandler } from "../../lib/alpha-provisioning/productionOrganizationIdentityReconciliationRoute";

const legacyId = "legacy_runtime_safe";
const founderId = "organization_11111111-1111-4111-8111-111111111111";
const secret = "reconciliation-secret-0123456789abcdef";
const empty = { participantBindings: 0, organizationAccessGrants: 0, exactSeriesAccessGrants: 0, governedSources: 0, recurringMeetingSeries: 0, occurrences: 0, productQuestions: 0, preparedWork: 0, meetingPacks: 0, productWorkflowExists: false };
const environment = { VERCEL_ENV: "production", NODE_ENV: "production", DISCOVERY_ALPHA_ORGANIZATION_ID: legacyId, DISCOVERY_DATABASE_URL: "postgresql://safe/test" } as NodeJS.ProcessEnv;

function dependencies(input: { legacyIdentity?: { organization_id: string; creation_key: string } | null; founder?: { organization_id: string; creation_key: string } | null; legacyId?: string; fail?: "legacy" | "identity" }) {
  let closes = 0, writes = 0;
  const result = {
    openSql: () => ({ end: async () => { closes += 1; } }),
    legacy: () => ({ read: async () => { if (input.fail === "legacy") throw new Error("private blob payload"); return { runtime: { metadata: { organizationId: input.legacyId ?? legacyId } } }; } }),
    application: () => ({ read: async () => { throw new Error("must not read PostgreSQL Runtime"); } }),
    findIdentity: async () => { if (input.fail === "identity") throw new Error("postgresql://private"); return input.legacyIdentity ?? null; },
    findFounderIdentity: async () => input.founder ?? null,
    structuralCounts: async () => ({ ...empty, participantBindings: 2 }),
    state: () => ({ closes, writes }),
  };
  return result;
}

async function receipt(input: Parameters<typeof dependencies>[0]) {
  const dependency = dependencies(input);
  const value = await reconcileProductionOrganizationIdentity(environment, dependency);
  assert.equal(dependency.state().writes, 0, "diagnostic owns no write capability");
  assert.equal(dependency.state().closes, 1, "diagnostic closes its read-only connection");
  return value;
}

async function main(): Promise<void> {
  let checks = 0;
  const check = (value: unknown, message: string) => { assert.ok(value, message); checks += 1; };
  const insufficient = await receipt({ founder: null });
  check(insufficient.readOnly && insufficient.configMatchesLegacyRuntimeMetadata, "legacy Runtime metadata is compared without disclosure");
  check(insufficient.legacyCandidate.fingerprint !== legacyId && insufficient.legacyCandidate.grammar === "OTHER_RUNTIME_SAFE", "legacy identifier is fingerprinted and grammar-classified");
  check(insufficient.canonicalFounderCandidate.status === "ABSENT" && insufficient.continuity === "INSUFFICIENT_EVIDENCE", "missing founder identity remains insufficient evidence");
  check(insufficient.continuityEvidence.find(item => item.kind === "SHARED_PARTICIPANT_BINDING")?.classification === "NO_CONNECTION", "independent binding counts never imply shared identity continuity");
  const same = await receipt({ founder: { organization_id: legacyId, creation_key: "founder-production-smoke:asterline-software-synthetic-test:v2" }, legacyIdentity: { organization_id: legacyId, creation_key: "founder-production-smoke:asterline-software-synthetic-test:v2" } });
  check(same.continuity === "PROVEN_SAME_LOGICAL_ORGANIZATION" && same.canonicalFounderMatch === "YES", "exact owner identity equality proves continuity");
  const different = await receipt({ founder: { organization_id: founderId, creation_key: "founder-production-smoke:asterline-software-synthetic-test:v2" }, legacyIdentity: { organization_id: legacyId, creation_key: "historical-owner-key" } });
  check(different.continuity === "PROVEN_DIFFERENT_ORGANIZATIONS" && different.continuityEvidence.some(item => item.classification === "CONTRADICTS_CONTINUITY"), "distinct owner-issued creation lineage proves separation");
  await assert.rejects(() => reconcileProductionOrganizationIdentity(environment, dependencies({ fail: "legacy" })), (error: unknown) => error instanceof OrganizationIdentityReconciliationOperationError && error.receipt.stage === "LEGACY_RUNTIME_READ");
  checks += 1;
  const previous = { ...process.env };
  try {
    Object.assign(process.env, { VERCEL_ENV: "production", NODE_ENV: "production", DISCOVERY_ORGANIZATION_IDENTITY_RECONCILIATION_SECRET: secret });
    const operation = async () => insufficient;
    const handler = createOrganizationIdentityReconciliationPostHandler(operation);
    const unauthorized = await handler(new Request("https://example.test", { method: "POST" }));
    check(unauthorized.status === 401 && !(await unauthorized.text()).includes("legacy"), "unauthorized request reveals no operation state");
    const authorized = await handler(new Request("https://example.test", { method: "POST", headers: { authorization: `Bearer ${secret}` } }));
    const body = await authorized.text();
    check(authorized.status === 200 && ![legacyId, founderId, "historical-owner-key", secret, "postgresql://", "private blob"].some(value => body.includes(value)), "route receipt contains no raw identities, keys, secrets, URLs, or protected errors");
  } finally { process.env = previous; }
  const [operationSource, routeSource] = await Promise.all([
    readFile("lib/alpha-provisioning/productionOrganizationIdentityReconciliationOperation.ts", "utf8"),
    readFile("app/api/ops/reconcile-organization-identity/route.ts", "utf8"),
  ]);
  check(!/\b(?:INSERT|UPDATE|DELETE|CREATE\s+TABLE|ALTER\s+TABLE)\b/u.test(operationSource) && !operationSource.includes(".create(") && !operationSource.includes(".replace(") && !operationSource.includes("applyGovernanceMigrations"), "operation source contains no durable mutation or migration path");
  check(routeSource.includes("runtime = \"nodejs\"") && routeSource.includes("force-dynamic"), "route retains Node production operations boundary");
  console.log(`RESULT PASS production-organization-identity-reconciliation-diagnostic checks=${checks}`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
