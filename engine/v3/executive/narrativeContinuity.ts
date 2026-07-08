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

  const whatChanged: string[] = previous
    ? [
        typeof confidenceDelta === "number"
          ? `Confidence changed from ${previousConfidence}% to ${currentConfidence}%.`
          : "Discovery continued tracking this organizational narrative.",
        narrative.businessImpact !== previous.businessImpact
          ? "Business impact was updated based on the latest executive understanding."
          : "Business impact remained consistent with the previous investigation.",
        narrative.executiveConversation !== previous.executiveConversation
          ? "The recommended leadership conversation evolved."
          : "The recommended leadership conversation remained consistent.",
      ]
    : [
        "Discovery identified this as a new persistent executive narrative.",
        "Future investigations will track whether this story strengthens, weakens, or stabilizes.",
      ];

  const whyChanged: string[] = previous
    ? [
        "The Expression Layer compared the current executive narrative against the previous narrative with the same identity.",
        "Continuity reflects changes in confidence, impact framing, and recommended leadership conversation.",
      ]
    : [
        "This narrative emerged from current executive understanding and leadership attention signals.",
      ];

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