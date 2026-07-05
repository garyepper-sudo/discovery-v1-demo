import type {
  OrganizationReasoningGraph,
  OrganizationReasoningNode,
} from "./buildOrganizationReasoningGraph";

export type OrganizationReasoningRelationshipType =
  | "owns"
  | "dependsOn"
  | "supports"
  | "uses"
  | "createsRisk"
  | "contributesTo"
  | "coordinates"
  | "blocks"
  | "belongsTo"
  | "isRelatedTo";

export type OrganizationReasoningRelationship = {
  id: string;
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  relationship: OrganizationReasoningRelationshipType;
  confidence: number;
  rationale: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function nodeId(node: OrganizationReasoningNode): string {
  return node.id ?? node.entityId ?? node.phenomenonId ?? node.canonicalName;
}

function nodeText(node: OrganizationReasoningNode): string {
  return [
    node.canonicalName,
    node.category,
    node.description,
    node.status,
    ...(node.aliases ?? []),
    ...(node.relatedEntityIds ?? []),
    ...(node.possibleMechanismTypes ?? []),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(normalizeText(term)));
}

function relationshipId(params: {
  sourceId: string;
  targetId: string;
  relationship: OrganizationReasoningRelationshipType;
}): string {
  return `${params.sourceId}->${params.relationship}->${params.targetId}`;
}

function makeRelationship(params: {
  source: OrganizationReasoningNode;
  target: OrganizationReasoningNode;
  relationship: OrganizationReasoningRelationshipType;
  confidence: number;
  rationale: string;
}): OrganizationReasoningRelationship {
  const sourceId = nodeId(params.source);
  const targetId = nodeId(params.target);

  return {
    id: relationshipId({
      sourceId,
      targetId,
      relationship: params.relationship,
    }),
    sourceId,
    targetId,
    sourceName: params.source.canonicalName,
    targetName: params.target.canonicalName,
    relationship: params.relationship,
    confidence: Math.max(0, Math.min(1, params.confidence)),
    rationale: params.rationale,
  };
}

function dedupeRelationships(
  relationships: OrganizationReasoningRelationship[]
): OrganizationReasoningRelationship[] {
  const byId = new Map<string, OrganizationReasoningRelationship>();

  for (const relationship of relationships) {
    const existing = byId.get(relationship.id);

    if (!existing || relationship.confidence > existing.confidence) {
      byId.set(relationship.id, relationship);
    }
  }

  return [...byId.values()].sort((a, b) => b.confidence - a.confidence);
}

function isEntityNode(node: OrganizationReasoningNode): boolean {
  return node.kind === "entity" || Boolean(node.entityId);
}

function isPhenomenonNode(node: OrganizationReasoningNode): boolean {
  return node.kind === "phenomenon" || Boolean(node.phenomenonId);
}

export function inferReasoningRelationships(
  graph: OrganizationReasoningGraph
): OrganizationReasoningRelationship[] {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const entityNodes = nodes.filter(isEntityNode);
  const phenomenonNodes = nodes.filter(isPhenomenonNode);

  const relationships: OrganizationReasoningRelationship[] = [];

  const leadershipNodes = entityNodes.filter((node) =>
    includesAny(nodeText(node), ["leadership", "executive", "ceo", "manager"])
  );

  const teamNodes = entityNodes.filter((node) =>
    ["team", "actor"].includes(node.category)
  );

  const systemNodes = entityNodes.filter((node) => node.category === "system");

  const processNodes = entityNodes.filter((node) => node.category === "process");

  const riskNodes = entityNodes.filter((node) => node.category === "risk");

  const schedulingNodes = entityNodes.filter((node) =>
    includesAny(nodeText(node), ["scheduling", "dashboard", "operations"])
  );

  const customerNodes = entityNodes.filter((node) =>
    includesAny(nodeText(node), ["customer", "support", "client"])
  );

  const workforceNodes = entityNodes.filter((node) =>
    includesAny(nodeText(node), [
      "burnout",
      "fatigue",
      "exhaustion",
      "nurses",
      "human resources",
      "workforce",
    ])
  );

  for (const leadership of leadershipNodes) {
    for (const process of processNodes) {
      relationships.push(
        makeRelationship({
          source: leadership,
          target: process,
          relationship: "owns",
          confidence: 0.72,
          rationale:
            "Leadership-like entities commonly govern or approve organizational processes.",
        })
      );
    }

    for (const team of teamNodes) {
      if (nodeId(team) === nodeId(leadership)) continue;

      relationships.push(
        makeRelationship({
          source: team,
          target: leadership,
          relationship: "dependsOn",
          confidence: 0.68,
          rationale:
            "Actor and team entities appear dependent on leadership direction or approval.",
        })
      );
    }
  }

  for (const process of processNodes) {
    for (const system of systemNodes) {
      const processText = nodeText(process);
      const systemText = nodeText(system);

      if (
        includesAny(processText, ["scheduling", "operations"]) ||
        includesAny(systemText, ["scheduling", "dashboard", "platform"])
      ) {
        relationships.push(
          makeRelationship({
            source: process,
            target: system,
            relationship: "uses",
            confidence: 0.82,
            rationale:
              "The process and system share operational/scheduling language, suggesting the process uses the system.",
          })
        );
      }
    }
  }

  for (const risk of riskNodes) {
    const riskText = nodeText(risk);

    for (const scheduling of schedulingNodes) {
      if (nodeId(risk) === nodeId(scheduling)) continue;

      if (
        includesAny(riskText, ["delay", "bottleneck", "failure"]) &&
        includesAny(nodeText(scheduling), [
          "scheduling",
          "dashboard",
          "operations",
        ])
      ) {
        relationships.push(
          makeRelationship({
            source: scheduling,
            target: risk,
            relationship: "createsRisk",
            confidence: 0.78,
            rationale:
              "Scheduling or dashboard entities appear linked to delay, bottleneck, or failure risks.",
          })
        );
      }
    }
  }

  for (const delayRisk of riskNodes.filter((node) =>
    includesAny(nodeText(node), ["delay", "bottleneck"])
  )) {
    for (const workforce of workforceNodes) {
      if (nodeId(delayRisk) === nodeId(workforce)) continue;

      relationships.push(
        makeRelationship({
          source: delayRisk,
          target: workforce,
          relationship: "contributesTo",
          confidence: 0.66,
          rationale:
            "Delay or bottleneck risks may contribute to workforce stress, fatigue, or burnout.",
        })
      );
    }
  }

  for (const team of teamNodes) {
    for (const scheduling of schedulingNodes) {
      if (nodeId(team) === nodeId(scheduling)) continue;

      relationships.push(
        makeRelationship({
          source: team,
          target: scheduling,
          relationship: "coordinates",
          confidence: 0.64,
          rationale:
            "Teams and actors appear involved in coordination around scheduling or operational systems.",
        })
      );
    }
  }

  for (const customer of customerNodes) {
    for (const risk of riskNodes) {
      if (nodeId(customer) === nodeId(risk)) continue;

      if (includesAny(nodeText(risk), ["delay", "failure", "friction"])) {
        relationships.push(
          makeRelationship({
            source: risk,
            target: customer,
            relationship: "contributesTo",
            confidence: 0.62,
            rationale:
              "Operational risks can contribute to customer support friction or responsiveness issues.",
          })
        );
      }
    }
  }

  for (const phenomenon of phenomenonNodes) {
    const text = nodeText(phenomenon);

    for (const entity of entityNodes) {
      const entityId = nodeId(entity);

      if (!(phenomenon.relatedEntityIds ?? []).includes(entityId)) continue;

      relationships.push(
        makeRelationship({
          source: entity,
          target: phenomenon,
          relationship: "contributesTo",
          confidence: Math.min(0.82, phenomenon.confidence),
          rationale:
            "The phenomenon explicitly references this entity as participating in the organizational condition.",
        })
      );
    }

    if (
      includesAny(text, [
        "approval",
        "bottleneck",
        "decision latency",
        "slow decision",
      ])
    ) {
      for (const leadership of leadershipNodes) {
        relationships.push(
          makeRelationship({
            source: leadership,
            target: phenomenon,
            relationship: "contributesTo",
            confidence: 0.74,
            rationale:
              "Approval or decision-latency phenomena are commonly shaped by leadership decision rights or escalation patterns.",
          })
        );
      }
    }

    if (
      includesAny(text, [
        "knowledge fragmentation",
        "scattered documentation",
        "weak knowledge transfer",
        "institutional memory",
        "organizational learning",
      ])
    ) {
      for (const team of teamNodes) {
        relationships.push(
          makeRelationship({
            source: team,
            target: phenomenon,
            relationship: "contributesTo",
            confidence: 0.7,
            rationale:
              "Knowledge and learning phenomena commonly emerge from how teams preserve, share, and reuse organizational understanding.",
          })
        );
      }
    }
  }

  for (let i = 0; i < phenomenonNodes.length; i += 1) {
    for (let j = i + 1; j < phenomenonNodes.length; j += 1) {
      const source = phenomenonNodes[i];
      const target = phenomenonNodes[j];

      const sourceMechanisms = new Set(source.possibleMechanismTypes ?? []);
      const sharedMechanism = (target.possibleMechanismTypes ?? []).find(
        (mechanismType) => sourceMechanisms.has(mechanismType)
      );

      if (!sharedMechanism) continue;

      relationships.push(
        makeRelationship({
          source,
          target,
          relationship: "isRelatedTo",
          confidence: Math.min(source.confidence, target.confidence, 0.78),
          rationale: `Both phenomena point toward a possible shared mechanism: ${sharedMechanism}.`,
        })
      );
    }
  }

  entityNodes.forEach((source) => {
    source.relatedEntityIds.forEach((targetId) => {
      const target = entityNodes.find((node) => nodeId(node) === targetId);
      if (!target) return;

      relationships.push(
        makeRelationship({
          source,
          target,
          relationship: "isRelatedTo",
          confidence: 0.7,
          rationale:
            "The OrganizationModel already indicates these entities are related.",
        })
      );
    });
  });

  return dedupeRelationships(relationships);
}