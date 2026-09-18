import { createHash } from "node:crypto";

import {
  RuntimeStorageConflictError,
  RuntimeStorageIntegrityError,
  type OrganizationRuntimeRepository,
} from "./organizationRuntimeRepository";

export type OrganizationRuntimeLegacyImportResult =
  | { disposition: "IMPORTED"; organizationId: string; payloadDigest: string; revision: string }
  | { disposition: "ALREADY_IMPORTED"; organizationId: string; payloadDigest: string; revision: string };

const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

/**
 * Explicit one-time cutover only.  Blob is read as immutable recovery evidence;
 * PostgreSQL remains the only destination for mutable current Runtime state.
 */
export async function importLegacyOrganizationRuntime(
  input: Readonly<{
    organizationId: string;
    legacy: Pick<OrganizationRuntimeRepository, "read">;
    destination: Pick<OrganizationRuntimeRepository, "read" | "create">;
    requestId: string;
    operatorId: string;
  }>,
): Promise<OrganizationRuntimeLegacyImportResult> {
  const legacy = await input.legacy.read(input.organizationId);
  if (!legacy) throw new RuntimeStorageIntegrityError("Legacy Runtime is missing");
  const legacyDigest = digest(legacy.bytes);
  const current = await input.destination.read(input.organizationId);
  if (current) {
    if (digest(current.bytes) !== legacyDigest) {
      throw new RuntimeStorageConflictError("Runtime import destination already differs");
    }
    return { disposition: "ALREADY_IMPORTED", organizationId: input.organizationId, payloadDigest: legacyDigest, revision: current.revision };
  }
  try {
    const imported = await input.destination.create(input.organizationId, legacy.bytes, {
      requestId: input.requestId,
      operatorId: input.operatorId,
      writerClass: "RuntimeProvisioningRecovery",
    });
    if (digest(imported.bytes) !== legacyDigest) {
      throw new RuntimeStorageIntegrityError("Runtime import payload mismatch");
    }
    return { disposition: "IMPORTED", organizationId: input.organizationId, payloadDigest: legacyDigest, revision: imported.revision };
  } catch (error) {
    if (!(error instanceof RuntimeStorageConflictError)) throw error;
    const raced = await input.destination.read(input.organizationId);
    if (!raced || digest(raced.bytes) !== legacyDigest) throw error;
    return { disposition: "ALREADY_IMPORTED", organizationId: input.organizationId, payloadDigest: legacyDigest, revision: raced.revision };
  }
}
