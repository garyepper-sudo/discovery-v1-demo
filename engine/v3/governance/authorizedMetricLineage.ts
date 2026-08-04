import { createHash } from "node:crypto";

import {
  evaluateScopedUnderstandingDisclosure,
  type ScopedDisclosureDecision,
  type ScopedDisclosureDerivedKind,
  type ScopedDisclosureSupport,
} from "../understanding/scopedOrganizationalUnderstandingDisclosure";
import type {
  GovernedScopeRef,
  GovernedSensitivity,
  ScopedGovernanceContext,
} from "./scopedGovernanceContext";

export const AUTHORIZED_METRIC_LINEAGE_VERSION = "1";

export type SupportedAuthorizedMetricId =
  | "organizational-understanding.coherence"
  | "organizational-learning.learning-velocity";

export type AuthorizedMetricId =
  | SupportedAuthorizedMetricId
  | "organizational-understanding.confidence"
  | "organizational-understanding.freshness"
  | "organizational-understanding.health"
  | "organizational-learning.understanding-growth"
  | "organizational-learning.memory-growth"
  | "organizational-learning.trend-ranking";

export type CanonicalMetricInput = {
  safeRef: string;
  organizationId: string;
  objectType:
    | "organizational-understanding"
    | "organizational-evolution"
    | "organizational-learning-profile";
  scope: GovernedScopeRef;
  sensitivity: GovernedSensitivity;
  authorityRef: string;
  supportLineage: ScopedDisclosureSupport[];
  supportLineageComplete: boolean;
};

export type ServerResolvedCanonicalMetric = {
  metricId: AuthorizedMetricId;
  organizationId: string;
  producerRef: string;
  producerVersion: string;
  requestedScope: GovernedScopeRef;
  calculationMethod: string;
  value: number | string | null;
  candidateInputs: readonly CanonicalMetricInput[];
  inputCombinationProtected: boolean;
  resultSideChannelSafe: boolean;
  safeAbstractionAllowed: boolean;
  historicalRevisionRef?: string;
};

export type AuthorizedMetricLineage = {
  metricId: AuthorizedMetricId;
  producerRef: string;
  producerVersion: string;
  requestedScope: GovernedScopeRef;
  purpose: string;
  evaluatedAt: string;
  temporalMode: "current" | "historical";
  authorizedInputCount: number;
  safeInputRefs: string[];
  calculationMethod: string;
  authorityRefs: string[];
  policyRefs: string[];
  auditRefs: string[];
};

type MetricReason =
  | "authorized-canonical-inputs"
  | "safe-abstraction-only"
  | "current-authority-denied"
  | "organization-mismatch"
  | "scope-mismatch"
  | "producer-mismatch"
  | "metric-unsupported"
  | "metric-value-unavailable"
  | "input-lineage-incomplete"
  | "input-withheld"
  | "protected-combination"
  | "result-side-channel-risk"
  | "historical-lineage-unresolved";

export type AuthorizedMetricResult = {
  resultId: string;
  contractVersion: typeof AUTHORIZED_METRIC_LINEAGE_VERSION;
  metricId: AuthorizedMetricId;
  organizationId: string;
  recipientId: string;
  requestedScope: GovernedScopeRef;
  disposition:
    | "disclosed"
    | "safely-abstracted"
    | "withheld"
    | "unavailable"
    | "insufficient-authorized-information"
    | "unsupported-metric";
  reason: MetricReason;
  lineage: AuthorizedMetricLineage | null;
  inputDecisions: ScopedDisclosureDecision[];
  value?: number | string;
  abstraction?: "value-withheld-authorized-metric-exists";
};

const supportedMetrics: Record<
  SupportedAuthorizedMetricId,
  { producerRef: string; producerVersion: string; calculationMethod: string }
> = {
  "organizational-understanding.coherence": {
    producerRef: "update-organizational-understanding-state",
    producerVersion: "1",
    calculationMethod: "canonical-organizational-understanding-health-coherence",
  },
  "organizational-learning.learning-velocity": {
    producerRef: "compute-organizational-learning-profile",
    producerVersion: "1",
    calculationMethod: "canonical-organizational-learning-velocity-score",
  },
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

function normalizeInputs(inputs: readonly CanonicalMetricInput[]): CanonicalMetricInput[] {
  const byIdentity = new Map<string, CanonicalMetricInput>();
  for (const input of inputs) {
    const key = stable([input.objectType, input.safeRef, input.scope, input.sensitivity]);
    if (!byIdentity.has(key)) byIdentity.set(key, structuredClone(input));
  }
  return [...byIdentity.entries()].sort(([left], [right]) => compare(left, right)).map(([, input]) => input);
}

function bounded(
  metric: ServerResolvedCanonicalMetric,
  context: ScopedGovernanceContext,
  disposition: AuthorizedMetricResult["disposition"],
  reason: MetricReason,
  inputDecisions: ScopedDisclosureDecision[] = [],
  lineage: AuthorizedMetricLineage | null = null,
): AuthorizedMetricResult {
  const safe = {
    contractVersion: AUTHORIZED_METRIC_LINEAGE_VERSION as typeof AUTHORIZED_METRIC_LINEAGE_VERSION,
    metricId: metric.metricId,
    organizationId: metric.organizationId,
    recipientId: context.subjectId,
    requestedScope: structuredClone(metric.requestedScope),
    disposition,
    reason,
    lineage,
    inputDecisions: [...inputDecisions].sort((left, right) => compare(left.decisionId, right.decisionId)),
  };
  return {
    resultId: `authorized-metric:${createHash("sha256").update(stable(safe)).digest("hex")}`,
    ...safe,
  };
}

function disclosureKind(metricId: AuthorizedMetricId): ScopedDisclosureDerivedKind {
  if (metricId.includes("learning") || metricId.includes("trend")) return "trend-input";
  return "aggregate-input";
}

/**
 * Governs a server-resolved canonical metric before its precomputed value is
 * released. It never calculates a global metric or changes producer meaning.
 */
export function evaluateAuthorizedMetricLineage(input: {
  context: ScopedGovernanceContext;
  serverResolvedMetric: ServerResolvedCanonicalMetric;
}): AuthorizedMetricResult {
  const { context, serverResolvedMetric: metric } = input;
  if (
    metric.organizationId !== context.organizationId ||
    metric.requestedScope.organizationId !== metric.organizationId
  ) return bounded(metric, context, "withheld", "organization-mismatch");
  if (context.disposition !== "authorized") {
    return bounded(metric, context, "withheld", "current-authority-denied");
  }
  if (!sameScope(metric.requestedScope, context.requestedScope)) {
    return bounded(metric, context, "withheld", "scope-mismatch");
  }
  const definition = supportedMetrics[metric.metricId as SupportedAuthorizedMetricId];
  if (!definition) return bounded(metric, context, "unsupported-metric", "metric-unsupported");
  if (
    metric.producerRef !== definition.producerRef ||
    metric.producerVersion !== definition.producerVersion ||
    metric.calculationMethod !== definition.calculationMethod
  ) return bounded(metric, context, "unsupported-metric", "producer-mismatch");
  if (
    context.temporal.mode === "historical" &&
    (!metric.historicalRevisionRef || metric.historicalRevisionRef !== context.temporal.revisionRef)
  ) return bounded(metric, context, "insufficient-authorized-information", "historical-lineage-unresolved");
  if (metric.value === null) return bounded(metric, context, "unavailable", "metric-value-unavailable");

  const canonicalInputs = normalizeInputs(metric.candidateInputs);
  if (!canonicalInputs.length || canonicalInputs.some((candidate) => !candidate.supportLineageComplete)) {
    return bounded(metric, context, "insufficient-authorized-information", "input-lineage-incomplete");
  }
  const decisions = canonicalInputs.flatMap((candidate) => {
    const request = {
      requestRef: candidate.safeRef,
      organizationId: candidate.organizationId,
      recipientId: context.subjectId,
      scope: candidate.scope,
      sensitivity: candidate.sensitivity,
      support: candidate.supportLineage,
      supportLineageComplete: candidate.supportLineageComplete,
      safeAbstractionAllowed: false,
      protectedCombination: false,
      context,
    };
    return [
      evaluateScopedUnderstandingDisclosure({ ...request, kind: "direct-evidence" }),
      evaluateScopedUnderstandingDisclosure({ ...request, kind: disclosureKind(metric.metricId) }),
    ];
  });
  if (decisions.some((decision) => decision.disposition !== "disclosed")) {
    return bounded(metric, context, "withheld", "input-withheld", decisions);
  }
  if (metric.inputCombinationProtected && canonicalInputs.length > 1) {
    return metric.safeAbstractionAllowed
      ? {
          ...bounded(metric, context, "safely-abstracted", "safe-abstraction-only", decisions),
          disposition: "safely-abstracted",
          abstraction: "value-withheld-authorized-metric-exists",
        }
      : bounded(metric, context, "withheld", "protected-combination", decisions);
  }
  if (!metric.resultSideChannelSafe) {
    return metric.safeAbstractionAllowed
      ? {
          ...bounded(metric, context, "safely-abstracted", "safe-abstraction-only", decisions),
          disposition: "safely-abstracted",
          abstraction: "value-withheld-authorized-metric-exists",
        }
      : bounded(metric, context, "withheld", "result-side-channel-risk", decisions);
  }

  const authorityRefs = [...new Set(decisions.flatMap((decision) => decision.authorityRefs))].sort(compare);
  const policyRefs = [...new Set(decisions.flatMap((decision) => decision.policyRefs))].sort(compare);
  const safeInputRefs = canonicalInputs.map((candidate) => candidate.safeRef).sort(compare);
  const lineage: AuthorizedMetricLineage = {
    metricId: metric.metricId,
    producerRef: metric.producerRef,
    producerVersion: metric.producerVersion,
    requestedScope: structuredClone(metric.requestedScope),
    purpose: context.purpose,
    evaluatedAt: context.evaluatedAt,
    temporalMode: context.temporal.mode,
    authorizedInputCount: canonicalInputs.length,
    safeInputRefs,
    calculationMethod: metric.calculationMethod,
    authorityRefs,
    policyRefs,
    auditRefs: decisions.map((decision) => decision.decisionId).sort(compare),
  };
  return {
    ...bounded(metric, context, "disclosed", "authorized-canonical-inputs", decisions, lineage),
    disposition: "disclosed",
    value: metric.value,
  };
}
