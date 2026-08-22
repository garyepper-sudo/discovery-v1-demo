import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { resolveScopedGovernanceContext, type ScopedGovernanceOperation } from "../../engine/v3/governance/scopedGovernanceContext";
import { createCanonicalEvidenceContributionLineageEnvelope, createCanonicalEvidenceContributionOperationContext, createCanonicalEvidenceScopeAttribution, createCanonicalScopeLineageIndex, createCanonicalScopeTopology, createCanonicalSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import type { CanonicalExplanationGovernanceLineageV1, OrganizationalExplanation } from "../../engine/v3/model/judgment/organizationalJudgment";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION,
  CANONICAL_UNDERSTANDING_REVISION_OPERATION,
  CanonicalOrganizationalUnderstandingRevisionService,
} from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";
import { validateCurrentAccessScenario } from "./validateProductArtifactAuthorizationBeforeBodyRead";
import { assertCanonicalProductMaterializationInstructionIntegrityV1, createCanonicalProductMaterializationInstructionDigestV1, type CanonicalProductMaterializationInstructionV1 } from "../../product/workflow/leadershipConversation/canonicalProductMaterializationContracts";

const stable = (value: unknown): string => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.entries(value as Record<string, unknown>).sort(([a],[b]) => a.localeCompare(b)).map(([key,item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}` : JSON.stringify(value);
const digest = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");

async function validateCompositionEvaluation(): Promise<void> {
  const organizationId = "prepare-again-understanding-evaluation";
  const actorRef = "prepare-again-authorized-actor";
  const questionId = "question:prepare-again";
  const operationId = "contribution-operation:prepare-again";
  const seriesId = "series:prepare-again";
  const occurrenceId = "occurrence:prepare-again";
  const purpose = "organizational-understanding";
  const firstAt = "2026-08-21T12:00:00.000Z";
  const secondAt = "2026-08-21T12:01:00.000Z";
  const scope = { organizationId, type: "organization" as const, id: organizationId };
  const topology = createCanonicalScopeTopology({ organizationId, topologyVersion: 1, effectiveAt: firstAt, nodes: [scope], relationships: [] });
  const binding = createCanonicalSourceScopeBinding({ organizationId, bindingVersion: 1, source: { sourceId: "source:prepare-again", sourceVersion: "1", normalizedContentDigest: "1".repeat(64) }, topology, assertions: [{ relationship: "origin", scope }], basisRefs: ["basis:prepare-again"], effectiveAt: firstAt, sourceType: "authorized-record", purposeRef: purpose, availability: "available" });
  const attribution = createCanonicalEvidenceScopeAttribution({ organizationId, attributionVersion: 1, evidenceId: "canonical-evidence:prepare-again", evidenceAdmissionId: "canonical-admission:prepare-again", bindings: [binding], topology, effectiveAt: firstAt });
  const support = { canonicalEvidenceId: attribution.evidenceId, canonicalAdmissionId: attribution.evidenceAdmissionId, attributionId: attribution.attributionId, attributionRevision: attribution.attributionVersion, attributionDigest: attribution.digest, sourceBindingRefs: [{ sourceBindingId: binding.bindingId, sourceGovernanceRevision: binding.digest }], purposeRefs: [purpose], topologyId: topology.topologyId, originBatchDigest: "2".repeat(64), role: "material" as const };
  const lineageUnsigned = { contractVersion: "canonical-explanation-governance-lineage.v1" as const, organizationId, directMaterialSupports: [support], inheritedMaterialAncestorRefs: [{ derivedArtifactType: "organizational-theory" as const, derivedArtifactId: "theory:prepare-again", derivedArtifactRevisionId: "theory:prepare-again:revision:1", ancestryDigest: "5".repeat(64), supportRole: "material" as const }], materialSupports: [support], topologyIds: [topology.topologyId], purposeRefs: [purpose], operationRefs: [{ contributionOperationId: operationId, questionId, purposeRef: purpose, canonicalOperationResultDigest: "3".repeat(64), envelopeDigest: "4".repeat(64) }], lineagePolicyVersion: "conservative-material-support.v1" as const };
  const lineage: CanonicalExplanationGovernanceLineageV1 = { ...lineageUnsigned, lineageDigest: digest(lineageUnsigned) };
  const explanation: OrganizationalExplanation = { id: "explanation:prepare-again", organizationId, semanticKey: "prepare-again", claim: { scope, rootMechanismIds: ["mechanism:prepare-again"], outcomeRefs: [{ type: "phenomenon", id: "phenomenon:prepare-again" }], causalRelationFamily: "constraint" }, explanationSeedIds: ["seed:prepare-again"], reasoningPathIds: ["path:prepare-again"], mechanismIds: ["mechanism:prepare-again"], beliefIds: [], theoryIds: [], evidenceIds: [attribution.evidenceId], contradictionIds: [], assumptions: [], comparativeEvidenceRoles: [], canonicalGovernanceLineage: lineage, viability: "unadjudicated", uncertainty: [], createdAt: firstAt, updatedAt: firstAt };
  const authorization = (at: string, operations: ScopedGovernanceOperation[] = [CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION]) => resolveScopedGovernanceContext({ organizationId, subjectId: actorRef, requestedScope: scope, operation: CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION, purpose, sensitivity: "standard", evaluatedAt: at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "authority:prepare-again", policyRef: "policy:prepare-again", organizationId, subjectId: actorRef, scope, operations, sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
  const root = await mkdtemp(path.join(os.tmpdir(), "discovery-prepare-again-understanding-"));
  try {
    const repository = new FilesystemOrganizationRuntimeRepository(root);
    const runtime = createEmptyOrganizationRuntime({ organizationId, now: firstAt });
    runtime.memory.canonicalScopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId, topology, sourceBindings: [binding], evidenceAttributions: [attribution] });
    const admissionItem = { contractVersion: "1" as const, canonicalEvidenceId: attribution.evidenceId,
      canonicalAdmissionId: attribution.evidenceAdmissionId, attributionId: attribution.attributionId,
      attributionVersion: attribution.attributionVersion, investigationEvidenceIds: ["evidence:local:prepare-again"],
      sourceBindings: [{ sourceBindingId: binding.bindingId, sourceId: binding.source.sourceId,
        sourceVersion: binding.source.sourceVersion, normalizedContentDigest: binding.source.normalizedContentDigest }],
      disposition: "new-canonical-evidence" as const, attributionDigest: attribution.digest };
    const admissionBatchUnsigned = { contractVersion: "1" as const, organizationId,
      admissions: [admissionItem], admissionDisposition: "admitted" as const };
    const canonicalAdmissionBatch = { ...admissionBatchUnsigned, batchDigest: digest(admissionBatchUnsigned) };
    support.originBatchDigest = canonicalAdmissionBatch.batchDigest;
    lineage.directMaterialSupports[0]!.originBatchDigest = canonicalAdmissionBatch.batchDigest;
    lineage.materialSupports[0]!.originBatchDigest = canonicalAdmissionBatch.batchDigest;
    const requestFingerprint = "8".repeat(64), idempotencyKeyDigest = "9".repeat(64);
    const operationContext = createCanonicalEvidenceContributionOperationContext({ contributionOperationId: operationId,
      organizationId, questionId, purposeRef: purpose, requestFingerprint, idempotencyKeyDigest });
    const lineageEnvelope = createCanonicalEvidenceContributionLineageEnvelope({ context: operationContext,
      admissionBatch: canonicalAdmissionBatch });
    lineage.operationRefs[0]!.envelopeDigest = lineageEnvelope.envelopeDigest;
    lineage.operationRefs[0]!.canonicalOperationResultDigest = lineageEnvelope.canonicalOperationResultDigest;
    const { lineageDigest: _priorLineageDigest, ...updatedLineageUnsigned } = lineage;
    lineage.lineageDigest = digest(updatedLineageUnsigned);
    explanation.canonicalGovernanceLineage = lineage;
    runtime.memory.organizationalExplanations = [structuredClone(explanation)];
    const body = { contractVersion: "1" as const, organizationId, semanticOwner: "leadership-conversation" as const,
      artifactType: "what-changed" as const, artifactId: "what-changed:prepare-again", artifactRevision: "1",
      bodyId: "body:prepare-again", exactBodyDigest: "a".repeat(64), byteLength: 1,
      mediaType: "application/json" as const, schemaRef: "schema:what-changed:v1", refDigest: "b".repeat(64) };
    const headerUnsigned = { integrationReceiptId: "integration-receipt:prepare-again", artifactRevision: "1",
      productWorkflowId: "leadership-conversation:prepare-again", creationEnvelopeDigest: "c".repeat(64),
      materialReferencesDigest: "d".repeat(64), protectedBody: body, ownerStageReceiptDigest: "e".repeat(64) };
    const whatChangedEnvelope = { ...headerUnsigned, headerDigest: digest(headerUnsigned) };
    const instructionUnsigned = { contractVersion: "1" as const, instructionId: "instruction:prepare-again",
      organizationId, questionId, conversationId: occurrenceId, proposalId: "proposal:prepare-again",
      canonicalOperationId: operationId, requestFingerprint, idempotencyKeyDigest, actorRef,
      evaluatedAt: firstAt, authorityRevisionRefs: ["authority:prepare-again"], policyRevisionRefs: ["policy:prepare-again"],
      expectedRuntimeRevision: "runtime:before", committedRuntimeStateDigest: "f".repeat(64),
      canonicalUnderstandingBeforeRef: "understanding:before", canonicalUnderstandingAfterRef: "understanding:after",
      canonicalChangeResultId: "change:prepare-again", canonicalChangeResultDigest: "1".repeat(64),
      governedProductInputDigest: "2".repeat(64), lineagePolicyVersion: "lineage:v1",
      materialReferences: [attribution.evidenceId, attribution.evidenceAdmissionId, attribution.attributionId].sort(),
      materialEnvelopeDigest: "3".repeat(64), whatChangedIntent: "materialize" as const,
      whatChangedArtifactId: body.artifactId, whatChangedEnvelope,
      whatChangedEnvelopeDigest: digest(whatChangedEnvelope),
      draftMaterialization: { contractVersion: "1" as const, required: false as const, draftId: null,
        draftEnvelopeDigest: null, requestFingerprint: null, idempotencyKeyDigest: null, payload: null },
      targetProductWorkflowId: "leadership-conversation:prepare-again" };
    const instruction = { ...instructionUnsigned,
      instructionDigest: createCanonicalProductMaterializationInstructionDigestV1(instructionUnsigned) };
    const operationUnsigned = { kind: "canonical-evidence-contribution-operation", contractVersion: "1",
      contributionOperationId: operationId, organizationId, questionId,
      idempotencyKeyDigest: instruction.idempotencyKeyDigest, requestFingerprint: instruction.requestFingerprint,
      canonicalAdmissionBatch, lineageEnvelopeDigest: lineageEnvelope.envelopeDigest, evidenceAccepted: true,
      productQuestionRevisionBefore: 1, productQuestionRevisionAfter: 2,
      productMaterializationInstruction: instruction, recordedAt: firstAt };
    runtime.memory.events.push({ ...operationUnsigned, recordDigest: digest(operationUnsigned) });
    const created = await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(runtime, null, 2)), { requestId: "create", operatorId: actorRef });
    let now = firstAt;
    const service = new CanonicalOrganizationalUnderstandingRevisionService(repository, { now: () => now }, { validateMaterializationInstruction: (input) => assertCanonicalProductMaterializationInstructionIntegrityV1(input as CanonicalProductMaterializationInstructionV1), resolveCurrent: async () => ({ seriesId, occurrenceId, contributionOperationId: operationId, instructionDigest: instruction.instructionDigest, receiptId: "materialization-receipt:prepare-again", receiptDigest: "7".repeat(64), sourceContentVersions: [{ sourceBindingId: binding.bindingId, sourceContentVersionId: "source-content-version:prepare-again", normalizedContentDigest: binding.source.normalizedContentDigest }] }) });
    const request = { contractVersion: "1" as const, organizationId, questionId, seriesId, occurrenceId, contributionOperationId: operationId, purpose, sensitivity: "standard" as const, actorRef, occurredAt: firstAt, idempotencyKey: "evaluation:changed", expectedRuntimeRevision: created.revision, authorization: authorization(firstAt), operation: { requestId: "evaluation:changed", operatorId: actorRef } };
    const changed = await service.evaluateComposition(request);
    assert.ok(changed.receipt);
    assert.equal(changed.receipt.disposition, "changed");
    assert.equal(changed.receipt.resultingCompositionRefs.length, 1);
    assert.equal((await service.evaluateComposition(request)).idempotent, true);
    const afterChanged = (await repository.read(organizationId))!;
    assert.equal(afterChanged.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.length, 1);
    assert.equal(afterChanged.runtime.memory.organizationalExplanations.length,1);
    assert.equal(afterChanged.runtime.memory.events.some((item) => Boolean(item && typeof item === "object" && (item as { kind?: string }).kind === "canonical-understanding-composition-evaluation-receipt")), false);
    now = secondAt;
    const noChangeRequest = { ...request, occurredAt: secondAt, idempotencyKey: "evaluation:no-change", expectedRuntimeRevision: afterChanged.revision, authorization: authorization(secondAt), operation: { requestId: "evaluation:no-change", operatorId: actorRef } };
    const noChange = await service.evaluateComposition(noChangeRequest);
    assert.ok(noChange.receipt);
    assert.equal(noChange.receipt.disposition, "no_change");
    assert.deepEqual(noChange.receipt.resultingCompositionRefs, changed.receipt.resultingCompositionRefs);
    assert.equal((await service.evaluateComposition(noChangeRequest)).idempotent, true);
    const persisted = (await repository.read(organizationId))!;
    assert.equal(persisted.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.length, 1);
    assert.equal(persisted.runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationOperations?.length, 2);
    assert.equal(persisted.runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationReceipts?.length, 2);
    await assert.rejects(() => service.evaluateComposition({ ...noChangeRequest, questionId: "different" }));
    await assert.rejects(() => service.evaluateComposition({ ...noChangeRequest, idempotencyKey: "evaluation:stale", expectedRuntimeRevision: created.revision, operation: { requestId: "evaluation:stale", operatorId: actorRef } }));
    assert.equal(authorization(secondAt, [CANONICAL_UNDERSTANDING_REVISION_OPERATION]).disposition, "denied");
    const evaluationOnly = authorization(secondAt);
    await assert.rejects(() => service.revise({ contractVersion: "1", organizationId, questionId, stableUnderstandingId: changed.receipt.resultingCompositionRefs[0]!.compositionId, expectedPredecessorRevisionId: changed.receipt.resultingCompositionRefs[0]!.revisionId, confidence: .5, uncertainty: [], supportingMaterialRefs: [attribution.evidenceId], contradictingMaterialRefs: [], interpretationVersion: "validation:v1", purpose, sensitivity: "standard", actorRef, occurredAt: secondAt, idempotencyKey: "forbidden-confidence", expectedRuntimeRevision: persisted.revision, authorization: evaluationOnly, operation: { requestId: "forbidden-confidence", operatorId: actorRef } }));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  await validateCurrentAccessScenario("prepare-again-current-access");
  await validateCompositionEvaluation();
  console.log("Prepare Again current access and canonical Understanding evaluation: PASS");
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
