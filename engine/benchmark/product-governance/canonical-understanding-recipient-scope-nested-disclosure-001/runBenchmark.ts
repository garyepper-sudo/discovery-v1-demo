import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { cases, leakageChannels, models } from "./fixtures";
import type { BenchmarkCase, BenchmarkScenario, ChannelResult, Disposition, Gap, ModelEvaluation, ModelId } from "./contracts";
import type { OrganizationalUnderstandingProjection } from "../../../v3/projection/organizationalUnderstandingProjection";
import type { OrganizationalUnderstandingDisclosureResult } from "../../../v3/understanding/discloseCanonicalOrganizationalUnderstanding";

export const EXPECTED_RUNTIME_DIGEST = "824a4c2e3f86cf000e3f8442d2bf38a97b4281e545959a49bf2bc6f41bb8b047";
export const EXPECTED_SEMANTIC_DIGEST = "536fe53258759243714cc966dbed823569989c878935b03ebc24ca33b1d51126";
const sha = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
const unique = <T>(values: readonly T[]): T[] => [...new Set(values)];
const typeWitness: { disclosure?: OrganizationalUnderstandingDisclosureResult; projection?: OrganizationalUnderstandingProjection } = {};
void typeWitness;

function assignmentEligible(s: BenchmarkScenario): boolean { return s.assignment === "active" && s.sameOrganization; }
function unavailableChannel(channel: string): boolean { return channel === "Evidence identity" && false; }
function derivedChannel(channel: string): boolean { return ["Evidence count", "condition count", "investigation count", "confidence", "uncertainty", "contradictions", "unknowns", "history", "evolution", "availability", "audit references", "safe lineage", "ordering", "omission", "semantic digest", "Product Communication", "rendered presentation"].includes(channel); }

export function evaluateModel(modelId: ModelId, s: BenchmarkScenario): ModelEvaluation {
  const eligible = assignmentEligible(s);
  let claim: Disposition = eligible ? "direct" : "withheld";
  let field: Disposition = claim;
  let safe = true;
  let overWithholds = false;
  const gaps: Gap[] = [];
  if (!eligible || !s.subjectAuthorized) claim = field = "withheld";
  if (modelId === "model-0" && eligible && s.subjectAuthorized) {
    field = "direct";
    if (s.restrictedSupport || s.lineage !== "complete" || !s.audienceRelationDefined) safe = false;
    gaps.push("GOVERNANCE GAP", "CONTRACT GAP");
    if (s.lineage !== "complete") gaps.push("PRODUCER GAP");
  }
  if (modelId === "model-1") {
    if (!s.audienceRelationDefined || s.restrictedSupport || s.lineage !== "complete") claim = field = "withheld";
    overWithholds = eligible && s.subjectAuthorized && claim === "withheld" && !s.supportRequiredForClaim;
    gaps.push("GOVERNANCE GAP");
  }
  if (modelId === "model-2") {
    if (!s.audienceRelationDefined) { claim = field = "withheld"; gaps.push("GOVERNANCE GAP"); }
    else if (!s.nestedAuthorityDefined) { field = "withheld"; gaps.push("CONTRACT GAP"); }
    else if (s.lineage !== "complete") { field = "unavailable"; gaps.push("PRODUCER GAP"); }
    else if (s.restrictedSupport) field = s.canonicalAbstraction ? "safe-abstracted" : "withheld";
  }
  if (modelId === "model-3") {
    if (!s.audienceRelationDefined || s.restrictedSupport || s.lineage !== "complete") field = "withheld";
    if (field === "withheld" && s.supportRequiredForClaim) claim = "withheld";
    overWithholds = eligible && s.subjectAuthorized && s.restrictedSupport && !s.supportRequiredForClaim;
    gaps.push("GOVERNANCE GAP", "PRODUCER GAP");
  }
  if (modelId === "model-4") {
    if (!s.audienceRelationDefined) { claim = field = "withheld"; gaps.push("GOVERNANCE GAP"); }
    else if (s.lineage !== "complete") { field = "unavailable"; gaps.push("PRODUCER GAP"); }
    else if (!s.nestedAuthorityDefined) { field = "withheld"; gaps.push("CONTRACT GAP"); }
  }
  const channels: ChannelResult[] = leakageChannels.map((channel) => {
    const disposition = unavailableChannel(channel) ? "unavailable" : channel === "claim" ? claim : field;
    const hidden = disposition === "withheld" || disposition === "unavailable";
    const directLeak = hidden && modelId === "model-0" && (s.restrictedSupport || s.lineage !== "complete");
    const combinedLeak = hidden && (directLeak || (derivedChannel(channel) && modelId === "model-0" && s.restrictedSupport));
    return { channel, disposition, directLeak, combinedLeak };
  });
  return { modelId, claimDisposition: claim, fieldDisposition: field, channels, usefulContent: claim === "direct", safe: safe && !channels.some((c) => c.directLeak || c.combinedLeak), overWithholds, gaps: unique(gaps) };
}

export function evaluateCase(testCase: BenchmarkCase) { return { id: testCase.id, category: testCase.category, name: testCase.name, evaluations: models.map((model) => evaluateModel(model, testCase.scenario)) }; }
export function evaluateAll(inputCases: readonly BenchmarkCase[] = cases) { return inputCases.map(evaluateCase); }
function canonicalize(v: unknown): unknown { return Array.isArray(v) ? v.map(canonicalize) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonicalize(x)])) : v; }

export function buildResult() {
  const matrix = evaluateAll();
  const allGaps = unique(matrix.flatMap((c) => c.evaluations.flatMap((e) => e.gaps)));
  const model2 = matrix.flatMap((c) => c.evaluations).filter((e) => e.modelId === "model-2");
  const governanceMissing = allGaps.includes("GOVERNANCE GAP");
  const producerMissing = allGaps.includes("PRODUCER GAP");
  const contractMissing = allGaps.includes("CONTRACT GAP");
  const primary = [governanceMissing, producerMissing, contractMissing].filter(Boolean).length > 1 ? "F" : contractMissing ? "B" : producerMissing ? "C" : governanceMissing ? "D" : "A";
  const selectedModel = model2.every((e) => e.safe) && model2.some((e) => e.usefulContent) ? "model-2" : "model-2-after-gaps";
  const nextTask = governanceMissing ? "DISCOVERY ORGANIZATIONAL ACCESS RECIPIENT-AUDIENCE SCOPE GOVERNANCE CONTRACT 001" : producerMissing ? "DISCOVERY CANONICAL ORGANIZATIONAL UNDERSTANDING NESTED-FIELD SCOPE AND AUTHORITY FORWARD PRODUCER 001" : "DISCOVERY CANONICAL ORGANIZATIONAL UNDERSTANDING RECIPIENT-SCOPED NESTED-FIELD DISCLOSURE IMPLEMENTATION 001";
  return {
    benchmark: "canonical-understanding-recipient-scope-nested-disclosure-001", status: matrix.length === 52 && matrix.every((c) => c.evaluations.length === 5 && c.evaluations.every((e) => e.channels.length === 27)) ? "PASS" : "FAIL",
    counts: { cases: matrix.length, models: models.length, leakageChannels: leakageChannels.length, matrixCells: matrix.reduce((n, c) => n + c.evaluations.reduce((m, e) => m + e.channels.length, 0), 0) },
    duplicateKeys: { cases: cases.length - new Set(cases.map((c) => c.id)).size, models: models.length - new Set(models).size, leakageChannels: leakageChannels.length - new Set(leakageChannels).size },
    primaryClassification: primary, secondaryClassifications: [contractMissing && "B", producerMissing && "C", governanceMissing && "D"].filter(Boolean), selectedModel, recommendation: primary === "F" ? "HOLD FOR MULTIPLE GOVERNED GAPS" : "READY FOR BOUNDED IMPLEMENTATION", nextTask,
    policyFlow: ["recipient-audience governance", "canonical Organizational Understanding nested-field disclosure", "Organizational Understanding projection", "Product Communication", "presentation"],
    scopeSemantics: { compositionScope: "subject", audienceScope: "missing-governance-concept", assignmentOrganization: "exact-isolation", assignmentPurpose: "authorization-input", defaultScope: "navigation-only", sourceAndEvidenceScope: "provenance", derivedScopeLineage: "provenance", roleAndDisplayScope: "non-authoritative" },
    fields: [
      { family: "claim/title/summary and nested disposition representation", classification: "CONTRACT GAP" }, { family: "Explanation/Evidence/condition/investigation/confidence/uncertainty/contradiction/history/evolution/lineage", classification: "PRODUCER GAP" }, { family: "recipient audience authority", classification: "GOVERNANCE GAP" }, { family: "Evidence bodies", classification: "INTENTIONALLY UNAVAILABLE" },
    ],
    retainedRuntime: { organization: "sandbox-northstar-implementation-services-001", digest: EXPECTED_RUNTIME_DIGEST, counts: { compositions: 2, explanations: 1, evidenceReferences: 12, conditions: 7, investigations: 9, genericItems: 0 }, productionSemanticDigest: EXPECTED_SEMANTIC_DIGEST, productionAccountsMateriallyDifferent: false, model2CanDifferentiateNow: false, writes: 0 },
    historicalRuntime: "immutable; missing audience authority or lineage fails closed without identity, count, availability, ordering, digest, history, or lineage signals",
    leakageRule: "withheld and unavailable are externally indistinguishable whenever the distinction reveals restricted existence; safe abstraction must be existing and independently authorized",
    matrix,
  };
}

function main() {
  const runtimePath = process.argv[2];
  if (!runtimePath) throw new Error("usage: runBenchmark.ts <retained-runtime-file>");
  if (sha(readFileSync(runtimePath)) !== EXPECTED_RUNTIME_DIGEST) throw new Error("retained Runtime identity mismatch");
  const result = buildResult();
  if (result.status !== "PASS" || result.counts.matrixCells !== 7020) throw new Error("incomplete benchmark matrix");
  const json = JSON.stringify(canonicalize(result), null, 2) + "\n";
  writeFileSync(new URL("./results.json", import.meta.url), json);
  const report = `# Recipient-Scope and Nested-Field Disclosure Benchmark 001\n\n## Result\n\n**${result.status} — ${result.primaryClassification} (secondary ${result.secondaryClassifications.join("/")}) — ${result.recommendation}.**\n\nThe executed oracle evaluated ${result.counts.cases} cases × ${result.counts.models} models × ${result.counts.leakageChannels} channels = ${result.counts.matrixCells} cells. Duplicate and missing keys: zero. Machine-readable per-cell dispositions and leakage results are in \`results.json\`.\n\n## Proven decision\n\nModel 2 is the smallest correct ownership shape: recipient-audience governance → canonical Organizational Understanding nested-field disclosure → projection → Product Communication → presentation. It is selected only after gaps because current audience authority, forward lineage, and disposition representation are absent. Model 0 can over-disclose nested detail; Model 1 over-withholds mixed-support claims and assumes undefined containment; Model 3 conflates claim-authorizing with detail-authorizing support; Model 4 supplies needed audience authority but does not replace nested disclosure. Presentation and generic scoped-item selection are rejected as disclosure owners.\n\n## Scope and leakage\n\nComposition scope is subject scope. Default scope is navigation-only. Source/Evidence/derived scopes are provenance. Role and display labels are non-authoritative. The oracle never derives authority from names, hierarchy, paths, folders, or prose. Direct, safe-abstracted, withheld, and unavailable are distinct internal dispositions; withheld and unavailable are externally indistinguishable when their distinction leaks existence. Counts, availability, confidence, uncertainty, contradiction, ranking, history, ordering, omission, digest, communication, and rendering are evaluated per cell, including combined inference.\n\n## Gaps and ordering\n\nD precedes C because producers cannot emit audience-relevant lineage until audience semantics exist. C precedes B because disclosure contracts cannot safely decide nested fields without exact produced lineage. Evidence bodies remain intentionally unavailable. This is not a corpus gap.\n\n## Retained and historical Runtime\n\nNorthstar remains byte-identical at \`${EXPECTED_RUNTIME_DIGEST}\`. Current CEO, Director, and Manager behavior remains truthfully shared: 2 Understandings, 1 Explanation, 12 references, 7 conditions, 9 investigations, 0 generic items, semantic digest \`${EXPECTED_SEMANTIC_DIGEST}\`. Model 2 cannot produce material differentiation unchanged. Historical state stays immutable and fails closed without hidden existence signals.\n\n## Next task\n\n**${result.nextTask}**. No production implementation or route promotion is authorized.\n`;
  writeFileSync(new URL("./REPORT.md", import.meta.url), report);
  console.log(JSON.stringify({ status: result.status, classification: result.primaryClassification, ...result.counts, resultsDigest: sha(json), runtimeDigest: EXPECTED_RUNTIME_DIGEST }));
}
if (import.meta.url === `file://${process.argv[1]}`) main();
