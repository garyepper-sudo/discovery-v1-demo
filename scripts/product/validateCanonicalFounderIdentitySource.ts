import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { canonicalFounderRuntimeHealthy } from "../../lib/alpha-provisioning/productionFounderRuntimeHealth";

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
  assert.ok(health.includes("canonicalFounderRuntimeHealthy") && !health.includes("DISCOVERY_ALPHA_ORGANIZATION_ID"));
  assert.ok(loader.includes("resolveCanonicalFounderIdentity") && loader.includes("configuredOrganizationId: founder.organizationId"));
  assert.ok(!environmentValidator.includes('"DISCOVERY_ALPHA_ORGANIZATION_ID",'));
  assert.ok(environmentValidator.includes("legacyOrganizationConfigurationPresent"));
  assert.ok(reconciliation.includes("if (!value) return null"));
  assert.ok(preservation.includes("configuredId ? fingerprint(configuredId) : null"));

  let runtimeReads = 0;
  const healthy = await canonicalFounderRuntimeHealthy({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async (organizationId: string) => { runtimeReads += 1; return stored(organizationId); } }),
  });
  assert.equal(healthy, true);
  assert.equal(runtimeReads, 1);

  const absent = await canonicalFounderRuntimeHealthy({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => null }),
  });
  assert.equal(absent, false);

  const mismatched = await canonicalFounderRuntimeHealthy({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => stored("other_organization") }),
  });
  assert.equal(mismatched, false);

  const malformed = await canonicalFounderRuntimeHealthy({} as never, environment, {
    resolveFounder: async () => founder,
    runtime: () => ({ read: async () => ({ bytes: new Uint8Array(), revision: "1", runtime: {} } as never) }),
  });
  assert.equal(malformed, false);

  let readsAfterFounderFailure = 0;
  const founderFailure = await canonicalFounderRuntimeHealthy({} as never, environment, {
    resolveFounder: async () => { throw new Error("private-founder-failure"); },
    runtime: () => ({ read: async () => { readsAfterFounderFailure += 1; return stored(founder.organizationId); } }),
  });
  assert.equal(founderFailure, false);
  assert.equal(readsAfterFounderFailure, 0);

  console.log("RESULT PASS canonical-founder-identity-source");
}

void main();
