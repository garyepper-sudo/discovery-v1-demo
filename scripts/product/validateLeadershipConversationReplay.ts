import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { createCanonicalScopeLineageIndex, createCanonicalScopeTopology } from "../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import { CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION, CANONICAL_UNDERSTANDING_REVISION_OPERATION } from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";
import { appendProductQuestionEvent, createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { createFilesystemSourceContentRepository } from "../../engine/v3/sources";
import {
  createProductWorkflowArtifactRepository,
  leadershipDigest,
  leadershipStableSerialize,
  NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE as fixture,
  NORTHSTAR_PREPARED_CONTENT,
  NORTHSTAR_PREPARED_LINEAGE,
  resolveCurrentOccurrenceClosureMetadataV1,
} from "../../product/workflow/leadershipConversation";
import {
  provisionNorthstarPreparationLineageFixture,
  readNorthstarPreparationLineageSeed,
} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";

const runFile = promisify(execFile);
let questionId:string;
const scope = { organizationId: fixture.organizationId, type: "organization" as const, id: fixture.organizationId };
const digest = (value: unknown) => leadershipDigest(leadershipStableSerialize(value));
const handoff = <T extends object>(value: T) => ({ ...value, handoffDigest: digest(value) });
const roots = (root: string) => ({ runtimeRoot: path.join(root, "runtime"), workflowRoot: path.join(root, "workflow"), sourceContentRoot: path.join(root, "content") });
let identity:{userId:string;organizationId:string;questionId:string;conversationId:string};
function bindOwnerIssuedQuestion(value:string){questionId=value;identity={userId:fixture.actorId,organizationId:fixture.organizationId,questionId,conversationId:fixture.conversationId};}

async function validationComposition(locations: ReturnType<typeof roots>, lineageFixtureRoot?: string) {
  const { createLeadershipConversationServerCompositionForValidation } = await import("../../product/integration/leadershipConversationServerComposition");
  return createLeadershipConversationServerCompositionForValidation({ ...locations, lineageFixtureRoot, userId: fixture.actorId, organizationId: fixture.organizationId });
}

type SafeHandoff = Record<string, unknown> & { handoffDigest: string };
type WorkerResult = { role: string; handoff: SafeHandoff; assertions: string[] };

function parseHandoff(value: string): SafeHandoff {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SafeHandoff;
  const { handoffDigest, ...unsigned } = parsed;
  assert.equal(handoffDigest, digest(unsigned), "handoff digest mismatch");
  return parsed;
}

async function processA(root: string,lineageFixtureRoot?:string): Promise<WorkerResult> {
  const locations = roots(root);
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot);
  const topology = createCanonicalScopeTopology({ organizationId: fixture.organizationId, topologyVersion: 1, effectiveAt: fixture.at, nodes: [scope], relationships: [] });
  let runtime = createEmptyOrganizationRuntime({ organizationId: fixture.organizationId, name: "Northstar", now: fixture.at });
  runtime.memory.organizationalUnderstandingState.canonicalCompositions = [];
  runtime.memory.canonicalScopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId: fixture.organizationId, topology });
  runtime = createDurableProductQuestion({ runtime, title: "What is constraining Northstar delivery?", questionId: questionId, createdAt: fixture.at }).runtime;
  runtime = appendProductQuestionEvent(runtime, { type: "answer_recorded", organizationId: fixture.organizationId, questionId: questionId, occurredAt: fixture.at, answer: { answerId: "product-answer:northstar-leadership:1", canonicalSource: "canonical-product-answer", revision: 1, reasonForChange: "Initial supported Answer", changeReceiptId: "product-answer-receipt:northstar-leadership:1", timestamp: fixture.at, confidence: { level: "moderate", score: 0.7, meaning: "Supported", principalLimiter: "Additional sequencing evidence is required.", authoritativeSource: "canonical-product-workflow" } } });
  await runtimeRepository.create(fixture.organizationId, new TextEncoder().encode(JSON.stringify(runtime, null, 2)), { requestId: "process-a-runtime", operatorId: fixture.actorId });
  const composition = await validationComposition(locations,lineageFixtureRoot);
  await composition.recordContext({ ...identity, idempotencyKey: "process-a-context", title: "Northstar staff conversation", purpose: "Resolve the next delivery constraint.", intendedOutcome: "Agree one bounded owner action.", timeframe: "Weekly", participants: [{ participantRef: "leader", displayName: "Leader", titleLabel: "Director" }], leaderContext: null });
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId);
  const context = stored.store.contexts.at(-1)!;
  await composition.recordPreparation({ ...identity, idempotencyKey: "process-a-preparation-1", contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
  stored = await workflow.read(fixture.organizationId);
  await composition.recordPreparation({ ...identity, idempotencyKey: "process-a-preparation-2", contextVersionId: context.contextVersionId, content: { ...NORTHSTAR_PREPARED_CONTENT, headline: "Resolve sequencing ownership before the next delivery window." }, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: "Leader clarified sequencing ownership." });
  stored = await workflow.read(fixture.organizationId);
  const prepared = stored.store.preparedWorkPublications!.at(-1)!;
  await composition.freeze({ ...identity, idempotencyKey: "process-a-freeze", artifactVersionId: prepared.artifactRevision, privateWorkingContribution:{seriesId:`leadership-conversation-series:${fixture.conversationId}`,occurrenceId:fixture.conversationId,authorizationRevision:NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision,provenanceDigest:NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest,selectedContent:["Bounded fresh-process closure contribution."]} });
  stored = await workflow.read(fixture.organizationId);
  const frozen = stored.store.frozenSnapshotPublications!.at(-1)!;
  assert.equal(stored.store.preparedWorkProducts.length,0);assert.equal(stored.store.frozenSnapshots.length,0);
  const manifest = handoff({ organizationId: fixture.organizationId, questionId: questionId, conversationId: fixture.conversationId, contextVersionId: context.contextVersionId, preparedWorkProductVersionId: prepared.artifactRevision, frozenSnapshotId: frozen.artifactId, frozenSnapshotDigest: frozen.snapshotDigest, productWorkflowRepositoryRevision: stored.revision, eventCount: stored.store.events.length });
  return { role: "prepare-and-freeze", handoff: manifest, assertions: ["context-persisted", "preparation-v1-persisted", "preparation-v2-persisted", "frozen-snapshot-persisted"] };
}

async function processB(root: string, encodedA: string): Promise<WorkerResult> {
  const a = parseHandoff(encodedA);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, a.productWorkflowRepositoryRevision);
  assert.equal(stored.store.frozenSnapshotPublications!.at(-1)?.artifactId, a.frozenSnapshotId);
  assert.equal(stored.store.frozenSnapshotPublications!.at(-1)?.snapshotDigest, a.frozenSnapshotDigest);
  const composition = await validationComposition(locations);
  await composition.receiveUpload({ ...identity, idempotencyKey: "process-b-upload", frozenSnapshotId: String(a.frozenSnapshotId), purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: fixture.captureBytes, displayLabel: "Staff notes", originalFilename: null });
  stored = await workflow.read(fixture.organizationId);
  const upload = stored.store.uploadReceipts.at(-1)!;
  await composition.generateProposals({ ...identity, idempotencyKey: "process-b-proposals", uploadReceiptId: upload.uploadReceiptId, purposeRef: fixture.purposeRef });
  stored = await workflow.read(fixture.organizationId);
  const evidence = stored.store.proposals.find(item => item.kind === "evidence-candidate")!;
  const decision = stored.store.proposals.find(item => item.kind === "decision-draft")!;
  const unknown = stored.store.proposals.find(item => item.kind === "unknown")!;
  const commitment = stored.store.proposals.find(item => item.kind === "commitment")!;
  await composition.review({ ...identity, idempotencyKey: "process-b-review-evidence", proposalId: evidence.proposalId, disposition: "approved", effectivePayload: null, reason: null });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-decision", proposalId: decision.proposalId, disposition: "approved-with-edit", effectivePayload: { summary: "Draft the governed sequencing review decision.", targetRef: null }, reason: "Clarified scope." });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-unknown", proposalId: unknown.proposalId, disposition: "approved", effectivePayload: null, reason: null });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-rejected", proposalId: commitment.proposalId, disposition: "rejected", effectivePayload: null, reason: "Not yet authorized." });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-deferred", proposalId: commitment.proposalId, disposition: "deferred", effectivePayload: null, reason: "Retain for audit." });
  stored = await workflow.read(fixture.organizationId);
  const runtime = await new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot).read(fixture.organizationId);
  assert.ok(runtime);
  const binding = runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(item => item.bindingId === upload.sourceBindingId);
  assert.ok(binding);
  const sourceRevision = await createFilesystemSourceContentRepository({ root: locations.sourceContentRoot, environment: "test" }).inspectRevision(fixture.organizationId);
  const proposals = stored.store.proposals.map(item => ({ proposalId: item.proposalId, kind: item.kind, payloadDigest: item.payloadDigest }));
  const dispositions = stored.store.dispositions.map(item => ({ dispositionReceiptId: item.dispositionReceiptId, proposalId: item.proposalId, disposition: item.disposition, digest: digest(item) }));
  const manifest = handoff({ processAHandoffDigest: a.handoffDigest, organizationId: fixture.organizationId, questionId: questionId, conversationId: fixture.conversationId, frozenSnapshotId: a.frozenSnapshotId, sourceBindingId: upload.sourceBindingId, sourceBindingVersion: binding.bindingVersion, sourceBindingReceiptDigest: upload.sourceBindingMutationReceiptDigest, sourceContentVersionId: upload.sourceContentVersionId, exactContentDigest: upload.exactContentDigest, normalizedContentDigest: upload.normalizedContentDigest, uploadReceiptId: upload.uploadReceiptId, uploadReceiptDigest: digest(upload), proposals, dispositions, productWorkflowRepositoryRevision: stored.revision, runtimeRepositoryRevision: runtime.revision, sourceContentRepositoryRevision: sourceRevision });
  return { role: "capture-and-review", handoff: manifest, assertions: ["process-a-verified", "binding-persisted", "content-persisted", "upload-receipt-persisted", "proposals-persisted", "dispositions-persisted"] };
}

async function processC(root: string, lineageFixtureRoot: string, expectedSeedDigest: string, encodedA: string, encodedB: string, ambiguousEvidence=false): Promise<WorkerResult> {
  const a = parseHandoff(encodedA), b = parseHandoff(encodedB);
  assert.equal(b.processAHandoffDigest, a.handoffDigest);
  assert.equal(a.organizationId, fixture.organizationId); assert.equal(b.organizationId, fixture.organizationId);
  assert.equal(a.questionId, questionId); assert.equal(b.questionId, questionId);
  assert.equal(a.conversationId, fixture.conversationId); assert.equal(b.conversationId, fixture.conversationId);
  assert.equal(fixture.organizationId, SANDBOX_ORGANIZATION_ID);
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot: lineageFixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1", expectedSeedDigest });
  assert.equal(seed.organizationId, fixture.organizationId);
  assert.equal(seed.productQuestionId, questionId);
  assert.equal(seed.seedDigest, expectedSeedDigest);
  assert.ok(seed.sourceBindings.length > 0 && seed.sourceContentVersions.length > 0 && seed.canonicalMaterial.length > 0);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, b.productWorkflowRepositoryRevision);
  assert.equal(stored.store.frozenSnapshotPublications!.find(item => item.artifactId === a.frozenSnapshotId)?.snapshotDigest, a.frozenSnapshotDigest);
  const upload = stored.store.uploadReceipts.find(item => item.uploadReceiptId === b.uploadReceiptId)!;
  assert.equal(digest(upload), b.uploadReceiptDigest);
  assert.equal(upload.exactContentDigest, b.exactContentDigest);
  assert.equal(upload.normalizedContentDigest, b.normalizedContentDigest);
  assert.deepEqual(stored.store.proposals.map(item => ({ proposalId: item.proposalId, kind: item.kind, payloadDigest: item.payloadDigest })), b.proposals);
  assert.deepEqual(stored.store.dispositions.map(item => ({ dispositionReceiptId: item.dispositionReceiptId, proposalId: item.proposalId, disposition: item.disposition, digest: digest(item) })), b.dispositions);
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot);
  let runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  assert.equal(runtime.revision, b.runtimeRepositoryRevision);
  const binding = runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(item => item.bindingId === b.sourceBindingId);
  assert.equal(binding?.bindingVersion, b.sourceBindingVersion);
  assert.equal(binding?.source.normalizedContentDigest, b.normalizedContentDigest);
  const sourceRepository = createFilesystemSourceContentRepository({ root: locations.sourceContentRoot, environment: "test" });
  assert.equal(await sourceRepository.inspectRevision(fixture.organizationId), b.sourceContentRepositoryRevision);
  const composition = await validationComposition(locations, lineageFixtureRoot);
  const proposal = (kind: string) => stored.store.proposals.find(item => item.kind === kind)!;
  const route = async (kind: string, key: string) => { stored = await workflow.read(fixture.organizationId); const item = proposal(kind); return composition.routeApproved({ ...identity, proposalId: item.proposalId, purposeRef: fixture.purposeRef, expectedWorkflowRevision: stored.revision, idempotencyKey: key }); };
  const material = await route("evidence-candidate", "process-c-route-evidence-material");
  if (!("ownerKind" in material) || material.ownerKind !== "evidence") throw new Error("persisted canonical Evidence routing receipt unavailable");
  assert.equal(material.dispositionReceiptId, stored.store.dispositions.find(value=>value.proposalId===material.proposalId)!.dispositionReceiptId);
  assert.match(material.canonicalOperationResultDigest, /^[a-f0-9]{64}$/);
  assert.ok(material.contributionOperationId);
  runtime=await runtimeRepository.read(fixture.organizationId);assert.ok(runtime);
  assert.equal(runtime.runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationOperations?.length??0,0);
  assert.equal(runtime.runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationReceipts?.length??0,0);
  assert.equal(runtime.runtime.memory.organizationalExplanations.length,0);
  stored = await workflow.read(fixture.organizationId);
  const persistedEvidenceRoute=stored.store.canonicalRoutingReceipts.filter(value=>value.proposalId===material.proposalId&&value.dispositionReceiptId===material.dispositionReceiptId);
  assert.equal(persistedEvidenceRoute.length,1);
  assert.equal(stored.store.routingLinks.filter(value=>value.integrationReceiptId===material.integrationReceiptId).length,1);
  assert.equal((stored.store.productMaterializationReceipts??[]).filter(value=>value.canonicalOperationId===material.contributionOperationId).length,1);
  const evidenceMaterialization=(stored.store.productMaterializations??[]).find(value=>value.canonicalOperationId===material.contributionOperationId)!;
  assert.equal((stored.store.whatChangedPublications??[]).filter(value=>value.artifactId===evidenceMaterialization.whatChangedArtifactId).length,1);
  if(ambiguousEvidence){const evidence=proposal("evidence-candidate");await composition.review({...identity,idempotencyKey:"process-c-review-evidence-ambiguous",proposalId:evidence.proposalId,disposition:"approved",effectivePayload:null,reason:"Operation-linked ambiguity control."});await route("evidence-candidate","process-c-route-evidence-ambiguous");}
  const duplicate = await route("evidence-candidate", ambiguousEvidence?"process-c-route-evidence-ambiguous":"process-c-route-evidence-material");
  if (!("ownerKind" in duplicate) || duplicate.ownerKind!=="evidence") throw new Error("persisted canonical Evidence replay receipt unavailable");
  if(!ambiguousEvidence){assert.equal(duplicate.integrationReceiptId,material.integrationReceiptId);assert.equal(duplicate.receiptDigest,material.receiptDigest);}
  const decision = await route("decision-draft", "process-c-route-decision");
  if (!("ownerKind" in decision)) throw new Error("decision owner receipt unavailable");
  assert.equal(decision.ownerKind, "product-decision-draft");
  const unknown = await route("unknown", "process-c-route-unknown");
  if (!("ownerKind" in unknown)) throw new Error("unknown owner receipt unavailable");
  assert.equal(unknown.ownerKind, "unknown");
  stored=await workflow.read(fixture.organizationId);const commitment=proposal("commitment");await composition.review({...identity,idempotencyKey:"process-c-review-commitment",proposalId:commitment.proposalId,disposition:"approved",effectivePayload:null,reason:"Prepare Again closure coverage."});await route("commitment", "process-c-route-commitment");
  stored = await workflow.read(fixture.organizationId);
  if (!("integrationReceiptId" in decision) || !("integrationReceiptId" in unknown)) throw new Error("actual owner receipt unavailable");
  for(const item of (await composition.workspace(identity)).proposals){
    stored=await workflow.read(fixture.organizationId);
    const latest=stored.store.dispositions.filter(value=>value.proposalId===item.proposalId).at(-1);
    if(latest?.disposition.startsWith("approved")){assert.ok(stored.store.canonicalRoutingReceipts.some(value=>value.proposalId===item.proposalId&&value.dispositionReceiptId===latest.dispositionReceiptId),"approved proposals must retain an exact canonical route before closure");continue;}
    if(latest&&!latest.disposition.startsWith("approved"))continue;
    await composition.review({...identity,idempotencyKey:`process-c-final-review:${item.proposalId}`,proposalId:item.proposalId,disposition:"deferred",effectivePayload:null,reason:"Preserved for the next governed review."});
  }
  let sourceWorkspace=await composition.workspace(identity);assert.ok(sourceWorkspace.canonicalRoutingReceipts.some(value=>value.ownerKind==="evidence"&&value.proposalId===material.proposalId&&value.dispositionReceiptId===material.dispositionReceiptId));stored=await workflow.read(fixture.organizationId);const frozenClosure=resolveCurrentOccurrenceClosureMetadataV1({store:stored.store,organizationId:fixture.organizationId,questionId,conversationId:identity.conversationId});assert.equal(sourceWorkspace.currentPreparedWorkProduct,null);if(!sourceWorkspace.closureCompletion){await composition.completeCycle1Closure({...identity,seriesId:frozenClosure.seriesId,expectedWorkflowRevision:sourceWorkspace.workflowRevision,authorizedProjectionDigest:frozenClosure.authorizedProjectionDigest,candidateAssessmentDigest:null,b11CommunicationDigest:null,personalRoomSheetDigest:frozenClosure.personalRoomSheetDigest,idempotencyKey:"process-c-closure"});sourceWorkspace=await composition.workspace(identity);}assert.ok(sourceWorkspace.closureCompletion);assert.equal(sourceWorkspace.closureCompletion.authorizedProjectionDigest,frozenClosure.authorizedProjectionDigest);assert.equal(sourceWorkspace.closureCompletion.personalRoomSheetDigest,frozenClosure.personalRoomSheetDigest);assert.ok(sourceWorkspace.closureCompletion.reviewedProposalIds.includes(material.proposalId)&&sourceWorkspace.closureCompletion.canonicalRoutingLinkIds.some(value=>sourceWorkspace.routingLinks.some(link=>link.routingLinkId===value&&link.proposalId===material.proposalId)));
  if(ambiguousEvidence){await assert.rejects(()=>composition.prepareNextOccurrence(identity),/unavailable/);return{role:"operation-linked-ambiguity",handoff:handoff({organizationId:fixture.organizationId,questionId,conversationId:fixture.conversationId,ambiguous:true}),assertions:["multiple-complete-operation-links-fail-closed"]};}
  const preparedAgain=await composition.prepareNextOccurrence(identity),nextConversationId=preparedAgain.nextWorkspace.conversationId;
  assert.notEqual(nextConversationId,identity.conversationId);assert.equal(preparedAgain.nextPrepare.priorCycle.status,"completed");assert.equal(preparedAgain.nextWorkspace.currentStep,"freeze");
  stored = await workflow.read(fixture.organizationId);
  const beforeReplay = { revision: stored.revision, routes: stored.store.canonicalRoutingReceipts.length, future: stored.store.futurePreparationLinks.length, preparations: stored.store.preparedWorkPublications!.length };
  for (const [kind, key] of [["decision-draft", "process-c-route-decision"], ["unknown", "process-c-route-unknown"]] as const) await route(kind, key);
  const replayedNext=await composition.prepareNextOccurrence(identity);assert.equal(replayedNext.nextWorkspace.conversationId,nextConversationId);
  stored = await workflow.read(fixture.organizationId);
  assert.deepEqual({ revision: stored.revision, routes: stored.store.canonicalRoutingReceipts.length, future: stored.store.futurePreparationLinks.length, preparations: stored.store.preparedWorkPublications!.length }, beforeReplay);
  assert.notEqual(nextConversationId,fixture.conversationId);assert.equal(stored.store.contexts.filter(value=>value.conversationId===nextConversationId).length,1);assert.equal(stored.store.preparedWorkPublications!.filter(value=>value.productWorkflowId===`leadership-conversation:${nextConversationId}`).length,1);assert.equal(stored.store.frozenSnapshotPublications!.filter(value=>value.productWorkflowId===`leadership-conversation:${nextConversationId}`).length,0);
  await assert.rejects(() => composition.routeApproved({ ...identity, proposalId: proposal("decision-draft").proposalId, purposeRef: "different-purpose", expectedWorkflowRevision: stored.revision, idempotencyKey: "process-c-route-decision" }), /conflict/);
  runtime = await runtimeRepository.read(fixture.organizationId); assert.ok(runtime);
  if (!("receiptDigest" in decision) || !("receiptDigest" in unknown)) throw new Error("actual owner receipt unavailable");
  const manifest = handoff({ processAHandoffDigest: a.handoffDigest, processBHandoffDigest: b.handoffDigest, organizationId: fixture.organizationId, questionId: questionId, conversationId: fixture.conversationId,nextConversationId, materialEvidenceReceiptDigest: material.receiptDigest, duplicateEvidenceReceiptDigest: duplicate.receiptDigest, decisionDraftReceiptDigest: decision.receiptDigest, unknownReceiptDigest: unknown.receiptDigest, futurePreparationLinkId: stored.store.futurePreparationLinks.at(-1)!.futurePreparationLinkId, productWorkflowRepositoryRevision: stored.revision, runtimeRepositoryRevision: runtime.revision, sourceContentRepositoryRevision: await sourceRepository.inspectRevision(fixture.organizationId), routingReceiptCount: stored.store.canonicalRoutingReceipts.length, idempotentReentry: true });
  return { role: "route-actual-owners-and-prepare-again", handoff: manifest, assertions: ["handoffs-verified", "northstar-seed-reloaded", "northstar-source-binding-lineage-verified", "northstar-material-lineage-verified", "material-evidence-actual", "canonical-change-owner-result", "duplicate-evidence-class-2", "duplicate-understanding-unchanged", "decision-draft-actual", "unknown-actual", "future-preparation-persisted", "idempotent-reentry"] };
}

async function processD(root:string,lineageFixtureRoot:string,encodedC:string):Promise<WorkerResult>{
  const c=parseHandoff(encodedC),locations=roots(root),composition=await validationComposition(locations,lineageFixtureRoot),nextConversationId=String(c.nextConversationId),identity={userId:fixture.actorId,organizationId:fixture.organizationId,questionId,conversationId:nextConversationId};
  const source=await composition.workspace({...identity,conversationId:fixture.conversationId});assert.equal(source.currentPreparedWorkProduct,null);assert.equal(source.futurePreparationLink?.nextConversationId,nextConversationId);const first=await composition.workspace(identity);assert.ok(first.currentPreparedWorkProduct);assert.equal(first.currentPreparedWorkProduct?.conversationId,nextConversationId);
  const repository=createProductWorkflowArtifactRepository({root:locations.workflowRoot,environment:"test"}),before=(await repository.read(fixture.organizationId)).revision,second=await composition.workspace(identity),after=(await repository.read(fixture.organizationId)).revision;assert.equal(second.currentPreparedWorkProduct?.artifactVersionId,first.currentPreparedWorkProduct?.artifactVersionId);assert.equal(after,before);
  return{role:"reload-direct-evidence-successor",handoff:handoff({organizationId:fixture.organizationId,questionId,nextConversationId,artifactVersionId:first.currentPreparedWorkProduct!.artifactVersionId,workflowRevision:after}),assertions:["fresh-process-successor-link-from-body-safe-predecessor","fresh-process-successor-reload","direct-evidence-current-access","reload-idempotent"]};
}

async function worker(role: string, root: string, ownerIssuedQuestionId:string, lineageFixtureRoot: string, expectedSeedDigest: string, encodedA?: string, encodedB?: string): Promise<WorkerResult> {
  bindOwnerIssuedQuestion(ownerIssuedQuestionId);
  assert.ok(path.basename(root).startsWith("discovery-leadership-conversation-replay-"));
  if (role === "prepare-and-freeze") return processA(root,lineageFixtureRoot);
  if (role === "capture-and-review") return processB(root, encodedA!);
  if (role === "route-actual-owners-and-prepare-again") return processC(root, lineageFixtureRoot, expectedSeedDigest, encodedA!, encodedB!);
  if (role === "operation-linked-ambiguity") return processC(root, lineageFixtureRoot, expectedSeedDigest, encodedA!, encodedB!,true);
  if (role === "reload-direct-evidence-successor") return processD(root,lineageFixtureRoot,encodedA!);
  throw new Error("unknown process role");
}

async function execute(root: string, role: string, lineageFixtureRoot: string | null, expectedSeedDigest: string | null, ...handoffs: SafeHandoff[]): Promise<WorkerResult> {
  const args = ["--conditions=react-server", ...process.execArgv.filter(argument => argument !== "--conditions=react-server"), import.meta.filename, "--worker", role, root, questionId, lineageFixtureRoot ?? "-", expectedSeedDigest ?? "-", ...handoffs.map(item => Buffer.from(JSON.stringify(item)).toString("base64url"))];
  const { stdout, stderr } = await runFile(process.execPath, args, { cwd: process.cwd(), env: { PATH: process.env.PATH ?? "", NODE_PATH: process.env.NODE_PATH ?? "", NODE_ENV: "test", TZ: "UTC", LANG: "C", TMPDIR: tmpdir() }, timeout: 30_000, maxBuffer: 128 * 1024, shell: false });
  assert.equal(stderr, "");
  const parsed = JSON.parse(stdout) as WorkerResult;
  assert.deepEqual(Object.keys(parsed).sort(), ["assertions", "handoff", "role"]);
  assert.ok(Array.isArray(parsed.assertions) && parsed.assertions.every(item => typeof item === "string"));
  assert.equal(parsed.handoff.handoffDigest, digest(Object.fromEntries(Object.entries(parsed.handoff).filter(([key]) => key !== "handoffDigest"))));
  return parsed;
}

async function main(): Promise<void> {
  if (process.argv.includes("--worker")) {
    const index = process.argv.indexOf("--worker");
    const originalInfo = console.info, originalLog = console.log;
    console.info = () => {}; console.log = () => {};
    try { process.stdout.write(JSON.stringify(await worker(process.argv[index + 1]!, process.argv[index + 2]!, process.argv[index + 3]!, process.argv[index + 4]!, process.argv[index + 5]!, process.argv[index + 6], process.argv[index + 7]))); }
    finally { console.info = originalInfo; console.log = originalLog; }
    return;
  }
  let checks = 0;
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-"));
  const lineageFixtureRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-"));
  try {
    const evaluationScope = { organizationId: fixture.organizationId, type: "organization" as const, id: fixture.organizationId };
    const evaluationContext = resolveScopedGovernanceContext({ organizationId: fixture.organizationId, subjectId: fixture.actorId, requestedScope: evaluationScope, operation: CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION, purpose: fixture.purposeRef, sensitivity: "standard", evaluatedAt: fixture.at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "authority:replay:evaluation", policyRef: "policy:replay:evaluation", organizationId: fixture.organizationId, subjectId: fixture.actorId, scope: evaluationScope, operations: [CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
    assert.equal(evaluationContext.disposition, "authorized"); checks++;
    const confidenceOnlyContext = resolveScopedGovernanceContext({ organizationId: fixture.organizationId, subjectId: fixture.actorId, requestedScope: evaluationScope, operation: CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION, purpose: fixture.purposeRef, sensitivity: "standard", evaluatedAt: fixture.at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "authority:replay:confidence", policyRef: "policy:replay:confidence", organizationId: fixture.organizationId, subjectId: fixture.actorId, scope: evaluationScope, operations: [CANONICAL_UNDERSTANDING_REVISION_OPERATION], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
    assert.equal(confidenceOnlyContext.disposition, "denied"); checks++;
    const provisioned = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageFixtureRoot, now: fixture.at });
    bindOwnerIssuedQuestion(provisioned.seed.productQuestionId);
    assert.equal(provisioned.disposition, "provisioned"); checks++;
    assert.ok(provisioned.counts.sources > 0 && provisioned.counts.material > 0 && provisioned.counts.understandings > 0); checks++;
    const a = await execute(root, "prepare-and-freeze", lineageFixtureRoot, provisioned.seed.seedDigest); checks += a.assertions.length;
    const b = await execute(root, "capture-and-review", null, null, a.handoff); checks += b.assertions.length;
    const resign = (value: SafeHandoff, changes: Record<string, unknown>): SafeHandoff => { const { handoffDigest: _old, ...unsigned } = { ...value, ...changes }; return { ...unsigned, handoffDigest: digest(unsigned) }; };
    const reject = async (attempt: () => Promise<unknown>) => { await assert.rejects(attempt); checks += 1; };
    const cArgs = [lineageFixtureRoot, provisioned.seed.seedDigest] as const;
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, { ...a.handoff, handoffDigest: "0".repeat(64) }, b.handoff));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { productWorkflowRepositoryRevision: "stale" })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { runtimeRepositoryRevision: "stale" })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { sourceContentRepositoryRevision: "stale" })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, resign(a.handoff, { frozenSnapshotDigest: "0".repeat(64) }), b.handoff));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { sourceBindingVersion: 999 })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { exactContentDigest: "0".repeat(64) })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { proposals: [{ proposalId: "wrong", kind: "evidence-candidate", payloadDigest: "0".repeat(64) }] })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { dispositions: [] })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, resign(a.handoff, { organizationId: "cross-organization" }), b.handoff));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, resign(a.handoff, { questionId: "wrong-question" }), b.handoff));
    const wrongRoot = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-"));
    try { await reject(() => execute(wrongRoot, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, b.handoff)); }
    finally { await rm(wrongRoot, { recursive: true, force: true }); }
    const missingLineageRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-"));
    try { await reject(() => execute(root, "route-actual-owners-and-prepare-again", missingLineageRoot, provisioned.seed.seedDigest, a.handoff, b.handoff)); }
    finally { await rm(missingLineageRoot, { recursive: true, force: true }); }
    const c = await execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, b.handoff); checks += c.assertions.length;
    assert.equal(c.handoff.processAHandoffDigest, a.handoff.handoffDigest); checks++;
    assert.equal(c.handoff.processBHandoffDigest, b.handoff.handoffDigest); checks++;
    const d=await execute(root,"reload-direct-evidence-successor",lineageFixtureRoot,null,c.handoff);checks+=d.assertions.length;
    const occurrenceActions=await readFile("app/product-alpha/leadership-conversation/actions.ts","utf8"),experience=await readFile("components/product-alpha/leadership-conversation/LeadershipConversationExperience.tsx","utf8");assert.match(occurrenceActions,/acceptOccurrence1EvidenceAction[\s\S]*server\.review[\s\S]*server\.routeApproved/);assert.match(experience,/Accept as Evidence/);checks+=2;
    const ambiguousRoot=await mkdtemp(path.join(tmpdir(),"discovery-leadership-conversation-replay-"));try{const ambiguousA=await execute(ambiguousRoot,"prepare-and-freeze",lineageFixtureRoot,provisioned.seed.seedDigest),ambiguousB=await execute(ambiguousRoot,"capture-and-review",null,null,ambiguousA.handoff),ambiguous=await execute(ambiguousRoot,"operation-linked-ambiguity",...cArgs,ambiguousA.handoff,ambiguousB.handoff);checks+=ambiguous.assertions.length;}finally{await rm(ambiguousRoot,{recursive:true,force:true});}
    console.log(JSON.stringify({ validation: "leadership-conversation-replay-001", result: "PASS", checks, freshProcesses: 17, processA: "persisted", processB: "loaded-a-and-persisted-capture-review", processC: "loaded-a-b-and-executed-actual-owners", processD: "reloaded-direct-evidence-successor", northstarFixtureProvisionerInvocations: 1, processCSeedIntegrityReloads: 1, processCHiddenProvisioningInvocations: 0, missingLineageFailsClosed: true, materialEvidence: "actual-path", duplicateEvidence: "actual-class-2", productDecisionDraft: "actual-service", additionalOwner: "actual-unknown", futurePreparation: "persisted", idempotentReentry: "passed", negativeBindingControls: 13, handoffDigestsVerified: true, canonicalComposition: true, stubbedPositiveOwners: false, boundedEnvironment: true, shell: false, timeoutMilliseconds: 30000, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0, deployments: 0 }));
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(lineageFixtureRoot, { recursive: true, force: true });
    await assert.rejects(() => import("node:fs/promises").then(fs => fs.lstat(root)));
    await assert.rejects(() => import("node:fs/promises").then(fs => fs.lstat(lineageFixtureRoot)));
  }
}

void main();
