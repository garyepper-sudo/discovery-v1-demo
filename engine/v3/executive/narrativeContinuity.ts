import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import type {
  ExecutiveNarrative,
  ExecutiveNarrativeContinuity,
  ExecutiveNarrativeContinuityStatus,
  ExecutiveNarrativeLifecycle,
  ExecutiveNarrativeMomentum,
  ExecutiveNarrativeRevision,
} from "./executiveState";

export function clampConfidence(value?: number): number | undefined {
  if (typeof value !== "number") return undefined;
  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function inferMomentum(
  confidence?: number,
  previousConfidence?: number,
): ExecutiveNarrativeMomentum {
  if (
    typeof confidence !== "number" ||
    typeof previousConfidence !== "number"
  ) {
    return "stable";
  }

  const delta = confidence - previousConfidence;

  if (delta >= 8) return "improving";
  if (delta <= -8) return "declining";
  return "stable";
}

function inferContinuityStatus(
  previous?: ExecutiveNarrative,
  confidenceDelta?: number,
): ExecutiveNarrativeContinuityStatus {
  if (!previous) return "new";
  if (typeof confidenceDelta !== "number") return "continuing";
  if (Math.abs(confidenceDelta) >= 8) return "changed";
  return "stable";
}

function inferLifecycle(
  status: ExecutiveNarrativeContinuityStatus,
  momentum: ExecutiveNarrativeMomentum,
): ExecutiveNarrativeLifecycle {
  if (status === "new") return "emerging";
  if (status === "resolved") return "resolved";
  if (momentum === "improving") return "strengthening";
  if (momentum === "declining") return "weakening";
  if (status === "stable") return "stable";
  return "active";
}

function buildNarrativeRevision(
  narrative: ExecutiveNarrative,
  timestamp: string,
  investigationId?: string,
): ExecutiveNarrativeRevision {
  return {
    investigationId,
    timestamp,
    headline: narrative.headline,
    confidence: narrative.confidence,
    momentum: narrative.momentum,
    summary: narrative.observation,
  };
}

function describeConfidenceEvolution(
  currentConfidence?: number,
  previousConfidence?: number,
  confidenceDelta?: number,
): string {
  if (
    typeof currentConfidence !== "number" ||
    typeof previousConfidence !== "number" ||
    typeof confidenceDelta !== "number"
  ) {
    return "Discovery continued refining this explanation without enough prior confidence history to measure the shift precisely.";
  }

  if (confidenceDelta >= 8) {
    return `Discovery became more certain because the explanation strengthened from ${previousConfidence}% to ${currentConfidence}%.`;
  }

  if (confidenceDelta <= -8) {
    return `Discovery became less certain because the explanation weakened from ${previousConfidence}% to ${currentConfidence}%.`;
  }

  return `Discovery's confidence remained broadly stable at ${currentConfidence}%, suggesting the newer evidence fits the existing explanation without materially changing it.`;
}

function describeImpactEvolution(
  narrative: ExecutiveNarrative,
  previous?: ExecutiveNarrative,
): string {
  if (!previous) {
    return "Discovery is now treating this as a persistent executive narrative worth tracking across future investigations.";
  }

  if (narrative.businessImpact !== previous.businessImpact) {
    return "Discovery now explains the leadership implications differently as the business impact became clearer.";
  }

  return "Discovery's view of the business impact remained coherent with the prior explanation.";
}

function describeConversationEvolution(
  narrative: ExecutiveNarrative,
  previous?: ExecutiveNarrative,
): string {
  if (!previous) {
    return "Future investigations will test whether this explanation strengthens, weakens, or resolves.";
  }

  if (narrative.executiveConversation !== previous.executiveConversation) {
    return "The leadership question changed because Discovery's explanation now points to a different uncertainty.";
  }

  return "The same leadership question remains important because the core uncertainty has not been fully resolved.";
}

function describeWhyModelChanged(
  narrative: ExecutiveNarrative,
  previous?: ExecutiveNarrative,
): string[] {
  if (!previous) {
    return [
      "This explanation emerged from current executive understanding and leadership attention signals.",
      "Discovery does not yet know whether the pattern is durable, isolated, or part of a broader operating model.",
    ];
  }

  const reasons: string[] = [
    "Discovery compared the current explanation against the previous version of the same executive narrative.",
  ];

  if (narrative.observation !== previous.observation) {
    reasons.push(
      "The explanation changed because the newer understanding describes the pattern differently than before.",
    );
  }

  if (narrative.businessImpact !== previous.businessImpact) {
    reasons.push(
      "The business interpretation changed, which means Discovery now sees different executive implications.",
    );
  }

  if (narrative.executiveConversation !== previous.executiveConversation) {
    reasons.push(
      "The unresolved leadership question changed, which means Discovery's uncertainty moved.",
    );
  }

  if (reasons.length === 1) {
    reasons.push(
      "The explanation did not materially change; the newer evidence mostly reinforced the existing model.",
    );
  }

  return reasons;
}

export function buildNarrativeContinuity(params: {
  narrative: ExecutiveNarrative;
  previous?: ExecutiveNarrative;
  timestamp: string;
  investigationId?: string;
}): ExecutiveNarrativeContinuity {
  const { narrative, previous, timestamp, investigationId } = params;

  const previousConfidence = clampConfidence(previous?.confidence);
  const currentConfidence = clampConfidence(narrative.confidence);

  const confidenceDelta =
    typeof currentConfidence === "number" &&
    typeof previousConfidence === "number"
      ? currentConfidence - previousConfidence
      : undefined;

  const momentum = inferMomentum(currentConfidence, previousConfidence);
  const status = inferContinuityStatus(previous, confidenceDelta);
  const lifecycle = inferLifecycle(status, momentum);

  const previousHistory = previous?.continuity?.history ?? [];
  const previousRevision = previous
    ? buildNarrativeRevision(previous, timestamp, investigationId)
    : undefined;

  const whatChanged: string[] = [
    describeConfidenceEvolution(
      currentConfidence,
      previousConfidence,
      confidenceDelta,
    ),
    describeImpactEvolution(narrative, previous),
    describeConversationEvolution(narrative, previous),
  ];

  const whyChanged = describeWhyModelChanged(narrative, previous);

  return {
    status,
    lifecycle,
    previousHeadline: previous?.headline,
    previousConfidence,
    confidenceDelta,
    whatChanged,
    whyChanged,
    history: [
      ...previousHistory.slice(-4),
      ...(previousRevision ? [previousRevision] : []),
    ],
  };
}

export function getPreviousNarratives(
  runtime: OrganizationRuntime,
): ExecutiveNarrative[] {
  const previous =
    (runtime as any)?.memory?.previousExecutiveState?.executiveNarratives ??
    (runtime as any)?.previousExecutiveState?.executiveNarratives ??
    (runtime as any)?.memory?.executiveNarratives ??
    (runtime as any)?.executiveMemory?.narratives ??
    [];

  return Array.isArray(previous) ? previous : [];
}