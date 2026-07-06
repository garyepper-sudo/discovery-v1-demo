import type { OrganizationalMechanism } from "./organizationalMechanism";

export type MechanismRelationshipType =
  | "reinforces"
  | "constrains"
  | "amplifies"
  | "causes"
  | "dependsOn"
  | "competesWith"
  | "unknown";

export type MechanismNetworkEdge = {
  id: string;
  sourceMechanismId: string;
  targetMechanismId: string;
  relationshipType: MechanismRelationshipType;
  summary: string;
  confidence: number;
};

export type MechanismNetwork = {
  mechanisms: OrganizationalMechanism[];
  edges: MechanismNetworkEdge[];
  upstreamMechanismIds: string[];
  downstreamMechanismIds: string[];
  centralMechanismIds: string[];
};

function safeArray<T>(items: T[] | undefined | null): T[] {
  return Array.isArray(items) ? items : [];
}

function safeStringArray(items: Array<string | undefined> | undefined | null): string[] {
  return Array.isArray(items)
    ? items.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function overlap(a?: string[], b?: string[]): number {
  const safeA = safeStringArray(a);
  const safeB = safeStringArray(b);

  if (safeA.length === 0 || safeB.length === 0) return 0;

  const setA = new Set(safeA);
  return safeB.filter((item) => setA.has(item)).length;
}

function mechanismSupportSignals(mechanism: OrganizationalMechanism): string[] {
  return unique([
    ...safeStringArray(mechanism.affectedCapabilities),
    ...safeStringArray(mechanism.affectedCapabilityIds),
    ...safeStringArray(mechanism.capabilityIds),
    ...safeStringArray(mechanism.supportingCompressedThemeIds),
    ...safeStringArray(mechanism.supportingPhenomenonIds),
    ...safeStringArray(mechanism.sourcePhenomenonIds),
    ...safeStringArray(mechanism.supportingExplanationIds),
    ...safeStringArray(mechanism.explanationIds),
    ...safeStringArray(mechanism.reasoningPathIds),
    ...safeStringArray(mechanism.supportingClusterIds),
    ...safeStringArray(mechanism.clusterIds),
    ...safeStringArray(mechanism.sourceClusterIds),
    ...safeStringArray(mechanism.judgmentIds),
  ]);
}

function normalizeMechanism(
  mechanism: OrganizationalMechanism,
): OrganizationalMechanism {
  return {
    ...mechanism,

    affectedCapabilities: safeStringArray(mechanism.affectedCapabilities),
    affectedCapabilityIds: safeStringArray(mechanism.affectedCapabilityIds),
    capabilityIds: safeStringArray(mechanism.capabilityIds),

    supportingCompressedThemeIds: safeStringArray(
      mechanism.supportingCompressedThemeIds,
    ),

    supportingPhenomenonIds: safeStringArray(
      mechanism.supportingPhenomenonIds,
    ),
    sourcePhenomenonIds: safeStringArray(mechanism.sourcePhenomenonIds),

    supportingExplanationIds: safeStringArray(
      mechanism.supportingExplanationIds,
    ),
    explanationIds: safeStringArray(mechanism.explanationIds),
    reasoningPathIds: safeStringArray(mechanism.reasoningPathIds),

    supportingClusterIds: safeStringArray(mechanism.supportingClusterIds),
    clusterIds: safeStringArray(mechanism.clusterIds),
    sourceClusterIds: safeStringArray(mechanism.sourceClusterIds),

    judgmentIds: safeStringArray(mechanism.judgmentIds),

    upstreamMechanismIds: safeStringArray(mechanism.upstreamMechanismIds),
    downstreamMechanismIds: safeStringArray(mechanism.downstreamMechanismIds),
    reinforcingMechanismIds: safeStringArray(mechanism.reinforcingMechanismIds),

    supportingEvidenceIds: safeStringArray(mechanism.supportingEvidenceIds),
    evidenceReferences: safeArray(mechanism.evidenceReferences),
  };
}

function makeEdgeId(
  sourceMechanismId: string,
  targetMechanismId: string,
  relationshipType: MechanismRelationshipType,
): string {
  return `mechanism-edge:${sourceMechanismId}:${relationshipType}:${targetMechanismId}`;
}

function inferRelationship(
  rawSource: OrganizationalMechanism,
  rawTarget: OrganizationalMechanism,
): MechanismNetworkEdge | null {
  const source = normalizeMechanism(rawSource);
  const target = normalizeMechanism(rawTarget);

  if (source.id === target.id) return null;

  const sharedCapabilities = overlap(
    unique([
      ...safeStringArray(source.affectedCapabilities),
      ...safeStringArray(source.affectedCapabilityIds),
      ...safeStringArray(source.capabilityIds),
    ]),
    unique([
      ...safeStringArray(target.affectedCapabilities),
      ...safeStringArray(target.affectedCapabilityIds),
      ...safeStringArray(target.capabilityIds),
    ]),
  );

  const sharedSupportSignals = overlap(
    mechanismSupportSignals(source),
    mechanismSupportSignals(target),
  );

  const totalSharedSignals = Math.max(sharedCapabilities, sharedSupportSignals);

  if (totalSharedSignals <= 0) return null;

  const relationshipType: MechanismRelationshipType =
    totalSharedSignals >= 2 ? "reinforces" : "dependsOn";

  const confidence = Math.min(
    0.95,
    0.45 +
      totalSharedSignals * 0.12 +
      ((source.confidence ?? 0) + (target.confidence ?? 0)) / 10,
  );

  return {
    id: makeEdgeId(source.id, target.id, relationshipType),
    sourceMechanismId: source.id,
    targetMechanismId: target.id,
    relationshipType,
    summary:
      sharedCapabilities > 0
        ? `${source.title} appears connected to ${target.title} through shared affected capabilities.`
        : `${source.title} appears connected to ${target.title} through shared organizational support signals.`,
    confidence,
  };
}

function rankCentralMechanisms(
  mechanisms: OrganizationalMechanism[],
  edges: MechanismNetworkEdge[],
): string[] {
  const scores = new Map<string, number>();

  for (const mechanism of safeArray(mechanisms)) {
    scores.set(mechanism.id, mechanism.confidence ?? 0);
  }

  for (const edge of safeArray(edges)) {
    scores.set(
      edge.sourceMechanismId,
      (scores.get(edge.sourceMechanismId) ?? 0) + edge.confidence,
    );

    scores.set(
      edge.targetMechanismId,
      (scores.get(edge.targetMechanismId) ?? 0) + edge.confidence * 0.8,
    );
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 5);
}

export function buildMechanismNetwork(
  mechanisms: OrganizationalMechanism[] = [],
): MechanismNetwork {
  const normalizedMechanisms = safeArray(mechanisms).map(normalizeMechanism);
  const edges: MechanismNetworkEdge[] = [];

  for (const source of normalizedMechanisms) {
    for (const target of normalizedMechanisms) {
      const edge = inferRelationship(source, target);
      if (edge) edges.push(edge);
    }
  }

  const outgoing = new Map<string, number>();
  const incoming = new Map<string, number>();

  for (const edge of edges) {
    outgoing.set(
      edge.sourceMechanismId,
      (outgoing.get(edge.sourceMechanismId) ?? 0) + 1,
    );

    incoming.set(
      edge.targetMechanismId,
      (incoming.get(edge.targetMechanismId) ?? 0) + 1,
    );
  }

  const upstreamMechanismIds = normalizedMechanisms
    .filter((mechanism) => {
      const out = outgoing.get(mechanism.id) ?? 0;
      const input = incoming.get(mechanism.id) ?? 0;
      return out > input;
    })
    .map((mechanism) => mechanism.id);

  const downstreamMechanismIds = normalizedMechanisms
    .filter((mechanism) => {
      const out = outgoing.get(mechanism.id) ?? 0;
      const input = incoming.get(mechanism.id) ?? 0;
      return input > out;
    })
    .map((mechanism) => mechanism.id);

  return {
    mechanisms: normalizedMechanisms,
    edges,
    upstreamMechanismIds,
    downstreamMechanismIds,
    centralMechanismIds: rankCentralMechanisms(normalizedMechanisms, edges),
  };
}