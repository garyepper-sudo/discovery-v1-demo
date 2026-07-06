import { buildTheoryReflection } from "./buildTheoryReflection";
import type {
  OrganizationalAssessment,
  OrganizationalJudgment,
  RejectedExplanation,
} from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";
import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";

type ConceptualUnderstandingLike = {
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

type OrganizationalBeliefLike = {
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

type BuildExecutiveAssessmentInput = {
  judgments: OrganizationalJudgment[];
  mechanisms?: OrganizationalMechanism[];
  conceptCandidates?: ConceptCandidate[];
  conceptualUnderstanding?: ConceptualUnderstandingLike[];
  organizationalBeliefs?: OrganizationalBeliefLike[];
};

const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

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
    candidate.confidence * 0.55 + strengthScore * 0.25 + supportScore * 0.2,
  );
}

function summarizeMechanism(mechanism: OrganizationalMechanism): string {
  return `${mechanism.executiveName || mechanism.title}: ${
    mechanism.executiveSummary || mechanism.summary
  }`;
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
  if (!candidate) return [];

  const titleById = mechanismTitleById(mechanisms);

  return candidate.supportingMechanismIds
    .map((id) => titleById.get(id))
    .filter((name): name is string => Boolean(name))
    .slice(0, 5);
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

function judgmentSupportsTheory(
  judgment: OrganizationalJudgment,
  concept: ConceptualUnderstandingLike | null,
  candidate: ConceptCandidate | null,
): boolean {
  if (!concept) return true;

  const judgmentText = normalize(
    `${judgment.title} ${judgment.assessment} ${judgment.executiveRecommendation}`,
  );

  const conceptText = normalize(
    `${concept.statement} ${concept.summary} ${concept.explanation}`,
  );

  const supportingMechanismIds = candidate?.supportingMechanismIds ?? [];

  const mentionsSupportingMechanism = supportingMechanismIds.some((id) =>
    judgmentText.includes(normalize(id)),
  );

  const sharedTerms = conceptText
    .split(" ")
    .filter((term) => term.length >= 6)
    .filter((term) => judgmentText.includes(term));

  return mentionsSupportingMechanism || sharedTerms.length >= 2;
}

export function buildExecutiveAssessment(
  input: BuildExecutiveAssessmentInput,
): OrganizationalAssessment {
  const rankedJudgments = [...input.judgments].sort(
    (a, b) => b.overallScore - a.overallScore,
  );

  const rankedMechanisms = [...(input.mechanisms ?? [])].sort(
    (a, b) => rankMechanism(b) - rankMechanism(a),
  );

  const rankedConceptualUnderstanding = [
    ...(input.conceptualUnderstanding ?? []),
  ]
    .filter(isUsableTheory)
    .sort(
      (a, b) =>
        rankConceptualUnderstanding(b) - rankConceptualUnderstanding(a),
    );

  const rankedConceptCandidates = [...(input.conceptCandidates ?? [])]
    .filter((candidate) => !candidate.id.startsWith("concept-emergent-"))
    .sort((a, b) => rankConceptCandidate(b) - rankConceptCandidate(a));

  const primaryConcept = rankedConceptualUnderstanding[0] ?? null;
  const alternativeTheories = rankedConceptualUnderstanding.slice(1, 4);

  const primaryConceptCandidate =
    findSupportingCandidate(primaryConcept, rankedConceptCandidates) ??
    rankedConceptCandidates[0] ??
    null;

  const primaryMechanisms =
    primaryConceptCandidate?.supportingMechanismIds.length
      ? rankedMechanisms
          .filter((mechanism) =>
            primaryConceptCandidate.supportingMechanismIds.includes(
              mechanism.id,
            ),
          )
          .slice(0, 5)
      : rankedMechanisms.slice(0, 5);

  const strongestJudgment = rankedJudgments[0] ?? null;
  const strongestMechanism = primaryMechanisms[0] ?? rankedMechanisms[0] ?? null;

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

  const rejectedExplanations: RejectedExplanation[] = rankedJudgments
    .filter((judgment) => judgment.status === "rejected")
    .map((judgment) => ({
      explanationId: judgment.explanationId,
      reason:
        judgment.weaknesses[0] ??
        "This explanation did not meet the threshold for executive confidence.",
      confidence: judgment.confidence,
    }));

  const conceptMechanismNames = supportingMechanismNames(
    primaryConceptCandidate,
    rankedMechanisms,
  );

  const recommendedFocus = primaryConcept
    ? [
        primaryConcept.statement.replace(/\.$/, ""),
        ...conceptMechanismNames,
      ].slice(0, 4)
    : primaryMechanisms.length > 0
      ? primaryMechanisms.map(
          (mechanism) => mechanism.executiveName || mechanism.title,
        )
      : executiveJudgments
          .filter(
            (judgment) =>
              judgment.status === "accepted" || judgment.status === "competing",
          )
          .slice(0, 3)
          .map((judgment) => judgment.title);

  const confidence = primaryConcept
    ? rankConceptualUnderstanding(primaryConcept)
    : average(
        rankedJudgments
          .filter((judgment) => judgment.status !== "rejected")
          .map((judgment) => judgment.confidence),
      );

  const theoryValidation = buildTheoryReflection({
    primaryConcept,
    alternativeTheories,
    primaryConceptCandidate,
    mechanisms: rankedMechanisms,
    judgments: executiveJudgments,
    organizationalBeliefs: input.organizationalBeliefs ?? [],
    confidence,
  });

  const summary = primaryConcept
    ? `Discovery judges that the dominant organizational theory is: ${primaryConcept.statement.replace(
        /\.$/,
        "",
      )}.`
    : strongestMechanism
      ? `Discovery judges that the strongest organizational mechanism is: ${
          strongestMechanism.executiveName || strongestMechanism.title
        }.`
      : strongestJudgment
        ? `Discovery judges that the strongest explanation is: ${strongestJudgment.title}.`
        : "Discovery did not identify a sufficiently strong organizational explanation.";

  const supportingMechanismText =
    conceptMechanismNames.length > 0
      ? ` This theory is supported by ${conceptMechanismNames.join(", ")}.`
      : "";

  const executiveNarrative = primaryConcept
    ? `${primaryConcept.summary ?? primaryConcept.statement}${supportingMechanismText} ${
        primaryConcept.explanation ??
        "This theory ranked highest because it had the strongest combined conceptual confidence, coverage, stability, and explanatory power."
      } ${theoryValidation.whyDiscoveryBelievesIt} ${theoryValidation.calibratedConfidenceExplanation} ${theoryValidation.executiveRecommendation}`
    : strongestJudgment
      ? `${strongestJudgment.assessment} This explanation ranked highest because it had the strongest combined judgment score across evidence, explanatory power, causal plausibility, executive significance, and intervention leverage. ${theoryValidation.calibratedConfidenceExplanation}`
      : "The available reasoning paths did not produce a coherent executive assessment.";

  const mechanismCenteredNarrative = primaryConcept
    ? `${primaryConcept.statement.replace(
        /\.$/,
        "",
      )} appears to be the primary force shaping the organization's behavior. Leadership should treat the supporting mechanisms as symptoms of this deeper organizational theory rather than isolated problems.`
    : strongestMechanism
      ? `${strongestMechanism.executiveName || strongestMechanism.title} appears to be the primary force shaping the organization's behavior. ${strongestMechanism.executiveImplication}`
      : undefined;

  return {
    summary,
    strongestJudgmentId:
      executiveJudgments[0]?.id ?? strongestJudgment?.id ?? null,
    judgments: executiveJudgments.slice(0, 5).map((judgment, index) => ({
      ...judgment,
      rank: index + 1,
    })),
    rejectedExplanations,
    executiveNarrative,
    recommendedFocus,
    primaryMechanismIds: primaryMechanisms
      .slice(0, 3)
      .map((mechanism) => mechanism.id),
    primaryMechanismSummaries: primaryMechanisms
      .slice(0, 3)
      .map(summarizeMechanism),
    mechanismCenteredNarrative,
    theoryValidation,
    confidence,
  };
}