import { createHash } from "node:crypto";

import type {
  CanonicalEvidenceAdmissionOperationBatchV1,
  CanonicalScopeLineageIndex,
} from "./canonicalScopeLineage";

export const CANONICAL_DERIVED_ANCESTRY_VERSION = "1" as const;
export const CANONICAL_DERIVED_ANCESTRY_POLICY =
  "conservative-material-ancestor.v1" as const;
export const MAX_CANONICAL_ANCESTRY_DEPTH = 64;
export const MAX_CANONICAL_ANCESTOR_REFS = 64;
export const MAX_CANONICAL_MATERIAL_SUPPORTS = 4096;

export type CanonicalMaterialSupportRole =
  | "material"
  | "contradictory-material";

export type CanonicalMaterialEvidenceSupportV1 = {
  canonicalEvidenceId: string;
  canonicalAdmissionId: string;
  attributionId: string;
  attributionRevision: number;
  attributionDigest: string;
  sourceBindingRefs: Array<{
    sourceBindingId: string;
    sourceGovernanceRevision: string;
  }>;
  purposeRefs: string[];
  topologyId: string;
  originBatchDigest: string;
  role: CanonicalMaterialSupportRole;
};

export type CanonicalMaterialAncestorReferenceV1 = {
  derivedArtifactType: "organizational-theory";
  derivedArtifactId: string;
  derivedArtifactRevisionId: string;
  ancestryDigest: string;
  supportRole: CanonicalMaterialSupportRole;
};

export type CanonicalDerivedArtifactGovernanceAncestryV1 = {
  contractVersion: typeof CANONICAL_DERIVED_ANCESTRY_VERSION;
  organizationId: string;
  derivedArtifactType: "organizational-theory";
  derivedArtifactId: string;
  derivedArtifactRevisionId: string;
  predecessorAncestryDigest: string | null;
  directMaterialSupports: CanonicalMaterialEvidenceSupportV1[];
  inheritedMaterialAncestorRefs: CanonicalMaterialAncestorReferenceV1[];
  transitiveMaterialSupports: CanonicalMaterialEvidenceSupportV1[];
  topologyIds: string[];
  purposeRefs: string[];
  ancestryDepth: number;
  lineagePolicyVersion: typeof CANONICAL_DERIVED_ANCESTRY_POLICY;
  ancestryDigest: string;
};

export type CanonicalAncestryConstructionContext = {
  organizationId: string;
  operationBatch: CanonicalEvidenceAdmissionOperationBatchV1;
  scopeLineageIndex: CanonicalScopeLineageIndex;
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

export function stableCanonicalAncestryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableCanonicalAncestryValue).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compare(left, right))
      .map(
        ([key, item]) =>
          `${JSON.stringify(key)}:${stableCanonicalAncestryValue(item)}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
export function canonicalAncestryDigest(value: unknown): string {
  return createHash("sha256")
    .update(stableCanonicalAncestryValue(value))
    .digest("hex");
}

function exact(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.trim() === value &&
    value !== "*"
  );
}

function normalizeStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compare);
}

function supportKey(value: CanonicalMaterialEvidenceSupportV1): string {
  return stableCanonicalAncestryValue({
    canonicalEvidenceId: value.canonicalEvidenceId,
    canonicalAdmissionId: value.canonicalAdmissionId,
    attributionId: value.attributionId,
    attributionRevision: value.attributionRevision,
    attributionDigest: value.attributionDigest,
    sourceBindingRefs: value.sourceBindingRefs,
    topologyId: value.topologyId,
    originBatchDigest: value.originBatchDigest,
    role: value.role,
  });
}

function normalizeSupports(
  values: readonly CanonicalMaterialEvidenceSupportV1[],
): CanonicalMaterialEvidenceSupportV1[] {
  const byKey = new Map<string, CanonicalMaterialEvidenceSupportV1>();
  for (const value of values) {
    const normalized = {
      ...value,
      sourceBindingRefs: [...value.sourceBindingRefs]
        .sort((left, right) =>
          compare(left.sourceBindingId, right.sourceBindingId),
        ),
      purposeRefs: normalizeStrings(value.purposeRefs),
    };
    const key = supportKey(normalized);
    const existing = byKey.get(key);
    byKey.set(key, {
      ...normalized,
      purposeRefs: normalizeStrings([
        ...(existing?.purposeRefs ?? []),
        ...normalized.purposeRefs,
      ]),
    });
  }
  return [...byKey.values()].sort((left, right) =>
    compare(supportKey(left), supportKey(right)),
  );
}

function validateSupport(
  support: CanonicalMaterialEvidenceSupportV1,
): void {
  if (
    !exact(support.canonicalEvidenceId) ||
    !exact(support.canonicalAdmissionId) ||
    !exact(support.attributionId) ||
    !Number.isInteger(support.attributionRevision) ||
    support.attributionRevision < 1 ||
    !exact(support.attributionDigest) ||
    !exact(support.topologyId) ||
    !exact(support.originBatchDigest) ||
    !["material", "contradictory-material"].includes(support.role) ||
    support.sourceBindingRefs.length === 0 ||
    support.sourceBindingRefs.some(
      (reference) =>
        !exact(reference.sourceBindingId) ||
        !exact(reference.sourceGovernanceRevision),
    ) ||
    support.purposeRefs.some((purpose) => !exact(purpose))
  ) throw new Error("Canonical material support is invalid.");
}

function normalizeAncestorRefs(
  values: readonly CanonicalMaterialAncestorReferenceV1[],
): CanonicalMaterialAncestorReferenceV1[] {
  const byIdentity = new Map<string, CanonicalMaterialAncestorReferenceV1>();
  for (const value of values) {
    const identity = stableCanonicalAncestryValue([
      value.derivedArtifactType,
      value.derivedArtifactId,
      value.derivedArtifactRevisionId,
      value.supportRole,
    ]);
    const prior = byIdentity.get(identity);
    if (prior && prior.ancestryDigest !== value.ancestryDigest) {
      throw new Error("Ambiguous canonical material ancestor revision.");
    }
    byIdentity.set(identity, value);
  }
  return [...byIdentity.values()].sort((left, right) =>
    compare(stableCanonicalAncestryValue(left), stableCanonicalAncestryValue(right)),
  );
}

export function resolveCanonicalMaterialSupports(input: {
  context: CanonicalAncestryConstructionContext;
  localEvidenceRoles: readonly {
    localEvidenceId: string;
    role: CanonicalMaterialSupportRole;
  }[];
}): CanonicalMaterialEvidenceSupportV1[] {
  const { context } = input;
  if (
    context.operationBatch.organizationId !== context.organizationId ||
    context.scopeLineageIndex.organizationId !== context.organizationId
  ) {
    throw new Error("Canonical ancestry organization mismatch.");
  }
  const attributions = new Map(
    context.scopeLineageIndex.evidenceAttributions.map((value) => [
      value.attributionId,
      value,
    ]),
  );
  const bindings = new Map(
    context.scopeLineageIndex.sourceBindings.map((value) => [
      value.bindingId,
      value,
    ]),
  );
  const byLocal = new Map<
    string,
    CanonicalEvidenceAdmissionOperationBatchV1["admissions"][number]
  >();
  for (const admission of context.operationBatch.admissions) {
    for (const localId of admission.investigationEvidenceIds) {
      if (byLocal.has(localId)) {
        throw new Error("Ambiguous investigation-local Evidence mapping.");
      }
      byLocal.set(localId, admission);
    }
  }

  const supports = input.localEvidenceRoles.map(({ localEvidenceId, role }) => {
    const admission = byLocal.get(localEvidenceId);
    if (!admission) {
      throw new Error("Material canonical Evidence ancestry is incomplete.");
    }
    const attribution = attributions.get(admission.attributionId);
    if (
      !attribution ||
      attribution.organizationId !== context.organizationId ||
      attribution.evidenceId !== admission.canonicalEvidenceId ||
      attribution.evidenceAdmissionId !== admission.canonicalAdmissionId ||
      attribution.attributionVersion !== admission.attributionVersion ||
      attribution.digest !== admission.attributionDigest
    ) {
      throw new Error("Canonical Evidence attribution ancestry mismatch.");
    }
    const purposeRefs = new Set<string>();
    const sourceBindingRefs = admission.sourceBindings.map((reference) => {
      const binding = bindings.get(reference.sourceBindingId);
      if (
        !binding ||
        binding.organizationId !== context.organizationId ||
        binding.availability === "revoked" ||
        binding.digest.length === 0
      ) {
        throw new Error("Material Source Binding ancestry is unavailable.");
      }
      if (binding.purposeRef) purposeRefs.add(binding.purposeRef);
      return {
        sourceBindingId: binding.bindingId,
        sourceGovernanceRevision: binding.digest,
      };
    });
    return {
      canonicalEvidenceId: admission.canonicalEvidenceId,
      canonicalAdmissionId: admission.canonicalAdmissionId,
      attributionId: admission.attributionId,
      attributionRevision: admission.attributionVersion,
      attributionDigest: admission.attributionDigest,
      sourceBindingRefs,
      purposeRefs: [...purposeRefs],
      topologyId: context.scopeLineageIndex.topologyId,
      originBatchDigest: context.operationBatch.batchDigest,
      role,
    };
  });
  return normalizeSupports(supports);
}

export function createCanonicalDerivedArtifactGovernanceAncestry(input: {
  organizationId: string;
  derivedArtifactType: "organizational-theory";
  derivedArtifactId: string;
  revisionBasis: unknown;
  directMaterialSupports: readonly CanonicalMaterialEvidenceSupportV1[];
  inheritedMaterialAncestors?: readonly CanonicalDerivedArtifactGovernanceAncestryV1[];
  supportRole?: CanonicalMaterialSupportRole;
}): CanonicalDerivedArtifactGovernanceAncestryV1 {
  const inherited = input.inheritedMaterialAncestors ?? [];
  for (const ancestry of inherited) {
    validateCanonicalDerivedArtifactGovernanceAncestry(ancestry);
    if (ancestry.organizationId !== input.organizationId) {
      throw new Error("Cross-organization material ancestry.");
    }
    if (
      ancestry.derivedArtifactId !== input.derivedArtifactId &&
      ancestry.inheritedMaterialAncestorRefs.some(
        (reference) =>
          reference.derivedArtifactType === input.derivedArtifactType &&
          reference.derivedArtifactId === input.derivedArtifactId,
      )
    ) {
      throw new Error("Canonical derived ancestry cycle.");
    }
  }
  const inheritedMaterialAncestorRefs = normalizeAncestorRefs(
    inherited.map((ancestry) => ({
      derivedArtifactType: ancestry.derivedArtifactType,
      derivedArtifactId: ancestry.derivedArtifactId,
      derivedArtifactRevisionId: ancestry.derivedArtifactRevisionId,
      ancestryDigest: ancestry.ancestryDigest,
      supportRole: input.supportRole ?? "material",
    })),
  );
  if (inheritedMaterialAncestorRefs.length > MAX_CANONICAL_ANCESTOR_REFS) {
    throw new Error("Canonical material ancestor cardinality exceeded.");
  }
  const ancestryDepth = Math.max(
    1,
    ...inherited.map((ancestry) => ancestry.ancestryDepth + 1),
  );
  if (ancestryDepth > MAX_CANONICAL_ANCESTRY_DEPTH) {
    throw new Error("Canonical material ancestry depth exceeded.");
  }
  const directMaterialSupports = normalizeSupports(input.directMaterialSupports);
  const transitiveMaterialSupports = normalizeSupports([
    ...directMaterialSupports,
    ...inherited.flatMap((ancestry) => ancestry.transitiveMaterialSupports),
  ]);
  if (
    directMaterialSupports.length === 0 ||
    transitiveMaterialSupports.length > MAX_CANONICAL_MATERIAL_SUPPORTS
  ) {
    throw new Error("Canonical material support ancestry is incomplete or excessive.");
  }
  const derivedArtifactRevisionId = `theory-governance-revision:${canonicalAncestryDigest({
    organizationId: input.organizationId,
    derivedArtifactId: input.derivedArtifactId,
    revisionBasis: input.revisionBasis,
    predecessorAncestryDigest: inherited[0]?.ancestryDigest ?? null,
    directMaterialSupports,
  })}`;
  const unsigned = {
    contractVersion: CANONICAL_DERIVED_ANCESTRY_VERSION,
    organizationId: input.organizationId,
    derivedArtifactType: input.derivedArtifactType,
    derivedArtifactId: input.derivedArtifactId,
    derivedArtifactRevisionId,
    predecessorAncestryDigest: inherited[0]?.ancestryDigest ?? null,
    directMaterialSupports,
    inheritedMaterialAncestorRefs,
    transitiveMaterialSupports,
    topologyIds: normalizeStrings(
      transitiveMaterialSupports.map((support) => support.topologyId),
    ),
    purposeRefs: normalizeStrings(
      transitiveMaterialSupports.flatMap((support) => support.purposeRefs),
    ),
    ancestryDepth,
    lineagePolicyVersion: CANONICAL_DERIVED_ANCESTRY_POLICY,
  };
  const ancestry = {
    ...unsigned,
    ancestryDigest: canonicalAncestryDigest(unsigned),
  };
  validateCanonicalDerivedArtifactGovernanceAncestry(ancestry);
  return ancestry;
}

export function validateCanonicalDerivedArtifactGovernanceAncestry(
  value: CanonicalDerivedArtifactGovernanceAncestryV1,
): void {
  if (
    value.contractVersion !== CANONICAL_DERIVED_ANCESTRY_VERSION ||
    value.derivedArtifactType !== "organizational-theory" ||
    !exact(value.organizationId) ||
    !exact(value.derivedArtifactId) ||
    !exact(value.derivedArtifactRevisionId) ||
    value.lineagePolicyVersion !== CANONICAL_DERIVED_ANCESTRY_POLICY ||
    value.ancestryDepth < 1 ||
    value.ancestryDepth > MAX_CANONICAL_ANCESTRY_DEPTH ||
    value.inheritedMaterialAncestorRefs.length > MAX_CANONICAL_ANCESTOR_REFS ||
    value.transitiveMaterialSupports.length === 0 ||
    value.transitiveMaterialSupports.length > MAX_CANONICAL_MATERIAL_SUPPORTS
  ) {
    throw new Error("Canonical derived governance ancestry is incomplete.");
  }
  value.directMaterialSupports.forEach(validateSupport);
  value.transitiveMaterialSupports.forEach(validateSupport);
  for (const reference of value.inheritedMaterialAncestorRefs) {
    if (
      reference.derivedArtifactType !== "organizational-theory" ||
      !exact(reference.derivedArtifactId) ||
      !exact(reference.derivedArtifactRevisionId) ||
      !exact(reference.ancestryDigest) ||
      !["material", "contradictory-material"].includes(reference.supportRole)
    ) throw new Error("Canonical material ancestor reference is invalid.");
  }
  if (
    stableCanonicalAncestryValue(normalizeSupports(value.directMaterialSupports)) !==
      stableCanonicalAncestryValue(value.directMaterialSupports) ||
    stableCanonicalAncestryValue(
      normalizeSupports(value.transitiveMaterialSupports),
    ) !== stableCanonicalAncestryValue(value.transitiveMaterialSupports) ||
    stableCanonicalAncestryValue(
      normalizeAncestorRefs(value.inheritedMaterialAncestorRefs),
    ) !== stableCanonicalAncestryValue(value.inheritedMaterialAncestorRefs) ||
    stableCanonicalAncestryValue(normalizeStrings(value.topologyIds)) !==
      stableCanonicalAncestryValue(value.topologyIds) ||
    stableCanonicalAncestryValue(normalizeStrings(value.purposeRefs)) !==
      stableCanonicalAncestryValue(value.purposeRefs)
  ) {
    throw new Error("Canonical derived governance ancestry is not normalized.");
  }
  if (
    value.inheritedMaterialAncestorRefs.some(
      (reference) =>
        reference.derivedArtifactId === value.derivedArtifactId &&
        reference.derivedArtifactRevisionId === value.derivedArtifactRevisionId,
    )
  ) {
    throw new Error("Canonical derived ancestry self-cycle.");
  }
  const { ancestryDigest, ...unsigned } = value;
  if (ancestryDigest !== canonicalAncestryDigest(unsigned)) {
    throw new Error("Canonical derived governance ancestry integrity failed.");
  }
}

/** Validates exact persisted ancestor objects, including cycles and diamonds. */
export function validateCanonicalDerivedArtifactGovernanceAncestryGraph(input: {
  root: CanonicalDerivedArtifactGovernanceAncestryV1;
  ancestors: readonly CanonicalDerivedArtifactGovernanceAncestryV1[];
}): void {
  const byRevision = new Map<string, CanonicalDerivedArtifactGovernanceAncestryV1>();
  for (const ancestry of [input.root, ...input.ancestors]) {
    validateCanonicalDerivedArtifactGovernanceAncestry(ancestry);
    const prior = byRevision.get(ancestry.derivedArtifactRevisionId);
    if (prior && prior.ancestryDigest !== ancestry.ancestryDigest) {
      throw new Error("Ambiguous canonical material ancestor revision.");
    }
    byRevision.set(ancestry.derivedArtifactRevisionId, ancestry);
  }
  const active = new Set<string>();
  const complete = new Set<string>();
  const visit = (
    ancestry: CanonicalDerivedArtifactGovernanceAncestryV1,
    depth: number,
  ): void => {
    if (depth > MAX_CANONICAL_ANCESTRY_DEPTH) {
      throw new Error("Canonical material ancestry depth exceeded.");
    }
    if (active.has(ancestry.derivedArtifactRevisionId)) {
      throw new Error("Canonical derived ancestry cycle.");
    }
    if (complete.has(ancestry.derivedArtifactRevisionId)) return;
    active.add(ancestry.derivedArtifactRevisionId);
    for (const reference of ancestry.inheritedMaterialAncestorRefs) {
      const ancestor = byRevision.get(reference.derivedArtifactRevisionId);
      if (
        !ancestor ||
        ancestor.organizationId !== ancestry.organizationId ||
        ancestor.derivedArtifactType !== reference.derivedArtifactType ||
        ancestor.derivedArtifactId !== reference.derivedArtifactId ||
        ancestor.ancestryDigest !== reference.ancestryDigest ||
        ancestor.contractVersion !== "1"
      ) throw new Error("Canonical material ancestor revision is stale or invalid.");
      visit(ancestor, depth + 1);
    }
    active.delete(ancestry.derivedArtifactRevisionId);
    complete.add(ancestry.derivedArtifactRevisionId);
  };
  visit(input.root, 1);
}

export function normalizeCanonicalMaterialSupports(
  values: readonly CanonicalMaterialEvidenceSupportV1[],
): CanonicalMaterialEvidenceSupportV1[] {
  return normalizeSupports(values);
}
