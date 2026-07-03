import {
  V3Evidence,
  V3EvidenceNetwork,
  V3EvidenceRelationship,
  V3EvidenceRelationshipType,
} from "./types";

export type V3MechanismType =
  | "causal"
  | "reinforcing"
  | "constraint"
  | "tension"
  | "dependency"
  | "unknown";

export type V3Mechanism = {
  id: string;
  title: string;
  type: V3MechanismType;
  cause: string;
  mechanism: string;
  effect: string;
  evidenceIds: string[];
  relationshipIds: string[];
  confidence: number;
  explanation: string;
  openQuestions: string[];
};

const CAUSAL_TERMS = [
  "because",
  "due to",
  "driven by",
  "caused by",
  "leads to",
  "resulting in",
  "as a result",
  "therefore",
];

const CONSTRAINT_TERMS = [
  "blocked",
  "limited",
  "constraint",
  "capacity",
  "shortage",
  "delay",
  "bottleneck",
  "friction",
  "risk",
];

const DEPENDENCY_TERMS = [
  "depends",
  "requires",
  "enabled by",
  "based on",
  "before",
  "after",
  "following",
];

export function buildMechanisms(
  network: V3EvidenceNetwork
): V3Mechanism[] {
  const mechanisms: V3Mechanism[] = [];

  for (const cluster of network.graph.clusters) {
    const clusterEvidence = network.evidence.filter((item) =>
      cluster.evidenceIds.includes(item.id)
    );

    const clusterRelationships = network.relationships.filter(
      (relationship) =>
        cluster.evidenceIds.includes(relationship.sourceEvidenceId) &&
        cluster.evidenceIds.includes(relationship.targetEvidenceId)
    );

    const mechanism = buildMechanismFromCluster(
      mechanisms.length + 1,
      clusterEvidence,
      clusterRelationships
    );

    if (mechanism) {
      mechanisms.push(mechanism);
    }
  }

  return mechanisms;
}

function buildMechanismFromCluster(
  index: number,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3Mechanism | null {
  if (evidence.length < 2 || relationships.length === 0) return null;

  const relationshipTypes = relationships.map((item) => item.type);
  const combinedText = evidence.map((item) => item.text).join(" ").toLowerCase();

  const type = inferMechanismType(relationshipTypes, combinedText);

  if (type === "unknown") return null;

  const causeEvidence = pickCauseEvidence(evidence, relationships);
  const effectEvidence = pickEffectEvidence(evidence, relationships, causeEvidence?.id);

  if (!causeEvidence || !effectEvidence) return null;

  const confidence = calculateMechanismConfidence(evidence, relationships);

  return {
    id: `M-${index}`,
    title: createMechanismTitle(type, causeEvidence, effectEvidence),
    type,
    cause: summarizeEvidence(causeEvidence),
    mechanism: describeMechanism(type, relationships),
    effect: summarizeEvidence(effectEvidence),
    evidenceIds: evidence.map((item) => item.id),
    relationshipIds: relationships.map((item) => item.id),
    confidence,
    explanation: createExplanation(type, evidence, relationships),
    openQuestions: createOpenQuestions(type, evidence, relationships),
  };
}

function inferMechanismType(
  relationshipTypes: V3EvidenceRelationshipType[],
  combinedText: string
): V3MechanismType {
  if (
    relationshipTypes.includes("contradicts") &&
    relationshipTypes.some((type) => type === "supports" || type === "extends")
  ) {
    return "tension";
  }

  if (
    relationshipTypes.includes("depends_on") ||
    containsAny(combinedText, DEPENDENCY_TERMS)
  ) {
    return "dependency";
  }

  if (
    relationshipTypes.includes("explains") ||
    containsAny(combinedText, CAUSAL_TERMS)
  ) {
    return "causal";
  }

  if (containsAny(combinedText, CONSTRAINT_TERMS)) {
    return "constraint";
  }

  if (
    relationshipTypes.filter((type) => type === "supports").length >= 2 ||
    relationshipTypes.includes("duplicates")
  ) {
    return "reinforcing";
  }

  return "unknown";
}

function pickCauseEvidence(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3Evidence | undefined {
  const outgoingScores = new Map<string, number>();

  for (const relationship of relationships) {
    const score =
      relationship.type === "explains" || relationship.type === "depends_on"
        ? 2
        : 1;

    outgoingScores.set(
      relationship.sourceEvidenceId,
      (outgoingScores.get(relationship.sourceEvidenceId) ?? 0) + score
    );
  }

  return [...evidence].sort(
    (a, b) =>
      (outgoingScores.get(b.id) ?? 0) -
      (outgoingScores.get(a.id) ?? 0)
  )[0];
}

function pickEffectEvidence(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[],
  causeEvidenceId?: string
): V3Evidence | undefined {
  const incomingScores = new Map<string, number>();

  for (const relationship of relationships) {
    const score =
      relationship.type === "supports" ||
      relationship.type === "extends" ||
      relationship.type === "explains"
        ? 2
        : 1;

    incomingScores.set(
      relationship.targetEvidenceId,
      (incomingScores.get(relationship.targetEvidenceId) ?? 0) + score
    );
  }

  return [...evidence]
    .filter((item) => item.id !== causeEvidenceId)
    .sort(
      (a, b) =>
        (incomingScores.get(b.id) ?? 0) -
        (incomingScores.get(a.id) ?? 0)
    )[0];
}

function calculateMechanismConfidence(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): number {
  const evidenceConfidence = average(evidence.map((item) => item.confidence));
  const relationshipConfidence = average(
    relationships.map((item) => item.confidence)
  );

  const connectionBonus = Math.min(relationships.length * 0.03, 0.12);

  return round(
    Math.min(
      0.95,
      evidenceConfidence * 0.45 +
        relationshipConfidence * 0.45 +
        connectionBonus
    )
  );
}

function createMechanismTitle(
  type: V3MechanismType,
  cause: V3Evidence,
  effect: V3Evidence
): string {
  const typeLabel =
    type === "causal"
      ? "Possible causal mechanism"
      : type === "reinforcing"
      ? "Reinforcing pattern"
      : type === "constraint"
      ? "Constraint mechanism"
      : type === "tension"
      ? "Tension mechanism"
      : type === "dependency"
      ? "Dependency mechanism"
      : "Possible mechanism";

  return `${typeLabel}: ${shorten(cause.text)} → ${shorten(effect.text)}`;
}

function describeMechanism(
  type: V3MechanismType,
  relationships: V3EvidenceRelationship[]
): string {
  const dominantType = getDominantRelationshipType(relationships);

  if (type === "causal") {
    return "Evidence in this cluster suggests that one condition may be helping produce or explain another.";
  }

  if (type === "reinforcing") {
    return "Multiple evidence items appear to reinforce the same underlying pattern.";
  }

  if (type === "constraint") {
    return "Evidence suggests a limiting factor may be shaping the observed outcome.";
  }

  if (type === "tension") {
    return "Evidence points in competing directions, suggesting an unresolved tension in the current understanding.";
  }

  if (type === "dependency") {
    return "Evidence suggests one condition depends on another condition or enabling context.";
  }

  return `Evidence is connected primarily through ${dominantType} relationships.`;
}

function createExplanation(
  type: V3MechanismType,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string {
  return [
    `Discovery identified a ${type} mechanism across ${evidence.length} evidence items.`,
    `The mechanism is based on ${relationships.length} detected evidence relationships.`,
    "This should be treated as an early explanation pattern, not a final conclusion.",
  ].join(" ");
}

function createOpenQuestions(
  type: V3MechanismType,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[] {
  const questions = [
    "What additional evidence would confirm or weaken this mechanism?",
  ];

  if (type === "causal") {
    questions.push("Is the apparent cause actually producing the effect, or are both caused by something else?");
  }

  if (type === "tension") {
    questions.push("Which side of this tension is better supported by recent or higher-confidence evidence?");
  }

  if (type === "constraint") {
    questions.push("Is this constraint temporary, structural, or worsening over time?");
  }

  if (relationships.some((item) => item.type === "contradicts")) {
    questions.push("What would resolve the contradiction inside this mechanism?");
  }

  if (evidence.some((item) => item.type === "question")) {
    questions.push("Which open question is most important to answer next?");
  }

  return questions.slice(0, 3);
}

function summarizeEvidence(evidence: V3Evidence): string {
  return evidence.text;
}

function getDominantRelationshipType(
  relationships: V3EvidenceRelationship[]
): V3EvidenceRelationshipType | "unknown" {
  const counts = new Map<V3EvidenceRelationshipType, number>();

  for (const relationship of relationships) {
    counts.set(relationship.type, (counts.get(relationship.type) ?? 0) + 1);
  }

  const entries = Array.from(counts.entries());

  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function shorten(text: string): string {
  if (text.length <= 42) return text;

  return `${text.slice(0, 42).trim()}…`;
}