import { createHash } from "node:crypto";

export const LIVING_ORGANIZATION_RECONSTRUCTION_INPUT_VERSION =
  "living-organization-reconstruction-input/v1" as const;

export type ReconstructionScopeAssertion = {
  relationship: string;
  scope: {
    organizationId: string;
    type: string;
    id: string;
  };
};

export type ReconstructionSourceBinding = {
  bindingId: string;
  topologyId: string;
  assertions: ReconstructionScopeAssertion[];
};

export type ReconstructionInputRecord = {
  logicalSourceId: string;
  sourceVersion: string;
  batchId: string;
  effectiveAt: string;
  sourceType: string;
  sourceRole: string;
  content: string;
  normalizedContentDigest: string;
  binding: ReconstructionSourceBinding | null;
  controlDisposition: string;
  duplicateOf: string | null;
  formattingEquivalentTo: string | null;
};

export type LivingOrganizationReconstructionInputSnapshot = {
  contractVersion: typeof LIVING_ORGANIZATION_RECONSTRUCTION_INPUT_VERSION;
  organizationId: string;
  topologyId: string;
  topologyVersion: number;
  records: ReconstructionInputRecord[];
};

type SnapshotInput = Omit<LivingOrganizationReconstructionInputSnapshot, "contractVersion">;

function exact(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

const compareText = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

export function normalizeReconstructionContent(value: string): string {
  return value
    .replace(/\u0000/gu, "")
    .replace(/\r\n?/gu, "\n")
    .replace(/[ \t]+$/gmu, "")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function normalizeAssertion(value: ReconstructionScopeAssertion): ReconstructionScopeAssertion {
  return {
    relationship: exact(value.relationship, "Scope relationship"),
    scope: {
      organizationId: exact(value.scope.organizationId, "Scope organization"),
      type: exact(value.scope.type, "Scope type"),
      id: exact(value.scope.id, "Scope id"),
    },
  };
}

function normalizeBinding(value: ReconstructionSourceBinding | null): ReconstructionSourceBinding | null {
  if (!value) return null;
  return {
    bindingId: exact(value.bindingId, "Binding id"),
    topologyId: exact(value.topologyId, "Binding topology id"),
    assertions: value.assertions
      .map(normalizeAssertion)
      .sort((left, right) => compareText(
        `${left.relationship}\u001f${left.scope.organizationId}\u001f${left.scope.type}\u001f${left.scope.id}`,
        `${right.relationship}\u001f${right.scope.organizationId}\u001f${right.scope.type}\u001f${right.scope.id}`,
      )),
  };
}

function normalizeRecord(value: ReconstructionInputRecord): ReconstructionInputRecord {
  const effectiveAt = new Date(value.effectiveAt);
  if (Number.isNaN(effectiveAt.getTime())) throw new Error("Record effectiveAt must be an ISO timestamp.");
  return {
    logicalSourceId: exact(value.logicalSourceId, "Logical source id"),
    sourceVersion: exact(value.sourceVersion, "Source version"),
    batchId: exact(value.batchId, "Batch id"),
    effectiveAt: effectiveAt.toISOString(),
    sourceType: exact(value.sourceType, "Source type"),
    sourceRole: exact(value.sourceRole, "Source role"),
    content: normalizeReconstructionContent(value.content),
    normalizedContentDigest: exact(value.normalizedContentDigest, "Normalized content digest").toLowerCase(),
    binding: normalizeBinding(value.binding),
    controlDisposition: exact(value.controlDisposition, "Control disposition"),
    duplicateOf: value.duplicateOf ? exact(value.duplicateOf, "Duplicate source id") : null,
    formattingEquivalentTo: value.formattingEquivalentTo
      ? exact(value.formattingEquivalentTo, "Formatting-equivalent source id")
      : null,
  };
}

export function buildLivingOrganizationReconstructionInputSnapshot(
  input: SnapshotInput,
): LivingOrganizationReconstructionInputSnapshot {
  if (!Number.isInteger(input.topologyVersion) || input.topologyVersion < 1) {
    throw new Error("Topology version must be a positive integer.");
  }
  const records = input.records.map(normalizeRecord).sort((left, right) =>
    compareText(left.logicalSourceId, right.logicalSourceId));
  if (new Set(records.map((record) => record.logicalSourceId)).size !== records.length) {
    throw new Error("Logical source ids must be unique.");
  }
  return {
    contractVersion: LIVING_ORGANIZATION_RECONSTRUCTION_INPUT_VERSION,
    organizationId: exact(input.organizationId, "Organization id"),
    topologyId: exact(input.topologyId, "Topology id"),
    topologyVersion: input.topologyVersion,
    records,
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compareText(left, right))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

export function serializeLivingOrganizationReconstructionInputSnapshot(
  snapshot: LivingOrganizationReconstructionInputSnapshot,
): Uint8Array {
  return Buffer.from(`${JSON.stringify(canonicalize(snapshot))}\n`, "utf8");
}

export function digestLivingOrganizationReconstructionInputSnapshot(
  snapshot: LivingOrganizationReconstructionInputSnapshot,
): string {
  return createHash("sha256")
    .update(serializeLivingOrganizationReconstructionInputSnapshot(snapshot))
    .digest("hex");
}
