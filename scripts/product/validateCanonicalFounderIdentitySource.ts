import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { canonicalFounderRuntimeHealthReceipt, inspectCanonicalFounderRuntimeHealth } from "../../lib/alpha-provisioning/productionFounderRuntimeHealth";

const founder = { organizationId: "canonical_founder" };
const environment = {} as NodeJS.ProcessEnv;
const stored = (organizationId: string) => ({
  bytes: new TextEncoder().encode("{}"),
  revision: "1",
  runtime: { metadata: { organizationId } } as never,
});

async function main(): Promise<void> {
  const [resolver, migration, health, loader, environmentValidator, reconciliation, preservation] = await Promise.all([
    readFile(path.join(process.cwd(), "lib/alpha-provisioning/canonicalFounderIdentity.ts"), "utf8"),
    readFile(path.join(process.cwd(), "lib/alpha-provisioning/productionRuntimeMigrationOperation.ts"), "utf8"),
    readFile(path.join(process.cwd(), "app/api/health/route.ts"), "utf8"),
    readFile(path.join(process.cwd(), "components/product-shell/data/loadActivatedYourOrganization.ts"), "utf8"),
    readFile(path.join(process.cwd(), "scripts/deployment/validateAlphaEnvironment.ts"), "utf8"),
    readFile(path.join(process.cwd(), "lib/alpha-provisioning/productionOrganizationIdentityReconciliationOperation.ts"), "utf8"),
    readFile(path.join(process.cwd(), "lib/alpha-provisioning/productionCanonicalFounderRuntimePreservationOperation.ts"), "utf8"),
  ]);

  assert.ok(resolver.includes('import "server-only"'));
  assert.ok(resolver.includes("resolveOrganizationIdentityByCreationKey"));
  assert.ok(resolver.includes('canonicalFounderFingerprint = "778c8abe00afa2ac"'));
  assert.ok(!resolver.includes("createOrResolveOrganization"));
  assert.ok(migration.includes("resolveCanonicalFounderIdentity") && !migration.includes("DISCOVERY_ALPHA_ORGANIZATION_ID"));
  assert.ok(health.includes("inspectCanonicalFounderRuntimeHealth") && health.includes("runtimeStage") && !health.includes("DISCOVERY_ALPHA_ORGANIZATION_ID"));
  assert.ok(loader.includes("resolveCanonicalFounderIdentity") && loader.includes("configuredOrganizationId: founder.organizationId"));
  assert.ok(!environmentValidator.includes('"DISCOVERY_ALPHA_ORGANIZATION_ID",'));
  assert.ok(environmentValidator.includes("legacyOrganizationConfigurationPresent"));
  assert.ok(reconciliation.includes("if (!value) return null"));
  assert.ok(preservation.includes("configuredId ? fingerprint(configuredId) : null"));

  let runtimeReads = 0;
  const healthy = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async (organizationId: string) => { runtimeReads += 1; return stored(organizationId); } }),
  });
  assert.deepEqual(healthy, { stage: "PASS", healthy: true });
  assert.equal(runtimeReads, 1);
  assert.deepEqual(canonicalFounderRuntimeHealthReceipt(healthy), { runtime: true });

  const absent = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => null }),
  });
  assert.deepEqual(absent, { stage: "POSTGRES_RUNTIME_ABSENT", healthy: false });

  const mismatched = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => stored("other_organization") }),
  });
  assert.deepEqual(mismatched, { stage: "METADATA_IDENTITY_COMPARE", healthy: false });

  const malformed = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => ({ bytes: new Uint8Array(), revision: "1", runtime: {} } as never) }),
  });
  assert.deepEqual(malformed, { stage: "POSTGRES_RUNTIME_READ_OR_DECODE", healthy: false });

  let readsAfterFounderFailure = 0;
  const founderFailure = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => { throw new Error("private-founder-failure"); },
    runtime: () => ({ read: async () => { readsAfterFounderFailure += 1; return stored(founder.organizationId); } }),
  });
  assert.deepEqual(founderFailure, { stage: "FOUNDER_IDENTITY_READ", healthy: false });
  assert.equal(readsAfterFounderFailure, 0);
  const repositoryFailure = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => { throw new Error("private-repository-failure"); },
  });
  assert.deepEqual(repositoryFailure, { stage: "POSTGRES_REPOSITORY_CONSTRUCTION", healthy: false });
  const readFailure = await inspectCanonicalFounderRuntimeHealth({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => { throw new Error("private-read-failure"); } }),
  });
  assert.deepEqual(readFailure, { stage: "POSTGRES_RUNTIME_READ_OR_DECODE", healthy: false });
  const publicFailure = canonicalFounderRuntimeHealthReceipt(readFailure);
  assert.deepEqual(publicFailure, { runtime: false, runtimeStage: "POSTGRES_RUNTIME_READ_OR_DECODE" });
  assert.ok(!JSON.stringify(publicFailure).includes("private-read-failure"));

  console.log("RESULT PASS canonical-founder-identity-source");
}

void main();
