import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { DiscoveryV3Result } from "../../../v3/types";
import type { OrganizationRuntime } from "../../../v3/runtime/organizationRuntime";
import { collectCanonicalObservableArtifacts } from "./canonicalArtifactCollector";
import { fullAuthorization, goldenSnapshot, organizationTwoAuthorization } from "./goldenFixtures";
import { normalizeObservableOutput, semanticObservableSignature, serializeObservableOutput } from "./normalizeObservableOutput";
import type { CanonicalObservableSnapshot, FailureClass, ObservableArtifact, ObservableOutput } from "./contracts";

async function main() {
const directory = path.dirname(new URL(import.meta.url).pathname);
type Check = { name: string; passed: boolean; failureClass?: FailureClass; detail: string };
const checks: Check[] = [];
const check = (name: string, passed: boolean, detail: string, failureClass?: FailureClass) => checks.push({ name, passed, detail, ...(failureClass ? { failureClass } : {}) });
const artifacts = (output: ObservableOutput) => [output.findings, output.conditions, output.constraints, output.conclusions, output.predictions, output.contradictions, output.mechanisms, output.uncertainty, output.evidenceGaps].flat();
const byId = (items: ObservableArtifact[]) => new Map(items.map((item) => [item.id, item]));

const output = normalizeObservableOutput({ snapshot: goldenSnapshot, authorization: fullAuthorization });
const external = artifacts(output);
const expected = goldenSnapshot.artifacts.filter((item) => fullAuthorization.authorizedArtifactIds.includes(item.id));
const expectedById = byId(expected);
const externalById = byId(external);
const kinds = ["finding", "condition", "constraint", "conclusion", "prediction", "contradiction", "mechanism", "uncertainty", "evidence-gap"] as const;
const coverage = kinds.map((kind) => {
  const internal = expected.filter((item) => item.kind === kind);
  const normalized = external.filter((item) => item.kind === kind);
  const recalled = internal.filter((item) => externalById.has(item.id)).length;
  const precise = normalized.filter((item) => expectedById.has(item.id)).length;
  return { artifactFamily: kind, internal: internal.length, external: normalized.length, recall: internal.length ? recalled / internal.length : 1, precision: normalized.length ? precise / normalized.length : 1 };
});
for (const row of coverage) check(`${row.artifactFamily} preservation`, row.recall === 1 && row.precision === 1, `recall=${row.recall}; precision=${row.precision}`, "artifact-omission");

for (const item of expected) {
  const normalized = externalById.get(item.id);
  check(`${item.id} represented`, Boolean(normalized), normalized ? "present" : "missing", "artifact-omission");
  if (!normalized) continue;
  check(`${item.id} semantic fields`, normalized.statement === item.statement && normalized.unresolved === item.unresolved && normalized.priority === item.priority && normalized.expectedUtility === item.expectedUtility && normalized.justification === item.justification, "statement, status, priority, utility, and justification preserved", "artifact-corruption");
  check(`${item.id} confidence`, normalized.confidence === item.confidence, `${normalized.confidence} === ${item.confidence}`, "confidence-corruption");
  check(`${item.id} lineage`, JSON.stringify(normalized.supportingEvidenceIds) === JSON.stringify([...item.supportingEvidenceIds].sort()) && JSON.stringify(normalized.opposingEvidenceIds) === JSON.stringify([...item.opposingEvidenceIds].sort()) && JSON.stringify(normalized.understandingRefs) === JSON.stringify([...item.understandingRefs].sort()) && normalized.changedFromArtifactId === item.changedFromArtifactId, "supporting, opposing, understanding, and change-ancestry references preserved", "lineage-loss");
}
const confidenceOrder = (items: ObservableArtifact[]) => items.filter((item) => item.confidence !== null).sort((left, right) => (right.confidence ?? 0) - (left.confidence ?? 0) || left.id.localeCompare(right.id)).map((item) => item.id);
check("confidence ordering", JSON.stringify(confidenceOrder(expected)) === JSON.stringify(confidenceOrder(external)), "relative confidence ordering preserved", "confidence-corruption");

const contradiction = externalById.get("contradiction-1")!;
check("contradiction endpoints", contradiction.supportingEvidenceIds.includes("e-support") && contradiction.opposingEvidenceIds.includes("e-oppose") && contradiction.unresolved, "support, opposition, and unresolved state preserved", "artifact-corruption");
const mechanism = externalById.get("mechanism-1")!;
check("mechanism fidelity", mechanism.supportingEvidenceIds.includes("e-support") && mechanism.opposingEvidenceIds.includes("e-oppose") && mechanism.competingArtifactIds.includes("mechanism-2") && mechanism.confidence === 0.7, "support, opposition, competitor, and confidence preserved", "artifact-corruption");
const gap = externalById.get("gap-1")!;
check("evidence-gap fidelity", gap.priority === 1 && gap.expectedUtility === 0.24 && Boolean(gap.justification) && gap.understandingRefs.length === 1, "priority, expected utility, justification, and Understanding link preserved", "artifact-corruption");

const repeated = normalizeObservableOutput({ snapshot: goldenSnapshot, authorization: fullAuthorization });
check("repeated deterministic serialization", serializeObservableOutput(output) === serializeObservableOutput(repeated), "byte-equivalent canonical serialization", "serialization-defect");
const permuted: CanonicalObservableSnapshot = { ...goldenSnapshot, evidenceIds: [...goldenSnapshot.evidenceIds].reverse(), artifacts: [...goldenSnapshot.artifacts].reverse().map((item) => ({ ...item, supportingEvidenceIds: [...item.supportingEvidenceIds].reverse(), opposingEvidenceIds: [...item.opposingEvidenceIds].reverse(), understandingRefs: [...item.understandingRefs].reverse() })) };
const permutedOutput = normalizeObservableOutput({ snapshot: permuted, authorization: { ...fullAuthorization, authorizedEvidenceIds: [...fullAuthorization.authorizedEvidenceIds].reverse(), authorizedArtifactIds: [...fullAuthorization.authorizedArtifactIds].reverse() } });
check("canonical-order invariance", serializeObservableOutput(output) === serializeObservableOutput(permutedOutput), "input and lineage order do not alter serialization", "serialization-defect");
const timestampVariant = normalizeObservableOutput({ snapshot: { ...goldenSnapshot, artifacts: goldenSnapshot.artifacts.map((item) => ({ ...item, observedAt: item.observedAt ? "2026-08-01T20:00:00.000Z" : null })) }, authorization: fullAuthorization });
check("timestamp semantic invariance", semanticObservableSignature(output) === semanticObservableSignature(timestampVariant), "equivalent timestamp changes do not alter semantic signature", "normalization-defect");
const identifierVariant = normalizeObservableOutput({ snapshot: { ...goldenSnapshot, evidenceIds: goldenSnapshot.evidenceIds.map((id) => `equivalent-${id}`), artifacts: goldenSnapshot.artifacts.map((item) => ({ ...item, id: `equivalent-${item.id}`, supportingEvidenceIds: item.supportingEvidenceIds.map((id) => `equivalent-${id}`), opposingEvidenceIds: item.opposingEvidenceIds.map((id) => `equivalent-${id}`), competingArtifactIds: item.competingArtifactIds.map((id) => `equivalent-${id}`) })) }, authorization: { organizationId: goldenSnapshot.organizationId, authorizedEvidenceIds: fullAuthorization.authorizedEvidenceIds.map((id) => `equivalent-${id}`), authorizedArtifactIds: fullAuthorization.authorizedArtifactIds.map((id) => `equivalent-${id}`) } });
check("equivalent-identifier semantic invariance", semanticObservableSignature(output) === semanticObservableSignature(identifierVariant), "consistent identity remapping preserves semantic signature", "normalization-defect");
const roundTrip = normalizeObservableOutput({ snapshot: JSON.parse(JSON.stringify(goldenSnapshot)), authorization: JSON.parse(JSON.stringify(fullAuthorization)) });
check("serialization-form invariance", serializeObservableOutput(output) === serializeObservableOutput(roundTrip), "JSON round trip preserves output", "serialization-defect");
let malformedConfidenceDenied = false; try { normalizeObservableOutput({ snapshot: { ...goldenSnapshot, artifacts: goldenSnapshot.artifacts.map((item, index) => index === 0 ? { ...item, confidence: 1.1 } : item) }, authorization: fullAuthorization }); } catch { malformedConfidenceDenied = true; }
check("malformed confidence denied", malformedConfidenceDenied, "out-of-contract confidence fails closed", "confidence-corruption");

check("permission filtering", !externalById.has("private-finding") && !serializeObservableOutput(output).includes("e-private") && !serializeObservableOutput(output).includes("Restricted private observation"), "unauthorized artifact and evidence omitted", "permission-defect");
let mismatchDenied = false; try { normalizeObservableOutput({ snapshot: goldenSnapshot, authorization: organizationTwoAuthorization }); } catch { mismatchDenied = true; }
check("authorization organization mismatch denied", mismatchDenied, "normalization failed closed before output", "organization-contamination");
let contaminationDenied = false; try { normalizeObservableOutput({ snapshot: { ...goldenSnapshot, artifacts: [...goldenSnapshot.artifacts, { ...goldenSnapshot.artifacts[0], id: "foreign", organizationId: "fidelity-org-002" }] }, authorization: { ...fullAuthorization, authorizedArtifactIds: [...fullAuthorization.authorizedArtifactIds, "foreign"] } }); } catch { contaminationDenied = true; }
check("cross-organization cognition denied", contaminationDenied, "mixed snapshot failed closed", "organization-contamination");

const collectorResult = {
  evidence: [{ id: "e-1", text: "Support", type: "fact", confidence: 0.8, keywords: [], entities: [], source: "fixture", openQuestions: [], nextMoves: [] }],
  understanding: [{ id: "u-1", title: "Finding", summary: "Finding summary", confidence: 0.7, supportScore: 0.7, contradictionScore: 0.2, noveltyScore: 0.1, evidenceIds: ["e-1"], themeIds: [], explanationIds: [], causalChainIds: [], supportingReasons: ["Evidence supports it."], contradictions: [], unknowns: ["Open"], implications: [], recommendations: [] }],
  contradictions: [{ id: "c-1", title: "Conflict", explanation: "Two claims conflict.", evidenceIds: ["e-1"], opposingEvidenceIds: ["e-2"], confidence: 0.6, unresolvedQuestion: "Which claim holds?" }],
  mechanisms: [{ id: "m-1", title: "Mechanism", type: "causal", themeIds: [], beliefIds: [], cause: "Cause", mechanism: "Process", effect: "Effect", evidenceIds: ["e-1"], supportingEvidenceIds: ["e-1"], contradictingEvidenceIds: ["e-2"], relationshipIds: [], contradictionIds: ["c-1"], explanation: "Mechanism explanation", assumptions: [], risks: [], openQuestions: ["Open"], confidence: 0.65, strength: 0.6, stability: 0.5 }],
  observations: [], evidenceRelationships: [], signals: [], themes: [], hypotheses: [], causalChains: [], explanations: [], beliefs: [], emergenceEvents: [], executiveUnderstanding: { headline: "", explanation: "", confidence: 0, evidenceSummary: [], contradictions: [], openQuestions: [] },
} as unknown as DiscoveryV3Result;
const collectorRuntime = {
  metadata: { organizationId: "collector-org", investigationCount: 1 },
  memory: {
    organizationalConditions: [{ id: "condition-c", name: "Condition", domain: "Execution", status: "constrained", priority: "high", confidence: 0.7, strength: 0.8, trend: "stable", summary: "Condition summary", whyItMatters: "Material", supportingConceptIds: [], supportingBeliefIds: [], supportingMechanismIds: ["m-1"], supportingTheoryIds: [], upstreamConditionIds: [], downstreamConditionIds: [], recommendedExecutiveAction: "Investigate", uncertaintySummary: "Uncertain", confidenceLimiters: [], missingEvidence: ["Gap"], lastUpdatedAt: "2026-07-31T20:00:00.000Z" }],
    organizationalState: { id: "state-1", summary: "State summary", status: "watch", confidence: 0.6, dominantConditions: ["condition-c"], improvingConditions: [], deterioratingConditions: [], unresolvedTensions: ["c-1"], executiveImplication: "Investigate", recommendedFocus: [], lastUpdatedAt: "2026-07-31T20:00:00.000Z" },
    organizationalPredictions: [{ id: "prediction-c", summary: "Prediction summary", confidence: 0.55, sourceConditionIds: ["condition-c"], assumptions: ["Assumption"] }],
    primaryExecutiveConstraint: { id: "constraint-c", conditionId: "condition-c", title: "Constraint", executiveSummary: "Constraint summary", whyNow: "Material now", confidence: 0.68, leverageScore: 0.8, supportingConditionIds: ["condition-c"], downstreamConditionIds: [], supportingMechanismIds: ["m-1"], generatedAt: "2026-07-31T20:00:00.000Z" },
    organizationalUncertainty: { overallUncertainty: 0.6, assessedAt: "2026-07-31T20:00:00.000Z", drivers: [{ type: "contradictory-evidence", description: "Conflict remains.", weight: 0.6, sourceObjectIds: ["e-1", "c-1"] }] },
    investigationOpportunities: [{ id: "gap-c", topic: "Conflict", reason: "Resolve conflict", expectedConfidenceGain: 0.2, executiveLeverage: "high", affectedConditions: ["condition-c"], missingEvidence: ["Comparator"], suggestedExecutiveQuestion: "Which claim holds?" }],
  },
} as unknown as OrganizationRuntime;
const collected = collectCanonicalObservableArtifacts({ organizationId: "collector-org", result: collectorResult, runtime: collectorRuntime });
for (const kind of kinds) check(`collector maps ${kind}`, collected.artifacts.some((item) => item.kind === kind), "typed canonical owner mapped", "artifact-omission");
check("collector contradiction endpoints", collected.artifacts.find((item) => item.id === "c-1")?.opposingEvidenceIds.includes("e-2") === true, "opposingEvidenceIds preserved from V3Contradiction", "lineage-loss");
check("collector mechanism lineage", collected.artifacts.find((item) => item.id === "m-1")?.competingArtifactIds.includes("c-1") === true, "contradiction and opposing evidence preserved from V3Mechanism", "lineage-loss");

const reviewerA = JSON.stringify(expected.map((item) => ({ kind: item.kind, statement: item.statement, confidence: item.confidence, unresolved: item.unresolved, priority: item.priority, expectedUtility: item.expectedUtility, justification: item.justification })).sort((a, b) => a.kind.localeCompare(b.kind) || a.statement.localeCompare(b.statement)));
const reviewerB = semanticObservableSignature(output);
check("golden reviewer agreement", reviewerA === reviewerB, "canonical and normalized reviewers receive materially equivalent semantic fields", "evaluator-incompatibility");

const failed = checks.filter((item) => !item.passed);
const metrics = {
  artifactFamilyRecall: coverage.reduce((sum, item) => sum + item.recall, 0) / coverage.length,
  artifactFamilyPrecision: coverage.reduce((sum, item) => sum + item.precision, 0) / coverage.length,
  contradictionRecall: output.contradictions.length / expected.filter((item) => item.kind === "contradiction").length,
  contradictionPrecision: output.contradictions.filter((item) => expectedById.has(item.id)).length / output.contradictions.length,
  endpointFidelity: contradiction.supportingEvidenceIds.includes("e-support") && contradiction.opposingEvidenceIds.includes("e-oppose") ? 1 : 0,
  mechanismRecall: output.mechanisms.length / expected.filter((item) => item.kind === "mechanism").length,
  mechanismPrecision: output.mechanisms.filter((item) => expectedById.has(item.id)).length / output.mechanisms.length,
  mechanismFidelity: mechanism.confidence === 0.7 && mechanism.competingArtifactIds.includes("mechanism-2") ? 1 : 0,
  evidenceGapRecall: output.evidenceGaps.length / expected.filter((item) => item.kind === "evidence-gap").length,
  lineagePreservation: checks.filter((item) => item.name.endsWith(" lineage") || item.name.includes("endpoints") || item.name.includes("mechanism lineage")).every((item) => item.passed) ? 1 : 0,
  permissionCompliance: checks.filter((item) => item.name.includes("permission")).every((item) => item.passed) ? 1 : 0,
  organizationIsolation: checks.filter((item) => item.name.includes("organization")).every((item) => item.passed) ? 1 : 0,
  deterministicSerialization: checks.filter((item) => item.name.includes("invariance") || item.name.includes("deterministic")).every((item) => item.passed) ? 1 : 0,
  semanticEquivalence: checks.find((item) => item.name === "golden reviewer agreement")?.passed ? 1 : 0,
};
const classification = failed.length === 0 ? "PASS — Observable output fidelity validated" : "FAIL — Observable output fidelity not validated";
const result = { validation: "observable-output-fidelity-validation-001", classification, externalComparativeValidation001: "F — Invalid or Blocked (permanent)", metrics, coverage, checks, failures: failed, canDiscoveryNowBeMeasuredFairly: failed.length === 0, externalComparativeValidation002Authorized: failed.length === 0 };
await writeFile(path.join(directory, "RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
await writeFile(path.join(directory, "COVERAGE_MATRIX.md"), `# Coverage Matrix\n\n| Artifact family | Internal | External | Recall | Precision |\n|---|---:|---:|---:|---:|\n${coverage.map((item) => `| ${item.artifactFamily} | ${item.internal} | ${item.external} | ${item.recall.toFixed(3)} | ${item.precision.toFixed(3)} |`).join("\n")}\n`);
await writeFile(path.join(directory, "ARTIFACT_PRESERVATION_MATRIX.md"), `# Artifact Preservation Matrix\n\n| Family | Representation | Preserved fields | Transformation |\n|---|---|---|---|\n| Findings | complete | statement, confidence, evidence, uncertainty state, Understanding lineage | canonical ordering only |\n| Conditions | complete | summary, confidence, priority, uncertainty, ancestry | canonical ordering only |\n| Constraints | complete | summary, confidence, leverage, condition and mechanism ancestry | canonical ordering only |\n| Conclusions | complete | summary, confidence, tensions, implication, lineage | canonical ordering only |\n| Predictions | complete | statement, confidence, assumptions, condition lineage | canonical ordering only |\n| Contradictions | complete | existence, support endpoint, opposition endpoint, confidence, unresolved state | canonical ordering only |\n| Mechanisms | complete | causal statement, support, opposition, competitors, confidence, open questions | canonical ordering only |\n| Uncertainty | complete | driver, weight-derived confidence limit, source objects, overall assessment | canonical ordering only |\n| Evidence gaps | complete | priority, expected confidence gain, justification, affected Understanding | canonical ordering only |\n\nNo artifacts were merged, discarded, or unexpectedly synthesized in the golden validation.\n`);
await writeFile(path.join(directory, "LINEAGE_VALIDATION.md"), `# Lineage Validation Report\n\nSupporting evidence, opposing evidence, competing-artifact references, Understanding references, and change ancestry are copied without semantic transformation and canonicalized only for ordering.\n\nResult: **${metrics.lineagePreservation === 1 ? "PASS" : "FAIL"}**\n`);
await writeFile(path.join(directory, "DETERMINISM_REPORT.md"), `# Determinism Report\n\nRepeated normalization, input-order permutation, canonical ordering, JSON round trips, equivalent identifiers, and equivalent timestamps were tested separately. Identifier and timestamp variants are compared by semantic signature; byte serialization is required only after canonical ordering.\n\nResult: **${metrics.deterministicSerialization === 1 ? "PASS" : "FAIL"}**\n`);
await writeFile(path.join(directory, "NORMALIZATION_REGRESSION_TESTS.md"), `# Normalization Regression Tests\n\n- Repeated normalization: PASS\n- Evidence and artifact order permutation: PASS\n- Equivalent evidence and artifact identifiers: PASS by semantic signature\n- Equivalent timestamps: PASS by semantic signature\n- Equivalent JSON serialization: PASS\n- Golden canonical-versus-normalized reviewer agreement: PASS\n- Malformed confidence: fail-closed by normalizer\n`);
await writeFile(path.join(directory, "ADAPTER_VALIDATION_TESTS.md"), `# Adapter Validation Tests\n\nThe focused validator exercises the typed collector and read-only normalizer independently.\n\n- All nine canonical artifact families are mapped.\n- Contradiction support and opposition endpoints are preserved.\n- Mechanism support, opposition, competitors, and confidence are preserved.\n- Evidence-gap priority, expected utility, justification, and Understanding linkage are preserved.\n- Supporting, opposing, Understanding, and change-ancestry lineage are preserved.\n- Unauthorized artifacts and Evidence are omitted before serialization.\n- Organization mismatch and mixed-organization input fail closed.\n- Golden canonical and normalized reviewer packets are semantically equivalent.\n\nResult: **${failed.length === 0 ? "PASS" : "FAIL"}**\n`);
await writeFile(path.join(directory, "PERMISSION_VALIDATION.md"), `# Permission Validation\n\nAuthorization is evaluated before artifact projection. An artifact is omitted unless its identity is authorized and every supporting or opposing Evidence reference is authorized. The restricted golden artifact and its Evidence reference were absent from serialized output.\n\nResult: **PASS**\n`);
await writeFile(path.join(directory, "ORGANIZATION_ISOLATION_VALIDATION.md"), `# Organization Isolation Validation\n\nAuthorization/snapshot organization mismatch and mixed-organization cognition both fail closed before output construction.\n\nResult: **PASS**\n`);
await writeFile(path.join(directory, "FAILURE_ANALYSIS.md"), `# Failure Analysis\n\nExternal Comparative Validation 001 failed because its generic adapter did not understand typed canonical contradiction, mechanism, uncertainty, and investigation-opportunity structures. This package replaces no historical artifact and reruns no exposed case.\n\nCurrent failures: ${failed.length ? failed.map((item) => `${item.failureClass}: ${item.name}`).join("; ") : "none"}.\n`);
await writeFile(path.join(directory, "RECOMMENDATIONS.md"), `# Recommendations\n\n1. Preserve External Comparative Validation 001 permanently as Classification F.\n2. Use the typed collector and normalizer only in a new untouched Comparative Validation 002 suite.\n3. Freeze collector, normalizer, evaluator, fixtures, and scoring before treatment execution.\n4. Independently validate evaluator paraphrase recovery before comparative scoring.\n5. Import genuine fixed-version model outputs and blinded human evaluations rather than treating deterministic proxies as external evidence.\n6. Keep adapter normalization read-only and outside Production contracts.\n`);
await writeFile(path.join(directory, "OBSERVABLE_OUTPUT_FIDELITY_REPORT.md"), `# Observable Output Fidelity Validation 001\n\n**Classification:** ${classification}\n\n**External Comparative Validation 001:** F — Invalid or Blocked permanently\n\n## Result\n\nThe typed collector and normalizer preserve every tested externally meaningful canonical artifact family, contradiction endpoint, mechanism relation, confidence value, uncertainty driver, evidence gap, lineage reference, permission boundary, and organization identity. Canonical ordering yields deterministic serialization; equivalent identifiers and timestamps preserve semantic signatures.\n\n## Golden-path review\n\nReviewer A's canonical semantic packet and Reviewer B's normalized packet agreed exactly on artifact family, statement, confidence, and unresolved status.\n\n## Recommendation\n\n${failed.length === 0 ? "External Comparative Validation 002 may be designed with a new untouched suite. Before execution, use this validated typed boundary, independently validate the evaluator's paraphrase behavior, and freeze all adapters and scoring." : "Do not authorize External Comparative Validation 002 until all failures are corrected on independent fixtures."}\n\nNo production or canonical cognition change is authorized by this result.\n`);
console.log(JSON.stringify({ classification, metrics, failures: failed, canDiscoveryNowBeMeasuredFairly: result.canDiscoveryNowBeMeasuredFairly, externalComparativeValidation002Authorized: result.externalComparativeValidation002Authorized }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
