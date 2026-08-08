import { createHash } from "node:crypto";

export const PERSISTENCE_SAFE_ACTOR_REFERENCE_VERSION = "1" as const;

export type PersistenceSafeActorReferenceV1 = {
  contractVersion: "1";
  mappingId: string;
  mappingRevision: number;
  actorRef: string;
  organizationId: string;
  owner: "alpha-access";
  status: "active" | "revoked";
  assignedAt: string;
  revokedAt?: string;
  predecessorMappingId?: string;
  resultDigest: string;
};

const stable = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`
    : JSON.stringify(value);
const digest = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
const exact = (value: string): boolean => value.length > 0 && value.trim() === value && value !== "*";

export function persistenceSafeActorReference(input: Omit<PersistenceSafeActorReferenceV1, "contractVersion" | "owner" | "resultDigest">): PersistenceSafeActorReferenceV1 {
  if (!exact(input.mappingId) || !/^actor:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(input.actorRef)
    || !exact(input.organizationId) || input.mappingRevision < 1 || !Number.isInteger(input.mappingRevision)
    || !Number.isFinite(Date.parse(input.assignedAt)) || (input.status === "revoked" && (!input.revokedAt || !Number.isFinite(Date.parse(input.revokedAt))))) {
    throw new Error("Persistence-safe actor reference is invalid.");
  }
  const unsigned = { contractVersion: "1" as const, ...input, owner: "alpha-access" as const };
  return { ...unsigned, resultDigest: digest(unsigned) };
}

export function validatePersistenceSafeActorReference(value: PersistenceSafeActorReferenceV1): void {
  const { resultDigest, contractVersion, owner, ...input } = value;
  if (contractVersion !== "1" || owner !== "alpha-access" || persistenceSafeActorReference(input).resultDigest !== resultDigest) {
    throw new Error("Persistence-safe actor reference is invalid.");
  }
}
