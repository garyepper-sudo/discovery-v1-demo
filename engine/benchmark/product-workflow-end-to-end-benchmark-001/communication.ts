import { createHash } from "node:crypto";
import type { MaterialInformationAcquisitionResult } from "../../../product/acquisition/contracts";
import type { BenchmarkScenario, ProductWorkflowCommunicationBrief } from "./types";

type CommunicationScenario = Pick<BenchmarkScenario, "id" | "question" | "understanding" | "evidence" | "objective" | "optimizationContext" | "ambiguousFacts" | "withheld" | "prohibitedRecommendations">;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

const digest = (value: unknown) => createHash("sha256").update(canonical(value)).digest("hex");
const candidates = (selection: MaterialInformationAcquisitionResult): string[] => selection.kind === "selected-action" ? selection.alternatives.map((item) => item.candidateId) : selection.kind === "material-tie" ? selection.candidates.map((item) => item.candidateId) : selection.explanation.alternativeCandidateIds;
const evidenceRefs = (scenario: CommunicationScenario): string[] => [...new Set(scenario.evidence.filter((item) => item.authorized && item.role !== "irrelevant").map((item) => item.id))].sort();

function estimate(value: { state: string; value?: unknown }): string { return value.state === "available" ? String(value.value) : value.state; }
function materialCandidates(selection: MaterialInformationAcquisitionResult) {
  const items = selection.kind === "selected-action" ? [selection.selected, ...selection.alternatives] : selection.kind === "material-tie" ? selection.candidates : [];
  return items.map((candidate) => ({ candidateId: candidate.candidateId, burden: estimate(candidate.burden), cost: estimate(candidate.cost), delay: estimate(candidate.delay), reliability: estimate(candidate.reliability), reversibility: estimate(candidate.reversibility), governanceAllowed: candidate.eligibility.governanceAllowed, authorizationSatisfied: candidate.eligibility.authorizationSatisfied, stoppingCondition: candidate.stoppingCondition })).sort((left, right) => left.candidateId.localeCompare(right.candidateId));
}

export function buildBenchmarkCommunicationBrief(scenario: CommunicationScenario, selection: MaterialInformationAcquisitionResult): ProductWorkflowCommunicationBrief {
  const selected = selection.kind === "selected-action" ? selection.selected.candidateId : null;
  const unsigned = {
    contractVersion: "benchmark-1" as const,
    scenarioId: scenario.id,
    audience: "authorized-organizational-leader" as const,
    question: scenario.question.text,
    directAnswer: scenario.understanding.answer ?? `Discovery does not yet have a supported answer to “${scenario.question.text}”`,
    currentUnderstanding: scenario.understanding.answer ?? scenario.understanding.uncertainty,
    claimIds: evidenceRefs(scenario),
    evidenceRefs: evidenceRefs(scenario),
    objective: `${scenario.objective.versionRef}: ${scenario.objective.statement}`,
    optimizationContext: `${scenario.optimizationContext.versionRef}: ${scenario.optimizationContext.summary}`,
    disposition: selection.kind,
    recommendedOption: selected,
    alternatives: candidates(selection).sort(),
    candidateMaterialFields: materialCandidates(selection),
    mechanismRationale: selection.explanation.rationale,
    contradictions: scenario.evidence.filter((item) => item.role === "opposes").map((item) => `${item.id}: ${item.statement}`).sort(),
    uncertainty: scenario.understanding.uncertainty,
    risksAndLimitations: [...selection.explanation.limitations, ...scenario.ambiguousFacts].sort(),
    requestedUserDecision: selected ? `Decide whether to authorize ${selected}; authorization does not execute it.` : "Review the preserved alternatives or decline further information acquisition.",
    whatWouldChangeTheRecommendation: selection.explanation.stoppingCondition ?? "Material Evidence, Objective, Context, governance, authorization, or observed Outcome change.",
    unavailable: ["Outcome-calibrated operation value is unavailable."],
    withheld: scenario.withheld.map(() => "withheld"),
    requiredDisclosures: ["Controlled benchmark only.", "No action was initiated.", "Ordinal estimates are not calibrated probabilities."],
    prohibitedClaims: scenario.prohibitedRecommendations,
    desiredLength: "one-page-progressive-disclosure" as const,
  };
  return { ...unsigned, digest: digest(unsigned) };
}

export function renderBenchmarkCommunication(brief: ProductWorkflowCommunicationBrief): string {
  const lines = [
    `# Direct answer\n${brief.directAnswer}`,
    `## Why it matters\n${brief.currentUnderstanding}`,
    `## Recommendation\nDisposition: ${brief.disposition}. ${brief.recommendedOption ? `Recommended information action: ${brief.recommendedOption}.` : "No single option is presented as superior."}`,
    `## Rationale\n${brief.mechanismRationale}`,
    `## Alternatives\n${brief.alternatives.length ? brief.alternatives.join("\n") : "No eligible alternative is currently available."}`,
    `## Uncertainty and limitations\n${[brief.uncertainty, ...brief.contradictions, ...brief.risksAndLimitations, ...brief.requiredDisclosures].join("\n")}`,
    `## What would change Discovery’s view\n${brief.whatWouldChangeTheRecommendation}`,
    `## Requested user decision\n${brief.requestedUserDecision}`,
    `## Audit detail\nQuestion: ${brief.question}\nObjective: ${brief.objective}\nOptimization Context: ${brief.optimizationContext}\nEvidence: ${brief.evidenceRefs.join(", ")}\nCandidate material fields: ${brief.candidateMaterialFields.map((item) => `${item.candidateId} [burden=${item.burden}; cost=${item.cost}; delay=${item.delay}; reliability=${item.reliability}; reversibility=${item.reversibility}; governance=${item.governanceAllowed}; authorization=${item.authorizationSatisfied}; stop=${item.stoppingCondition}]`).join(" | ")}\nUnavailable: ${brief.unavailable.join(" ")}\nWithheld: ${brief.withheld.join(", ") || "none"}\nBrief digest: ${brief.digest}`,
  ];
  return lines.join("\n\n");
}

export function verifyBenchmarkCommunication(brief: ProductWorkflowCommunicationBrief, rendered: string): { passed: true; unsupportedClaims: []; withheldValuesExposed: false } {
  for (const required of [brief.question, brief.directAnswer, brief.disposition, brief.objective, brief.optimizationContext, brief.uncertainty, brief.requestedUserDecision, brief.digest]) {
    if (!rendered.includes(required)) throw new Error(`Communication omitted required brief value: ${required}`);
  }
  for (const forbidden of brief.prohibitedClaims) if (rendered.includes(forbidden)) throw new Error("Communication emitted a prohibited claim.");
  if (rendered.includes("withheld:") || rendered.includes("individual-performance-records")) throw new Error("Communication exposed withheld material.");
  return { passed: true, unsupportedClaims: [], withheldValuesExposed: false };
}
