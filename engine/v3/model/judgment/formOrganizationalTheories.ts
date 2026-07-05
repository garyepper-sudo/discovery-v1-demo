import type {
  OrganizationalExplanation,
  OrganizationalExplanationType,
} from "./organizationalJudgment";
import type {
  FormOrganizationalTheoriesInput,
  FormOrganizationalTheoriesOutput,
  OrganizationalTheory,
  OrganizationalTheoryEvidence,
  OrganizationalTheoryPhenomenon,
  OrganizationalTheoryStatus,
} from "./organizationalTheory";

type ExplanationGroup = {
  key: string;
  explanations: OrganizationalExplanation[];
};

const DEFAULT_MAX_THEORIES = 8;

export function formOrganizationalTheories(
  input: FormOrganizationalTheoriesInput,
): FormOrganizationalTheoriesOutput {
  const explanations = input.explanations ?? [];

  if (explanations.length === 0) {
    return { theories: [] };
  }

  const groups = groupExplanations(explanations);

  const theories = groups
    .map((group, index) => buildTheory(group, index))
    .filter((theory): theory is OrganizationalTheory => Boolean(theory))
    .sort((a, b) => b.score - a.score)
    .slice(0, input.maxTheories ?? DEFAULT_MAX_THEORIES);

  return { theories };
}

function groupExplanations(
  explanations: OrganizationalExplanation[],
): ExplanationGroup[] {
  const grouped = new Map<string, OrganizationalExplanation[]>();

  for (const explanation of explanations) {
    const key = buildGroupKey(explanation);
    const existing = grouped.get(key) ?? [];
    existing.push(explanation);
    grouped.set(key, existing);
  }

  return Array.from(grouped.entries()).map(([key, groupedExplanations]) => ({
    key,
    explanations: groupedExplanations,
  }));
}

function buildGroupKey(explanation: OrganizationalExplanation): string {
  const type = getStringValue(explanation, "explanationType") ?? "unknown";
  const sourceNodeId = getStringValue(explanation, "sourceNodeId");
  const targetNodeId = getStringValue(explanation, "targetNodeId");

  if (sourceNodeId && targetNodeId) return `${type}:${sourceNodeId}:${targetNodeId}`;
  if (sourceNodeId) return `${type}:source:${sourceNodeId}`;
  if (targetNodeId) return `${type}:target:${targetNodeId}`;

  return `${type}:general`;
}

function buildTheory(
  group: ExplanationGroup,
  index: number,
): OrganizationalTheory | null {
  const explanations = group.explanations;

  if (explanations.length === 0) return null;

  const explanationTypes = unique(
    explanations
      .map((explanation) => getStringValue(explanation, "explanationType"))
      .filter(isOrganizationalExplanationType),
  );

  const reasoningPathIds = unique(
    explanations.flatMap((explanation) =>
      getStringArrayValue(explanation, "reasoningPathIds"),
    ),
  );

  const affectedNodeIds = unique(
    explanations.flatMap((explanation) =>
      [
        getStringValue(explanation, "sourceNodeId"),
        getStringValue(explanation, "targetNodeId"),
        ...getStringArrayValue(explanation, "affectedNodeIds"),
      ].filter(isString),
    ),
  );

  const centralNodeIds = findCentralNodeIds(explanations);
  const phenomenon = inferPhenomenon(explanations);

  const confidence = average(
    explanations.map((explanation) => getNumberValue(explanation, "confidence")),
  );

  const explanatoryPower = calculateExplanatoryPower(explanations);
  const actionability = calculateActionability(explanations);
  const strategicImportance = calculateStrategicImportance(explanations);
  const contradictionRisk = calculateContradictionRisk(explanations);

  const score = calculateTheoryScore({
    confidence,
    explanatoryPower,
    actionability,
    strategicImportance,
    contradictionRisk,
  });

  const status = inferStatus(score, contradictionRisk);

  return {
    id: `organizational-theory-${index + 1}`,
    title: buildTitle(phenomenon, explanations),
    thesis: buildThesis(explanations),
    summary: buildSummary(explanations),

    phenomenon,
    status,

    explanationIds: unique(
      explanations
        .map((explanation) => getStringValue(explanation, "id"))
        .filter(isString),
    ),
    reasoningPathIds,

    supportingExplanations: explanations,
    explanationTypes,

    systemicCauses: inferSystemicCauses(explanations),
    symptoms: inferSymptoms(explanations),
    reinforcingPatterns: inferReinforcingPatterns(explanations),

    affectedNodeIds,
    centralNodeIds,

    evidenceFor: buildEvidenceFor(explanations),
    evidenceAgainst: [],

    predictedDownstreamEffects: inferPredictedDownstreamEffects(explanations),
    likelyExecutiveInterpretation: buildExecutiveInterpretation(
      phenomenon,
      explanations,
    ),

    confidence,
    explanatoryPower,
    actionability,
    strategicImportance,
    contradictionRisk,

    score,
  };
}

function inferPhenomenon(
  explanations: OrganizationalExplanation[],
): OrganizationalTheoryPhenomenon {
  const text = normalize(getExplanationText(explanations));

  if (hasAny(text, ["coordination", "scheduling", "handoff", "dependency"])) {
    return "coordinationBottleneck";
  }

  if (hasAny(text, ["authority", "leadership", "decision", "approval"])) {
    return "authorityAmbiguity";
  }

  if (hasAny(text, ["dashboard", "system", "tool", "technology", "data"])) {
    return "processTechnologyMismatch";
  }

  if (hasAny(text, ["accountability", "owner", "ownership", "responsible"])) {
    return "accountabilityGap";
  }

  if (hasAny(text, ["resource", "capacity", "staffing", "bandwidth"])) {
    return "resourceConstraint";
  }

  if (hasAny(text, ["delay", "latency", "slow", "waiting"])) {
    return "decisionLatency";
  }

  if (hasAny(text, ["fragile", "failure", "breakdown", "cascade"])) {
    return "executionFragility";
  }

  if (hasAny(text, ["reinforce", "loop", "feedback", "amplify"])) {
    return "reinforcingFailureLoop";
  }

  return "unknown";
}

function buildTitle(
  phenomenon: OrganizationalTheoryPhenomenon,
  explanations: OrganizationalExplanation[],
): string {
  const centralLabel = findMostCommonLabel(explanations);

  const titleByPhenomenon: Record<OrganizationalTheoryPhenomenon, string> = {
    coordinationBottleneck: `${centralLabel} is acting as a coordination bottleneck`,
    authorityAmbiguity: `${centralLabel} reflects authority ambiguity`,
    executionFragility: `${centralLabel} is creating execution fragility`,
    informationBreakdown: `${centralLabel} reflects an information breakdown`,
    processTechnologyMismatch: `${centralLabel} reflects a process-technology mismatch`,
    accountabilityGap: `${centralLabel} reflects an accountability gap`,
    capabilityConstraint: `${centralLabel} reflects a capability constraint`,
    reinforcingFailureLoop: `${centralLabel} is part of a reinforcing failure loop`,
    governanceGap: `${centralLabel} reflects a governance gap`,
    resourceConstraint: `${centralLabel} reflects a resource constraint`,
    decisionLatency: `${centralLabel} is creating decision latency`,
    operatingModelMismatch: `${centralLabel} reflects an operating model mismatch`,
    unknown: `${centralLabel} reflects a recurring organizational pattern`,
  };

  return titleByPhenomenon[phenomenon];
}

function buildThesis(explanations: OrganizationalExplanation[]): string {
  const centralLabel = findMostCommonLabel(explanations);
  const explanationCount = explanations.length;

  return `${centralLabel} appears to be a higher-order organizational pattern supported by ${explanationCount} explanation${
    explanationCount === 1 ? "" : "s"
  }. The pattern suggests that multiple local issues are connected through a shared systemic mechanism rather than existing as isolated failures.`;
}

function buildSummary(explanations: OrganizationalExplanation[]): string {
  const strongestExplanation = [...explanations].sort(
    (a, b) => getNumberValue(b, "confidence") - getNumberValue(a, "confidence"),
  )[0];

  return (
    getStringValue(strongestExplanation, "summary") ??
    getStringValue(strongestExplanation, "description") ??
    getStringValue(strongestExplanation, "title") ??
    buildThesis(explanations)
  );
}

function inferSystemicCauses(
  explanations: OrganizationalExplanation[],
): string[] {
  return unique(
    explanations
      .map(
        (explanation) =>
          getStringValue(explanation, "title") ??
          getStringValue(explanation, "summary"),
      )
      .filter(isString),
  ).slice(0, 5);
}

function inferSymptoms(explanations: OrganizationalExplanation[]): string[] {
  return unique(
    explanations
      .map(
        (explanation) =>
          getStringValue(explanation, "description") ??
          getStringValue(explanation, "summary"),
      )
      .filter(isString),
  ).slice(0, 5);
}

function inferReinforcingPatterns(
  explanations: OrganizationalExplanation[],
): string[] {
  const patterns = explanations
    .map(
      (explanation) =>
        getStringValue(explanation, "summary") ??
        getStringValue(explanation, "description"),
    )
    .filter(isString)
    .filter((value) =>
      hasAny(normalize(value), [
        "reinforce",
        "amplify",
        "cascade",
        "compound",
        "feedback",
        "loop",
      ]),
    );

  if (patterns.length > 0) return unique(patterns).slice(0, 5);

  if (explanations.length >= 3) {
    return [
      "Multiple explanations point to the same organizational pattern, suggesting a reinforcing systemic issue rather than isolated events.",
    ];
  }

  return [];
}

function buildEvidenceFor(
  explanations: OrganizationalExplanation[],
): OrganizationalTheoryEvidence[] {
  return explanations.map((explanation) => ({
    explanationId: getStringValue(explanation, "id"),
    summary:
      getStringValue(explanation, "summary") ??
      getStringValue(explanation, "description") ??
      getStringValue(explanation, "title") ??
      "This explanation supports the organizational theory.",
    references: getKnowledgeReferences(explanation),
    confidence: getNumberValue(explanation, "confidence"),
  }));
}

function inferPredictedDownstreamEffects(
  explanations: OrganizationalExplanation[],
): string[] {
  const effects = explanations
    .map((explanation) => getStringValue(explanation, "executiveImplication"))
    .filter(isString);

  if (effects.length > 0) return unique(effects).slice(0, 5);

  return [
    "If unaddressed, this pattern is likely to continue producing downstream execution risk.",
  ];
}

function buildExecutiveInterpretation(
  phenomenon: OrganizationalTheoryPhenomenon,
  explanations: OrganizationalExplanation[],
): string {
  const centralLabel = findMostCommonLabel(explanations);

  if (phenomenon === "coordinationBottleneck") {
    return `An experienced executive would likely interpret ${centralLabel} as a central coordination constraint that is slowing or distorting execution across the organization.`;
  }

  if (phenomenon === "authorityAmbiguity") {
    return `An experienced executive would likely interpret ${centralLabel} as evidence that unclear authority or decision ownership is preventing the organization from self-correcting.`;
  }

  if (phenomenon === "processTechnologyMismatch") {
    return `An experienced executive would likely interpret ${centralLabel} as a mismatch between the organization's operating process and the tools or systems meant to support it.`;
  }

  return `An experienced executive would likely treat ${centralLabel} as a systemic organizational pattern rather than a standalone issue.`;
}

function calculateExplanatoryPower(
  explanations: OrganizationalExplanation[],
): number {
  const explanationCountScore = Math.min(1, explanations.length / 5);
  const confidenceScore = average(
    explanations.map((explanation) => getNumberValue(explanation, "confidence")),
  );

  return round((explanationCountScore + confidenceScore) / 2);
}

function calculateActionability(
  explanations: OrganizationalExplanation[],
): number {
  const actionableCount = explanations.filter((explanation) =>
    Boolean(
      getStringValue(explanation, "recommendedAction") ??
        getStringValue(explanation, "executiveImplication"),
    ),
  ).length;

  return round(Math.min(1, actionableCount / Math.max(1, explanations.length)));
}

function calculateStrategicImportance(
  explanations: OrganizationalExplanation[],
): number {
  const importanceSignals = explanations.filter((explanation) => {
    const text = normalize(getSingleExplanationText(explanation));

    return hasAny(text, [
      "risk",
      "failure",
      "leadership",
      "execution",
      "customer",
      "revenue",
      "strategic",
      "critical",
      "bottleneck",
    ]);
  }).length;

  return round(Math.min(1, importanceSignals / Math.max(1, explanations.length)));
}

function calculateContradictionRisk(
  explanations: OrganizationalExplanation[],
): number {
  const contradictionSignals = explanations.filter((explanation) => {
    const text = normalize(getSingleExplanationText(explanation));

    return hasAny(text, ["contradict", "conflict", "inconsistent", "unclear"]);
  }).length;

  return round(
    Math.min(1, contradictionSignals / Math.max(1, explanations.length)),
  );
}

function calculateTheoryScore(input: {
  confidence: number;
  explanatoryPower: number;
  actionability: number;
  strategicImportance: number;
  contradictionRisk: number;
}): number {
  return round(
    input.confidence * 0.3 +
      input.explanatoryPower * 0.3 +
      input.actionability * 0.15 +
      input.strategicImportance * 0.2 -
      input.contradictionRisk * 0.1,
  );
}

function inferStatus(
  score: number,
  contradictionRisk: number,
): OrganizationalTheoryStatus {
  if (contradictionRisk >= 0.5) return "contested";
  if (score >= 0.85) return "dominant";
  if (score >= 0.65) return "supported";
  if (score < 0.35) return "weak";
  return "candidate";
}

function findCentralNodeIds(
  explanations: OrganizationalExplanation[],
): string[] {
  const counts = new Map<string, number>();

  for (const explanation of explanations) {
    const nodeIds = [
      getStringValue(explanation, "sourceNodeId"),
      getStringValue(explanation, "targetNodeId"),
      ...getStringArrayValue(explanation, "affectedNodeIds"),
    ].filter(isString);

    for (const nodeId of nodeIds) {
      counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nodeId]) => nodeId);
}

function findMostCommonLabel(
  explanations: OrganizationalExplanation[],
): string {
  const labels = explanations
    .flatMap((explanation) => [
      getStringValue(explanation, "sourceLabel"),
      getStringValue(explanation, "targetLabel"),
      getStringValue(explanation, "title"),
    ])
    .filter(isString);

  const counts = new Map<string, number>();

  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "This pattern"
  );
}

function getExplanationText(explanations: OrganizationalExplanation[]): string {
  return explanations.map(getSingleExplanationText).join(" ");
}

function getSingleExplanationText(explanation: OrganizationalExplanation): string {
  return [
    getStringValue(explanation, "title"),
    getStringValue(explanation, "summary"),
    getStringValue(explanation, "description"),
    getStringValue(explanation, "explanationType"),
    getStringValue(explanation, "likelyExecutiveInterpretation"),
  ]
    .filter(isString)
    .join(" ");
}

function getStringValue(
  value: OrganizationalExplanation | undefined,
  key: string,
): string | undefined {
  if (!value) return undefined;

  const record = value as unknown as Record<string, unknown>;
  const field = record[key];

  return typeof field === "string" ? field : undefined;
}

function getNumberValue(
  value: OrganizationalExplanation | undefined,
  key: string,
): number {
  if (!value) return 0;

  const record = value as unknown as Record<string, unknown>;
  const field = record[key];

  return typeof field === "number" ? field : 0;
}

function getStringArrayValue(
  value: OrganizationalExplanation,
  key: string,
): string[] {
  const record = value as unknown as Record<string, unknown>;
  const field = record[key];

  return Array.isArray(field)
    ? field.filter((item): item is string => typeof item === "string")
    : [];
}

function getKnowledgeReferences(explanation: OrganizationalExplanation) {
  const record = explanation as unknown as Record<string, unknown>;
  const field = record.evidenceReferences;

  return Array.isArray(field) ? field : [];
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function hasAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isOrganizationalExplanationType(
  value: unknown,
): value is OrganizationalExplanationType {
  return (
    value === "causal" ||
    value === "dependency" ||
    value === "constraint" ||
    value === "ownership" ||
    value === "failurePropagation" ||
    value === "capabilityFormation" ||
    value === "riskAmplification" ||
    value === "leverage" ||
    value === "unknown"
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}