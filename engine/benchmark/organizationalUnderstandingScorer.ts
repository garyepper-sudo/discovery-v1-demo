import type { OrganizationalUnderstanding } from "../v3/model/judgment/organizationalJudgment";

export type OrganizationalUnderstandingScore = {
  score: number;
  passed: boolean;

  structuralCompletenessScore: number;
  stateIntegrationScore: number;
  causalSupportScore: number;
  theoryEvaluationScore: number;
  confidenceCalibrationScore: number;
  executiveActionabilityScore: number;

  notes: string[];
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function hasText(
  value: string | null | undefined,
): boolean {
  return Boolean(
    value &&
      typeof value === "string" &&
      value.trim().length > 0,
  );
}

function arrayPresenceScore(
  values: unknown[] | undefined,
  target = 1,
): number {
  if (!values || values.length === 0) {
    return 0;
  }

  return clamp01(values.length / target);
}

function normalizeConfidence(
  confidence: number | undefined,
): number {
  if (
    confidence === undefined ||
    !Number.isFinite(confidence)
  ) {
    return 0;
  }

  return clamp01(
    confidence > 1
      ? confidence / 100
      : confidence,
  );
}

function scoreStructuralCompleteness(
  understanding: OrganizationalUnderstanding,
): number {
  const statement = hasText(
    understanding.statement,
  )
    ? 1
    : 0;

  const summary = hasText(
    understanding.summary,
  )
    ? 1
    : 0;

  const organizationalState =
    understanding.organizationalState
      ? 1
      : 0;

  const dominantCondition =
    understanding.dominantCondition
      ? 1
      : 0;

  const dominantTheory = hasText(
    understanding.dominantTheory,
  )
    ? 1
    : 0;

  const confidence =
    normalizeConfidence(
      understanding.confidence,
    ) > 0
      ? 1
      : 0;

  return clamp01(
    statement * 0.2 +
      summary * 0.15 +
      organizationalState * 0.2 +
      dominantCondition * 0.2 +
      dominantTheory * 0.15 +
      confidence * 0.1,
  );
}

function scoreStateIntegration(
  understanding: OrganizationalUnderstanding,
): number {
  const state =
    understanding.organizationalState;

  const condition =
    understanding.dominantCondition;

  if (!state || !condition) {
    return 0;
  }

  const stateStatus = hasText(
    state.status,
  )
    ? 1
    : 0;

  const stateSummary = hasText(
    state.summary,
  )
    ? 1
    : 0;

  const stateConfidence =
    normalizeConfidence(
      state.confidence,
    ) > 0
      ? 1
      : 0;

  const conditionName = hasText(
    condition.name,
  )
    ? 1
    : 0;

  const conditionStatus = hasText(
    condition.status,
  )
    ? 1
    : 0;

  const conditionSummary = hasText(
    condition.summary,
  )
    ? 1
    : 0;

  const conditionConfidence =
    normalizeConfidence(
      condition.confidence,
    ) > 0
      ? 1
      : 0;

  return clamp01(
    stateStatus * 0.1 +
      stateSummary * 0.2 +
      stateConfidence * 0.1 +
      conditionName * 0.15 +
      conditionStatus * 0.1 +
      conditionSummary * 0.25 +
      conditionConfidence * 0.1,
  );
}

function scoreCausalSupport(
  understanding: OrganizationalUnderstanding,
): number {
  const mechanismSupport =
    arrayPresenceScore(
      understanding.supportingMechanisms,
      2,
    );

  const beliefSupport =
    arrayPresenceScore(
      understanding.supportingOrganizationalBeliefs,
      1,
    );

  const mechanismRationale =
    understanding.supportingMechanisms.length ===
    0
      ? 0
      : understanding.supportingMechanisms.filter(
          (item) =>
            hasText(item.label) &&
            hasText(item.rationale),
        ).length /
        understanding.supportingMechanisms.length;

  const beliefRationale =
    understanding
      .supportingOrganizationalBeliefs.length ===
    0
      ? 0
      : understanding.supportingOrganizationalBeliefs.filter(
          (item) =>
            hasText(item.label) &&
            hasText(item.rationale),
        ).length /
        understanding
          .supportingOrganizationalBeliefs
          .length;

  return clamp01(
    mechanismSupport * 0.4 +
      beliefSupport * 0.2 +
      mechanismRationale * 0.3 +
      beliefRationale * 0.1,
  );
}

function scoreTheoryEvaluation(
  understanding: OrganizationalUnderstanding,
): number {
  const dominantTheory = hasText(
    understanding.dominantTheory,
  )
    ? 1
    : 0;

  const competingTheories =
    arrayPresenceScore(
      understanding.competingTheories,
      2,
    );

  const competingTheoryQuality =
    understanding.competingTheories.length === 0
      ? 0
      : understanding.competingTheories.filter(
          (theory) =>
            hasText(theory.theory) &&
            hasText(
              theory.reasonItWasConsidered,
            ) &&
            hasText(theory.reasonItLost),
        ).length /
        understanding.competingTheories.length;

  const weakeningEvidence =
    arrayPresenceScore(
      understanding
        .contradictoryOrWeakeningEvidence,
      1,
    );

  const falsifyingEvidence =
    arrayPresenceScore(
      understanding.falsifyingEvidence,
      2,
    );

  return clamp01(
    dominantTheory * 0.25 +
      competingTheories * 0.2 +
      competingTheoryQuality * 0.2 +
      weakeningEvidence * 0.1 +
      falsifyingEvidence * 0.25,
  );
}

function scoreConfidenceCalibration(
  understanding: OrganizationalUnderstanding,
): number {
  const confidence =
    normalizeConfidence(
      understanding.confidence,
    );

  const validConfidence =
    confidence > 0 && confidence < 1
      ? 1
      : confidence === 1
        ? 0.5
        : 0;

  const explanation = hasText(
    understanding.confidenceExplanation,
  )
    ? 1
    : 0;

  const additionalEvidence =
    arrayPresenceScore(
      understanding.additionalEvidenceNeeded,
      2,
    );

  const falsifyingEvidence =
    arrayPresenceScore(
      understanding.falsifyingEvidence,
      2,
    );

  const alternativesConsidered =
    arrayPresenceScore(
      understanding.competingTheories,
      1,
    );

  return clamp01(
    validConfidence * 0.2 +
      explanation * 0.25 +
      additionalEvidence * 0.2 +
      falsifyingEvidence * 0.2 +
      alternativesConsidered * 0.15,
  );
}

function scoreExecutiveActionability(
  understanding: OrganizationalUnderstanding,
): number {
  const recommendation = hasText(
    understanding.executiveRecommendation,
  )
    ? 1
    : 0;

  const investigation =
    understanding.nextInvestigation;

  const investigationPresence =
    investigation ? 1 : 0;

  const investigationTopic =
    hasText(investigation?.topic)
      ? 1
      : 0;

  const investigationReason =
    hasText(investigation?.reason)
      ? 1
      : 0;

  const executiveQuestion =
    hasText(
      investigation?.suggestedExecutiveQuestion,
    )
      ? 1
      : 0;

  const expectedGain =
    typeof investigation?.expectedConfidenceGain ===
      "number" &&
    investigation.expectedConfidenceGain > 0
      ? 1
      : 0;

  return clamp01(
    recommendation * 0.35 +
      investigationPresence * 0.1 +
      investigationTopic * 0.1 +
      investigationReason * 0.15 +
      executiveQuestion * 0.2 +
      expectedGain * 0.1,
  );
}

export function scoreOrganizationalUnderstanding(
  understanding:
    | OrganizationalUnderstanding
    | null
    | undefined,
): OrganizationalUnderstandingScore {
  if (!understanding) {
    return {
      score: 0,
      passed: false,

      structuralCompletenessScore: 0,
      stateIntegrationScore: 0,
      causalSupportScore: 0,
      theoryEvaluationScore: 0,
      confidenceCalibrationScore: 0,
      executiveActionabilityScore: 0,

      notes: [
        "Canonical Organizational Understanding was not produced.",
      ],
    };
  }

  const structuralCompleteness =
    scoreStructuralCompleteness(
      understanding,
    );

  const stateIntegration =
    scoreStateIntegration(
      understanding,
    );

  const causalSupport =
    scoreCausalSupport(
      understanding,
    );

  const theoryEvaluation =
    scoreTheoryEvaluation(
      understanding,
    );

  const confidenceCalibration =
    scoreConfidenceCalibration(
      understanding,
    );

  const executiveActionability =
    scoreExecutiveActionability(
      understanding,
    );

  const overallScore = clamp01(
    structuralCompleteness * 0.2 +
      stateIntegration * 0.15 +
      causalSupport * 0.2 +
      theoryEvaluation * 0.15 +
      confidenceCalibration * 0.15 +
      executiveActionability * 0.15,
  );

  const notes: string[] = [];

  if (structuralCompleteness < 0.8) {
    notes.push(
      "Organizational Understanding is structurally incomplete.",
    );
  }

  if (stateIntegration < 0.7) {
    notes.push(
      "The organizational state and dominant condition are not fully integrated.",
    );
  }

  if (causalSupport < 0.7) {
    notes.push(
      "The current understanding lacks sufficient mechanism or belief support.",
    );
  }

  if (theoryEvaluation < 0.7) {
    notes.push(
      "Theory evaluation is incomplete: competing, weakening, or falsifying evidence requires improvement.",
    );
  }

  if (confidenceCalibration < 0.7) {
    notes.push(
      "Confidence is not yet fully calibrated against uncertainty and alternative explanations.",
    );
  }

  if (executiveActionability < 0.7) {
    notes.push(
      "The understanding does not yet provide a sufficiently clear executive action or next investigation.",
    );
  }

  return {
    score: Math.round(
      overallScore * 100,
    ),

    passed:
      overallScore >= 0.75 &&
      structuralCompleteness >= 0.8 &&
      causalSupport >= 0.6,

    structuralCompletenessScore:
      Math.round(
        structuralCompleteness * 100,
      ),

    stateIntegrationScore:
      Math.round(
        stateIntegration * 100,
      ),

    causalSupportScore:
      Math.round(
        causalSupport * 100,
      ),

    theoryEvaluationScore:
      Math.round(
        theoryEvaluation * 100,
      ),

    confidenceCalibrationScore:
      Math.round(
        confidenceCalibration * 100,
      ),

    executiveActionabilityScore:
      Math.round(
        executiveActionability * 100,
      ),

    notes,
  };
}