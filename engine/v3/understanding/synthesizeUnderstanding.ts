import type {
  OrganizationalDomainKey,
  OrganizationalDomainRelevance,
  OrganizationalDomainUnderstanding,
  OrganizationalUnderstandingItem,
  OrganizationalUnderstandingRecommendation,
  OrganizationalUnderstandingScore,
  OrganizationalUnderstandingState,
} from "../runtime/organizationalUnderstandingState";
import {
  createDefaultDomainUnderstandings,
  createEmptyUnderstandingScore,
} from "../runtime/organizationalUnderstandingState";
import {
  choosePrimaryOrganizationalUnderstanding,
} from "./rankOrganizationalUnderstanding";

const DOMAIN_LABELS: Record<OrganizationalDomainKey, string> = {
  strategy: "Strategy",
  finance: "Finance",
  operations: "Operations",
  customers: "Customers",
  employees: "Employees",
  products: "Products & Services",
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreToPercent(value: number): number {
  return Math.round(clamp01(value) * 100);
}

function keywordScore(text: string, keywords: string[]): number {
  const normalized = text.toLowerCase();

  const matches = keywords.filter((keyword) =>
    normalized.includes(keyword.toLowerCase())
  ).length;

  return clamp01(matches / Math.max(1, keywords.length));
}

function deriveDomainRelevance(
  understanding: OrganizationalUnderstandingItem
): OrganizationalDomainRelevance {
  const text = [
    understanding.title,
    understanding.statement,
    understanding.summary,
    understanding.mechanism,
    understanding.whyItMatters,
    ...understanding.implications,
    ...understanding.openQuestions,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    strategy: Math.max(
      understanding.domainRelevance?.strategy ?? 0,
      keywordScore(text, [
        "strategy",
        "strategic",
        "alignment",
        "priority",
        "direction",
        "market",
        "growth",
        "positioning",
      ])
    ),

    finance: Math.max(
      understanding.domainRelevance?.finance ?? 0,
      keywordScore(text, [
        "finance",
        "financial",
        "budget",
        "cost",
        "revenue",
        "margin",
        "cash",
        "forecast",
        "capital",
      ])
    ),

    operations: Math.max(
      understanding.domainRelevance?.operations ?? 0,
      keywordScore(text, [
        "operations",
        "operational",
        "execution",
        "delivery",
        "process",
        "handoff",
        "coordination",
        "capacity",
        "workflow",
      ])
    ),

    customers: Math.max(
      understanding.domainRelevance?.customers ?? 0,
      keywordScore(text, [
        "customer",
        "customers",
        "client",
        "retention",
        "churn",
        "support",
        "satisfaction",
        "experience",
      ])
    ),

    employees: Math.max(
      understanding.domainRelevance?.employees ?? 0,
      keywordScore(text, [
        "employee",
        "employees",
        "people",
        "team",
        "teams",
        "leadership",
        "manager",
        "ownership",
        "morale",
      ])
    ),

    products: Math.max(
      understanding.domainRelevance?.products ?? 0,
      keywordScore(text, [
        "product",
        "products",
        "service",
        "services",
        "roadmap",
        "feature",
        "platform",
        "offering",
      ])
    ),
  };
}

function computeScore(
  understandings: OrganizationalUnderstandingItem[]
): OrganizationalUnderstandingScore {
  if (understandings.length === 0) {
    return createEmptyUnderstandingScore();
  }

  const confidence = average(understandings.map((item) => item.confidence));
  const coverage = average(understandings.map((item) => item.coverage));
  const continuity = average(understandings.map((item) => item.stability));
  const emergence = average(understandings.map((item) => item.novelty));
  const memoryMaturity = clamp01(understandings.length / 8);
  const crossValidation = average(
    understandings.map((item) => clamp01(item.supportCount / 4))
  );
  const contradictionResolution = average(
    understandings.map((item) =>
      item.contradictionIds.length === 0 ? 1 : clamp01(1 / item.contradictionIds.length)
    )
  );
  const evidenceDiversity = average(
    understandings.map((item) =>
      clamp01(
        [
          item.evidenceIds.length > 0,
          item.observationIds.length > 0,
          item.beliefIds.length > 0,
          item.mechanismIds.length > 0,
          item.themeIds.length > 0,
        ].filter(Boolean).length / 5
      )
    )
  );

  const overall = average([
    coverage,
    confidence,
    evidenceDiversity,
    crossValidation,
    continuity,
    contradictionResolution,
    emergence,
    memoryMaturity,
  ]);

  return {
    overall: scoreToPercent(overall),
    coverage: scoreToPercent(coverage),
    confidence: scoreToPercent(confidence),
    evidenceDiversity: scoreToPercent(evidenceDiversity),
    crossValidation: scoreToPercent(crossValidation),
    continuity: scoreToPercent(continuity),
    contradictionResolution: scoreToPercent(contradictionResolution),
    emergence: scoreToPercent(emergence),
    memoryMaturity: scoreToPercent(memoryMaturity),
  };
}

function createExecutiveSummary(
  understandings: OrganizationalUnderstandingItem[]
): string {
  const strongest =
    choosePrimaryOrganizationalUnderstanding(
      understandings,
    );

  if (!strongest) {
    return "Discovery has not yet formed enough organizational understanding to produce an executive summary.";
  }

  return `Discovery currently believes the most important organizational understanding is: ${strongest.statement} This understanding has ${Math.round(
    strongest.confidence * 100
  )}% confidence and is supported by ${strongest.supportCount} signal(s).`;
}

function createRecommendations(
  understandings: OrganizationalUnderstandingItem[]
): OrganizationalUnderstandingRecommendation[] {
  const recommendations: OrganizationalUnderstandingRecommendation[] = [];

  const lowCoverage = understandings.filter((item) => item.coverage < 0.45);
  const lowConfidence = understandings.filter((item) => item.confidence < 0.55);
  const contradictions = understandings.filter(
    (item) => item.contradictionIds.length > 0
  );

  if (lowCoverage.length > 0) {
    recommendations.push({
      id: "recommendation-improve-coverage",
      title: "Add evidence to improve understanding coverage",
      description:
        "Several understandings have limited supporting coverage. Add more source material connected to the strongest emerging themes.",
      priority: "high",
      expectedImpact: 0.85,
      relatedUnderstandingIds: lowCoverage.map((item) => item.id),
      suggestedEvidenceTypes: [
        "operating reviews",
        "project updates",
        "leadership notes",
        "customer feedback",
      ],
    });
  }

  if (lowConfidence.length > 0) {
    recommendations.push({
      id: "recommendation-improve-confidence",
      title: "Add confirming or disconfirming evidence",
      description:
        "Some understandings remain uncertain. Discovery needs evidence that can confirm, weaken, or falsify these beliefs.",
      priority: "medium",
      expectedImpact: 0.7,
      relatedUnderstandingIds: lowConfidence.map((item) => item.id),
      suggestedEvidenceTypes: [
        "decision logs",
        "meeting notes",
        "performance metrics",
        "retrospectives",
      ],
    });
  }

  if (contradictions.length > 0) {
    recommendations.push({
      id: "recommendation-resolve-contradictions",
      title: "Resolve conflicting organizational signals",
      description:
        "Discovery has detected contradictions that should be resolved before treating these understandings as stable.",
      priority: "high",
      expectedImpact: 0.9,
      relatedUnderstandingIds: contradictions.map((item) => item.id),
      suggestedEvidenceTypes: [
        "updated reports",
        "cross-functional interviews",
        "source-of-truth documentation",
      ],
    });
  }

  return recommendations;
}

function createMissingInformation(
  understandings: OrganizationalUnderstandingItem[]
): string[] {
  const missing = new Set<string>();

  for (const item of understandings) {
    for (const value of item.missingInformation) {
      missing.add(value);
    }

    if (item.evidenceIds.length === 0) {
      missing.add("Direct evidence linked to current understandings");
    }

    if (item.mechanismIds.length === 0) {
      missing.add("Mechanism-level evidence explaining why this pattern occurs");
    }

    if (item.beliefIds.length === 0) {
      missing.add("Belief-level evidence showing whether this understanding persists over time");
    }
  }

  return Array.from(missing);
}

function buildDomainUnderstanding(params: {
  domain: OrganizationalDomainKey;
  understandings: OrganizationalUnderstandingItem[];
  recommendations: OrganizationalUnderstandingRecommendation[];
  now: string;
}): OrganizationalDomainUnderstanding {
  const { domain, understandings, recommendations, now } = params;

  const domainUnderstandings = understandings.filter(
    (item) => item.domainRelevance[domain] >= 0.2
  );

  const score = computeScore(domainUnderstandings);

  const strongest =
    choosePrimaryOrganizationalUnderstanding(
      domainUnderstandings,
    );

  const relatedRecommendationIds = recommendations
    .filter((recommendation) =>
      recommendation.relatedUnderstandingIds.some((id) =>
        domainUnderstandings.some((item) => item.id === id)
      )
    )
    .map((recommendation) => recommendation.id);

  return {
    domain,
    label: DOMAIN_LABELS[domain],

    score,

    confidence: score.confidence,
    coverage: score.coverage,

    summary: strongest
      ? `Discovery's strongest ${DOMAIN_LABELS[
          domain
        ].toLowerCase()} understanding is: ${strongest.statement}`
      : `Discovery does not yet have enough ${DOMAIN_LABELS[
          domain
        ].toLowerCase()} evidence to form a strong understanding.`,

    coreBeliefIds: Array.from(
      new Set(domainUnderstandings.flatMap((item) => item.beliefIds))
    ),
    patternIds: Array.from(
      new Set(domainUnderstandings.flatMap((item) => item.themeIds))
    ),
    mechanismIds: Array.from(
      new Set(domainUnderstandings.flatMap((item) => item.mechanismIds))
    ),
    contradictionIds: Array.from(
      new Set(domainUnderstandings.flatMap((item) => item.contradictionIds))
    ),
    evidenceIds: Array.from(
      new Set(domainUnderstandings.flatMap((item) => item.evidenceIds))
    ),
    recommendationIds: relatedRecommendationIds,

    missingInformation: createMissingInformation(domainUnderstandings),
    openQuestions: Array.from(
      new Set(domainUnderstandings.flatMap((item) => item.openQuestions))
    ),

    relatedUnderstandingIds: domainUnderstandings.map((item) => item.id),

    lastUpdatedAt: now,
  };
}

export function synthesizeUnderstanding(params: {
  state: OrganizationalUnderstandingState;
  now?: string;
}): OrganizationalUnderstandingState {
  const now = params.now ?? new Date().toISOString();

  const currentUnderstandings = params.state.currentUnderstandings.map((item) => ({
    ...item,
    domainRelevance: deriveDomainRelevance(item),
  }));

  const recommendations = createRecommendations(currentUnderstandings);
  const score = computeScore(currentUnderstandings);

  const domains =
    currentUnderstandings.length === 0
      ? createDefaultDomainUnderstandings(now)
      : (Object.keys(DOMAIN_LABELS) as OrganizationalDomainKey[]).map((domain) =>
          buildDomainUnderstanding({
            domain,
            understandings: currentUnderstandings,
            recommendations,
            now,
          })
        );

  return {
    ...params.state,
    lastUpdatedAt: now,
    currentUnderstandings,
    score,
    executiveSummary: createExecutiveSummary(currentUnderstandings),
    domains,
    recommendations,
    missingInformation: createMissingInformation(currentUnderstandings),
    health: {
      maturity: score.memoryMaturity / 100,
      coherence: average([
        score.crossValidation,
        score.evidenceDiversity,
        score.contradictionResolution,
      ]) / 100,
      uncertainty: 1 - score.confidence / 100,
      adaptation: score.continuity / 100,
    },
  };
}
