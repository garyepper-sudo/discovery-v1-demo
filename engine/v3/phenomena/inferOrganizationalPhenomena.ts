import type {
  OrganizationalPhenomenon,
  OrganizationalPhenomenaState,
  OrganizationalPhenomenonSignal,
  OrganizationalPhenomenonStatus,
  OrganizationalPhenomenonType,
} from "./organizationalPhenomena";
import type { OrganizationalPattern } from "../model/observations/organizationalObservations";
import type { OrganizationalMechanismType } from "../model/judgment/organizationalMechanism";

type UnderstandingLike = {
  id?: string;
  type?: string;
  label?: string;
  name?: string;
  title?: string;
  statement?: string;
  summary?: string;
  description?: string;
  explanation?: string;
  interpretation?: string;
  organizationalBehavior?: string;
  executiveMeaning?: string;
  whyItMatters?: string;
  confidence?: number;
  strength?: number;
  stability?: number;
  themes?: string[];
  keywords?: string[];
  relatedEntityIds?: string[];
};

type UnderstandingClusterLike = {
  id: string;
  label?: string;
  summary?: string;
  description?: string;
  understandingIds?: string[];
  memberUnderstandingIds?: string[];
  sharedThemes?: string[];
  sharedMechanisms?: string[];
  confidence?: number;
  strength?: number;
  cohesion?: number;
  stability?: number;
  status?: string;
};

type PhenomenonDefinition = {
  type: OrganizationalPhenomenonType;
  label: string;
  description: string;
  executiveMeaning: string;
  possibleMechanismTypes: OrganizationalMechanismType[];
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function getClusterUnderstandingIds(cluster: UnderstandingClusterLike): string[] {
  return cluster.memberUnderstandingIds ?? cluster.understandingIds ?? [];
}

function collectUnderstandingText(
  understanding: UnderstandingLike,
): string {
  return [
    understanding.type,
    understanding.label,
    understanding.name,
    understanding.title,
    understanding.statement,
    understanding.summary,
    understanding.description,
    understanding.explanation,
    understanding.interpretation,
    understanding.organizationalBehavior,
    understanding.executiveMeaning,
    ...(understanding.themes ?? []),
    ...(understanding.keywords ?? []),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function getClusterMemberUnderstandings(params: {
  cluster: UnderstandingClusterLike;
  understandings: UnderstandingLike[];
}): UnderstandingLike[] {
  const memberIds =
    new Set(
      getClusterUnderstandingIds(
        params.cluster,
      ),
    );

  if (memberIds.size === 0) {
    return [];
  }

  return params.understandings.filter(
    (understanding) =>
      typeof understanding.id === "string" &&
      memberIds.has(understanding.id),
  );
}

function getClusterText(params: {
  cluster: UnderstandingClusterLike;
  understandings: UnderstandingLike[];
}): string {
  const members =
    getClusterMemberUnderstandings(
      params,
    );

  const values = members.length > 0
    ? members.map(collectUnderstandingText)
    : [
        params.cluster.label,
        params.cluster.summary,
        params.cluster.description,
        ...(params.cluster.sharedThemes ?? []),
        ...(params.cluster.sharedMechanisms ?? []),
      ];

  return values
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

type SemanticSignature = {
  type: OrganizationalPhenomenonType;
  label: string;
  description: string;
  executiveMeaning: string;
  possibleMechanismTypes: OrganizationalMechanismType[];
  evidenceGroups: string[][];
  minimumMatchedGroups?: number;
};

const CLUSTER_SEMANTIC_SIGNATURES: SemanticSignature[] = [
  {
    type: "approval_bottleneck",
    label: "Approval Bottleneck",
    description:
      "Work appears to accumulate while decisions wait for approval, review, escalation, or centralized authority.",
    executiveMeaning:
      "This matters because approval dependency reduces decision throughput and slows execution.",
    possibleMechanismTypes: [
      "decisionLatency",
      "governanceFriction",
      "accountabilityGap",
    ],
    evidenceGroups: [
      [
        "approval",
        "review",
        "escalation",
        "centralized authority",
        "decision authority",
      ],
      [
        "waiting",
        "delay",
        "slow",
        "bottleneck",
        "latency",
      ],
    ],
  },
  {
    type: "coordination_breakdown",
    label: "Coordination Breakdown",
    description:
      "Cross-functional work appears to depend on unclear ownership, fragile handoffs, or repeated manual coordination.",
    executiveMeaning:
      "This matters because coordination breakdown converts ordinary complexity into execution delay and rework.",
    possibleMechanismTypes: [
      "coordinationBreakdown",
      "executionDrag",
      "accountabilityGap",
    ],
    evidenceGroups: [
      [
        "coordination",
        "cross functional",
        "handoff",
        "ownership",
        "interface",
      ],
      [
        "breakdown",
        "unclear",
        "manual",
        "fragmented",
        "misaligned",
        "rework",
      ],
    ],
  },
  {
    type: "execution_capacity",
    label: "Execution Capacity",
    description:
      "Execution demand appears to exceed the organization's available focus, throughput, coordination bandwidth, or delivery capacity.",
    executiveMeaning:
      "This matters because excessive demand and fragmented attention reduce execution reliability.",
    possibleMechanismTypes: [
      "capabilityConstraint",
      "resourceConstraint",
      "executionDrag",
      "priorityConflict",
    ],
    evidenceGroups: [
      [
        "execution",
        "delivery",
        "throughput",
        "implementation",
        "capacity",
      ],
      [
        "demand exceeds",
        "overload",
        "too many",
        "concurrent",
        "work in progress",
        "capacity mismatch",
        "resource constraint",
      ],
    ],
  },
  {
    type: "ownership_ambiguity",
    label: "Ownership Ambiguity",
    description:
      "Responsibility for work, decisions, or follow-through appears unclear across people or teams.",
    executiveMeaning:
      "This matters because unclear ownership weakens accountability and slows coordinated action.",
    possibleMechanismTypes: [
      "accountabilityGap",
      "coordinationBreakdown",
      "decisionLatency",
    ],
    evidenceGroups: [
      [
        "ownership",
        "accountability",
        "responsibility",
        "decision rights",
      ],
      [
        "unclear",
        "ambiguous",
        "unowned",
        "depends on",
        "escalation",
      ],
    ],
  },
  {
    type: "knowledge_fragmentation",
    label: "Knowledge Fragmentation",
    description:
      "Important knowledge appears distributed across people, teams, systems, or documents in ways that make reuse difficult.",
    executiveMeaning:
      "This matters because fragmented knowledge increases repeated work and dependency on individual memory.",
    possibleMechanismTypes: [
      "knowledgeFragmentation",
      "institutionalMemoryLoss",
      "weakKnowledgeTransfer",
      "documentationBreakdown",
      "organizationalLearningFailure",
    ],
    evidenceGroups: [
      [
        "knowledge",
        "documentation",
        "institutional memory",
        "tribal knowledge",
      ],
      [
        "fragmented",
        "distributed",
        "scattered",
        "localized",
        "concentrated",
        "lacks access",
        "silo",
        "hard to find",
      ],
    ],
  },
  {
    type: "organizational_learning_failure",
    label: "Organizational Learning Failure",
    description:
      "The organization appears to repeat issues without reliably converting experience into durable operating improvement.",
    executiveMeaning:
      "This matters because learning that does not compound reduces speed, resilience, and institutional memory.",
    possibleMechanismTypes: [
      "organizationalLearningFailure",
      "institutionalMemoryLoss",
      "weakKnowledgeTransfer",
      "feedbackFailure",
    ],
    evidenceGroups: [
      [
        "learning",
        "lesson",
        "feedback",
        "experience",
        "repeated issue",
      ],
      [
        "not compounding",
        "not captured",
        "repeated",
        "rediscovery",
        "same problem",
        "not reused",
      ],
    ],
  },
  {
    type: "leadership_alignment",
    label: "Leadership Alignment",
    description:
      "Leadership appears to be operating from inconsistent priorities, interpretations, or definitions of success.",
    executiveMeaning:
      "This matters because leadership misalignment increases priority conflict and weakens organizational coherence.",
    possibleMechanismTypes: [
      "priorityConflict",
      "coordinationBreakdown",
      "decisionLatency",
      "governanceFriction",
    ],
    evidenceGroups: [
      [
        "leadership",
        "executive",
        "management",
      ],
      [
        "misaligned",
        "different priorities",
        "inconsistent",
        "disagreement",
        "fragmented alignment",
      ],
    ],
  },
  {
    type: "customer_concentration",
    label: "Customer Concentration",
    description:
      "The organization appears materially dependent on a narrow set of customers, accounts, or revenue sources.",
    executiveMeaning:
      "This matters because customer concentration can distort prioritization and increase strategic risk.",
    possibleMechanismTypes: [
      "resourceConstraint",
      "priorityConflict",
      "capabilityConstraint",
    ],
    evidenceGroups: [
      [
        "customer",
        "client",
        "account",
        "revenue",
      ],
      [
        "concentration",
        "dependency",
        "single customer",
        "strategic account",
      ],
    ],
  },
];

function scoreSemanticSignature(
  text: string,
  signature: SemanticSignature,
): number {
  const matchedGroups =
    signature.evidenceGroups.filter(
      (group) =>
        includesAny(
          text,
          group,
        ),
    ).length;

  return matchedGroups /
    signature.evidenceGroups.length;
}

function inferSemanticSignature(
  text: string,
): SemanticSignature | undefined {
  const ranked =
    CLUSTER_SEMANTIC_SIGNATURES
      .map(
        (signature) => ({
          signature,
          score:
            scoreSemanticSignature(
              text,
              signature,
            ),
        }),
      )
      .filter(
        ({ signature, score }) =>
          score >=
          (
            signature.minimumMatchedGroups ??
            signature.evidenceGroups.length
          ) /
          signature.evidenceGroups.length,
      )
      .sort(
        (left, right) =>
          right.score -
          left.score,
      );

  return ranked[0]?.signature;
}

function inferPhenomenonFromPattern(
  pattern: OrganizationalPattern,
): PhenomenonDefinition | undefined {
  switch (pattern.type) {
    case "documentation_distributed_across_systems":
      return {
        type: "knowledge_fragmentation",
        label: "Knowledge Fragmentation",
        description:
          "Knowledge appears to be distributed across multiple systems, documents, or people.",
        executiveMeaning:
          "This matters because fragmented knowledge slows learning, increases repeated work, and makes the organization dependent on individual memory.",
        possibleMechanismTypes: [
          "knowledgeFragmentation",
          "institutionalMemoryLoss",
          "weakKnowledgeTransfer",
          "documentationBreakdown",
          "organizationalLearningFailure",
        ],
      };

    case "knowledge_not_transferring":
      return {
        type: "weak_knowledge_transfer",
        label: "Weak Knowledge Transfer",
        description:
          "Knowledge is not reliably moving between people, teams, projects, or time periods.",
        executiveMeaning:
          "This matters because weak knowledge transfer causes avoidable delays, rework, and dependency on specific individuals.",
        possibleMechanismTypes: [
          "weakKnowledgeTransfer",
          "institutionalMemoryLoss",
          "organizationalLearningFailure",
          "coordinationBreakdown",
        ],
      };

    case "work_is_being_repeated":
      return {
        type: "duplicated_work",
        label: "Duplicated Work",
        description:
          "The organization appears to be repeating work or experiments that should already be known.",
        executiveMeaning:
          "This matters because duplicated work consumes capacity and signals that organizational learning is not compounding.",
        possibleMechanismTypes: [
          "duplicatedKnowledgeWork",
          "knowledgeFragmentation",
          "weakKnowledgeTransfer",
          "organizationalLearningFailure",
        ],
      };

    case "decisions_wait_for_approval":
      return {
        type: "approval_bottleneck",
        label: "Approval Bottleneck",
        description:
          "Work appears to accumulate while waiting for approval, review, or escalation.",
        executiveMeaning:
          "This matters because approval bottlenecks reduce execution speed and increase decision latency.",
        possibleMechanismTypes: [
          "decisionLatency",
          "governanceFriction",
          "accountabilityGap",
        ],
      };

    case "ownership_is_unclear":
      return {
        type: "ownership_ambiguity",
        label: "Ownership Ambiguity",
        description:
          "The organization appears to lack clear ownership for work, decisions, or knowledge.",
        executiveMeaning:
          "This matters because unclear ownership slows follow-through and weakens accountability.",
        possibleMechanismTypes: [
          "accountabilityGap",
          "coordinationBreakdown",
          "decisionLatency",
        ],
      };

    case "coordination_is_fragmented":
      return {
        type: "coordination_breakdown",
        label: "Coordination Breakdown",
        description:
          "The organization appears to be experiencing fragmented coordination across people, systems, or workstreams.",
        executiveMeaning:
          "This matters because coordination breakdowns turn normal complexity into execution drag.",
        possibleMechanismTypes: [
          "coordinationBreakdown",
          "weakKnowledgeTransfer",
          "executionDrag",
        ],
      };

    case "learning_is_not_compounding":
      return {
        type: "organizational_learning_failure",
        label: "Organizational Learning Failure",
        description:
          "The organization appears to be failing to capture, transfer, or reuse learning.",
        executiveMeaning:
          "This matters because organizations that cannot compound learning lose speed, resilience, and strategic memory.",
        possibleMechanismTypes: [
          "organizationalLearningFailure",
          "institutionalMemoryLoss",
          "weakKnowledgeTransfer",
          "documentationBreakdown",
        ],
      };

    default:
      return undefined;
  }
}

function inferPhenomenonFromCluster(params: {
  cluster: UnderstandingClusterLike;
  understandings: UnderstandingLike[];
}): PhenomenonDefinition {
  const { cluster, understandings } = params;

  const text =
    getClusterText({
      cluster,
      understandings,
    });

  const semanticSignature =
    inferSemanticSignature(
      text,
    );

  if (semanticSignature) {
    return {
      type:
        semanticSignature.type,
      label:
        semanticSignature.label,
      description:
        semanticSignature.description,
      executiveMeaning:
        semanticSignature.executiveMeaning,
      possibleMechanismTypes:
        semanticSignature.possibleMechanismTypes,
    };
  }

  if (getClusterMemberUnderstandings({ cluster, understandings }).length > 0) {
    return {
      type: "emerging_organizational_phenomenon",
      label: cluster.label || "Emerging Organizational Phenomenon",
      description:
        "Discovery is detecting an organization-specific manifestation from related organizational understandings.",
      executiveMeaning:
        "This matters because the source understanding describes how the organization is currently operating.",
      possibleMechanismTypes: ["unknown"],
    };
  }

  if (
    includesAny(text, [
      "knowledge fragmentation",
      "fragmented knowledge",
      "scattered knowledge",
      "documentation",
      "tribal knowledge",
      "knowledge silos",
    ])
  ) {
    return {
      type: "knowledge_fragmentation",
      label: "Knowledge Fragmentation",
      description:
        "Discovery is detecting that important knowledge is distributed across people, teams, systems, or documents in ways that make it difficult to reuse.",
      executiveMeaning:
        "This matters because fragmented knowledge slows learning, increases repeated work, and makes the organization dependent on individual memory.",
      possibleMechanismTypes: [
        "knowledgeFragmentation",
        "institutionalMemoryLoss",
        "weakKnowledgeTransfer",
        "documentationBreakdown",
        "organizationalLearningFailure",
      ],
    };
  }

  if (
    includesAny(text, [
      "decision",
      "velocity",
      "speed",
      "approval",
      "bottleneck",
      "delay",
    ])
  ) {
    return {
      type: "decision_latency",
      label: "Decision Latency",
      description:
        "Discovery is detecting that decisions may be taking longer than the organization needs.",
      executiveMeaning:
        "This matters because slow decisions can turn manageable coordination costs into execution drag.",
      possibleMechanismTypes: [
        "decisionLatency",
        "governanceFriction",
        "accountabilityGap",
      ],
    };
  }

  if (
    includesAny(text, [
      "execution",
      "capacity",
      "operational",
      "delivery",
      "implementation",
      "follow-through",
    ])
  ) {
    return {
      type: "execution_capacity",
      label: "Execution Capacity",
      description:
        "Discovery is detecting a persistent organizational phenomenon related to execution capacity.",
      executiveMeaning:
        "This matters because execution capacity affects how the organization converts understanding into coordinated action.",
      possibleMechanismTypes: [
        "capabilityConstraint",
        "coordinationBreakdown",
        "executionDrag",
        "resourceConstraint",
      ],
    };
  }

  if (
    includesAny(text, [
      "customer",
      "client",
      "concentration",
      "revenue dependency",
      "account dependency",
    ])
  ) {
    return {
      type: "customer_concentration",
      label: "Customer Concentration",
      description:
        "Discovery is detecting a persistent organizational phenomenon related to customer concentration.",
      executiveMeaning:
        "This matters because customer concentration can shape strategic risk, prioritization, and resource allocation.",
      possibleMechanismTypes: [
        "resourceConstraint",
        "priorityConflict",
        "capabilityConstraint",
      ],
    };
  }

  if (
    includesAny(text, [
      "leadership",
      "alignment",
      "executive",
      "management",
      "strategic agreement",
    ])
  ) {
    return {
      type: "leadership_alignment",
      label: "Leadership Alignment",
      description:
        "Discovery is detecting a persistent organizational phenomenon related to leadership alignment.",
      executiveMeaning:
        "This matters because leadership alignment shapes decision quality, execution speed, and organizational coherence.",
      possibleMechanismTypes: [
        "coordinationBreakdown",
        "decisionLatency",
        "priorityConflict",
        "governanceFriction",
      ],
    };
  }

  if (
    includesAny(text, [
      "complexity",
      "coordination",
      "process",
      "handoff",
      "fragmentation",
    ])
  ) {
    return {
      type: "operational_complexity",
      label: "Operational Complexity",
      description:
        "Discovery is detecting a persistent organizational phenomenon related to operational complexity.",
      executiveMeaning:
        "This matters because operational complexity affects coordination, speed, and reliability.",
      possibleMechanismTypes: [
        "coordinationBreakdown",
        "executionDrag",
        "governanceFriction",
      ],
    };
  }

  if (
    includesAny(text, [
      "innovation",
      "pipeline",
      "product",
      "roadmap",
      "research",
      "development",
    ])
  ) {
    return {
      type: "innovation_pipeline",
      label: "Innovation Pipeline",
      description:
        "Discovery is detecting a persistent organizational phenomenon related to the innovation pipeline.",
      executiveMeaning:
        "This matters because the innovation pipeline affects future growth, differentiation, and strategic renewal.",
      possibleMechanismTypes: [
        "organizationalLearningFailure",
        "resourceConstraint",
        "capabilityConstraint",
        "feedbackFailure",
      ],
    };
  }

  return {
    type: "emerging_organizational_phenomenon",
    label: cluster.label || "Emerging Organizational Phenomenon",
    description:
      "Discovery is detecting an emerging organizational phenomenon from a related cluster of understandings.",
    executiveMeaning:
      "This matters because recurring organizational patterns may reveal how the organization is actually operating beneath the surface.",
    possibleMechanismTypes: ["unknown"],
  };
}

function inferPhenomenonStatusFromCluster(
  cluster: UnderstandingClusterLike,
): OrganizationalPhenomenonStatus {
  if (cluster.status === "weakening") return "weakening";
  if (cluster.status === "stable") return "stable";
  if (cluster.status === "fragmented") return "fragmented";

  const strength =
    cluster.strength ??
    cluster.stability ??
    cluster.cohesion ??
    cluster.confidence ??
    0.5;

  if (strength >= 0.75) return "strengthening";
  if (strength >= 0.55) return "emerging";

  return "fragmented";
}

function inferPhenomenonStatusFromPattern(
  pattern: OrganizationalPattern,
): OrganizationalPhenomenonStatus {
  if (pattern.strength >= 0.75) return "strengthening";
  if (pattern.strength >= 0.55) return "emerging";
  return "fragmented";
}

function buildPatternSignal(
  pattern: OrganizationalPattern,
): OrganizationalPhenomenonSignal {
  return {
    label: `${pattern.label} pattern`,
    description: pattern.description,
    strength: pattern.strength,
  };
}

function buildClusterSignal(params: {
  definition: PhenomenonDefinition;
  cluster: UnderstandingClusterLike;
}): OrganizationalPhenomenonSignal {
  const { definition, cluster } = params;

  return {
    label: `${definition.label} cluster`,
    description:
      cluster.description ||
      cluster.summary ||
      `Detected cluster consistent with ${definition.label.toLowerCase()}.`,
    strength:
      cluster.strength ??
      cluster.stability ??
      cluster.cohesion ??
      cluster.confidence ??
      0.5,
  };
}

function buildPatternEvidenceSummary(pattern: OrganizationalPattern): string {
  const count = pattern.sourceEvidenceIds.length;

  if (count === 0) {
    return `This phenomenon is inferred from an observed organizational pattern: ${pattern.label}.`;
  }

  return `This phenomenon is inferred from ${count} evidence source${
    count === 1 ? "" : "s"
  } supporting the observed pattern: ${pattern.label}.`;
}

function buildClusterEvidenceSummary(params: {
  definition: PhenomenonDefinition;
  cluster: UnderstandingClusterLike;
  sourceUnderstanding?: UnderstandingLike;
  memberUnderstandings?: UnderstandingLike[];
}): string {
  const {
    definition,
    cluster,
    sourceUnderstanding,
    memberUnderstandings = [],
  } = params;
  const understandingIds = getClusterUnderstandingIds(cluster);
  const count = understandingIds.length;

  const sourceStatements = [sourceUnderstanding, ...memberUnderstandings]
    .filter((understanding): understanding is UnderstandingLike =>
      Boolean(understanding),
    )
    .map((understanding) =>
      understanding.statement ||
      understanding.title ||
      understanding.summary ||
      understanding.description ||
      understanding.explanation ||
      "",
    )
    .filter(Boolean)
    .filter((statement, index, all) => all.indexOf(statement) === index);

  if (sourceStatements.length > 0) {
    return `This phenomenon is inferred from ${count} related organizational understanding${
      count === 1 ? "" : "s"
    }. Source understandings state: ${sourceStatements.join(" ")}`;
  }

  if (count === 0) {
    return `This phenomenon is inferred from a related cluster of organizational understandings around ${definition.label.toLowerCase()}.`;
  }

  return `This phenomenon is inferred from ${count} related organizational understanding${
    count === 1 ? "" : "s"
  } around ${definition.label.toLowerCase()}.`;
}

function buildPhenomenonFromPattern(params: {
  pattern: OrganizationalPattern;
  definition: PhenomenonDefinition;
  previousPhenomena: OrganizationalPhenomenon[];
  now: string;
  index: number;
}): OrganizationalPhenomenon {
  const { pattern, definition, previousPhenomena, now, index } = params;

  const existing = previousPhenomena.find(
    (phenomenon) =>
      phenomenon.type === definition.type || phenomenon.label === definition.label,
  );

  const confidence = clamp01(pattern.confidence ?? existing?.confidence ?? 0.6);

  const strength = clamp01(pattern.strength ?? existing?.strength ?? confidence);

  return {
    id: existing?.id ?? `phenomenon-${definition.type}-${index + 1}`,
    type: definition.type,
    label: definition.label,
    description: existing?.description ?? definition.description,
    clusterIds: [],
    understandingIds: [],
    patternIds: [pattern.id],
    status: inferPhenomenonStatusFromPattern(pattern),
    confidence,
    strength,
    signals: [buildPatternSignal(pattern)],
    relatedEntityIds: pattern.relatedEntityIds,
    possibleMechanismTypes: definition.possibleMechanismTypes,
    executiveMeaning: existing?.executiveMeaning ?? definition.executiveMeaning,
    evidenceSummary: buildPatternEvidenceSummary(pattern),
    changeExplanation: existing
      ? `Discovery refreshed its understanding of ${definition.label.toLowerCase()} from observed organizational patterns.`
      : `Discovery inferred ${definition.label.toLowerCase()} from observed organizational patterns.`,
    firstDetectedAt: existing?.firstDetectedAt ?? now,
    lastUpdatedAt: now,
  };
}

function buildPhenomenonFromCluster(params: {
  cluster: UnderstandingClusterLike;
  understandings: UnderstandingLike[];
  previousPhenomena: OrganizationalPhenomenon[];
  now: string;
  index: number;
}): OrganizationalPhenomenon {
  const {
    cluster,
    understandings,
    previousPhenomena,
    now,
    index,
  } = params;

  const definition =
    inferPhenomenonFromCluster({
      cluster,
      understandings,
    });

  const existing = previousPhenomena.find(
    (phenomenon) =>
      phenomenon.type === definition.type || phenomenon.label === definition.label,
  );

  const understandingIds = getClusterUnderstandingIds(cluster);
  const memberUnderstandings = getClusterMemberUnderstandings({
    cluster,
    understandings,
  });
  const understandingOrder = new Map(
    understandings.map((understanding, order) => [understanding.id, order]),
  );
  const sourceUnderstanding = [...memberUnderstandings].sort((left, right) => {
    const confidenceDelta = (right.confidence ?? 0) - (left.confidence ?? 0);
    if (confidenceDelta !== 0) return confidenceDelta;

    const strengthDelta = (right.strength ?? 0) - (left.strength ?? 0);
    if (strengthDelta !== 0) return strengthDelta;

    const stabilityDelta = (right.stability ?? 0) - (left.stability ?? 0);
    if (stabilityDelta !== 0) return stabilityDelta;

    return (understandingOrder.get(left.id) ?? 0) -
      (understandingOrder.get(right.id) ?? 0);
  })[0];
  const sourceManifestation = sourceUnderstanding?.statement ||
    sourceUnderstanding?.title ||
    sourceUnderstanding?.summary ||
    sourceUnderstanding?.description ||
    sourceUnderstanding?.explanation;

  const confidence = clamp01(
    cluster.confidence ?? cluster.cohesion ?? existing?.confidence ?? 0.55,
  );

  const strength = clamp01(
    cluster.strength ??
      cluster.stability ??
      cluster.cohesion ??
      existing?.strength ??
      confidence,
  );

  return {
    id: existing?.id ?? `phenomenon-${definition.type}-${index + 1}`,
    type: definition.type,
    label: definition.label,
    description:
      sourceManifestation ?? existing?.description ?? definition.description,
    clusterIds: [cluster.id],
    understandingIds,
    status: inferPhenomenonStatusFromCluster({
      ...cluster,
      confidence,
      strength,
    }),
    confidence,
    strength,
    signals: [
      buildClusterSignal({
        definition,
        cluster,
      }),
    ],
    possibleMechanismTypes: definition.possibleMechanismTypes,
    executiveMeaning:
      sourceUnderstanding?.whyItMatters ||
      existing?.executiveMeaning ||
      definition.executiveMeaning,
    evidenceSummary: buildClusterEvidenceSummary({
      definition,
      cluster,
      sourceUnderstanding,
      memberUnderstandings,
    }),
    changeExplanation: existing
      ? `Discovery refreshed its understanding of ${definition.label.toLowerCase()} from the latest investigation.`
      : `Discovery inferred ${definition.label.toLowerCase()} as a new organizational phenomenon.`,
    firstDetectedAt: existing?.firstDetectedAt ?? now,
    lastUpdatedAt: now,
  };
}

function buildPhenomenonIdentityKey(
  phenomenon: OrganizationalPhenomenon,
): string {
  const entityScope = [...(phenomenon.relatedEntityIds ?? [])]
    .sort()
    .join("|");

  if (entityScope.length > 0) {
    return [
      phenomenon.type,
      entityScope,
    ].join("::");
  }

  const patternScope = [...(phenomenon.patternIds ?? [])]
    .sort()
    .join("|");

  if (patternScope.length > 0) {
    return [
      phenomenon.type,
      patternScope,
    ].join("::");
  }

  const clusterScope = [...phenomenon.clusterIds]
    .sort()
    .join("|");

  if (clusterScope.length > 0) {
    return [
      phenomenon.type,
      clusterScope,
    ].join("::");
  }

  return [
    phenomenon.type,
    normalizeText(
      phenomenon.description,
    ),
  ].join("::");
}

function mergeStringValues(
  left: string[] | undefined,
  right: string[] | undefined,
): string[] {
  return [
    ...new Set([
      ...(left ?? []),
      ...(right ?? []),
    ]),
  ];
}

function mergeEquivalentPhenomena(
  existing: OrganizationalPhenomenon,
  incoming: OrganizationalPhenomenon,
): OrganizationalPhenomenon {
  const preferred =
    incoming.confidence >
    existing.confidence
      ? incoming
      : existing;

  return {
    ...preferred,

    id:
      existing.id,

    clusterIds:
      mergeStringValues(
        existing.clusterIds,
        incoming.clusterIds,
      ),

    understandingIds:
      mergeStringValues(
        existing.understandingIds,
        incoming.understandingIds,
      ),

    patternIds:
      mergeStringValues(
        existing.patternIds,
        incoming.patternIds,
      ),

    relatedEntityIds:
      mergeStringValues(
        existing.relatedEntityIds,
        incoming.relatedEntityIds,
      ),

    possibleMechanismTypes:
      mergeStringValues(
        existing.possibleMechanismTypes,
        incoming.possibleMechanismTypes,
      ),

    signals: [
      ...existing.signals,
      ...incoming.signals,
    ],

    firstDetectedAt:
      existing.firstDetectedAt <
      incoming.firstDetectedAt
        ? existing.firstDetectedAt
        : incoming.firstDetectedAt,

    lastUpdatedAt:
      existing.lastUpdatedAt >
      incoming.lastUpdatedAt
        ? existing.lastUpdatedAt
        : incoming.lastUpdatedAt,
  };
}

function dedupePhenomena(
  phenomena: OrganizationalPhenomenon[],
): OrganizationalPhenomenon[] {
  const byIdentity =
    new Map<
      string,
      OrganizationalPhenomenon
    >();

  for (const phenomenon of phenomena) {
    const identityKey =
      buildPhenomenonIdentityKey(
        phenomenon,
      );

    const existing =
      byIdentity.get(
        identityKey,
      );

    if (!existing) {
      byIdentity.set(
        identityKey,
        phenomenon,
      );

      continue;
    }

    byIdentity.set(
      identityKey,
      mergeEquivalentPhenomena(
        existing,
        phenomenon,
      ),
    );
  }

  return [
    ...byIdentity.values(),
  ];
}

export function inferOrganizationalPhenomena(params: {
  patterns?: OrganizationalPattern[];
  clusters: UnderstandingClusterLike[];
  understandings?: UnderstandingLike[];
  previousState?: OrganizationalPhenomenaState;
  now?: string;
}): OrganizationalPhenomenaState {
  const {
    clusters,
    previousState,
    understandings = [],
  } = params;
  const now = params.now ?? new Date().toISOString();

  const previousPhenomena = previousState?.phenomena ?? [];

  const patternDrivenPhenomena = (params.patterns ?? [])
    .map((pattern, index) => {
      const definition = inferPhenomenonFromPattern(pattern);

      if (!definition) return null;

      return buildPhenomenonFromPattern({
        pattern,
        definition,
        previousPhenomena,
        now,
        index,
      });
    })
    .filter(
      (phenomenon): phenomenon is OrganizationalPhenomenon =>
        phenomenon !== null,
    );

  const clusterDrivenPhenomena = clusters.map((cluster, index) =>
    buildPhenomenonFromCluster({
      cluster,
      understandings,
      previousPhenomena,
      now,
      index,
    }),
  );

  return {
    phenomena: dedupePhenomena([
      ...patternDrivenPhenomena,
      ...clusterDrivenPhenomena,
    ]),
    lastUpdatedAt: now,
  };
}
