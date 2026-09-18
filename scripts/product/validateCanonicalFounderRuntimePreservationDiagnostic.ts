import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";
import { CanonicalFounderRuntimePreservationOperationError, inspectCanonicalFounderRuntimePreservation } from "../../lib/alpha-provisioning/productionCanonicalFounderRuntimePreservationOperation";
import { createCanonicalFounderRuntimePreservationPostHandler } from "../../lib/alpha-provisioning/productionCanonicalFounderRuntimePreservationRoute";

const founderId = "organization_11111111-1111-4111-8111-111111111111";
const founder = { organizationId: founderId, creationKey: "founder-production-smoke:asterline-software-synthetic-test:v2", displayName: "Safe", provenance: "safe", createdAt: "2026-09-18T04:00:00.000Z" };
const environment = { VERCEL_ENV: "production", NODE_ENV: "production", DISCOVERY_ALPHA_ORGANIZATION_ID: "legacy_runtime_safe", DISCOVERY_DATABASE_URL: "postgresql://safe/test" } as NodeJS.ProcessEnv;
const empty = { governedSources: 0, preparedWork: 0, meetingPacks: 0, recurringMeetingSeries: 0, occurrences: 0, reviewedCarryForwardReferences: 0, workflowReferences: 0 };
type Access = { participantBinding: "PRESENT" | "ABSENT"; organizationAccess: "CURRENT" | "HISTORICAL_OR_REVOKED" | "ABSENT"; provenance: "FOUNDER_BOOTSTRAP" | "NON_FOUNDER" | "ABSENT"; exactFounderLineage: boolean; referencesCanonicalFounder: boolean };
const noAccess: Access = { participantBinding: "ABSENT", organizationAccess: "ABSENT", provenance: "ABSENT", exactFounderLineage: false, referencesCanonicalFounder: false };
function stored(tag = "same") {
  const runtime = createEmptyOrganizationRuntime({ organizationId: founderId, name: tag, now: "2026-09-18T04:00:00.000Z" });
  const bytes = new TextEncoder().encode(JSON.stringify(runtime));
  return { bytes, revision: "1", runtime };
}
function dependencies(input: { postgres?: ReturnType<typeof stored> | null; blob?: ReturnType<typeof stored> | null; structures?: typeof empty; access?: Access; fail?: boolean }) {
  let closes = 0, reads = 0, writes = 0;
  return {
    openSql: () => ({ end: async () => { closes += 1; } }),
    resolveFounder: async () => founder,
    postgresRuntime: () => ({ read: async (id: string) => { reads += 1; assert.equal(id, founderId, "Postgres read uses the resolved canonical founder ID"); if (input.fail) throw new Error("postgresql://private"); return input.postgres ?? null; } }),
    blobRuntime: () => ({ read: async (id: string) => { reads += 1; assert.equal(id, founderId, "Blob read uses the resolved canonical founder ID, never configured legacy ID"); return input.blob ?? null; } }),
    structuralFacts: async () => input.structures ?? empty,
    accessFacts: async () => input.access ?? noAccess,
    expectedFounderFingerprint: createHash("sha256").update(founderId).digest("hex").slice(0, 16),
    state: () => ({ closes, reads, writes }),
  };
}
async function run(input: Parameters<typeof dependencies>[0]) {
  const dependency = dependencies(input);
  const receipt = await inspectCanonicalFounderRuntimePreservation(environment, dependency);
  assert.equal(dependency.state().writes, 0, "read-only operation has no injected mutation capability");
  assert.equal(dependency.state().closes, 1, "read-only connection closes");
  return receipt;
}
async function main(): Promise<void> {
  let checks = 0;
  const check = (condition: unknown, message: string) => { assert.ok(condition, message); checks += 1; };
  const clean = await run({});
  check(clean.preservationState === "P6 — NO_CANONICAL_RUNTIME_OR_DEPENDENT_STATE" && clean.freshRevisionOneInitialization.eligible === "YES", "empty canonical founder state is the sole fresh revision-one case");
  const optionalConfiguration = await inspectCanonicalFounderRuntimePreservation({ VERCEL_ENV: "production", NODE_ENV: "production", DISCOVERY_DATABASE_URL: "postgresql://safe/test" } as NodeJS.ProcessEnv, dependencies({}));
  check(optionalConfiguration.configuration.configuredOrganizationFingerprint === null && optionalConfiguration.configuration.targetsLegacyCandidate === false, "absent legacy configuration remains optional for the preservation diagnostic");
  const dependent = await run({ access: { participantBinding: "PRESENT", organizationAccess: "CURRENT", provenance: "FOUNDER_BOOTSTRAP", exactFounderLineage: true, referencesCanonicalFounder: true } });
  check(dependent.preservationState === "P5 — NO_CANONICAL_RUNTIME_BUT_BOOTSTRAP_STATE_PRESENT", "founder access/bootstrap evidence blocks fresh initialization");
  const blob = await run({ blob: stored() });
  check(blob.preservationState === "P2 — BLOB_CANONICAL_RUNTIME_PRESENT" && blob.sameIdBlobImport.eligible === "YES" && blob.sameIdBlobImport.owner === "importLegacyOrganizationRuntime", "same-ID Blob Runtime selects existing import owner without invoking it");
  const matching = await run({ postgres: stored(), blob: stored() });
  check(matching.preservationState === "P3 — BOTH_PRESENT_MATCHING", "matching safe payload fingerprints preserve both-store state");
  const conflicting = await run({ postgres: stored("postgres"), blob: stored("blob") });
  check(conflicting.preservationState === "P4 — BOTH_PRESENT_CONFLICTING", "different Runtime payloads fail closed as a preservation conflict");
  await assert.rejects(() => inspectCanonicalFounderRuntimePreservation(environment, dependencies({ fail: true })), (error: unknown) => error instanceof CanonicalFounderRuntimePreservationOperationError && error.receipt.stage === "POSTGRES_RUNTIME_READ" && error.receipt.errorCode === "CANONICAL_FOUNDER_RUNTIME_PRESERVATION_FAILED");
  checks += 1;
  const previous = { ...process.env };
  try {
    Object.assign(process.env, { VERCEL_ENV: "production", NODE_ENV: "production", DISCOVERY_CANONICAL_FOUNDER_RUNTIME_PRESERVATION_SECRET: "founder-preservation-secret-0123456789" });
    const handler = createCanonicalFounderRuntimePreservationPostHandler(async () => clean);
    const unauthorized = await handler(new Request("https://example.test", { method: "POST" }));
    check(unauthorized.status === 401 && !(await unauthorized.text()).includes("P6"), "unauthorized route reveals no diagnostic state");
    const authorized = await handler(new Request("https://example.test", { method: "POST", headers: { authorization: "Bearer founder-preservation-secret-0123456789" } }));
    const body = await authorized.text();
    check(authorized.status === 200 && ![founderId, "legacy_runtime_safe", "postgresql://", "private", "founder-production-smoke"].some(value => body.includes(value)), "safe route receipt excludes raw identities, database URL, errors, and creation key");
  } finally { process.env = previous; }
  const [operation, route, endpoint] = await Promise.all([
    readFile("lib/alpha-provisioning/productionCanonicalFounderRuntimePreservationOperation.ts", "utf8"),
    readFile("lib/alpha-provisioning/productionCanonicalFounderRuntimePreservationRoute.ts", "utf8"),
    readFile("app/api/ops/inspect-canonical-founder-runtime/route.ts", "utf8"),
  ]);
  check(!/\b(?:INSERT|UPDATE|DELETE|CREATE\s+TABLE|ALTER\s+TABLE)\b/u.test(operation) && !operation.includes(".create(") && !operation.includes(".replace(") && !operation.includes("applyGovernanceMigrations") && !operation.includes("provisionOrganizationUnderstandingBootstrap("), "operation contains no write, migration, or bootstrap execution path");
  check(route.includes("DISCOVERY_CANONICAL_FOUNDER_RUNTIME_PRESERVATION_SECRET") && endpoint.includes('runtime = "nodejs"') && endpoint.includes("force-dynamic"), "route remains protected and Node-only");
  console.log(`RESULT PASS canonical-founder-runtime-preservation-diagnostic checks=${checks}`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
