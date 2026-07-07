type OrganizationalConditionStatus =
  | "stable"
  | "emerging"
  | "improving"
  | "deteriorating"
  | "constrained"
  | "weak"
  | "unresolved";

type OrganizationalConditionPriority = "critical" | "high" | "medium" | "low";

type ConditionDefinition = {
  domain: string;
  name: string;
  signals: string[];
  executiveAction: string;
  whyItMatters: string;
  healthyDescription: string;
  constrainedDescription: string;
  primaryRisk: string;
  improvementOutcome: string;
  upstreamDomains: string[];
  downstreamDomains: string[];
};

type ConditionSupport = {
  concepts: any[];
  beliefs: any[];
  mechanisms: any[];
  theories: any[];
  evolution: any[];
};

type ConditionAssessment = {
  summary: string;
  healthReason: string;
  trendReason: string;
  relationshipReason: string;
  recommendedExecutiveAction: string;
  uncertaintySummary: string;
  confidenceLimiters: string[];
  missingEvidence: string[];
};

export type OrganizationalCondition = {
  id: string;
  name: string;
  domain: string;
  status: OrganizationalConditionStatus;
  priority: OrganizationalConditionPriority;
  confidence: number;
  strength: number;
  trend: "strengthening" | "weakening" | "stable" | "new";
  summary: string;
  whyItMatters: string;
  supportingConceptIds: string[];
  supportingBeliefIds: string[];
  supportingMechanismIds: string[];
  supportingTheoryIds: string[];
  recommendedExecutiveAction: string;
  uncertaintySummary: string;
  confidenceLimiters: string[];
  missingEvidence: string[];
  lastUpdatedAt: string;
};

export type OrganizationalState = {
  id: string;
  summary: string;
  status: "healthy" | "watch" | "strained" | "critical" | "uncertain";
  confidence: number;
  dominantConditions: string[];
  improvingConditions: string[];
  deterioratingConditions: string[];
  unresolvedTensions: string[];
  executiveImplication: string;
  recommendedFocus: string[];
  lastUpdatedAt: string;
};

type InferOrganizationalConditionsInput = {
  conceptualUnderstanding?: any[];
  organizationalBeliefs?: any[];
  mechanisms?: any[];
  theories?: any[];
  theoryEvolution?: any[];
  capabilities?: any[];
  memoryMaturity?: any;
  previousConditions?: OrganizationalCondition[];
  previousState?: OrganizationalState;
  now: string;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string): string {
  const cleaned = normalize(value);
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function textOf(...values: Array<string | undefined>): string {
  return normalize(values.filter(Boolean).join(" "));
}

function includesAny(text: string, signals: string[]): boolean {
  return signals.some((signal) => text.includes(normalize(signal)));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function conditionId(domain: string): string {
  return `condition-${normalize(domain).replace(/\s+/g, "-")}`;
}

const CONDITION_DEFINITIONS: ConditionDefinition[] = [
  {
    domain: "coordination",
    name: "Coordination System",
    signals: [
      "coordination",
      "cross functional",
      "handoff",
      "ownership",
      "interface",
      "silo",
      "duplicated",
      "friction",
    ],
    executiveAction:
      "Clarify cross-functional ownership, handoffs, and operating interfaces before scaling additional work.",
    whyItMatters:
      "Coordination conditions determine whether teams can convert shared intent into synchronized execution.",
    healthyDescription:
      "Teams can move work across boundaries through clear ownership, reliable handoffs, and explicit operating interfaces.",
    constrainedDescription:
      "Cross-functional work depends too heavily on informal coordination, unclear ownership, or manual handoff management.",
    primaryRisk:
      "Execution slows because work must be repeatedly re-coordinated instead of flowing through reliable interfaces.",
    improvementOutcome:
      "Execution should become more predictable as teams can coordinate through clearer ownership and handoff expectations.",
    upstreamDomains: ["leadershipDependency", "decisionFlow", "operatingModel"],
    downstreamDomains: ["executionCapacity", "learning"],
  },
  {
    domain: "knowledgeContinuity",
    name: "Knowledge Continuity",
    signals: [
      "knowledge",
      "documentation",
      "memory",
      "continuity",
      "handoff",
      "transfer",
      "retention",
      "context loss",
    ],
    executiveAction:
      "Preserve reusable knowledge and reduce dependency on informal context transfer.",
    whyItMatters:
      "Knowledge continuity determines whether organizational learning survives handoffs, growth, and personnel change.",
    healthyDescription:
      "Critical knowledge is preserved, findable, and reusable across people, documents, handoffs, and repeated work.",
    constrainedDescription:
      "Knowledge remains localized in people, conversations, or one-off work rather than becoming reusable organizational memory.",
    primaryRisk:
      "Teams rediscover context, repeat prior work, and become more dependent on individuals who hold institutional knowledge.",
    improvementOutcome:
      "The organization should onboard faster, repeat fewer mistakes, and preserve understanding through growth or personnel change.",
    upstreamDomains: ["learning", "operatingModel"],
    downstreamDomains: ["leadershipDependency", "coordination", "executionCapacity"],
  },
  {
    domain: "learning",
    name: "Learning System",
    signals: [
      "learning",
      "adaptation",
      "feedback",
      "reuse",
      "improvement",
      "organizational learning failure",
    ],
    executiveAction:
      "Create feedback loops that turn repeated experience into reusable operating improvement.",
    whyItMatters:
      "The learning system determines whether the organization becomes smarter from repeated experience.",
    healthyDescription:
      "Repeated experience changes how the organization works by creating reusable practices, stronger judgment, and better operating memory.",
    constrainedDescription:
      "The organization experiences recurring issues without reliably converting them into improved operating behavior.",
    primaryRisk:
      "The same problems reappear because experience is not being transformed into durable organizational learning.",
    improvementOutcome:
      "The organization should improve faster because lessons from repeated work become part of the operating system.",
    upstreamDomains: ["knowledgeContinuity", "executionCapacity"],
    downstreamDomains: ["operatingModel", "strategicAlignment", "coordination"],
  },
  {
    domain: "decisionFlow",
    name: "Decision Flow",
    signals: [
      "decision",
      "authority",
      "approval",
      "governance",
      "latency",
      "escalation",
      "centralized",
    ],
    executiveAction:
      "Clarify decision rights and reduce avoidable approval dependency.",
    whyItMatters:
      "Decision flow determines how quickly the organization can resolve ambiguity and move work forward.",
    healthyDescription:
      "Decision rights are clear enough that teams can resolve ambiguity and move work forward without unnecessary escalation.",
    constrainedDescription:
      "Decisions appear to depend on centralized authority, approval loops, or unclear governance rather than distributed operating judgment.",
    primaryRisk:
      "Throughput slows because unresolved decisions accumulate around a small number of leaders or approval points.",
    improvementOutcome:
      "The organization should move faster as teams gain clearer authority to resolve routine ambiguity without escalation.",
    upstreamDomains: ["leadershipDependency", "operatingModel", "strategicAlignment"],
    downstreamDomains: ["coordination", "executionCapacity"],
  },
  {
    domain: "executionCapacity",
    name: "Execution Capacity",
    signals: [
      "execution",
      "capacity",
      "delivery",
      "throughput",
      "resource",
      "overload",
      "constraint",
      "strain",
    ],
    executiveAction:
      "Identify where demand exceeds execution capacity and protect the highest-leverage work.",
    whyItMatters:
      "Execution capacity determines whether strategic intent can become completed work.",
    healthyDescription:
      "The organization has enough capacity, focus, and operating discipline to convert strategic intent into completed work.",
    constrainedDescription:
      "Execution demand appears to exceed the organization's available capacity, focus, coordination bandwidth, or decision throughput.",
    primaryRisk:
      "Strategic work remains incomplete because organizational demand outpaces the system's ability to absorb and execute it.",
    improvementOutcome:
      "Execution should become more reliable as work is prioritized, sequenced, and protected from avoidable coordination drag.",
    upstreamDomains: ["coordination", "decisionFlow", "knowledgeContinuity", "strategicAlignment"],
    downstreamDomains: ["learning"],
  },
  {
    domain: "strategicAlignment",
    name: "Strategic Alignment",
    signals: [
      "strategy",
      "strategic",
      "alignment",
      "priority",
      "tradeoff",
      "narrative",
      "drift",
    ],
    executiveAction:
      "Reinforce shared priorities and resolve conflicting interpretations of what matters most.",
    whyItMatters:
      "Strategic alignment determines whether teams make consistent tradeoffs without constant escalation.",
    healthyDescription:
      "Teams share enough strategic context to make consistent tradeoffs without constant executive interpretation.",
    constrainedDescription:
      "Teams appear to be operating from inconsistent priorities, narratives, or interpretations of what matters most.",
    primaryRisk:
      "Local decisions diverge from enterprise priorities, increasing escalation, rework, and execution drift.",
    improvementOutcome:
      "The organization should make cleaner tradeoffs as teams interpret priorities through a shared strategic narrative.",
    upstreamDomains: ["leadershipDependency", "learning"],
    downstreamDomains: ["decisionFlow", "executionCapacity", "coordination"],
  },
  {
    domain: "operatingModel",
    name: "Operating Model",
    signals: [
      "operating model",
      "role",
      "workflow",
      "ownership",
      "expectation",
      "process",
      "ambiguity",
    ],
    executiveAction:
      "Make the operating model explicit enough to guide consistent action across teams.",
    whyItMatters:
      "The operating model determines how reliably the organization can coordinate roles, workflows, and expectations.",
    healthyDescription:
      "Roles, workflows, decision rights, and expectations are explicit enough to guide consistent action across teams.",
    constrainedDescription:
      "The organization appears to rely on implicit expectations, unclear roles, or informal process knowledge to get work done.",
    primaryRisk:
      "Execution quality varies because teams must infer how the system is supposed to work.",
    improvementOutcome:
      "Execution should become more consistent as people understand roles, workflows, decision rights, and operating expectations.",
    upstreamDomains: ["learning", "strategicAlignment"],
    downstreamDomains: ["coordination", "decisionFlow", "knowledgeContinuity"],
  },
  {
    domain: "leadershipDependency",
    name: "Leadership Dependency",
    signals: [
      "leadership dependency",
      "centralized",
      "approval dependency",
      "authority centralized",
      "escalation dependence",
    ],
    executiveAction:
      "Reduce unnecessary leadership dependency by distributing clear authority where possible.",
    whyItMatters:
      "Leadership dependency determines whether organizational throughput scales beyond a small number of decision makers.",
    healthyDescription:
      "Leaders set direction and resolve high-leverage ambiguity while routine decisions and execution continue without constant escalation.",
    constrainedDescription:
      "Organizational progress appears too dependent on a small number of leaders, approval points, or centralized decision makers.",
    primaryRisk:
      "Scaling remains constrained because decision throughput, context transfer, and prioritization depend on too few people.",
    improvementOutcome:
      "The organization should scale more effectively as authority, context, and decision rights become more distributed.",
    upstreamDomains: ["knowledgeContinuity", "strategicAlignment", "operatingModel"],
    downstreamDomains: ["decisionFlow", "coordination", "executionCapacity"],
  },
];

function objectText(object: any): string {
  return textOf(
    object?.id,
    object?.statement,
    object?.summary,
    object?.explanation,
    object?.semanticSignature,
    object?.status,
    object?.trend,
    Array.isArray(object?.keywords) ? object.keywords.join(" ") : undefined,
  );
}

function labelOf(object: any): string {
  return (
    object?.statement ??
    object?.title ??
    object?.name ??
    object?.summary ??
    object?.id ??
    ""
  );
}

function topBySignal<T>(
  values: T[],
  score: (value: T) => number,
  limit: number,
): T[] {
  return values
    .slice()
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

function joinHuman(values: string[]): string {
  const clean = unique(values.map((value) => value.trim()).filter(Boolean));
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

function evidenceBreadthLabel(support: ConditionSupport): string {
  const parts = [
    support.concepts.length > 0
      ? `${support.concepts.length} concept${support.concepts.length === 1 ? "" : "s"}`
      : "",
    support.beliefs.length > 0
      ? `${support.beliefs.length} belief${support.beliefs.length === 1 ? "" : "s"}`
      : "",
    support.mechanisms.length > 0
      ? `${support.mechanisms.length} mechanism${support.mechanisms.length === 1 ? "" : "s"}`
      : "",
    support.theories.length > 0
      ? `${support.theories.length} theor${support.theories.length === 1 ? "y" : "ies"}`
      : "",
  ].filter(Boolean);

  return joinHuman(parts);
}

function missingEvidenceForDefinition(
  definition: ConditionDefinition,
  support: ConditionSupport,
): string[] {
  const missing: string[] = [];

  if (support.mechanisms.length === 0) {
    missing.push(
      `Concrete mechanism evidence showing how ${definition.name} appears in day-to-day work.`,
    );
  }

  if (support.beliefs.length === 0) {
    missing.push(
      `Organizational belief evidence showing whether people consistently experience ${definition.name} as a real constraint.`,
    );
  }

  if (support.theories.length === 0) {
    missing.push(
      `Higher-order theory evidence connecting ${definition.name} to broader organizational behavior.`,
    );
  }

  if (support.evolution.length === 0) {
    missing.push(
      `Longitudinal evidence showing whether ${definition.name} is persistent, improving, or deteriorating over time.`,
    );
  }

  if (definition.domain === "coordination") {
    missing.push(
      "Examples of cross-functional handoffs, ownership boundaries, and where work slows between teams.",
    );
  }

  if (definition.domain === "knowledgeContinuity") {
    missing.push(
      "Evidence about where operational knowledge lives, how often it is reused, and whether documentation is trusted.",
    );
  }

  if (definition.domain === "learning") {
    missing.push(
      "Evidence showing whether repeated problems become reusable process improvements or continue to recur.",
    );
  }

  if (definition.domain === "decisionFlow") {
    missing.push(
      "Evidence about decision rights, approval paths, escalation frequency, and where decisions wait.",
    );
  }

  if (definition.domain === "executionCapacity") {
    missing.push(
      "Evidence about workload, prioritization, delivery delays, and where demand exceeds operating capacity.",
    );
  }

  if (definition.domain === "strategicAlignment") {
    missing.push(
      "Evidence about how teams interpret priorities, make tradeoffs, and resolve conflicting strategic narratives.",
    );
  }

  if (definition.domain === "operatingModel") {
    missing.push(
      "Evidence about roles, workflows, decision rights, and whether operating expectations are explicit.",
    );
  }

  if (definition.domain === "leadershipDependency") {
    missing.push(
      "Evidence about which decisions require leadership approval and how often teams can proceed without escalation.",
    );
  }

  return unique(missing).slice(0, 5);
}

function inferConfidenceLimiters(params: {
  definition: ConditionDefinition;
  confidence: number;
  strength: number;
  support: ConditionSupport;
  trend: OrganizationalCondition["trend"];
}): string[] {
  const { definition, confidence, strength, support, trend } = params;
  const limiters: string[] = [];

  if (confidence < 0.65) {
    limiters.push(
      `${definition.name} confidence is moderate because the supporting evidence is not yet strong enough for a high-confidence diagnosis.`,
    );
  }

  if (strength < 0.65) {
    limiters.push(
      `${definition.name} strength is still developing, so Discovery should treat the condition as important but not fully settled.`,
    );
  }

  if (support.mechanisms.length < 2) {
    limiters.push(
      "There are not yet enough concrete mechanisms explaining how this condition operates.",
    );
  }

  if (support.beliefs.length === 0) {
    limiters.push(
      "Discovery has limited belief-level evidence showing how consistently this condition is experienced across the organization.",
    );
  }

  if (support.evolution.length === 0 || trend === "new") {
    limiters.push(
      "Discovery has limited longitudinal evidence, so it cannot yet distinguish a persistent condition from a temporary signal.",
    );
  }

  return unique(limiters).slice(0, 4);
}

function synthesizeUncertainty(params: {
  definition: ConditionDefinition;
  confidence: number;
  support: ConditionSupport;
  missingEvidence: string[];
  confidenceLimiters: string[];
}): string {
  const { definition, confidence, support, missingEvidence, confidenceLimiters } =
    params;

  const confidencePercent = Math.round(confidence * 100);
  const breadth = evidenceBreadthLabel(support);

  if (confidenceLimiters.length === 0 && missingEvidence.length === 0) {
    return `Discovery has relatively strong confidence in ${definition.name} because the condition is supported across ${breadth || "multiple organizational signals"}.`;
  }

  const primaryLimiter =
    confidenceLimiters[0] ??
    `Discovery needs more evidence before treating ${definition.name} as fully understood.`;

  const primaryMissingEvidence =
    missingEvidence[0] ??
    "Additional operating evidence would improve this assessment.";

  return `Discovery currently assigns ${confidencePercent}% confidence to ${definition.name}. ${primaryLimiter} The highest-value missing evidence is: ${primaryMissingEvidence}`;
}

function inferHealthReason(params: {
  definition: ConditionDefinition;
  status: OrganizationalConditionStatus;
  priority: OrganizationalConditionPriority;
  strength: number;
  confidence: number;
  support: ConditionSupport;
  hasWeakeningSignal: boolean;
  hasImprovingSignal: boolean;
}): string {
  const {
    definition,
    status,
    priority,
    strength,
    confidence,
    support,
    hasWeakeningSignal,
    hasImprovingSignal,
  } = params;

  const breadth = evidenceBreadthLabel(support);
  const confidenceText = `${Math.round(confidence * 100)}% confidence`;
  const strengthText = `${Math.round(strength * 100)}% condition strength`;

  if (status === "deteriorating") {
    return `${definition.name} is deteriorating because multiple weakening signals point to ${definition.constrainedDescription.toLowerCase()} Discovery sees ${breadth || "several organizational signals"} behind this assessment, with ${confidenceText} and ${strengthText}.`;
  }

  if (status === "constrained") {
    return `${definition.name} is constrained because the evidence suggests ${definition.constrainedDescription.toLowerCase()} Discovery sees ${breadth || "supporting organizational signals"} behind this assessment, with ${confidenceText} and ${strengthText}.`;
  }

  if (status === "improving") {
    return `${definition.name} appears to be improving because strengthening signals outweigh current constraint signals. Discovery still treats the condition as active because ${breadth || "some supporting signals"} remain visible, with ${confidenceText}.`;
  }

  if (status === "stable" && hasWeakeningSignal) {
    return `${definition.name} appears stable but still carries risk. Constraint signals are present, yet the overall pattern has not crossed the threshold for deterioration. Discovery assigns ${confidenceText}.`;
  }

  if (status === "stable") {
    return `${definition.name} appears stable because the available signals are consistent and do not currently indicate major deterioration. Discovery assigns ${confidenceText}.`;
  }

  if (status === "weak") {
    return `${definition.name} is weak because the condition is visible but not yet supported strongly enough for a higher-confidence diagnosis. Discovery assigns ${confidenceText}.`;
  }

  if (status === "unresolved") {
    return `${definition.name} remains unresolved because the available signals point in competing directions. Discovery needs more operating evidence before treating this as a stable diagnosis.`;
  }

  return `${definition.name} is emerging because Discovery sees early signals of this condition, but the pattern is not yet mature enough for a stronger health assessment. Discovery assigns ${confidenceText}.`;
}

function inferTrendReason(params: {
  definition: ConditionDefinition;
  trend: OrganizationalCondition["trend"];
  previousCondition?: OrganizationalCondition;
  confidence: number;
  support: ConditionSupport;
}): string {
  const { definition, trend, previousCondition, confidence, support } = params;
  const breadth = evidenceBreadthLabel(support);

  if (trend === "new") {
    return `This is a new condition-level signal. Discovery has not yet observed enough history to distinguish whether ${definition.name} is persistent, temporary, or recently changed.`;
  }

  const previousConfidence = previousCondition?.confidence ?? confidence;
  const delta = Math.round((confidence - previousConfidence) * 100);

  if (trend === "strengthening") {
    return `${definition.name} is strengthening because confidence increased by ${Math.abs(delta)} point(s) versus the prior condition snapshot, supported by ${breadth || "additional organizational signals"}.`;
  }

  if (trend === "weakening") {
    return `${definition.name} is weakening because confidence declined by ${Math.abs(delta)} point(s) versus the prior condition snapshot. Discovery should check whether earlier signals are resolving or becoming less central.`;
  }

  return `${definition.name} appears longitudinally stable. The condition remains present without a material confidence shift from the previous snapshot.`;
}

function inferRelationshipReason(params: {
  definition: ConditionDefinition;
  conditions?: OrganizationalCondition[];
}): string {
  const { definition, conditions = [] } = params;

  const conditionByDomain = new Map(
    conditions.map((condition) => [condition.domain, condition]),
  );

  const activeUpstream = definition.upstreamDomains
    .map((domain) => conditionByDomain.get(domain))
    .filter((condition): condition is OrganizationalCondition => Boolean(condition))
    .filter((condition) =>
      ["critical", "high"].includes(condition.priority) ||
      ["deteriorating", "constrained"].includes(condition.status),
    );

  const activeDownstream = definition.downstreamDomains
    .map((domain) => conditionByDomain.get(domain))
    .filter((condition): condition is OrganizationalCondition => Boolean(condition));

  const upstreamNames = activeUpstream.map((condition) => condition.name);
  const downstreamNames = activeDownstream.map((condition) => condition.name);

  if (upstreamNames.length > 0 && downstreamNames.length > 0) {
    return `${definition.name} appears connected to ${joinHuman(upstreamNames)} upstream and may influence ${joinHuman(downstreamNames)} downstream.`;
  }

  if (upstreamNames.length > 0) {
    return `${definition.name} appears partly shaped by ${joinHuman(upstreamNames)}.`;
  }

  if (downstreamNames.length > 0) {
    return `${definition.name} may influence ${joinHuman(downstreamNames)}.`;
  }

  return `${definition.name} is currently being assessed as a standalone condition because Discovery has not yet found enough active neighboring conditions to explain its system role.`;
}

function synthesizeConditionAssessment(params: {
  definition: ConditionDefinition;
  support: ConditionSupport;
  status: OrganizationalConditionStatus;
  priority: OrganizationalConditionPriority;
  strength: number;
  confidence: number;
  trend: OrganizationalCondition["trend"];
  previousCondition?: OrganizationalCondition;
  hasWeakeningSignal: boolean;
  hasImprovingSignal: boolean;
}): ConditionAssessment {
  const {
    definition,
    support,
    status,
    priority,
    strength,
    confidence,
    trend,
    previousCondition,
    hasWeakeningSignal,
    hasImprovingSignal,
  } = params;

  const topConcepts = topBySignal(
    support.concepts,
    (concept) => concept.explanatoryPower ?? concept.confidence ?? 0,
    3,
  );

  const topMechanisms = topBySignal(
    support.mechanisms,
    (mechanism) => mechanism.confidence ?? mechanism.strength ?? 0.5,
    4,
  );

  const topBeliefs = topBySignal(
    support.beliefs,
    (belief) => belief.confidence ?? 0.5,
    3,
  );

  const topTheories = topBySignal(
    support.theories,
    (theory) => theory.explanatoryPower ?? theory.confidence ?? theory.strength ?? 0.5,
    3,
  );

  const driverLabels = unique([
    ...topMechanisms.map((mechanism) => titleCase(labelOf(mechanism))),
    ...topBeliefs.map((belief) => titleCase(labelOf(belief))),
    ...topTheories.map((theory) => titleCase(labelOf(theory))),
    ...topConcepts.map((concept) => titleCase(labelOf(concept))),
  ]).slice(0, 5);

  const healthReason = inferHealthReason({
    definition,
    status,
    priority,
    strength,
    confidence,
    support,
    hasWeakeningSignal,
    hasImprovingSignal,
  });

  const trendReason = inferTrendReason({
    definition,
    trend,
    previousCondition,
    confidence,
    support,
  });

  const driverSentence =
    driverLabels.length > 0
      ? `The strongest drivers are ${joinHuman(driverLabels)}.`
      : "Discovery does not yet have enough specific drivers to explain this condition confidently.";

  const statusSentence =
    status === "deteriorating"
      ? `${definition.name} is getting worse.`
      : status === "constrained"
        ? `${definition.name} is limiting organizational performance.`
        : status === "improving"
            ? `${definition.name} is improving but still needs monitoring.`
            : status === "stable"
              ? `${definition.name} is stable.`
              : `${definition.name} is still forming as an organizational signal.`;

  const prioritySentence =
    priority === "critical"
      ? "This deserves immediate executive attention because the risk is broad and strongly supported."
      : priority === "high"
        ? "This deserves executive attention because it has broad organizational leverage."
        : priority === "medium"
          ? "This should be monitored and improved where it constrains execution."
          : "This is a lower-priority signal until more evidence accumulates.";

  const summary = [
    statusSentence,
    status === "improving" || (status === "stable" && !hasWeakeningSignal)
      ? definition.healthyDescription
      : definition.constrainedDescription,
    driverSentence,
    `If ignored, ${definition.primaryRisk.toLowerCase()}`,
    prioritySentence,
    `If improved, ${definition.improvementOutcome.toLowerCase()}`,
    trendReason,
  ].join(" ");

  const missingEvidence = missingEvidenceForDefinition(definition, support);

  const confidenceLimiters = inferConfidenceLimiters({
    definition,
    confidence,
    strength,
    support,
    trend,
  });

  const uncertaintySummary = synthesizeUncertainty({
    definition,
    confidence,
    support,
    missingEvidence,
    confidenceLimiters,
  });

  return {
    summary,
    healthReason,
    trendReason,
    relationshipReason: "",
    recommendedExecutiveAction: `${definition.executiveAction} ${healthReason}`,
    uncertaintySummary,
    confidenceLimiters,
    missingEvidence,
  };
}

function scoreDomain(params: {
  definition: ConditionDefinition;
  conceptualUnderstanding: any[];
  organizationalBeliefs: any[];
  mechanisms: any[];
  theories: any[];
  theoryEvolution: any[];
  previousCondition?: OrganizationalCondition;
}): OrganizationalCondition | null {
  const {
    definition,
    conceptualUnderstanding,
    organizationalBeliefs,
    mechanisms,
    theories,
    theoryEvolution,
    previousCondition,
  } = params;

  const matchingConcepts = conceptualUnderstanding.filter((concept) =>
    includesAny(objectText(concept), definition.signals),
  );

  const matchingBeliefs = organizationalBeliefs.filter((belief) =>
    includesAny(objectText(belief), definition.signals),
  );

  const matchingMechanisms = mechanisms.filter((mechanism) =>
    includesAny(objectText(mechanism), definition.signals),
  );

  const matchingTheories = theories.filter((theory) =>
    includesAny(objectText(theory), definition.signals),
  );

  const matchingEvolution = theoryEvolution.filter((event) =>
    includesAny(objectText(event), definition.signals),
  );

  const evidenceBreadth =
    matchingConcepts.length +
    matchingBeliefs.length +
    matchingMechanisms.length +
    matchingTheories.length +
    matchingEvolution.length;

  if (evidenceBreadth === 0 && !previousCondition) return null;

  const conceptConfidence = average(
    matchingConcepts.map((concept) => concept.confidence ?? 0.5),
  );
  const beliefConfidence = average(
    matchingBeliefs.map((belief) => belief.confidence ?? 0.5),
  );
  const mechanismConfidence = average(
    matchingMechanisms.map((mechanism) => mechanism.confidence ?? 0.5),
  );
  const theoryConfidence = average(
    matchingTheories.map((theory) => theory.confidence ?? 0.5),
  );

  const confidence = clamp01(
    average(
      [
        conceptConfidence,
        beliefConfidence,
        mechanismConfidence,
        theoryConfidence,
      ].filter((value) => value > 0),
    ) || previousCondition?.confidence || 0.35,
  );

  const supportStrength = clamp01(evidenceBreadth / 10);
  const continuityBoost = previousCondition ? 0.08 : 0;
  const strength = clamp01(
    confidence * 0.65 + supportStrength * 0.27 + continuityBoost,
  );

  const allText = [
    ...matchingConcepts,
    ...matchingBeliefs,
    ...matchingMechanisms,
    ...matchingTheories,
    ...matchingEvolution,
  ]
    .map(objectText)
    .join(" ");

  const hasImprovingSignal = includesAny(allText, [
    "improving",
    "improved",
    "strengthening",
    "reinforced",
    "stable",
  ]);

  const hasWeakeningSignal = includesAny(allText, [
    "weakening",
    "deteriorating",
    "failure",
    "breakdown",
    "drift",
    "loss",
    "constraint",
    "strain",
    "bottleneck",
    "friction",
  ]);

  const status: OrganizationalConditionStatus =
    hasWeakeningSignal && strength >= 0.68
      ? "deteriorating"
      : hasWeakeningSignal
        ? "constrained"
        : hasImprovingSignal && strength >= 0.62
          ? "improving"
          : previousCondition?.status === "stable" || strength >= 0.72
            ? "stable"
            : "emerging";

  const trend: OrganizationalCondition["trend"] =
    previousCondition && confidence > previousCondition.confidence + 0.05
      ? "strengthening"
      : previousCondition && confidence < previousCondition.confidence - 0.05
        ? "weakening"
        : previousCondition
          ? "stable"
          : "new";

  const priority: OrganizationalConditionPriority =
    strength >= 0.78 && hasWeakeningSignal
      ? "critical"
      : strength >= 0.65
        ? "high"
        : strength >= 0.45
          ? "medium"
          : "low";

  const support: ConditionSupport = {
    concepts: matchingConcepts,
    beliefs: matchingBeliefs,
    mechanisms: matchingMechanisms,
    theories: matchingTheories,
    evolution: matchingEvolution,
  };

  const assessment = synthesizeConditionAssessment({
    definition,
    support,
    status,
    priority,
    strength,
    confidence,
    trend,
    previousCondition,
    hasWeakeningSignal,
    hasImprovingSignal,
  });

  return {
    id: conditionId(definition.domain),
    name: definition.name,
    domain: definition.domain,
    status,
    priority,
    confidence,
    strength,
    trend,
    summary: assessment.summary,
    whyItMatters: `${definition.whyItMatters} ${assessment.healthReason}`,
    supportingConceptIds: unique(matchingConcepts.map((concept) => concept.id)),
    supportingBeliefIds: unique(matchingBeliefs.map((belief) => belief.id)),
    supportingMechanismIds: unique(matchingMechanisms.map((mechanism) => mechanism.id)),
    supportingTheoryIds: unique(matchingTheories.map((theory) => theory.id)),
    recommendedExecutiveAction: assessment.recommendedExecutiveAction,
    uncertaintySummary: assessment.uncertaintySummary,
    confidenceLimiters: assessment.confidenceLimiters,
    missingEvidence: assessment.missingEvidence,
    lastUpdatedAt: "",
  };
}

function inferConditionSystemRelationship(
  condition: OrganizationalCondition,
  allConditions: OrganizationalCondition[],
): string {
  const definition = CONDITION_DEFINITIONS.find(
    (item) => item.domain === condition.domain,
  );

  if (!definition) return "";

  return inferRelationshipReason({
    definition,
    conditions: allConditions,
  });
}

function conditionRiskScore(condition: OrganizationalCondition): number {
  const priorityWeight =
    condition.priority === "critical"
      ? 0.35
      : condition.priority === "high"
        ? 0.25
        : condition.priority === "medium"
          ? 0.14
          : 0.05;

  const statusWeight =
    condition.status === "deteriorating"
      ? 0.3
      : condition.status === "constrained"
        ? 0.22
        : condition.status === "weak" || condition.status === "unresolved"
          ? 0.15
          : condition.status === "emerging"
            ? 0.1
            : condition.status === "improving"
              ? 0.04
              : 0.02;

  const trendWeight =
    condition.trend === "strengthening"
      ? 0.12
      : condition.trend === "new"
        ? 0.08
        : condition.trend === "weakening"
          ? -0.04
          : 0.02;

  const breadthWeight = clamp01(
    (condition.supportingConceptIds.length +
      condition.supportingBeliefIds.length +
      condition.supportingMechanismIds.length +
      condition.supportingTheoryIds.length) /
      18,
  ) * 0.16;

  return clamp01(
    condition.strength * 0.35 +
      condition.confidence * 0.22 +
      priorityWeight +
      statusWeight +
      trendWeight +
      breadthWeight,
  );
}

function synthesizeState(params: {
  conditions: OrganizationalCondition[];
  memoryMaturity?: any;
  previousState?: OrganizationalState;
  now: string;
}): OrganizationalState {
  const { conditions, memoryMaturity, previousState, now } = params;

  const rankedConditions = conditions
    .slice()
    .sort((a, b) => conditionRiskScore(b) - conditionRiskScore(a));

  const deterioratingConditions = rankedConditions
    .filter((condition) =>
      ["deteriorating", "constrained", "weak", "unresolved"].includes(
        condition.status,
      ),
    )
    .slice(0, 4);

  const improvingConditions = rankedConditions
    .filter((condition) => condition.status === "improving")
    .slice(0, 3);

  const dominantConditions = rankedConditions.slice(0, 4);

  const confidence = clamp01(
    average(rankedConditions.slice(0, 5).map((condition) => condition.confidence)) ||
      previousState?.confidence ||
      0.35,
  );

  const criticalCount = rankedConditions.filter(
    (condition) => condition.priority === "critical",
  ).length;

  const highRiskCount = rankedConditions.filter((condition) =>
    ["critical", "high"].includes(condition.priority),
  ).length;

  const deterioratingCount = rankedConditions.filter(
    (condition) => condition.status === "deteriorating",
  ).length;

  const constrainedCount = rankedConditions.filter(
    (condition) => condition.status === "constrained",
  ).length;

  const status: OrganizationalState["status"] =
    criticalCount >= 2 || deterioratingCount >= 3
      ? "critical"
      : highRiskCount >= 3 || constrainedCount >= 4
        ? "strained"
        : highRiskCount >= 1 || constrainedCount >= 2
          ? "watch"
          : rankedConditions.length > 0
            ? "healthy"
            : "uncertain";

  const memoryText =
    typeof memoryMaturity?.score === "number"
      ? ` Memory maturity is ${Math.round(memoryMaturity.score)}.`
      : "";

  const primary = dominantConditions[0];
  const secondary = dominantConditions[1];
  const third = dominantConditions[2];

  const systemRelationship = primary
    ? inferConditionSystemRelationship(primary, rankedConditions)
    : "";

  const summary =
    dominantConditions.length > 0
      ? `Discovery currently sees the organization as ${status}. The primary condition is ${primary.name}${
          secondary ? `, reinforced by ${secondary.name}` : ""
        }${third ? ` and ${third.name}` : ""}. ${systemRelationship}${memoryText}`
      : "Discovery does not yet have enough evidence to characterize the organization's current condition.";

  const executiveImplication =
    deterioratingConditions.length > 0
      ? `Leadership should focus first on ${deterioratingConditions[0].name}. It carries the highest combined risk because of its condition strength, confidence, priority, trend, and breadth of supporting evidence. ${
          deterioratingConditions[1]
            ? `${deterioratingConditions[1].name} should be treated as the next related constraint.`
            : ""
        } ${primary ? inferConditionSystemRelationship(primary, rankedConditions) : ""}`
      : dominantConditions.length > 0
        ? `Leadership should preserve the strongest stable conditions while continuing to collect evidence about emerging changes.`
        : "Leadership should collect more operating evidence before treating this as a stable organizational diagnosis.";

  return {
    id: "organizational-state-current",
    summary,
    status,
    confidence,
    dominantConditions: dominantConditions.map((condition) => condition.id),
    improvingConditions: improvingConditions.map((condition) => condition.id),
    deterioratingConditions: deterioratingConditions.map((condition) => condition.id),
    unresolvedTensions: rankedConditions
      .filter((condition) => condition.status === "unresolved")
      .map((condition) => condition.id),
    executiveImplication,
    recommendedFocus: dominantConditions
      .slice(0, 4)
      .map((condition) => condition.name),
    lastUpdatedAt: now,
  };
}

export function inferOrganizationalConditions(
  input: InferOrganizationalConditionsInput,
): {
  conditions: OrganizationalCondition[];
  state: OrganizationalState;
} {
  const conceptualUnderstanding = input.conceptualUnderstanding ?? [];
  const organizationalBeliefs = input.organizationalBeliefs ?? [];
  const mechanisms = input.mechanisms ?? [];
  const theories = input.theories ?? [];
  const theoryEvolution = input.theoryEvolution ?? [];

  const previousConditionsById = new Map(
    (input.previousConditions ?? []).map((condition) => [condition.id, condition]),
  );

  const scoredConditions = CONDITION_DEFINITIONS.map((definition) =>
    scoreDomain({
      definition,
      conceptualUnderstanding,
      organizationalBeliefs,
      mechanisms,
      theories,
      theoryEvolution,
      previousCondition: previousConditionsById.get(conditionId(definition.domain)),
    }),
  )
    .filter((condition): condition is OrganizationalCondition => Boolean(condition))
    .map((condition) => ({
      ...condition,
      lastUpdatedAt: input.now,
    }));

  const conditions = scoredConditions
    .map((condition) => {
      const relationship = inferConditionSystemRelationship(
        condition,
        scoredConditions,
      );

      return {
        ...condition,
        summary: relationship
          ? `${condition.summary} ${relationship}`
          : condition.summary,
      };
    })
    .sort((a, b) => conditionRiskScore(b) - conditionRiskScore(a));

  const state = synthesizeState({
    conditions,
    memoryMaturity: input.memoryMaturity,
    previousState: input.previousState,
    now: input.now,
  });

  return {
    conditions,
    state,
  };
}
