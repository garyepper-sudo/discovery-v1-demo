import type { UnderstandingCandidate } from "./consolidateUnderstanding";

type ExecutiveAssessmentLike = {
  summary?: string;
  executiveNarrative?: string;
  confidence?: number;
  recommendedFocus?: string[];
  primaryMechanismIds?: string[];
  theoryValidation?: {
    dominantTheory?: string | null;
  };
};

type OrganizationalStateLike = {
  summary?: string;
  status?: string;
  confidence?: number;
  dominantConditions?: string[];
};

type OrganizationalConditionLike = {
  id: string;
  name: string;
  summary?: string;
  confidence?: number;
  supportingBeliefIds?: string[];
  supportingMechanismIds?: string[];
  supportingTheoryIds?: string[];
};

type OrganizationalBeliefLike = {
  id: string;
  statement: string;
};

type OrganizationalTheoryLike = {
  id: string;
  statement?: string;
  title?: string;
};

type OrganizationalMechanismLike = {
  id: string;
  title?: string;
  executiveName?: string;
};

export type BuildExecutiveUnderstandingCandidatesInput = {
  executiveAssessment?: ExecutiveAssessmentLike;
  organizationalState?: OrganizationalStateLike;
  organizationalConditions?: OrganizationalConditionLike[];
  organizationalBeliefs?: OrganizationalBeliefLike[];
  theories?: OrganizationalTheoryLike[];
  mechanisms?: OrganizationalMechanismLike[];
};

function removeTrailingPeriod(value: string): string {
  return value.trim().replace(/\.$/, "");
}

function conditionById(
  conditions: OrganizationalConditionLike[],
): Map<string, OrganizationalConditionLike> {
  return new Map(
    conditions.map((condition) => [condition.id, condition]),
  );
}

export function buildExecutiveUnderstandingCandidates(
  input: BuildExecutiveUnderstandingCandidatesInput,
): UnderstandingCandidate[] {
  const conditions = input.organizationalConditions ?? [];
  const beliefs = input.organizationalBeliefs ?? [];
  const theories = input.theories ?? [];
  const mechanisms = input.mechanisms ?? [];

  const conditionsById = conditionById(conditions);

  const primaryConditionId =
    input.organizationalState?.dominantConditions?.[0];

  const primaryCondition =
    (primaryConditionId
      ? conditionsById.get(primaryConditionId)
      : undefined) ??
    conditions[0];

  if (!primaryCondition) {
    return [];
  }

  const dominantTheory =
    input.executiveAssessment?.theoryValidation?.dominantTheory;

  const theoryStatement = dominantTheory
    ? removeTrailingPeriod(dominantTheory)
    : undefined;

  const mechanismNames = mechanisms
    .filter((mechanism) =>
      (
        input.executiveAssessment?.primaryMechanismIds ??
        primaryCondition.supportingMechanismIds ??
        []
      ).includes(mechanism.id),
    )
    .map(
      (mechanism) =>
        mechanism.executiveName ??
        mechanism.title,
    )
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);

  const primaryBelief = beliefs.find((belief) =>
    primaryCondition.supportingBeliefIds?.includes(
      belief.id,
    ),
  );

  const primaryConditionStatement =
    `${primaryCondition.name} is currently constraining organizational performance`;

  const causalExplanation =
    mechanismNames.length > 0
      ? ` through ${mechanismNames.join(", ")}`
      : "";

  const beliefExplanation = primaryBelief
    ? `, reinforced by the belief that ${removeTrailingPeriod(
        primaryBelief.statement,
      ).toLowerCase()}`
    : "";

  const theoryExplanation = theoryStatement
    ? ` The current working theory is that ${theoryStatement.toLowerCase()}.`
    : "";

  const statement =
    `${primaryConditionStatement}${causalExplanation}${beliefExplanation}.${theoryExplanation}`
      .replace(/\s+/g, " ")
      .trim();

  const supportingTheoryIds = theories
    .filter(
      (theory) =>
        primaryCondition.supportingTheoryIds?.includes(
          theory.id,
        ) ||
        (theoryStatement &&
          (
            theory.statement ??
            theory.title ??
            ""
          )
            .toLowerCase()
            .includes(theoryStatement.toLowerCase())),
    )
    .map((theory) => theory.id);

  return [
    {
      id: `executive-understanding-${primaryCondition.id}`,

      statement,

      confidence:
        input.executiveAssessment?.confidence ??
        primaryCondition.confidence ??
        input.organizationalState?.confidence,

      beliefIds:
        primaryCondition.supportingBeliefIds ?? [],

      mechanismIds:
        input.executiveAssessment?.primaryMechanismIds ??
        primaryCondition.supportingMechanismIds ??
        [],

      themeIds: supportingTheoryIds,

      evidenceIds: [],

      observationIds: [],

      contradictionIds: [],

      source: "executive-assessment",
    },
  ];
}