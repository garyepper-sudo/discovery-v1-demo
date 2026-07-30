import { distinct, limitWords, normalize, words } from "./text";

export type ProductQuestionRelationship =
  | "cause"
  | "change"
  | "comparison"
  | "prediction"
  | "evaluation"
  | "recommendation"
  | "description"
  | "unknown";

export type ProductQuestionInterpretation = {
  question: string;
  subject: string | null;
  outcome: string | null;
  populationOrScope: string | null;
  timeScope: string | null;
  requestedRelationship: ProductQuestionRelationship;
  requiredConcepts: string[];
  optionalConcepts: string[];
  interpretationConfidence: "insufficient" | "bounded" | "clear";
  ambiguity: string | null;
};

export type ProductAnswerRelevance = {
  status: "direct" | "partial" | "adjacent" | "unrelated" | "undetermined";
  score: number | null;
  questionConceptCoverage: string[];
  missingRequiredConcepts: string[];
  unsupportedBridges: string[];
  rationaleCode: string;
};

export function selectRelevantCandidate<T extends {
  id: string;
  relevance: ProductAnswerRelevance;
  evidenceEligible: boolean;
  rankScore: number;
}>(candidates: T[]): T | null {
  return [...candidates]
    .filter((candidate) =>
      candidate.evidenceEligible
      && candidate.relevance.status === "direct"
    )
    .sort((left, right) =>
      (right.relevance.score ?? -1) - (left.relevance.score ?? -1)
      || right.rankScore - left.rankScore
      || left.id.localeCompare(right.id)
    )[0] ?? null;
}

const QUESTION_WORDS = new Set([
  "a", "an", "and", "are", "be", "been", "being", "by", "can", "could",
  "did", "do", "does", "for", "from", "getting", "how", "in", "is", "it", "keep",
  "may", "might", "of", "on", "or", "our", "should", "taking", "that", "the", "their",
  "these", "this", "to", "what", "when", "where", "which", "who", "why",
  "will", "with", "would",
]);

const GENERIC_CONCEPTS = new Set([
  "business", "company", "mechanism", "observed", "organization",
  "organizational", "outcome", "result", "thing",
]);

const SEMANTIC_EQUIVALENTS: Record<string, string> = {
  adoption: "adopt",
  adopted: "adopt",
  adopting: "adopt",
  bottlenecks: "bottleneck",
  campaigns: "campaign",
  commitments: "deadline",
  customers: "customer",
  delayed: "delay",
  delays: "delay",
  delaying: "delay",
  deadlines: "deadline",
  declining: "decline",
  declines: "decline",
  eroding: "erosion",
  erosion: "erosion",
  estimates: "estimate",
  finishing: "finish",
  hires: "hire",
  launches: "launch",
  late: "delay",
  marketing: "marketing",
  missed: "miss",
  missing: "miss",
  onboarding: "onboard",
  projects: "project",
  releases: "release",
  renewals: "renewal",
  slowing: "slow",
  slippage: "delay",
  slipping: "delay",
  tickets: "ticket",
  underperforming: "underperform",
  unreliable: "unreliable",
  variability: "variability",
  weak: "weak",
};

function stem(value: string): string {
  const equivalent = SEMANTIC_EQUIVALENTS[value];
  if (equivalent) return equivalent;
  if (value.length > 6 && value.endsWith("ing")) return value.slice(0, -3);
  if (value.length > 5 && value.endsWith("ed")) return value.slice(0, -2);
  if (value.length > 5 && value.endsWith("es")) return value.slice(0, -2);
  if (value.length > 4 && value.endsWith("s")) return value.slice(0, -1);
  return value;
}

export function semanticConcepts(value: string): string[] {
  return distinct(
    words(normalize(value))
      .filter((term) => term.length > 2 && !QUESTION_WORDS.has(term))
      .map(stem)
      .filter((term) => term.length > 2 && !GENERIC_CONCEPTS.has(term)),
  );
}

function relationship(question: string): ProductQuestionRelationship {
  const normalized = normalize(question);
  if (/^(why|what (?:is|are) caus|what (?:is|are) driv)/.test(normalized)) return "cause";
  if (/^(what|how).*(?:chang|different)/.test(normalized)) return "change";
  if (/^(which|how).*(?:compar|versus|better|worse)/.test(normalized)) return "comparison";
  if (/^(will|is|are|what).*(?:next|future|likely|predict|forecast)/.test(normalized)) return "prediction";
  if (/^(should|what should|how should|what would improve|how can)/.test(normalized)) return "recommendation";
  if (/^(is|are|does|do|did|evaluate|assess)/.test(normalized)) return "evaluation";
  if (/^(what|describe|show)/.test(normalized)) return "description";
  return "unknown";
}

function boundedOutcome(question: string): string | null {
  const text = question.trim().replace(/[?.!]+$/, "");
  const directed = text.match(/^why\s+(?:do|does|did|is|are)\s+(.+?)\s+(?:lead|leads|cause|causes|drive|drives|result|results)\s+(?:to|in)?\s*(.+)$/i);
  if (directed) return limitWords(directed[2], 18);
  const patterns = [
    /^why\s+(?:are|is|do|does|did)\s+(.+)$/i,
    /^what\s+is\s+causing\s+(.+)$/i,
    /^what\s+causes\s+(.+)$/i,
    /^what\s+would\s+improve\s+(.+)$/i,
    /^how\s+can\s+(?:we\s+)?improve\s+(.+)$/i,
    /^(?:is|are)\s+(.+?)\s+likely\s+to\s+(.+)$/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return limitWords(match.slice(1).filter(Boolean).join(" "), 18);
  }
  return null;
}

function boundedSubject(question: string): string | null {
  const text = question.trim().replace(/[?.!]+$/, "");
  const directed = text.match(/^why\s+(?:do|does|did|is|are)\s+(.+?)\s+(?:lead|leads|cause|causes|drive|drives|result|results)\s+(?:to|in)?\s*(.+)$/i);
  return directed ? limitWords(directed[1], 14) : null;
}

export function interpretProductQuestion(question: string): ProductQuestionInterpretation {
  const requestedRelationship = relationship(question);
  const outcome = boundedOutcome(question);
  const boundedQuestionSubject = boundedSubject(question);
  const requiredConcepts = semanticConcepts(
    [boundedQuestionSubject, outcome ?? question].filter(Boolean).join(" "),
  );
  const interpretationConfidence =
    requestedRelationship === "unknown" || requiredConcepts.length === 0
      ? "insufficient"
      : outcome
        ? "clear"
        : "bounded";
  return {
    question,
    subject: boundedQuestionSubject ?? requiredConcepts[0] ?? null,
    outcome,
    populationOrScope: null,
    timeScope: /\b(?:today|currently|this|last|next|quarter|year|month|week)\b/i.test(question)
      ? question.match(/\b(?:today|currently|this|last|next)\b.*$/i)?.[0] ?? null
      : null,
    requestedRelationship,
    requiredConcepts,
    optionalConcepts: [],
    interpretationConfidence,
    ambiguity: interpretationConfidence === "insufficient"
      ? "The Question does not identify a bounded relationship and outcome."
      : null,
  };
}

function relationSupported(
  requested: ProductQuestionRelationship,
  candidateText: string,
): boolean {
  if (requested === "cause") {
    return /\b(?:cause|causes|caused|contributes? to|drives?|leads? to|results? in|because|through|when)\b/i
      .test(candidateText);
  }
  if (requested === "recommendation") return /\b(?:should|recommend|improve|change|reduce|increase|delegate|adopt)\b/i.test(candidateText);
  if (requested === "prediction") return /\b(?:will|likely|forecast|expect|predict|next)\b/i.test(candidateText);
  if (requested === "change") return /\b(?:change|changed|increase|decrease|improve|weaken|strengthen)\b/i.test(candidateText);
  return requested !== "unknown";
}

export function evaluateAnswerRelevance(input: {
  interpretation: ProductQuestionInterpretation;
  candidateText: string;
  bridgeText?: string[];
}): ProductAnswerRelevance {
  const { interpretation } = input;
  if (interpretation.interpretationConfidence === "insufficient") {
    return {
      status: "undetermined",
      score: null,
      questionConceptCoverage: [],
      missingRequiredConcepts: interpretation.requiredConcepts,
      unsupportedBridges: [],
      rationaleCode: "question-interpretation-insufficient",
    };
  }
  const candidateConcepts = new Set(semanticConcepts(
    [input.candidateText, ...(input.bridgeText ?? [])].join(" "),
  ));
  const causalEffect = input.candidateText.match(/\bleads? to (.+?)(?:\bwhen\b|[.!?]|$)/i)?.[1]
    ?? input.candidateText.match(/\b(?:causes?|drives?|results? in|contributes? to) (.+?)(?:\bwhen\b|[.!?]|$)/i)?.[1]
    ?? input.candidateText;
  const effectConcepts = new Set(semanticConcepts(causalEffect));
  const coverage = interpretation.requiredConcepts.filter((concept) => candidateConcepts.has(concept));
  const missing = interpretation.requiredConcepts.filter((concept) => !candidateConcepts.has(concept));
  const score = interpretation.requiredConcepts.length
    ? coverage.length / interpretation.requiredConcepts.length
    : 0;
  const supportsRelationship = relationSupported(
    interpretation.requestedRelationship,
    input.candidateText,
  );
  const outcomeConcepts = semanticConcepts(interpretation.outcome ?? "");
  const outcomeCoverage = outcomeConcepts.filter((concept) => effectConcepts.has(concept));
  const outcomeScore = outcomeConcepts.length ? outcomeCoverage.length / outcomeConcepts.length : score;
  const status: ProductAnswerRelevance["status"] =
    supportsRelationship && score === 1 && outcomeScore >= 0.5
      ? "direct"
      : supportsRelationship && score >= 0.4 && outcomeScore >= 0.4
        ? "partial"
        : score > 0
          ? "adjacent"
          : "unrelated";
  return {
    status,
    score,
    questionConceptCoverage: coverage,
    missingRequiredConcepts: missing,
    unsupportedBridges: status === "partial"
      ? [`The evidence does not yet connect ${missing.join(", ")} to the proposed explanation.`]
      : [],
    rationaleCode: status === "direct"
      ? "required-outcome-and-relationship-covered"
      : status === "partial"
        ? "material-question-bridge-missing"
        : status === "adjacent"
          ? "shared-context-without-required-outcome"
          : "required-question-concepts-absent",
  };
}

export function questionAlignedImprovement(input: {
  interpretation: ProductQuestionInterpretation;
  candidateConclusion?: string | null;
}): { title: string; reason: string } {
  const question = input.interpretation.question.replace(/[?.!]+$/, "");
  const outcome = input.interpretation.outcome ?? question;
  const candidate = input.candidateConclusion?.replace(/[?.!]+$/, "");
  return {
    title: candidate
      ? `What evidence directly connects “${limitWords(candidate, 12)}” to the outcome in “${limitWords(question, 16)}”?`
      : `Which evidence would directly answer “${limitWords(question, 16)}” and distinguish the leading plausible causes?`,
    reason: `Test the missing relationship in “${limitWords(question, 16)}” and distinguish it from plausible alternatives.`,
  };
}
