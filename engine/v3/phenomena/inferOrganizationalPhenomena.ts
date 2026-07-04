import type {
  OrganizationalPhenomenon,
  OrganizationalPhenomenaState,
  OrganizationalPhenomenonStatus,
} from "./organizationalPhenomena";

type UnderstandingClusterLike = {
  id: string;
  label?: string;
  summary?: string;
  description?: string;

  understandingIds?: string[];
  memberUnderstandingIds?: string[];

  confidence?: number;
  strength?: number;
  cohesion?: number;
  stability?: number;

  status?: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function getClusterUnderstandingIds(cluster: UnderstandingClusterLike): string[] {
  return cluster.memberUnderstandingIds ?? cluster.understandingIds ?? [];
}

function inferPhenomenonLabel(cluster: UnderstandingClusterLike): string {
  const text = [cluster.label, cluster.summary, cluster.description]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");

  if (
    includesAny(text, [
      "execution",
      "capacity",
      "operational",
      "delivery",
      "implementation",
      "follow-through",
    ])
  ) {
    return "Execution Capacity";
  }

  if (
    includesAny(text, [
      "customer",
      "client",
      "concentration",
      "revenue dependency",
      "account dependency",
    ])
  ) {
    return "Customer Concentration";
  }

  if (
    includesAny(text, [
      "leadership",
      "alignment",
      "executive",
      "management",
      "strategic agreement",
    ])
  ) {
    return "Leadership Alignment";
  }

  if (
    includesAny(text, [
      "decision",
      "velocity",
      "speed",
      "approval",
      "bottleneck",
      "delay",
    ])
  ) {
    return "Decision Velocity";
  }

  if (
    includesAny(text, [
      "complexity",
      "coordination",
      "process",
      "handoff",
      "fragmentation",
    ])
  ) {
    return "Operational Complexity";
  }

  if (
    includesAny(text, [
      "innovation",
      "pipeline",
      "product",
      "roadmap",
      "research",
      "development",
    ])
  ) {
    return "Innovation Pipeline";
  }

  return cluster.label || "Emerging Organizational Phenomenon";
}

function inferPhenomenonStatus(
  cluster: UnderstandingClusterLike
): OrganizationalPhenomenonStatus {
  if (cluster.status === "weakening") return "weakening";
  if (cluster.status === "stable") return "stable";
  if (cluster.status === "fragmented") return "fragmented";

  const strength =
    cluster.strength ??
    cluster.stability ??
    cluster.cohesion ??
    cluster.confidence ??
    0.5;

  if (strength >= 0.75) return "strengthening";
  if (strength >= 0.55) return "emerging";

  return "fragmented";
}

function buildPhenomenonDescription(label: string): string {
  return `Discovery is detecting a persistent organizational phenomenon related to ${label}.`;
}

function buildExecutiveMeaning(label: string): string {
  return `This matters because ${label.toLowerCase()} affects how the organization converts understanding into coordinated action.`;
}

function buildEvidenceSummary(params: {
  cluster: UnderstandingClusterLike;
  understandingIds: string[];
}): string {
  const { understandingIds } = params;
  const count = understandingIds.length;

  if (count === 0) {
    return "This phenomenon is inferred from a related cluster of organizational understandings.";
  }

  return `This phenomenon is inferred from ${count} related organizational understanding${
    count === 1 ? "" : "s"
  }.`;
}

export function inferOrganizationalPhenomena(params: {
  clusters: UnderstandingClusterLike[];
  previousState?: OrganizationalPhenomenaState;
  now?: string;
}): OrganizationalPhenomenaState {
  const { clusters, previousState } = params;
  const now = params.now ?? new Date().toISOString();

  const previousPhenomena = previousState?.phenomena ?? [];

  const phenomena: OrganizationalPhenomenon[] = clusters.map((cluster, index) => {
    const label = inferPhenomenonLabel(cluster);

    const existing = previousPhenomena.find(
      (phenomenon) => phenomenon.label === label
    );

    const understandingIds = getClusterUnderstandingIds(cluster);

    const confidence = Math.min(
      1,
      Math.max(
        0,
        cluster.confidence ??
          cluster.cohesion ??
          existing?.confidence ??
          0.55
      )
    );

    const strength = Math.min(
      1,
      Math.max(
        0,
        cluster.strength ??
          cluster.stability ??
          cluster.cohesion ??
          existing?.strength ??
          confidence
      )
    );

    const status = inferPhenomenonStatus({
      ...cluster,
      confidence,
      strength,
    });

    return {
      id: existing?.id ?? `phenomenon-${index + 1}`,
      label,
      description: existing?.description ?? buildPhenomenonDescription(label),

      clusterIds: [cluster.id],
      understandingIds,

      status,

      confidence,
      strength,

      executiveMeaning:
        existing?.executiveMeaning ?? buildExecutiveMeaning(label),

      evidenceSummary: buildEvidenceSummary({
        cluster,
        understandingIds,
      }),

      changeExplanation: existing
        ? `Discovery refreshed its understanding of ${label.toLowerCase()} from the latest investigation.`
        : `Discovery inferred ${label.toLowerCase()} as a new organizational phenomenon.`,

      firstDetectedAt: existing?.firstDetectedAt ?? now,
      lastUpdatedAt: now,
    };
  });

  return {
    phenomena,
    lastUpdatedAt: now,
  };
}