import { createHash } from "node:crypto";

import {
  evaluateAuthorizedMetricLineage,
  type AuthorizedMetricResult,
  type ServerResolvedCanonicalMetric,
} from "../../engine/v3/governance/authorizedMetricLineage";
import type {
  GovernedScopeRef,
  GovernedSensitivity,
  ScopedGovernanceContext,
} from "../../engine/v3/governance/scopedGovernanceContext";
import {
  evaluateScopedUnderstandingDisclosure,
  type ScopedDisclosureDerivedKind,
  type ScopedDisclosureSupport,
} from "../../engine/v3/understanding/scopedOrganizationalUnderstandingDisclosure";
import {
  projectScopedDecisionCalibration,
  type ScopedDecisionCalibrationProjection,
  type ServerResolvedDecisionCalibrationInput,
} from "./scopedDecisionCalibrationProjection";
import { lineageSupportsRequestedScope, type CanonicalScopeLineageIndex } from "../../engine/v3/governance/canonicalScopeLineage";
import {
  canonicalUnderstandingCurrentEligibilityScopeDigest,
  validateCanonicalUnderstandingCurrentEligibilityResult,
  type CanonicalUnderstandingCurrentEligibilityResultV1,
} from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";

export const SCOPED_ORGANIZATIONAL_PRODUCT_PROJECTION_VERSION = "1";

export type ScopedProductItemKind =
  | "understanding"
  | "material-change"
  | "uncertainty"
  | "open-question"
  | "evidence-gap"
  | "investigation-opportunity"
  | "contradiction"
  | "objective-context"
  | "dependency"
  | "risk";

export type ServerResolvedScopedProductItem = {
  safeRef: string;
  canonicalObjectType: string;
  revisionRef?: string;
  organizationId: string;
  scope: GovernedScopeRef;
  sensitivity: GovernedSensitivity;
  kind: ScopedProductItemKind;
  disclosureKind: ScopedDisclosureDerivedKind;
  title: string;
  summary: string;
  uncertainty: string | null;
  support: ScopedDisclosureSupport[];
  supportLineageComplete: boolean;
  safeAbstractionAllowed: boolean;
  protectedCombination: boolean;
  auditRefs: string[];
};

export type ScopedProjectionRepositorySource = {
  organizationId: string;
  sourceRevisionRef: string;
  items: ServerResolvedScopedProductItem[];
  metrics: ServerResolvedCanonicalMetric[];
  metricCombinationPolicy: Array<{
    metricIds: ServerResolvedCanonicalMetric["metricId"][];
    safeAbstractionAllowed: boolean;
    policyRef: string;
  }>;
  decisionCalibration?: ServerResolvedDecisionCalibrationInput;
  currentEligibilityRequired?: boolean;
  currentEligibility?: CanonicalUnderstandingCurrentEligibilityResultV1;
};

export interface ScopedProjectionRepository {
  readAuthorizedSource(input: {
    organizationId: string;
    sourceRevisionRef?: string;
  }): ScopedProjectionRepositorySource | undefined;
}

/**
 * Canonical input-selection seam for Runtime-derived Product candidates.
 * Scope lineage filters candidates before projection; authority and disclosure
 * remain owned by the existing scoped governance/projection path.
 */
export function selectScopedProductItemsFromCanonicalLineage(input: {
  organizationId: string;
  requestedScope: GovernedScopeRef;
  items: readonly ServerResolvedScopedProductItem[];
  lineageIndex: CanonicalScopeLineageIndex | undefined;
}): ServerResolvedScopedProductItem[] {
  if (input.requestedScope.organizationId !== input.organizationId || !input.lineageIndex || input.lineageIndex.organizationId !== input.organizationId) return [];
  const lineageByRef = new Map(input.lineageIndex.derivedLineages.map(item => [item.derivedObjectRef, item]));
  return input.items
    .filter(item => item.organizationId === input.organizationId)
    .filter(item => {
      const lineage = lineageByRef.get(item.safeRef);
      return Boolean(lineage && lineageSupportsRequestedScope(lineage, input.requestedScope));
    })
    .map(item => structuredClone(item))
    .sort((left,right) => left.safeRef.localeCompare(right.safeRef));
}

export type ScopedProductProjectionItem = {
  safeRef: string;
  canonicalObjectType: string;
  revisionRef?: string;
  kind: ScopedProductItemKind;
  requestedScope: GovernedScopeRef;
  disposition: "disclosed" | "safely-abstracted";
  whyVisible: string;
  title?: string;
  summary?: string;
  uncertainty?: string | null;
  safeSupportingLineage: string[];
  auditRefs: string[];
  temporalMode: "current" | "historical";
};

export type ScopedProductProjection = {
  projectionId: string;
  contractVersion: typeof SCOPED_ORGANIZATIONAL_PRODUCT_PROJECTION_VERSION;
  organizationId: string;
  recipientId: string;
  requestedScope: GovernedScopeRef;
  purpose: string;
  evaluatedAt: string;
  temporalMode: "current" | "historical";
  sourceRevisionRef: string | null;
  disposition: "available" | "withheld" | "unavailable" | "insufficient-authorized-information";
  items: ScopedProductProjectionItem[];
  metrics: AuthorizedMetricResult[];
  decisionCalibration: ScopedDecisionCalibrationProjection | {
    disposition: "unavailable";
    reason: "canonical-input-unavailable";
  } | null;
  unavailableKinds: ScopedProductItemKind[];
  withheldItemCount: number | null;
  unsupportedCapabilities: Array<{
    capability: "decision-calibration";
    gapId: "GAP-MR-006";
    disposition: "unsupported-capability";
  }>;
  auditRefs: string[];
};

const compare = (left: string, right: string): number => left.localeCompare(right);

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compare(left, right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sameScope(left: GovernedScopeRef, right: GovernedScopeRef): boolean {
  return left.organizationId === right.organizationId && left.type === right.type && left.id === right.id;
}

function identity(value: unknown): string {
  return `scoped-product-projection:${createHash("sha256").update(stable(value)).digest("hex")}`;
}

function emptyProjection(
  context: ScopedGovernanceContext,
  disposition: ScopedProductProjection["disposition"],
): ScopedProductProjection {
  const safe = {
    contractVersion: SCOPED_ORGANIZATIONAL_PRODUCT_PROJECTION_VERSION as typeof SCOPED_ORGANIZATIONAL_PRODUCT_PROJECTION_VERSION,
    organizationId: context.organizationId,
    recipientId: context.subjectId,
    requestedScope: structuredClone(context.requestedScope),
    purpose: context.purpose,
    evaluatedAt: context.evaluatedAt,
    temporalMode: context.temporal.mode,
    sourceRevisionRef: null,
    disposition,
    items: [],
    metrics: [],
    decisionCalibration: null,
    unavailableKinds: [],
    withheldItemCount: null,
    unsupportedCapabilities: [{ capability: "decision-calibration" as const, gapId: "GAP-MR-006" as const, disposition: "unsupported-capability" as const }],
    auditRefs: [],
  };
  return { projectionId: identity(safe), ...safe };
}

/**
 * One server-side adapter for every recipient. Role labels are intentionally
 * absent; scope, authority, purpose, sensitivity, and current policy determine
 * all material differences.
 */
export function readScopedOrganizationalProductProjection(input: {
  authenticatedUserId: string;
  organizationId: string;
  context: ScopedGovernanceContext;
  repository: ScopedProjectionRepository;
}): ScopedProductProjection {
  const { context } = input;
  if (
    context.disposition !== "authorized" ||
    context.subjectId !== input.authenticatedUserId ||
    context.organizationId !== input.organizationId ||
    context.requestedScope.organizationId !== input.organizationId
  ) return emptyProjection(context, "withheld");

  const requestedRevision = context.temporal.mode === "historical" ? context.temporal.revisionRef : undefined;
  const source = input.repository.readAuthorizedSource({ organizationId: input.organizationId, sourceRevisionRef: requestedRevision });
  if (!source) return emptyProjection(context, "unavailable");
  if (source.organizationId !== input.organizationId) return emptyProjection(context, "withheld");
  if (requestedRevision && source.sourceRevisionRef !== requestedRevision) {
    return emptyProjection(context, "insufficient-authorized-information");
  }
  const currentEligibility = source.currentEligibility;
  if (source.currentEligibilityRequired) {
    if (!currentEligibility) return emptyProjection(context, "unavailable");
    try { validateCanonicalUnderstandingCurrentEligibilityResult(currentEligibility); }
    catch { return emptyProjection(context, "unavailable"); }
    if (
      currentEligibility.organizationId !== input.organizationId ||
      currentEligibility.subjectId !== context.subjectId ||
      currentEligibility.purposeRef !== context.purpose ||
      currentEligibility.requestedScopeDigest !==
        canonicalUnderstandingCurrentEligibilityScopeDigest(context.requestedScope) ||
      currentEligibility.sensitivity !== context.sensitivity ||
      currentEligibility.evaluatedAt !== context.evaluatedAt ||
      currentEligibility.authorizationContextRef !== context.contextId ||
      currentEligibility.canonicalUnderstandingRevision !== source.sourceRevisionRef
    ) return emptyProjection(context, "unavailable");
    if (currentEligibility.disposition === "withheld") {
      return emptyProjection(context, "withheld");
    }
    if (currentEligibility.disposition !== "eligible") {
      return emptyProjection(context, "unavailable");
    }
  }

  const normalizedItems = [...new Map(source.items.map((item) => [stable([item.safeRef, item.revisionRef ?? null]), item])).values()]
    .sort((left, right) => compare(stable([left.kind, left.safeRef]), stable([right.kind, right.safeRef])));
  const disclosedItems: ScopedProductProjectionItem[] = [];
  let withheld = 0;
  for (const item of normalizedItems) {
    if (item.organizationId !== input.organizationId || !sameScope(item.scope, context.requestedScope)) {
      withheld += 1;
      continue;
    }
    const decision = evaluateScopedUnderstandingDisclosure({
      requestRef: item.safeRef,
      organizationId: item.organizationId,
      recipientId: context.subjectId,
      scope: item.scope,
      sensitivity: item.sensitivity,
      kind: item.disclosureKind,
      support: item.support,
      supportLineageComplete: item.supportLineageComplete,
      safeAbstractionAllowed: item.safeAbstractionAllowed,
      protectedCombination: item.protectedCombination,
      context,
    });
    if (decision.disposition === "disclosed") {
      disclosedItems.push({
        safeRef: item.safeRef,
        canonicalObjectType: item.canonicalObjectType,
        ...(item.revisionRef ? { revisionRef: item.revisionRef } : {}),
        kind: item.kind,
        requestedScope: structuredClone(item.scope),
        disposition: "disclosed",
        whyVisible: decision.reason,
        title: item.title,
        summary: item.summary,
        uncertainty: item.uncertainty,
        safeSupportingLineage: decision.safeDisclosedLineage,
        auditRefs: [...new Set([...item.auditRefs, decision.decisionId])].sort(compare),
        temporalMode: context.temporal.mode,
      });
    } else if (decision.disposition === "safely-abstracted") {
      disclosedItems.push({
        safeRef: item.safeRef,
        canonicalObjectType: item.canonicalObjectType,
        ...(item.revisionRef ? { revisionRef: item.revisionRef } : {}),
        kind: item.kind,
        requestedScope: structuredClone(item.scope),
        disposition: "safely-abstracted",
        whyVisible: decision.reason,
        safeSupportingLineage: [],
        auditRefs: [decision.decisionId],
        temporalMode: context.temporal.mode,
      });
    } else {
      withheld += 1;
    }
  }

  const evaluatedMetrics = source.metrics
    .map((metric) => evaluateAuthorizedMetricLineage({ context, serverResolvedMetric: metric }))
    .sort((left, right) => compare(left.metricId, right.metricId));
  const protectedMetricIds = new Map<AuthorizedMetricResult["metricId"], { safeAbstractionAllowed: boolean; policyRef: string }>();
  for (const policy of source.metricCombinationPolicy) {
    const metricIds = [...new Set(policy.metricIds)].sort(compare);
    if (
      metricIds.length > 1 &&
      metricIds.every((metricId) => evaluatedMetrics.some((result) => result.metricId === metricId && result.disposition === "disclosed"))
    ) {
      for (const metricId of metricIds) protectedMetricIds.set(metricId, { safeAbstractionAllowed: policy.safeAbstractionAllowed, policyRef: policy.policyRef });
    }
  }
  const metrics = evaluatedMetrics.map((metric): AuthorizedMetricResult => {
    const policy = protectedMetricIds.get(metric.metricId);
    if (!policy) return metric;
    return {
      ...metric,
      disposition: policy.safeAbstractionAllowed ? "safely-abstracted" : "withheld",
      reason: "protected-combination",
      lineage: null,
      inputDecisions: [],
      value: undefined,
      ...(policy.safeAbstractionAllowed ? { abstraction: "value-withheld-authorized-metric-exists" as const } : {}),
    };
  });
  const availableKinds = new Set(disclosedItems.map((item) => item.kind));
  const decisionCalibration: ScopedProductProjection["decisionCalibration"] = source.decisionCalibration
    ? projectScopedDecisionCalibration({
      authenticatedUserId: input.authenticatedUserId,
      organizationId: input.organizationId,
      context,
      serverResolved: source.decisionCalibration,
    })
    : { disposition: "unavailable", reason: "canonical-input-unavailable" };
  const requestedKinds: ScopedProductItemKind[] = [
    "understanding",
    "material-change",
    "uncertainty",
    "open-question",
    "evidence-gap",
    "investigation-opportunity",
    "contradiction",
    "objective-context",
    "dependency",
    "risk",
  ];
  const unavailableKinds = requestedKinds.filter((kind) => !availableKinds.has(kind));
  const auditRefs = [...new Set([
    ...disclosedItems.flatMap((item) => item.auditRefs),
    ...metrics.flatMap((metric) => metric.lineage?.auditRefs ?? []),
    ...(decisionCalibration && "auditRefs" in decisionCalibration ? decisionCalibration.auditRefs : []),
  ])].sort(compare);
  const safe = {
    contractVersion: SCOPED_ORGANIZATIONAL_PRODUCT_PROJECTION_VERSION as typeof SCOPED_ORGANIZATIONAL_PRODUCT_PROJECTION_VERSION,
    organizationId: input.organizationId,
    recipientId: context.subjectId,
    requestedScope: structuredClone(context.requestedScope),
    purpose: context.purpose,
    evaluatedAt: context.evaluatedAt,
    temporalMode: context.temporal.mode,
    sourceRevisionRef: source.sourceRevisionRef,
    disposition: disclosedItems.length || metrics.some((metric) => metric.disposition === "disclosed") || decisionCalibration ? "available" as const : "insufficient-authorized-information" as const,
    items: disclosedItems,
    metrics,
    decisionCalibration,
    unavailableKinds,
    withheldItemCount: withheld > 0 ? null : 0,
    unsupportedCapabilities: [],
    auditRefs,
  };
  return {
    projectionId: identity({
      projection: safe,
      currentEligibilityDigest: currentEligibility?.resultDigest ?? null,
    }),
    ...safe,
  };
}
