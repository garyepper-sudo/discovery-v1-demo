import { buildOrganizationalUnderstanding } from "./buildOrganizationalUnderstanding";
import { buildTheoryReflection } from "./buildTheoryReflection";
import {
  buildExecutivePriority,
  type ConceptualUnderstandingLike,
  type InvestigationOpportunityLike,
  type OrganizationalBeliefLike,
  type OrganizationalConditionLike,
  type OrganizationalStateLike,
} from "./buildExecutivePriority";
import type {
  OrganizationalAssessment,
  OrganizationalJudgment,
  RejectedExplanation,
} from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";
import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";
import type { PredictionReflection } from "../predictions/buildPredictionReflection";

type BuildExecutiveAssessmentInput = {
  judgments: OrganizationalJudgment[];
  mechanisms?: OrganizationalMechanism[];
  conceptCandidates?: ConceptCandidate[];
  conceptualUnderstanding?: ConceptualUnderstandingLike[];
  organizationalBeliefs?: OrganizationalBeliefLike[];
  organizationalConditions?: OrganizationalConditionLike[];
  organizationalState?: OrganizationalStateLike;
  investigationOpportunities?: InvestigationOpportunityLike[];
  predictionReflection?: PredictionReflection;
};

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeMechanism(
  mechanism: OrganizationalMechanism,
): string {
  return `${mechanism.executiveName || mechanism.title}: ${
    mechanism.executiveSummary || mechanism.summary
  }`;
}

function mechanismTitleById(
  mechanisms: OrganizationalMechanism[],
): Map<string, string> {
  return new Map(
    mechanisms.map((mechanism) => [
      mechanism.id,
      mechanism.executiveName || mechanism.title,
    ]),
  );
}

function supportingMechanismNames(
  candidate: ConceptCandidate | null,
  mechanisms: OrganizationalMechanism[],
): string[] {
  if (!candidate) {
    return [];
  }

  const titleById = mechanismTitleById(mechanisms);

  return candidate.supportingMechanismIds
    .map((id) => titleById.get(id))
    .filter((name): name is string => Boolean(name))
    .slice(0, 5);
}

function judgmentSupportsTheory(
  judgment: OrganizationalJudgment,
  concept: ConceptualUnderstandingLike | null,
  candidate: ConceptCandidate | null,
): boolean {
  if (!concept) {
    return true;
  }

  const judgmentText = normalize(
    `${judgment.title} ${judgment.assessment} ${judgment.executiveRecommendation}`,
  );

  const conceptText = normalize(
    `${concept.statement} ${concept.summary} ${concept.explanation}`,
  );

  const supportingMechanismIds =
    candidate?.supportingMechanismIds ?? [];

  const mentionsSupportingMechanism =
    supportingMechanismIds.some((id) =>
      judgmentText.includes(normalize(id)),
    );

  const sharedTerms = conceptText
    .split(" ")
    .filter((term) => term.length >= 6)
    .filter((term) => judgmentText.includes(term));

  return (
    mentionsSupportingMechanism ||
    sharedTerms.length >= 2
  );
}

function buildConditionNarrative(params: {
  organizationalState?: OrganizationalStateLike;
  primaryCondition: OrganizationalConditionLike;
  relatedConditions: OrganizationalConditionLike[];
  supportingTheories: ConceptualUnderstandingLike[];
  supportingMechanisms: OrganizationalMechanism[];
}): string {
  const {
    organizationalState,
    primaryCondition,
    relatedConditions,
    supportingTheories,
    supportingMechanisms,
  } = params;

  const relatedNames = relatedConditions
    .slice(0, 3)
    .map((condition) => condition.name);

  const theoryNames = supportingTheories
    .slice(0, 3)
    .map((theory) =>
      theory.statement.replace(/\.$/, ""),
    );

  const mechanismNames = supportingMechanisms
    .slice(0, 3)
    .map(
      (mechanism) =>
        mechanism.executiveName || mechanism.title,
    );

  const stateSentence = organizationalState?.summary
    ? organizationalState.summary
    : `Discovery sees the organization as ${
        organizationalState?.status ?? "under assessment"
      }.`;

  const relationshipSentence =
    relatedNames.length > 0
      ? `${primaryCondition.name} should be interpreted alongside ${relatedNames.join(
          ", ",
        )}, because these conditions appear to shape the organization's current operating state.`
      : `${primaryCondition.name} is currently the clearest condition-level signal.`;

  const theorySentence =
    theoryNames.length > 0
      ? `Supporting theories include ${theoryNames.join(
          ", ",
        )}.`
      : "Discovery does not yet have enough stable theories to strongly explain this condition.";

  const mechanismSentence =
    mechanismNames.length > 0
      ? `The most relevant mechanisms are ${mechanismNames.join(
          ", ",
        )}.`
      : "Discovery should continue collecting evidence to identify the mechanisms beneath this condition.";

  return [
    stateSentence,
    primaryCondition.summary,
    relationshipSentence,
    theorySentence,
    mechanismSentence,
    organizationalState?.executiveImplication,
    primaryCondition.recommendedExecutiveAction,
  ]
    .filter(Boolean)
    .join(" ");
}

function matchingTheoriesForCondition(
  condition: OrganizationalConditionLike,
  theories: ConceptualUnderstandingLike[],
): ConceptualUnderstandingLike[] {
  const supportIds =
    condition.supportingConceptIds ?? [];

  return theories
    .filter((theory) =>
      supportIds.includes(theory.id),
    )
    .slice(0, 4);
}

function buildPredictionNarrative(
  predictionReflection?: PredictionReflection,
): string {
  if (
    !predictionReflection ||
    !predictionReflection.primaryPrediction
  ) {
    return "";
  }

  const confidencePercent = Math.round(
    predictionReflection.confidence * 100,
  );

  const likelihoodPercent = Math.round(
    predictionReflection.likelihood * 100,
  );

  return [
    `Discovery's current future-state prediction is: ${predictionReflection.primaryPrediction}`,
    `Discovery assigns ${confidencePercent}% confidence to the reasoning and estimates the outcome at ${likelihoodPercent}% likelihood.`,
    predictionReflection.whyDiscoveryPredictsThis,
    predictionReflection.calibratedConfidenceExplanation,
    predictionReflection.executiveRecommendation,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildExecutiveAssessment(
  input: BuildExecutiveAssessmentInput,
): OrganizationalAssessment {
  const priority = buildExecutivePriority(input);

  const {
    rankedJudgments,
    rankedMechanisms,
    rankedConceptualUnderstanding,
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
  } = priority;

  const theorySupportingJudgments = primaryConcept
    ? rankedJudgments.filter((judgment) =>
        judgmentSupportsTheory(
          judgment,
          primaryConcept,
          primaryConceptCandidate,
        ),
      )
    : rankedJudgments;

  const executiveJudgments =
    theorySupportingJudgments.length > 0
      ? theorySupportingJudgments
      : rankedJudgments;

  const rejectedExplanations: RejectedExplanation[] =
    rankedJudgments
      .filter(
        (judgment) =>
          judgment.status === "rejected",
      )
      .map((judgment) => ({
        explanationId: judgment.explanationId,
        reason:
          judgment.weaknesses[0] ??
          "This explanation did not meet the threshold for executive confidence.",
        confidence: judgment.confidence,
      }));

  const conceptMechanismNames =
    supportingMechanismNames(
      primaryConceptCandidate,
      rankedMechanisms,
    );

  const supportingTheoriesForPrimaryCondition =
    primaryCondition
      ? matchingTheoriesForCondition(
          primaryCondition,
          rankedConceptualUnderstanding,
        )
      : [];

  const theoryValidation = buildTheoryReflection({
    primaryConcept,
    alternativeTheories,
    primaryConceptCandidate,
    mechanisms: rankedMechanisms,
    judgments: executiveJudgments,
    organizationalBeliefs:
      input.organizationalBeliefs ?? [],
    confidence,
  });

  const summary = primaryCondition
    ? `Discovery judges that the current organizational state is ${
        input.organizationalState?.status ??
        "under assessment"
      }, led by ${primaryCondition.name}.`
    : primaryConcept
      ? `Discovery judges that the dominant organizational theory is: ${primaryConcept.statement.replace(
          /\.$/,
          "",
        )}.`
      : strongestMechanism
        ? `Discovery judges that the strongest organizational mechanism is: ${
            strongestMechanism.executiveName ||
            strongestMechanism.title
          }.`
        : strongestJudgment
          ? `Discovery judges that the strongest explanation is: ${strongestJudgment.title}.`
          : "Discovery did not identify a sufficiently strong organizational explanation.";

  const supportingMechanismText =
    conceptMechanismNames.length > 0
      ? ` This theory is supported by ${conceptMechanismNames.join(
          ", ",
        )}.`
      : "";

  const executiveNarrative = primaryCondition
    ? buildConditionNarrative({
        organizationalState:
          input.organizationalState,
        primaryCondition,
        relatedConditions: supportingConditions,
        supportingTheories:
          supportingTheoriesForPrimaryCondition.length >
          0
            ? supportingTheoriesForPrimaryCondition
            : rankedConceptualUnderstanding.slice(
                0,
                3,
              ),
        supportingMechanisms:
          primaryMechanisms.length > 0
            ? primaryMechanisms
            : rankedMechanisms.slice(0, 3),
      })
    : primaryConcept
      ? `${
          primaryConcept.summary ??
          primaryConcept.statement
        }${supportingMechanismText} ${
          primaryConcept.explanation ??
          "This theory ranked highest because it had the strongest combined conceptual confidence, coverage, stability, and explanatory power."
        } ${
          theoryValidation.whyDiscoveryBelievesIt
        } ${
          theoryValidation.calibratedConfidenceExplanation
        } ${theoryValidation.executiveRecommendation}`
      : strongestJudgment
        ? `${strongestJudgment.assessment} This explanation ranked highest because it had the strongest combined judgment score across evidence, explanatory power, causal plausibility, executive significance, and intervention leverage. ${theoryValidation.calibratedConfidenceExplanation}`
        : "The available reasoning paths did not produce a coherent executive assessment.";

  const investigationNarrative =
    highestValueInvestigation
      ? ` Discovery's highest-value next investigation is ${
          highestValueInvestigation.topic
        }. This investigation is expected to improve confidence by approximately ${
          highestValueInvestigation.expectedConfidenceGain
        }% across ${highestValueInvestigation.affectedConditions.join(
          ", ",
        )}. Suggested executive question: ${
          highestValueInvestigation.suggestedExecutiveQuestion
        }`
      : "";

  const predictionNarrative =
    buildPredictionNarrative(
      input.predictionReflection,
    );

  const completeExecutiveNarrative = [
    executiveNarrative,
    predictionNarrative,
    investigationNarrative,
  ]
    .filter(Boolean)
    .join(" ");

  const mechanismCenteredNarrative =
    primaryCondition
      ? `${primaryCondition.name} appears to be the primary condition shaping the organization's current state. Leadership should treat supporting theories and mechanisms as evidence for this condition rather than as the executive conclusion itself.`
      : primaryConcept
        ? `${primaryConcept.statement.replace(
            /\.$/,
            "",
          )} appears to be the primary force shaping the organization's behavior. Leadership should treat the supporting mechanisms as symptoms of this deeper organizational theory rather than isolated problems.`
        : strongestMechanism
          ? `${
              strongestMechanism.executiveName ||
              strongestMechanism.title
            } appears to be the primary force shaping the organization's behavior. ${
              strongestMechanism.executiveImplication
            }`
          : undefined;

  const organizationalUnderstanding =
    buildOrganizationalUnderstanding({
      summary,
      narrative: completeExecutiveNarrative,
      confidence,

      organizationalState:
        input.organizationalState,

      primaryCondition,

      theoryValidation,

      primaryMechanisms:
        primaryMechanisms.length > 0
          ? primaryMechanisms
          : rankedMechanisms.slice(0, 3),

      highestValueInvestigation,
    });

  return {
    summary,

    strongestJudgmentId:
      executiveJudgments[0]?.id ??
      strongestJudgment?.id ??
      null,

    judgments: executiveJudgments
      .slice(0, 5)
      .map((judgment, index) => ({
        ...judgment,
        rank: index + 1,
      })),

    rejectedExplanations,

    organizationalUnderstanding,

    predictionReflection:
      input.predictionReflection,

    executiveNarrative:
      completeExecutiveNarrative,

    recommendedFocus,

    primaryMechanismIds: primaryMechanisms
      .slice(0, 3)
      .map((mechanism) => mechanism.id),

    primaryMechanismSummaries:
      primaryMechanisms
        .slice(0, 3)
        .map(summarizeMechanism),

    mechanismCenteredNarrative,

    theoryValidation,

    confidence,
  };
}
