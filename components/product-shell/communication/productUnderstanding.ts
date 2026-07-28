import type { OrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";
import type {
  DiscoveryV3Result,
  V3Evidence,
  V3Observation,
} from "../../../engine/v3/types";

export type ProductUnderstandingLineage = {
  explanationIds: string[];
  compositionIds: string[];
  conditionIds: string[];
  evidenceIds: string[];
  observationIds: string[];
};

type GroundedProductStatement = {
  statement: string;
  basis: string;
  lineage: ProductUnderstandingLineage;
};

export type ProductUnderstanding = {
  status: "supported" | "provisional" | "insufficient";
  headline: string;
  supportedFindings: GroundedProductStatement[];
  candidateExplanations: Array<
    GroundedProductStatement & {
      status: "plausible" | "competing" | "weakly-supported";
    }
  >;
  uncertainties: string[];
  nextEvidence: Array<{
    label: string;
    whyItHelps: string;
    priority: "highest-value" | "recommended" | "optional";
  }>;
  confidence: {
    state: "available" | "limited" | "unavailable";
    label: string;
    explanation: string;
  };
  lineage: ProductUnderstandingLineage;
};

type TranslationInput = {
  organizationId: string;
  result: DiscoveryV3Result;
  runtime: OrganizationRuntime;
};

const INTERNAL_PRODUCT_TERMS =
  /\b(mechanism|belief(?:-level)?|theor(?:y|ies|y-level)|cognition stage|organizational conditions?)\b/i;
const QUESTION_PREFIX = /^(question|company|industry|website|context):/i;
const ALTERNATIVE_PREFIX =
  /^(?:possible|plausible|candidate|competing)\s+(?:causes|explanations|factors)\s+(?:include|are)\s+/i;
const UNRESOLVED_CAUSE =
  /\b(?:primary|root|underlying)?\s*cause\s+(?:is|remains)\s+not\s+(?:yet\s+)?(?:known|established|clear)\b/i;
const SPECIFIC_CHANGE =
  /\b(increas(?:e|ed|ing)|decreas(?:e|ed|ing)|declin(?:e|ed|ing)|slow(?:ed|ing)|grew|growth|fell|rose|stable|delay(?:ed|s)?|longer|shorter|depend(?:s|ed|ency)|bottleneck|wait(?:s|ed|ing)|retention|churn|conversion|close rate|sales cycle|pipeline)\b/i;
const QUANTIFIED = /\b\d+(?:\.\d+)?\s*(?:%|percent|days?|weeks?|months?|years?)?\b/i;
const SALES_QUESTION = /\b(sales|revenue|pipeline|conversion|close rate|growth)\b/i;

function compare(left: string, right: string): number {
  return left.localeCompare(right);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort(compare);
}

function emptyLineage(): ProductUnderstandingLineage {
  return {
    explanationIds: [],
    compositionIds: [],
    conditionIds: [],
    evidenceIds: [],
    observationIds: [],
  };
}

function lineage(input: Partial<ProductUnderstandingLineage>): ProductUnderstandingLineage {
  return {
    explanationIds: unique(input.explanationIds ?? []),
    compositionIds: unique(input.compositionIds ?? []),
    conditionIds: unique(input.conditionIds ?? []),
    evidenceIds: unique(input.evidenceIds ?? []),
    observationIds: unique(input.observationIds ?? []),
  };
}

function cleanSentence(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function normalized(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productEvidence(result: DiscoveryV3Result): V3Evidence[] {
  const byText = new Map<string, V3Evidence>();
  for (const evidence of [...result.evidence].sort((left, right) =>
    compare(left.id, right.id)
  )) {
    const text = cleanSentence(evidence.text);
    if (
      !text ||
      QUESTION_PREFIX.test(text) ||
      INTERNAL_PRODUCT_TERMS.test(text)
    ) {
      continue;
    }
    const key = normalized(text);
    const current = byText.get(key);
    if (!current || (!current.sourceId && evidence.sourceId)) {
      byText.set(key, evidence);
    }
  }
  return [...byText.values()].sort((left, right) =>
    compare(normalized(left.text), normalized(right.text))
  );
}

function matchingObservation(
  evidence: V3Evidence,
  observations: readonly V3Observation[],
): V3Observation | undefined {
  return observations
    .filter((observation) =>
      observation.source === "evidence" &&
      observation.evidenceIds.includes(evidence.id)
    )
    .sort((left, right) => compare(left.id, right.id))[0];
}

function isSpecificFinding(evidence: V3Evidence): boolean {
  const text = cleanSentence(evidence.text);
  return (
    !ALTERNATIVE_PREFIX.test(text) &&
    !UNRESOLVED_CAUSE.test(text) &&
    !/\b(?:because|caused by|due to|the reason is)\b/i.test(text) &&
    (QUANTIFIED.test(text) || SPECIFIC_CHANGE.test(text))
  );
}

function evidenceLineage(
  evidence: V3Evidence,
  observations: readonly V3Observation[],
): ProductUnderstandingLineage {
  const observation = matchingObservation(evidence, observations);
  return lineage({
    evidenceIds: [
      evidence.id,
      ...(observation?.evidenceIds ?? []),
    ],
    observationIds: observation ? [observation.id] : [],
  });
}

function directFinding(
  evidence: V3Evidence,
  observations: readonly V3Observation[],
): GroundedProductStatement {
  const statement = cleanSentence(evidence.text);
  return {
    statement,
    basis: `This was reported in the evidence you provided: “${statement}”`,
    lineage: evidenceLineage(evidence, observations),
  };
}

function salesContrast(
  evidence: readonly V3Evidence[],
  observations: readonly V3Observation[],
): GroundedProductStatement | null {
  const activity = evidence.find((item) =>
    /\bsales activity\b.*\bincreas/i.test(item.text)
  );
  const closeRate = evidence.find((item) =>
    /\bclose rates?\b.*\b(declin|decreas|fell)/i.test(item.text)
  );
  const cycle = evidence.find((item) =>
    /\bsales(?:-| )cycle\b.*\b(increas|longer|rose)/i.test(item.text)
  );
  if (!activity || (!closeRate && !cycle)) return null;
  const weakening = [closeRate, cycle].filter(
    (item): item is V3Evidence => Boolean(item),
  );
  const statements = weakening.map((item) =>
    cleanSentence(item.text).replace(/[.]$/, "")
  );
  const statement =
    `Sales activity increased while ${statements.join(" and ").replace(
      /^./,
      (character) => character.toLowerCase(),
    )}.`;
  const sources = [activity, ...weakening];
  const observationIds = sources.flatMap((item) => {
    const observation = matchingObservation(item, observations);
    return observation ? [observation.id] : [];
  });
  return {
    statement,
    basis:
      "The submitted evidence reports increased activity alongside weaker conversion or a longer sales cycle. This weakens a motivation-only explanation, but does not disprove it or establish another cause.",
    lineage: lineage({
      evidenceIds: sources.flatMap((item) =>
        evidenceLineage(item, observations).evidenceIds
      ),
      observationIds,
    }),
  };
}

function parseAlternatives(
  evidence: readonly V3Evidence[],
  observations: readonly V3Observation[],
): ProductUnderstanding["candidateExplanations"] {
  const source = evidence.find((item) => ALTERNATIVE_PREFIX.test(item.text));
  if (!source) return [];
  const remainder = cleanSentence(source.text)
    .replace(ALTERNATIVE_PREFIX, "")
    .replace(/[.]$/, "");
  const alternatives = remainder
    .split(/\s*,\s*|\s+or\s+/i)
    .map((item) => item.replace(/^or\s+/i, "").trim())
    .filter((item) => item.length >= 3 && !INTERNAL_PRODUCT_TERMS.test(item));
  const sourceLineage = evidenceLineage(source, observations);
  return unique(alternatives.map((item) => normalized(item)))
    .map((key) => alternatives.find((item) => normalized(item) === key) ?? key)
    .slice(0, 6)
    .map((item) => ({
      statement: cleanSentence(item.replace(/^./, (character) =>
        character.toUpperCase()
      )),
      basis:
        "This was named as a possible explanation in the submitted evidence; the current evidence does not distinguish it from the other alternatives.",
      status: "competing" as const,
      lineage: sourceLineage,
    }));
}

function salesNextEvidence(allText: string): ProductUnderstanding["nextEvidence"] {
  const recommendations = [
    {
      pattern: /\bconversion\b.*\bstage\b|\bstage\b.*\bconversion\b/i,
      label: "Pipeline conversion by stage",
      whyItHelps:
        "Shows where prospects are dropping out and whether the slowdown is concentrated in one part of the sales process.",
      priority: "highest-value" as const,
    },
    {
      pattern: /\bwin.?loss\b|\bloss reasons?\b/i,
      label: "Win/loss reasons",
      whyItHelps:
        "Helps distinguish pricing, competition, product fit, and customer budget pressure.",
      priority: "highest-value" as const,
    },
    {
      pattern: /\bcustomer feedback\b|\bcustomer interviews?\b/i,
      label: "Customer feedback",
      whyItHelps:
        "Adds direct customer evidence that can separate external demand from product or commercial explanations.",
      priority: "recommended" as const,
    },
    {
      pattern: /\bmonthly\b.*\b(sales|revenue|growth|conversion)\b/i,
      label: "Monthly sales and conversion trend",
      whyItHelps:
        "Shows whether the change is temporary or persistent and when it began.",
      priority: "recommended" as const,
    },
    {
      pattern: /\bpricing (?:change|history)|\bpromotion changes?\b/i,
      label: "Pricing or promotion changes",
      whyItHelps:
        "Tests whether commercial changes coincide with the slowdown.",
      priority: "optional" as const,
    },
  ];
  return recommendations
    .filter((item) => !item.pattern.test(allText))
    .slice(0, 4)
    .map((item) => ({
      label: item.label,
      whyItHelps: item.whyItHelps,
      priority: item.priority,
    }));
}

function generalNextEvidence(): ProductUnderstanding["nextEvidence"] {
  return [
    {
      label: "A recent concrete example",
      whyItHelps:
        "Adds people, timing, action, and outcome so Discovery can test whether the concern describes an observable pattern.",
      priority: "highest-value",
    },
    {
      label: "A relevant measure or operating record",
      whyItHelps:
        "Provides an independent observation connected to the question.",
      priority: "recommended",
    },
    {
      label: "A second perspective",
      whyItHelps:
        "Helps test whether the experience is shared and whether another explanation fits better.",
      priority: "optional",
    },
  ];
}

function mergeLineage(
  items: readonly { lineage: ProductUnderstandingLineage }[],
  base: Partial<ProductUnderstandingLineage>,
): ProductUnderstandingLineage {
  return lineage({
    explanationIds: [
      ...(base.explanationIds ?? []),
      ...items.flatMap((item) => item.lineage.explanationIds),
    ],
    compositionIds: [
      ...(base.compositionIds ?? []),
      ...items.flatMap((item) => item.lineage.compositionIds),
    ],
    conditionIds: [
      ...(base.conditionIds ?? []),
      ...items.flatMap((item) => item.lineage.conditionIds),
    ],
    evidenceIds: [
      ...(base.evidenceIds ?? []),
      ...items.flatMap((item) => item.lineage.evidenceIds),
    ],
    observationIds: [
      ...(base.observationIds ?? []),
      ...items.flatMap((item) => item.lineage.observationIds),
    ],
  });
}

function attachCompletedLineage(
  finding: GroundedProductStatement,
  input: Pick<TranslationInput, "runtime">,
): GroundedProductStatement | null {
  const explanations = input.runtime.memory.organizationalExplanations
    .filter((explanation) =>
      explanation.evidenceIds.some((id) =>
        finding.lineage.evidenceIds.includes(id)
      )
    );
  const explanationIds = explanations.map((item) => item.id);
  const compositions =
    input.runtime.memory.organizationalUnderstandingState
      .canonicalCompositions?.filter((composition) =>
        composition.explanationIds.some((id) => explanationIds.includes(id))
      ) ?? [];
  if (explanations.length === 0 || compositions.length === 0) return null;
  const compositionExplanationIds = new Set(
    compositions.flatMap((composition) => composition.explanationIds),
  );
  const completedExplanationIds = explanationIds.filter((id) =>
    compositionExplanationIds.has(id)
  );
  if (completedExplanationIds.length === 0) return null;
  const conditionIds = input.runtime.memory.organizationalConditions
    .filter((condition) =>
      condition.supportingExplanationIds?.some((id) =>
        completedExplanationIds.includes(id)
      )
    )
    .map((condition) => condition.id);
  return {
    ...finding,
    lineage: lineage({
      ...finding.lineage,
      explanationIds: completedExplanationIds,
      compositionIds: compositions.map((composition) => composition.id),
      conditionIds,
    }),
  };
}

/**
 * Deterministic product projection for the first onboarding understanding.
 * It reads canonical investigation artifacts but never changes their authority,
 * completion, persistence, confidence, or disclosure status.
 */
export function translateProductUnderstanding(
  input: TranslationInput,
): ProductUnderstanding {
  if (input.runtime.metadata.organizationId !== input.organizationId) {
    throw new Error("Product understanding organization mismatch.");
  }

  const evidence = productEvidence(input.result);
  const observations = [...input.result.observations].sort((left, right) =>
    compare(left.id, right.id)
  );
  const questionEvidence = input.result.evidence.find((item) =>
    item.sourceId === "onboarding-strategic-priority" ||
    /^question:/i.test(item.text)
  );
  const question = questionEvidence?.text.replace(/^question:\s*/i, "") ?? "";
  const isSales = SALES_QUESTION.test(question);
  const specificEvidence = evidence.filter(isSpecificFinding);
  const contrast = isSales
    ? salesContrast(specificEvidence, observations)
    : null;
  const directFindings = specificEvidence
    .filter((item) =>
      !contrast ||
      !contrast.lineage.evidenceIds.includes(item.id)
    )
    .slice(0, contrast ? 2 : 3)
    .map((item) => directFinding(item, observations));
  const groundedFindings = [...(contrast ? [contrast] : []), ...directFindings]
    .slice(0, 3);
  const candidateExplanations = parseAlternatives(evidence, observations);
  const compositions =
    input.runtime.memory.organizationalUnderstandingState
      .canonicalCompositions ?? [];
  const explanations = input.runtime.memory.organizationalExplanations;
  const completedFindings = groundedFindings.flatMap((finding) => {
    const completed = attachCompletedLineage(finding, input);
    return completed ? [completed] : [];
  });
  const completedLineage = completedFindings.length > 0;
  const explicitUnknown = evidence.some((item) =>
    UNRESOLVED_CAUSE.test(item.text)
  );
  const provisional =
    groundedFindings.length >= 2 &&
    (candidateExplanations.length > 1 || explicitUnknown);
  const status: ProductUnderstanding["status"] =
    completedLineage
      ? "supported"
      : provisional
      ? "provisional"
      : "insufficient";
  const nextEvidence = isSales
    ? salesNextEvidence(evidence.map((item) => item.text).join("\n"))
    : generalNextEvidence();
  const baseLineage = {
    explanationIds: explanations.map((item) => item.id),
    compositionIds: compositions.map((item) => item.id),
    conditionIds: input.runtime.memory.organizationalConditions
      .filter((condition) =>
        (condition.supportingExplanationIds?.length ?? 0) > 0
      )
      .map((item) => item.id),
  };
  const overallLineage = mergeLineage(
    [
      ...(status === "supported" ? completedFindings : groundedFindings),
      ...candidateExplanations,
    ],
    baseLineage,
  );

  if (status === "insufficient") {
    return {
      status,
      headline: "I need a little more to give you a useful answer.",
      supportedFindings: [],
      candidateExplanations: [],
      uncertainties: [
        "The current information does not yet contain enough specific, question-relevant observations to identify a useful pattern.",
      ],
      nextEvidence,
      confidence: {
        state: "unavailable",
        label: "Confidence cannot yet be estimated",
        explanation:
          "A useful interpretation requires at least two concrete observations connected to the question.",
      },
      lineage: overallLineage,
    };
  }

  const uncertainties = isSales
    ? [
        ...(candidateExplanations.length > 1
          ? ["The current evidence does not distinguish among the possible explanations."]
          : []),
        "We do not yet know where in the sales process performance is weakening.",
        "We cannot yet tell whether the slowdown is temporary or persistent.",
      ]
    : [
        "The current evidence does not yet show how widespread or persistent this pattern is.",
      ];
  const supportedFindings =
    status === "supported" ? completedFindings : groundedFindings;

  return {
    status,
    headline: isSales
      ? "More sales activity has not prevented weaker conversion and a longer sales cycle."
      : cleanSentence(supportedFindings[0]?.statement ?? ""),
    supportedFindings,
    candidateExplanations,
    uncertainties,
    nextEvidence,
    confidence: completedLineage
      ? {
          state: "available",
          label: "Supported understanding",
          explanation:
            "A completed organizational understanding supports these findings; the stated uncertainties still apply.",
        }
      : {
          state: "limited",
          label: "Limited confidence",
          explanation:
            "This is a provisional interpretation of the submitted evidence, not an established causal conclusion.",
        },
    lineage: overallLineage,
  };
}

export const productUnderstandingInternalVocabulary =
  INTERNAL_PRODUCT_TERMS;
