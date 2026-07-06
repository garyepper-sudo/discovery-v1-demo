import type {
  CompetingTheoryAssessment,
  TheoryValidation,
  TheoryValidationEvidence,
} from "./organizationalJudgment";
import type { OrganizationalJudgment } from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";
import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";

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

export type BuildTheoryReflectionInput = {
  primaryConcept: ConceptualUnderstandingLike | null;
  alternativeTheories: ConceptualUnderstandingLike[];
  primaryConceptCandidate: ConceptCandidate | null;
  mechanisms: OrganizationalMechanism[];
  judgments: OrganizationalJudgment[];
  organizationalBeliefs?: OrganizationalBeliefLike[];
  confidence: number;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function percent(value: number): number {
  return Math.round(clamp01(value) * 100);
}

function mechanismName(mechanism: OrganizationalMechanism): string {
  return mechanism.executiveName || mechanism.title;
}

function rankTheory(concept: ConceptualUnderstandingLike): number {
  return clamp01(
    (concept.confidence ?? 0.5) * 0.4 +
      (concept.explanatoryPower ?? 0.5) * 0.3 +
      (concept.coverage ?? 0.5) * 0.2 +
      (concept.stability ?? 0.5) * 0.1,
  );
}

function candidateMechanismIds(candidate: ConceptCandidate | null): string[] {
  return candidate?.supportingMechanismIds ?? [];
}

function supportingMechanisms(params: {
  candidate: ConceptCandidate | null;
  mechanisms: OrganizationalMechanism[];
}): TheoryValidationEvidence[] {
  const supportingIds = candidateMechanismIds(params.candidate);

  const matched =
    supportingIds.length > 0
      ? params.mechanisms.filter((mechanism) =>
          supportingIds.includes(mechanism.id),
        )
      : params.mechanisms;

  return matched.slice(0, 6).map((mechanism) => ({
    label: mechanismName(mechanism),
    rationale:
      mechanism.executiveSummary ||
      mechanism.summary ||
      `${mechanismName(
        mechanism,
      )} appears to support the dominant organizational theory.`,
    confidence: mechanism.confidence,
  }));
}

function supportingBeliefs(params: {
  candidate: ConceptCandidate | null;
  beliefs: OrganizationalBeliefLike[];
  primaryConcept: ConceptualUnderstandingLike | null;
}): TheoryValidationEvidence[] {
  const mechanismIds = new Set(candidateMechanismIds(params.candidate));
  const conceptText = params.primaryConcept?.id.replace(/^concept-/, "") ?? "";

  const matched = params.beliefs
    .filter((belief) => {
      const supportsMechanism = (belief.supportingMechanismIds ?? []).some(
        (id) => mechanismIds.has(id),
      );

      const supportsConcept = (belief.supportingConceptIds ?? []).some((id) =>
        id.includes(conceptText),
      );

      return supportsMechanism || supportsConcept;
    })
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

  return matched.slice(0, 5).map((belief) => ({
    label: belief.statement,
    rationale: `This belief is ${belief.trend ?? "present"} and is supported by ${
      belief.supportingMechanismIds?.length ?? 0
    } mechanism(s), ${belief.supportingPatternIds?.length ?? 0} pattern(s), and ${
      belief.supportingConceptIds?.length ?? 0
    } concept signal(s).`,
    confidence: belief.confidence,
  }));
}

function competingTheories(
  primaryConcept: ConceptualUnderstandingLike | null,
  alternatives: ConceptualUnderstandingLike[],
): CompetingTheoryAssessment[] {
  const primaryScore = primaryConcept ? rankTheory(primaryConcept) : 0;

  return alternatives.slice(0, 3).map((theory) => {
    const alternativeScore = rankTheory(theory);
    const scoreGap = clamp01(primaryScore - alternativeScore);

    const reasonItLost =
      scoreGap < 0.03
        ? "This theory remains closely competitive but did not exceed the dominant theory's combined confidence, stability, coverage, and explanatory power."
        : alternativeScore < primaryScore
          ? "This theory explains part of the evidence but has lower combined confidence, stability, coverage, and explanatory power than the dominant theory."
          : "This theory was considered adjacent to the dominant theory but was not selected as the primary executive explanation.";

    return {
      theory: theory.statement.replace(/\.$/, ""),
      reasonItWasConsidered:
        theory.summary ??
        theory.explanation ??
        "Discovery considered this as a plausible competing organizational theory.",
      reasonItLost,
      confidence: alternativeScore,
    };
  });
}

function contradictoryEvidence(params: {
  judgments: OrganizationalJudgment[];
  beliefs: OrganizationalBeliefLike[];
}): TheoryValidationEvidence[] {
  const weakJudgments = params.judgments
    .filter(
      (judgment) =>
        judgment.status === "weak" ||
        judgment.status === "competing" ||
        judgment.weaknesses.length > 0,
    )
    .slice(0, 4)
    .map((judgment) => ({
      label: judgment.title,
      rationale:
        judgment.weaknesses[0] ??
        "This judgment remains weak or competing, which reduces certainty in the dominant theory.",
      confidence: judgment.confidence,
    }));

  const beliefContradictions = params.beliefs
    .filter((belief) => (belief.contradictoryEvidenceIds ?? []).length > 0)
    .slice(0, 3)
    .map((belief) => ({
      label: belief.statement,
      rationale: `This belief has ${
        belief.contradictoryEvidenceIds?.length ?? 0
      } contradictory evidence signal(s).`,
      confidence: belief.confidence,
    }));

  return [...weakJudgments, ...beliefContradictions].slice(0, 5);
}

function confidenceExplanation(params: {
  primaryConcept: ConceptualUnderstandingLike | null;
  alternatives: ConceptualUnderstandingLike[];
  supportingMechanisms: TheoryValidationEvidence[];
  supportingBeliefs: TheoryValidationEvidence[];
  contradictoryEvidence: TheoryValidationEvidence[];
  confidence: number;
}): string {
  const confidencePct = percent(params.confidence);
  const strongestAlternative = params.alternatives[0];
  const strongestAlternativeScore = strongestAlternative
    ? percent(rankTheory(strongestAlternative))
    : 0;

  const supportText = `Discovery assigns ${confidencePct}% confidence because the dominant theory has support from ${params.supportingMechanisms.length} mechanism(s) and ${params.supportingBeliefs.length} organizational belief(s).`;

  const alternativeText = strongestAlternative
    ? ` Confidence is not treated as certainty because ${strongestAlternative.statement.replace(
        /\.$/,
        "",
      )} remains partially plausible at approximately ${strongestAlternativeScore}% theoretical strength.`
    : " Confidence is not treated as certainty because additional organizational evidence could still reveal a better explanation.";

  const contradictionText =
    params.contradictoryEvidence.length > 0
      ? ` Confidence is reduced by ${params.contradictoryEvidence.length} weak, competing, or contradictory signal(s).`
      : " No strong contradictory evidence was identified, but absence of contradiction is not the same as proof.";

  return `${supportText}${alternativeText}${contradictionText}`;
}

function additionalEvidenceNeeded(
  primaryConcept: ConceptualUnderstandingLike | null,
): string[] {
  const text = `${primaryConcept?.id ?? ""} ${
    primaryConcept?.statement ?? ""
  } ${primaryConcept?.summary ?? ""}`.toLowerCase();

  if (text.includes("continuity") || text.includes("knowledge")) {
    return [
      "Historical evidence showing whether prior lessons are reused across teams and time.",
      "Documentation retrieval data showing whether employees can reliably find relevant past work.",
      "Onboarding and transfer evidence showing how quickly critical expertise becomes accessible to new employees.",
    ];
  }

  if (
    text.includes("governance") ||
    text.includes("approval") ||
    text.includes("decision")
  ) {
    return [
      "Decision-cycle-time evidence before and after approval changes.",
      "Authority-mapping evidence showing where decisions are actually made.",
      "Examples of work delayed specifically because of escalation or approval dependencies.",
    ];
  }

  if (text.includes("execution") || text.includes("coordination")) {
    return [
      "Cross-functional handoff evidence showing where work stalls.",
      "Ownership clarity evidence across teams, functions, and operating interfaces.",
      "Delivery timeline evidence connecting coordination issues to execution delays.",
    ];
  }

  return [
    "Additional longitudinal evidence showing whether this theory persists over time.",
    "More evidence from adjacent teams or functions to test whether the pattern is local or systemic.",
    "Contrasting examples where the theory should predict outcomes but does not.",
  ];
}

function falsificationCriteria(
  primaryConcept: ConceptualUnderstandingLike | null,
): string[] {
  const text = `${primaryConcept?.id ?? ""} ${
    primaryConcept?.statement ?? ""
  } ${primaryConcept?.summary ?? ""}`.toLowerCase();

  if (text.includes("continuity") || text.includes("knowledge")) {
    return [
      "Evidence that knowledge is well-preserved, easy to retrieve, and consistently reused while the observed problems still persist.",
      "Evidence that duplicated work is caused primarily by intentional parallel experimentation rather than failure to transfer organizational learning.",
      "Evidence that improving documentation and knowledge transfer does not reduce repeated work, escalations, or institutional memory loss.",
    ];
  }

  if (
    text.includes("governance") ||
    text.includes("approval") ||
    text.includes("decision")
  ) {
    return [
      "Evidence that decision rights are already decentralized but execution delays persist for unrelated reasons.",
      "Evidence that approval steps are fast and rarely block work despite perceived governance friction.",
      "Evidence that delays disappear without changing decision authority, escalation paths, or approval structure.",
    ];
  }

  if (text.includes("execution") || text.includes("coordination")) {
    return [
      "Evidence that handoffs, ownership, and coordination are clear while execution delays persist.",
      "Evidence that delays are driven primarily by external constraints rather than internal operating interfaces.",
      "Evidence that improving coordination does not improve delivery speed, quality, or customer responsiveness.",
    ];
  }

  return [
    "Evidence that the dominant theory does not predict future organizational behavior.",
    "Evidence that a competing theory explains more mechanisms with less contradiction.",
    "Evidence that the same symptoms persist after interventions directly targeting the dominant theory.",
  ];
}

function executiveRecommendation(
  primaryConcept: ConceptualUnderstandingLike | null,
  supportingMechanisms: TheoryValidationEvidence[],
): string {
  if (!primaryConcept) {
    return "Do not overcommit to an executive conclusion until Discovery identifies a stable dominant organizational theory.";
  }

  const focus =
    supportingMechanisms.length > 0
      ? supportingMechanisms
          .slice(0, 3)
          .map((item) => item.label)
          .join(", ")
      : "the strongest supporting mechanisms";

  return `Treat ${primaryConcept.statement.replace(
    /\.$/,
    "",
  )} as the current working theory. Focus intervention on ${focus}, while collecting evidence that could confirm, weaken, or falsify this explanation.`;
}

export function buildTheoryReflection(
  input: BuildTheoryReflectionInput,
): TheoryValidation {
  const supportingMechanismEvidence = supportingMechanisms({
    candidate: input.primaryConceptCandidate,
    mechanisms: input.mechanisms,
  });

  const supportingBeliefEvidence = supportingBeliefs({
    candidate: input.primaryConceptCandidate,
    beliefs: input.organizationalBeliefs ?? [],
    primaryConcept: input.primaryConcept,
  });

  const competingTheoryAssessments = competingTheories(
    input.primaryConcept,
    input.alternativeTheories,
  );

  const weakeningEvidence = contradictoryEvidence({
    judgments: input.judgments,
    beliefs: input.organizationalBeliefs ?? [],
  });

  const whyDiscoveryBelievesIt = input.primaryConcept
    ? `Discovery selected ${input.primaryConcept.statement.replace(
        /\.$/,
        "",
      )} because it has the strongest combined confidence, coverage, stability, and explanatory power among available organizational theories. It is supported by ${
        supportingMechanismEvidence.length
      } mechanism(s) and ${
        supportingBeliefEvidence.length
      } organizational belief(s).`
    : "Discovery did not identify a stable dominant organizational theory from the available evidence.";

  return {
    dominantTheory: input.primaryConcept?.statement.replace(/\.$/, "") ?? null,

    whyDiscoveryBelievesIt,

    supportingMechanisms: supportingMechanismEvidence,
    supportingOrganizationalBeliefs: supportingBeliefEvidence,

    competingTheoriesConsidered: competingTheoryAssessments,

    contradictoryOrWeakeningEvidence: weakeningEvidence,

    calibratedConfidenceExplanation: confidenceExplanation({
      primaryConcept: input.primaryConcept,
      alternatives: input.alternativeTheories,
      supportingMechanisms: supportingMechanismEvidence,
      supportingBeliefs: supportingBeliefEvidence,
      contradictoryEvidence: weakeningEvidence,
      confidence: input.confidence,
    }),

    additionalEvidenceThatWouldIncreaseConfidence:
      additionalEvidenceNeeded(input.primaryConcept),

    evidenceThatWouldFalsifyTheory: falsificationCriteria(input.primaryConcept),

    executiveRecommendation: executiveRecommendation(
      input.primaryConcept,
      supportingMechanismEvidence,
    ),
  };
}