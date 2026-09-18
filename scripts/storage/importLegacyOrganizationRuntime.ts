import { createHash } from "node:crypto";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import {
  importLegacyOrganizationRuntime,
  PostgresOrganizationRuntimeRepository,
  VercelBlobOrganizationRuntimeRepository,
} from "../../engine/v3/runtime";

const organizationId = process.argv[2];
if (!organizationId || !/^[A-Za-z0-9_-]+$/.test(organizationId)) {
  throw new Error("Exact organization id is required");
}
if (process.env.DISCOVERY_RUNTIME_LEGACY_IMPORT_ENABLED !== "true") {
  throw new Error("Legacy Runtime import requires explicit enablement");
}

async function main(): Promise<void> {
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const result = await importLegacyOrganizationRuntime({
      organizationId,
      legacy: new VercelBlobOrganizationRuntimeRepository(),
      destination: new PostgresOrganizationRuntimeRepository(sql),
      requestId: `runtime-legacy-import:${organizationId}`,
      operatorId: "runtime-legacy-import",
    });
    console.log(JSON.stringify({
      operation: "organization-runtime-legacy-import",
      disposition: result.disposition,
      organizationFingerprint: createHash("sha256").update(result.organizationId).digest("hex").slice(0, 16),
      payloadDigest: result.payloadDigest,
      revision: result.revision,
      runtimeBodyPrinted: false,
    }));
  } finally {
    await sql.end({ timeout: 1 });
  }
}

void main();
