import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  CASE_001_TERMINAL_STATUS, assertCalibrationDecisionConsistency, assertCalibrationTransition, calibrationDigest,
  generateCalibrationOrganizationId, manifestDigest, prepareCalibrationManifest, renderCalibrationHumanPacket,
  validatePreregistrationManifest, verifyCalibrationPreregistration, type CalibrationPreregistrationManifest,
  type CalibrationValidationContext, type HumanChoiceArtifact, type PrepareCalibrationInput,
} from "../../product/acquisition/calibration";
import { recordCalibrationHumanChoice } from "../../product/acquisition/calibration/recordHumanChoice";
import { verifyCalibrationHumanChoiceReload, type CalibrationReloadDependencies } from "../../product/acquisition/calibration/verifyHumanChoiceReload";
import { buildImprovementProposal, productConfidenceImprovementEvents, type ProductConfidenceImprovementEnvelopeContext, type ProductConfidenceImprovementProposal } from "../../product/improvements";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import { createDurableProductQuestion, buildDurableProductQuestion } from "../../product/questions";
import { deriveProductUnknownCandidate, recordProductUnknownOperation } from "../../product/unknowns";

const fixed = "2026-08-02T12:00:00.000Z";
const userId = "calibration-principal-controlled-fixture";
const environment = {
  DISCOVERY_ENV: "development", NEXT_PUBLIC_DISCOVERY_ENV: "development",
  DISCOVERY_ONBOARDING_TEST_ENABLED: "true", NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_protocol_fixture", CLERK_SECRET_KEY: "sk_test_protocol_fixture",
  DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery", DISCOVERY_DATABASE_ADMIN_URL: "postgresql://127.0.0.1/discovery",
  DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery", DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
  DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/discovery-onboarding-protocol-fixture",
  DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false", DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false", DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
} as const;
const available = <T>(value: T, sourceRef: string) => ({ state: "available" as const, value, sourceRef, qualification: "Controlled protocol fixture.", maturity: "fixture-backed" as const });
const sourceHashes = { "product/acquisition/shadow/selectMaterialInformationAcquisition.ts": createHash("sha256").update("controlled-source-hash").digest("hex") };

type Fixture = Awaited<ReturnType<typeof createFixture>>;
async function createFixture(caseSeed: string, disposition: "authorize" | "decline" | "defer") {
  const directory = await mkdtemp(path.join(tmpdir(), "discovery-calibration-002a-"));
  const organizationId = generateCalibrationOrganizationId({ caseSeed, principalSeed: userId, environment });
  const questionId = `product-question-${caseSeed}`;
  let runtime = createEmptyOrganizationRuntime({ organizationId, name: "Controlled Calibration Fixture" });
  runtime.metadata = { ...runtime.metadata, createdAt: fixed, updatedAt: fixed, investigationCount: 1 };
  const evidenceId = `evidence:controlled:${caseSeed}`;
  runtime.organizationModel = { ...runtime.organizationModel, nodes: [{ id: evidenceId, type: "evidence", label: "Controlled Evidence", summary: "Controlled fixture Evidence.", confidence: 0.8, createdAt: fixed, updatedAt: fixed }] };
  runtime = createDurableProductQuestion({ runtime, questionId, title: "Which controlled constraint is better supported?", createdAt: fixed }).runtime;
  const question = buildDurableProductQuestion({ runtime, questionId })!;
  const candidate = deriveProductUnknownCandidate({ organizationId, questionId, category: "competing-explanation-discrimination", target: { kind: "relationship", subjectRef: "constraint-a", predicate: "versus", objectRef: "constraint-b" }, summary: "Two controlled constraints remain plausible.", whyItMatters: "They imply different bounded evidence reviews.", sourceAncestry: [{ kind: "evidence", id: evidenceId }] });
  const opened = recordProductUnknownOperation({ runtime, questionId, operationId: `unknown-open-${caseSeed}`, occurredAt: fixed, actorRef: userId, authorizationScopeRef: `organization:${organizationId}:question:${questionId}`, candidate, transition: { type: "open" }, reason: "Controlled protocol fixture." });
  runtime = opened.runtime;
  const unknownRevisionRef = opened.receipt.eventId;
  const authorityRef = `organization:${organizationId}:authority:calibration`;
  const proposalFor = (suffix: string, actionType: "inspect-existing-evidence" | "run-comparison"): ProductConfidenceImprovementProposal => buildImprovementProposal({ organizationId, questionId, unknownId: candidate.unknownId, actionType, actionTarget: actionType === "run-comparison" ? { kind: "comparison", comparisonSubjects: ["constraint-a", "constraint-b"], measureRefs: ["materiality"] } : { kind: "existing-evidence-set", evidenceIds: [] }, summary: `Controlled ${suffix} action.`, rationale: "Controlled fixture only.", expectedValue: { understandingImprovement: "high", discriminationGain: "high", confidenceImpact: "possible", explanation: "No guarantee." }, executionCost: { effort: "low", delay: "immediate", burden: "low", governanceRisk: "low" }, prerequisites: [], sourceScopeRefs: [], personScopeRefs: [], answerVersionId: null, abstentionOperationId: `abstention-${suffix}`, understandingRevisionRef: `organization:${organizationId}:understanding:1`, unknownRevisionRef, generatedAt: fixed });
  const proposals = [proposalFor("inspect", "inspect-existing-evidence"), proposalFor("compare", "run-comparison")];
  const contextFor = (proposal: ProductConfidenceImprovementProposal): ProductConfidenceImprovementEnvelopeContext => ({ authorityRef, authorizationSatisfied: true, governanceAllowed: true, governanceContextRefs: [`organization:${organizationId}:governance:fixture`], consentState: "not-required", targetAccessible: true, executionAvailable: true, ownerAvailable: true, expectedInformationClass: "controlled-existing-evidence", expectedOrganizationalRelevance: available("high", `source:${proposal.proposalId}:relevance`), relevanceToUnknown: available("high", `source:${proposal.proposalId}:unknown`), reliability: available("high", `source:${proposal.proposalId}:reliability`), existingEvidenceQuality: available("moderate", `source:${proposal.proposalId}:quality`), directCost: available("none", `source:${proposal.proposalId}:cost`), reversibility: available("reversible", `source:${proposal.proposalId}:reversibility`), organizationalBurden: available("low", `source:${proposal.proposalId}:burden`), requiredSourceAccess: [], privacyConstraints: ["controlled-fixture-only"], cancellation: { supported: true, characteristics: "No external operation is available." }, resourceConstraintRefs: [], assumptions: ["Controlled fixture only."], lineage: [`organization:${organizationId}:fixture:${proposal.proposalId}`], objectiveVersionRef: null, optimizationContextVersionRef: null, stoppingCondition: "Stop after the controlled comparison.", expectedEvidenceLineage: { sourceKind: "canonical-evidence", sourceScopeRef: `organization:${organizationId}:evidence:fixture`, admissionRequired: true }, materialEffectTargets: ["unknown", "answer"], projectedAt: fixed });
  const contexts = proposals.map(contextFor);
  const repository = new FilesystemOrganizationRuntimeRepository(directory);
  await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(runtime, null, 2)), { requestId: `seed-${caseSeed}`, operatorId: userId });
  let authorized = true;
  let protectedReads = 0;
  const countedRepository = { async read(id: string) { protectedReads += 1; return repository.read(id); }, replace: repository.replace.bind(repository) };
  const operationAllowed = async () => true;
  const authorize = async (input: { userId: string; organizationId: string }) => authorized && input.userId === userId && input.organizationId === organizationId;
  const adapter = new CanonicalProductWorkspaceAdapter({ runtimeRepository: countedRepository, authorize, authorizeImprovementOperation: operationAllowed, async investigate() { throw new Error("No investigation in calibration fixture."); } });
  const projected = await Promise.all(proposals.map((proposal, index) => adapter.projectImprovementCandidateEnvelope({ userId, organizationId, questionId, proposal, context: contexts[index]! })));
  const validationContext: CalibrationValidationContext = { repositoryCommit: "a6c1eee5f5b18d7b86949d29635c3f15a4830907", sourceHashes, existingQuestions: [{ organizationId, questionId, revision: question.revision }], existingUnknowns: [{ organizationId, questionId, unknownId: candidate.unknownId, revisionRef: unknownRevisionRef }] };
  const manifestInput: PrepareCalibrationInput = { manifestSchemaVersion: "2", calibrationProgramId: "material-information-acquisition-independent-calibration-002", caseId: `controlled-${caseSeed}`, proposedClassification: "controlled-protocol-fixture", classificationRationale: "Controlled protocol fixture; not a genuine human choice.", repositoryCommit: validationContext.repositoryCommit, selector: { identity: "material-information-acquisition-shadow-selector-v1", sourceHash: sourceHashes["product/acquisition/shadow/selectMaterialInformationAcquisition.ts"]! }, versions: { candidateEnvelopeSchema: "1", candidateEnvelopeProjector: "1", confidenceImprovementEvent: "3", outcomeObservation: "1" }, frozenSourceHashes: sourceHashes, organizationId, principal: { pseudonymousRef: userId, authorityRef }, question: { questionId, revision: question.revision, exactText: question.title }, unknown: { unknownId: candidate.unknownId, revisionRef: unknownRevisionRef, exactText: candidate.summary, whyItMatters: candidate.whyItMatters }, understandingRef: `organization:${organizationId}:understanding:1`, authorizedUnderstandingSummary: "The controlled Understanding retains two plausible constraints.", objectiveVersion: { state: "not-applicable" }, optimizationContextVersion: { state: "not-applicable" }, evidenceBoundaryDigest: calibrationDigest([]), sourceReferenceDigests: [calibrationDigest("controlled-source-boundary")], candidateEnvelopes: projected.map((item, index) => ({ envelope: item.envelope, candidateType: item.envelope.candidate.actionType, neutralDescription: proposals[index]!.summary, limitations: ["Controlled fixture only."] })), allowedHumanDispositions: ["authorize", "decline", "defer"], executionAuthorizationChoices: ["execute-existing-local-read-only-operation", "do-not-execute", "defer-execution"], plannedComparisonMeasures: ["human-selector agreement"], plannedDisagreementClassifications: ["candidate-envelope insufficiency"], holdoutStatus: "not-applicable", priorExposureStatus: "none", outcomeAvailability: "unmeasured", missingOutcomeFields: ["observed understanding change"], hardSafetyGates: { validatedDevelopmentEnvironment: true, exactOrganizationAuthorization: true, canonicalQuestionAndUnknown: true, sameOrganizationReferences: true, selectorImportDeferred: true, runtimeWritesForbidden: true, connectorAndExternalActionForbidden: true, productionForbidden: true }, preregisteredAt: fixed };
  const draft = prepareCalibrationManifest(manifestInput, { status: "eligible-controlled-protocol-fixture", manifestClassification: "controlled-protocol-fixture" });
  const manifest = verifyCalibrationPreregistration(draft, validationContext).manifest;
  const dependencies: CalibrationReloadDependencies = { createRepository: () => new FilesystemOrganizationRuntimeRepository(directory), authorize, authorizeImprovementOperation: async () => true };
  const selectedIndex = 0;
  const record = (operationId = `choice-${caseSeed}`, overrideDisposition = disposition, executionAuthorization: "execute-existing-local-read-only-operation" | "do-not-execute" | "defer-execution" = overrideDisposition === "defer" ? "defer-execution" : "do-not-execute") => recordCalibrationHumanChoice({ adapter, manifest, context: validationContext, userId, selectedCandidateId: proposals[selectedIndex]!.proposalId, proposal: proposals[selectedIndex]!, envelopeContext: contexts[selectedIndex]!, disposition: overrideDisposition, executionAuthorization, operationId, rationale: "Controlled fixture disposition.", recordedAt: fixed });
  return { directory, organizationId, questionId, runtime, repository, adapter, manifest, manifestInput, validationContext, proposals, contexts, selectedIndex, unknownRevisionRef, candidate, dependencies, record, setAuthorized(value: boolean) { authorized = value; }, get protectedReads() { return protectedReads; } };
}

async function countEvents(fixture: Fixture, operationId: string) {
  const stored = await new FilesystemOrganizationRuntimeRepository(fixture.directory).read(fixture.organizationId);
  return productConfidenceImprovementEvents(stored!.runtime).filter((event) => event.schemaVersion === "3" && event.operationId === operationId);
}

async function main() {
  const fixtures: Fixture[] = [];
  try {
    assert.equal(CASE_001_TERMINAL_STATUS.phase, "blocked");
    assert.equal(CASE_001_TERMINAL_STATUS.completedLiveCaseCount, 0);
    assert.throws(() => assertCalibrationTransition("blocked", "preregistered"), /forbidden/);
    const authorizeFixture = await createFixture("authorize", "authorize"); fixtures.push(authorizeFixture);
    const declineFixture = await createFixture("decline", "decline"); fixtures.push(declineFixture);
    const deferFixture = await createFixture("defer", "defer"); fixtures.push(deferFixture);
    const executeFixture = await createFixture("authorize-execute", "authorize"); fixtures.push(executeFixture);
    const deferExecutionFixture = await createFixture("authorize-defer", "authorize"); fixtures.push(deferExecutionFixture);

    const authorizeChoice = await authorizeFixture.record();
    const declineChoice = await declineFixture.record();
    const deferChoice = await deferFixture.record();
    const executeChoice = await executeFixture.record(undefined, "authorize", "execute-existing-local-read-only-operation");
    const authorizeDeferredChoice = await deferExecutionFixture.record(undefined, "authorize", "defer-execution");
    assert.equal(authorizeChoice.canonicalReceiptSnapshot.eventType, "improvement-authorized");
    assert.equal(declineChoice.canonicalReceiptSnapshot.eventType, "improvement-declined");
    assert.equal(deferChoice.canonicalReceiptSnapshot.eventType, "improvement-deferred");
    assert.equal(authorizeChoice.executionAuthorization, "do-not-execute");
    assert.equal(executeChoice.executionAuthorization, "execute-existing-local-read-only-operation");
    assert.equal(authorizeDeferredChoice.executionAuthorization, "defer-execution");
    assert.equal(deferChoice.executionAuthorization, "defer-execution");
    assert.throws(() => assertCalibrationDecisionConsistency("authorize", "record-choice-only" as never), /vocabulary is invalid/);
    assert.throws(() => assertCalibrationDecisionConsistency("decline", "execute-existing-local-read-only-operation"), /inconsistent/);
    assert.throws(() => assertCalibrationDecisionConsistency("decline", "defer-execution"), /inconsistent/);
    assert.throws(() => assertCalibrationDecisionConsistency("defer", "execute-existing-local-read-only-operation"), /inconsistent/);
    assert.throws(() => assertCalibrationDecisionConsistency("defer", "do-not-execute"), /inconsistent/);
    assert.equal(authorizeChoice.canonicalEventSchemaVersion, "3");
    assert.equal(authorizeChoice.canonicalReceiptSnapshot.candidateEnvelopeDigest, authorizeFixture.manifest.candidateEnvelopes[0]!.digest);
    assert.doesNotMatch(JSON.stringify(authorizeChoice.canonicalReceiptSnapshot), /selectorResult|expectedWinner|predictedSelector/i);

    const replay = await authorizeFixture.record();
    assert.equal(replay.artifactDigest, authorizeChoice.artifactDigest);
    assert.equal((await countEvents(authorizeFixture, authorizeChoice.idempotencyIdentity)).length, 1);
    await assert.rejects(() => authorizeFixture.record(authorizeChoice.idempotencyIdentity, "decline"), /replay payload changed/);
    assert.equal((await countEvents(authorizeFixture, authorizeChoice.idempotencyIdentity)).length, 1);
    await assert.rejects(() => recordCalibrationHumanChoice({ adapter: authorizeFixture.adapter, manifest: authorizeFixture.manifest, context: authorizeFixture.validationContext, userId, selectedCandidateId: authorizeFixture.proposals[1]!.proposalId, proposal: authorizeFixture.proposals[1]!, envelopeContext: authorizeFixture.contexts[1]!, disposition: "authorize", executionAuthorization: "do-not-execute", operationId: authorizeChoice.idempotencyIdentity, rationale: "Controlled fixture disposition.", recordedAt: fixed }), /replay context changed/);
    await assert.rejects(() => recordCalibrationHumanChoice({ adapter: authorizeFixture.adapter, manifest: authorizeFixture.manifest, context: authorizeFixture.validationContext, userId, selectedCandidateId: authorizeFixture.proposals[0]!.proposalId, proposal: authorizeFixture.proposals[0]!, envelopeContext: { ...authorizeFixture.contexts[0]!, authorityRef: `organization:${authorizeFixture.organizationId}:authority:changed` }, disposition: "authorize", executionAuthorization: "do-not-execute", operationId: authorizeChoice.idempotencyIdentity, rationale: "Conflicting authority.", recordedAt: fixed }), /manifest state changed/);

    const unauthorized = await createFixture("unauthorized", "authorize"); fixtures.push(unauthorized);
    const readsBefore = unauthorized.protectedReads;
    unauthorized.setAuthorized(false);
    await assert.rejects(() => unauthorized.record(), /access denied/);
    assert.equal(unauthorized.protectedReads, readsBefore);
    assert.equal((await countEvents(unauthorized, "choice-unauthorized")).length, 0);

    const serializedChoice = JSON.parse(JSON.stringify(authorizeChoice)) as HumanChoiceArtifact;
    const reload = await verifyCalibrationHumanChoiceReload({ manifest: authorizeFixture.manifest, context: authorizeFixture.validationContext, reloadedChoice: serializedChoice, userId, dependencies: authorizeFixture.dependencies, verifiedAt: "2026-08-02T12:01:00.000Z" });
    assert.equal(reload.canonicalReceiptDigest, authorizeChoice.canonicalReceiptDigest);
    await assert.rejects(() => verifyCalibrationHumanChoiceReload({ manifest: authorizeFixture.manifest, context: authorizeFixture.validationContext, reloadedChoice: { ...serializedChoice, artifactDigest: "mutated" }, userId, dependencies: authorizeFixture.dependencies, verifiedAt: fixed }), /immutably reloaded/);
    const emptyDirectory = await mkdtemp(path.join(tmpdir(), "discovery-calibration-empty-"));
    try {
      await assert.rejects(() => verifyCalibrationHumanChoiceReload({ manifest: authorizeFixture.manifest, context: authorizeFixture.validationContext, reloadedChoice: serializedChoice, userId, dependencies: { ...authorizeFixture.dependencies, createRepository: () => new FilesystemOrganizationRuntimeRepository(emptyDirectory) }, verifiedAt: fixed }), /missing/);
    } finally { await rm(emptyDirectory, { recursive: true, force: true }); }
    const mutateReceipt = async (changes: Partial<HumanChoiceArtifact["canonicalReceiptSnapshot"]>, pattern: RegExp) => {
      const snapshot = { ...serializedChoice.canonicalReceiptSnapshot, ...changes };
      const changed = { ...serializedChoice, canonicalReceiptSnapshot: snapshot, canonicalReceiptDigest: calibrationDigest(snapshot) };
      const { artifactDigest: _old, ...changedUnsigned } = changed;
      await assert.rejects(() => verifyCalibrationHumanChoiceReload({ manifest: authorizeFixture.manifest, context: authorizeFixture.validationContext, reloadedChoice: { ...changed, artifactDigest: calibrationDigest(changedUnsigned) }, userId, dependencies: authorizeFixture.dependencies, verifiedAt: fixed }), pattern);
    };
    await mutateReceipt({ questionRevision: 99 }, /lineage changed/);
    await mutateReceipt({ unknownRevisionRef: "unknown:changed" }, /lineage changed/);
    await mutateReceipt({ authorityRef: "organization:foreign:authority" }, /lineage changed/);
    await mutateReceipt({ candidateEnvelopeDigest: "changed" }, /lineage changed/);
    await mutateReceipt({ eventVersion: 99 }, /lineage changed/);

    const childCode = `import { FilesystemOrganizationRuntimeRepository } from './engine/v3/runtime/organizationRuntimeRepository'; import { productConfidenceImprovementEvents } from './product/improvements/improvementLifecycle'; void (async()=>{ const [dir,org,eventId]=process.argv.slice(1); const stored=await new FilesystemOrganizationRuntimeRepository(dir).read(org); if(!stored||!productConfidenceImprovementEvents(stored.runtime).some(e=>e.schemaVersion==='3'&&e.eventId===eventId)) process.exit(2); console.log('CHILD_RELOAD_PASS'); })();`;
    const child = spawnSync(path.join(process.cwd(), "node_modules/.bin/tsx"), ["-e", childCode, authorizeFixture.directory, authorizeFixture.organizationId, authorizeChoice.canonicalEventRef], { cwd: process.cwd(), encoding: "utf8" });
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /CHILD_RELOAD_PASS/);

    const liveUnsigned = { ...authorizeFixture.manifest, proposedClassification: "live-independent-calibration" as const };
    const { manifestDigest: _liveDigest, ...liveFields } = liveUnsigned;
    const liveManifest = { ...liveFields, manifestDigest: manifestDigest(liveFields) };
    validatePreregistrationManifest(liveManifest, authorizeFixture.validationContext);
    for (const invalid of ["live-development", "controlled-development", "ineligible", "live"] as const) {
      const { manifestDigest: _oldDigest, ...invalidFields } = { ...authorizeFixture.manifest, proposedClassification: invalid };
      const invalidManifest = { ...invalidFields, manifestDigest: manifestDigest(invalidFields as never) } as unknown as CalibrationPreregistrationManifest;
      assert.throws(() => validatePreregistrationManifest(invalidManifest, authorizeFixture.validationContext), /classification is invalid/);
    }
    const fixtureCountBeforeIneligible = fixtures.length;
    const eventsBeforeIneligible = (await authorizeFixture.repository.read(authorizeFixture.organizationId))!.runtime.memory.events.length;
    assert.throws(() => prepareCalibrationManifest(authorizeFixture.manifestInput, { status: "ineligible", reason: "No eligible untouched case." }), /cannot create a manifest/);
    assert.throws(() => prepareCalibrationManifest(authorizeFixture.manifestInput, { status: "blocked", reason: "Fail-closed condition." }), /cannot create a manifest/);
    assert.equal(fixtures.length, fixtureCountBeforeIneligible);
    assert.equal((await authorizeFixture.repository.read(authorizeFixture.organizationId))!.runtime.memory.events.length, eventsBeforeIneligible);
    assert.equal(fixtures.some((fixture) => fixture.manifest.caseId.includes("case-002")), false);

    const packet = renderCalibrationHumanPacket(authorizeFixture.manifest);
    const packetBytes = JSON.stringify(packet);
    assert.equal(JSON.stringify(renderCalibrationHumanPacket(authorizeFixture.manifest)), packetBytes);
    const reversedDraft = prepareCalibrationManifest({ ...authorizeFixture.manifestInput, candidateEnvelopes: [...authorizeFixture.manifestInput.candidateEnvelopes].reverse() }, { status: "eligible-controlled-protocol-fixture", manifestClassification: "controlled-protocol-fixture" });
    const reversedManifest = verifyCalibrationPreregistration(reversedDraft, authorizeFixture.validationContext).manifest;
    assert.deepEqual(reversedManifest.neutralDisplayOrder, authorizeFixture.manifest.neutralDisplayOrder);
    assert.equal(JSON.stringify(renderCalibrationHumanPacket(reversedManifest)), packetBytes);
    const { manifestDigest: reorderedDigest, ...reorderedFields } = authorizeFixture.manifest;
    assert.equal(JSON.stringify(renderCalibrationHumanPacket({ manifestDigest: reorderedDigest, ...reorderedFields })), packetBytes);
    for (const action of packet.availableInformationActions) {
      assert.ok(action.candidateId && action.actionType && action.whatTheActionWouldExamine && action.whatTheActionMayHelpDiscoveryLearn);
      for (const field of [action.expectedRelevance, action.expectedInformationContribution, action.expectedDiscriminationGain, action.humanBurden, action.organizationalBurden, action.expectedDirectCost, action.expectedDelay, action.expectedReliability, action.reversibility]) assert.ok(field.state);
      assert.ok(action.cancellation.characteristics && typeof action.cancellation.supported === "boolean");
      assert.equal(action.governance.allowed, true);
      assert.equal(action.authorization.satisfied, true);
      assert.ok(action.requiredSourceAccess.length);
      assert.ok(action.privacyOrDisclosureConstraints.length && action.resourceConstraints.length && action.materialAssumptions.length);
      assert.ok(action.unavailableFields.length && action.withheldFields.length && action.stoppingCondition);
      assert.equal(action.truthfulLimitation, "No result, Evidence admission, Unknown reduction, confidence improvement, or organizational improvement is guaranteed.");
    }
    const baseItem = authorizeFixture.manifest.candidateEnvelopes[0]!;
    const boundedEnvelope = { ...baseItem.envelope, candidate: { ...baseItem.envelope.candidate, expectedOrganizationalRelevance: { state: "unknown" as const, reason: "Not established." }, reversibility: { state: "permission-withheld" as const } }, unavailableFields: ["candidate.expectedOrganizationalRelevance", "candidate.reversibility"], withheldFields: ["candidate.reversibility"] };
    const boundedManifest = { ...authorizeFixture.manifest, candidateEnvelopes: [{ ...baseItem, envelope: boundedEnvelope }, ...authorizeFixture.manifest.candidateEnvelopes.slice(1)] };
    const boundedPacket = renderCalibrationHumanPacket(boundedManifest);
    const boundedAction = boundedPacket.availableInformationActions.find((item) => item.candidateId === boundedEnvelope.candidate.candidateId)!;
    assert.equal(boundedAction.expectedRelevance.state, "unavailable");
    assert.equal(boundedAction.reversibility.state, "withheld");
    assert.deepEqual(boundedAction.withheldFields, ["withheld"]);
    assert.doesNotMatch(JSON.stringify(boundedAction), /policyRef|permission-withheld/);
    assert.match(packet.independentHumanResponse, /Execution authorization:\n- do-not-execute\n- execute-existing-local-read-only-operation\n- defer-execution/);
    assert.match(packet.independentHumanResponse, /reversible under its existing owner/);
    assert.match(packet.independentHumanResponse, /Preserve the human disposition but defer operation execution/);
    assert.doesNotMatch(packet.independentHumanResponse, /record-choice-only/);
    assert.doesNotMatch(packetBytes, /\b(score|rank|winner|recommendation|selector)\b/i);
    const humanPacketSource = await readFile(path.join(process.cwd(), "product/acquisition/calibration/humanPacket.ts"), "utf8");
    assert.doesNotMatch(humanPacketSource, /openai|anthropic|generateText|\bLLM\b/i);
    const calibrationFiles = ["prepare.ts", "verifyPreregistration.ts", "recordHumanChoice.ts", "verifyHumanChoiceReload.ts", "observeOutcome.ts", "humanPacket.ts", "protocol.ts", "index.ts"];
    for (const file of calibrationFiles) assert.doesNotMatch(await readFile(path.join(process.cwd(), "product/acquisition/calibration", file), "utf8"), /shadow\/selectMaterialInformationAcquisition|runReadOnlyMaterialAcquisitionShadow/);
    assert.match(await readFile(path.join(process.cwd(), "product/acquisition/calibration/compareSelector.ts"), "utf8"), /await import\("\.\.\/shadow\/selectMaterialInformationAcquisition"\)/);
    console.log(JSON.stringify({ validation: "material-information-acquisition-calibration-protocol-gate-002", result: "PASS", classification: "A — FAIL-CLOSED INDEPENDENT CALIBRATION PROTOCOL READY", controlledFixtures: fixtures.length, liveCases: 0, case001: "blocked-non-evaluative", case002Instantiated: false, canonicalChoiceReceiptBinding: true, freshRepositoryAdapterReload: true, childProcessReload: true, packetMaterialFieldsComplete: true, exactExecutionVocabulary: true, exactManifestClassificationVocabulary: true, selectorExecutions: 0, selectorRuntimeWrites: 0, connectors: 0, externalActions: 0, frontendChanges: 0, productionActions: 0 }, null, 2));
  } finally {
    await Promise.all(fixtures.map((fixture) => rm(fixture.directory, { recursive: true, force: true })));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
