import { createHash } from "node:crypto";

export const CANONICAL_SERIALIZATION_VERSION = "canonical-serialization/v1" as const;

function canonicalize(value: unknown): unknown {
  if (value === undefined) throw new Error("Canonical serialization rejects undefined values.");
  if (typeof value === "number" && (!Number.isFinite(value) || Object.is(value, -0))) throw new Error("Canonical serialization rejects non-finite numbers and negative zero.");
  if (["bigint", "function", "symbol"].includes(typeof value)) throw new Error(`Canonical serialization rejects ${typeof value} values.`);
  if (Array.isArray(value)) return value.map(canonicalize).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, canonicalize(item)]));
  return value;
}

export const canonicalSerialize = (value: unknown): string => JSON.stringify(canonicalize(value));
export const canonicalHash = (value: unknown): string => createHash("sha256").update(canonicalSerialize(value)).digest("hex");
