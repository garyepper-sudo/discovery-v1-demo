import "server-only";

import type { Sql } from "postgres";

import { createOrganizationRuntimeRepository, type StoredOrganizationRuntime } from "../../engine/v3/runtime";
import { resolveCanonicalFounderIdentity } from "./canonicalFounderIdentity";

type Dependencies = Readonly<{
  resolveFounder: (sql: Sql<Record<string, unknown>>) => Promise<{ organizationId: string }>;
  runtime: (environment: NodeJS.ProcessEnv, sql: Sql<Record<string, unknown>>) => Pick<ReturnType<typeof createOrganizationRuntimeRepository>, "read">;
}>;

/** Strong read/decode health check for the owner-resolved current Runtime. */
export async function canonicalFounderRuntimeHealthy(
  sql: Sql<Record<string, unknown>>,
  environment: NodeJS.ProcessEnv = process.env,
  injected?: Partial<Dependencies>,
): Promise<boolean> {
  const dependencies: Dependencies = { resolveFounder: resolveCanonicalFounderIdentity, runtime: createOrganizationRuntimeRepository, ...injected };
  try {
    const founder = await dependencies.resolveFounder(sql);
    const stored: StoredOrganizationRuntime | null = await dependencies.runtime(environment, sql).read(founder.organizationId);
    return Boolean(stored && stored.runtime.metadata.organizationId === founder.organizationId);
  } catch {
    return false;
  }
}
