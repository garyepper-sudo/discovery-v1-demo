import { writeFile } from "node:fs/promises";
import path from "node:path";
import { evaluateOutput } from "../external-comparative-validation-001/evaluate";
import { baseline, cases, phase } from "./fixtures";
import type { RobustnessCaseResult, RobustnessDimension } from "./contracts";

async function main() {
const EPSILON = 1e-12;
const score = (value: ReturnType<typeof evaluateOutput>) => value.comparativeOrganizationalUnderstandingUtility ?? Number.NaN;
const baseDetail = evaluateOutput(baseline, phase);
const baselineScore = score(baseDetail);
const results: RobustnessCaseResult[] = cases.map((item) => {
  const detail = evaluateOutput(item.output, phase);
  const current = score(detail);
  const variance = Math.abs(current - baselineScore);
  const passed = item.expectedEquivalentToBaseline ? variance <= EPSILON : current < baselineScore - EPSILON;
  return { id: item.id, dimension: item.dimension, semanticClass: item.semanticClass, baselineScore, score: current, absoluteVariance: variance, passed, failureClass: passed ? null : item.failureClass, scoreDetail: detail };
});

const equivalent = results.filter((item) => item.semanticClass === "equivalent");
const negatives = results.filter((item) => item.semanticClass === "non-equivalent");
const dimensions: RobustnessDimension[] = ["paraphrase", "ordering", "verbosity", "terminology", "confidence", "evidence-ordering", "contradiction-ordering", "mechanism-wording", "uncertainty-wording", "missing-evidence-wording", "formatting", "anti-gaming", "cross-treatment"];
const agreement = (dimension?: RobustnessDimension) => {
  const rows = equivalent.filter((item) => !dimension || item.dimension === dimension);
  return rows.length ? rows.filter((item) => item.passed).length / rows.length : 1;
};
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const max = (values: number[]) => values.length ? Math.max(...values) : 0;

function bootstrapMeanInterval(values: number[], iterations = 5000): [number, number] {
  if (!values.length) return [0, 0];
  let state = 0x5eed1234;
  const random = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 0x100000000; };
  const samples = Array.from({ length: iterations }, () => mean(Array.from({ length: values.length }, () => values[Math.floor(random() * values.length)]))).sort((a, b) => a - b);
  return [samples[Math.floor(iterations * 0.025)], samples[Math.floor(iterations * 0.975)]];
}

const semanticAgreement = equivalent.filter((item) => item.passed).length / equivalent.length;
const negativeControlPerformance = negatives.filter((item) => item.passed).length / negatives.length;
const variances = equivalent.map((item) => item.absoluteVariance);
const failures = results.filter((item) => !item.passed);
const metrics = {
  semanticAgreement,
  paraphraseAgreement: agreement("paraphrase"),
  orderingAgreement: Math.min(agreement("ordering"), agreement("evidence-ordering"), agreement("contradiction-ordering")),
  verbosityAgreement: agreement("verbosity"),
  terminologyAgreement: agreement("terminology"),
  confidenceAgreement: agreement("confidence"),
  formattingAgreement: agreement("formatting"),
  crossTreatmentAgreement: agreement("cross-treatment"),
  maximumScoreVariance: max(variances),
  meanScoreVariance: mean(variances),
  meanScoreVarianceBootstrap95: bootstrapMeanInterval(variances),
  equivalentFailureRate: 1 - semanticAgreement,
  negativeControlPerformance,
  falseSemanticEquivalence: negatives.filter((item) => !item.passed).length,
  falseSemanticDistinction: equivalent.filter((item) => !item.passed).length,
};
const thresholdsPassed = metrics.semanticAgreement >= 0.99 && metrics.paraphraseAgreement >= 0.99 && metrics.orderingAgreement === 1 && metrics.verbosityAgreement === 1 && metrics.terminologyAgreement === 1 && metrics.confidenceAgreement === 1 && metrics.formattingAgreement === 1 && metrics.falseSemanticEquivalence === 0 && metrics.falseSemanticDistinction === 0;
const classification = thresholdsPassed ? "PASS — Scoring evaluator sufficiently robust" : "FAIL — Scoring evaluator not sufficiently robust";
const machine = { validation: "scoring-robustness-validation-001", classification, externalComparativeValidation001: "F — Invalid or Blocked (permanent)", observableOutputFidelityValidation001: "PASS (unchanged)", evaluatorImplementationChanged: false, metrics, dimensions: Object.fromEntries(dimensions.map((item) => [item, agreement(item)])), results, failures, externalComparativeValidation002Authorized: thresholdsPassed };
const directory = path.dirname(new URL(import.meta.url).pathname);
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const rows = results.map((item) => `| ${item.id} | ${item.dimension} | ${item.semanticClass} | ${item.score.toFixed(6)} | ${item.absoluteVariance.toFixed(6)} | ${item.passed ? "PASS" : `FAIL — ${item.failureClass}`} |`).join("\n");
const failuresByClass = Object.entries(failures.reduce<Record<string, number>>((counts, item) => ({ ...counts, [item.failureClass ?? "unknown"]: (counts[item.failureClass ?? "unknown"] ?? 0) + 1 }), {}));
const plotWidth = 720, plotHeight = 32 + results.length * 24;
const bars = results.map((item, index) => { const width = Math.max(1, item.score * 500); const y = 24 + index * 24; return `<text x="4" y="${y + 12}" font-size="10">${item.id}</text><rect x="210" y="${y}" width="${width}" height="14" fill="${item.passed ? "#2f855a" : "#c53030"}"/><text x="${218 + width}" y="${y + 11}" font-size="10">${item.score.toFixed(3)}</text>`; }).join("");
await Promise.all([
  writeFile(path.join(directory, "RESULTS.json"), `${JSON.stringify(machine, null, 2)}\n`),
  writeFile(path.join(directory, "SCORING_ROBUSTNESS_REPORT.md"), `# Scoring Robustness Validation 001\n\n**Classification:** ${classification}\n\nThe frozen evaluator was exercised without modification. Semantic agreement was ${pct(metrics.semanticAgreement)}; ${failures.length} required checks failed. External Comparative Validation 001 remains permanently non-evaluative.\n\n## Result\n\nThe evaluator ${thresholdsPassed ? "meets" : "does not meet"} the preregistered robustness thresholds. ${thresholdsPassed ? "A new untouched Comparative Validation 002 may proceed." : "External Comparative Validation 002 is not authorized."}\n`),
  writeFile(path.join(directory, "PARAPHRASE_VALIDATION.md"), `# Paraphrase Validation\n\nAgreement: **${pct(metrics.paraphraseAgreement)}**\n\nThe evaluator uses stemmed lexical overlap rather than a semantic equivalence contract. Equivalent plain-language and passive-voice variants are required to preserve the baseline score.\n`),
  writeFile(path.join(directory, "ORDERING_VALIDATION.md"), `# Ordering Validation\n\nOrdering stability: **${pct(metrics.orderingAgreement)}**\n\nArtifact-array, Evidence-ID, and contradiction-endpoint order were tested independently.\n`),
  writeFile(path.join(directory, "VERBOSITY_VALIDATION.md"), `# Verbosity Validation\n\nAgreement: **${pct(metrics.verbosityAgreement)}**\n\nConcise and expanded statements were compared against the same semantic baseline.\n`),
  writeFile(path.join(directory, "TERMINOLOGY_VALIDATION.md"), `# Terminology Validation\n\nAgreement: **${pct(metrics.terminologyAgreement)}**\n\nDiscovery-native terms were replaced with ordinary organizational language.\n`),
  writeFile(path.join(directory, "CONFIDENCE_VALIDATION.md"), `# Confidence Validation\n\nAgreement: **${pct(metrics.confidenceAgreement)}**\n\nThe evaluator contract assumes unit-interval numeric confidence but does not validate that boundary. A percentage representation is interpreted as the number 78 rather than 0.78, while qualitative confidence has no structured representation and is ignored when the numeric field is absent. Cross-representation confidence robustness is therefore not established.\n`),
  writeFile(path.join(directory, "SEMANTIC_EQUIVALENCE_VALIDATION.md"), `# Semantic Equivalence Validation\n\nAgreement: **${pct(metrics.semanticAgreement)}**\n\nMaximum score variance: ${metrics.maximumScoreVariance.toFixed(6)}\n\nMean score variance: ${metrics.meanScoreVariance.toFixed(6)}\n\nDeterministic bootstrap 95% interval: [${metrics.meanScoreVarianceBootstrap95[0].toFixed(6)}, ${metrics.meanScoreVarianceBootstrap95[1].toFixed(6)}]\n\n| Case | Dimension | Class | Score | Absolute variance | Result |\n|---|---|---|---:|---:|---|\n${rows}\n`),
  writeFile(path.join(directory, "NEGATIVE_CONTROL_REPORT.md"), `# Negative Control Report\n\nPerformance: **${pct(metrics.negativeControlPerformance)}**\n\nControls cover agreement substituted for contradiction, unsupported speculation, hallucinated confidence, and irrelevant missing Evidence. A negative control passes only when its score is strictly lower than the valid baseline.\n`),
  writeFile(path.join(directory, "FAILURE_ANALYSIS.md"), `# Failure Analysis\n\n${failures.length ? failuresByClass.map(([name, count]) => `- ${name}: ${count}`).join("\n") : "No failures."}\n\nWorst cases:\n${[...failures].sort((a, b) => b.absoluteVariance - a.absoluteVariance).slice(0, 5).map((item) => `- ${item.id}: variance ${item.absoluteVariance.toFixed(6)} (${item.failureClass})`).join("\n")}\n`),
  writeFile(path.join(directory, "RECOMMENDATIONS.md"), `# Recommendations\n\n1. Do not execute External Comparative Validation 002 unless this validation passes all thresholds.\n2. Preserve External Comparative Validation 001 as permanent Classification F.\n3. Replace lexical matching only through a separately reviewed evaluator design; do not optimize Discovery outputs to the current evaluator.\n4. Freeze a future evaluator before any new treatment output is exposed.\n5. Validate qualitative and ordinal confidence representations explicitly if the future benchmark contract permits them.\n`),
  writeFile(path.join(directory, "REGRESSION_TESTS.md"), `# Regression Tests\n\nThis package deterministically exercises equivalent paraphrases, ordering, verbosity, terminology, confidence wording, Evidence ordering, contradiction ordering, causal wording, uncertainty wording, missing-Evidence wording, JSON round trips, duplicate artifacts, treatment identity, and four semantic negative controls. Any threshold failure exits nonzero.\n`),
  writeFile(path.join(directory, "SCORE_DISTRIBUTION.svg"), `<svg xmlns="http://www.w3.org/2000/svg" width="${plotWidth}" height="${plotHeight}" viewBox="0 0 ${plotWidth} ${plotHeight}"><rect width="100%" height="100%" fill="white"/>${bars}</svg>\n`),
]);
console.log(JSON.stringify({ classification, metrics, failures: failures.map((item) => ({ id: item.id, failureClass: item.failureClass, variance: item.absoluteVariance })), externalComparativeValidation002Authorized: thresholdsPassed }, null, 2));
if (!thresholdsPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
