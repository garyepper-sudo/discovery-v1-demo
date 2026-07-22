import type { ExecutivePerspective, JudgmentEvaluation, JudgmentFailure, JudgmentLabRunResult, JudgmentScorecard, OrganizationGroundTruth, PerspectiveAssessment, ScoreDimension } from "./contracts";
import { buildFailureMemory } from "./failureMemory";

const normalize = (value: string | undefined): string => (value ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const terms = (value: string): string[] => normalize(value).split(" ").filter((term) => term.length >= 5);
function similarity(value: string | undefined, expected: string[]): number {
  const haystack = normalize(value);
  const expectedTerms = [...new Set(expected.flatMap(terms))];
  return expectedTerms.length ? expectedTerms.filter((term) => haystack.includes(term)).length / expectedTerms.length : 0;
}
const dimension = (score: number, rationale: string, evidence: string[]): ScoreDimension => ({ score, maxScore: 5, passed: score >= 3, rationale, evidence });
const allText = (run: JudgmentLabRunResult): string => [run.output.dominantUnderstanding, run.output.primaryConstraint, ...run.output.causalMechanisms, run.output.recommendation, ...run.output.uncertainty, ...run.output.missingEvidence, run.output.communicationHeadline, run.output.communicationSummary].filter(Boolean).join(" ");

function communicationScore(run: JudgmentLabRunResult): ScoreDimension {
  const value = `${run.output.communicationHeadline ?? ""} ${run.output.communicationSummary ?? ""}`;
  const malformed = /\.\s+(?:is|are)\s+(?:the|a|an)\b|\b(?:and|or)\s+(?:and|or)\b/i.test(value);
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [];
  const keys = sentences.map(normalize);
  const duplicates = new Set(keys).size !== keys.length;
  const score = !value.trim() ? 0 : malformed ? 1 : duplicates ? 2 : 5;
  return dimension(score, score === 5 ? "Executive language is readable and non-repetitive." : "Executive language is absent, malformed, or repetitive.", [value.slice(0, 300)]);
}

export function buildJudgmentScorecard(params: {
  run: JudgmentLabRunResult;
  groundTruth: OrganizationGroundTruth;
  perspective: ExecutivePerspective;
  repeatedStable: boolean;
  orderStable: boolean;
  sensitivityObserved?: "strong" | "limited" | "none";
}): JudgmentScorecard {
  const { run, groundTruth } = params;
  const full = allText(run);
  const constraintMatch = similarity(run.output.primaryConstraint, [groundTruth.dominantConstraint.label]);
  const contributingMatch = Math.max(0, ...groundTruth.contributingConditions.map((item) => similarity(run.output.primaryConstraint, [item])));
  const mechanismMatch = similarity(run.output.causalMechanisms.join(" "), groundTruth.causalMechanisms);
  const recommendationMatch = Math.max(
    similarity(run.output.recommendation, [groundTruth.highestLeverageIntervention.label]),
    ...groundTruth.acceptableAlternativeInterventions.map((item) => similarity(run.output.recommendation, [item])),
  );
  const harmfulMatch = Math.max(0, ...groundTruth.harmfulInterventions.map((item) => similarity(run.output.recommendation, [item])));
  const uncertaintyMatch = similarity([...run.output.uncertainty, ...run.output.missingEvidence].join(" "), [...groundTruth.expectedUncertainty, ...groundTruth.criticalMissingEvidence]);
  const contradictionVisible = /contradict|disagree|mixed|ambigu/i.test(full);
  const evidenceCoverage = run.evidenceArtifactIds.length / Math.max(1, params.perspective.evidenceAccess.includedArtifactIds.length);
  const confidence = run.output.confidence ?? 0;
  const calibrated = evidenceCoverage < 0.6 ? confidence <= 0.75 : confidence <= 0.9;

  return {
    constraintAccuracy: dimension(constraintMatch >= 0.5 ? 5 : contributingMatch >= 0.5 ? 3 : 1, "Compares the selected constraint with the hidden dominant constraint and acceptable contributing conditions.", [run.output.primaryConstraint ?? "No constraint"]),
    causalFidelity: dimension(mechanismMatch >= 0.5 ? 5 : mechanismMatch > 0 ? 3 : 1, "Checks whether expected causal mechanisms remain visible.", run.output.causalMechanisms),
    evidenceGrounding: dimension(run.output.supportingEvidenceIds.length >= 2 ? 5 : run.output.supportingEvidenceIds.length === 1 ? 3 : 1, "Measures direct evidence ancestry on the selected executive judgment.", run.output.supportingEvidenceIds),
    contradictionHandling: dimension(contradictionVisible ? 5 : 2, "Checks whether conflicting evidence affects visible uncertainty or explanation.", run.output.uncertainty),
    recommendationQuality: dimension(harmfulMatch >= 0.5 ? 0 : recommendationMatch >= 0.5 ? 5 : recommendationMatch > 0 ? 3 : 1, "Compares the recommendation with acceptable and harmful intervention classes.", [run.output.recommendation ?? "No recommendation"]),
    confidenceCalibration: dimension(calibrated ? 4 : 1, "Evaluates confidence against the evidence coverage available in this scenario.", [String(confidence), String(evidenceCoverage)]),
    uncertaintyQuality: dimension(uncertaintyMatch >= 0.35 ? 5 : uncertaintyMatch > 0 ? 3 : 1, "Checks whether the most decision-relevant missing evidence is surfaced.", [...run.output.uncertainty, ...run.output.missingEvidence]),
    robustness: dimension(params.repeatedStable && params.orderStable ? 5 : params.repeatedStable || params.orderStable ? 2 : 0, "Requires repeat and input-order stability.", [`repeat=${params.repeatedStable}`, `order=${params.orderStable}`]),
    sensitivity: dimension(
      params.sensitivityObserved === undefined
        ? 0
        : params.sensitivityObserved === "strong"
          ? 5
          : params.sensitivityObserved === "limited"
            ? 3
            : 1,
      "Checks whether removing decisive evidence changes confidence, uncertainty, or judgment.",
      [`observed=${params.sensitivityObserved ?? "not-run"}`],
    ),
    executiveCommunication: communicationScore(run),
  };
}

export function assessPerspective(run: JudgmentLabRunResult, perspective: ExecutivePerspective): PerspectiveAssessment {
  const count = run.evidenceArtifactIds.length;
  const evidenceCoverage = count <= 4 ? "narrow" : count >= 12 ? "broad" : "moderate";
  const overreachDetected = evidenceCoverage === "narrow" && (run.output.confidence ?? 0) > 0.75;
  return { perspectiveId: perspective.id, evidenceCoverage, expectedBlindSpots: perspective.likelyBlindSpots, appropriateUncertainty: perspective.likelyBlindSpots, overreachDetected, perspectiveFitRationale: overreachDetected ? "Confidence is high relative to the deliberately narrow evidence view." : "Confidence does not exceed the evaluation threshold for this evidence view." };
}

export function classifyFailures(scorecard: JudgmentScorecard, perspective: PerspectiveAssessment): JudgmentFailure[] {
  const failures: JudgmentFailure[] = [];
  const add = (failed: boolean, type: JudgmentFailure["type"], description: string, area: string, evidence: string[]) => { if (failed) failures.push({ type, severity: type === "condition-ranking" || type === "recommendation-mismatch" ? "high" : "medium", description, supportingEvidence: evidence, likelyProducerArea: area }); };
  add(!scorecard.constraintAccuracy.passed, "condition-ranking", "The dominant organizational constraint was not identified.", "Primary Executive Constraint", scorecard.constraintAccuracy.evidence);
  add(!scorecard.causalFidelity.passed, "mechanism-selection", "Expected causal mechanisms were not preserved.", "Mechanisms and Executive Assessment", scorecard.causalFidelity.evidence);
  add(!scorecard.evidenceGrounding.passed, "ancestry-loss", "Direct evidence ancestry is insufficient.", "Executive Understanding", scorecard.evidenceGrounding.evidence);
  add(!scorecard.contradictionHandling.passed, "contradiction-handling", "Contradictory evidence did not visibly affect judgment.", "Uncertainty", scorecard.contradictionHandling.evidence);
  add(!scorecard.recommendationQuality.passed, "recommendation-mismatch", "The recommendation does not match an acceptable intervention class.", "Executive Recommendation", scorecard.recommendationQuality.evidence);
  add(!scorecard.confidenceCalibration.passed || perspective.overreachDetected, "confidence-calibration", "Confidence is too high for available evidence coverage.", "Confidence", scorecard.confidenceCalibration.evidence);
  add(!scorecard.uncertaintyQuality.passed, "uncertainty-quality", "Missing evidence does not target the highest-value uncertainty.", "Investigation Opportunities", scorecard.uncertaintyQuality.evidence);
  add(!scorecard.executiveCommunication.passed, "executive-language", "Executive communication is malformed or repetitive.", "Executive Communication", scorecard.executiveCommunication.evidence);
  return failures.length ? failures : [{ type: "none", severity: "low", description: "No scored failure detected.", supportingEvidence: [] }];
}

export function evaluateJudgment(params: Parameters<typeof buildJudgmentScorecard>[0]): JudgmentEvaluation {
  const scorecard = buildJudgmentScorecard(params);
  const perspective = assessPerspective(params.run, params.perspective);
  const failures = classifyFailures(scorecard, perspective);
  return {
    run: params.run,
    scorecard,
    perspective,
    failures,
    failureMemory: buildFailureMemory({
      failures,
      run: params.run,
      benchmarkCategory: "regression",
      benchmarkCaseId: `${params.run.organizationId}:${params.run.perspectiveId}`,
    }),
  };
}
