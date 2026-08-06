import { runDiscoveryV3 } from "../../../../engine/v3";
import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../../../engine/v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../../../engine/v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../../../engine/v3/types";
import type { BenchmarkPhase, ComparativeCase, ComparativeTreatmentOutput, EvidenceRecord, ObservableClaim, TreatmentId } from "./types";

const claim = (statement: string, evidenceIds: string[], confidence: number | null = null): ObservableClaim => ({ statement, semanticIds: [], confidence, evidenceIds: [...evidenceIds].sort() });
const sentences = (records: EvidenceRecord[]) => records.flatMap((record) => record.content.split(/(?<=[.!?])\s+/).map((text) => ({ text: text.trim(), evidenceId: record.id })).filter((item) => item.text));
const tokens = (text: string) => new Set(text.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 2));
const confidence = (support: number, contradiction: number) => Math.max(0.15, Math.min(0.85, 0.35 + support * 0.1 - contradiction * 0.08));

function genericSynthesis(input: { treatmentId: TreatmentId; executionClass: ComparativeTreatmentOutput["executionClass"]; scenario: ComparativeCase; phase: BenchmarkPhase; records: EvidenceRecord[] }): ComparativeTreatmentOutput {
  const items = sentences(input.records);
  const material = items.filter((item) => /cause|because|show|report|increase|decrease|delay|declin|miss|constraint|remain|reduc|improv|unavailable|restricted|fail|queue|outage|late/i.test(item.text)).slice(0, 6);
  const causal = items.filter((item) => /cause|because|reduced|after|independently increase|concentrated/i.test(item.text));
  const uncertain = items.filter((item) => /unknown|unavailable|restricted|no .*data|no additional/i.test(item.text));
  const contradictions = items.filter((item) => /reports?|attributes?|blames?/i.test(item.text));
  const abstained = uncertain.length > 0 && causal.length === 0;
  return {
    contractVersion: "1", treatmentId: input.treatmentId, executionClass: input.executionClass,
    caseId: input.scenario.caseId, organizationId: input.scenario.organizationId, phaseId: input.phase.phaseId,
    materialFacts: material.map((item) => claim(item.text, [item.evidenceId], 0.65)),
    principalFindings: material.slice(0, 2).map((item) => claim(item.text, [item.evidenceId], confidence(material.length, contradictions.length))),
    contradictions: contradictions.length >= 2 ? [{ id: `${input.scenario.caseId}-reported-conflict`, left: claim(contradictions[0].text, [contradictions[0].evidenceId]), right: claim(contradictions[1].text, [contradictions[1].evidenceId]), resolved: false }] : [],
    causalExplanations: causal.slice(0, 3).map((item) => claim(item.text, [item.evidenceId], 0.58)),
    organizationalConditions: [], primaryConstraint: causal[0] ? claim(causal[0].text, [causal[0].evidenceId], 0.52) : null,
    uncertaintyStatements: uncertain.map((item) => claim(item.text, [item.evidenceId], null)),
    missingEvidence: uncertain.map((item) => claim(`Additional authorized evidence is needed to resolve: ${item.text}`, [item.evidenceId], null)),
    recommendedNextEvidence: uncertain.slice(0, 1).map((item) => claim(`Acquire authorized evidence addressing: ${item.text}`, [item.evidenceId], null)),
    decisionImplications: [], predictions: [], abstained, abstentionReason: abstained ? "The available evidence does not support a causal conclusion." : null,
    lineageComplete: true, permissionCompliant: true,
  };
}

function retrieve(question: string, records: EvidenceRecord[], k = 4): EvidenceRecord[] {
  const q = tokens(question);
  return records.map((record) => ({ record, score: [...tokens(record.content)].filter((token) => q.has(token)).length }))
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id)).slice(0, k).map((item) => item.record);
}

function structuredAnalysis(scenario: ComparativeCase, phase: BenchmarkPhase, records: EvidenceRecord[]): ComparativeTreatmentOutput {
  const items = sentences(records);
  const causal = items.filter((item) => /cause|because|reduced|after|concentrated|independently increase|creates most/i.test(item.text));
  const risks = items.filter((item) => /delay|declin|miss|fail|outage|constrained|restricted|incomplete|late|low|tripled/i.test(item.text));
  const counter = items.filter((item) => /remain.*schedule|unchanged|on time|normal|not among|otherwise stable/i.test(item.text));
  const missing = items.filter((item) => /unavailable|restricted|no .*data|unknown/i.test(item.text));
  const abstained = causal.length === 0 || (missing.length > 0 && causal.length < 2);
  return {
    contractVersion: "1", treatmentId: "traditional-structured-analysis", executionClass: "deterministic-local-baseline",
    caseId: scenario.caseId, organizationId: scenario.organizationId, phaseId: phase.phaseId,
    materialFacts: [...risks, ...counter].slice(0, 8).map((item) => claim(item.text, [item.evidenceId], 0.7)),
    principalFindings: risks.slice(0, 3).map((item) => claim(item.text, [item.evidenceId], 0.6)), contradictions: [],
    causalExplanations: causal.slice(0, 4).map((item) => claim(item.text, [item.evidenceId], 0.62)),
    organizationalConditions: risks.slice(0, 2).map((item) => claim(`Operational condition: ${item.text}`, [item.evidenceId], 0.55)),
    primaryConstraint: causal[0] ? claim(causal[0].text, [causal[0].evidenceId], 0.58) : null,
    uncertaintyStatements: missing.map((item) => claim(item.text, [item.evidenceId])), missingEvidence: missing.map((item) => claim(`Obtain missing data related to: ${item.text}`, [item.evidenceId])),
    recommendedNextEvidence: missing.slice(0, 1).map((item) => claim(`Review authorized records related to: ${item.text}`, [item.evidenceId])),
    decisionImplications: causal.slice(0, 1).map((item) => claim(`Prioritize the issue described by: ${item.text}`, [item.evidenceId], null)), predictions: [],
    abstained, abstentionReason: abstained ? "Predefined rules found insufficient causal support." : null, lineageComplete: true, permissionCompliant: true,
  };
}

function values(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function text(value: unknown, keys: string[]): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  for (const key of keys) { const candidate = (value as Record<string, unknown>)[key]; if (typeof candidate === "string" && candidate.trim()) return candidate; }
  return "";
}
function number(value: unknown, keys: string[]): number | null {
  if (!value || typeof value !== "object") return null;
  for (const key of keys) { const candidate = (value as Record<string, unknown>)[key]; if (typeof candidate === "number" && Number.isFinite(candidate)) return Math.max(0, Math.min(1, candidate > 1 ? candidate / 100 : candidate)); }
  return null;
}
function artifactClaims(items: unknown[], keys: string[], evidenceIds: string[]): ObservableClaim[] {
  return items.map((item) => claim(text(item, keys), evidenceIds, number(item, ["confidence", "score", "strength"]))).filter((item) => item.statement);
}

function discoveryOutput(scenario: ComparativeCase, phase: BenchmarkPhase, result: DiscoveryV3Result, runtime: OrganizationRuntime, evidenceIds: string[]): ComparativeTreatmentOutput {
  const raw = result as unknown as Record<string, unknown>;
  const memory = runtime.memory as unknown as Record<string, unknown>;
  const facts = artifactClaims(values(raw.evidence), ["content", "text", "statement", "summary"], evidenceIds);
  const understandings = artifactClaims(values(raw.understanding), ["statement", "summary", "explanation", "title"], evidenceIds);
  const mechanisms = artifactClaims(values(raw.mechanisms), ["explanation", "summary", "title", "label"], evidenceIds);
  const conditions = artifactClaims(values(memory.organizationalConditions ?? raw.organizationalConditions), ["summary", "name", "label", "description"], evidenceIds);
  const contradictions = values(raw.contradictions).map((item, index) => {
    const record = item as Record<string, unknown>;
    const leftText = text(record.left ?? record.evidenceA ?? record, ["statement", "content", "summary", "description"]);
    const rightText = text(record.right ?? record.evidenceB ?? record, ["statement", "content", "summary", "description"]);
    return leftText && rightText ? { id: text(record, ["id"]) || `${scenario.caseId}-contradiction-${index}`, left: claim(leftText, evidenceIds), right: claim(rightText, evidenceIds), resolved: false } : null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const opportunities = artifactClaims(values(memory.investigationOpportunities ?? raw.investigationOpportunities), ["question", "gap", "rationale", "summary"], evidenceIds);
  const uncertainty = artifactClaims(values(raw.uncertainties ?? raw.uncertainty), ["summary", "statement", "description", "limiter"], evidenceIds);
  const principal = understandings.slice(0, 3);
  const primary = artifactClaims(values(memory.organizationalConditions ?? raw.organizationalConditions), ["summary", "name", "label"], evidenceIds).slice(0, 1)[0] ?? principal[0] ?? null;
  const expectedAbstention = principal.length === 0 || (mechanisms.length === 0 && uncertainty.length > 0);
  return {
    contractVersion: "1", treatmentId: "discovery", executionClass: "canonical-discovery", caseId: scenario.caseId, organizationId: scenario.organizationId, phaseId: phase.phaseId,
    materialFacts: facts, principalFindings: principal, contradictions, causalExplanations: mechanisms,
    organizationalConditions: conditions, primaryConstraint: primary, uncertaintyStatements: uncertainty,
    missingEvidence: opportunities, recommendedNextEvidence: opportunities.slice(0, 1), decisionImplications: [], predictions: artifactClaims(values(memory.organizationalPredictions ?? raw.predictions), ["summary", "statement", "explanation"], evidenceIds),
    abstained: expectedAbstention, abstentionReason: expectedAbstention ? "Canonical output did not establish a supported causal answer." : null,
    lineageComplete: facts.every((item) => item.evidenceIds.length > 0), permissionCompliant: true,
    internalArtifactCounts: { evidence: values(raw.evidence).length, contradictions: values(raw.contradictions).length, mechanisms: values(raw.mechanisms).length, understandings: values(raw.understanding).length },
  };
}

export function runLocalBaselines(scenario: ComparativeCase, phase: BenchmarkPhase, order: "canonical" | "reversed" = "canonical"): ComparativeTreatmentOutput[] {
  const ids = new Set(phase.evidenceIds);
  const records = scenario.evidence.filter((record) => ids.has(record.id) && record.permissionScope === "all-benchmark-treatments");
  if (order === "reversed") records.reverse();
  return [
    { contractVersion: "1", treatmentId: "human-only", executionClass: "not-yet-evaluated", caseId: scenario.caseId, organizationId: scenario.organizationId, phaseId: phase.phaseId, materialFacts: [], principalFindings: [], contradictions: [], causalExplanations: [], organizationalConditions: [], primaryConstraint: null, uncertaintyStatements: [], missingEvidence: [], recommendedNextEvidence: [], decisionImplications: [], predictions: [], abstained: false, abstentionReason: "No genuine blinded human response is available.", lineageComplete: false, permissionCompliant: true },
    genericSynthesis({ treatmentId: "llm-only-fixture-proxy", executionClass: "deterministic-fixture-backed-proxy", scenario, phase, records }),
    genericSynthesis({ treatmentId: "retrieval-plus-synthesis", executionClass: "deterministic-local-baseline", scenario, phase, records: retrieve(scenario.question, records) }),
    structuredAnalysis(scenario, phase, records),
  ];
}

export function runDiscoveryTreatment(scenario: ComparativeCase, order: "canonical" | "reversed" = "canonical"): ComparativeTreatmentOutput[] {
  let runtime = createEmptyOrganizationRuntime({ organizationId: scenario.organizationId, name: scenario.title, industry: scenario.industry, website: "benchmark.invalid" });
  const outputs: ComparativeTreatmentOutput[] = [];
  let priorIds = new Set<string>();
  for (const phase of scenario.phases) {
    const phaseIds = new Set(phase.evidenceIds);
    let records = scenario.evidence.filter((record) => phaseIds.has(record.id) && !priorIds.has(record.id) && record.permissionScope === "all-benchmark-treatments");
    if (order === "reversed") records = [...records].reverse();
    const context = records.map((record) => record.content).join("\n");
    const result = runDiscoveryV3({ company: scenario.title, website: "benchmark.invalid", industry: scenario.industry, question: scenario.question, context, evidenceSources: records.map((record) => ({ sourceId: record.id, sourceType: "benchmark", observedAt: record.observedAt, ingestionMethod: "paste", content: record.content })) });
    runtime = evolveOrganizationRuntime({ runtime, result, input: { company: scenario.title, website: "benchmark.invalid", industry: scenario.industry, question: scenario.question, context } });
    outputs.push(discoveryOutput(scenario, phase, result, runtime, phase.evidenceIds));
    priorIds = phaseIds;
  }
  return outputs;
}
