import { createHash } from "node:crypto";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { runOrganizationInvestigation } from "../../v3/investigation/runOrganizationInvestigation";
import { createCanonicalScopeTopology, createCanonicalSourceScopeBinding } from "../../v3/governance/canonicalScopeLineage";
import { discloseCanonicalOrganizationalUnderstanding } from "../../v3/understanding/discloseCanonicalOrganizationalUnderstanding";
import { compileOrganizationalUnderstandingProjection, ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION } from "../../v3/projection/organizationalUnderstandingProjection";
import type { ChiefPreparationMaterialResolverV1, ChiefPreparationMaterialResolutionInputV1 } from "../../../product/integration/chiefLeadershipPreparationComposer";
import type { ChiefClaimSupportTraceV1 } from "../../../product/integration/chiefLeadershipPreparationClaimSupport";
import type { ChiefV1CognitionScenarioExecutionInputV1, BoundaryTraceV1, PermissionCase } from "./contracts";
import { mapDisclosedCognitionToPreparationMaterial } from "./disclosedCognitionMaterialMapper";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const contentHash = (value: string) => createHash("sha256").update(value).digest("hex");
const normalized = (value: string) => value.normalize("NFKC").replace(/\s+/gu, " ").trim();

export async function assertTaskOwnedRuntimeRoot(runtimeRoot: string) {
  const base = path.resolve(process.env.DISCOVERY_CHIEF_V1_BENCHMARK_ROOT ?? "/tmp/discovery-chief-v1-current-baseline-cognition-001");
  const candidate = path.resolve(runtimeRoot);
  if (!candidate.startsWith(`${base}${path.sep}`)) throw new Error("Retained Runtime is prohibited.");
  const stat = await lstat(candidate);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("Runtime root is unsafe.");
  const [actual, actualBase] = await Promise.all([realpath(candidate), realpath(base)]);
  if (!actual.startsWith(`${actualBase}${path.sep}`)) throw new Error("Runtime root escaped benchmark ownership.");
}

export class CanonicalCognitionMaterialResolver implements ChiefPreparationMaterialResolverV1 {
  trace: Omit<BoundaryTraceV1, "materialDigest" | "viewDigest"> | null = null;
  claimSupportTrace: ChiefClaimSupportTraceV1 | null = null;
  constructor(private execution: ChiefV1CognitionScenarioExecutionInputV1, private runtimeRoot: string, private permissionCase: PermissionCase) {}
  async resolve(_input: ChiefPreparationMaterialResolutionInputV1) {
    await assertTaskOwnedRuntimeRoot(this.runtimeRoot);
    if (!["director", "manager"].includes(this.permissionCase)) throw new Error("Benchmark cognition access denied.");
    const organizationId = this.execution.organizationId;
    const scope = { organizationId, type: "organization" as const, id: organizationId };
    const effectiveAt = this.execution.sources.map(item => item.observedAt!).sort().at(-1)!;
    const topology = createCanonicalScopeTopology({ organizationId, topologyVersion: 1, effectiveAt: "2026-06-01T00:00:00.000Z", nodes: [{ ...scope, label: "Synthetic benchmark organization" }], relationships: [] });
    const selected = this.permissionCase === "manager" ? this.execution.sources.slice(0, 1) : this.execution.sources;
    const sources = selected.map(source => { const content = normalized(source.content); return { ...source, content, contentDigest: contentHash(content) }; });
    const bindings = sources.map(source => createCanonicalSourceScopeBinding({ organizationId, bindingVersion: 1, source: { sourceId: source.sourceId, sourceVersion: "1", normalizedContentDigest: source.contentDigest }, topology, assertions: [{ relationship: "applies-to", scope }], basisRefs: [`benchmark-execution:${this.execution.scenarioId}`], effectiveAt: source.observedAt!, sourceType: "authorized-record", purposeRef: `product-question:${this.execution.questionId}`, availability: "available" }));
    process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY = this.runtimeRoot;
    const result = runOrganizationInvestigation({ organizationId, company: `Organization ${organizationId}`, website: "https://benchmark.invalid", industry: "Benchmark", question: this.execution.question, context: "", evidenceSources: sources, investigationRequestId: this.execution.executionKey, scopeLineage: { organizationId, effectiveAt, topologyRevisions: [topology], sourceBindingRevisions: bindings } });
    const memory = result.runtime.memory as any;
    const compositions = memory.organizationalUnderstandingState?.canonicalCompositions ?? [];
    const decision = { id: `benchmark-disclosure:${this.execution.scenarioId}:${this.permissionCase}`, organizationId, consumerId: this.execution.principal.userId, disposition: "eligible" as const, effectiveAt, basis: ["authorized isolated benchmark scope"] };
    const disclosure = discloseCanonicalOrganizationalUnderstanding({ organizationId, consumerId: this.execution.principal.userId, decision, compositions });
    const projection = compileOrganizationalUnderstandingProjection({ context: { organizationId, consumerId: this.execution.principal.userId, experience: "communication", generatedAt: effectiveAt, contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION }, disclosure, compositions, explanations: memory.organizationalExplanations ?? [], conditions: memory.organizationalConditions ?? [], organizationalState: memory.organizationalState, uncertainty: memory.organizationalUncertainty, investigations: memory.investigationOpportunities ?? [], evolution: [] });
    if (disclosure.disposition !== "eligible") throw new Error("Benchmark cognition disclosure denied.");
    const communication = memory.executiveCommunication;
    if (!communication) throw new Error("Canonical Executive Communication is unavailable.");
    this.claimSupportTrace = {
      organizationId,
      authorizedScope: this.permissionCase === "manager" ? "team" : this.execution.principal.scope,
      authorization: "eligible",
      evidence: (result.result.evidence ?? []).map(item => ({ evidenceId: item.id, sourceRef: item.sourceId ?? item.source, text: item.text })),
      explanations: (memory.organizationalExplanations ?? []).map((item: any) => ({ explanationId: item.id, organizationId: item.organizationId, scope: item.claim?.scope?.type ?? "organization", evidenceIds: [...(item.evidenceIds ?? [])].sort(), reasoningPathIds: [...(item.reasoningPathIds ?? [])].sort(), mechanismIds: [...(item.mechanismIds ?? [])].sort(), beliefIds: [...(item.beliefIds ?? [])].sort(), theoryIds: [...(item.theoryIds ?? [])].sort(), outcomeRefs: (item.claim?.outcomeRefs ?? []).map((ref: any) => `${ref.type}:${ref.id}`).sort() })),
    };
    const mapped = mapDisclosedCognitionToPreparationMaterial({ organizationId, questionId: this.execution.questionId, projectionId: projection.projectionId, sourceRefs: sources.map(item => item.sourceId), communication, projection, disclosureDisposition: "eligible", dependenceStatus: "unavailable" });
    this.trace = { canonicalOwnerInvoked: true, authorizationBeforeRuntime: true, disclosureBeforeMapping: true, dependenceStatus: "unavailable", cognitionDigest: hash(result.result), disclosedDigest: hash(projection), relationships: (result.result.evidenceRelationships ?? []).map(item => item.type).sort(), sourceObservedAt: sources.map(item => item.observedAt!).sort(), confidenceLift: result.result.propagatedConfidence?.summary.confidenceLift ?? 0, protectedLoads: 0, disclosures: 1 };
    return mapped;
  }
}
