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

function overlap(a?: string[], b?: string[]): number {
  if (!a?.length || !b?.length) return 0;

  const setA = new Set(a);
  return b.filter((item) => setA.has(item)).length;
}

function makeEdgeId(
  sourceMechanismId: string,
  targetMechanismId: string,
  relationshipType: MechanismRelationshipType,
): string {
  return `mechanism-edge:${sourceMechanismId}:${relationshipType}:${targetMechanismId}`;
}

function inferRelationship(
  source: OrganizationalMechanism,
  target: OrganizationalMechanism,
): MechanismNetworkEdge | null {
  if (source.id === target.id) return null;

  const sharedCapabilities = overlap(
    source.affectedCapabilities,
    target.affectedCapabilities,
  );

  if (sharedCapabilities <= 0) return null;

  const relationshipType: MechanismRelationshipType =
    sharedCapabilities >= 2 ? "reinforces" : "dependsOn";

  const confidence = Math.min(
    0.95,
    0.45 +
      sharedCapabilities * 0.12 +
      ((source.confidence ?? 0) + (target.confidence ?? 0)) / 10,
  );

  return {
    id: makeEdgeId(source.id, target.id, relationshipType),
    sourceMechanismId: source.id,
    targetMechanismId: target.id,
    relationshipType,
    summary: `${source.title} appears connected to ${target.title} through shared affected capabilities.`,
    confidence,
  };
}

function rankCentralMechanisms(
  mechanisms: OrganizationalMechanism[],
  edges: MechanismNetworkEdge[],
): string[] {
  const scores = new Map<string, number>();

  for (const mechanism of mechanisms) {
    scores.set(mechanism.id, mechanism.confidence ?? 0);
  }

  for (const edge of edges) {
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
  mechanisms: OrganizationalMechanism[],
): MechanismNetwork {
  const edges: MechanismNetworkEdge[] = [];

  for (const source of mechanisms) {
    for (const target of mechanisms) {
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

  const upstreamMechanismIds = mechanisms
    .filter((mechanism) => {
      const out = outgoing.get(mechanism.id) ?? 0;
      const input = incoming.get(mechanism.id) ?? 0;
      return out > input;
    })
    .map((mechanism) => mechanism.id);

  const downstreamMechanismIds = mechanisms
    .filter((mechanism) => {
      const out = outgoing.get(mechanism.id) ?? 0;
      const input = incoming.get(mechanism.id) ?? 0;
      return input > out;
    })
    .map((mechanism) => mechanism.id);

  return {
    mechanisms,
    edges,
    upstreamMechanismIds,
    downstreamMechanismIds,
    centralMechanismIds: rankCentralMechanisms(mechanisms, edges),
  };
}