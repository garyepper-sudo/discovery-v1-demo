import type { OrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";
import type {
  DiscoveryV3Result,
  V3Evidence,
} from "../../../engine/v3/types";
import type { CanonicalEvidenceRoleAssignment } from "./evidenceRoles";
import type {
  GroundedProductStatement,
  ProductUnderstanding,
  ProductUnderstandingLineage,
} from "./productUnderstanding";

type UtilityDomain =
  | "sales"
  | "execution"
  | "hiring"
  | "decisions"
  | "retention";

export type ProductUtility = {
  status: ProductUnderstanding["status"];
  immediateInsight: GroundedProductStatement | null;
  likelyExplanations: ProductUnderstanding["candidateExplanations"];
  alternativeExplanations: ProductUnderstanding["candidateExplanations"];
  whyDiscoveryThinksThis: GroundedProductStatement[];
  decisionImplications: GroundedProductStatement[];
  investigateNext: ProductUnderstanding["nextEvidence"][number] | null;
  watchNext: Array<{
    label: string;
    whyItMatters: string;
  }>;
  evidenceStrength: {
    alreadyStrong: GroundedProductStatement[];
    stillWeak: string[];
  };
  confidence: ProductUnderstanding["confidence"];
  understanding: ProductUnderstanding;
};

type UtilityInput = {
  organizationId: string;
  result: DiscoveryV3Result;
  runtime: OrganizationRuntime;
  understanding: ProductUnderstanding;
};

type RoleGroundedFact = {
  finding: GroundedProductStatement;
  assignment?: CanonicalEvidenceRoleAssignment;
};

type UtilityProfile = {
  domain: UtilityDomain;
  question: RegExp;
  requiredEvidence: readonly {
    role: string;
    direction: "increase" | "decrease" | "friction";
    matches: (assignment: CanonicalEvidenceRoleAssignment) => boolean;
    fallbackPattern: RegExp;
  }[];
  insight: string;
  implication: string;
  uncertainty: string;
  watchNext: ProductUtility["watchNext"];
  nextEvidence: ProductUnderstanding["nextEvidence"];
};

const PROFILES: readonly UtilityProfile[] = [
  {
    domain: "sales",
    question: /\b(sales|revenue|pipeline|conversion|close rates?|growth)\b/i,
    requiredEvidence: [
      {
        role: "sales-effort-or-incentive",
        direction: "increase",
        matches: (assignment) =>
          assignment.roles.includes("execution-signal") &&
          assignment.direction === "increasing",
        fallbackPattern: /\b(?:sales activity|sales effort|outreach|commission|incentive compensation|incentive).*\b(?:increas\w*|rais\w*|rose|grew|higher|more)\b/i,
      },
      {
        role: "conversion-or-cycle-performance",
        direction: "decrease",
        matches: (assignment) =>
          assignment.roles.includes("demand-signal") &&
          (
            assignment.roles.includes("weakens") ||
            assignment.direction === "decreasing" ||
            assignment.direction === "friction"
          ),
        fallbackPattern: /\b(?:conversion|close rate|win percentage|sales cycle|opportunit\w*).*\b(?:declin\w*|decreas\w*|fell|drop\w*|longer|increas\w*|rose|slow\w*|took longer)\b/i,
      },
    ],
    insight:
      "The evidence indicates that greater sales effort or incentives have not prevented weaker conversion or a longer sales cycle.",
    implication:
      "If conversion continues to weaken despite increased sales effort, investment intended only to increase activity is unlikely to resolve the slowdown.",
    uncertainty:
      "The current evidence does not yet distinguish demand, pricing, competition, product fit, and sales execution.",
    watchNext: [
      {
        label: "Conversion by pipeline stage",
        whyItMatters:
          "A concentrated drop would show where the slowdown is entering the sales process.",
      },
      {
        label: "Win/loss reasons over time",
        whyItMatters:
          "A changing reason pattern would help distinguish external demand from pricing, product, or execution.",
      },
    ],
    nextEvidence: [
      {
        label: "Pipeline conversion by stage",
        whyItHelps:
          "The single highest-value next step is to review where prospects are dropping out.",
        priority: "highest-value",
      },
      {
        label: "Win/loss reasons",
        whyItHelps:
          "Distinguishes pricing, competition, product fit, and customer budget pressure.",
        priority: "recommended",
      },
      {
        label: "Customer interviews",
        whyItHelps:
          "Adds direct evidence about demand, product fit, and buying constraints.",
        priority: "recommended",
      },
    ],
  },
  {
    domain: "execution",
    question: /\b(project|delivery|release|execution|delay\w*|deadline)\b/i,
    requiredEvidence: [
      {
        role: "delivery-performance",
        direction: "decrease",
        matches: (assignment) =>
          assignment.roles.includes("execution-signal") &&
          (
            assignment.roles.includes("weakens") ||
            assignment.direction === "decreasing" ||
            assignment.direction === "friction"
          ),
        fallbackPattern: /\b(?:delivery|release|project|deadline|committed work|cycle time).*\b(?:delay\w*|miss\w*|late|later|longer|increas\w*|slow\w*)\b/i,
      },
      {
        role: "dependency-or-rework-friction",
        direction: "friction",
        matches: (assignment) =>
          assignment.roles.includes("constraint-signal") &&
          assignment.direction === "friction",
        fallbackPattern: /\b(?:approval|rework|handoff|dependenc\w*|blocked|waiting|wait\w*).*\b(?:increas\w*|delay\w*|longer|unresolved|blocked|wait\w*)\b/i,
      },
    ],
    insight:
      "The evidence indicates that delivery pressure is occurring alongside waiting, rework, or handoff friction.",
    implication:
      "If the observed delivery friction continues, adding more work alone is unlikely to improve delivery speed.",
    uncertainty:
      "The current evidence does not yet show which delay source contributes most to missed delivery.",
    watchNext: [
      {
        label: "Time spent waiting versus working",
        whyItMatters:
          "Shows whether delivery time is being consumed by execution or by dependencies.",
      },
      {
        label: "Rework by project stage",
        whyItMatters:
          "Shows where completed work is being reopened or redirected.",
      },
    ],
    nextEvidence: [
      {
        label: "One recent delivery timeline",
        whyItHelps:
          "The single highest-value next step is to separate active work from approval, dependency, and rework time.",
        priority: "highest-value",
      },
      {
        label: "Rework and handoff record",
        whyItHelps:
          "Shows where work changes direction or crosses an unreliable boundary.",
        priority: "recommended",
      },
    ],
  },
  {
    domain: "hiring",
    question: /\b(hiring|headcount|recruit|staffing|capacity|open roles?)\b/i,
    requiredEvidence: [
      {
        role: "staffing-demand-or-shortfall",
        direction: "increase",
        matches: (assignment) =>
          assignment.roles.includes("capacity-signal") &&
          (
            assignment.roles.includes("demand-signal") &&
            assignment.direction === "increasing" ||
            assignment.roles.includes("weakens")
          ),
        fallbackPattern: /\b(?:capacity|open roles?|approved openings?|vacanc\w*|workload|demand|understaff\w*).*\b(?:increas\w*|rose|grew|higher|exceed\w*|short\w*|remain\w*)\b/i,
      },
      {
        role: "hiring-throughput",
        direction: "decrease",
        matches: (assignment) =>
          assignment.roles.includes("capacity-signal") &&
          assignment.direction === "friction",
        fallbackPattern: /\b(?:time to fill|fill roles?|hiring|recruit\w*|candidate).*\b(?:increas\w*|lengthen\w*|longer|slow\w*|declin\w*|decreas\w*|fell)\b/i,
      },
    ],
    insight:
      "The evidence indicates that open staffing demand is growing while hiring is taking longer to supply it.",
    implication:
      "If hiring lead time remains elevated, plans that assume near-term capacity growth carry delivery risk.",
    uncertainty:
      "The current evidence does not yet distinguish sourcing, selection, compensation, and role-design constraints.",
    watchNext: [
      {
        label: "Time to fill by role",
        whyItMatters:
          "Shows whether the constraint is broad or concentrated in specific capabilities.",
      },
      {
        label: "Candidate-stage falloff",
        whyItMatters:
          "Shows where viable candidates are leaving or being screened out.",
      },
    ],
    nextEvidence: [
      {
        label: "Hiring funnel by role",
        whyItHelps:
          "The single highest-value next step is to identify the stage and roles where hiring capacity is being lost.",
        priority: "highest-value",
      },
      {
        label: "Workload and vacancy coverage",
        whyItHelps:
          "Shows which delivery commitments are exposed while roles remain open.",
        priority: "recommended",
      },
    ],
  },
  {
    domain: "decisions",
    question: /\b(decisions?|approvals?|authority|stuck|escalat\w*)\b/i,
    requiredEvidence: [
      {
        role: "decision-latency",
        direction: "increase",
        matches: (assignment) =>
          assignment.roles.includes("decision-signal") &&
          assignment.roles.includes("temporal-trend") &&
          assignment.direction === "friction",
        fallbackPattern: /\b(?:decision|approval).*\b(?:delay\w*|slow\w*|longer|increas\w*|waiting|elapsed time|more time)\b/i,
      },
      {
        role: "approval-or-escalation-dependency",
        direction: "friction",
        matches: (assignment) =>
          assignment.roles.includes("decision-signal") &&
          (
            assignment.roles.includes("leadership-observation") ||
            assignment.roles.includes("constraint-signal")
          ),
        fallbackPattern: /\b(?:approval|escalat\w*|authority|sign[- ]off).*\b(?:requir\w*|increas\w*|concentrat\w*|senior|executive|\d|%)\b/i,
      },
    ],
    insight:
      "The evidence indicates that decision time is increasing while approval or escalation remains required.",
    implication:
      "If the same decisions continue to require escalation, adding more review steps is unlikely to improve decision speed.",
    uncertainty:
      "The current evidence does not yet show whether delay comes primarily from unclear ownership, missing information, or concentrated authority.",
    watchNext: [
      {
        label: "Decision age by approval stage",
        whyItMatters:
          "Shows where decisions accumulate and how long each approval boundary takes.",
      },
      {
        label: "Repeat escalations",
        whyItMatters:
          "Shows which decision types cannot be resolved at their expected level.",
      },
    ],
    nextEvidence: [
      {
        label: "Recent decision log",
        whyItHelps:
          "The single highest-value next step is to compare ownership, approval path, waiting time, and outcome for recent decisions.",
        priority: "highest-value",
      },
      {
        label: "Authority and escalation rules",
        whyItHelps:
          "Clarifies which decisions should be resolved without senior escalation.",
        priority: "recommended",
      },
    ],
  },
  {
    domain: "retention",
    question: /\b(retention|churn|renewals?|customer loss|customers leaving)\b/i,
    requiredEvidence: [
      {
        role: "retention-performance",
        direction: "decrease",
        matches: (assignment) =>
          assignment.roles.includes("retention-signal") &&
          assignment.roles.includes("weakens"),
        fallbackPattern: /\b(?:customer retention|renewal|churn).*\b(?:declin\w*|decreas\w*|fell|increas\w*|weaken\w*|loss|drop\w*)\b/i,
      },
      {
        role: "customer-behavior-or-experience",
        direction: "friction",
        matches: (assignment) =>
          assignment.roles.includes("customer-observation") &&
          assignment.roles.includes("weakens"),
        fallbackPattern: /\b(?:usage|adoption|support|complaint|customer experience|cancellation reason).*\b(?:declin\w*|decreas\w*|fell|increas\w*|chang\w*|wors\w*|drop\w*)\b/i,
      },
    ],
    insight:
      "The evidence indicates that customer retention is weakening alongside changes in customer behavior or experience.",
    implication:
      "If the same customer signals continue, acquisition growth alone may not offset the retention loss.",
    uncertainty:
      "The current evidence does not yet distinguish product experience, customer fit, service, pricing, and external pressure.",
    watchNext: [
      {
        label: "Retention by customer segment",
        whyItMatters:
          "Shows whether losses are broad or concentrated among particular customers.",
      },
      {
        label: "Usage before renewal or cancellation",
        whyItMatters:
          "Shows whether customer behavior changes before the commercial outcome.",
      },
    ],
    nextEvidence: [
      {
        label: "Retention and churn by segment",
        whyItHelps:
          "The single highest-value next step is to identify which customers changed behavior and when.",
        priority: "highest-value",
      },
      {
        label: "Customer loss interviews",
        whyItHelps:
          "Adds direct evidence about product, service, pricing, and fit.",
        priority: "recommended",
      },
    ],
  },
];

const METADATA = /^(company|industry|website|question|context):/i;
const ALTERNATIVE =
  /^(?:possible|plausible|candidate|competing)\s+(?:causes|explanations|factors)\s+(?:include|are)\s+/i;
const CAUSAL_ASSERTION = /\b(because|caused by|due to|the reason is)\b/i;
const NON_OBSERVATION =
  /(?:^["“]|[?]$|\b(?:asked whether|asked if|hypothes(?:is|ized)|may|might|could|would|plan(?:ned)?|assum(?:e|es|ed|ption)|forecast|projected|expected|proposal|scenario)\b)/i;
const NEGATED_OR_REVERSED =
  /\b(?:did not|does not|do not|didn't|doesn't|not|never|no longer|shorten\w*|improv\w*)\b/i;
const IRRELEVANT_CONTEXT =
  /\b(?:company picnic|store clos(?:e|ing)|closing schedule|software deployment|deployment pipeline|document retention|records retention|data retention|retention policy|customer survey question)\b/i;

function compare(left: string, right: string): number {
  return left.localeCompare(right);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort(compare);
}

function clean(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function question(result: DiscoveryV3Result): string {
  return result.evidence.find((item) =>
    item.sourceId === "onboarding-strategic-priority" ||
    /^question:/i.test(item.text)
  )?.text.replace(/^question:\s*/i, "") ?? "";
}

function lineageFor(
  evidence: V3Evidence,
  result: DiscoveryV3Result,
): ProductUnderstandingLineage {
  const observation = result.observations
    .filter((item) =>
      item.source === "evidence" && item.evidenceIds.includes(evidence.id)
    )
    .sort((left, right) => compare(left.id, right.id))[0];
  return {
    explanationIds: [],
    compositionIds: [],
    conditionIds: [],
    evidenceIds: unique([evidence.id, ...(observation?.evidenceIds ?? [])]),
    observationIds: observation ? [observation.id] : [],
  };
}

function admittedFacts(
  profile: UtilityProfile,
  input: UtilityInput,
): RoleGroundedFact[] {
  const admittedIds = new Set(input.understanding.lineage.evidenceIds);
  const rolesByEvidenceId = new Map(
    (input.understanding.evidenceRoles ?? []).map((assignment) => [
      assignment.evidenceId,
      assignment,
    ])
  );
  const rolesAvailable = rolesByEvidenceId.size > 0;
  const byText = new Map<string, V3Evidence>();
  for (const evidence of [...input.result.evidence].sort((left, right) =>
    compare(left.id, right.id)
  )) {
    const statement = clean(evidence.text);
    const assignment = rolesByEvidenceId.get(evidence.id);
    if (
      !admittedIds.has(evidence.id) ||
      evidence.type === "question" ||
      !statement ||
      METADATA.test(statement) ||
      ALTERNATIVE.test(statement) ||
      CAUSAL_ASSERTION.test(statement) ||
      NON_OBSERVATION.test(statement) ||
      NEGATED_OR_REVERSED.test(statement) ||
      IRRELEVANT_CONTEXT.test(statement) ||
      (
        rolesAvailable
          ? !assignment ||
            !profile.requiredEvidence.some(({ matches }) =>
              matches(assignment)
            )
          : !profile.requiredEvidence.some(({ fallbackPattern }) =>
              fallbackPattern.test(statement)
            )
      )
    ) {
      continue;
    }
    const key = normalized(statement);
    const current = byText.get(key);
    if (!current || (!current.sourceId && evidence.sourceId)) {
      byText.set(key, evidence);
    }
  }
  return [...byText.values()]
    .sort((left, right) => compare(normalized(left.text), normalized(right.text)))
    .slice(0, 4)
    .map((evidence): RoleGroundedFact => {
      const statement = clean(evidence.text);
      return {
        finding: {
          statement,
          basis: `This is directly reported in the submitted evidence: “${statement}”`,
          lineage: lineageFor(evidence, input.result),
        },
        assignment: rolesByEvidenceId.get(evidence.id),
      };
    });
}

function satisfiesRequiredEvidence(
  profile: UtilityProfile,
  facts: readonly RoleGroundedFact[],
): boolean {
  const rolesAvailable = facts.some((fact) => Boolean(fact.assignment));
  const matches = profile.requiredEvidence.map((requirement) =>
    facts.flatMap((fact, index) =>
      (
          rolesAvailable && fact.assignment
            ? requirement.matches(fact.assignment)
            : requirement.fallbackPattern.test(fact.finding.statement)
        )
        ? [index]
        : []
    )
  );
  function assign(roleIndex: number, used: ReadonlySet<number>): boolean {
    if (roleIndex === matches.length) return true;
    return matches[roleIndex].some((index) => {
      if (used.has(index)) return false;
      return assign(roleIndex + 1, new Set([...used, index]));
    });
  }
  return matches.every((indexes) => indexes.length > 0) &&
    assign(0, new Set());
}

function combinedLineage(
  statements: readonly GroundedProductStatement[],
): ProductUnderstandingLineage {
  return {
    explanationIds: unique(
      statements.flatMap((item) => item.lineage.explanationIds),
    ),
    compositionIds: unique(
      statements.flatMap((item) => item.lineage.compositionIds),
    ),
    conditionIds: unique(
      statements.flatMap((item) => item.lineage.conditionIds),
    ),
    evidenceIds: unique(
      statements.flatMap((item) => item.lineage.evidenceIds),
    ),
    observationIds: unique(
      statements.flatMap((item) => item.lineage.observationIds),
    ),
  };
}

function domainProfile(result: DiscoveryV3Result): UtilityProfile | null {
  const userQuestion = question(result);
  const matches = PROFILES.filter((profile) =>
    profile.question.test(userQuestion)
  );
  return matches.length === 1 ? matches[0] : null;
}

function withUtilityUnderstanding(
  input: UtilityInput,
  profile: UtilityProfile,
  facts: GroundedProductStatement[],
  insight: GroundedProductStatement,
): ProductUnderstanding {
  if (input.understanding.status !== "insufficient") {
    return input.understanding;
  }
  return {
    ...input.understanding,
    status: "provisional",
    headline: insight.statement,
    supportedFindings: facts,
    uncertainties: [profile.uncertainty],
    nextEvidence: profile.nextEvidence,
    confidence: input.understanding.confidence,
    lineage: combinedLineage(facts),
  };
}

/**
 * Selects the most useful truthful product communication available without
 * changing canonical cognition, confidence, authority, or persistence.
 */
export function optimizeTruthfulUtility(input: UtilityInput): ProductUtility {
  if (input.runtime.metadata.organizationId !== input.organizationId) {
    throw new Error("Truthful utility organization mismatch.");
  }
  const profile = domainProfile(input.result);
  const roleFacts = profile ? admittedFacts(profile, input) : [];
  const facts = roleFacts.map((item) => item.finding);
  const canAddUtility = Boolean(
    profile &&
    facts.length >= 2 &&
    satisfiesRequiredEvidence(profile, roleFacts)
  );
  const insight: GroundedProductStatement | null =
    profile && canAddUtility
      ? {
          statement: profile.insight,
          basis:
            "This is a bounded contrast across the concrete observations listed below; it does not establish why the pattern exists.",
          lineage: combinedLineage(facts),
        }
      : input.understanding.supportedFindings[0] ?? null;
  const understanding =
    profile && insight && canAddUtility
      ? withUtilityUnderstanding(input, profile, facts, insight)
      : input.understanding;
  const decisionImplications =
    profile && insight && canAddUtility
      ? [{
          statement: profile.implication,
          basis:
            "This is a conditional implication of the observed pattern, not a recommendation or causal conclusion.",
          lineage: insight.lineage,
        }]
      : [];
  const likelyExplanations =
    understanding.status === "supported"
      ? understanding.candidateExplanations.filter((item) =>
          item.status === "plausible"
        )
      : [];
  const alternativeExplanations =
    understanding.candidateExplanations.filter((item) =>
      !likelyExplanations.includes(item)
    );

  return {
    status: understanding.status,
    immediateInsight: insight,
    likelyExplanations,
    alternativeExplanations,
    whyDiscoveryThinksThis:
      facts.length > 0 ? facts : understanding.supportedFindings,
    decisionImplications,
    investigateNext: understanding.nextEvidence[0] ?? null,
    watchNext: profile && canAddUtility ? profile.watchNext : [],
    evidenceStrength: {
      alreadyStrong:
        facts.length > 0 ? facts : understanding.supportedFindings,
      stillWeak: understanding.uncertainties,
    },
    confidence: understanding.confidence,
    understanding,
  };
}
