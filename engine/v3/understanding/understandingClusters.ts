import type { OrganizationalMechanism } from "../model/judgment/organizationalMechanism";

export type MechanismPattern = {
  id: string;
  name: string;
  mechanismType: string;

  frequency: number;
  averageConfidence: number;

  totalSeverity: number;

  supportingMechanismIds: string[];

  dominantScope: string;

  dominantCapabilities: string[];
  patternSignature: string;

  reinforcementWeight: number;
};

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function severityBand(severity: number | string | undefined): string {
  const s = typeof severity === "number" ? severity : 0;

  if (s >= 0.8) return "high";
  if (s >= 0.5) return "medium";
  return "low";
}

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCapabilities(m: OrganizationalMechanism): string[] {
  return unique([
    ...asArray(m.affectedCapabilities),
    ...asArray(m.affectedCapabilityIds),
    ...asArray(m.capabilityIds),
  ])
    .map(normalizeText)
    .filter(Boolean)
    .slice(0, 4)
    .sort();
}

function mechanismFamilyBucket(m: OrganizationalMechanism): string {
  const text = normalizeText(
    [
      m.type,
      m.title,
      m.summary,
      m.interpretation,
      m.organizationalBehavior,
      ...normalizeCapabilities(m),
    ].join(" "),
  );

  if (
    text.includes("knowledge") ||
    text.includes("documentation") ||
    text.includes("memory") ||
    text.includes("learning") ||
    text.includes("handoff") ||
    text.includes("transfer")
  ) {
    return "knowledge-continuity";
  }

  if (
    text.includes("coordination") ||
    text.includes("alignment") ||
    text.includes("communication") ||
    text.includes("cross functional") ||
    text.includes("handoff")
  ) {
    return "coordination-alignment";
  }

  if (
    text.includes("governance") ||
    text.includes("approval") ||
    text.includes("decision") ||
    text.includes("authority") ||
    text.includes("priority") ||
    text.includes("prioritization")
  ) {
    return "governance-decision-flow";
  }

  if (
    text.includes("execution") ||
    text.includes("capacity") ||
    text.includes("resource") ||
    text.includes("operational") ||
    text.includes("delivery")
  ) {
    return "execution-capacity";
  }

  return normalizeText(m.type ?? "unknown").replace(/\s+/g, "-") || "unknown";
}

function derivePatternKey(m: OrganizationalMechanism): string {
  const familyBucket = mechanismFamilyBucket(m);
  const scope = m.organizationalScope ?? "unknown";
  const severity = severityBand(m.severity);

  const recurrence =
    asArray(m.supportingPhenomenonIds).length +
    asArray(m.sourcePhenomenonIds).length;

  const beliefDensity =
    asArray(m.supportingExplanationIds).length +
    asArray(m.explanationIds).length +
    asArray(m.reasoningPathIds).length;

  const themeSupport = asArray(m.supportingCompressedThemeIds).length;

  const supportBucket =
    recurrence + beliefDensity + themeSupport >= 5
      ? "high-support"
      : recurrence + beliefDensity + themeSupport >= 2
      ? "mid-support"
      : "low-support";

  return `${familyBucket}::${scope}::${severity}::${supportBucket}`;
}

function deriveDominantScope(scopes: (string | undefined)[]): string {
  const counts: Record<string, number> = {};

  for (const s of scopes) {
    if (!s) continue;
    counts[s] = (counts[s] ?? 0) + 1;
  }

  let best = "unknown";
  let bestCount = 0;

  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }

  return best;
}

function mergeCapabilities(all: string[][]): string[] {
  const set = new Set<string>();

  for (const arr of all) {
    for (const v of asArray(arr)) {
      if (v) set.add(v);
    }
  }

  return Array.from(set).slice(0, 8);
}

/* =========================================================
   CLUSTER FUNCTIONS
   ========================================================= */

function buildEntityCentricClusters(params: {
  organizationReasoningGraph: any;
  existingClusters: any[];
  now: string;
}) {
  const nodes = asArray(params.organizationReasoningGraph?.nodes);

  return nodes.map((node: any, index: number) => ({
    id: `entity-cluster-${index + 1}-${params.now}`,
    label: node.canonicalName ?? "Entity Cluster",
    description: "Entity-centric cluster",
    memberUnderstandingIds: [node.id].filter(Boolean),
    sharedThemes: [node.category].filter(Boolean),
    sharedMechanisms: [],
    confidence: node.confidence ?? 0.5,
    cohesion: 0.4,
    stability: 0.4,
    status: "emerging",
    createdAt: params.now,
    updatedAt: params.now,
  }));
}

function buildTextCentricClusters(params: {
  understandings: any[];
  now: string;
}) {
  const understandings = asArray(params.understandings);

  if (understandings.length === 0) {
    return [];
  }

  return [
    {
      id: `text-cluster-1-${params.now}`,
      label: "Understanding Cluster",
      description: "Text-centric cluster",
      memberUnderstandingIds: understandings.map((u) => u.id ?? "unknown"),
      sharedThemes: [],
      sharedMechanisms: [],
      confidence: 0.5,
      cohesion: 0.4,
      stability: 0.3,
      status: "emerging",
      createdAt: params.now,
      updatedAt: params.now,
    },
  ];
}

/* =========================================================
   MAIN PATTERN CONSOLIDATION
   ========================================================= */

export function consolidateMechanismPatterns(
  mechanisms: OrganizationalMechanism[] = [],
): MechanismPattern[] {
  const map = new Map<string, MechanismPattern>();

  for (const m of asArray(mechanisms)) {
    const key = derivePatternKey(m);
    const caps = normalizeCapabilities(m);

    const supportSignalCount =
      asArray(m.supportingPhenomenonIds).length +
      asArray(m.sourcePhenomenonIds).length +
      asArray(m.supportingExplanationIds).length +
      asArray(m.explanationIds).length +
      asArray(m.reasoningPathIds).length +
      asArray(m.supportingClusterIds).length +
      asArray(m.clusterIds).length +
      asArray(m.supportingCompressedThemeIds).length +
      asArray(m.capabilityIds).length;

    const reinforcement =
      asArray(m.reinforcingMechanismIds).length +
      asArray(m.supportingPhenomenonIds).length * 0.5 +
      asArray(m.supportingCompressedThemeIds).length * 0.35 +
      asArray(m.capabilityIds).length * 0.25 +
      Math.min(1, supportSignalCount * 0.05);

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        id: `pattern:${key}`,
        name: m.title,
        mechanismType: mechanismFamilyBucket(m),

        frequency: 1,
        averageConfidence: m.confidence ?? 0,

        totalSeverity: typeof m.severity === "number" ? m.severity : 0,

        supportingMechanismIds: [m.id],

        dominantScope: m.organizationalScope ?? "unknown",

        dominantCapabilities: caps,
        patternSignature: key,

        reinforcementWeight: clamp01(reinforcement),
      });

      continue;
    }

    existing.frequency += 1;
    existing.supportingMechanismIds = unique([
      ...existing.supportingMechanismIds,
      m.id,
    ]);

    existing.averageConfidence = clamp01(
      average([existing.averageConfidence, m.confidence ?? 0]),
    );

    existing.totalSeverity += typeof m.severity === "number" ? m.severity : 0;

    existing.dominantScope = deriveDominantScope([
      existing.dominantScope,
      m.organizationalScope,
    ]);

    existing.dominantCapabilities = mergeCapabilities([
      existing.dominantCapabilities,
      caps,
    ]);

    existing.reinforcementWeight = clamp01(
      average([existing.reinforcementWeight, reinforcement]),
    );
  }

  return Array.from(map.values())
    .map((p) => ({
      ...p,
      averageConfidence: clamp01(p.averageConfidence),
      reinforcementWeight: clamp01(p.reinforcementWeight),
    }))
    .sort((a, b) => {
      const aScore =
        a.frequency * 0.35 +
        a.averageConfidence * 0.3 +
        a.reinforcementWeight * 0.25 +
        Math.min(1, a.supportingMechanismIds.length / 5) * 0.1;

      const bScore =
        b.frequency * 0.35 +
        b.averageConfidence * 0.3 +
        b.reinforcementWeight * 0.25 +
        Math.min(1, b.supportingMechanismIds.length / 5) * 0.1;

      return bScore - aScore;
    });
}

/* =========================================================
   PUBLIC API
   ========================================================= */

export function buildUnderstandingClusters(params: {
  understandings: any[];
  organizationReasoningGraph?: any;
  now?: string;
}) {
  const now = params.now ?? new Date().toISOString();

  if (params.organizationReasoningGraph?.nodes?.length) {
    return buildEntityCentricClusters({
      organizationReasoningGraph: params.organizationReasoningGraph,
      existingClusters: [],
      now,
    });
  }

  return buildTextCentricClusters({
    understandings: params.understandings,
    now,
  });
}