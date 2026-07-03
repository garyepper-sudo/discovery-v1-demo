import {
  V3Contradiction,
  V3Evidence,
  V3EvidenceNetwork,
  V3EvidenceRelationship,
  V3EvidenceRelationshipType,
  V3Mechanism,
  V3MechanismType,
  V3Theme,
} from "./types";

const CAUSAL_TERMS = [
  "because",
  "due to",
  "driven by",
  "caused by",
  "leads to",
  "resulting in",
  "as a result",
  "therefore",
  "growth",
  "demand",
  "pressure",
  "momentum",
  "advantage",
  "risk",
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
  "uncertainty",
  "margin",
  "competition",
];

const DEPENDENCY_TERMS = [
  "depends",
  "requires",
  "enabled by",
  "based on",
  "before",
  "after",
  "following",
  "if",
  "until",
];

export function buildMechanisms(
  network: V3EvidenceNetwork,
  themes: V3Theme[] = [],
  contradictions: V3Contradiction[] = []
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

    const mechanism = buildMechanismFromEvidence({
      index: mechanisms.length + 1,
      evidence: clusterEvidence,
      relationships: clusterRelationships,
      themes,
      contradictions,
      source: "cluster",
    });

    if (mechanism) mechanisms.push(mechanism);
  }

  for (const theme of themes) {
    const alreadyCovered = mechanisms.some((mechanism) =>
      mechanism.themeIds.includes(theme.id)
    );

    if (alreadyCovered) continue;

    const themeEvidence = network.evidence.filter((item) =>
      theme.evidenceIds.includes(item.id)
    );

    const themeRelationships = network.relationships.filter(
      (relationship) =>
        theme.evidenceIds.includes(relationship.sourceEvidenceId) ||
        theme.evidenceIds.includes(relationship.targetEvidenceId)
    );

    const mechanism = buildMechanismFromEvidence({
      index: mechanisms.length + 1,
      evidence: themeEvidence,
      relationships: themeRelationships,
      themes: [theme],
      contradictions,
      source: "theme",
    });

    if (mechanism) mechanisms.push(mechanism);
  }

  return mechanisms.slice(0, 8);
}

function buildMechanismFromEvidence({
  index,
  evidence,
  relationships,
  themes,
  contradictions,
  source,
}: {
  index: number;
  evidence: V3Evidence[];
  relationships: V3EvidenceRelationship[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  source: "cluster" | "theme";
}): V3Mechanism | null {
  if (evidence.length < 2) return null;

  const relationshipTypes = relationships.map((item) => item.type);
  const combinedText = evidence.map((item) => item.text).join(" ").toLowerCase();

  const type = inferMechanismType(relationshipTypes, combinedText, evidence);

  const causeEvidence = pickCauseEvidence(evidence, relationships);
  const effectEvidence = pickEffectEvidence(
    evidence,
    relationships,
    causeEvidence?.id
  );

  if (!causeEvidence || !effectEvidence) return null;

  const confidence = calculateMechanismConfidence(evidence, relationships);
  const themeIds = themesForEvidence(evidence, themes);
  const contradictionIds = contradictionsForEvidence(evidence, contradictions);

  return {
    id: `M-${index}`,
    title: createMechanismTitle(type, causeEvidence, effectEvidence),
    type,

    themeIds,
    beliefIds: [],

    cause: summarizeEvidence(causeEvidence),
    mechanism: describeMechanism(type, relationships, source),
    effect: summarizeEvidence(effectEvidence),

    evidenceIds: evidence.map((item) => item.id),
    supportingEvidenceIds: getSupportingEvidenceIds(evidence, relationships),
    contradictingEvidenceIds: getContradictingEvidenceIds(
      evidence,
      relationships
    ),
    relationshipIds: relationships.map((item) => item.id),
    contradictionIds,

    explanation: createExplanation(type, evidence, relationships, source),
    assumptions: createAssumptions(type, evidence, relationships),
    risks: createRisks(type, evidence, relationships),
    openQuestions: createOpenQuestions(type, evidence, relationships),

    confidence,
    strength: calculateMechanismStrength(evidence, relationships),
    stability: calculateMechanismStability(evidence, relationships),
  };
}

function inferMechanismType(
  relationshipTypes: V3EvidenceRelationshipType[],
  combinedText: string,
  evidence: V3Evidence[]
): V3MechanismType {
  if (
    relationshipTypes.includes("contradicts") ||
    evidence.some((item) => item.type === "risk" || item.polarity === "mixed")
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
    relationshipTypes.filter((type) => type === "supports").length >= 1 ||
    relationshipTypes.includes("duplicates")
  ) {
    return "reinforcing";
  }

  return "causal";
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
      (outgoingScores.get(a.id) ?? 0) ||
      b.confidence - a.confidence
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
          (incomingScores.get(a.id) ?? 0) ||
        b.confidence - a.confidence
    )[0];
}

function calculateMechanismConfidence(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): number {
  const evidenceConfidence = average(evidence.map((item) => item.confidence));
  const relationshipConfidence =
    relationships.length > 0
      ? average(relationships.map((item) => item.confidence))
      : evidenceConfidence * 0.9;

  const connectionBonus = Math.min(relationships.length * 0.03, 0.12);
  const evidenceBonus = Math.min(evidence.length * 0.025, 0.1);

  return round(
    Math.min(
      0.95,
      evidenceConfidence * 0.45 +
        relationshipConfidence * 0.35 +
        connectionBonus +
        evidenceBonus
    )
  );
}

function calculateMechanismStrength(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): number {
  const strongEvidenceRatio =
    evidence.length === 0
      ? 0
      : evidence.filter((item) => item.strength === "strong").length /
        evidence.length;

  const relationshipDensity = Math.min(relationships.length / 6, 1);

  return round(
    Math.min(
      1,
      average([
        average(evidence.map((item) => item.confidence)),
        strongEvidenceRatio || 0.5,
        relationshipDensity || 0.5,
      ])
    )
  );
}

function calculateMechanismStability(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): number {
  const contradictionPenalty = relationships.some(
    (item) => item.type === "contradicts"
  )
    ? 0.18
    : 0;

  const confidenceBase = average(evidence.map((item) => item.confidence));
  const relationshipBase =
    relationships.length > 0
      ? average(relationships.map((item) => item.confidence))
      : confidenceBase;

  return round(
    Math.max(
      0.1,
      confidenceBase * 0.55 + relationshipBase * 0.45 - contradictionPenalty
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
      ? "Causal mechanism"
      : type === "reinforcing"
      ? "Reinforcing mechanism"
      : type === "constraint"
      ? "Constraint mechanism"
      : type === "tension"
      ? "Tension mechanism"
      : type === "dependency"
      ? "Dependency mechanism"
      : "Mechanism";

  return `${typeLabel}: ${shorten(cause.text)} → ${shorten(effect.text)}`;
}

function describeMechanism(
  type: V3MechanismType,
  relationships: V3EvidenceRelationship[],
  source: "cluster" | "theme"
): string {
  if (type === "causal") {
    return "Discovery sees a possible cause-effect path connecting these evidence items.";
  }

  if (type === "reinforcing") {
    return "Discovery sees multiple signals reinforcing the same underlying pattern.";
  }

  if (type === "constraint") {
    return "Discovery sees a limiting factor that may be shaping the outcome.";
  }

  if (type === "tension") {
    return "Discovery sees competing signals that create an unresolved strategic tension.";
  }

  if (type === "dependency") {
    return "Discovery sees one condition depending on another enabling condition.";
  }

  return source === "theme"
    ? "Discovery inferred this mechanism from evidence grouped under the same theme."
    : "Discovery inferred this mechanism from connected evidence.";
}

function createExplanation(
  type: V3MechanismType,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[],
  source: "cluster" | "theme"
): string {
  const basis =
    source === "theme"
      ? "a shared theme"
      : `${relationships.length} detected evidence relationships`;

  return [
    `Discovery identified a ${type} mechanism across ${evidence.length} evidence items.`,
    `The mechanism is based on ${basis}.`,
    "This gives the belief layer an explicit explanation path instead of jumping directly from pattern to conclusion.",
  ].join(" ");
}

function createAssumptions(
  type: V3MechanismType,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[] {
  const assumptions: string[] = [];

  if (type === "causal") {
    assumptions.push(
      "The apparent cause is meaningfully related to the observed effect."
    );
  }

  if (type === "dependency") {
    assumptions.push(
      "The dependent condition cannot be understood without the enabling context."
    );
  }

  if (type === "reinforcing") {
    assumptions.push(
      "The repeated evidence reflects a real pattern rather than noise."
    );
  }

  if (relationships.length < 2) {
    assumptions.push(
      "The mechanism is inferred from thematic proximity more than dense evidence relationships."
    );
  }

  if (evidence.some((item) => item.type === "claim")) {
    assumptions.push(
      "Part of this mechanism depends on claims that may need validation."
    );
  }

  return assumptions.slice(0, 3);
}

function createRisks(
  type: V3MechanismType,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[] {
  const risks: string[] = [];

  if (type === "tension") {
    risks.push(
      "Competing evidence may change this mechanism as more information arrives."
    );
  }

  if (type === "constraint") {
    risks.push(
      "The constraint may become more important if it remains unresolved."
    );
  }

  if (relationships.some((item) => item.type === "contradicts")) {
    risks.push(
      "Contradictory evidence reduces confidence in a single clean explanation."
    );
  }

  if (average(evidence.map((item) => item.confidence)) < 0.65) {
    risks.push(
      "The evidence base is not yet strong enough to treat this as settled."
    );
  }

  return risks.slice(0, 3);
}

function createOpenQuestions(
  type: V3MechanismType,
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[] {
  const questions = [
    "What evidence would confirm or weaken this mechanism?",
  ];

  if (type === "causal") {
    questions.push(
      "Is the apparent cause actually producing the effect, or are both caused by something else?"
    );
  }

  if (type === "tension") {
    questions.push(
      "Which side of this tension is better supported by recent or higher-confidence evidence?"
    );
  }

  if (type === "constraint") {
    questions.push(
      "Is this constraint temporary, structural, or worsening over time?"
    );
  }

  if (relationships.some((item) => item.type === "contradicts")) {
    questions.push("What would resolve this contradiction?");
  }

  return questions.slice(0, 3);
}

function getSupportingEvidenceIds(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[] {
  const contradictedIds = new Set(
    getContradictingEvidenceIds(evidence, relationships)
  );

  return evidence
    .filter((item) => item.polarity !== "negative")
    .filter((item) => !contradictedIds.has(item.id))
    .map((item) => item.id);
}

function getContradictingEvidenceIds(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[] {
  const ids = new Set<string>();

  for (const relationship of relationships) {
    if (relationship.type === "contradicts") {
      ids.add(relationship.sourceEvidenceId);
      ids.add(relationship.targetEvidenceId);
    }
  }

  for (const item of evidence) {
    if (item.polarity === "negative") ids.add(item.id);
  }

  return evidence.filter((item) => ids.has(item.id)).map((item) => item.id);
}

function themesForEvidence(
  evidence: V3Evidence[],
  themes: V3Theme[]
): string[] {
  return themes
    .filter((theme) =>
      theme.evidenceIds.some((id) => evidence.some((item) => item.id === id))
    )
    .map((theme) => theme.id);
}

function contradictionsForEvidence(
  evidence: V3Evidence[],
  contradictions: V3Contradiction[]
): string[] {
  return contradictions
    .filter((contradiction) =>
      contradiction.evidenceIds.some((id) =>
        evidence.some((item) => item.id === id)
      )
    )
    .map((contradiction) => contradiction.id);
}

function summarizeEvidence(evidence: V3Evidence): string {
  return evidence.text;
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