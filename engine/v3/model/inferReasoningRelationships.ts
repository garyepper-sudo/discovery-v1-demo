export type OrganizationReasoningNode = {
  entityId: string;
  canonicalName: string;
  category: string;
  aliases: string[];
  confidence: number;
  evidenceIds: string[];
  relatedEntityIds: string[];
};

export type OrganizationReasoningGraph = {
  organizationId: string;
  generatedAt: string;
  nodes: OrganizationReasoningNode[];
};

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

function nodeText(node: OrganizationReasoningNode): string {
  return [
    node.canonicalName,
    node.category,
    ...node.aliases,
    ...node.relatedEntityIds,
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
  return {
    id: relationshipId({
      sourceId: params.source.entityId,
      targetId: params.target.entityId,
      relationship: params.relationship,
    }),
    sourceId: params.source.entityId,
    targetId: params.target.entityId,
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

export function inferReasoningRelationships(
  graph: OrganizationReasoningGraph
): OrganizationReasoningRelationship[] {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const relationships: OrganizationReasoningRelationship[] = [];

  const leadershipNodes = nodes.filter((node) =>
    includesAny(nodeText(node), ["leadership", "executive", "ceo", "manager"])
  );

  const teamNodes = nodes.filter((node) =>
    ["team", "actor"].includes(node.category)
  );

  const systemNodes = nodes.filter((node) => node.category === "system");

  const processNodes = nodes.filter((node) => node.category === "process");

  const riskNodes = nodes.filter((node) => node.category === "risk");

  const schedulingNodes = nodes.filter((node) =>
    includesAny(nodeText(node), ["scheduling", "dashboard", "operations"])
  );

  const customerNodes = nodes.filter((node) =>
    includesAny(nodeText(node), ["customer", "support", "client"])
  );

  const workforceNodes = nodes.filter((node) =>
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
      if (team.entityId === leadership.entityId) continue;

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
      if (risk.entityId === scheduling.entityId) continue;

      if (
        includesAny(riskText, ["delay", "bottleneck", "failure"]) &&
        includesAny(nodeText(scheduling), ["scheduling", "dashboard", "operations"])
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
      if (delayRisk.entityId === workforce.entityId) continue;

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
      if (team.entityId === scheduling.entityId) continue;

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
      if (customer.entityId === risk.entityId) continue;

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

  nodes.forEach((source) => {
    source.relatedEntityIds.forEach((targetId) => {
      const target = nodes.find((node) => node.entityId === targetId);
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