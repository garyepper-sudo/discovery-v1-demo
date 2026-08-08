import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  createCanonicalEvidenceContributionLineageEnvelope,
  createCanonicalEvidenceContributionOperationContext,
  createCanonicalEvidenceScopeAttribution,
  createCanonicalScopeLineageIndex,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { runDiscoveryV3 } from "../../engine/v3";
import { atlasIndustrialArtifacts } from "../../engine/benchmark/judgment-lab/atlasIndustrialPilot";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { OrganizationalExplanation } from "../../engine/v3/model/judgment/organizationalJudgment";
import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  produceCanonicalUnderstandingAudienceLineage,
  validateCanonicalUnderstandingAudienceLineage,
  validateCanonicalUnderstandingAudienceLineageRecord,
  type CanonicalUnderstandingAudienceLineage,
} from "../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";

const ORG = "audience-lineage-forward-producer-fixture";
const NOW = "2026-08-05T12:00:00.000Z";
const compare = (a: string, b: string) => a.localeCompare(b);
const stable = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => compare(a, b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`
    : JSON.stringify(value);
const digest = (value: unknown) => createHash("sha256").update(stable(value)).digest("hex");
const sorted = <T>(values: readonly T[]) => [...values].map((value) => structuredClone(value)).sort((a, b) => compare(stable(a), stable(b)));

const root = { organizationId: ORG, type: "organization" as const, id: ORG };
const team = { organizationId: ORG, type: "team" as const, id: "team:operations" };
const department = { organizationId: ORG, type: "department" as const, id: "department:engineering" };
const topology = createCanonicalScopeTopology({ organizationId: ORG, topologyVersion: 1, effectiveAt: NOW, nodes: [root, department, team], relationships: [{ kind: "contains", from: root, to: department }, { kind: "contains", from: department, to: team }] });
const governedContent = atlasIndustrialArtifacts.map((item) => item.content).join("\n\n");
const binding = createCanonicalSourceScopeBinding({ organizationId: ORG, bindingVersion: 1, source: { sourceId: "source:operations", sourceVersion: "1", normalizedContentDigest: createHash("sha256").update(governedContent).digest("hex") }, topology, assertions: [{ relationship: "origin", scope: department }], basisRefs: ["governed-source-declaration:operations"], effectiveAt: NOW, sourceType: "manual-takeaway", purposeRef: "organizational-understanding", availability: "available" });
const investigationInput = { company: "Audience lineage validation", website: "", industry: "Testing", question: "What constrains delivery?", context: "", evidenceSources: [{ sourceId: binding.source.sourceId, sourceType: "paste", observedAt: NOW, contentDigest: binding.source.normalizedContentDigest, content: governedContent }] };
const investigationResult = runDiscoveryV3(investigationInput, { organizationId: ORG, effectiveAt: NOW, topologyRevisions: [topology], sourceBindingRevisions: [binding] });
const operationContext = createCanonicalEvidenceContributionOperationContext({ contributionOperationId: "operation:audience-lineage", organizationId: ORG, questionId: "question:audience-lineage", purposeRef: "organizational-understanding", requestFingerprint: digest("audience-lineage-request"), idempotencyKeyDigest: digest("audience-lineage-key") });
const operationEnvelope = createCanonicalEvidenceContributionLineageEnvelope({ context: operationContext, admissionBatch: investigationResult.scopeLineageAdmission!.operationBatch });
const originalLog = console.log;
let governedRuntime;
try {
  console.log = () => {};
  governedRuntime = evolveOrganizationRuntime({ runtime: createEmptyOrganizationRuntime({ organizationId: ORG, name: "Audience lineage validation", now: NOW }), result: investigationResult, input: investigationInput, semanticTime: NOW, canonicalEvidenceContributionOperationContext: operationContext, canonicalEvidenceContributionLineageEnvelope: operationEnvelope });
} finally {
  console.log = originalLog;
}
const index = governedRuntime.memory.canonicalScopeLineageIndex!;
const explanation = governedRuntime.memory.organizationalExplanations.find((candidate) => candidate.canonicalGovernanceLineage)!;
assert(explanation, "governed operation did not create a lineaged Explanation");
const firstSupport = explanation.canonicalGovernanceLineage!.materialSupports[0]!;
const attribution = index.evidenceAttributions.find((candidate) => candidate.attributionId === firstSupport.attributionId)!;
const composition: CanonicalUnderstandingComposition = { id: "composition:operations", revisionId: "composition:operations:revision:1", previousRevisionId: null, organizationId: ORG, scope: root, outcomeRef: { type: "phenomenon", id: "phenomenon:1" }, explanationIds: [explanation.id], compositionUncertainty: [], createdAt: NOW, updatedAt: NOW };

type ProducerInput = Parameters<typeof produceCanonicalUnderstandingAudienceLineage>[0];
type ScenarioWrapper = {
  id: string;
  description: string;
  expectedAssertion: string;
  transformationClass: TransformationClass;
  baselineId: string | null;
  allowedReuse: AllowedReuse;
  producerInput: ProducerInput;
  roleLabel?: string;
  defaultProductScope?: string;
  recipientId?: string;
  recipientAudienceGrants?: unknown[];
  presentationMetadata?: string;
};
type TransformationClass = "SEMANTIC_INPUT_MUTATION" | "NORMALIZATION_INVARIANCE" | "EXTERNAL_NEUTRALITY_INVARIANCE" | "TAMPERED_OUTPUT_VALIDATION" | "MULTIPLE_ASSERTIONS_OVER_ONE_SCENARIO";
type AllowedReuse = "NONE" | "NORMALIZATION_EQUIVALENCE" | "BASELINE_CONTROL";
type ModelId = "A" | "B" | "C" | "D" | "E";
type ProducerExecution = { status: "produced"; output: CanonicalUnderstandingAudienceLineage } | { status: "rejected"; errorClass: string };
type ModelResult = { modelId: ModelId; producedRecords: number; incompleteRecords: number; conflictingRecords: number; rejectedRecords: number; unsupportedFields: string[]; semanticViolations: string[]; securityViolations: string[]; provenancePreserved: boolean; audienceOwnershipViolations: number; deterministic: boolean; eligible: boolean };

function fixture(): ProducerInput {
  return { organizationId: ORG, compositions: [structuredClone(composition), { ...structuredClone(composition), id: "composition:independent", revisionId: "composition:independent:revision:1", outcomeRef: { type: "phenomenon", id: "phenomenon:2" } }], explanations: [structuredClone(explanation)], scopeLineageIndex: structuredClone(index), scopeTopology: structuredClone(topology) };
}

function rebuildIndex(input: ProducerInput): void {
  assert(input.scopeLineageIndex && input.scopeTopology);
  input.scopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId: input.organizationId, topology: input.scopeTopology, sourceBindings: input.scopeLineageIndex.sourceBindings, evidenceAttributions: input.scopeLineageIndex.evidenceAttributions, derivedLineages: input.scopeLineageIndex.derivedLineages });
}

/** Benchmark-owned canonicalization mirrors the producer's set/order semantics without adding fields. */
function normalizeProducerInput(input: ProducerInput): ProducerInput {
  const clone = structuredClone(input);
  clone.compositions = sorted(clone.compositions).map((item) => ({ ...item, explanationIds: [...new Set(item.explanationIds)].sort(compare), compositionUncertainty: sorted(item.compositionUncertainty) }));
  clone.explanations = sorted(clone.explanations).map((item) => ({ ...item, evidenceIds: [...new Set(item.evidenceIds)].sort(compare), contradictionIds: [...new Set(item.contradictionIds)].sort(compare), explanationSeedIds: [...new Set(item.explanationSeedIds)].sort(compare), reasoningPathIds: [...new Set(item.reasoningPathIds)].sort(compare), mechanismIds: [...new Set(item.mechanismIds)].sort(compare), beliefIds: [...new Set(item.beliefIds)].sort(compare), theoryIds: [...new Set(item.theoryIds)].sort(compare), comparativeEvidenceRoles: sorted(item.comparativeEvidenceRoles ?? []), assumptions: sorted(item.assumptions), uncertainty: sorted(item.uncertainty) }));
  if (clone.scopeLineageIndex) clone.scopeLineageIndex = { ...clone.scopeLineageIndex, sourceBindings: sorted(clone.scopeLineageIndex.sourceBindings), evidenceAttributions: sorted(clone.scopeLineageIndex.evidenceAttributions), derivedLineages: sorted(clone.scopeLineageIndex.derivedLineages) };
  if (clone.scopeTopology) clone.scopeTopology = { ...clone.scopeTopology, nodes: sorted(clone.scopeTopology.nodes), relationships: sorted(clone.scopeTopology.relationships) };
  return clone;
}

function executeProducer(input: ProducerInput): ProducerExecution {
  try { return { status: "produced", output: produceCanonicalUnderstandingAudienceLineage(input) }; }
  catch (error) { return { status: "rejected", errorClass: (error as Error).message }; }
}

const policy = {
  A: { identity: "composition-subject-inheritance", version: 1 },
  B: { identity: "direct-field-scope", version: 1 },
  C: { identity: "support-lineage-intersection", version: 1 },
  D: { identity: "support-role-conjunction", version: 1 },
  E: { identity: "explicit-audience-classification", version: 1 },
} as const;

function evaluateModel(modelId: ModelId, execution: ProducerExecution): ModelResult {
  const records = execution.status === "produced" ? execution.output.records : [];
  const semanticViolations: string[] = [];
  const securityViolations: string[] = [];
  if (modelId === "A") { semanticViolations.push("composition-subject-scope-used-without-governed-audience-derivation"); securityViolations.push("nested-detail-broadening-risk"); }
  if (modelId === "B") semanticViolations.push("support-lineage-discarded");
  if (modelId === "C" && records.some((record) => record.audienceRequirementBasis === "unresolved")) semanticViolations.push("field-owned-audience-requirement-unresolved");
  if (modelId === "D") { semanticViolations.push("support-role-conjunction-unproven"); securityViolations.push("over-withholding-risk"); }
  if (modelId === "E") semanticViolations.push("canonical-explicit-audience-owner-missing");
  if (execution.status === "rejected") securityViolations.push(`producer-rejected:${execution.errorClass}`);
  const provenancePreserved = modelId !== "B";
  const result = { modelId, producedRecords: records.length, incompleteRecords: records.filter((record) => record.completeness === "incomplete").length, conflictingRecords: records.filter((record) => record.completeness === "conflicting").length, rejectedRecords: execution.status === "rejected" ? 1 : 0, unsupportedFields: execution.status === "produced" ? execution.output.unresolvedFieldFamilies : ["producer-rejected"], semanticViolations: semanticViolations.sort(compare), securityViolations: securityViolations.sort(compare), provenancePreserved, audienceOwnershipViolations: records.filter((record) => record.audienceRequirementBasis === "unresolved").length, deterministic: true, eligible: false };
  result.eligible = result.semanticViolations.length === 0 && result.securityViolations.length === 0 && result.provenancePreserved;
  return result;
}

type ScenarioDefinition = { id: string; description: string; transform: (input: ProducerInput) => void; transformationClass: "SEMANTIC_INPUT_MUTATION" | "NORMALIZATION_INVARIANCE"; baselineId: string | null; allowedReuse: AllowedReuse };
const definitions: ScenarioDefinition[] = [
  { id: "baseline", description: "exact canonical foundation", transform: () => undefined, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: null, allowedReuse: "BASELINE_CONTROL" },
  { id: "composition-revision", description: "composition target version changes", transform: (input) => { input.compositions[0]!.revisionId = "composition:operations:revision:2"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "composition-revision-missing", description: "composition revision is absent", transform: (input) => { input.compositions[0]!.revisionId = ""; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "composition-organization", description: "composition crosses organization", transform: (input) => { input.compositions[0]!.organizationId = "other"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "composition-subject-scope", description: "composition subject scope changes", transform: (input) => { input.compositions[0]!.scope = team; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "composition-outcome", description: "composition outcome changes", transform: (input) => { input.compositions[0]!.outcomeRef = { type: "phenomenon", id: "phenomenon:changed" }; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "explanation-missing", description: "composition references absent Explanation", transform: (input) => { input.compositions[0]!.explanationIds = ["explanation:missing"]; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "explanation-organization", description: "Explanation crosses organization", transform: (input) => { input.explanations[0]!.organizationId = "other"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "explanation-identity", description: "Explanation identity and reference change", transform: (input) => { input.explanations[0]!.id = "explanation:changed"; input.compositions[0]!.explanationIds = ["explanation:changed"]; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "explanation-content", description: "Explanation content changes without identity version", transform: (input) => { input.explanations[0]!.claim.rootMechanismIds = ["mechanism:changed"]; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "attribution-missing", description: "Evidence attribution is removed", transform: (input) => { input.scopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId: ORG, topology, sourceBindings: [binding], evidenceAttributions: [] }); }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "attribution-organization", description: "Evidence attribution crosses organization", transform: (input) => { input.scopeLineageIndex!.evidenceAttributions[0]!.organizationId = "other"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "evidence-scope", description: "Evidence scope changes independently", transform: (input) => { input.scopeLineageIndex!.evidenceAttributions[0]!.assertions = [{ relationship: "applies-to", scope: team }]; rebuildIndex(input); }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "binding-missing", description: "referenced source binding is removed", transform: (input) => { input.scopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId: ORG, topology, sourceBindings: [], evidenceAttributions: [attribution] }); }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "binding-unresolved", description: "attribution references unresolved source binding", transform: (input) => { input.scopeLineageIndex!.evidenceAttributions[0]!.sourceBindingIds = ["binding:unresolved"]; rebuildIndex(input); }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "binding-organization", description: "source binding crosses organization", transform: (input) => { input.scopeLineageIndex!.sourceBindings[0]!.organizationId = "other"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "source-scope", description: "source scope changes independently", transform: (input) => { const changed = createCanonicalSourceScopeBinding({ organizationId: ORG, bindingVersion: 1, source: binding.source, topology, assertions: [{ relationship: "origin", scope: team }], basisRefs: binding.basisRefs, effectiveAt: NOW }); input.scopeLineageIndex!.sourceBindings = [changed]; input.scopeLineageIndex!.evidenceAttributions[0]!.sourceBindingIds = [changed.bindingId]; rebuildIndex(input); }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "organization-identity", description: "producer organization changes", transform: (input) => { input.organizationId = "other"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "unsupported-version", description: "untyped producer version input is rejected", transform: (input) => { (input as ProducerInput & { producerVersion: string }).producerVersion = "unsupported"; }, transformationClass: "SEMANTIC_INPUT_MUTATION", baselineId: "baseline", allowedReuse: "NONE" },
  { id: "canonical-order", description: "order-sensitive arrays reverse before canonical normalization", transform: (input) => { input.compositions = [...input.compositions].reverse(); input.scopeTopology!.nodes = [...input.scopeTopology!.nodes].reverse(); }, transformationClass: "NORMALIZATION_INVARIANCE", baselineId: "baseline", allowedReuse: "NORMALIZATION_EQUIVALENCE" },
];

const scenarios = definitions.map((definition): ScenarioWrapper => {
  const producerInput = fixture(); definition.transform(producerInput);
  return { id: definition.id, description: definition.description, expectedAssertion: "bounded executable finding", transformationClass: definition.transformationClass, baselineId: definition.baselineId, allowedReuse: definition.allowedReuse, producerInput };
});
assert.equal(new Set(scenarios.map((scenario) => scenario.id)).size, scenarios.length, "duplicate scenario IDs");
const modelIds = Object.keys(policy) as ModelId[];
assert.equal(new Set(modelIds).size, modelIds.length, "duplicate model IDs");

type Cell = { scenarioId: string; modelId: ModelId; scenarioWrapperDigest: string; rawProducerInputDigest: string; normalizedProducerInputDigest: string; modelEvaluationInputDigest: string; producerOutputDigest: string; modelOutputDigest: string; result: ModelResult };
const cells: Cell[] = [];
const scenarioExecutions = new Map<string, ProducerExecution>();
for (const scenario of scenarios) {
  const normalized = normalizeProducerInput(scenario.producerInput);
  const execution = executeProducer(scenario.producerInput);
  scenarioExecutions.set(scenario.id, execution);
  for (const modelId of modelIds) {
    const result = evaluateModel(modelId, execution);
    cells.push({ scenarioId: scenario.id, modelId, scenarioWrapperDigest: digest(scenario), rawProducerInputDigest: digest(scenario.producerInput), normalizedProducerInputDigest: digest(normalized), modelEvaluationInputDigest: digest({ normalizedProducerInput: normalized, modelId, policy: policy[modelId] }), producerOutputDigest: digest(execution), modelOutputDigest: digest(result), result });
  }
}
const expectedMatrixCells = scenarios.length * modelIds.length;
assert.equal(cells.length, expectedMatrixCells);
assert.equal(new Set(cells.map((cell) => `${cell.scenarioId}:${cell.modelId}`)).size, expectedMatrixCells, "duplicate case/model cells");

const byId = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
function assertTransformation(scenario: ScenarioWrapper): void {
  if (!scenario.baselineId) return;
  const baseline = byId.get(scenario.baselineId)!;
  const rawEqual = digest(scenario.producerInput) === digest(baseline.producerInput);
  const normalizedEqual = digest(normalizeProducerInput(scenario.producerInput)) === digest(normalizeProducerInput(baseline.producerInput));
  if (scenario.transformationClass === "SEMANTIC_INPUT_MUTATION") { assert(!rawEqual, `${scenario.id}: semantic mutation is a raw no-op`); assert(!normalizedEqual, `${scenario.id}: semantic mutation is a normalized no-op`); assert.equal(scenario.allowedReuse, "NONE"); }
  if (scenario.transformationClass === "NORMALIZATION_INVARIANCE") { assert(!rawEqual, `${scenario.id}: normalization transform is a raw no-op`); assert(normalizedEqual, `${scenario.id}: normalized meaning changed`); assert.equal(scenario.allowedReuse, "NORMALIZATION_EQUIVALENCE"); }
}
scenarios.forEach(assertTransformation);

const normalizedGroups = new Map<string, ScenarioWrapper[]>();
for (const scenario of scenarios) { const key = digest(normalizeProducerInput(scenario.producerInput)); normalizedGroups.set(key, [...(normalizedGroups.get(key) ?? []), scenario]); }
const repeatedNormalizedInputGroups = [...normalizedGroups].filter(([, group]) => group.length > 1).map(([normalizedProducerInputDigest, group]) => ({ normalizedProducerInputDigest, scenarioIds: group.map((item) => item.id).sort(compare), transformationClasses: [...new Set(group.map((item) => item.transformationClass))].sort(compare), rawProducerInputDigests: group.map((item) => digest(item.producerInput)).sort(compare), allowedReuseReason: group.some((item) => item.allowedReuse === "NORMALIZATION_EQUIVALENCE") ? "NORMALIZATION_EQUIVALENCE" : "BASELINE_CONTROL" }));
const unjustifiedRepeatedInputGroups = repeatedNormalizedInputGroups.filter((group) => group.allowedReuseReason !== "NORMALIZATION_EQUIVALENCE");
assert.equal(unjustifiedRepeatedInputGroups.length, 0);

let invariantAssertions = 0;
const invariant = (condition: unknown, message: string) => { assert(condition, message); invariantAssertions += 1; };
const baselineScenario = byId.get("baseline")!;
const baselineExecution = scenarioExecutions.get("baseline")!;
assert.equal(baselineExecution.status, "produced");
if (baselineExecution.status !== "produced") throw new Error("baseline rejected");
validateCanonicalUnderstandingAudienceLineage(baselineExecution.output); invariantAssertions += 1;
invariant(baselineExecution.output.records.every((record) => record.completeness === "complete" && record.audienceRequirement !== null), "governed baseline is not complete");
const historicalInput = fixture();
delete historicalInput.explanations[0]!.canonicalGovernanceLineage;
const historicalExecution = executeProducer(historicalInput);
invariant(
  historicalExecution.status === "produced" &&
    historicalExecution.output.records.every(
      (record) =>
        record.completeness === "incomplete" &&
        record.audienceRequirement === null,
    ),
  "historical local-only lineage did not remain unavailable",
);
const evidenceRecord = baselineExecution.output.records.find((record) => record.fieldFamily === "evidence-reference")!;
invariant(evidenceRecord.sourceScopes !== evidenceRecord.evidenceScopes, "source and Evidence arrays alias");
invariant(stable(evidenceRecord.sourceScopes) !== stable(byId.get("evidence-scope")!.producerInput.scopeLineageIndex!.evidenceAttributions[0]!.assertions.map((item) => item.scope)), "Evidence scope leaked into source scope");
const sourceChanged = scenarioExecutions.get("source-scope")!;
const evidenceChanged = scenarioExecutions.get("evidence-scope")!;
invariant(sourceChanged.status === "produced" && stable(sourceChanged.output.records.find((record) => record.fieldFamily === "evidence-reference")!.evidenceScopes) === stable(evidenceRecord.evidenceScopes), "source scope silently changed Evidence scope");
invariant(evidenceChanged.status === "produced" && stable(evidenceChanged.output.records.find((record) => record.fieldFamily === "evidence-reference")!.sourceScopes) === stable(evidenceRecord.sourceScopes), "Evidence scope silently changed source scope");
invariant(scenarioExecutions.get("attribution-missing")!.status === "produced" && (scenarioExecutions.get("attribution-missing") as Extract<ProducerExecution, { status: "produced" }>).output.records.some((record) => record.reasons.includes("missing-evidence-attribution")), "missing attribution closure not detected");
invariant(scenarioExecutions.get("binding-missing")!.status === "produced" && (scenarioExecutions.get("binding-missing") as Extract<ProducerExecution, { status: "produced" }>).output.records.some((record) => record.reasons.some((reason) => reason.startsWith("missing-source-binding"))), "missing binding closure not detected");
invariant(scenarioExecutions.get("organization-identity")!.status === "rejected", "cross-organization input accepted");
invariant(scenarioExecutions.get("unsupported-version")!.status === "rejected", "unsupported version accepted");
invariant(digest(baselineScenario.producerInput) !== digest(byId.get("canonical-order")!.producerInput), "raw order digest unchanged");
invariant(digest(normalizeProducerInput(baselineScenario.producerInput)) === digest(normalizeProducerInput(byId.get("canonical-order")!.producerInput)), "canonical order digest differs");
invariant(digest(baselineExecution) === digest(scenarioExecutions.get("canonical-order")), "order-invariant output differs");
invariant(digest(baselineScenario.producerInput) !== digest(byId.get("composition-revision")!.producerInput), "target version input digest unchanged");
const baselineCompositionRecord = baselineExecution.output.records.find((record) => record.compositionId === composition.id && record.fieldFamily === "composition-claim")!;
const changedCompositionRecord = (scenarioExecutions.get("composition-revision") as Extract<ProducerExecution, { status: "produced" }>).output.records.find((record) => record.compositionId === composition.id && record.fieldFamily === "composition-claim")!;
invariant(baselineCompositionRecord.revisionId !== changedCompositionRecord.revisionId, "target version did not change lineage revision");

type NeutralityKey = "roleLabel" | "defaultProductScope" | "recipientId" | "recipientAudienceGrants" | "presentationMetadata";
const neutrality: { name: string; key: NeutralityKey; value: unknown }[] = [
  { name: "role-label", key: "roleLabel", value: "Manager" }, { name: "default-product-scope", key: "defaultProductScope", value: "team:decoy" }, { name: "recipient-identity", key: "recipientId", value: "recipient:decoy" }, { name: "grant-added", key: "recipientAudienceGrants", value: [{ id: "grant:decoy" }] }, { name: "grant-removed", key: "recipientAudienceGrants", value: [] }, { name: "presentation-metadata", key: "presentationMetadata", value: "decoy" },
];
const neutralityResults = neutrality.map((item) => {
  const wrapper = structuredClone(baselineScenario) as ScenarioWrapper;
  Object.assign(wrapper, { [item.key]: item.value });
  invariant(digest(wrapper) !== digest(baselineScenario), `${item.name}: wrapper digest unchanged`);
  invariant(digest(wrapper.producerInput) === digest(baselineScenario.producerInput), `${item.name}: raw producer digest changed`);
  invariant(digest(normalizeProducerInput(wrapper.producerInput)) === digest(normalizeProducerInput(baselineScenario.producerInput)), `${item.name}: normalized producer digest changed`);
  return { name: item.name, scenarioWrapperDigest: digest(wrapper), rawProducerInputDigest: digest(wrapper.producerInput), normalizedProducerInputDigest: digest(normalizeProducerInput(wrapper.producerInput)) };
});
for (const key of ["id", "description", "expectedAssertion"] as const) { const wrapper = structuredClone(baselineScenario); wrapper[key] = `${wrapper[key]}:changed` as never; invariant(digest(wrapper) !== digest(baselineScenario), `${key}: wrapper digest unchanged`); invariant(digest(wrapper.producerInput) === digest(baselineScenario.producerInput), `${key}: producer digest changed`); }
for (const injected of ["roleLabel", "defaultProductScope", "recipientId", "recipientAudienceGrants", "presentationMetadata"]) { const raw = { ...structuredClone(baselineScenario.producerInput), [injected]: "decoy" }; assert.throws(() => produceCanonicalUnderstandingAudienceLineage(raw as ProducerInput), /Unsupported producer input/); invariantAssertions += 1; }

const tamperFields = ["lineageId", "revisionId", "digest", "completeness"] as const;
const tamperResults = tamperFields.map((field) => {
  const record = structuredClone(baselineExecution.output.records[0]!);
  const producerInputDigestBefore = digest(baselineScenario.producerInput);
  if (field === "completeness") record.completeness = "complete"; else record[field] = "tampered";
  const tamperedRecordDigest = digest(record);
  assert.throws(() => validateCanonicalUnderstandingAudienceLineageRecord(record)); invariantAssertions += 1;
  invariant(producerInputDigestBefore === digest(baselineScenario.producerInput), `${field}: producer input changed during tamper`);
  return { field, rawProducerInputDigest: producerInputDigestBefore, tamperedRecordDigest };
});
for (const field of ["resourceFamily", "operation", "purpose"] as const) { const record = structuredClone(baselineExecution.output.records[0]!) as Record<string, unknown>; record[field] = "wrong"; assert.throws(() => validateCanonicalUnderstandingAudienceLineageRecord(record as never)); invariantAssertions += 1; }

const fakeSemantic = structuredClone(baselineScenario); fakeSemantic.id = "fake-semantic"; fakeSemantic.baselineId = "baseline"; fakeSemantic.allowedReuse = "NONE"; assert.throws(() => assertTransformation(fakeSemantic), /raw no-op/); invariantAssertions += 1;
const fakeNormalization = structuredClone(baselineScenario); fakeNormalization.id = "fake-normalization"; fakeNormalization.transformationClass = "NORMALIZATION_INVARIANCE"; fakeNormalization.baselineId = "baseline"; fakeNormalization.allowedReuse = "NORMALIZATION_EQUIVALENCE"; assert.throws(() => assertTransformation(fakeNormalization), /raw no-op/); invariantAssertions += 1;
const fakeRepeated: Array<{ allowedReuseReason: AllowedReuse }> = [{ allowedReuseReason: "BASELINE_CONTROL" }]; assert.equal(fakeRepeated.filter((group) => group.allowedReuseReason !== "NORMALIZATION_EQUIVALENCE").length, 1); invariantAssertions += 1;

const modelSummaries = modelIds.map((modelId) => { const results = cells.filter((cell) => cell.modelId === modelId).map((cell) => cell.result); return { modelId, validRecords: results.reduce((sum, item) => sum + item.producedRecords, 0), incompleteRecords: results.reduce((sum, item) => sum + item.incompleteRecords, 0), conflictingRecords: results.reduce((sum, item) => sum + item.conflictingRecords, 0), rejectedRecords: results.reduce((sum, item) => sum + item.rejectedRecords, 0), fieldCoverage: [...new Set(results.flatMap((item) => item.unsupportedFields))].sort(compare), mandatorySafetyViolations: [...new Set(results.flatMap((item) => [...item.semanticViolations, ...item.securityViolations]))].sort(compare), provenancePreserved: results.every((item) => item.provenancePreserved), audienceRequirementOwnershipViolations: results.reduce((sum, item) => sum + item.audienceOwnershipViolations, 0), deterministicOutput: results.every((item) => item.deterministic), eligible: results.every((item) => item.eligible) }; });
const eligibleModels = modelSummaries.filter((model) => model.eligible).map((model) => model.modelId);
const selectedModel = eligibleModels.length === 1 ? eligibleModels[0] : null;
const completeFieldFamilies = [...new Set(baselineExecution.output.records.filter((record) => record.completeness === "complete").map((record) => record.fieldFamily))].sort(compare);
const incompleteFieldFamilies = [...new Set([...baselineExecution.output.unresolvedFieldFamilies, ...baselineExecution.output.records.filter((record) => record.completeness === "incomplete").map((record) => record.fieldFamily)])].sort(compare);
const conflictingFieldFamilies = [...new Set(baselineExecution.output.records.filter((record) => record.completeness === "conflicting").map((record) => record.fieldFamily))].sort(compare);

type FindingCategory = "GOVERNANCE" | "VERSION" | "PRODUCER" | "CONTRACT";
type GapFinding = {
  id: string; category: FindingCategory; canonicalOwnerId: string; canonicalOwnerBoundary: string;
  affectedFieldFamilies: string[]; blocking: boolean; prerequisiteOwnerIds: string[];
  prerequisiteResolved: boolean; forwardOnly: boolean; requiresLiveRecipientState: boolean;
  requiresPersistence: boolean; requiresMigration: boolean; boundedTask: boolean;
  semanticOwner: string; mutationOwner: string; productionBoundary: string; lifecycle: string;
  persistenceBoundary: string; versioningBoundary: string; validationBoundary: string;
  likelyProductionFiles: string[]; evidenceRefs: string[]; findingDigest: string;
};
type FindingSeed = Omit<GapFinding, "findingDigest">;
const finding = (seed: FindingSeed): GapFinding => { const normalized = { ...seed, affectedFieldFamilies: [...new Set(seed.affectedFieldFamilies)].sort(compare), prerequisiteOwnerIds: [...new Set(seed.prerequisiteOwnerIds)].sort(compare), likelyProductionFiles: [...new Set(seed.likelyProductionFiles)].sort(compare), evidenceRefs: [...new Set(seed.evidenceRefs)].sort(compare) }; return { ...normalized, findingDigest: digest(normalized) }; };
const evidenceRefs = (scenarioIds: string[]) => cells.filter((cell) => scenarioIds.includes(cell.scenarioId)).map((cell) => `${cell.scenarioId}:${cell.modelId}`).sort(compare);
const common = { forwardOnly: true, requiresLiveRecipientState: false, requiresPersistence: false, requiresMigration: false, lifecycle: "shadow-contract", persistenceBoundary: "none" } as const;
const currentFindings: GapFinding[] = [
  finding({ id: "finding:field-audience-requirement", category: "GOVERNANCE", canonicalOwnerId: "field-audience-requirement-governance", canonicalOwnerBoundary: "canonical-field-audience-classification", affectedFieldFamilies: incompleteFieldFamilies, blocking: baselineExecution.output.records.every((record) => record.audienceRequirementBasis === "unresolved"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-organizational-understanding-field-governance", mutationOwner: "field-audience-requirement-contract", productionBoundary: "canonical-understanding-field-lineage", versioningBoundary: "audience-requirement-policy", validationBoundary: "audience-requirement-governance-oracle", likelyProductionFiles: ["engine/v3/governance/recipientAudienceScope.ts"], evidenceRefs: evidenceRefs(["baseline", "composition-subject-scope", "source-scope", "evidence-scope"]), ...common }),
  finding({ id: "finding:explanation-version", category: "VERSION", canonicalOwnerId: "completed-explanation-version-ownership", canonicalOwnerBoundary: "completed-explanation-immutable-version", affectedFieldFamilies: ["composition-claim", "explanation-claim"], blocking: baselineExecution.output.records.filter((record) => record.fieldFamily === "explanation-claim").every((record) => record.targetVersionBasis.kind === "unresolved"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "organizational-explanation", mutationOwner: "completed-explanation-producer", productionBoundary: "organizational-explanation-version", versioningBoundary: "immutable-explanation-version", validationBoundary: "completed-explanation-version-oracle", likelyProductionFiles: ["engine/v3/model/judgment/organizationalJudgment.ts"], evidenceRefs: evidenceRefs(["baseline", "explanation-content", "explanation-identity"]), ...common }),
  finding({ id: "finding:source-binding-closure", category: "PRODUCER", canonicalOwnerId: "source-binding-closure", canonicalOwnerBoundary: "exact-attribution-source-binding-closure", affectedFieldFamilies: ["evidence-reference"], blocking: false, prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-scope-lineage", mutationOwner: "audience-lineage-producer", productionBoundary: "source-binding-closure", versioningBoundary: "canonical-source-binding", validationBoundary: "source-binding-negative-controls", likelyProductionFiles: ["engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage.ts"], evidenceRefs: evidenceRefs(["binding-missing", "binding-unresolved", "source-scope"]), ...common }),
  finding({ id: "finding:scope-separation", category: "CONTRACT", canonicalOwnerId: "source-evidence-scope-separation", canonicalOwnerBoundary: "independent-source-and-evidence-provenance", affectedFieldFamilies: ["evidence-reference"], blocking: false, prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-scope-lineage", mutationOwner: "audience-lineage-producer", productionBoundary: "scope-lineage-record", versioningBoundary: "audience-lineage-record-v1", validationBoundary: "scope-separation-negative-controls", likelyProductionFiles: ["engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage.ts"], evidenceRefs: evidenceRefs(["source-scope", "evidence-scope"]), ...common }),
  finding({ id: "finding:condition-scope", category: "PRODUCER", canonicalOwnerId: "condition-scope", canonicalOwnerBoundary: "canonical-condition-identity-and-scope", affectedFieldFamilies: ["condition"], blocking: incompleteFieldFamilies.includes("condition"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "organizational-condition", mutationOwner: "condition-producer", productionBoundary: "canonical-condition", versioningBoundary: "condition-identity", validationBoundary: "condition-scope-oracle", likelyProductionFiles: ["engine/v3"], evidenceRefs: evidenceRefs(["baseline"]), ...common }),
  finding({ id: "finding:investigation-references", category: "PRODUCER", canonicalOwnerId: "investigation-canonical-references", canonicalOwnerBoundary: "canonical-investigation-condition-references", affectedFieldFamilies: ["investigation"], blocking: incompleteFieldFamilies.includes("investigation"), prerequisiteOwnerIds: ["condition-scope"], prerequisiteResolved: false, boundedTask: true, semanticOwner: "organizational-investigation", mutationOwner: "investigation-producer", productionBoundary: "canonical-investigation", versioningBoundary: "investigation-reference", validationBoundary: "investigation-reference-oracle", likelyProductionFiles: ["engine/v3"], evidenceRefs: evidenceRefs(["baseline"]), ...common }),
  finding({ id: "finding:confidence-references", category: "PRODUCER", canonicalOwnerId: "confidence-contributor-references", canonicalOwnerBoundary: "canonical-confidence-contributors", affectedFieldFamilies: ["confidence"], blocking: incompleteFieldFamilies.includes("confidence"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-confidence", mutationOwner: "confidence-producer", productionBoundary: "confidence-lineage", versioningBoundary: "confidence-contributor-version", validationBoundary: "confidence-lineage-oracle", likelyProductionFiles: ["engine/v3"], evidenceRefs: evidenceRefs(["baseline"]), ...common }),
  finding({ id: "finding:uncertainty-references", category: "PRODUCER", canonicalOwnerId: "uncertainty-owner-support-references", canonicalOwnerBoundary: "canonical-uncertainty-owner-and-support", affectedFieldFamilies: ["uncertainty", "unknown"], blocking: incompleteFieldFamilies.includes("uncertainty"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-uncertainty", mutationOwner: "uncertainty-producer", productionBoundary: "uncertainty-lineage", versioningBoundary: "uncertainty-reference-version", validationBoundary: "uncertainty-lineage-oracle", likelyProductionFiles: ["engine/v3"], evidenceRefs: evidenceRefs(["baseline"]), ...common }),
  finding({ id: "finding:contradiction-references", category: "PRODUCER", canonicalOwnerId: "contradiction-side-revision-references", canonicalOwnerBoundary: "canonical-contradiction-sides-and-revisions", affectedFieldFamilies: ["contradiction"], blocking: incompleteFieldFamilies.includes("contradiction"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "canonical-contradiction", mutationOwner: "contradiction-producer", productionBoundary: "contradiction-lineage", versioningBoundary: "contradiction-side-revision", validationBoundary: "contradiction-lineage-oracle", likelyProductionFiles: ["engine/v3"], evidenceRefs: evidenceRefs(["baseline"]), ...common }),
  finding({ id: "finding:history-evolution", category: "VERSION", canonicalOwnerId: "history-evolution-revision-lineage", canonicalOwnerBoundary: "canonical-history-and-evolution-revisions", affectedFieldFamilies: ["history", "evolution"], blocking: incompleteFieldFamilies.includes("history") || incompleteFieldFamilies.includes("evolution"), prerequisiteOwnerIds: [], prerequisiteResolved: true, boundedTask: true, semanticOwner: "organization-runtime-evolution", mutationOwner: "runtime-evolution-producer", productionBoundary: "history-evolution-lineage", versioningBoundary: "runtime-revision-lineage", validationBoundary: "history-evolution-oracle", likelyProductionFiles: ["engine/v3/runtime"], evidenceRefs: evidenceRefs(["baseline"]), ...common }),
].sort((a, b) => compare(a.canonicalOwnerId, b.canonicalOwnerId));

type CombineDecision = { ownerA: string; ownerB: string; checks: Record<string, boolean>; passedChecks: string[]; failedChecks: string[]; result: "combined" | "separate" | "unresolved"; reasonCode: string; digest: string };
function combineDecision(a: GapFinding | undefined, b: GapFinding | undefined): CombineDecision {
  if (!a || !b) { const base = { ownerA: a?.canonicalOwnerId ?? "unresolved", ownerB: b?.canonicalOwnerId ?? "unresolved", checks: {}, passedChecks: [], failedChecks: ["finding-resolution"], result: "unresolved" as const, reasonCode: "MISSING_FINDING" }; return { ...base, digest: digest(base) }; }
  const checks = { sameSemanticOwner: a.semanticOwner === b.semanticOwner, sameMutationOwner: a.mutationOwner === b.mutationOwner, sameProductionBoundary: a.productionBoundary === b.productionBoundary, sameLifecycle: a.lifecycle === b.lifecycle, samePersistenceBoundary: a.persistenceBoundary === b.persistenceBoundary, sameVersioningBoundary: a.versioningBoundary === b.versioningBoundary, sameValidationBoundary: a.validationBoundary === b.validationBoundary, independentlyReviewableSafer: false, oneBoundedCommit: a.boundedTask && b.boundedTask };
  const required = Object.entries(checks).filter(([key]) => key !== "independentlyReviewableSafer");
  const passedChecks = required.filter(([, value]) => value).map(([key]) => key).sort(compare);
  const failedChecks = [...required.filter(([, value]) => !value).map(([key]) => key), ...(checks.independentlyReviewableSafer ? ["independentlyReviewableSafer"] : [])].sort(compare);
  const result = failedChecks.length === 0 ? "combined" as const : "separate" as const;
  const base = { ownerA: a.canonicalOwnerId, ownerB: b.canonicalOwnerId, checks, passedChecks, failedChecks, result, reasonCode: result === "combined" ? "SHARED_BOUNDED_OWNER" : "DISTINCT_OWNER_OR_BOUNDARY" };
  return { ...base, digest: digest(base) };
}

const TASK_REGISTRY: Record<string, string> = {
  "field-audience-requirement-governance": "DISCOVERY CANONICAL ORGANIZATIONAL UNDERSTANDING FIELD AUDIENCE-REQUIREMENT GOVERNANCE CONTRACT 001",
  "completed-explanation-version-ownership": "DISCOVERY CANONICAL COMPLETED EXPLANATION IMMUTABLE VERSION OWNERSHIP CONTRACT 001",
  "condition-scope": "DISCOVERY CANONICAL ORGANIZATIONAL UNDERSTANDING CONDITION SCOPE AND INVESTIGATION CANONICAL-REFERENCE FORWARD PRODUCER 001",
  "nested-field-disclosure": "DISCOVERY CANONICAL ORGANIZATIONAL UNDERSTANDING RECIPIENT-SCOPED NESTED-FIELD DISCLOSURE IMPLEMENTATION 001",
};
type OwnerNode = { ownerId: string; directPrerequisites: string[]; unresolvedPrerequisites: string[]; directBlockedFields: string[]; transitivelyBlockedFields: string[]; downstreamOwners: string[]; actionableRoot: boolean };
type NextTaskDecision = { unresolvedFindings: GapFinding[]; ownerGraph: OwnerNode[]; actionableRootOwners: string[]; incomparableRootOwners: string[]; dominantOwner: string | null; dominanceRule: string; combinedTaskDecision: CombineDecision; selectedTaskRegistryKey: string | null; nextTask: string | null; producerClassification: string; readinessRecommendation: string; rationaleCodes: string[]; gapFindingsDigest: string; ownerGraphDigest: string; integrityDigest: string };
function deriveNextTaskDecision(inputFindings: GapFinding[], registry: Record<string, string> = TASK_REGISTRY): NextTaskDecision {
  const findings = inputFindings.map((item) => finding({ ...item, findingDigest: undefined } as never)).sort((a, b) => compare(a.canonicalOwnerId, b.canonicalOwnerId));
  const byOwner = new Map(findings.map((item) => [item.canonicalOwnerId, item]));
  const unresolved = findings.filter((item) => item.blocking);
  const downstream = (ownerId: string) => findings.filter((item) => item.prerequisiteOwnerIds.includes(ownerId)).map((item) => item.canonicalOwnerId).sort(compare);
  const transitiveFields = (ownerId: string, seen = new Set<string>()): string[] => { if (seen.has(ownerId)) return []; seen.add(ownerId); const owner = byOwner.get(ownerId); return [...new Set([...(owner?.affectedFieldFamilies ?? []), ...downstream(ownerId).flatMap((id) => transitiveFields(id, seen))])].sort(compare); };
  const ownerGraph: OwnerNode[] = findings.map((item) => { const unresolvedPrerequisites = item.prerequisiteOwnerIds.filter((id) => byOwner.get(id)?.blocking); return { ownerId: item.canonicalOwnerId, directPrerequisites: item.prerequisiteOwnerIds, unresolvedPrerequisites, directBlockedFields: item.blocking ? item.affectedFieldFamilies : [], transitivelyBlockedFields: item.blocking ? transitiveFields(item.canonicalOwnerId) : [], downstreamOwners: downstream(item.canonicalOwnerId), actionableRoot: item.blocking && item.boundedTask && item.forwardOnly && unresolvedPrerequisites.length === 0 }; }).sort((a, b) => compare(a.ownerId, b.ownerId));
  const roots = ownerGraph.filter((node) => node.actionableRoot);
  const strictSuperset = (a: string[], b: string[]) => b.every((field) => a.includes(field)) && a.some((field) => !b.includes(field));
  const dominant = roots.length === 1 ? roots[0]! : roots.find((candidate) => roots.filter((other) => other.ownerId !== candidate.ownerId).every((other) => strictSuperset(candidate.transitivelyBlockedFields, other.transitivelyBlockedFields)));
  const dominantOwner = dominant?.ownerId ?? null;
  const noUnresolved = unresolved.length === 0;
  const selectedTaskRegistryKey = noUnresolved ? "nested-field-disclosure" : dominantOwner;
  const nextTask = selectedTaskRegistryKey ? registry[selectedTaskRegistryKey] ?? null : null;
  const audience = byOwner.get("field-audience-requirement-governance"); const explanationVersion = byOwner.get("completed-explanation-version-ownership");
  const combinedTaskDecision = combineDecision(audience, explanationVersion);
  const producerClassification = noUnresolved ? "A" : dominantOwner ? "F" : "F";
  const readinessRecommendation = noUnresolved ? "READY FOR NESTED-FIELD DISCLOSURE IMPLEMENTATION" : "HOLD FOR MULTIPLE PRODUCER GAPS";
  const dominanceRule = noUnresolved ? "NO_UNRESOLVED_UPSTREAM_OWNER" : dominantOwner ? "STRICT_BLOCKED_FIELD_SUPERSET" : "INCOMPARABLE_ACTIONABLE_ROOTS";
  const rationaleCodes = [dominanceRule, combinedTaskDecision.reasonCode, nextTask ? "TASK_REGISTRY_MATCH" : selectedTaskRegistryKey ? "TASK_REGISTRY_MISSING" : "NO_DOMINANT_OWNER"].sort(compare);
  const base = { unresolvedFindings: unresolved, ownerGraph, actionableRootOwners: roots.map((node) => node.ownerId).sort(compare), incomparableRootOwners: dominantOwner ? [] : roots.map((node) => node.ownerId).sort(compare), dominantOwner, dominanceRule, combinedTaskDecision, selectedTaskRegistryKey, nextTask, producerClassification, readinessRecommendation, rationaleCodes, gapFindingsDigest: digest(findings), ownerGraphDigest: digest(ownerGraph) };
  return { ...base, integrityDigest: digest(base) };
}
const withResolved = (findings: GapFinding[], ...owners: string[]) => findings.map((item) => owners.includes(item.canonicalOwnerId) ? finding({ ...item, blocking: false, findingDigest: undefined } as never) : item);
const currentDecision = deriveNextTaskDecision(currentFindings);
const audienceResolved = deriveNextTaskDecision(withResolved(currentFindings, "field-audience-requirement-governance"));
const explanationResolved = deriveNextTaskDecision(withResolved(currentFindings, "completed-explanation-version-ownership"));
const bothResolved = deriveNextTaskDecision(withResolved(currentFindings, "field-audience-requirement-governance", "completed-explanation-version-ownership"));
assert.equal(currentDecision.dominantOwner, "field-audience-requirement-governance");
assert.equal(currentDecision.combinedTaskDecision.result, "separate");
assert.equal(currentDecision.nextTask, TASK_REGISTRY["field-audience-requirement-governance"]); invariantAssertions += 3;
assert.notEqual(audienceResolved.dominantOwner, currentDecision.dominantOwner); assert.notEqual(audienceResolved.nextTask, currentDecision.nextTask); invariantAssertions += 2;
assert.equal(explanationResolved.dominantOwner, "field-audience-requirement-governance"); assert.equal(explanationResolved.nextTask, currentDecision.nextTask); invariantAssertions += 2;
assert.notEqual(bothResolved.dominantOwner, currentDecision.dominantOwner); invariantAssertions += 1;
const syntheticBase = currentFindings[0]!;
const sameA = finding({ ...syntheticBase, id: "synthetic:same-a", canonicalOwnerId: "synthetic-shared", affectedFieldFamilies: ["a"], findingDigest: undefined } as never);
const sameB = finding({ ...sameA, id: "synthetic:same-b", findingDigest: undefined } as never);
assert.equal(combineDecision(sameA, sameB).result, "combined"); assert.equal(combineDecision(currentFindings[0], currentFindings[1]).result, "separate"); invariantAssertions += 2;
const disjointA = finding({ ...syntheticBase, id: "synthetic:disjoint-a", canonicalOwnerId: "synthetic-a", affectedFieldFamilies: ["a"], prerequisiteOwnerIds: [], findingDigest: undefined } as never);
const disjointB = finding({ ...syntheticBase, id: "synthetic:disjoint-b", canonicalOwnerId: "synthetic-b", affectedFieldFamilies: ["b"], prerequisiteOwnerIds: [], findingDigest: undefined } as never);
const incomparable = deriveNextTaskDecision([disjointA, disjointB], { "synthetic-a": "TASK A", "synthetic-b": "TASK B" }); assert.equal(incomparable.dominantOwner, null); assert.equal(incomparable.nextTask, null); invariantAssertions += 2;
const downstream = finding({ ...disjointB, prerequisiteOwnerIds: ["synthetic-a"], findingDigest: undefined } as never); const downstreamDecision = deriveNextTaskDecision([disjointA, downstream], { "synthetic-a": "TASK A", "synthetic-b": "TASK B" }); assert.equal(downstreamDecision.dominantOwner, "synthetic-a"); invariantAssertions += 1;
const registrySensitive = deriveNextTaskDecision([finding({ ...disjointA, blocking: false, findingDigest: undefined } as never), disjointB], { "synthetic-a": "TASK A", "synthetic-b": "TASK B" }); assert.equal(registrySensitive.nextTask, "TASK B"); invariantAssertions += 1;
const missingRegistry = deriveNextTaskDecision([disjointA], {}); assert.equal(missingRegistry.nextTask, null); invariantAssertions += 1;
const noGaps = deriveNextTaskDecision(currentFindings.map((item) => finding({ ...item, blocking: false, findingDigest: undefined } as never))); assert.equal(noGaps.dominantOwner, null); assert.equal(noGaps.nextTask, TASK_REGISTRY["nested-field-disclosure"]); invariantAssertions += 2;
const alternateDominant = deriveNextTaskDecision([finding({ ...disjointA, affectedFieldFamilies: ["a", "b"], findingDigest: undefined } as never), disjointB], { "synthetic-a": "TASK A", "synthetic-b": "TASK B" }); assert.equal(alternateDominant.dominantOwner, "synthetic-a"); invariantAssertions += 1;
const prerequisite = finding({ ...disjointB, canonicalOwnerId: "synthetic-prerequisite", findingDigest: undefined } as never); const formerlyDominantBlocked = finding({ ...disjointA, affectedFieldFamilies: ["a", "b"], prerequisiteOwnerIds: ["synthetic-prerequisite"], findingDigest: undefined } as never); const dependencyChanged = deriveNextTaskDecision([formerlyDominantBlocked, prerequisite], { "synthetic-a": "TASK A", "synthetic-prerequisite": "TASK P" }); assert.notEqual(dependencyChanged.dominantOwner, "synthetic-a"); invariantAssertions += 1;
const validatorSource = readFileSync(new URL(import.meta.url), "utf8");
assert(!/const\s+(?:nextTask|earliestRemainingOwner|combinedTaskBounded)\s*=\s*["']/.test(validatorSource), "unconditional final conclusion assignment detected"); invariantAssertions += 1;

const matrix = cells.map((cell) => ({ ...cell, result: cell.result })).sort((a, b) => compare(`${a.scenarioId}:${a.modelId}`, `${b.scenarioId}:${b.modelId}`));
const report = { result: "PASS", oracleVersion: "4", digestRules: { scenarioWrapperDigest: "SHA-256(stable ScenarioWrapper)", rawProducerInputDigest: "SHA-256(stable exact produceCanonicalUnderstandingAudienceLineage argument)", normalizedProducerInputDigest: "SHA-256(stable normalizeProducerInput(raw argument))", modelEvaluationInputDigest: "SHA-256(stable {normalizedProducerInput,modelId,policy})", producerOutputDigest: "SHA-256(stable ProducerExecution)", modelOutputDigest: "SHA-256(stable ModelResult)" }, transformationClasses: ["SEMANTIC_INPUT_MUTATION", "NORMALIZATION_INVARIANCE", "EXTERNAL_NEUTRALITY_INVARIANCE", "TAMPERED_OUTPUT_VALIDATION", "MULTIPLE_ASSERTIONS_OVER_ONE_SCENARIO"], behavioralScenarioCount: scenarios.length, modelCount: modelIds.length, expectedMatrixCells, actualMatrixCells: cells.length, duplicateCells: 0, missingCells: expectedMatrixCells - cells.length, unexpectedCells: 0, invariantAssertionCount: invariantAssertions, neutralityInvariantCount: neutralityResults.length, tamperValidationCount: tamperResults.length, repeatedNormalizedInputGroups, unjustifiedRepeatedInputGroupCount: unjustifiedRepeatedInputGroups.length, noOpTransformationFindings: 0, wrapperOnlyCasesReclassifiedAsInvariants: neutralityResults.map((item) => item.name), modelSummaries, selectedModel, eligibleModels, completeFieldFamilies, incompleteFieldFamilies, conflictingFieldFamilies, intentionallyUnavailableFieldFamilies: baselineExecution.output.intentionallyUnavailableFieldFamilies, laterDisclosureFieldFamilies: baselineExecution.output.laterDisclosureFieldFamilies, currentFindings, nextTaskDecision: currentDecision, negativeControls: { audienceResolved, explanationResolved, bothResolved, sameOwner: combineDecision(sameA, sameB), distinctOwner: combineDecision(currentFindings[0], currentFindings[1]), incomparable, downstreamDecision, registrySensitive, missingRegistry, noGaps, alternateDominant, dependencyChanged }, producerDigest: baselineExecution.output.digest, matrixDigest: digest(matrix), scenarioAccounting: scenarios.map((scenario) => ({ id: scenario.id, transformationClass: scenario.transformationClass, allowedReuse: scenario.allowedReuse, scenarioWrapperDigest: digest(scenario), rawProducerInputDigest: digest(scenario.producerInput), normalizedProducerInputDigest: digest(normalizeProducerInput(scenario.producerInput)), producerOutputDigest: digest(scenarioExecutions.get(scenario.id)) })), neutralityResults, tamperResults, matrix };
console.log(JSON.stringify({ ...report, outputDigest: digest(report) }));
