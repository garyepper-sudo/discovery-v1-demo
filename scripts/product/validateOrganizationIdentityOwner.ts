import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { OrganizationIdentityOwner } from "../../lib/alpha-provisioning/organizationIdentityOwner";
import { inspectGovernanceMigrationState } from "../storage/governanceMigrationContract";

const databaseUrl = process.env.DISCOVERY_TEST_DATABASE_URL;
if (!databaseUrl || !/localhost|127\.0\.0\.1/u.test(databaseUrl)) throw new Error("DISCOVERY_TEST_DATABASE_URL must name an explicit local PostgreSQL.");

const at = "2026-09-18T03:00:00.000Z";
const creationKey = "validation:organization-identity-owner:v1";
const input = { creationKey, displayName: "Synthetic Organization Identity Validation", provenance: "Deterministic local validation of the canonical organization identity owner.", createdAt: at };

async function main(): Promise<void> {
  const url = databaseUrl!;
  const sql = postgres(url, { max: 3 }), concurrentA = postgres(url, { max: 1 }), concurrentB = postgres(url, { max: 1 });
  const checks: string[] = [];
  const check = (statement: string, condition: unknown) => { assert.ok(condition, statement); checks.push(statement); };
  try {
    check("migration state is current before owner validation", (await inspectGovernanceMigrationState(sql)).status === "CURRENT");
    await sql`DELETE FROM organization_identities WHERE creation_key IN (${creationKey}, ${`${creationKey}:concurrent`}, ${`${creationKey}:same-name`})`;
    const owner = new OrganizationIdentityOwner(sql), first = await owner.createOrResolveOrganization(input);
    check("first creation returns an opaque Runtime-compatible owner-issued organization identity", /^organization_[0-9a-f-]{36}$/u.test(first.organizationId) && /^[A-Za-z0-9_-]+$/u.test(first.organizationId));
    check("first creation stores the exact approved creation facts", first.creationKey === input.creationKey && first.displayName === input.displayName && first.provenance === input.provenance);
    const replay = await owner.createOrResolveOrganization(input);
    check("identical retry returns the same organization identity", replay.organizationId === first.organizationId);
    const concurrentInput = { ...input, creationKey: `${creationKey}:concurrent` };
    const [left, right] = await Promise.all([new OrganizationIdentityOwner(concurrentA).createOrResolveOrganization(concurrentInput), new OrganizationIdentityOwner(concurrentB).createOrResolveOrganization(concurrentInput)]);
    check("concurrent identical creates converge", left.organizationId === right.organizationId);
    const [count] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM organization_identities WHERE creation_key = ${concurrentInput.creationKey}`;
    check("concurrent identical creates persist exactly one identity", count.count === 1);
    await assert.rejects(() => owner.createOrResolveOrganization({ ...input, provenance: "Conflicting provenance" }), /conflict/);
    checks.push("conflicting metadata under one creation key fails closed");
    const sameName = await owner.createOrResolveOrganization({ ...input, creationKey: `${creationKey}:same-name` });
    check("same display name with another valid creation key does not alias", sameName.organizationId !== first.organizationId);
    const [access, workflow, sources] = await Promise.all([sql<{ count: number }[]>`SELECT count(*)::int AS count FROM alpha_access_records WHERE organization_id IN (${first.organizationId}, ${left.organizationId}, ${sameName.organizationId})`, sql<{ count: number }[]>`SELECT count(*)::int AS count FROM chief_workflow_heads WHERE organization_id IN (${first.organizationId}, ${left.organizationId}, ${sameName.organizationId})`, sql<{ count: number }[]>`SELECT count(*)::int AS count FROM chief_source_heads WHERE organization_id IN (${first.organizationId}, ${left.organizationId}, ${sameName.organizationId})`]);
    check("identity creation creates no grants, workflow, or source state", access[0].count === 0 && workflow[0].count === 0 && sources[0].count === 0);
    const [catalog] = await sql<{ unique_key: boolean; identity_constraint: boolean; application_select: boolean; administration_insert: boolean }[]>`SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_identities_creation_key_key') AS unique_key, EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_identities_identity_check') AS identity_constraint, has_table_privilege('discovery_alpha_application', 'public.organization_identities', 'SELECT') AS application_select, has_table_privilege('discovery_alpha_administration', 'public.organization_identities', 'INSERT') AS administration_insert`;
    check("identity migration enforces uniqueness, validation, and narrow grants", catalog.unique_key && catalog.identity_constraint && catalog.application_select && catalog.administration_insert);
    const bootstrapSource = await readFile(path.join(process.cwd(), "product/integration/productionDesignPartnerBootstrap.ts"), "utf8");
    const ownerPosition = bootstrapSource.indexOf("new OrganizationIdentityOwner(administration).createOrResolveOrganization"), bootstrapPosition = bootstrapSource.indexOf("provisionOrganizationUnderstandingBootstrap({organizationId"), accessPosition = bootstrapSource.indexOf("access.activatePolicy({organizationId");
    check("production bootstrap consumes the owner-issued ID before Runtime and access", ownerPosition >= 0 && ownerPosition < bootstrapPosition && bootstrapPosition < accessPosition && !bootstrapSource.includes("clerkSubject: string;\n  organizationId:"));
    check("production bootstrap has no development identity derivation", !bootstrapSource.includes("founder-") && !bootstrapSource.includes("createHash(\"sha256\").update(`organization"));
  } finally {
    await sql`DELETE FROM organization_identities WHERE creation_key IN (${creationKey}, ${`${creationKey}:concurrent`}, ${`${creationKey}:same-name`})`;
    await Promise.all([sql.end(), concurrentA.end(), concurrentB.end()]);
  }
  console.log(`RESULT PASS organization-identity-owner checks=${checks.length}`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
