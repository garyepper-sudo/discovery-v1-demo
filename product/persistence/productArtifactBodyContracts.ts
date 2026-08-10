import { createHash } from "node:crypto";

export const PRODUCT_ARTIFACT_BODY_CONTRACT_VERSION = "1" as const;

export type PersistedProductArtifactTypeV1 =
  | "prepared-work"
  | "frozen-snapshot"
  | "what-changed"
  | "product-decision-draft";

export type ProductArtifactSemanticOwnerV1 = "leadership-conversation" | "product-decision-draft";

export type ProductArtifactBodyRefV1 = {
  contractVersion: "1";
  organizationId: string;
  semanticOwner: ProductArtifactSemanticOwnerV1;
  artifactType: PersistedProductArtifactTypeV1;
  artifactId: string;
  artifactRevision: string;
  bodyId: string;
  exactBodyDigest: string;
  byteLength: number;
  mediaType: "application/json";
  schemaRef: string;
  refDigest: string;
};

export type ProductArtifactBodyStageRequestV1 = Omit<
  ProductArtifactBodyRefV1,
  "contractVersion" | "bodyId" | "exactBodyDigest" | "byteLength" | "mediaType" | "refDigest"
> & { contractVersion: "1"; bytes: Uint8Array };

export type ProductArtifactBodyStageReceiptV1 = {
  contractVersion: "1";
  body: ProductArtifactBodyRefV1;
  disposition: "staged" | "exact-replay";
  receiptDigest: string;
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value instanceof Uint8Array) return Buffer.from(value).toString("base64");
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function productArtifactBodyDigest(value: string | Uint8Array | unknown): string {
  const bytes = value instanceof Uint8Array
    ? value
    : new TextEncoder().encode(typeof value === "string" ? value : stable(value));
  return createHash("sha256").update(bytes).digest("hex");
}

function exact(value: string): boolean {
  return value.length > 0 && value.trim() === value && value !== "*" && !value.includes("\0");
}

export function createProductArtifactBodyRefV1(
  input: Omit<ProductArtifactBodyRefV1, "contractVersion" | "bodyId" | "refDigest">,
): ProductArtifactBodyRefV1 {
  const identity = { contractVersion: "1" as const, ...input };
  const bodyId = `product-artifact-body:${productArtifactBodyDigest(identity)}`;
  const unsigned = { ...identity, bodyId };
  return { ...unsigned, refDigest: productArtifactBodyDigest(unsigned) };
}

export function validateProductArtifactBodyRefV1(value: ProductArtifactBodyRefV1): void {
  const { refDigest, ...unsigned } = value;
  const types: readonly string[] = ["prepared-work", "frozen-snapshot", "what-changed", "product-decision-draft"];
  if (
    value.contractVersion !== "1" ||
    !types.includes(value.artifactType) ||
    ![value.organizationId, value.artifactId, value.artifactRevision, value.schemaRef].every(exact) ||
    !/^product-artifact-body:[a-f0-9]{64}$/.test(value.bodyId) ||
    !/^[a-f0-9]{64}$/.test(value.exactBodyDigest) ||
    !Number.isSafeInteger(value.byteLength) || value.byteLength < 0 ||
    value.mediaType !== "application/json" ||
    refDigest !== productArtifactBodyDigest(unsigned)
  ) throw new Error("Product artifact body reference is invalid.");
}

export function serializeProductArtifactBodyV1(value: unknown): Uint8Array {
  return new TextEncoder().encode(stable(value));
}
