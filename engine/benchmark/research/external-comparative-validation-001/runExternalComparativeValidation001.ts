import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { comparativeCases } from "./fixtures";
import { evaluateOutput } from "./evaluate";
import { freezePreregistration, verifyPreregistration } from "./preregistration";
import { runDiscoveryTreatment, runLocalBaselines } from "./treatments";
import type { CaseScore, ComparativeTreatmentOutput, TreatmentId } from "./types";

const directory = path.dirname(new URL(import.meta.url).pathname);
const preregistrationFile = path.join(directory, "PREREGISTRATION.json");
const resultsFile = path.join(directory, "RESULTS.json");
const reportFile = path.join(directory, "BENCHMARK_REPORT.md");
const humanPacketFile = path.join(directory, "HUMAN_EVALUATION_PACKET.json");
const round = (value: number) => Math.round(value * 1000) / 1000;
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const stableOutput = (output: ComparativeTreatmentOutput) => JSON.stringify(output);

function summarize(scores: CaseScore[]) {
  const ids: TreatmentId[] = ["human-only", "llm-only-fixture-proxy", "retrieval-plus-synthesis", "traditional-structured-analysis", "discovery"];
  return ids.map((treatmentId) => {
    const evaluative = scores.filter((score) => score.treatmentId === treatmentId && score.evaluative && score.comparativeOrganizationalUnderstandingUtility !== null);
    const values = evaluative.map((score) => score.comparativeOrganizationalUnderstandingUtility!);
    const sorted = [...values].sort((a, b) => a - b);
    return { treatmentId, casePhases: evaluative.length, mean: values.length ? round(values.reduce((sum, value) => sum + value, 0) / values.length) : null, median: values.length ? round(sorted[Math.floor(sorted.length / 2)]) : null,
      guardrailFailures: evaluative.reduce((sum, score) => sum + score.guardrailFailures.length, 0) };
  });
}

function report(result: any): string {
  const rows = result.summary.map((item: any) => `| ${item.treatmentId} | ${item.casePhases} | ${item.mean ?? "not evaluated"} | ${item.median ?? "not evaluated"} | ${item.guardrailFailures} |`).join("\n");
  return `# External Comparative Validation 001\n\n**Status:** Benchmark-only Phase 0 research\n\n**Classification:** ${result.classification}\n\n## Executive summary\n\nThis controlled synthetic benchmark does not establish external comparative advantage. Human-only responses and a genuine live general-model treatment are unavailable. The deterministic LLM-only proxy is fixture-backed and must not be described as external-model evidence. Results are exploratory and cannot support claims about customer ROI, named competitors, or real-world superiority.\n\n## Methods\n\nTen preregistered synthetic organizations, including two holdouts, were evaluated over initial and update phases. Every executable treatment received the same authorized evidence. Comparative Organizational Understanding Utility is a benchmark-only weighted composite subordinate to OUI; all component scores remain in RESULTS.json.\n\n## Treatment results\n\n| Treatment | Evaluated case-phases | Mean | Median | Guardrail failures |\n|---|---:|---:|---:|---:|\n${rows}\n\n## Robustness\n\n- Repeated local-baseline replay: ${result.robustness.localDeterminism ? "passed" : "failed"}\n- Evidence-order invariance: ${result.robustness.orderInvariance ? "passed" : "failed"}\n- Organization isolation: ${result.robustness.organizationIsolation ? "passed" : "failed"}\n- Permission isolation: ${result.robustness.permissionIsolation ? "passed" : "failed"}\n- Holdout cases: retained and reported separately\n- Discovery ablations: unsupported without invasive alternate cognition flags; none were added\n\n## Decision questions\n\n1. Discovery versus genuine LLM-only: not evaluated.\n2. Discovery versus retrieval-plus-synthesis: exploratory synthetic comparison only; see machine-readable results.\n3. Discovery versus structured analysis: exploratory synthetic comparison only; see machine-readable results.\n4. Winning and losing dimensions: not promoted to a comparative claim while a genuine LLM baseline and human utility ratings are absent.\n5. Component attribution: no production ablation was safely supported, so causal attribution remains unmeasured.\n6. Conditions where advantage disappears: exploratory case-level results only.\n7. Better-calibrated baselines: inspect Brier scores; no provider-level conclusion is permitted.\n8. Complexity justification: not demonstrated.\n9. Smallest next experiment: import blinded outputs from one authorized fixed-version general model and genuine human evaluators using the frozen contracts, then replicate on untouched cases.\n\n## Limitations and invalidity boundaries\n\n- Synthetic cases are not real organizations.\n- The LLM-only treatment is a deterministic fixture-backed proxy, not a live LLM.\n- Human-only is not yet evaluated.\n- Lexical scoring may under-recognize valid paraphrases and is not an external semantic evaluator.\n- Canonical Discovery output is adapted into a shared observable schema; artifact volume receives no credit.\n- No named commercial product was tested.\n- No result changes Production, Runtime contracts, cognition, Product Workflow, or OUI.\n\n## Research decision\n\n**continue research**\n`;
}

async function run() {
  const manifest = await verifyPreregistration(preregistrationFile);
  const outputs: ComparativeTreatmentOutput[] = [];
  const reversed: ComparativeTreatmentOutput[] = [];
  const originalLog = console.log;
  for (const scenario of comparativeCases) {
    for (const phase of scenario.phases) {
      outputs.push(...runLocalBaselines(scenario, phase));
      reversed.push(...runLocalBaselines(scenario, phase, "reversed"));
    }
    console.log = () => undefined;
    try { outputs.push(...runDiscoveryTreatment(scenario)); reversed.push(...runDiscoveryTreatment(scenario, "reversed")); }
    finally { console.log = originalLog; }
  }
  const scores = outputs.map((output) => evaluateOutput(output, comparativeCases.find((item) => item.caseId === output.caseId)!.phases.find((phase) => phase.phaseId === output.phaseId)!));
  const local = outputs.filter((item) => item.treatmentId !== "discovery");
  const localAgain = comparativeCases.flatMap((scenario) => scenario.phases.flatMap((phase) => runLocalBaselines(scenario, phase)));
  const result = {
    protocolVersion: manifest.protocolVersion, experimentId: manifest.experimentId, preregistrationHash: sha(await readFile(preregistrationFile, "utf8")),
    classification: "E — Inconclusive", executionSummary: { human: "not-yet-evaluated", llmOnly: "deterministic-fixture-backed-proxy", retrieval: "deterministic-local-baseline", structured: "deterministic-local-baseline", discovery: "canonical-discovery" },
    outputs, scores, summary: summarize(scores), holdoutScores: scores.filter((score) => comparativeCases.find((item) => item.caseId === score.caseId)?.holdout),
    robustness: {
      localDeterminism: local.map(stableOutput).join("\n") === localAgain.map(stableOutput).join("\n"),
      orderInvariance: outputs.map((item) => stableOutput(item)).join("\n") === reversed.map((item) => stableOutput(item)).join("\n"),
      organizationIsolation: outputs.every((output) => output.organizationId === comparativeCases.find((item) => item.caseId === output.caseId)?.organizationId),
      permissionIsolation: outputs.every((output) => output.permissionCompliant),
      malformedInput: "fail-closed by TypeScript fixture contract; runtime malformed import not executed",
      ablations: "unsupported without invasive benchmark-only cognition flags",
    },
    classificationRationale: "A genuine human baseline and genuine live LLM-only baseline are missing; fixture-backed proxy results cannot demonstrate external comparative advantage.",
  };
  await writeFile(resultsFile, `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(reportFile, report(result));
  await writeFile(humanPacketFile, `${JSON.stringify({ contractVersion: "1", blinded: true, status: "not-yet-evaluated", instructions: "Review treatment outputs in randomized blinded order and score correctness, material coverage, contradiction quality, causal quality, uncertainty discipline, evidence-gap quality, and decision utility. Do not infer treatment identity.", cases: comparativeCases.map((item) => ({ caseId: item.caseId, question: item.question, phases: item.phases.map((phase) => ({ phaseId: phase.phaseId, evidence: item.evidence.filter((record) => phase.evidenceIds.includes(record.id) && record.permissionScope === "all-benchmark-treatments").map(({ id, observedAt, content }) => ({ id, observedAt, content })) })) })) }, null, 2)}\n`);
  console.log(JSON.stringify({ classification: result.classification, summary: result.summary, robustness: result.robustness }, null, 2));
}

async function main() {
  const command = process.argv[2];
  if (command === "--freeze") await freezePreregistration(preregistrationFile).then((manifest) => console.log(JSON.stringify({ frozen: true, benchmarkImplementationHash: manifest.benchmarkImplementationHash, cases: manifest.cases.length }, null, 2)));
  else if (command === "--run") await run();
  else throw new Error("Use --freeze before observing outputs, then --run.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
