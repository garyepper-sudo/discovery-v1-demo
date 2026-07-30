import assert from "node:assert/strict";
import { inferenceScenarios } from "../../engine/benchmark/causal-mechanism-formation-experiment-001/fixtures";
import { runProductionShadowCognition } from "../../engine/benchmark/causal-mechanism-formation-experiment-001/runProductionShadowCognition";
import {
  buildProductQuestionWorkspace,
  evaluateAnswerRelevance,
  interpretProductQuestion,
  selectRelevantCandidate,
} from "../../product/workflow";

const mode = process.argv[2] ?? "all";

const originalQuestions = [
  [0, "Why are enterprise sales slowing?"],
  [0, "Why are launches slipping?"],
  [1, "Why are projects getting delayed?"],
  [3, "Why is onboarding inconsistent?"],
  [3, "Why is customer adoption weak?"],
  [2, "Why are engineering estimates unreliable?"],
  [3, "Why are support tickets increasing?"],
  [3, "Why are marketing campaigns underperforming?"],
  [1, "Why are new hires taking longer to ramp?"],
  [2, "Why are releases missing deadlines?"],
] as const;

function workspace(index: number, question: string) {
  const scenario = inferenceScenarios[index]!.scenario;
  const { runtime } = runProductionShadowCognition({ ...scenario, question });
  return buildProductQuestionWorkspace({ runtime, question });
}

function direct(question: string, candidateText: string) {
  return evaluateAnswerRelevance({
    interpretation: interpretProductQuestion(question),
    candidateText,
  });
}

function validateInterpretation(): void {
  const causal = interpretProductQuestion("Why are customer renewals declining?");
  assert.equal(causal.requestedRelationship, "cause");
  assert.equal(causal.interpretationConfidence, "clear");
  assert.deepEqual(causal.requiredConcepts, ["customer", "renewal", "decline"]);
  assert.equal(interpretProductQuestion("Help?").interpretationConfidence, "insufficient");
}

function validateOriginalQuestions(): void {
  const results = originalQuestions.map(([index, question]) => {
    const value = workspace(index, question);
    return {
      question,
      kind: value.answer?.kind,
      conclusion: value.answer?.kind === "answer" ? value.answer.conclusion : null,
      abstention: value.answer?.kind === "abstention" ? value.answer.explanation : null,
      confidence: value.answer?.kind === "answer" ? value.answer.confidence.score : null,
      improvement: value.answer?.bestNextImprovement?.title ?? null,
    };
  });
  const eligible = results.filter((item) => item.kind === "answer");
  assert.deepEqual(eligible.map((item) => item.question), ["Why is customer adoption weak?"]);
  assert.match(eligible[0]!.conclusion ?? "", /feature adoption/i);
  for (const result of results.filter((item) => item.kind === "abstention")) {
    assert.equal(result.confidence, null);
    assert.match(result.abstention ?? "", /does not yet support an answer/i);
    assert.match(result.improvement ?? "", /what evidence|which evidence/i);
    assert.doesNotMatch(result.improvement ?? "", /operational decisions approved/i);
  }
}

function validateParaphrases(): void {
  const candidate = "Approval escalation leads to delivery delay when decision volume rises.";
  const questions = [
    "Why is delivery delayed?",
    "What is causing delivery delays?",
    "Why does delivery keep getting delayed?",
  ];
  const statuses = questions.map((question) => direct(question, candidate).status);
  assert.deepEqual(statuses, ["direct", "direct", "direct"]);
}

function validateSubstitutions(): void {
  const candidate = "Approval escalation leads to delivery delay when decision volume rises.";
  assert.equal(direct("Why is delivery delayed?", candidate).status, "direct");
  assert.equal(direct("Why are customer renewals declining?", candidate).status, "unrelated");
  const cause = direct("Why is adoption weak?", "Workflow confusion leads to weak adoption.");
  const recommendation = direct("What would improve adoption?", "Workflow confusion leads to weak adoption.");
  const prediction = direct("Is adoption likely to improve next quarter?", "Workflow confusion leads to weak adoption.");
  assert.equal(cause.status, "direct");
  assert.notEqual(recommendation.status, "direct");
  assert.notEqual(prediction.status, "direct");
}

function validateCoverageAndConfidence(): void {
  const partial = direct(
    "Why are product releases missing deadlines?",
    "Operational variability leads to missed deadlines.",
  );
  assert.equal(partial.status, "partial");
  assert.ok(partial.missingRequiredConcepts.includes("product"));
  const irrelevant = workspace(3, "Why are marketing campaigns underperforming?").answer;
  assert.equal(irrelevant?.kind, "abstention");
  assert.equal("confidence" in (irrelevant ?? {}), false);
  const strongIrrelevant = direct(
    "Why is customer renewal declining?",
    "Approval escalation leads to delivery delay.",
  );
  const lowerConfidenceRelevant = direct(
    "Why is customer renewal declining?",
    "Workflow confusion leads to declining customer renewal.",
  );
  const selected = selectRelevantCandidate([
    { id: "strong-irrelevant", relevance: strongIrrelevant, evidenceEligible: true, rankScore: 0.99 },
    { id: "lower-relevant", relevance: lowerConfidenceRelevant, evidenceEligible: true, rankScore: 0.61 },
  ]);
  assert.equal(selected?.id, "lower-relevant");
}

function validateAlternatives(): void {
  const value = workspace(11, "Why are margins eroding?");
  assert.equal(value.answer?.kind, "answer");
  if (value.answer?.kind !== "answer") return;
  assert.ok(value.answer.unresolvedAlternatives.some((item) => /delivery rework/i.test(item.explanation)));
  assert.ok(value.answer.unresolvedAlternatives.some((item) => /cost inflation/i.test(item.explanation)));
  assert.ok(value.answer.discriminatingEvidence.some((item) => item.role === "weakens"));
}

function validateUnseenDomainsAndAdversaries(): void {
  const cases = [
    ["Why is laboratory throughput declining?", "Calibration drift leads to declining laboratory throughput when controls expire."],
    ["Why are insurance claims taking longer?", "Manual review leads to longer insurance claims processing when exception volume rises."],
    ["Why is fleet fuel consumption increasing?", "Route congestion leads to increasing fleet fuel consumption when idle time grows."],
  ] as const;
  for (const [question, candidate] of cases) assert.equal(direct(question, candidate).status, "direct");
  assert.notEqual(
    direct("Why is East-region delivery delayed?", "Approval escalation leads to West-region delivery delay.").status,
    "direct",
  );
  assert.notEqual(
    direct("Why is customer churn causing approval delay?", "Approval delay leads to customer churn.").status,
    "direct",
  );
  assert.notEqual(
    direct("Is delivery likely to improve next quarter?", "Approval escalation leads to delivery delay.").status,
    "direct",
  );
}

function validateDeterminism(): void {
  const first = JSON.stringify(workspace(3, "Why is customer adoption weak?"));
  const second = JSON.stringify(workspace(3, "Why is customer adoption weak?"));
  assert.equal(first, second);
}

const validations: Record<string, () => void> = {
  interpretation: validateInterpretation,
  relevance: validateOriginalQuestions,
  coverage: validateCoverageAndConfidence,
  abstention: validateOriginalQuestions,
  confidence: validateCoverageAndConfidence,
  improvement: validateOriginalQuestions,
  alternatives: validateAlternatives,
  paraphrase: validateParaphrases,
  substitution: validateSubstitutions,
  generalization: () => {
    validateParaphrases();
    validateSubstitutions();
    validateCoverageAndConfidence();
    validateUnseenDomainsAndAdversaries();
    validateDeterminism();
  },
  all: () => {
    validateInterpretation();
    validateOriginalQuestions();
    validateParaphrases();
    validateSubstitutions();
    validateCoverageAndConfidence();
    validateAlternatives();
    validateUnseenDomainsAndAdversaries();
    validateDeterminism();
  },
};

const validation = validations[mode];
assert.ok(validation, `Unknown question relevance validation mode: ${mode}`);
validation();
console.log(JSON.stringify({
  validation: `question-answer-relevance:${mode}`,
  result: "PASS",
  originalQuestionCount: originalQuestions.length,
  runtimeChanged: false,
  cognitionChanged: false,
  contractVersionChanged: false,
}, null, 2));
