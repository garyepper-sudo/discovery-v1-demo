import type { BenchmarkPhase, CaseScore, ComparativeTreatmentOutput, GroundTruth, MetricComponents, ObservableClaim } from "./types";

const WEIGHTS: MetricComponents = { correctness: 0.2, materialCoverage: 0.15, contradictionQuality: 0.15, causalQuality: 0.15, calibration: 0.1, uncertaintyDiscipline: 0.1, evidenceGapQuality: 0.1, decisionUtility: 0.05 };
const stop = new Set(["the", "and", "for", "with", "from", "this", "that", "current", "causes", "cause", "caused", "increased", "decreased", "improved", "remains", "remain"]);
const stem = (token: string) => token.replace(/(ing|ed|es|s)$/i, "");
const tokenSet = (text: string) => new Set(text.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).map(stem).filter((token) => token.length > 2 && !stop.has(token)));
const similarity = (left: string, right: string) => {
  const a = tokenSet(left), b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((token) => b.has(token)).length;
  return overlap / Math.min(a.size, b.size);
};
const matches = (claim: string, semanticId: string) => similarity(claim, semanticId) >= 0.5;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const allClaims = (output: ComparativeTreatmentOutput): ObservableClaim[] => [
  ...output.materialFacts, ...output.principalFindings, ...output.causalExplanations,
  ...output.organizationalConditions, ...(output.primaryConstraint ? [output.primaryConstraint] : []),
  ...output.uncertaintyStatements, ...output.missingEvidence, ...output.recommendedNextEvidence,
  ...output.decisionImplications, ...output.predictions,
];
const pr = (claims: ObservableClaim[], expected: string[]) => {
  const trueClaims = claims.filter((claim) => expected.some((item) => matches(claim.statement, item))).length;
  const recovered = expected.filter((item) => claims.some((claim) => matches(claim.statement, item))).length;
  return { precision: claims.length ? trueClaims / claims.length : expected.length ? 0 : 1, recall: expected.length ? recovered / expected.length : claims.length ? 0 : 1 };
};

export function evaluateOutput(output: ComparativeTreatmentOutput, phase: BenchmarkPhase): CaseScore {
  if (output.executionClass === "not-yet-evaluated") return {
    caseId: output.caseId, phaseId: output.phaseId, treatmentId: output.treatmentId, evaluative: false,
    comparativeOrganizationalUnderstandingUtility: null, components: null, unsupportedAssertionRate: null,
    materialOmissionRate: null, contradictionPrecision: null, contradictionRecall: null, mechanismPrecision: null,
    mechanismRecall: null, brierScore: null, appropriateAbstention: null, guardrailFailures: [],
  };
  const truth: GroundTruth = phase.groundTruth;
  const supported = [...truth.materialFacts, ...truth.supportedMechanisms, ...truth.conditions, ...(truth.primaryConstraint ? [truth.primaryConstraint] : []), ...truth.uncertainties, ...truth.highValueMissingEvidence, ...truth.decisionImplications];
  const claims = allClaims(output);
  const factual = pr([...output.materialFacts, ...output.principalFindings], truth.materialFacts);
  const mechanisms = pr(output.causalExplanations, truth.supportedMechanisms);
  const conditions = pr(output.organizationalConditions, truth.conditions);
  const uncertainty = pr(output.uncertaintyStatements, truth.uncertainties);
  const gaps = pr([...output.missingEvidence, ...output.recommendedNextEvidence], truth.highValueMissingEvidence);
  const implications = pr(output.decisionImplications, truth.decisionImplications);
  const contradictionExpected = truth.contradictions.map((item) => `${item.left} ${item.right}`);
  const contradictionClaims = output.contradictions.map((item) => claimPair(item.left.statement, item.right.statement));
  const contradiction = pr(contradictionClaims, contradictionExpected);
  const unsupportedCount = claims.filter((item) => !supported.some((expected) => matches(item.statement, expected))).length;
  const unsupportedAssertionRate = claims.length ? unsupportedCount / claims.length : 0;
  const expectedAssertions = [...truth.materialFacts, ...truth.supportedMechanisms, ...truth.conditions, ...(truth.primaryConstraint ? [truth.primaryConstraint] : [])];
  const materialCoverage = expectedAssertions.length ? expectedAssertions.filter((item) => claims.some((candidate) => matches(candidate.statement, item))).length / expectedAssertions.length : 1;
  const confidenceClaims = claims.filter((item) => item.confidence !== null);
  const brierScore = confidenceClaims.length ? average(confidenceClaims.map((item) => {
    const target = supported.some((expected) => matches(item.statement, expected)) ? 1 : 0;
    return ((item.confidence ?? 0) - target) ** 2;
  })) : truth.expectedAbstention ? 0 : 1;
  const appropriateAbstention = output.abstained === truth.expectedAbstention;
  const components: MetricComponents = {
    correctness: clamp(1 - unsupportedAssertionRate), materialCoverage,
    contradictionQuality: average([contradiction.precision, contradiction.recall]),
    causalQuality: average([mechanisms.precision, mechanisms.recall]), calibration: clamp(1 - brierScore),
    uncertaintyDiscipline: average([uncertainty.precision, uncertainty.recall, appropriateAbstention ? 1 : 0]),
    evidenceGapQuality: average([gaps.precision, gaps.recall]), decisionUtility: average([implications.precision, implications.recall]),
  };
  const composite = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + components[key as keyof MetricComponents] * weight, 0);
  const guardrailFailures = [
    ...(output.permissionCompliant ? [] : ["permission-isolation"]),
    ...(output.lineageComplete ? [] : ["lineage-incomplete"]),
    ...(unsupportedAssertionRate > 0.35 ? ["unsupported-assertion-rate"] : []),
    ...(!appropriateAbstention && truth.expectedAbstention ? ["failed-required-abstention"] : []),
    ...(truth.contradictions.length && contradiction.recall === 0 ? ["material-contradiction-suppressed"] : []),
  ];
  return {
    caseId: output.caseId, phaseId: output.phaseId, treatmentId: output.treatmentId, evaluative: true,
    comparativeOrganizationalUnderstandingUtility: composite, components, unsupportedAssertionRate,
    materialOmissionRate: 1 - materialCoverage, contradictionPrecision: contradiction.precision,
    contradictionRecall: contradiction.recall, mechanismPrecision: mechanisms.precision, mechanismRecall: mechanisms.recall,
    brierScore, appropriateAbstention, guardrailFailures,
  };
}

function claimPair(left: string, right: string): ObservableClaim { return { statement: `${left} ${right}`, semanticIds: [], confidence: null, evidenceIds: [] }; }

export const comparativeUtilityWeights = WEIGHTS;

