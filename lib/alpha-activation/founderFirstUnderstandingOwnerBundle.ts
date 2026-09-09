import "server-only";
import path from "node:path";
import { createHash } from "node:crypto";
import { FilesystemOrganizationRuntimeRepository, type OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalLocalSourceBindingService } from "../../engine/v3/governance/canonicalLocalSourceBindingService";
import { resolveScopedGovernanceContext, type ScopedGovernanceOperation } from "../../engine/v3/governance/scopedGovernanceContext";
import { createFilesystemSourceContentRepository, GovernedSourceContentService, type SourceContentRepository } from "../../engine/v3/sources";
import { provisionOrganizationUnderstandingBootstrap } from "../alpha-provisioning/provisionDesignPartner";
import { issueInitialUnderstandingQuestionIdentity } from "../../product/questions/initialUnderstandingQuestion";
import { createProductWorkflowArtifactRepository, type ProductWorkflowArtifactRepository } from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { LeadershipConversationProductOperations } from "../../product/workflow/leadershipConversation/operations";
import { createProductArtifactBodyRepository, type ProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { productArtifactBodyDigest } from "../../product/persistence";
import { buildProductQuestionWorkspace } from "../../product/workflow/buildProductQuestionWorkspace";
import { buildFrontendReadyProductQuestionWorkspace } from "../../product/workflow/buildFrontendReadyProductQuestionWorkspace";
import { GeneralRecurringMeetingProvisioner } from "../../product/integration/generalRecurringMeetingProvisioner";
import { ChiefLeadershipPreparationComposer } from "../../product/integration/chiefLeadershipPreparationComposer";
import { founderAuthorizedMeetingDirectory } from "../../product/integration/founderAuthorizedMeetingDirectory";
import { completeRegisteredMeetingPreparationScopeV1, deriveRecurringMeetingOccurrenceIdentity, leadershipId, type RegisteredMeetingPreparationScopeV1, type ChiefFirstPrepareActivationV1 } from "../../product/workflow/leadershipConversation";
import { ParticipantReferenceAccessAdministration, type ParticipantReferenceAccessRepository } from "./participantReferenceAccess";
import type { FirstUnderstandingInput, FirstUnderstandingUpload } from "./founderFirstUnderstandingForm";
import { assertFounderFirstUnderstandingVerifiedRequest, createFounderFirstUnderstandingVerifiedRequestForIsolatedValidation, type FounderFirstUnderstandingVerifiedRequest } from "./founderFirstUnderstandingRequestAuthority";
import { resolveFounderLocalAlphaRuntimeRootFromEnvironment } from "./founderLocalAlphaRuntimeRoot";
import type { ProductArtifactMaterialLineageSeedV3 } from "../../product/workflow/productArtifactInspectionMetadataContracts";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const PURPOSE = "leadership-conversation-capture" as const;
type ScopeStore = { registeredMeetingPreparationScopes?: RegisteredMeetingPreparationScopeV1[] };
type SourceVersion = RegisteredMeetingPreparationScopeV1["sourceVersions"][number];
export type FounderBundleConfiguration = { runtime: OrganizationRuntimeRepository; accessRepository: ParticipantReferenceAccessRepository; workflowRoot: string; sourceRoot: string; bodyRoot: string; participantRef: string; consumerId: string; verifiedRequest: FounderFirstUnderstandingVerifiedRequest; close(): Promise<void> };

/** Request-local orchestration authority. It is never persisted or delivered. */
class FounderLocalAlphaUnderstandingActivationAuthorityV1 {
  #participantRef: string;
  private operationId?:string;
  constructor(private readonly request:FounderFirstUnderstandingVerifiedRequest) { assertFounderFirstUnderstandingVerifiedRequest(request);this.#participantRef = request.participantRef; }
  bind(operationId:string){this.assert(this.#participantRef);if(this.operationId&&this.operationId!==operationId)throw new Error("Founder authority cannot change operation.");this.operationId=operationId;}
  assert(participantRef: string) { assertFounderFirstUnderstandingVerifiedRequest(this.request);if (process.env.NODE_ENV === "production" || participantRef !== this.#participantRef) throw new Error("Founder activation authority is unavailable."); }
  toJSON(): never { throw new Error("Founder authority cannot be serialized."); }
}

/** All persistence belongs to existing repositories. This bundle retains only
 * request-local composition and deterministically reconstructs prior results. */
export class FounderFirstUnderstandingOwnerBundle {
  readonly runtime: OrganizationRuntimeRepository;
  readonly access: ParticipantReferenceAccessAdministration;
  readonly workflow: ReturnType<typeof createProductWorkflowArtifactRepository>;
  readonly sourceRepository: SourceContentRepository;
  readonly sourceBindings: CanonicalLocalSourceBindingService;
  readonly sourceContent: GovernedSourceContentService;
  readonly bodies: ProductArtifactBodyRepository;
  readonly operations: LeadershipConversationProductOperations;
  readonly preparation: ChiefLeadershipPreparationComposer;
  readonly provisioner: GeneralRecurringMeetingProvisioner;
  readonly bootstrap = provisionOrganizationUnderstandingBootstrap;
  readonly question = issueInitialUnderstandingQuestionIdentity;
  readonly meetingAddress = founderAuthorizedMeetingDirectory;
  readonly authority: FounderLocalAlphaUnderstandingActivationAuthorityV1;
  private instant = new Date().toISOString();
  private operation?: { id: string; organizationId: string; meetingKey: string; scopeKey: string; input: FirstUnderstandingInput };
  private admitted: SourceVersion[] = [];

  constructor(private readonly config: FounderBundleConfiguration) {
    if (process.env.NODE_ENV === "production" || !config.participantRef || !config.consumerId) throw new Error("Founder Local Alpha is unavailable.");
    this.authority = new FounderLocalAlphaUnderstandingActivationAuthorityV1(config.verifiedRequest);
    if(config.verifiedRequest.participantRef!==config.participantRef||config.verifiedRequest.consumerId!==config.consumerId)throw new Error("Founder request identity mismatch.");
    this.runtime = config.runtime;
    this.access = new ParticipantReferenceAccessAdministration(config.accessRepository);
    this.workflow = createProductWorkflowArtifactRepository({ root: config.workflowRoot, environment: "development" });
    this.sourceRepository = createFilesystemSourceContentRepository({ root: config.sourceRoot, environment: "development" });
    this.bodies = createProductArtifactBodyRepository({ root: config.bodyRoot });
    const clock = { now: () => this.instant };
    this.sourceBindings = new CanonicalLocalSourceBindingService(this.runtime, clock);
    this.sourceContent = new GovernedSourceContentService(this.sourceRepository, { loadRevisions: async ({ organizationId, sourceBindingId }) => {
      const stored = await this.runtime.read(organizationId), bindings = stored?.runtime.memory.canonicalScopeLineageIndex?.sourceBindings ?? [], target = bindings.find(value => value.bindingId === sourceBindingId);
      return target ? bindings.filter(value => value.source.sourceId === target.source.sourceId && value.organizationId === organizationId) : [];
    } }, clock);
    this.operations = new LeadershipConversationProductOperations({ repository: this.workflow, bodyRepository: this.bodies, clock,
      authorize: async ({ userId, organizationId }) => this.authorizedOrganization(userId, organizationId),
      loadBase: async ({ userId, organizationId, questionId }) => {
        if (!await this.authorizedOrganization(userId, organizationId)) throw new Error("Meeting access is unavailable.");
        const stored = await this.runtime.read(organizationId);
        if (!stored || stored.runtime.memory.initialUnderstandingBootstrap?.initialProductQuestionId !== questionId) throw new Error("Initial Product Question is unavailable.");
        return buildFrontendReadyProductQuestionWorkspace({ workspace: buildProductQuestionWorkspace({ runtime: stored.runtime, questionId }) });
      },
      resolvePreparedWorkMaterialLineage: async ({ organizationId, questionId, conversationId }) => this.materialLineage(organizationId, questionId, conversationId),
    });
    this.preparation = new ChiefLeadershipPreparationComposer({ workspace: input => this.operations.workspace(input), recordContext: input => this.operations.recordContext(input), recordPreparation: input => this.recordPreparationExact(input) }, { resolve: async ({ activation, conversationId, sourceRefs }) => {
      const seed = await this.materialLineage(activation.organizationId, activation.questionId, conversationId);
      const content = { headline: "Your first understanding is beginning", situationSummary: "Discovery has established a governed starting point and connected the selected sources to your question. Organizational understanding has not yet been completed.", whatChanged: ["The initial question and its source scope are ready."], decisionsRequiringAttention: [], importantTensions: [], contradictions: [], unknowns: [activation.purpose], priorCommitments: [], suggestedAgenda: ["Explore the initial question."], talkingPoints: [], questionsToResolve: [this.requireOperation().input.primaryQuestion], evidenceReferences: sourceRefs, uncertaintyAndLimitations: ["The sources have been connected but have not been analyzed.", "No prior reviewed state or meeting history exists."], unavailableAreas: ["Completed organizational understanding"] };
      return { content, lineage: { questionRevision: 1, authorizedProjectionRevision: seed.bootstrapFingerprint, authorizedProjectionDigest: seed.seedDigest, productCommunicationRevision: "initial-understanding-bootstrap:1", productCommunicationDigest: productArtifactBodyDigest(content), sourceRevisionReferences: sourceRefs, previousFrozenSnapshotId: null, canonicalChangeReceiptReferences: [] }, sourceBasis: sourceRefs.map(sourceRef => ({ sourceRef, label: "Source connected to the initial question" })) };
    } }, { participantRef: this.config.participantRef, displayName: "Signed-in founder" });
    this.provisioner = new GeneralRecurringMeetingProvisioner({
      resolveOrganization: async ({ userId, organizationExternalKey }) => { const op = this.requireOperation(); if (organizationExternalKey !== op.organizationId || !await this.authorizedOrganization(userId, op.organizationId)) throw new Error("Organization is unavailable."); return { organizationId: op.organizationId }; },
      resolvePersistedPreparationScope: async ({ organizationId, preparationScopeExternalKey }) => { const op = this.requireOperation(); if (organizationId !== op.organizationId || preparationScopeExternalKey !== op.scopeKey) throw new Error("Preparation scope is unavailable."); const scope = await this.exactScope(); return { scopeExternalKey: op.scopeKey, persistedAt: scope.createdAt, sourceVersions: [...scope.sourceVersions] }; },
      createQuestion: async ({ organizationId, idempotencyKey }) => { const op = this.requireOperation(), identity = this.question({ contractVersion: "1", organizationId, activationOperationId: op.id, meetingExternalKey: op.meetingKey, primaryQuestion: op.input.primaryQuestion, purpose: op.input.understandingPurpose }); if (identity.idempotencyKey !== idempotencyKey) throw new Error("Question identity conflict."); const stored = await this.runtime.read(organizationId); if (stored?.runtime.memory.initialUnderstandingBootstrap?.initialProductQuestionId !== identity.questionId) throw new Error("Question is unavailable."); return { workspace: { question: { id: identity.questionId } } }; },
      workflow: this.workflow,
      activateAndPrepare: async ({ userId, identity, ...input }) => {
        await this.operations.recordContext({ userId, organizationId: input.organizationId, questionId: input.questionId, conversationId: identity.conversationId, idempotencyKey: `${input.idempotencyKey}:context`, title: input.meetingTitle, purpose: input.purpose, intendedOutcome: "Enter the conversation with one materially better question.", timeframe: input.timeframe, participants: [{ participantRef: this.config.participantRef, displayName: "Signed-in founder", titleLabel: input.role }], leaderContext: null });
        await this.access.grant({ organizationId: input.organizationId, participantRef: this.config.participantRef, scope: "meeting-series", meetingSeriesId: identity.seriesId, issuerAuthority: this.issuer(), operationId: `${this.requireOperation().id}:meeting-grant`, occurredAt: this.instant });
        return this.preparation.activateAndPrepareWithIdentity(userId, input, identity);
      },
    });
  }

  private requireOperation() { this.authority.assert(this.config.participantRef); if (!this.operation) throw new Error("Initial understanding has not been planned."); return this.operation; }
  private issuer() { return `founder-local-alpha:${this.requireOperation().id}`; }
  async plan(input: FirstUnderstandingInput) {
    this.authority.assert(this.config.participantRef);
    const semantics = { ...input, sources: input.sources.map(({ bytes: _bytes, ...value }) => value) };
    const id = `first-understanding:${hash({ participant: this.config.participantRef, organization: input.organizationDisplayName.toLowerCase() })}`;
    this.authority.bind(id);
    this.operation = { id, organizationId: `founder-${hash(id).slice(0,32)}`, meetingKey: `initial-meeting:${hash(id)}`, scopeKey: `initial-scope:${hash(id)}`, input };
    const stored = await this.runtime.read(this.operation.organizationId);
    const policy=await this.config.accessRepository.findPolicy(this.operation.organizationId),organizationGrants=await this.config.accessRepository.findGrants({organizationId:this.operation.organizationId,participantRef:this.config.participantRef,scope:"organization"});
    if(policy&&(policy.mode!=="participant-reference-v1"||policy.issuedBy!==this.issuer()))throw new Error("Initial understanding policy conflict.");
    if(organizationGrants.length>1||organizationGrants.some(value=>value.status!=="active"||value.issuedBy!==this.issuer()))throw new Error("Initial understanding organization grant conflict.");
    const question=this.question({contractVersion:"1",organizationId:this.operation.organizationId,activationOperationId:id,meetingExternalKey:this.operation.meetingKey,primaryQuestion:input.primaryQuestion,purpose:input.understandingPurpose});
    if(stored&&(!stored.runtime.memory.initialUnderstandingBootstrap||stored.runtime.memory.initialUnderstandingBootstrap.bootstrapOperationId!==id||stored.runtime.memory.initialUnderstandingBootstrap.initialProductQuestionId!==question.questionId||stored.runtime.metadata.name!==input.organizationDisplayName||stored.runtime.memory.initialUnderstandingBootstrap.purposeDigest!==createHash("sha256").update(input.understandingPurpose).digest("hex")))throw new Error("Initial understanding bootstrap conflict.");
    if (stored?.runtime.memory.initialUnderstandingBootstrap) {
      this.instant = stored.runtime.memory.initialUnderstandingBootstrap.createdAt;
      const priorScopes=((await this.workflow.inspect(this.operation.organizationId)).store as ScopeStore).registeredMeetingPreparationScopes??[];
      if(priorScopes.length){
        const events=stored.runtime.memory.events as unknown as Array<{kind?:string;idempotencyKeyDigest?:string;receipt?:{normalizedContentDigest:string;sourceBindingId:string}}>;
        const references=input.sources.map(source=>{const sourceKey=hash({name:source.name,purpose:source.purpose}),keyDigest=createHash("sha256").update(JSON.stringify(["canonical-local-source-binding-idempotency",`${id}:source:${sourceKey}:binding`])).digest("hex"),event=events.find(value=>value.kind==="canonical-local-source-binding-operation"&&value.idempotencyKeyDigest===keyDigest);if(!event?.receipt||event.receipt.normalizedContentDigest!==source.normalizedDigest)throw new Error("Initial source scope conflict.");return event.receipt.sourceBindingId;}).sort();
        if(priorScopes.length!==1||JSON.stringify(references)!==JSON.stringify(priorScopes[0]!.sourceVersions.map(value=>value.sourceBindingId).sort()))throw new Error("Initial source scope conflict.");
      }
    }
    const workflow=(await this.workflow.inspect(this.operation.organizationId)).store,meetingIdentity=deriveRecurringMeetingOccurrenceIdentity({organizationId:this.operation.organizationId,meetingExternalKey:this.operation.meetingKey}),meetingGrants=await this.config.accessRepository.findGrants({organizationId:this.operation.organizationId,participantRef:this.config.participantRef,scope:"meeting-series",meetingSeriesId:meetingIdentity.seriesId});
    if(meetingGrants.length>1||meetingGrants.some(value=>value.status!=="active"||value.issuedBy!==this.issuer()))throw new Error("Initial understanding meeting grant conflict.");
    return { ready: true as const, sourceCount: input.sources.length, semanticsDigest: hash(semantics), preview:{organization:stored?"replay":"create",policy:policy?"replay":"create",organizationGrant:organizationGrants.length?"replay":"create",question:stored?"replay":"create",sources:"verify exact uploaded content",preparationScope:(workflow as ScopeStore).registeredMeetingPreparationScopes?.length?"replay":"create",meeting:workflow.contexts.length?"replay":"create",meetingGrant:meetingGrants.length?"replay":"create",preparedWork:workflow.preparedWorkPublications?.length?"replay":"create"} };
  }
  async applyBootstrap() {
    const op = this.requireOperation();
    return this.bootstrap({ organizationId: op.organizationId, organizationName: op.input.organizationDisplayName, purpose: op.input.understandingPurpose, primaryQuestion: op.input.primaryQuestion, meetingExternalKey: op.meetingKey, bootstrapOperationId: op.id, actor: this.config.participantRef, createdAt: this.instant, repository: this.runtime });
  }
  async applyAccess() { const op = this.requireOperation(); await this.access.activatePolicy({ organizationId: op.organizationId, issuerAuthority: this.issuer(), operationId: `${op.id}:policy`, occurredAt: this.instant }); await this.access.grant({ organizationId: op.organizationId, participantRef: this.config.participantRef, scope: "organization", issuerAuthority: this.issuer(), operationId: `${op.id}:organization-grant`, occurredAt: this.instant }); }
  private async authorizedOrganization(userId: string, organizationId: string) { if (userId !== this.config.consumerId) return false; const policy = await this.config.accessRepository.findPolicy(organizationId); const grants = await this.config.accessRepository.findGrants({ organizationId, participantRef: this.config.participantRef, scope: "organization" }); return policy?.mode === "participant-reference-v1" && grants.filter(value => value.status === "active").length === 1; }
  private sourceAuthorization(operation: ScopedGovernanceOperation) { const op = this.requireOperation(); if (!["source-binding:register-local", "source-binding:resolve-current", "source-content:write"].includes(operation)) throw new Error("Source authority is unavailable."); const scope = { organizationId: op.organizationId, type: "organization" as const, id: op.organizationId }; return resolveScopedGovernanceContext({ organizationId: op.organizationId, subjectId: this.config.participantRef, requestedScope: scope, operation, purpose: PURPOSE, sensitivity: "standard", evaluatedAt: this.instant, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: this.issuer(), policyRef: "founder-initial-understanding-local-alpha:1", organizationId: op.organizationId, subjectId: this.config.participantRef, scope, operations: [operation], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: this.instant }] }); }
  async admit(source: FirstUnderstandingUpload, questionId: string) {
    const op = this.requireOperation(), sourceKey = hash({ name: source.name, purpose: source.purpose }), organizationId = op.organizationId;
    const sourceRuntime=await this.runtime.read(organizationId);
    if(sourceRuntime?.runtime.memory.initialUnderstandingBootstrap?.initialProductQuestionId!==questionId||!op.input.sources.some(value=>value.name===source.name&&value.purpose===source.purpose&&value.exactDigest===source.exactDigest&&Buffer.from(value.bytes).equals(Buffer.from(source.bytes))))throw new Error("Source is outside the exact initial Question.");
    const common = { contractVersion: "1" as const, organizationId, productQuestionId: questionId, sourceType: source.mediaType === "text/markdown" ? "markdown-upload" as const : "plain-text-upload" as const, purposeRef: PURPOSE, normalizedContentDigest: source.normalizedDigest, requestedScopeAssertions: [{ relationship: "applies-to" as const, scope: { organizationId, type: "organization" as const, id: organizationId } }], sensitivity: "standard" as const };
    let bindingId:string|undefined;
    const resolveBinding=()=>this.sourceBindings.resolveCanonicalCurrentSourceBinding({...common,authorization:this.sourceAuthorization("source-binding:resolve-current"),resolvedAt:this.instant});
    for(let attempt=0;attempt<2;attempt++){
      const stored=await this.runtime.read(organizationId);if(!stored)throw new Error("Runtime is unavailable.");
      try{const result=await this.sourceBindings.registerCanonicalLocalSourceBinding({...common,authorization:this.sourceAuthorization("source-binding:register-local"),recordedAt:this.instant,recordedByActorRef:this.config.participantRef,idempotencyKey:`${op.id}:source:${sourceKey}:binding`,expectedRuntimeRevision:stored.revision,operation:{requestId:`${op.id}:source:${sourceKey}:binding`,operatorId:this.config.participantRef}});bindingId=result.sourceBindingId;break;}
      catch(error){const reread=await resolveBinding().catch(()=>null);if(reread?.binding.basisRefs.includes(`product-question:${questionId}`)){bindingId=reread.binding.bindingId;break;}if(attempt===1)throw error;}
    }
    if(!bindingId)throw new Error("Source binding is unavailable.");
    const inspect=()=>this.inspectSource(bindingId!,questionId,source);
    let state=await inspect(),lastError:unknown;
    for(let attempt=0;attempt<2&&state.status!=="complete";attempt++){
      if(state.status==="conflict")throw new Error("Source content conflict.");
      try{
        if(state.status==="incomplete")await this.sourceContent.restoreMissingBody({contractVersion:"1",organizationId,sourceBindingId:bindingId,sourceContentVersionId:state.version.sourceContentVersionId,purposeRef:PURPOSE,bytes:source.bytes,restoredByActorRef:this.config.participantRef,authorization:this.sourceAuthorization("source-content:write")});
        else await this.sourceContent.write({contractVersion:"1",organizationId,sourceBindingId:bindingId,purposeRef:PURPOSE,mediaType:source.mediaType,bytes:source.bytes,storedAt:this.instant,storedByActorRef:this.config.participantRef,idempotencyKey:`${op.id}:source:${sourceKey}:content`,expectedRepositoryRevision:state.repositoryRevision,authorization:this.sourceAuthorization("source-content:write")});
      }catch(error){lastError=error;}
      state=await inspect();
    }
    // Final owner rereads, including after uncertain publication, establish the
    // complete exact Question/binding/manifest/body tuple before admitting scope.
    const finalBinding=await resolveBinding(),finalContent=await inspect();
    if(finalBinding.binding.bindingId!==bindingId||!finalBinding.binding.basisRefs.includes(`product-question:${questionId}`))throw new Error("Source Question relationship conflict.");
    if(finalContent.status==="conflict")throw new Error("Source content conflict.");
    if(finalContent.status!=="complete")throw lastError??new Error("Source admission requires an exact retry.");
    return {version:{sourceBindingId:bindingId,sourceContentVersionId:finalContent.version.sourceContentVersionId,normalizedContentDigest:source.normalizedDigest}};
  }
  private inspectSource(sourceBindingId:string,questionId:string,source:FirstUnderstandingUpload){return this.sourceContent.inspectExactWriteState({organizationId:this.requireOperation().organizationId,productQuestionId:questionId,sourceBindingId,purposeRef:PURPOSE,normalizedContentDigest:source.normalizedDigest,exactContentDigest:source.exactDigest,byteLength:source.bytes.byteLength,authorization:this.sourceAuthorization("source-content:write")});}

  async admitSources(questionId: string) { this.admitted = []; for (const source of this.requireOperation().input.sources) this.admitted.push((await this.admit(source, questionId)).version); return this.admitted; }
  async registerScope(questionId: string) { const op = this.requireOperation(), identity = deriveRecurringMeetingOccurrenceIdentity({ organizationId: op.organizationId, meetingExternalKey: op.meetingKey }), scopeId = leadershipId("registered-meeting-preparation-scope", op.organizationId, identity.seriesId, op.scopeKey); const scope = completeRegisteredMeetingPreparationScopeV1({ contractVersion: "1", scopeId, organizationId: op.organizationId, questionId, conversationId: identity.conversationId, seriesId: identity.seriesId, sourceVersions: [...this.admitted].sort((a,b)=>a.sourceBindingId.localeCompare(b.sourceBindingId)), createdAt: this.instant, createdByUserId: this.config.consumerId, idempotencyKeyDigest: leadershipId("general-recurring-meeting-scope-key", op.organizationId, op.meetingKey), requestFingerprint: this.scopeFingerprint(questionId) }); const before = await this.workflow.read(op.organizationId); return this.workflow.registerMeetingPreparationScope({ ...scope, expectedRevision: before.revision }); }
  private scopeFingerprint(questionId: string) { const op = this.requireOperation(), q = this.question({ contractVersion: "1", organizationId: op.organizationId, activationOperationId: op.id, meetingExternalKey: op.meetingKey, primaryQuestion: op.input.primaryQuestion, purpose: op.input.understandingPurpose }); return productArtifactBodyDigest({ contractVersion: "1", organizationExternalKey: op.organizationId, meetingExternalKey: op.meetingKey, productQuestionExternalKey: q.externalKey, productQuestion: op.input.primaryQuestion, questionId, title: op.input.meetingTitle, purpose: op.input.understandingPurpose, cadenceLabel: op.input.cadence, preparationScopeExternalKey: op.scopeKey, sourceVersions: [...this.admitted].sort((a,b)=>a.sourceBindingId.localeCompare(b.sourceBindingId)) }); }
  private async exactScope() { const op = this.requireOperation(), scopes = ((await this.workflow.read(op.organizationId)).store as ScopeStore).registeredMeetingPreparationScopes ?? []; const matches = scopes.filter(scope => scope.requestFingerprint === this.scopeFingerprint(scope.questionId)); if (matches.length !== 1) throw new Error("Exact preparation scope is unavailable."); return matches[0]!; }
  private async materialLineage(organizationId: string, questionId: string, conversationId: string): Promise<ProductArtifactMaterialLineageSeedV3> { const stored = await this.runtime.read(organizationId), bootstrap = stored?.runtime.memory.initialUnderstandingBootstrap, scope = await this.exactScope(); if (!bootstrap || bootstrap.initialProductQuestionId !== questionId || scope.conversationId !== conversationId) throw new Error("Bootstrap lineage is unavailable."); for (const version of scope.sourceVersions) { const source=this.requireOperation().input.sources.find(value=>value.normalizedDigest===version.normalizedContentDigest);if(!source)throw new Error("Prepared Work source is unavailable.");const state=await this.inspectSource(version.sourceBindingId,questionId,source);if(state.status!=="complete"||state.version.sourceContentVersionId!==version.sourceContentVersionId)throw new Error("Prepared Work source integrity is unavailable."); } const unsigned = { contractVersion: "3" as const, lineageVariant: "initial-understanding-bootstrap" as const, organizationId, semanticOwner: "leadership-conversation" as const, productQuestionId: questionId, creationOperationId: this.requireOperation().id, lineagePolicyVersion: "initial-understanding-bootstrap:1", sourceBindings: scope.sourceVersions.map(value => ({ sourceBindingId: value.sourceBindingId, bindingRevisionId: value.sourceBindingId })), sourceContentVersions: [...scope.sourceVersions], canonicalMaterial: [], canonicalUnderstandingRevision: null, projectionSourceRef: null, scopeDigest: scope.scopeDigest, purpose: PURPOSE, sensitivity: "standard" as const, bootstrapOperationId: bootstrap.bootstrapOperationId, bootstrapFingerprint: bootstrap.requestFingerprint, preparationScopeDigest: scope.scopeDigest }; return { ...unsigned, seedDigest: productArtifactBodyDigest(unsigned) }; }
  private async recordPreparationExact(input: Parameters<LeadershipConversationProductOperations["recordPreparation"]>[0]) { const store = (await this.workflow.read(input.organizationId)).store, prior = store.preparedWorkPublications?.find(value => value.productWorkflowId === `leadership-conversation:${input.conversationId}`); if (prior) { await this.bodies.readStagedExact(prior.protectedBody); return store; } return this.operations.recordPreparation({ ...input, stableCreatedAt: this.instant }); }
  async provisionMeeting() { const op = this.requireOperation(); return this.provisioner.provisionInitialUnderstanding({ contractVersion: "1", userId: this.config.consumerId, organizationExternalKey: op.organizationId, activationOperationId: op.id, meetingExternalKey: op.meetingKey, productQuestion: op.input.primaryQuestion, title: op.input.meetingTitle, purpose: op.input.understandingPurpose, cadenceLabel: op.input.cadence, preparationScopeExternalKey: op.scopeKey }); }
  async destination(questionId: string, seriesId: string) { const op = this.requireOperation(); const directory = await this.meetingAddress({ userId: this.config.consumerId, organizationId: op.organizationId, questionId, workflowRoot: this.config.workflowRoot, currentAccess: { authorize: async ({userId, organizationId, seriesId: requested}) => { if (!await this.authorizedOrganization(userId,organizationId)) return "denied"; const grants = await this.config.accessRepository.findGrants({ organizationId, participantRef: this.config.participantRef, scope: "meeting-series", meetingSeriesId: requested }); return grants.filter(value=>value.status==="active").length===1 ? "authorized" : "denied"; } } }); const meeting = directory.find(value => value.seriesId === seriesId); if (!meeting) throw new Error("Authorized Meeting Home is unavailable."); return `/product-alpha/meetings/${meeting.seriesAddress}`; }
  close() { return this.config.close(); }
}

/** Environment construction is called only by the authenticated request root. */
export async function createFounderFirstUnderstandingOwnerBundleFromEnvironment(input: Omit<FounderBundleConfiguration, "runtime" | "workflowRoot" | "sourceRoot" | "bodyRoot">): Promise<FounderFirstUnderstandingOwnerBundle> {
  if (process.env.NODE_ENV === "production" || process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED !== "true") throw new Error("Founder Local Alpha is unavailable.");
  const root = path.join(process.cwd(), ".discovery-runtime");
  const protectedRoot = await resolveFounderLocalAlphaRuntimeRootFromEnvironment();
  if (protectedRoot.status !== "ready") throw new Error("Founder Local Alpha protected storage is unavailable.");
  return new FounderFirstUnderstandingOwnerBundle({ ...input, runtime: new FilesystemOrganizationRuntimeRepository(), workflowRoot: process.env.DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT ?? path.join(root,"product-workflow"), sourceRoot: protectedRoot.value.sourceContentRoot, bodyRoot: protectedRoot.value.productArtifactBodyRoot });
}
export function createFounderFirstUnderstandingOwnerBundleForIsolatedValidation(input: Omit<FounderBundleConfiguration,"verifiedRequest">) { if (process.env.NODE_ENV !== "test") throw new Error("Isolated validation is unavailable."); return new FounderFirstUnderstandingOwnerBundle({...input,verifiedRequest:createFounderFirstUnderstandingVerifiedRequestForIsolatedValidation(input.participantRef,input.consumerId)}); }
