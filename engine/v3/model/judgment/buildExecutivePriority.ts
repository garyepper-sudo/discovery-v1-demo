import type { OrganizationalJudgment } from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";
import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";
import { rankOrganizationalCondition } from "../state/rankOrganizationalCondition";

export type ConceptualUnderstandingLike = {
  id: string;
  statement: string;
  summary?: string;
  confidence?: number;
  coverage?: number;
  stability?: number;
  explanatoryPower?: number;
  status?: string;
  explanation?: string;
  understandingIds?: string[];
};

export type OrganizationalBeliefLike = {
  id: string;
  statement: string;
  confidence?: number;
  supportingMechanismIds?: string[];
  supportingPatternIds?: string[];
  supportingConceptIds?: string[];
  supportingEvidenceIds?: string[];
  contradictoryEvidenceIds?: string[];
  trend?: string;
};

export type OrganizationalConditionLike = {
  id: string;
  name: string;
  domain: string;
  status?: string;
  priority?: string;
  confidence?: number;
  strength?: number;
  trend?: string;
  summary?: string;
  whyItMatters?: string;
  supportingConceptIds?: string[];
  supportingBeliefIds?: string[];
  supportingMechanismIds?: string[];
  supportingTheoryIds?: string[];
  recommendedExecutiveAction?: string;
};

export type OrganizationalStateLike = {
  id: string;
  summary?: string;
  status?: string;
  confidence?: number;
  dominantConditions?: string[];
  improvingConditions?: string[];
  deterioratingConditions?: string[];
  unresolvedTensions?: string[];
  executiveImplication?: string;
  recommendedFocus?: string[];
};

export type InvestigationOpportunityLike = {
  id: string;
  topic: string;
  reason: string;
  expectedConfidenceGain: number;
  executiveLeverage: "high" | "medium" | "low";
  affectedConditions: string[];
  missingEvidence: string[];
  suggestedExecutiveQuestion: string;
};

export type BuildExecutivePriorityInput = {
  judgments: OrganizationalJudgment[];
  mechanisms?: OrganizationalMechanism[];
  conceptCandidates?: ConceptCandidate[];
  conceptualUnderstanding?: ConceptualUnderstandingLike[];
  organizationalBeliefs?: OrganizationalBeliefLike[];
  organizationalConditions?: OrganizationalConditionLike[];
  organizationalState?: OrganizationalStateLike;
  investigationOpportunities?: InvestigationOpportunityLike[];
};

export type ExecutivePriority = {
  rankedJudgments: OrganizationalJudgment[];
  rankedMechanisms: OrganizationalMechanism[];
  rankedConditions: OrganizationalConditionLike[];
  rankedConceptualUnderstanding: ConceptualUnderstandingLike[];
  rankedConceptCandidates: ConceptCandidate[];

  primaryCondition: OrganizationalConditionLike | null;
  supportingConditions: OrganizationalConditionLike[];

  primaryConcept: ConceptualUnderstandingLike | null;
  alternativeTheories: ConceptualUnderstandingLike[];
  primaryConceptCandidate: ConceptCandidate | null;

  primaryMechanisms: OrganizationalMechanism[];
  strongestJudgment: OrganizationalJudgment | null;
  strongestMechanism: OrganizationalMechanism | null;

  highestValueInvestigation: InvestigationOpportunityLike | null;
  recommendedFocus: string[];
  confidence: number;
};

const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function numericPriority(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (value === "critical") return 1;
  if (value === "high") return 0.85;
  if (value === "medium") return 0.6;
  if (value === "low") return 0.35;
  return 0;
}

function rankMechanism(mechanism: OrganizationalMechanism): number {
  return (
    mechanism.confidence * 0.45 +
    numericPriority(mechanism.executivePriority) * 0.35 +
    Math.min(0.2, (mechanism.supportCount ?? 0) * 0.04)
  );
}


function rankConceptualUnderstanding(
  concept: ConceptualUnderstandingLike,
): number {
  return clamp01(
    (concept.confidence ?? 0.5) * 0.4 +
      (concept.explanatoryPower ?? 0.5) * 0.3 +
      (concept.coverage ?? 0.5) * 0.2 +
      (concept.stability ?? 0.5) * 0.1,
  );
}

function rankConceptCandidate(candidate: ConceptCandidate): number {
  const strengthScore =
    candidate.strength === "strong"
      ? 1
      : candidate.strength === "moderate"
        ? 0.65
        : 0.35;

  const supportScore = clamp01(
    (candidate.supportingMechanismIds.length +
      candidate.supportingBeliefIds.length +
      candidate.supportingPatternIds.length +
      candidate.supportingDynamicIds.length +
      candidate.supportingClusterIds.length +
      candidate.supportingUnderstandingIds.length) /
      12,
  );

  return clamp01(
    candidate.confidence * 0.55 +
      strengthScore * 0.25 +
      supportScore * 0.2,
  );
}

function conceptIdFromUnderstanding(id: string): string {
  return id.startsWith("concept-")
    ? id.replace(/^concept-/, "concept-theory-")
    : id;
}

function findSupportingCandidate(
  concept: ConceptualUnderstandingLike | null,
  candidates: ConceptCandidate[],
): ConceptCandidate | null {
  if (!concept) return null;

  const normalizedConceptId = conceptIdFromUnderstanding(concept.id);

  return (
    candidates.find((candidate) => candidate.id === normalizedConceptId) ??
    candidates.find((candidate) =>
      concept.id.includes(candidate.semanticSignature),
    ) ??
    candidates.find((candidate) =>
      candidate.statement
        .toLowerCase()
        .includes(concept.statement.toLowerCase().replace(/\.$/, "")),
    ) ??
    null
  );
}

function isUsableTheory(concept: ConceptualUnderstandingLike): boolean {
  const text = `${concept.id} ${concept.statement}`.toLowerCase();

  if (text.includes("concept-emergent-appears")) return false;
  if (text.includes("concept-emergent-across")) return false;
  if (text.includes("concept-emergent-organization")) return false;
  if (text.includes("concept-emergent-organizational")) return false;
  if (text.includes("concept-emergent-mechanism")) return false;
  if (text.includes("concept-emergent-recurring")) return false;
  if (text.includes("concept-emergent-unclassified")) return false;
  if (text.includes("recurring appears pattern")) return false;
  if (text.includes("recurring across pattern")) return false;
  if (text.includes("recurring organization pattern")) return false;
  if (text.includes("recurring mechanism pattern")) return false;
  if (text.includes("recurring recurring pattern")) return false;

  return true;
}

function conditionById(
  conditions: OrganizationalConditionLike[],
): Map<string, OrganizationalConditionLike> {
  return new Map(
    conditions.map((condition) => [condition.id, condition]),
  );
}

function matchingMechanismsForCondition(
  condition: OrganizationalConditionLike,
  mechanisms: OrganizationalMechanism[],
): OrganizationalMechanism[] {
  const supportIds = condition.supportingMechanismIds ?? [];

  return mechanisms
    .filter((mechanism) => supportIds.includes(mechanism.id))
    .sort((left, right) => rankMechanism(right) - rankMechanism(left))
    .slice(0, 5);
}

function rankInvestigation(
  opportunity: InvestigationOpportunityLike,
): number {
  const leverage =
    opportunity.executiveLeverage === "high"
      ? 1
      : opportunity.executiveLeverage === "medium"
        ? 0.65
        : 0.35;

  const confidenceGain = clamp01(
    opportunity.expectedConfidenceGain > 1
      ? opportunity.expectedConfidenceGain / 100
      : opportunity.expectedConfidenceGain,
  );

  return confidenceGain * 0.7 + leverage * 0.3;
}

export function buildExecutivePriority(
  input: BuildExecutivePriorityInput,
): ExecutivePriority {
  const rankedJudgments = [...input.judgments].sort(
    (left, right) => right.overallScore - left.overallScore,
  );

  const rankedMechanisms = [...(input.mechanisms ?? [])].sort(
    (left, right) => rankMechanism(right) - rankMechanism(left),
  );

  const rankedConditions = [...(input.organizationalConditions ?? [])].sort(
    (left, right) => rankOrganizationalCondition(right) -
        rankOrganizationalCondition(left),
  );

  const rankedConceptualUnderstanding = [
    ...(input.conceptualUnderstanding ?? []),
  ]
    .filter(isUsableTheory)
    .sort(
      (left, right) =>
        rankConceptualUnderstanding(right) -
        rankConceptualUnderstanding(left),
    );

  const rankedConceptCandidates = [...(input.conceptCandidates ?? [])]
    .filter((candidate) => !candidate.id.startsWith("concept-emergent-"))
    .sort(
      (left, right) =>
        rankConceptCandidate(right) - rankConceptCandidate(left),
    );

  const primaryCondition = rankedConditions[0] ?? null;

  const conditionsById = conditionById(rankedConditions);

  const stateDominantConditions =
    input.organizationalState?.dominantConditions
      ?.map((id) => conditionsById.get(id))
      .filter(
        (
          condition,
        ): condition is OrganizationalConditionLike =>
          Boolean(condition),
      ) ?? [];

  const supportingConditions = [
    ...stateDominantConditions.filter(
      (condition) => condition.id !== primaryCondition?.id,
    ),
    ...rankedConditions.filter(
      (condition) =>
        condition.id !== primaryCondition?.id &&
        !stateDominantConditions.some(
          (stateCondition) => stateCondition.id === condition.id,
        ),
    ),
  ].slice(0, 3);

  const primaryConcept =
    rankedConceptualUnderstanding.find((theory) =>
      primaryCondition?.supportingConceptIds?.includes(theory.id),
    ) ??
    rankedConceptualUnderstanding[0] ??
    null;

  const alternativeTheories = rankedConceptualUnderstanding
    .filter((theory) => theory.id !== primaryConcept?.id)
    .slice(0, 3);

  const primaryConceptCandidate =
    findSupportingCandidate(primaryConcept, rankedConceptCandidates) ??
    rankedConceptCandidates[0] ??
    null;

  const primaryMechanisms = primaryCondition
    ? matchingMechanismsForCondition(
        primaryCondition,
        rankedMechanisms,
      )
    : primaryConceptCandidate?.supportingMechanismIds.length
      ? rankedMechanisms
          .filter((mechanism) =>
            primaryConceptCandidate.supportingMechanismIds.includes(
              mechanism.id,
            ),
          )
          .slice(0, 5)
      : rankedMechanisms.slice(0, 5);

  const strongestJudgment = rankedJudgments[0] ?? null;
  const strongestMechanism =
    primaryMechanisms[0] ?? rankedMechanisms[0] ?? null;

  const highestValueInvestigation =
    [...(input.investigationOpportunities ?? [])].sort(
      (left, right) =>
        rankInvestigation(right) - rankInvestigation(left),
    )[0] ?? null;

  const recommendedFocus = primaryCondition
    ? [
        primaryCondition.name,
        ...supportingConditions.map((condition) => condition.name),
      ].slice(0, 4)
    : primaryConcept
      ? [primaryConcept.statement.replace(/\.$/, "")]
      : primaryMechanisms.length > 0
        ? primaryMechanisms.map(
            (mechanism) =>
              mechanism.executiveName || mechanism.title,
          )
        : rankedJudgments
            .filter(
              (judgment) =>
                judgment.status === "accepted" ||
                judgment.status === "competing",
            )
            .slice(0, 3)
            .map((judgment) => judgment.title);

  const confidence = primaryCondition
    ? clamp01(
        average(
          [
            primaryCondition.confidence ?? 0,
            primaryCondition.strength ?? 0,
            input.organizationalState?.confidence ?? 0,
          ].filter((value) => value > 0),
        ),
      )
    : primaryConcept
      ? rankConceptualUnderstanding(primaryConcept)
      : average(
          rankedJudgments
            .filter((judgment) => judgment.status !== "rejected")
            .map((judgment) => judgment.confidence),
        );

  return {
    rankedJudgments,
    rankedMechanisms,
    rankedConditions,
    rankedConceptualUnderstanding,
    rankedConceptCandidates,

    primaryCondition,
    supportingConditions,

    primaryConcept,
    alternativeTheories,
    primaryConceptCandidate,

    primaryMechanisms,
    strongestJudgment,
    strongestMechanism,

    highestValueInvestigation,
    recommendedFocus,
    confidence,
  };
}
