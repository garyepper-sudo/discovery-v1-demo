import "server-only";

import { createHash } from "node:crypto";
import type { Sql } from "postgres";

import { resolveOrganizationIdentityByCreationKey, type OrganizationIdentityV1 } from "./organizationIdentityOwner";

/** Immutable lineage already used by the production founder bootstrap operation. */
export const canonicalFounderBootstrapCreationKey = "founder-production-smoke:asterline-software-synthetic-test:v2";
export const canonicalFounderFingerprint = "778c8abe00afa2ac";

const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);

/** Resolves only the existing, owner-issued canonical founder organization. */
export async function resolveCanonicalFounderIdentity(
  sql: Sql<Record<string, unknown>>,
  resolve: typeof resolveOrganizationIdentityByCreationKey = resolveOrganizationIdentityByCreationKey,
): Promise<OrganizationIdentityV1> {
  const identity = await resolve(sql, canonicalFounderBootstrapCreationKey);
  if (!identity || !/^[A-Za-z0-9_-]+$/u.test(identity.organizationId) || fingerprint(identity.organizationId) !== canonicalFounderFingerprint) {
    throw new Error("Canonical founder identity is unavailable.");
  }
  return identity;
}
