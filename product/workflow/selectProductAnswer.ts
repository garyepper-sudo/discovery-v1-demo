import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  DiscoveryV3Result,
  V3CausalChain,
  V3Evidence,
  V3Explanation,
} from "../../engine/v3/types";
import type {
  ProductAlternative,
  ProductAnswer,
  ProductAnswerAbstention,
  ProductAnswerConfidence,
  ProductEvidencePoint,
  ProductImprovementAction,
} from "./contracts";
import {
  confidenceLevel,
  distinct,
  limitWords,
  normalize,
  stableId,
  words,
} from "./text";
import {
  customerConfidenceLimiter,
  customerConfidenceMeaning,
  customerExpectedGainLimitation,
  customerInvestigationReason,
  customerAlternative,
  customerWhyItMatters,
} from "./customerLanguage";
import {
  evaluateAnswerRelevance,
  interpretProductQuestion,
  questionAlignedImprovement,
  selectRelevantCandidate,
  semanticConcepts,
  type ProductAnswerRelevance,
  type ProductQuestionInterpretation,
} from "./questionAnswerRelevance";

type Candidate = {
  id: string;
  conclusion: string;
  confidence: number;
  evidenceIds: string[];
  weakeningEvidenceIds: string[];
  explanatoryDepth: number;
  source: "causal-chain" | "completed-explanation" | "investigation-explanation";
};

const GENERIC_TERMS = new Set([
  "organization", "organizational", "performance", "condition", "constraint",
  "leadership", "dependency", "strategic", "alignment", "decision", "flow",
  "execution", "capacity", "operating", "model", "coordination", "system",
]);

function resultFrom(runtime: OrganizationRuntime): DiscoveryV3Result | null {
  const value = runtime.memory.understandingState;
  return value && typeof value === "object" && "evidence" in value
    ? value as DiscoveryV3Result
    : null;
}

function questionTerms(question: string): Set<string> {
  return new Set(words(normalize(question)).filter((term) => term.length > 3));
}

function relevance(text: string, question: string): number {
  const target = questionTerms(question);
  if (target.size === 0) return 0;
  const candidate = new Set(words(normalize(text)));
  return [...target].filter((term) => candidate.has(term)).length / target.size;
}

function specificity(text: string): number {
  const tokens = words(normalize(text));
  if (tokens.length === 0) return 0;
  const specific = tokens.filter((token) => !GENERIC_TERMS.has(token) && token.length > 3);
  const numeric = /\d/.test(text) ? 0.15 : 0;
  return Math.min(1, specific.length / Math.max(6, tokens.length) + numeric);
}

function boundedCausalStatement(chain: V3CausalChain, evidence: V3Evidence[]): string {
  const source = chain.evidenceIds
    .map((id) => evidence.find((item) => item.id === id)?.text)
    .find((text): text is string => Boolean(text));
  const causalText = [source, chain.cause, chain.mechanism, chain.effect]
    .filter((value): value is string => Boolean(value))
    .find((value) => /Evidence indicates that .+? leads to .+? when /i.test(value));
  const match = causalText?.match(
    /Evidence indicates that (.+?) leads to (.+?) when (.+?)(?: is (?:creating|producing|contributing)|\.|$)/i,
  );
  if (match) {
    const subject = match[1];
    const verb = /\b(?:exceptions|escalations|handoffs|delays|constraints|incentives)\b$/i.test(subject)
      ? "lead"
      : "leads";
    return `${subject} ${verb} to ${match[2]} when ${match[3].replace(/\.$/, "")}.`;
  }
  return `${chain.cause} contributes to ${chain.effect} through ${chain.mechanism}.`;
}

function causalCandidates(chain: V3CausalChain, evidence: V3Evidence[]): Candidate[] {
  const causalEvidence = chain.evidenceIds
    .map((id) => evidence.find((item) => item.id === id))
    .filter((item): item is V3Evidence =>
      item !== undefined
      && /Evidence indicates that .+? leads to .+? when /i.test(item.text)
    );
  if (causalEvidence.length === 0) {
    return [{
      id: chain.id,
      conclusion: boundedCausalStatement(chain, evidence),
      confidence: chain.confidence,
      evidenceIds: chain.evidenceIds,
      weakeningEvidenceIds: [],
      explanatoryDepth: 1,
      source: "causal-chain",
    }];
  }
  return causalEvidence.map((item) => {
    const match = item.text.match(
      /Evidence indicates that (.+?) leads to (.+?) when (.+?)(?:\.|$)/i,
    );
    const subject = match?.[1] ?? "";
    const verb = /\b(?:exceptions|escalations|handoffs|delays|constraints|incentives)\b$/i.test(subject)
      ? "lead"
      : "leads";
    return {
      id: `${chain.id}:${item.id}`,
      conclusion: match
        ? `${subject} ${verb} to ${match[2]} when ${match[3].replace(/\.$/, "")}.`
        : limitWords(item.text, 45),
      confidence: chain.confidence,
      evidenceIds: chain.evidenceIds,
      weakeningEvidenceIds: [],
      explanatoryDepth: 1,
      source: "causal-chain" as const,
    };
  });
}

function explanationCandidate(explanation: V3Explanation): Candidate {
  return {
    id: explanation.id,
    conclusion: explanation.explanation || explanation.title,
    confidence: explanation.confidence,
    evidenceIds: explanation.supportingEvidenceIds,
    weakeningEvidenceIds: explanation.weakeningEvidenceIds,
    explanatoryDepth: explanation.causalChainIds?.length ? 1 : 0.65,
    source: "investigation-explanation",
  };
}

function candidates(result: DiscoveryV3Result): Candidate[] {
  const completedExplanationCandidates = (result.organizationalJudgments ?? [])
    .filter((judgment) =>
      words(judgment.assessment).length <= 45
      && specificity(judgment.assessment) >= 0.32
      && judgment.evidenceReferences.length > 0
    )
    .map((judgment) => ({
      id: judgment.id,
      conclusion: judgment.assessment,
      confidence: judgment.confidence,
      evidenceIds: judgment.evidenceReferences.map((reference) => reference.id),
      weakeningEvidenceIds: [],
      explanatoryDepth: 0.8,
      source: "completed-explanation" as const,
    }));
  return [
    ...result.causalChains.flatMap((chain) => causalCandidates(chain, result.evidence)),
    ...result.explanations
      .map(explanationCandidate)
      .filter((candidate) =>
        words(candidate.conclusion).length <= 45
        && specificity(candidate.conclusion) >= 0.32
      ),
    ...completedExplanationCandidates,
  ];
}

function candidateScore(candidate: Candidate, question: string): number {
  const evidenceSupport = Math.min(1, candidate.evidenceIds.length / 3);
  const genericPenalty = specificity(candidate.conclusion) < 0.32 ? 0.35 : 0;
  const boilerplatePenalty = /evidence objects point|strategic signals|clearest evidence says|should be tested against/i
    .test(candidate.conclusion) ? 0.65 : 0;
  return relevance(candidate.conclusion, question) * 0.2
    + specificity(candidate.conclusion) * 0.3
    + candidate.explanatoryDepth * 0.15
    + candidate.confidence * 0.2
    + evidenceSupport * 0.15
    - genericPenalty
    - boilerplatePenalty;
}

function candidateIsProductEligible(candidate: Candidate): boolean {
  return !/may weaken confidence, slow momentum|may be shaping the strategic outcome|should be tested against additional evidence|evidence objects point|strategic signals/i
    .test(candidate.conclusion);
}

function evidencePoints(
  candidate: Candidate,
  evidence: V3Evidence[],
  interpretation: ProductQuestionInterpretation,
): ProductEvidencePoint[] {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const required = new Set(interpretation.requiredConcepts);
  return distinct(candidate.evidenceIds)
    .map((id) => evidenceById.get(id))
    .filter((item): item is V3Evidence => Boolean(item))
    .sort((left, right) =>
      (right.reliability ?? right.confidence) - (left.reliability ?? left.confidence)
      || left.id.localeCompare(right.id)
    )
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      statement: limitWords(item.text, 45),
      sourceLabel: item.sourceName ?? item.sourceType ?? item.sourceId ?? item.source ?? null,
      role: /A plausible alternative is that /i.test(item.text)
        ? "weakens" as const
        : semanticConcepts(item.text).some((concept) => required.has(concept))
          ? "supports" as const
          : "discriminates" as const,
    }));
}

function alternatives(result: DiscoveryV3Result): {
  weakened: ProductAlternative[];
  unresolved: ProductAlternative[];
} {
  const hypothesisAlternatives = [...result.hypotheses]
    .sort((left, right) => right.confidence - left.confidence || left.id.localeCompare(right.id))
    .map((hypothesis): ProductAlternative => ({
      id: hypothesis.id,
      explanation: customerAlternative(hypothesis.explanation || hypothesis.title) ?? "",
      status: hypothesis.status === "challenged" || hypothesis.status === "weak"
        ? "weakened"
        : "unresolved",
      basis: hypothesis.status === "challenged" || hypothesis.status === "weak"
        ? "Current admitted evidence weakens this explanation."
        : "Current admitted evidence has not eliminated this explanation.",
    }))
    .filter((alternative) => alternative.explanation.length > 0);
  const evidenceAlternatives = result.evidence
    .map((item): ProductAlternative | null => {
      const match = item.text.match(/A plausible alternative is that (.+?)(?:\.|$)/i);
      if (!match) return null;
      const explanation = customerAlternative(match[1]);
      return explanation ? {
        id: `evidence-alternative:${item.id}`,
        explanation,
        status: "unresolved",
        basis: "Current admitted evidence identifies this as a plausible alternative that has not been eliminated.",
      } : null;
    })
    .filter((item): item is ProductAlternative => Boolean(item));
  const mapped = [...new Map(
    [...hypothesisAlternatives, ...evidenceAlternatives]
      .map((item) => [normalize(item.explanation), item]),
  ).values()];
  return {
    weakened: mapped.filter((item) => item.status === "weakened").slice(0, 2),
    unresolved: mapped.filter((item) => item.status === "unresolved").slice(0, 2),
  };
}

function alignedImprovementAction(input: {
  runtime: OrganizationRuntime;
  question: string;
  interpretation: ProductQuestionInterpretation;
  relevance: ProductAnswerRelevance | null;
  candidateConclusion?: string | null;
}): ProductImprovementAction | null {
  const canonical = selectImprovementAction(input.runtime, input.question);
  if (
    canonical
    && input.relevance?.status === "direct"
    && evaluateAnswerRelevance({
      interpretation: input.interpretation,
      candidateText: `${canonical.title} ${canonical.reason} ${canonical.target?.label ?? ""}`,
    }).status === "direct"
  ) return canonical;
  const aligned = questionAlignedImprovement({
    interpretation: input.interpretation,
    candidateConclusion: input.candidateConclusion,
  });
  return {
    id: stableId("question-aligned-improvement", input.question, aligned.title),
    type: "add_observation",
    title: aligned.title,
    reason: aligned.reason,
    expectedGain: "unknown",
    target: input.interpretation.outcome
      ? { label: limitWords(input.interpretation.outcome, 12), sourceType: "not_resolved" }
      : null,
    executable: true,
    limitation: customerExpectedGainLimitation(),
  };
}

function gainLabel(value: number): ProductImprovementAction["expectedGain"] {
  return value >= 14 ? "large" : value >= 9 ? "moderate" : value > 0 ? "small" : "unknown";
}

export function selectImprovementAction(
  runtime: OrganizationRuntime,
  question = "the current question",
): ProductImprovementAction | null {
  const opportunity = (runtime.memory as OrganizationRuntime["memory"] & {
    investigationOpportunities?: Array<{
      id: string;
      topic: string;
      reason: string;
      expectedConfidenceGain: number;
      suggestedExecutiveQuestion: string;
    }>;
  }).investigationOpportunities?.[0];
  if (!opportunity) return null;
  return {
    id: opportunity.id,
    type: "add_observation",
    title: opportunity.suggestedExecutiveQuestion,
    reason: customerInvestigationReason({
      reason: opportunity.reason,
      question,
      topic: opportunity.topic,
    }),
    expectedGain: gainLabel(opportunity.expectedConfidenceGain),
    target: opportunity.topic ? { label: opportunity.topic, sourceType: "not_resolved" } : null,
    executable: true,
    limitation: customerExpectedGainLimitation(),
  };
}

function limiter(runtime: OrganizationRuntime): string {
  return customerConfidenceLimiter(
    runtime.memory.organizationalUncertainty?.confidenceLimiters?.[0],
  );
}

function confidence(
  candidate: Candidate,
  principalLimiter: string,
): ProductAnswerConfidence {
  return {
    level: confidenceLevel(candidate.confidence),
    score: candidate.confidence,
    meaning: customerConfidenceMeaning(),
    principalLimiter,
    authoritativeSource: `${candidate.source}:${candidate.id}`,
  };
}

export function selectProductAnswer(input: {
  runtime: OrganizationRuntime;
  questionId: string;
  question: string;
  revision: number;
  generatedAt: string;
}): ProductAnswer | ProductAnswerAbstention {
  const result = resultFrom(input.runtime);
  const interpretation = interpretProductQuestion(input.question);
  const principalLimiter = limiter(input.runtime);
  if (!result || result.evidence.length === 0) {
    const bestNextImprovement = alignedImprovementAction({
      runtime: input.runtime,
      question: input.question,
      interpretation,
      relevance: null,
    });
    return {
      kind: "abstention",
      questionId: input.questionId,
      reason: "no_evidence",
      explanation: "Discovery has not admitted evidence that can support an answer to this question.",
      principalLimiter,
      bestNextImprovement,
      generatedAt: input.generatedAt,
    };
  }

  const ranked = candidates(result)
    .map((candidate) => ({
      candidate,
      score: candidateScore(candidate, input.question),
      relevance: evaluateAnswerRelevance({
        interpretation,
        candidateText: candidate.conclusion,
        bridgeText: candidate.evidenceIds
          .map((id) => result.evidence.find((item) => item.id === id)?.text)
          .filter((item): item is string => Boolean(item)),
      }),
    }))
    .sort((left, right) =>
      (right.relevance.score ?? -1) - (left.relevance.score ?? -1)
      || right.score - left.score
      || left.candidate.id.localeCompare(right.candidate.id)
    );
  const selectedId = selectRelevantCandidate(ranked.map((item) => ({
    id: item.candidate.id,
    relevance: item.relevance,
    evidenceEligible: candidateIsProductEligible(item.candidate)
      && specificity(item.candidate.conclusion) >= 0.32,
    rankScore: item.score,
  })))?.id;
  const selected = ranked.find((item) => item.candidate.id === selectedId);
  const strongestAvailable = ranked[0];
  const selectedEvidence = selected
    ? evidencePoints(selected.candidate, result.evidence, interpretation)
    : [];
  const bestNextImprovement = alignedImprovementAction({
    runtime: input.runtime,
    question: input.question,
    interpretation,
    relevance: selected?.relevance ?? strongestAvailable?.relevance ?? null,
    candidateConclusion: selected?.candidate.conclusion
      ?? (strongestAvailable?.relevance.status === "partial"
      || strongestAvailable?.relevance.status === "adjacent"
      ? strongestAvailable.candidate.conclusion
      : null),
  });
  if (
    !selected
    || selected.score < 0.43
    || specificity(selected.candidate.conclusion) < 0.32
    || selectedEvidence.length === 0
  ) {
    return {
      kind: "abstention",
      questionId: input.questionId,
      reason: selectedEvidence.length === 0 ? "insufficient_discrimination" : "insufficient_specificity",
      explanation: interpretation.outcome
        ? `The available evidence does not yet support an answer to “${input.question.replace(/[?.!]+$/, "")}”.`
        : "The current evidence does not yet support a specific answer to this question.",
      principalLimiter,
      bestNextImprovement,
      generatedAt: input.generatedAt,
    };
  }

  const competing = alternatives(result);
  const whyItMatters = customerWhyItMatters(result.understanding[0]?.implications?.[0]
    ?? result.executiveUnderstanding?.explanation
    ?? null);
  const recommendation = input.runtime.memory.executiveRecommendation;
  const recommendationText = recommendation?.headline ?? recommendation?.executiveRecommendation ?? null;
  const recommendationSupported = recommendationText
    ? selectedEvidence.some((point) => {
        const recommendationTerms = questionTerms(recommendationText);
        const evidenceText = new Set(words(normalize(point.statement)));
        return [...recommendationTerms].some((term) => evidenceText.has(term));
      })
    : false;

  return {
    kind: "answer",
    id: stableId("product-answer", input.questionId, selected.candidate.id, String(input.revision)),
    questionId: input.questionId,
    revision: input.revision,
    conclusion: limitWords(selected.candidate.conclusion, 100),
    whyItMatters: limitWords(whyItMatters, 60),
    confidence: confidence(selected.candidate, principalLimiter),
    discriminatingEvidence: selectedEvidence,
    weakenedAlternatives: competing.weakened,
    unresolvedAlternatives: competing.unresolved,
    principalLimiter,
    bestNextImprovement,
    decisionImplication: recommendationSupported ? limitWords(recommendationText!, 35) : null,
    generatedAt: input.generatedAt,
  };
}
