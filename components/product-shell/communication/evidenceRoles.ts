import type { OrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";
import type {
  DiscoveryV3Result,
  V3Evidence,
  V3Observation,
} from "../../../engine/v3/types";

export type CanonicalEvidenceRole =
  | "supports"
  | "weakens"
  | "temporal-trend"
  | "operational-observation"
  | "customer-observation"
  | "leadership-observation"
  | "constraint-signal"
  | "execution-signal"
  | "demand-signal"
  | "capacity-signal"
  | "decision-signal"
  | "retention-signal"
  | "risk-signal"
  | "unknown";

export type CanonicalEvidenceDirection =
  | "increasing"
  | "decreasing"
  | "friction"
  | "stable"
  | "unknown";

export type CanonicalEvidenceRoleAssignment = {
  evidenceId: string;
  roles: CanonicalEvidenceRole[];
  direction: CanonicalEvidenceDirection;
  basis: {
    evidenceType: V3Evidence["type"];
    evidencePolarity: NonNullable<V3Evidence["polarity"]> | "unknown";
    evidenceStrength: NonNullable<V3Evidence["strength"]> | "unknown";
    observationIds: string[];
    signalIds: string[];
    themeIds: string[];
  };
  lineage: {
    evidenceIds: string[];
    observationIds: string[];
  };
};

type ClassificationInput = {
  organizationId: string;
  result: DiscoveryV3Result;
  runtime: OrganizationRuntime;
};

const METADATA = /^(company|industry|website|question|context):/i;
const ALTERNATIVE =
  /^(?:possible|plausible|candidate|competing)\s+(?:causes|explanations|factors)\s+(?:include|are)\s+/i;
const CAUSAL_ASSERTION = /\b(because|caused by|due to|the reason is)\b/i;
const NON_OBSERVATION =
  /(?:^["“]|[?]$|\b(?:asked whether|asked if|hypothes(?:is|ized)|may|might|could|would|plan(?:ned)?|assum(?:e|es|ed|ption)|forecast|projected|expected|proposal|scenario)\b)/i;
const NEGATED =
  /\b(?:did not|does not|do not|didn't|doesn't|not|never|no longer)\b/i;
const IRRELEVANT_CONTEXT =
  /\b(?:company picnic|store clos(?:e|ing)|closing schedule|closed the office|volunteer program|software deployment|deployment pipeline|document retention|records retention|data retention|retention policy|customer survey question|referee decision|football exercise|stage play|candidate key|approval rating|software cancellation token)\b/i;

const CONCEPTS: ReadonlyArray<{
  role: CanonicalEvidenceRole;
  terms: readonly string[];
}> = [
  {
    role: "customer-observation",
    terms: [
      "customer",
      "customers",
      "usage",
      "adoption",
      "support",
      "complaint",
      "complaints",
      "cancellation",
      "loss reason",
    ],
  },
  {
    role: "leadership-observation",
    terms: [
      "leadership",
      "leader",
      "executive",
      "senior approval",
      "signoff",
      "signoffs",
      "sign off",
      "escalation",
    ],
  },
  {
    role: "constraint-signal",
    terms: [
      "approval",
      "approvals",
      "blocked",
      "dependency",
      "dependencies",
      "handoff",
      "rework",
      "waiting",
      "wait",
      "unresolved",
      "understaffed",
      "bottleneck",
    ],
  },
  {
    role: "execution-signal",
    terms: [
      "activity",
      "outreach",
      "commission",
      "commissions",
      "incentive",
      "delivery",
      "project",
      "release",
      "deadline",
      "committed work",
      "cycle time",
      "workload",
    ],
  },
  {
    role: "demand-signal",
    terms: [
      "sales",
      "revenue",
      "pipeline",
      "conversion",
      "close rate",
      "close rates",
      "win percentage",
      "opportunity",
      "opportunities",
      "demand",
      "approved opening",
      "approved openings",
      "open role",
      "open roles",
    ],
  },
  {
    role: "capacity-signal",
    terms: [
      "capacity",
      "hiring",
      "recruiting",
      "candidate",
      "headcount",
      "staffing",
      "vacancy",
      "vacancies",
      "open role",
      "open roles",
      "approved opening",
      "approved openings",
      "time to fill",
      "fill roles",
      "understaffed",
      "workload",
    ],
  },
  {
    role: "decision-signal",
    terms: [
      "decision",
      "decisions",
      "approval",
      "approvals",
      "signoff",
      "signoffs",
      "sign off",
      "escalation",
      "authority",
      "executive review",
      "leadership review",
    ],
  },
  {
    role: "retention-signal",
    terms: [
      "customer retention",
      "renewal",
      "renewals",
      "churn",
      "cancellation",
      "customer loss",
    ],
  },
];

const INCREASE = [
  "increase",
  "increased",
  "increasing",
  "rose",
  "grew",
  "higher",
  "more",
  "raised",
  "lengthened",
];
const DECREASE = [
  "decrease",
  "decreased",
  "decreasing",
  "decline",
  "declined",
  "declining",
  "fell",
  "dropped",
  "weakened",
];
const FRICTION = [
  "delay",
  "delayed",
  "delays",
  "late",
  "later",
  "longer",
  "slow",
  "slowed",
  "slower",
  "missed",
  "waiting",
  "wait",
  "unresolved",
  "blocked",
  "required",
  "understaffed",
];
const STABLE = ["stable", "unchanged", "steady"];

function compare(left: string, right: string): number {
  return left.localeCompare(right);
}

function unique<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values.filter(Boolean))].sort(compare);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim();
}

function includesTerm(corpus: string, term: string): boolean {
  const normalizedTerm = normalize(term);
  return (` ${corpus} `).includes(` ${normalizedTerm} `);
}

function includesAny(corpus: string, terms: readonly string[]): boolean {
  return terms.some((term) => includesTerm(corpus, term));
}

function matchingObservations(
  evidence: V3Evidence,
  observations: readonly V3Observation[],
): V3Observation[] {
  return observations
    .filter((observation) =>
      observation.source === "evidence" &&
      observation.evidenceIds.includes(evidence.id)
    )
    .sort((left, right) => compare(left.id, right.id));
}

function eligible(evidence: V3Evidence): boolean {
  const text = evidence.text.trim();
  return Boolean(
    text &&
    evidence.type !== "question" &&
    !METADATA.test(text) &&
    !ALTERNATIVE.test(text) &&
    !CAUSAL_ASSERTION.test(text) &&
    !NON_OBSERVATION.test(text) &&
    !NEGATED.test(text) &&
    !IRRELEVANT_CONTEXT.test(text)
  );
}

function directionFor(
  corpus: string,
  evidence: V3Evidence,
): CanonicalEvidenceDirection {
  if (includesAny(corpus, FRICTION)) return "friction";
  if (
    includesAny(corpus, [
      "cycle time",
      "time to fill",
      "decision time",
      "approval time",
      "elapsed time",
    ]) &&
    includesAny(corpus, INCREASE)
  ) {
    return "friction";
  }
  if (includesAny(corpus, DECREASE)) return "decreasing";
  if (includesAny(corpus, INCREASE)) return "increasing";
  if (includesAny(corpus, STABLE)) return "stable";
  if (evidence.type === "risk" || evidence.polarity === "negative") {
    return "friction";
  }
  return "unknown";
}

function corpusFor(
  evidence: V3Evidence,
  observations: readonly V3Observation[],
  signalText: readonly string[],
  themeText: readonly string[],
): string {
  return normalize([
    ...evidence.keywords,
    ...observations.flatMap((observation) => [
      ...observation.keywords,
      observation.statement,
    ]),
    ...signalText,
    ...themeText,
    evidence.text,
  ].join(" "));
}

export function classifyCanonicalEvidenceRoles(
  input: ClassificationInput,
): CanonicalEvidenceRoleAssignment[] {
  if (input.runtime.metadata.organizationId !== input.organizationId) {
    throw new Error("Evidence role organization mismatch.");
  }

  return [...input.result.evidence]
    .sort((left, right) => compare(left.id, right.id))
    .flatMap((evidence) => {
      if (!eligible(evidence)) return [];

      const observations = matchingObservations(
        evidence,
        input.result.observations,
      );
      const signals = input.result.signals
        .filter((signal) => signal.evidenceIds.includes(evidence.id))
        .sort((left, right) => compare(left.id, right.id));
      const themes = input.result.themes
        .filter((theme) => theme.evidenceIds.includes(evidence.id))
        .sort((left, right) => compare(left.id, right.id));
      const corpus = corpusFor(
        evidence,
        observations,
        signals.flatMap((signal) => [
          signal.title,
          signal.description,
        ]),
        themes.flatMap((theme) => [
          theme.title,
          theme.description,
          ...(theme.keywords ?? []),
        ]),
      );
      const direction = directionFor(
        normalize([
          ...evidence.keywords,
          ...observations.flatMap((observation) => [
            ...observation.keywords,
            observation.statement,
          ]),
          evidence.text,
        ].join(" ")),
        evidence,
      );
      const roles: CanonicalEvidenceRole[] = [
        "operational-observation",
        ...(evidence.type === "risk" ||
          evidence.polarity === "negative" ||
          evidence.polarity === "mixed" ||
          direction === "friction" ||
          direction === "decreasing"
          ? ["weakens" as const, "risk-signal" as const]
          : ["supports" as const]),
        ...(direction !== "unknown"
          ? ["temporal-trend" as const]
          : []),
        ...CONCEPTS.flatMap(({ role, terms }) =>
          includesAny(corpus, terms) ? [role] : []
        ),
      ];
      const semanticRoles = roles.filter((role) =>
        ![
          "supports",
          "weakens",
          "temporal-trend",
          "operational-observation",
          "risk-signal",
        ].includes(role)
      );
      if (semanticRoles.length === 0) roles.push("unknown");

      return [{
        evidenceId: evidence.id,
        roles: unique(roles),
        direction,
        basis: {
          evidenceType: evidence.type,
          evidencePolarity: evidence.polarity ?? "unknown",
          evidenceStrength: evidence.strength ?? "unknown",
          observationIds: observations.map((item) => item.id),
          signalIds: signals.map((item) => item.id),
          themeIds: themes.map((item) => item.id),
        },
        lineage: {
          evidenceIds: [evidence.id],
          observationIds: observations.map((item) => item.id),
        },
      }];
    });
}
