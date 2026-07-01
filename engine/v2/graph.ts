import { EvidenceNode } from "./evidence";

export interface EvidenceEdge {
  source: string;
  target: string;
  relationship: "related" | "supports" | "contradicts";
  strength: number;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export function buildEvidenceGraph(nodes: EvidenceNode[]): EvidenceGraph {
  const edges: EvidenceEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const relationship = detectRelationship(nodes[i], nodes[j]);

      if (relationship) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          relationship: relationship.type,
          strength: relationship.strength,
        });
      }
    }
  }

  return { nodes, edges };
}

function detectRelationship(
  a: EvidenceNode,
  b: EvidenceNode
): { type: EvidenceEdge["relationship"]; strength: number } | null {
  const sharedKeywords = a.keywords.filter((keyword) =>
    b.keywords.includes(keyword)
  );

  if (sharedKeywords.length >= 2) {
    return {
      type: "related",
      strength: Math.min(95, sharedKeywords.length * 20),
    };
  }

  const textA = a.text.toLowerCase();
  const textB = b.text.toLowerCase();

  if (
    (textA.includes("strong") && textB.includes("complain")) ||
    (textB.includes("strong") && textA.includes("complain")) ||
    (textA.includes("unclear") && textB.includes("investing")) ||
    (textB.includes("unclear") && textA.includes("investing"))
  ) {
    return {
      type: "contradicts",
      strength: 75,
    };
  }

  return null;
}