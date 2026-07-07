import type {
  BenchmarkScore,
  DiscoveryBenchmarkCase,
} from "./benchmarkTypes";
import { scoreOrganizationalLearningBenchmark } from "./organizationalLearningBenchmark";

type TheoryValidationItem = {
  label?: string;
  rationale?: string;
  confidence?: number;
};

type CompetingTheoryItem = {
  theory?: string;
  reasonItWasConsidered?: string;
  reasonItLost?: string;
  confidence?: number;
};

type OrganizationalConditionBenchmarkItem = {
  name?: string;
  status?: string;
  priority?: string;
  summary?: string;
  whyItMatters?: string;
  recommendedExecutiveAction?: string;
};

type OrganizationalStateBenchmarkItem = {
  status?: string;
  summary?: string;
  executiveImplication?: string;
  recommendedFocus?: string[];
};

type ExecutiveAssessmentBenchmarkItem = {
  summary?: string;
  executiveNarrative?: string;
  recommendedFocus?: string[];
};

type ActualBenchmarkOutput = {
  organizationalLearningProfile?: unknown;
  mechanisms?: string[];
  capabilities?: string[];
  compressedConcepts?: string[];
  conceptualUnderstanding?: string[];
  executiveText?: string;
  organizationalConditions?: OrganizationalConditionBenchmarkItem[];
  organizationalState?: OrganizationalStateBenchmarkItem;
  executiveAssessment?: ExecutiveAssessmentBenchmarkItem;
  theoryValidation?: {
    dominantTheory?: string | null;
    whyDiscoveryBelievesIt?: string;
    supportingMechanisms?: TheoryValidationItem[];
    supportingOrganizationalBeliefs?: TheoryValidationItem[];
    competingTheoriesConsidered?: CompetingTheoryItem[];
    contradictoryOrWeakeningEvidence?: TheoryValidationItem[];
    calibratedConfidenceExplanation?: string;
    additionalEvidenceThatWouldIncreaseConfidence?: string[];
    evidenceThatWouldFalsifyTheory?: string[];
    executiveRecommendation?: string;
  };
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(actual: string[], expected: string[]): number {
  if (expected.length === 0) return 1;

  const normalizedActual = actual.map(normalize);

  const matched = expected.filter((item) => {
    const normalizedExpected = normalize(item);

    return normalizedActual.some(
      (actualItem) =>
        actualItem.includes(normalizedExpected) ||
        normalizedExpected.includes(actualItem),
    );
  });

  return matched.length / expected.length;
}

function avoidPenalty(actual: string[], avoid: string[] = []): number {
  if (avoid.length === 0) return 0;

  const normalizedActualText = actual.map(normalize).join(" ");

  const violations = avoid.filter((item) =>
    normalizedActualText.includes(normalize(item)),
  );

  return Math.min(0.35, violations.length * 0.12);
}

function signalScore(text: string[], signals: string[]): number {
  return includesAny(text, signals);
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && normalize(value).length > 0);
}

function arrayPresenceScore(values: unknown[] | undefined, target = 1): number {
  if (!values || values.length === 0) return 0;
  return clamp01(values.length / target);
}

function theorySignalScore(text: string[]): number {
  return signalScore(text, [
    "organizational continuity",
    "continuity failure",
    "organizational learning",
    "learning failure",
    "governance bottleneck",
    "centralized governance",
    "cross functional execution",
    "execution friction",
    "strategic alignment",
    "alignment drift",
    "capacity strain",
    "operating model",
    "deeper failure",
    "dominant organizational theory",
    "manifestations of a deeper",
    "supporting mechanisms",
  ]);
}

function conditionSignalScore(text: string[]): number {
  return signalScore(text, [
    "leadership dependency",
    "coordination system",
    "knowledge continuity",
    "decision flow",
    "execution capacity",
    "learning system",
    "operating model",
    "strategic alignment",
    "organizational condition",
    "condition level",
    "organizational state",
    "current organizational state",
    "strained",
    "constrained",
    "deteriorating",
    "executive attention",
  ]);
}

function systemsSignalScore(text: string[]): number {
  return signalScore(text, [
    "reinforced by",
    "reinforces",
    "constrains",
    "constraint",
    "drives",
    "depends on",
    "limits",
    "influences",
    "upstream",
    "downstream",
    "interaction",
    "connected to",
    "shapes",
    "primary condition",
    "related constraint",
    "condition",
  ]);
}

function validationSignalScore(text: string[]): number {
  return signalScore(text, [
    "why discovery believes",
    "why discovery selected",
    "why this theory",
    "best explanation",
    "dominant theory",
    "supporting evidence",
    "supporting mechanisms",
    "supporting organizational beliefs",
    "explains more",
    "stronger support",
    "cross layer support",
    "explanatory breadth",
    "explanatory power",
    "alternative theories",
    "competing theories",
    "contradictory evidence",
    "weakening evidence",
  ]);
}

function calibrationSignalScore(text: string[]): number {
  return signalScore(text, [
    "confidence",
    "calibrated confidence",
    "confidence reduced",
    "uncertainty",
    "partially supported",
    "available evidence",
    "additional evidence",
    "would increase confidence",
    "would falsify",
    "falsify this theory",
    "falsifying evidence",
    "confidence reflects",
    "not treated as certainty",
    "could confirm",
    "could weaken",
    "could falsify",
  ]);
}

function attributionSignalScore(text: string[]): number {
  return signalScore(text, [
    "evidence",
    "supported by",
    "supporting mechanisms",
    "supporting beliefs",
    "mechanisms",
    "organizational beliefs",
    "because",
    "based on",
    "explains",
    "rooted in",
    "traced to",
  ]);
}

function theoryValidationText(
  theoryValidation: ActualBenchmarkOutput["theoryValidation"],
): string[] {
  if (!theoryValidation) return [];

  return [
    theoryValidation.dominantTheory ?? undefined,
    theoryValidation.whyDiscoveryBelievesIt,
    ...(theoryValidation.supportingMechanisms?.flatMap((item) => [
      item.label,
      item.rationale,
    ]) ?? []),
    ...(theoryValidation.supportingOrganizationalBeliefs?.flatMap((item) => [
      item.label,
      item.rationale,
    ]) ?? []),
    ...(theoryValidation.competingTheoriesConsidered?.flatMap((item) => [
      item.theory,
      item.reasonItWasConsidered,
      item.reasonItLost,
    ]) ?? []),
    ...(theoryValidation.contradictoryOrWeakeningEvidence?.flatMap((item) => [
      item.label,
      item.rationale,
    ]) ?? []),
    theoryValidation.calibratedConfidenceExplanation,
    ...(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence ?? []),
    ...(theoryValidation.evidenceThatWouldFalsifyTheory ?? []),
    theoryValidation.executiveRecommendation,
  ].filter((value): value is string => Boolean(value));
}

function organizationalConditionText(
  conditions: OrganizationalConditionBenchmarkItem[] = [],
): string[] {
  return conditions.flatMap((condition) => [
    condition.name,
    condition.status,
    condition.priority,
    condition.summary,
    condition.whyItMatters,
    condition.recommendedExecutiveAction,
  ]).filter((value): value is string => Boolean(value));
}

function organizationalStateText(
  state?: OrganizationalStateBenchmarkItem,
): string[] {
  if (!state) return [];

  return [
    state.status,
    state.summary,
    state.executiveImplication,
    ...(state.recommendedFocus ?? []),
  ].filter((value): value is string => Boolean(value));
}

function executiveAssessmentText(
  assessment?: ExecutiveAssessmentBenchmarkItem,
): string[] {
  if (!assessment) return [];

  return [
    assessment.summary,
    assessment.executiveNarrative,
    ...(assessment.recommendedFocus ?? []),
  ].filter((value): value is string => Boolean(value));
}

function patternCoherenceScore(params: {
  mechanisms: string[];
  finalConcepts: string[];
  executiveText: string[];
  expectedPrimaryMechanisms: string[];
  expectedSecondaryMechanisms?: string[];
  expectedCompressedConcepts?: string[];
}): number {
  const {
    mechanisms,
    finalConcepts,
    executiveText,
    expectedPrimaryMechanisms,
    expectedSecondaryMechanisms = [],
    expectedCompressedConcepts = [],
  } = params;

  const allText = [...mechanisms, ...finalConcepts, ...executiveText];

  const mechanismCoverage = includesAny(mechanisms, [
    ...expectedPrimaryMechanisms,
    ...expectedSecondaryMechanisms,
  ]);

  const conceptCoverage = includesAny(finalConcepts, expectedCompressedConcepts);

  const executiveMechanismCoverage = includesAny(
    executiveText,
    expectedPrimaryMechanisms,
  );

  const executiveTheoryCoverage = theorySignalScore([
    ...executiveText,
    ...finalConcepts,
  ]);

  const executiveConditionCoverage = conditionSignalScore(executiveText);

  const mechanismToTheoryAlignment = Math.max(
    executiveMechanismCoverage,
    executiveTheoryCoverage,
    executiveConditionCoverage,
  );

  const recurringSignalBonus = Math.min(
    0.15,
    Math.max(0, mechanisms.length - 1) * 0.05,
  );

  const coherenceLanguageScore = signalScore(allText, [
    "recurring",
    "pattern",
    "reinforces",
    "consistent",
    "across",
    "clusters",
    "mechanisms",
    "supporting",
    "deeper",
    "theory",
    "condition",
    "continuity",
    "fragmentation",
    "bottleneck",
    "breakdown",
  ]);

  return clamp01(
    mechanismCoverage * 0.3 +
      conceptCoverage * 0.2 +
      mechanismToTheoryAlignment * 0.3 +
      coherenceLanguageScore * 0.1 +
      recurringSignalBonus,
  );
}

function conditionReasoningScore(params: {
  organizationalConditions?: OrganizationalConditionBenchmarkItem[];
  executiveText: string[];
}): number {
  const { organizationalConditions = [], executiveText } = params;

  const conditionText = organizationalConditionText(organizationalConditions);
  const allText = [...conditionText, ...executiveText];

  const conditionPresence = arrayPresenceScore(organizationalConditions, 4);
  const conditionLanguage = conditionSignalScore(allText);

  const uniqueSummaries = new Set(
    organizationalConditions
      .map((condition) => normalize(condition.summary ?? ""))
      .filter(Boolean),
  ).size;

  const uniquenessScore =
    organizationalConditions.length === 0
      ? 0
      : clamp01(uniqueSummaries / organizationalConditions.length);

  const executiveLanguageScore = signalScore(allText, [
    "executive attention",
    "if ignored",
    "if improved",
    "performance",
    "organizational health",
    "current organizational state",
    "leadership should",
    "recommended focus",
    "priority",
    "constrained",
    "deteriorating",
  ]);

  return clamp01(
    conditionPresence * 0.25 +
      conditionLanguage * 0.3 +
      uniquenessScore * 0.2 +
      executiveLanguageScore * 0.25,
  );
}

function organizationalStateScore(params: {
  organizationalState?: OrganizationalStateBenchmarkItem;
  organizationalConditions?: OrganizationalConditionBenchmarkItem[];
  executiveText: string[];
}): number {
  const { organizationalState, organizationalConditions = [], executiveText } =
    params;

  const stateText = organizationalStateText(organizationalState);
  const allText = [...stateText, ...executiveText];

  const statePresence = organizationalState ? 1 : 0;
  const statusPresence = hasText(organizationalState?.status) ? 1 : 0;
  const summaryPresence = hasText(organizationalState?.summary) ? 1 : 0;
  const implicationPresence = hasText(organizationalState?.executiveImplication)
    ? 1
    : 0;
  const focusPresence = arrayPresenceScore(
    organizationalState?.recommendedFocus,
    3,
  );

  const conditionAlignment = includesAny(
    allText,
    organizationalConditions
      .map((condition) => condition.name ?? "")
      .filter(Boolean),
  );

  return clamp01(
    statePresence * 0.15 +
      statusPresence * 0.15 +
      summaryPresence * 0.2 +
      implicationPresence * 0.2 +
      focusPresence * 0.15 +
      conditionAlignment * 0.15,
  );
}

function executivePrioritizationScore(params: {
  organizationalState?: OrganizationalStateBenchmarkItem;
  executiveAssessment?: ExecutiveAssessmentBenchmarkItem;
  executiveText: string[];
}): number {
  const { organizationalState, executiveAssessment, executiveText } = params;

  const allText = [
    ...organizationalStateText(organizationalState),
    ...executiveAssessmentText(executiveAssessment),
    ...executiveText,
  ];

  const focusScore = Math.max(
    arrayPresenceScore(organizationalState?.recommendedFocus, 3),
    arrayPresenceScore(executiveAssessment?.recommendedFocus, 3),
  );

  const priorityLanguage = signalScore(allText, [
    "focus first",
    "primary condition",
    "recommended focus",
    "executive attention",
    "highest combined risk",
    "priority",
    "leadership should focus",
    "most likely to limit",
    "led by",
  ]);

  return clamp01(focusScore * 0.45 + priorityLanguage * 0.55);
}

function systemsThinkingScore(params: {
  organizationalConditions?: OrganizationalConditionBenchmarkItem[];
  organizationalState?: OrganizationalStateBenchmarkItem;
  executiveAssessment?: ExecutiveAssessmentBenchmarkItem;
  executiveText: string[];
}): number {
  const {
    organizationalConditions = [],
    organizationalState,
    executiveAssessment,
    executiveText,
  } = params;

  const allText = [
    ...organizationalConditionText(organizationalConditions),
    ...organizationalStateText(organizationalState),
    ...executiveAssessmentText(executiveAssessment),
    ...executiveText,
  ];

  const systemsLanguage = systemsSignalScore(allText);
  const multiConditionScore = arrayPresenceScore(organizationalConditions, 4);
  const stateFocusScore = arrayPresenceScore(
    organizationalState?.recommendedFocus,
    3,
  );

  return clamp01(
    systemsLanguage * 0.5 +
      multiConditionScore * 0.25 +
      stateFocusScore * 0.25,
  );
}

function theoryValidationScore(params: {
  finalConcepts: string[];
  executiveText: string[];
  mechanisms: string[];
  expectedPrimaryMechanisms: string[];
  theoryValidation?: ActualBenchmarkOutput["theoryValidation"];
}): number {
  const {
    finalConcepts,
    executiveText,
    mechanisms,
    expectedPrimaryMechanisms,
    theoryValidation,
  } = params;

  const theoryPresence = Math.max(
    theorySignalScore([...executiveText, ...finalConcepts]),
    hasText(theoryValidation?.dominantTheory) ? 1 : 0,
  );

  const mechanismSupport = Math.max(
    includesAny(mechanisms, expectedPrimaryMechanisms),
    arrayPresenceScore(theoryValidation?.supportingMechanisms, 3),
  );

  const executiveSupport = includesAny(executiveText, expectedPrimaryMechanisms);

  const validationSignals = Math.max(
    validationSignalScore([...executiveText, ...finalConcepts]),
    hasText(theoryValidation?.whyDiscoveryBelievesIt) ? 1 : 0,
  );

  const competingTheoryScore = arrayPresenceScore(
    theoryValidation?.competingTheoriesConsidered,
    2,
  );

  const weakeningEvidenceScore = arrayPresenceScore(
    theoryValidation?.contradictoryOrWeakeningEvidence,
    1,
  );

  return clamp01(
    theoryPresence * 0.25 +
      mechanismSupport * 0.2 +
      executiveSupport * 0.15 +
      validationSignals * 0.2 +
      competingTheoryScore * 0.1 +
      weakeningEvidenceScore * 0.1,
  );
}

function confidenceCalibrationScore(params: {
  executiveText: string[];
  theoryValidationScore: number;
  mechanismScore: number;
  compressionScore: number;
  avoidPenaltyScore: number;
  theoryValidation?: ActualBenchmarkOutput["theoryValidation"];
}): number {
  const {
    executiveText,
    theoryValidationScore,
    mechanismScore,
    compressionScore,
    avoidPenaltyScore,
    theoryValidation,
  } = params;

  const calibrationSignals = calibrationSignalScore([
    ...executiveText,
    ...theoryValidationText(theoryValidation),
  ]);

  const confidenceExplanationScore = hasText(
    theoryValidation?.calibratedConfidenceExplanation,
  )
    ? 1
    : calibrationSignals;

  const competingTheoryScore = arrayPresenceScore(
    theoryValidation?.competingTheoriesConsidered,
    1,
  );

  const weakeningEvidenceScore = arrayPresenceScore(
    theoryValidation?.contradictoryOrWeakeningEvidence,
    1,
  );

  const additionalEvidenceScore = arrayPresenceScore(
    theoryValidation?.additionalEvidenceThatWouldIncreaseConfidence,
    2,
  );

  const falsificationScore = arrayPresenceScore(
    theoryValidation?.evidenceThatWouldFalsifyTheory,
    2,
  );

  const evidenceStrength = clamp01(
    theoryValidationScore * 0.3 +
      mechanismScore * 0.35 +
      compressionScore * 0.25 -
      avoidPenaltyScore,
  );

  const structuredCalibration = clamp01(
    confidenceExplanationScore * 0.25 +
      competingTheoryScore * 0.2 +
      weakeningEvidenceScore * 0.15 +
      additionalEvidenceScore * 0.2 +
      falsificationScore * 0.2,
  );

  return clamp01(evidenceStrength * 0.35 + structuredCalibration * 0.65);
}

function evidenceAttributionScore(params: {
  executiveText: string[];
  mechanisms: string[];
  finalConcepts: string[];
  expectedPrimaryMechanisms: string[];
  theoryValidation?: ActualBenchmarkOutput["theoryValidation"];
}): number {
  const {
    executiveText,
    mechanisms,
    finalConcepts,
    expectedPrimaryMechanisms,
    theoryValidation,
  } = params;

  const attributionSignals = attributionSignalScore([
    ...executiveText,
    ...finalConcepts,
    ...theoryValidationText(theoryValidation),
  ]);

  const mechanismTrace = Math.max(
    includesAny(mechanisms, expectedPrimaryMechanisms),
    arrayPresenceScore(theoryValidation?.supportingMechanisms, 2),
  );

  const beliefTrace = arrayPresenceScore(
    theoryValidation?.supportingOrganizationalBeliefs,
    1,
  );

  const executiveTrace = includesAny(executiveText, expectedPrimaryMechanisms);

  const theoryTrace = Math.max(
    theorySignalScore([...executiveText, ...finalConcepts]),
    hasText(theoryValidation?.dominantTheory) ? 1 : 0,
  );

  return clamp01(
    attributionSignals * 0.2 +
      mechanismTrace * 0.3 +
      beliefTrace * 0.2 +
      executiveTrace * 0.15 +
      theoryTrace * 0.15,
  );
}

export function scoreBenchmark(
  benchmark: DiscoveryBenchmarkCase,
  actual: ActualBenchmarkOutput,
): BenchmarkScore {
  const mechanisms = actual.mechanisms ?? [];
  const capabilities = actual.capabilities ?? [];
  const compressedConcepts = actual.compressedConcepts ?? [];
  const conceptualUnderstanding = actual.conceptualUnderstanding ?? [];

  const conditionText = organizationalConditionText(
    actual.organizationalConditions,
  );

  const stateText = organizationalStateText(actual.organizationalState);
  const assessmentText = executiveAssessmentText(actual.executiveAssessment);

  const executiveText = [
    ...(actual.executiveText ? [actual.executiveText] : []),
    ...stateText,
    ...assessmentText,
    ...conditionText,
    ...theoryValidationText(actual.theoryValidation),
  ];

  const finalConcepts =
    conceptualUnderstanding.length > 0
      ? conceptualUnderstanding
      : compressedConcepts;

  const primaryMechanismScore = includesAny(
    mechanisms,
    benchmark.expected.primaryMechanisms,
  );

  const secondaryMechanismScore = includesAny(
    mechanisms,
    benchmark.expected.secondaryMechanisms ?? [],
  );

  const mechanismPenalty = avoidPenalty(
    [...mechanisms, ...executiveText],
    benchmark.expected.avoid,
  );

  const mechanismScore = clamp01(
    primaryMechanismScore * 0.7 +
      secondaryMechanismScore * 0.3 -
      mechanismPenalty,
  );

  const capabilityScore = includesAny(
    capabilities,
    benchmark.expected.affectedCapabilities ?? [],
  );

  const finalConceptScore = includesAny(
    finalConcepts,
    benchmark.expected.compressedConcepts ?? [],
  );

  const executiveTheoryScore = theorySignalScore([
    ...executiveText,
    ...finalConcepts,
  ]);

  const executiveConditionScore = conditionSignalScore(executiveText);

  const compressionScore = Math.max(
    finalConceptScore,
    executiveTheoryScore,
    executiveConditionScore,
  );

  const patternScore = patternCoherenceScore({
    mechanisms,
    finalConcepts,
    executiveText,
    expectedPrimaryMechanisms: benchmark.expected.primaryMechanisms,
    expectedSecondaryMechanisms: benchmark.expected.secondaryMechanisms,
    expectedCompressedConcepts: benchmark.expected.compressedConcepts,
  });

  const executiveMechanismScore = includesAny(
    executiveText,
    benchmark.expected.primaryMechanisms,
  );

  const executiveAvoidPenalty = avoidPenalty(
    executiveText,
    benchmark.expected.avoid,
  );

  const conditionReasoning = conditionReasoningScore({
    organizationalConditions: actual.organizationalConditions,
    executiveText,
  });

  const organizationalState = organizationalStateScore({
    organizationalState: actual.organizationalState,
    organizationalConditions: actual.organizationalConditions,
    executiveText,
  });

  const executivePrioritization = executivePrioritizationScore({
    organizationalState: actual.organizationalState,
    executiveAssessment: actual.executiveAssessment,
    executiveText,
  });

  const systemsThinking = systemsThinkingScore({
    organizationalConditions: actual.organizationalConditions,
    organizationalState: actual.organizationalState,
    executiveAssessment: actual.executiveAssessment,
    executiveText,
  });

  const executiveScore = clamp01(
    Math.max(
      executiveMechanismScore,
      executiveTheoryScore,
      executiveConditionScore,
      organizationalState,
      executivePrioritization,
    ) - executiveAvoidPenalty,
  );

  const theoryValidation = theoryValidationScore({
    finalConcepts,
    executiveText,
    mechanisms,
    expectedPrimaryMechanisms: benchmark.expected.primaryMechanisms,
    theoryValidation: actual.theoryValidation,
  });

  const confidenceCalibration = confidenceCalibrationScore({
    executiveText,
    theoryValidationScore: theoryValidation,
    mechanismScore,
    compressionScore,
    avoidPenaltyScore: Math.max(mechanismPenalty, executiveAvoidPenalty),
    theoryValidation: actual.theoryValidation,
  });

  const evidenceAttribution = evidenceAttributionScore({
    executiveText,
    mechanisms,
    finalConcepts,
    expectedPrimaryMechanisms: benchmark.expected.primaryMechanisms,
    theoryValidation: actual.theoryValidation,
  });

  const organizationalLearning = scoreOrganizationalLearningBenchmark({
    learningProfile: actual.organizationalLearningProfile ?? null,
  });

  const score =
    mechanismScore * 0.2 +
    capabilityScore * 0.1 +
    compressionScore * 0.1 +
    conditionReasoning * 0.1 +
    organizationalState * 0.1 +
    executiveScore * 0.15 +
    systemsThinking * 0.05 +
    theoryValidation * 0.05 +
    confidenceCalibration * 0.075 +
    evidenceAttribution * 0.075;

  const notes: string[] = [];

  if (primaryMechanismScore < 1) {
    notes.push(
      `Primary mechanism missing or weak: expected ${benchmark.expected.primaryMechanisms.join(
        ", ",
      )}`,
    );
  }

  if (mechanismPenalty > 0) {
    notes.push("Avoid-list terms appeared in mechanism or executive output.");
  }

  if (compressionScore < 0.5) {
    notes.push(
      "Final conceptual understanding did not clearly form the expected higher-order organizational theory or condition.",
    );
  }

  if (conditionReasoning < 0.6) {
    notes.push(
      "Condition reasoning is weak: Discovery did not clearly synthesize organizational conditions as first-class executive objects.",
    );
  }

  if (organizationalState < 0.6) {
    notes.push(
      "Organizational state synthesis is weak: Discovery did not clearly combine conditions into a coherent current state.",
    );
  }

  if (executivePrioritization < 0.6) {
    notes.push(
      "Executive prioritization is weak: Discovery did not clearly identify which organizational condition deserves attention first.",
    );
  }

  if (systemsThinking < 0.5) {
    notes.push(
      "Systems thinking is weak: Discovery did not clearly explain how organizational conditions influence one another.",
    );
  }

  if (patternScore < 0.6) {
    notes.push(
      "Pattern coherence is weak: mechanisms, concepts, conditions, and executive assessment are not yet converging cleanly.",
    );
  }

  if (theoryValidation < 0.6) {
    notes.push(
      "Theory validation is weak: Discovery preserved theory support but did not clearly explain how theories support the condition-level assessment.",
    );
  }

  if (confidenceCalibration < 0.6) {
    notes.push(
      "Confidence calibration is weak: Discovery did not clearly explain uncertainty, confidence limits, or what would change its conclusion.",
    );
  }

  if (evidenceAttribution < 0.6) {
    notes.push(
      "Evidence attribution is weak: Discovery did not clearly trace the executive conclusion back to mechanisms, concepts, conditions, or evidence.",
    );
  }

  if (executiveScore < 0.5) {
    notes.push(
      "Executive assessment did not clearly synthesize organizational conditions into a coherent organizational state.",
    );
  }

  return {
    benchmarkId: benchmark.id,
    title: benchmark.title,
    score: Math.round(score * 100),
    passed: score >= 0.75,

    mechanismScore: Math.round(mechanismScore * 100),
    capabilityScore: Math.round(capabilityScore * 100),
    compressionScore: Math.round(compressionScore * 100),
    executiveScore: Math.round(executiveScore * 100),

    perceptionScore: 100,
    patternScore: Math.round(patternScore * 100),
    patternCoherenceScore: Math.round(patternScore * 100),
    mechanismInferenceScore: Math.round(mechanismScore * 100),
    executiveUnderstandingScore: Math.round(executiveScore * 100),

    theoryValidationScore: Math.round(theoryValidation * 100),
    confidenceCalibrationScore: Math.round(confidenceCalibration * 100),
    evidenceAttributionScore: Math.round(evidenceAttribution * 100),

    organizationalLearningScore:
      organizationalLearning.organizationalLearningScore,
    organizationalLearning,

    notes,
  };
}