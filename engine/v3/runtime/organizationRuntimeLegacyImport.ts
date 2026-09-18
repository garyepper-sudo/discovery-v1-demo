import { createHash } from "node:crypto";

import {
  type PostgresRuntimeCreateBoundary,
  RuntimeStorageConflictError,
  RuntimeStorageIntegrityError,
  type OrganizationRuntimeRepository,
} from "./organizationRuntimeRepository";

export type OrganizationRuntimeLegacyImportResult =
  | { disposition: "IMPORTED"; organizationId: string; payloadDigest: string; revision: string }
  | { disposition: "ALREADY_IMPORTED"; organizationId: string; payloadDigest: string; revision: string };

const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const observeBoundary = (
  observer: ((boundary: "legacy-read" | "destination-read" | "destination-create") => void) | undefined,
  boundary: "legacy-read" | "destination-read" | "destination-create",
): void => { try { observer?.(boundary); } catch {} };

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
    /** Optional observability hook; it never affects import control flow. */
    onBoundary?: (boundary: "legacy-read" | "destination-read" | "destination-create") => void;
    /** Optional PostgreSQL create observability; it never affects import control flow. */
    onCreateBoundary?: (boundary: PostgresRuntimeCreateBoundary) => void;
  }>,
): Promise<OrganizationRuntimeLegacyImportResult> {
  observeBoundary(input.onBoundary, "legacy-read");
  const legacy = await input.legacy.read(input.organizationId);
  if (!legacy) throw new RuntimeStorageIntegrityError("Legacy Runtime is missing");
  const legacyDigest = digest(legacy.bytes);
  observeBoundary(input.onBoundary, "destination-read");
  const current = await input.destination.read(input.organizationId);
  if (current) {
    if (digest(current.bytes) !== legacyDigest) {
      throw new RuntimeStorageConflictError("Runtime import destination already differs");
    }
    return { disposition: "ALREADY_IMPORTED", organizationId: input.organizationId, payloadDigest: legacyDigest, revision: current.revision };
  }
  try {
    observeBoundary(input.onBoundary, "destination-create");
    const imported = await input.destination.create(input.organizationId, legacy.bytes, {
      requestId: input.requestId,
      operatorId: input.operatorId,
      writerClass: "RuntimeProvisioningRecovery",
      onPostgresRuntimeCreateBoundary: input.onCreateBoundary,
    });
    if (digest(imported.bytes) !== legacyDigest) {
      throw new RuntimeStorageIntegrityError("Runtime import payload mismatch");
    }
    return { disposition: "IMPORTED", organizationId: input.organizationId, payloadDigest: legacyDigest, revision: imported.revision };
  } catch (error) {
    if (!(error instanceof RuntimeStorageConflictError)) throw error;
    observeBoundary(input.onBoundary, "destination-read");
    const raced = await input.destination.read(input.organizationId);
    if (!raced || digest(raced.bytes) !== legacyDigest) throw error;
    return { disposition: "ALREADY_IMPORTED", organizationId: input.organizationId, payloadDigest: legacyDigest, revision: raced.revision };
  }
}
