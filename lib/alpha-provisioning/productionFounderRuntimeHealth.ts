import "server-only";

import type { Sql } from "postgres";

import { PostgresOrganizationRuntimeRepository, type StoredOrganizationRuntime } from "../../engine/v3/runtime";
import { resolveCanonicalFounderIdentity } from "./canonicalFounderIdentity";

type Dependencies = Readonly<{
  resolveFounder: (sql: Sql<Record<string, unknown>>) => Promise<{ organizationId: string }>;
  runtime: (sql: Sql<Record<string, unknown>>) => Pick<PostgresOrganizationRuntimeRepository, "read">;
}>;

/** Closed, content-safe boundaries for the canonical founder Runtime health read. */
export const canonicalFounderRuntimeHealthStages = [
  "FOUNDER_IDENTITY_READ",
  "POSTGRES_REPOSITORY_CONSTRUCTION",
  "POSTGRES_RUNTIME_READ_OR_DECODE",
  "POSTGRES_RUNTIME_ABSENT",
  "METADATA_IDENTITY_COMPARE",
  "PASS",
] as const;
export type CanonicalFounderRuntimeHealthStage = (typeof canonicalFounderRuntimeHealthStages)[number];
export type CanonicalFounderRuntimeHealthResult = Readonly<{
  stage: CanonicalFounderRuntimeHealthStage;
  healthy: boolean;
}>;

export function canonicalFounderRuntimeHealthReceipt(
  result: CanonicalFounderRuntimeHealthResult,
): Readonly<{ runtime: boolean; runtimeStage?: Exclude<CanonicalFounderRuntimeHealthStage, "PASS"> }> {
  return result.stage === "PASS" ? { runtime: true } : { runtime: false, runtimeStage: result.stage };
}

/** Strong read/decode health check for the owner-resolved current Runtime. */
export async function inspectCanonicalFounderRuntimeHealth(
  sql: Sql<Record<string, unknown>>,
  environment: NodeJS.ProcessEnv = process.env,
  injected?: Partial<Dependencies>,
): Promise<CanonicalFounderRuntimeHealthResult> {
  const dependencies: Dependencies = {
    resolveFounder: resolveCanonicalFounderIdentity,
    runtime: (connection) => new PostgresOrganizationRuntimeRepository(connection),
    ...injected,
  };
  let founder: { organizationId: string };
  try {
    founder = await dependencies.resolveFounder(sql);
  } catch {
    return { stage: "FOUNDER_IDENTITY_READ", healthy: false };
  }
  let runtime: Pick<PostgresOrganizationRuntimeRepository, "read">;
  try {
    runtime = dependencies.runtime(sql);
  } catch {
    return { stage: "POSTGRES_REPOSITORY_CONSTRUCTION", healthy: false };
  }
  let stored: StoredOrganizationRuntime | null;
  try {
    stored = await runtime.read(founder.organizationId);
  } catch {
    return { stage: "POSTGRES_RUNTIME_READ_OR_DECODE", healthy: false };
  }
  if (!stored) return { stage: "POSTGRES_RUNTIME_ABSENT", healthy: false };
  try {
    if (stored.runtime.metadata.organizationId !== founder.organizationId) {
      return { stage: "METADATA_IDENTITY_COMPARE", healthy: false };
    }
  } catch {
    return { stage: "POSTGRES_RUNTIME_READ_OR_DECODE", healthy: false };
  }
  return { stage: "PASS", healthy: true };
}

/** Compatibility boolean for callers that need only readiness. */
export async function canonicalFounderRuntimeHealthy(
  sql: Sql<Record<string, unknown>>,
  environment: NodeJS.ProcessEnv = process.env,
  injected?: Partial<Dependencies>,
): Promise<boolean> {
  return (await inspectCanonicalFounderRuntimeHealth(sql, environment, injected)).healthy;
}
