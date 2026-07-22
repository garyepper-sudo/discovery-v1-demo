import type { ScoreDimension } from "../judgment-lab/contracts";
import type {
  DecisionResponseBehavior,
  DecisionScenarioExpectation,
  ExecutiveDecisionCase,
  ExecutiveDecisionEvaluation,
  ExecutiveDecisionFailure,
  ExecutiveDecisionGroundTruth,
  ExecutiveDecisionLabRunResult,
  ExecutiveDecisionScorecard,
  InterventionCorrespondence,
} from "./contracts";
import { resolveInterventionCorrespondence } from "./interventionCorrespondence";

const normalize = (value: string | undefined) => (value ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const terms = (value: string | undefined) => normalize(value).split(" ").filter((term) => term.length >= 4);
const similarity = (left: string | undefined, right: string | undefined) => {
  const expected = [...new Set(terms(right))];
  const actual = normalize(left);
  return expected.length ? expected.filter((term) => actual.includes(term)).length / expected.length : 0;
};
const dimension = (score: number, rationale: string, evidence: string[]): ScoreDimension => ({ score, maxScore: 5, passed: score >= 3, rationale, evidence });
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

function direction(actual: number | undefined, baseline: number | undefined): "increase" | "decrease" | "stable" {
  if (actual === undefined || baseline === undefined || Math.abs(actual - baseline) < 0.005) return "stable";
  return actual > baseline ? "increase" : "decrease";
}

function dispositionDirection(actual: string | undefined, baseline: string | undefined): "stable" | "more-cautious" | "less-cautious" | "change" {
  if (actual === baseline) return "stable";
  const order: Record<string, number> = { proceed: 0, "investigate-further": 1, "do-not-proceed": 2 };
  if (actual && baseline && actual in order && baseline in order) return order[actual] > order[baseline] ? "more-cautious" : "less-cautious";
  return "change";
}

function classifyResponse(run: ExecutiveDecisionLabRunResult, baseline: ExecutiveDecisionLabRunResult | undefined, expectation: DecisionScenarioExpectation | undefined): DecisionResponseBehavior {
  if (!baseline || !expectation) return "inconclusive";
  const recommendationStable = run.recommendation.interventionId === baseline.recommendation.interventionId && run.recommendation.label === baseline.recommendation.label;
  const disposition = dispositionDirection(run.recommendation.disposition, baseline.recommendation.disposition);
  const confidence = direction(run.recommendation.confidence, baseline.recommendation.confidence);
  const uncertainty = run.uncertainty.length === baseline.uncertainty.length && same(run.uncertainty, baseline.uncertainty) ? "stable" : run.uncertainty.length >= baseline.uncertainty.length ? "increase" : "decrease";
  const recommendationSatisfied = expectation.recommendationExpectation === "stable"
    ? recommendationStable
    : expectation.recommendationExpectation === "narrow"
      ? !recommendationStable
      : !recommendationStable;
  const dispositionSatisfied = expectation.dispositionExpectation === disposition;
  const confidenceSatisfied = expectation.confidenceExpectation === confidence;
  const uncertaintySatisfied = expectation.uncertaintyExpectation === uncertainty;
  if (expectation.recommendationExpectation === "stable" && !recommendationStable) return "harmful-instability";
  if (recommendationSatisfied && dispositionSatisfied && confidenceSatisfied && uncertaintySatisfied) {
    return expectation.recommendationExpectation === "stable" && expectation.dispositionExpectation === "stable" && expectation.confidenceExpectation === "stable" && expectation.uncertaintyExpectation === "stable"
      ? "desirable-stability"
      : "appropriate-change";
  }
  if (expectation.recommendationExpectation !== "stable" && recommendationStable) return "unjustified-insensitivity";
  if (!dispositionSatisfied && disposition === "stable" && expectation.dispositionExpectation !== "stable") return "unjustified-insensitivity";
  return "inconclusive";
}

function recommendationScore(classification: InterventionCorrespondence): number {
  switch (classification) {
    case "equivalent": return 5;
    case "closely-aligned": return 4;
    case "acceptable-alternative": return 4;
    case "symptom-oriented": return 2;
    case "dominated": return 1;
    case "harmful-inverse": return 0;
    case "unrelated": return 1;
    case "ambiguous": return 2;
  }
}

function riskScore(risks: string[]): ScoreDimension {
  const generic = /confidence limitation|optimization limitation|creates risks|must be evaluated|unresolved disagreement|additional investigation|executive constraints remain unresolved/i;
  const specific = /implementation|capacity|reversib|timing|delay|approval|authority|ownership|decision quality|dependency|coordination|second.order|adoption|disruption/i;
  const specificRisks = risks.filter((risk) => specific.test(risk) && !generic.test(risk));
  const score = specificRisks.length >= 2 ? 5 : specificRisks.length === 1 ? 3 : risks.length ? 1 : 0;
  return dimension(score, "Requires intervention-, constraint-, implementation-, or second-order-specific risk recognition; generic risk volume is insufficient.", specificRisks.length ? specificRisks : risks);
}

export function evaluateExecutiveDecision(params: {
  run: ExecutiveDecisionLabRunResult;
  decisionCase: ExecutiveDecisionCase;
  groundTruth: ExecutiveDecisionGroundTruth;
  baselineRun?: ExecutiveDecisionLabRunResult;
}): ExecutiveDecisionEvaluation {
  const { run, decisionCase, groundTruth } = params;
  const expectedStress = groundTruth.stressScenarios.find((scenario) => scenario.scenarioId === run.scenarioId);
  const correspondence = resolveInterventionCorrespondence({
    generated: { label: run.recommendation.label ?? "", interventionType: run.options.find((option) => option.id === run.recommendation.interventionId)?.type },
    candidates: decisionCase.candidateInterventions,
    groundTruth,
  });
  const responseBehavior = classifyResponse(run, params.baselineRun, expectedStress?.responseExpectation);
  const optionTypes = new Set(run.options.map((option) => option.type));
  const communication = `${run.recommendation.label ?? ""} ${run.recommendation.rationale ?? ""}`;
  const malformed = /\b(?:and|or)\s+(?:and|or)\b|\.\s+(?:is|are)\s+(?:the|a)\b/i.test(communication);
  const responseEvidence = [`behavior=${responseBehavior}`, `recommendation=${run.recommendation.label ?? "none"}`];
  const robustScore = !expectedStress ? 4 : responseBehavior === "desirable-stability" ? 5 : responseBehavior === "appropriate-change" ? 4 : responseBehavior === "harmful-instability" ? 0 : 2;
  const sensitivityScore = !params.baselineRun ? 0 : responseBehavior === "appropriate-change" || responseBehavior === "desirable-stability" ? 5 : responseBehavior === "unjustified-insensitivity" ? 1 : responseBehavior === "harmful-instability" ? 0 : 2;

  const scorecard: ExecutiveDecisionScorecard = {
    decisionFraming: dimension(similarity(run.decisionFrame.interpretedObjective, groundTruth.actualDecisionFrame.objective) >= 0.35 ? 5 : similarity(run.decisionFrame.interpretedObjective, decisionCase.statedObjective) >= 0.35 ? 3 : 1, "Tests whether the decision is framed around the outcome rather than the proposed solution.", [run.decisionFrame.interpretedObjective ?? "No interpreted objective"]),
    objectiveFidelity: dimension(similarity(run.decisionFrame.interpretedObjective, decisionCase.statedObjective) >= 0.45 ? 5 : 2, "Compares the optimization objective with the stated executive outcome.", [run.decisionFrame.interpretedObjective ?? "No objective"]),
    constraintAlignment: dimension(groundTruth.bindingConstraintIds.includes(run.decisionFrame.primaryConstraintId ?? "") ? 5 : run.options.some((option) => option.label.toLowerCase().includes("decision")) ? 3 : 1, "Checks alignment with the binding organizational constraint.", [run.decisionFrame.primaryConstraintId ?? "No constraint"]),
    optionDiversity: dimension(optionTypes.size >= 4 ? 5 : optionTypes.size >= 2 ? 3 : 1, "Counts structurally distinct intervention types.", [...optionTypes]),
    optionQuality: dimension(run.options.length >= 4 ? 4 : run.options.length >= 2 ? 3 : 1, "Checks whether a meaningful option set survives evaluation.", run.options.map((option) => option.label)),
    assumptionQuality: dimension(run.assumptions.length >= 2 && run.assumptions.some((item) => terms(item).length >= 4) ? 5 : run.assumptions.length ? 3 : 1, "Checks for decision-relevant assumptions.", run.assumptions),
    riskRecognition: riskScore(run.risks),
    recommendationQuality: dimension(recommendationScore(correspondence.classification), "Classifies the recommendation through deterministic semantic correspondence.", [correspondence.candidateId ?? "No forced candidate", correspondence.classification, correspondence.rationale]),
    dispositionQuality: dimension(run.recommendation.disposition === (expectedStress?.expectedDisposition ?? groundTruth.expectedRecommendationDisposition) ? 5 : run.recommendation.disposition ? 2 : 1, "Compares the canonical disposition with expected readiness.", [run.recommendation.disposition ?? "No disposition"]),
    confidenceCalibration: dimension((run.recommendation.confidence ?? 1) <= 0.9 && run.uncertainty.length > 0 ? 4 : 2, "Checks whether confidence acknowledges uncertainty.", [String(run.recommendation.confidence), ...run.uncertainty]),
    stressRobustness: dimension(robustScore, "Rewards stability under irrelevant pressure while rejecting harmful instability under declared scenario expectations.", responseEvidence),
    sensitivity: dimension(sensitivityScore, "Rewards scenario-appropriate movement and does not penalize explicitly desirable stability.", responseEvidence),
    informationValue: dimension(run.recommendation.disposition === (expectedStress?.expectedDisposition ?? groundTruth.expectedRecommendationDisposition) ? 5 : 2, "Checks decide-now versus investigate-first behavior.", [run.recommendation.disposition ?? "No disposition"]),
    evidenceGrounding: dimension(run.supportingEvidenceIds.length >= 2 ? 5 : run.supportingEvidenceIds.length === 1 ? 3 : 1, "Measures direct recommendation evidence ancestry separately from upstream resolvable evidence.", [`direct=${run.supportingEvidenceIds.length}`, `upstream=${run.upstreamEvidenceIds.length}`, ...run.supportingEvidenceIds]),
    executiveCommunication: dimension(communication.trim() && !malformed ? 5 : communication.trim() ? 2 : 0, "Checks readable, non-malformed recommendation language.", [communication]),
  };

  const failures: ExecutiveDecisionFailure[] = [];
  const mapping: Array<[keyof ExecutiveDecisionScorecard, ExecutiveDecisionFailure["type"], string]> = [
    ["decisionFraming", "decision-framing", "Decision framing"], ["objectiveFidelity", "objective-mismatch", "Optimization Objective"], ["constraintAlignment", "constraint-misalignment", "Primary Executive Constraint"], ["optionDiversity", "option-collapse", "Intervention Generation"], ["optionQuality", "option-quality", "Intervention Evaluation"], ["assumptionQuality", "assumption-omission", "Decision Recommendation"], ["riskRecognition", "risk-omission", "Decision Recommendation"], ["recommendationQuality", "recommendation-mismatch", "Decision Recommendation"], ["dispositionQuality", "disposition-mismatch", "Decision Recommendation"], ["confidenceCalibration", "confidence-calibration", "Decision Confidence"], ["stressRobustness", "stress-robustness", "Scenario Ranking"], ["sensitivity", "sensitivity", "Decision Cycle"], ["informationValue", "information-value", "Decision Recommendation"], ["evidenceGrounding", "evidence-grounding", "Executive Understanding"], ["executiveCommunication", "executive-language", "Decision Recommendation"],
  ];
  for (const [key, type, producer] of mapping) if (!scorecard[key].passed && !(key === "sensitivity" && !params.baselineRun)) failures.push({ type, severity: ["recommendation-mismatch", "constraint-misalignment"].includes(type) ? "high" : "medium", description: scorecard[key].rationale, supportingEvidence: scorecard[key].evidence, likelyProducerArea: producer });
  if (failures.length === 0) failures.push({ type: "none", severity: "low", description: "No scored decision failure detected.", supportingEvidence: [] });
  return { run, correspondence, responseBehavior, scorecard, failures };
}
