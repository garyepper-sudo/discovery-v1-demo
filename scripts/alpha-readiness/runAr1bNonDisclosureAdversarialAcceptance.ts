import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, lstat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import net from 'node:net';
import { createHash } from 'node:crypto';
import { provisionNorthstarPreparationLineageFixture } from '../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner';
import { createLeadershipConversationServerCompositionForValidation } from '../../product/integration/leadershipConversationServerComposition';
import { projectMeetingExecutiveContinuity } from '../../product/integration/meetingExecutiveContentProjection';
import { composeChiefFirstPrepareViewFromWorkspace } from '../../product/integration/chiefLeadershipPreparationComposer';
import { compileChiefOfStaffValueLayerV1 } from '../../product/workflow/leadershipConversation/chiefCommunicationPlan';
import { reviewedCarryForwardDevelopmentTransport } from '../../product/integration/reviewedCarryForward';
import { resolveCurrentOccurrenceClosureMetadataV1, createProductWorkflowArtifactRepository, northstarLeadershipConversationFixture, NORTHSTAR_PREPARED_CONTENT, NORTHSTAR_PREPARED_LINEAGE, leadershipId } from '../../product/workflow/leadershipConversation';
import { FilesystemOrganizationRuntimeRepository } from '../../engine/v3/runtime/organizationRuntimeRepository';
import { CanonicalLocalSourceBindingService } from '../../engine/v3/governance/canonicalLocalSourceBindingService';
import { resolveScopedGovernanceContext } from '../../engine/v3/governance/scopedGovernanceContext';
import type { ScopedAuthorityGrant } from '../../engine/v3/governance/scopedGovernanceContext';
import { createProductArtifactBodyRepository, type ProductArtifactBodyRepository, type ProductArtifactBodyRefV1, type ProductArtifactBodyStageRequestV1 } from '../../product/persistence';
import type { LifecycleAwareSourceScopedTransportV1 } from '../../product/integration/sourceScopedExecutiveAnalysis';
import { sourceScopedDigest } from '../../lib/analysis/sourceScopedExecutiveAnalysisContracts';
import { safeDigest, differencePaths } from './nonDisclosureDerivedInfluenceOracle';
import { AlphaContentSafeObservabilityOwner } from '../../lib/observability/alphaContentSafeObservabilityOwner';
import { scanText } from './protectedValueScanner';
import { preflightAlphaOrganizationAccess, resolveAlphaAllowlistDisclosureDecision, buildAlphaCanonicalAuthorityReceipt, ALPHA_ALLOWLIST_POLICY_ID, ALPHA_ALLOWLIST_POLICY_VERSION, type AlphaOrganizationAccessRecord } from '../../engine/v3/governance/alphaAllowlistDisclosureProducer';
import { buildCanonicalUnderstandingCompatibilityShadow } from '../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow';
import { composeActivatedYourOrganization } from '../../components/product-shell/data/composeActivatedYourOrganization';

// Fixtures supply inputs; all publication, access, review and lifecycle operations remain real owners.
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceDirectory = path.join(repositoryRoot, 'docs/agent-work-orders/evidence/alpha-readiness/ar1b');
const evidenceNames = ['AR1B_NON_DISCLOSURE_ADVERSARIAL_ACCEPTANCE_RESULTS.json', 'AR1B_NON_DISCLOSURE_ADVERSARIAL_ACCEPTANCE_REPORT.md'];
const at = '2026-08-04T12:00:00.000Z';
// Explicit local validation composition; ambient Founder/storage configuration is forbidden.
for (const key of Object.keys(process.env)) if (/^(DISCOVERY_|NEXT_PUBLIC_DISCOVERY_|CLERK_|NEXT_PUBLIC_CLERK_|OPENAI_|ANTHROPIC_|DATABASE_)/.test(key)) delete process.env[key];
const payloads = ['AR1B inaccessible alpha: prioritize dependency review.', 'AR1B inaccessible bravo: prioritize capacity review.'] as const;
const canaries = payloads.map(value => ({ category: 'protected-fixture', value }));
const roots: string[] = [];
const telemetry: unknown[] = [];
// Exclusions are exact bytes created during lawful fixture setup, never whole directories.
const fixtureInputs = new Map<string, string>();
async function designateFixtureInputs(w: World) {
  for (const [name, digest] of Object.entries(await files(w.root))) {
    const raw = await readFile(path.join(w.root, name), 'utf8');
    if (!scanText('fixture-input', raw, canaries).length) continue;
    assert(/^(?:bodies\/organizations\/[^/]+\/owners\/[^/]+\/blobs\/[a-f0-9]+\.blob|workflow\/organizations\/[^/]+\.json)$/.test(name), 'protected fixture material escaped designated owner storage');
    const value = JSON.parse(raw);
    const allowedFields = name.startsWith('bodies/')
      ? /^\$\.(?:content\.(?:situationSummary|decisionsRequiringAttention\.\d+|questionsToResolve\.\d+)|sections\.\d+\.items\.\d+|terminalItems\.\d+\.summary)$/
      : /^\$\.(?:dispositions\.\d+\.effectivePayload\.summary|cycle1ClosureCompletions\.\d+\.sections\.\d+\.items\.\d+)$/;
    function inspect(node: unknown, field = '$') {
      if (typeof node === 'string' && scanText('fixture-field', node, canaries).length)
        assert(allowedFields.test(field), `unapproved protected fixture field: ${field}`);
      else if (node && typeof node === 'object') for (const [key, item] of Object.entries(node)) inspect(item, `${field}.${key}`);
    }
    inspect(value);
    fixtureInputs.set(path.join(w.root, name), digest);
  }
}
async function scanFixtureBoundaries() {
  let filesScanned = 0, designatedInputFiles = 0;
  for (const root of roots) for (const [name, digest] of Object.entries(await files(root))) {
    filesScanned++;
    const absolute = path.join(root, name), raw = await readFile(absolute, 'utf8');
    if (fixtureInputs.get(absolute) === digest) { designatedInputFiles++; continue; }
    assert.equal(scanText('non-input-persistence', raw, canaries).length, 0, 'protected data outside exact fixture-input manifest');
  }
  return { filesScanned, designatedInputFiles, unauthorizedPersistedFindings: 0 };
}
let phase = 'preflight';
const counts = { network: 0, provider: 0, connectors: 0, drive: 0, live: 0, deterministicTransport: 0 };
const originalConnect = net.Socket.prototype.connect, originalFetch = globalThis.fetch;
net.Socket.prototype.connect = function (): never { counts.network++; throw new Error('AR1B network forbidden'); } as typeof originalConnect;
globalThis.fetch = async () => { counts.network++; throw new Error('AR1B fetch forbidden'); };
type Identity = { userId: string; organizationId: string; questionId: string; conversationId: string; seriesId: string };
type World = { root: string; identity: Identity };
type Mode = 'allowed' | 'absent' | 'revoked' | 'stale';
class Bodies implements ProductArtifactBodyRepository {
  readonly backend = 'filesystem' as const;
  reads = 0; completedReads = 0; writes = 0;
  constructor(private delegate: ProductArtifactBodyRepository) {}
  async stage(input: ProductArtifactBodyStageRequestV1) { this.writes++; return this.delegate.stage(input); }
  async readStagedExact(ref: ProductArtifactBodyRefV1) { this.reads++; const value = await this.delegate.readStagedExact(ref); this.completedReads++; return value; }
}
function locations(root: string) { return { runtimeRoot: path.join(root, 'runtime'), workflowRoot: path.join(root, 'workflow'), sourceContentRoot: path.join(root, 'discovery-governed-source-content-northstar-preparation'), lineageFixtureRoot: root, analysisLifecycleRoot: path.join(root, 'analysis-lifecycle') }; }
function repository(w: World) { return createProductWorkflowArtifactRepository({ root: locations(w.root).workflowRoot, environment: 'test' }); }
function grants(w: World, mode: Exclude<Mode, 'allowed'>): ScopedAuthorityGrant[] {
  if (mode === 'absent') return [];
  return [{ authorityRef: 'ar1b:authority', policyRef: 'ar1b:policy', organizationId: w.identity.organizationId, subjectId: w.identity.userId, scope: { organizationId: w.identity.organizationId, type: 'organization', id: w.identity.organizationId }, operations: ['product-artifact:read', 'source-content:read-for-claim-support', 'product-artifact:prepare-again', 'product-artifact:create-successor'], sensitivity: ['standard'], relationship: 'direct', status: mode === 'revoked' ? 'revoked' : 'active', validFrom: '2026-01-01T00:00:00.000Z', ...(mode === 'revoked' ? { revokedAt: '2026-07-01T00:00:00.000Z' } : { validUntil: '2026-07-01T00:00:00.000Z' }) }];
}
function server(w: World, mode: Mode = 'allowed', fault = false) {
  const bodies = new Bodies(createProductArtifactBodyRepository({ root: path.join(w.root, 'bodies') }));
  let sourceReads = 0; const sourceReadBindings: string[] = [];
  const transport: LifecycleAwareSourceScopedTransportV1 = async input => { counts.deterministicTransport++; return reviewedCarryForwardDevelopmentTransport(input); };
  transport.withLifecycle = hooks => async input => {
    await hooks.transportEntry(); const result = await transport(input);
    assert(result && typeof result === 'object' && 'model' in result && typeof result.model === 'string');
    await hooks.responseHeaders(result.model); const bytes = JSON.stringify(result);
    await hooks.responseBody({ responseByteCount: Buffer.byteLength(bytes), responseDigest: sourceScopedDigest(bytes) });
    await hooks.candidateParsed(result.model); return result;
  };
  const instance = createLeadershipConversationServerCompositionForValidation({ ...locations(w.root), userId: w.identity.userId, organizationId: w.identity.organizationId, bodyRepository: bodies, observer: new AlphaContentSafeObservabilityOwner({ emit: event => { telemetry.push(event); } }), analysisTransport: transport, analysisModel: 'gpt-5.6-sol', ...(mode === 'allowed' ? {} : { authorityGrants: grants(w, mode) }), onProtectedSourceContentRead: input => { sourceReads++; sourceReadBindings.push(input.sourceBindingId); }, ...(fault ? { workflowFaultInjector: { beforePrepareAgain: () => { throw new Error('ar1b-isolated-interruption'); } } } : {}) });
  return { instance, bodies, reads: () => ({ artifact: bodies.reads, source: sourceReads, sourceBindingIds: [...sourceReadBindings] }) };
}
async function files(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  async function walk(directory: string) { for (const name of (await readdir(directory)).sort()) { const p = path.join(directory, name), s = await lstat(p); assert(!s.isSymbolicLink(), 'fixture must not contain symlinks'); if (s.isDirectory()) await walk(p); else if (s.isFile()) result[path.relative(root, p)] = createHash('sha256').update(await readFile(p)).digest('hex'); } }
  await walk(root); return result;
}
async function clone(w: World, label: string): Promise<World> {
  const root = await mkdtemp(path.join(tmpdir(), `discovery-northstar-preparation-lineage-ar1b-${label}-`)); roots.push(root);
  await cp(w.root, root, { recursive: true }); assert.deepEqual(await files(root), await files(w.root));
  const copied = { root, identity: { ...w.identity } }; await designateFixtureInputs(copied); return copied;
}
async function seed(): Promise<World> {
  const root = await mkdtemp(path.join(tmpdir(), 'discovery-northstar-preparation-lineage-ar1b-seed-')); roots.push(root);
  const provisioned = await provisionNorthstarPreparationLineageFixture({ environment: 'test', fixtureRoot: root, now: at });
  const fixture = northstarLeadershipConversationFixture(provisioned.seed.productQuestionId);
  const identity = { userId: fixture.actorId, organizationId: fixture.organizationId, questionId: fixture.questionId, conversationId: fixture.conversationId, seriesId: `leadership-conversation-series:${fixture.conversationId}` };
  const w = { root, identity }; await mkdir(locations(root).analysisLifecycleRoot, { recursive: true, mode: 0o700 });
  const s = server(w).instance;
  await s.recordContext({ ...identity, idempotencyKey: 'ar1b:context', title: 'Weekly review', purpose: 'Resolve a constraint', intendedOutcome: 'Choose one action', timeframe: 'Weekly', participants: [{ participantRef: `participant:${identity.userId}`, displayName: 'Designated leader', titleLabel: 'Leader' }], leaderContext: null });
  const context = (await repository(w).read(identity.organizationId)).store.contexts[0]!;
  await s.recordPreparation({ ...identity, idempotencyKey: 'ar1b:prepare', contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null, stableCreatedAt: at });
  return w;
}
function semantic(workspace: Awaited<ReturnType<ReturnType<typeof server>['instance']['workspace']>>) {
  assert(workspace.currentPreparedWorkProduct, 'available semantic projection requires Prepared Work');
  const prepare = composeChiefFirstPrepareViewFromWorkspace(workspace), layer = compileChiefOfStaffValueLayerV1(prepare);
  const items = (values: typeof layer.attention) => values.map(({ text, status, sourceRole }) => ({ text, status, sourceRole }));
  return { available: true, summary: prepare.whatMattersNow, priority: items(layer.attention), recommendation: { questions: items(layer.questions), acquisition: items(layer.acquisition) }, workspace: { summary: prepare.whatMattersNow, tension: items(layer.tensions), uncertainty: items(layer.unknowns), changed: prepare.whatChanged, step: workspace.currentStep }, historical: { changed: items(layer.changed), priorCycle: prepare.priorCycle }, whatChanged: workspace.closeContinuation?.sections ?? [] };
}
async function observe(w: World, mode: Mode, conversationId = w.identity.conversationId) {
  const before = await files(w.root), s = server(w, mode);
  let output: ReturnType<typeof semantic> | null = null;
  let outcome: 'available' | 'owner-denied' = 'available';
  try {
    const workspace = await s.instance.workspace({ ...w.identity, conversationId });
    if (mode !== 'allowed') assert.equal(scanText('raw-denied-workspace', JSON.stringify(workspace), canaries).length, 0);
    output = semantic(workspace);
  } catch (error) {
    assert.notEqual(mode, 'allowed', 'authorized projection must not throw');
    assert(error instanceof Error && /(?:current access|authority|governed scope).*unavailable/i.test(error.message), 'unexpected denied projection error');
    outcome = 'owner-denied';
  }
  if (mode !== 'allowed') assert.equal(scanText('raw-denied-projection', JSON.stringify(output), canaries).length, 0);
  assert.deepEqual(await files(w.root), before, 'projection must be read-only');
  return { outcome, output, reads: s.reads() };
}
function compare(a: unknown, b: unknown, equality = true) {
  const paths = differencePaths(a, b); assert.equal(paths.length === 0, equality, `semantic twin expectation: ${paths.join(', ')}`);
  return { digestA: safeDigest(a), digestB: safeDigest(b), differencePaths: paths, expectedEquality: equality, actualEquality: paths.length === 0 };
}
function safeSemantic(value: unknown): unknown { if (typeof value === 'string') { const index = canaries.findIndex(canary => canary.value === value); return index >= 0 ? `<protected-fixture-${index}>` : value; } if (Array.isArray(value)) return value.map(safeSemantic); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, safeSemantic(item)])); return value; }

async function atomicDenial(w: World, mode: Exclude<Mode, 'allowed'>) {
  const state = await repository(w).read(w.identity.organizationId);
  const publication = state.store.preparedWorkPublications!.at(-1)!;
  const reader = server(w, mode), before = await files(w.root);
  const result = await reader.instance.productArtifactAccess.readAuthorized({
    contractVersion: '1', organizationId: w.identity.organizationId, subjectId: w.identity.userId,
    artifactType: 'prepared-work', artifactId: publication.artifactId, artifactRevision: publication.artifactRevision,
    operation: 'product-artifact:read', purpose: 'leadership-conversation-capture',
    scopeDigest: publication.materialLineage!.scopeDigest!, sensitivity: 'standard', evaluatedAt: at,
    project: bytes => JSON.parse(new TextDecoder().decode(bytes)),
  });
  assert.equal(result.disposition, 'inaccessible'); assert.equal(result.value, null);
  assert.equal(reader.bodies.reads, 0); assert.equal(reader.bodies.completedReads, 0);
  assert.deepEqual(await files(w.root), before);
  const visible = await observe(w, mode);
  assert.equal(visible.outcome, 'owner-denied'); assert.equal(visible.output, null);
  assert.equal(visible.reads.artifact + visible.reads.source, 0);
  return { property: 'atomic-denial', ownerDisposition: result.disposition, workspaceOutcome: visible.outcome,
    available: false, unauthorizedProtectedReadAttempts: 0, unauthorizedProtectedReadCompletions: 0,
    publicationIdentityDigest: safeDigest([publication.artifactId, publication.artifactRevision]), unchanged: true };
}

async function organizationalDisclosure(w: World) {
  const identity = { consumerId: w.identity.userId, provider: 'clerk' as const, verificationId: 'ar1b:verified-fixture', verifiedAt: at };
  const access: AlphaOrganizationAccessRecord = { accessRecordId: 'ar1b:organization-access',
    policyId: ALPHA_ALLOWLIST_POLICY_ID, policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId: identity.consumerId, organizationId: w.identity.organizationId, relationship: 'allowed_alpha_user',
    supportedExperiences: ['organization'], scope: { type: 'organization', organizationId: w.identity.organizationId },
    status: 'active', createdAt: at };
  const request = { identity, organizationId: w.identity.organizationId, experience: 'organization', resolvedAt: at };
  const preflight = preflightAlphaOrganizationAccess(request, { findAccessRecords: () => [access] });
  assert.equal(preflight.disposition, 'eligible');
  // Same order as the Product loader: organization preflight precedes Runtime read.
  const stored = await new FilesystemOrganizationRuntimeRepository(locations(w.root).runtimeRoot).read(w.identity.organizationId);
  assert(stored); const baseline = stored.runtime, before = await files(w.root);
  const baselineCompositions = baseline.memory.organizationalUnderstandingState.canonicalCompositions;
  assert(baselineCompositions.length > 0);
  const observations = [];
  for (const variant of [null, 0, 1] as const) {
    const runtime = structuredClone(baseline);
    if (variant !== null) {
      const explanation = structuredClone(runtime.memory.organizationalExplanations.find(value => value.claim));
      assert(explanation?.claim);
      explanation.id = 'ar1b:withheld-explanation';
      explanation.claim.outcomeRefs = [{ ...explanation.claim.outcomeRefs[0]!, id: 'ar1b:withheld-outcome' }];
      // Uncertainty is existing derived Runtime content, not source-body storage.
      explanation.uncertainty = [payloads[variant]];
      const implicit = buildCanonicalUnderstandingCompatibilityShadow({ organizationId: w.identity.organizationId,
        explanations: [explanation], authorityTransitionMode: 'implicit', previousCompositions: [], now: at });
      assert.equal(implicit.length, 1); assert.equal(implicit[0]!.authorityTransition, undefined);
      runtime.memory.organizationalExplanations.push(explanation);
      runtime.memory.organizationalUnderstandingState.canonicalCompositions.push(...implicit);
    }
    assert.deepEqual(runtime.memory.organizationalUnderstandingState.canonicalCompositions.slice(0, baselineCompositions.length), baselineCompositions);
    const compositions = runtime.memory.organizationalUnderstandingState.canonicalCompositions;
    const resolution = resolveAlphaAllowlistDisclosureDecision({ ...request, experience: 'organization',
      requestedCompositions: compositions, authorityReceipts: compositions.flatMap(value => {
        const receipt = buildAlphaCanonicalAuthorityReceipt(value); return receipt ? [receipt] : [];
      }), preflight });
    assert.equal(resolution.provenance.disposition, variant === null ? 'disclosed' : 'partially-disclosed');
    const projected = composeActivatedYourOrganization({ runtime, identity, resolution, resolvedAt: at });
    assert.equal(projected.status, 'available', 'OU lawful Product projection must survive');
    assert(projected.status === 'available');
    assert.equal(scanText('ou-visible-view', JSON.stringify(projected.view), canaries).length, 0);
    const anchor = projected.projection.understandings.map(value => value.value);
    assert(anchor.length > 0); assert.deepEqual(anchor, baselineCompositions);
    const visible = structuredClone(projected.view);
    // The renderer does not consume these two audit identities. Keep every other view field.
    const metadata = visible.runtimeSections.currentUnderstanding.projectionMetadata;
    assert(metadata);
    metadata.disclosureDecisionId = '<audit-identity>';
    metadata.projectionId = '<audit-identity>';
    observations.push({ available: true, anchorDigest: safeDigest(anchor), view: visible,
      disposition: resolution.provenance.disposition });
  }
  assert.deepEqual(await files(w.root), before);
  assert.equal(observations[0]!.anchorDigest, observations[1]!.anchorDigest);
  assert.equal(observations[0]!.anchorDigest, observations[2]!.anchorDigest);
  return { property: 'surviving-lawful-disclosure', surface: '/your-organization',
    available: observations.map(value => value.available), lawfulAnchorPresent: true,
    lawfulAnchorDigest: observations[0]!.anchorDigest,
    CA: compare(observations[0]!.view, observations[1]!.view), CB: compare(observations[0]!.view, observations[2]!.view),
    AB: compare(observations[1]!.view, observations[2]!.view), outcomes: observations.map(value => value.disposition),
    runtimeReadsAfterOrganizationAuthorization: 1, protectedSourceBodyReads: 0,
    sourceBodyAccessExercised: false, sourceBodyHookObservation: 'not exercised by Organizational Understanding surface', sourceBodyNonInfluenceClaimed: false,
    positiveCouplingClaimed: false, durableDisclosureTransactionExercised: false,
    limitation: 'Already-derived Runtime disclosure only; no same-material authority promotion or source-body claim.' };
}

async function prepareTwin(w: World, variant: 0 | 1) {
  const r = await repository(w).read(w.identity.organizationId), content = { ...NORTHSTAR_PREPARED_CONTENT, situationSummary: payloads[variant], decisionsRequiringAttention: [payloads[variant]], questionsToResolve: [`What evidence resolves this choice: ${payloads[variant]}`] };
  const input = { ...w.identity, idempotencyKey: 'ar1b:protected-prepare', contextVersionId: r.store.contexts[0]!.contextVersionId, content, lineage: NORTHSTAR_PREPARED_LINEAGE, stableCreatedAt: at, changeSummary: null };
  await server(w).instance.recordPreparation(input);
  await designateFixtureInputs(w);
  return { lawfulInputDigest: safeDigest({ ...input, content: { ...content, situationSummary: '<protected>', decisionsRequiringAttention: ['<protected>'], questionsToResolve: ['<protected>'] } }), payloadDigest: safeDigest(payloads[variant]) };
}
async function readyForReview(w: World) {
  const r = repository(w), s = server(w).instance;
  let state = await r.read(w.identity.organizationId);
  await s.freeze({ ...w.identity, idempotencyKey: 'ar1b:freeze', artifactVersionId: state.store.preparedWorkPublications!.at(-1)!.artifactRevision, privateWorkingContribution: { seriesId: w.identity.seriesId, occurrenceId: w.identity.conversationId, authorizationRevision: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision, provenanceDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest, selectedContent: [] } });
  state = await r.read(w.identity.organizationId);
  await s.captureFrozenPrivateWorkingContribution({ ...w.identity, idempotencyKey: 'ar1b:capture', snapshotId: state.store.frozenSnapshotPublications![0]!.artifactId });
  await s.buildMeetingPack(w.identity); await s.beginReviewedCarryForwardFromMeetingPack(w.identity);
}
async function lifecycle(w: World, variant?: 0 | 1) {
  const r = repository(w), s = server(w).instance;
  const { seriesId: _seriesId, ...reviewIdentity } = w.identity;
  let state = await r.read(w.identity.organizationId);
  const initialPublicationCount = state.store.preparedWorkPublications!.length;
  if (!state.store.proposals.length) await readyForReview(w);
  state = await r.read(w.identity.organizationId); const proposals = state.store.proposals;
  assert(proposals.length >= 3 && proposals.length <= 7); assert(proposals.every(p => p.contractVersion === '3' && p.reviewedCarryForward));
  const reviewRequests = proposals.map(p => ({ ...reviewIdentity, proposalId: p.proposalId,
    disposition: p.kind === 'unknown' ? 'deferred' as const : variant !== undefined && p.kind === 'commitment' ? 'approved-with-edit' as const : 'approved' as const,
    effectivePayload: variant !== undefined && p.kind === 'commitment' ? { ...p.payload, summary: payloads[variant] } : null,
    reason: null, idempotencyKey: `ar1b:review:${p.kind}` }));
  for (const request of reviewRequests) { await s.review(request); await designateFixtureInputs(w); }
  // Same owner/key, conflicting content: fail before a second disposition can persist.
  const reviewed = await files(w.root), original = reviewRequests[0]!;
  await assert.rejects(() => s.review({ ...original, disposition: 'rejected' }), /(?:[Ii]dempotency|conflict)/);
  assert.deepEqual(await files(w.root), reviewed);
  await s.review(original); assert.deepEqual(await files(w.root), reviewed);
  for (const p of proposals.filter(p => p.kind !== 'unknown')) { const current = await s.workspace(w.identity); await s.ensureReviewedCarryForwardRoute({ ...w.identity, proposalId: p.proposalId, purposeRef: 'leadership-conversation-capture', expectedWorkflowRevision: current.workflowRevision, idempotencyKey: `ar1b:route:${p.kind}` }); }
  state = await r.read(w.identity.organizationId); const before = await files(w.root);
  await assert.rejects(() => s.completeCycle1Closure({ ...w.identity, idempotencyKey: 'ar1b:early-close', expectedWorkflowRevision: state.revision, authorizedProjectionDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision, personalRoomSheetDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest, candidateAssessmentDigest: null, b11CommunicationDigest: null }), /reviewed completion/);
  assert.deepEqual(await files(w.root), before);
  await designateFixtureInputs(w);
  const completion = await s.completeReviewedCarryForward({ ...w.identity, idempotencyKey: 'ar1b:complete', expectedWorkflowRevision: state.revision });
  assert.equal(completion.counts.unresolved, 0); assert.equal(completion.counts.routePending, 0);
  const interrupted = await server(w, 'allowed', true).instance.closeAndContinue(w.identity);
  assert.equal(interrupted.status, 'partial');
  await designateFixtureInputs(w);
  state = await r.read(w.identity.organizationId);
  assert.equal(state.store.cycle1ClosureCompletions?.length, 1); assert.equal(state.store.whatChangedPublications?.length, 1); assert.equal(state.store.futurePreparationLinks.length, 0);
  const contenders = await Promise.all([s.closeAndContinue(w.identity), server(w).instance.closeAndContinue(w.identity)]);
  assert(contenders.some(value => ['complete', 'already-complete'].includes(value.status)));
  assert(contenders.every(value => ['complete', 'already-complete', 'partial', 'saved-refresh-required'].includes(value.status)));
  const resumed = await s.closeAndContinue(w.identity); assert.equal(resumed.status, 'already-complete');
  await designateFixtureInputs(w);
  const saved = await files(w.root), replay = await s.closeAndContinue(w.identity);
  assert.equal(replay.status, 'already-complete'); assert.deepEqual(await files(w.root), saved);
  state = await r.read(w.identity.organizationId); assert.equal(state.store.reviewedCarryForwardCompletions?.length, 1); assert.equal(state.store.futurePreparationLinks.length, 1);
  const link = state.store.futurePreparationLinks[0]!; assert.equal(link.nextConversationId, leadershipId('leadership-conversation', w.identity.seriesId, 'occurrence', 2));
  assert.equal(state.store.contexts.length, 2); assert.equal(state.store.preparedWorkPublications?.length, initialPublicationCount + 1);
  // Materially incompatible same-key successor and wrong-series closure replays cannot persist.
  const closure = state.store.cycle1ClosureCompletions![0]!;
  const beforeConflicts = await files(w.root);
  await assert.rejects(() => s.prepareAgain({ ...w.identity, idempotencyKey: `prepare-again:link:${closure.closureId}`, nextConversationId: link.nextConversationId, nextContextVersionId: link.nextContextVersionId, nextPreparedWorkProductVersionId: 'ar1b:wrong-publication' }), /(?:[Ii]dempotency|conflict)/);
  await assert.rejects(() => s.completeCycle1Closure({ ...w.identity, seriesId: 'ar1b:wrong-series', idempotencyKey: `reviewed-meeting-pack-closure:${w.identity.conversationId}`, expectedWorkflowRevision: state.revision, authorizedProjectionDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest, personalRoomSheetDigest: null, candidateAssessmentDigest: null, b11CommunicationDigest: null }));
  assert.deepEqual(await files(w.root), beforeConflicts);
  await designateFixtureInputs(w);
  return { conflictingSuccessorRejected: true, wrongSeriesClosureRejected: true, inputSequenceDigest: safeDigest({ identity: w.identity, reviewRequests: reviewRequests.map(request => request.effectivePayload ? { ...request, effectivePayload: { ...request.effectivePayload, summary: '<protected-correction>' } } : request), routeOrder: proposals.filter(p => p.kind !== 'unknown').map(p => p.proposalId), completionKey: 'ar1b:complete', closure: w.identity, recovery: 'same request; interrupted, two concurrent contenders, exact replay' }), conflictingReviewRejected: true, reviewReplayUnchanged: true, concurrentReentry: 2, preCompletionClosureRejected: true, completionCounts: completion.counts, proposals: proposals.length, closure: 1, whatChanged: 1, successors: 1, occurrence3: 0, replay: replay.status, interruptedStage: interrupted.stage, nextId: link.nextConversationId };
}
async function legacyContinuation(baseline: World) {
  const w = await clone(baseline, 'legacy'), s = server(w).instance, repo = repository(w);
  const { seriesId: _seriesId, ...identity } = w.identity;
  const request = await freezeHistory(w);
  await s.captureFrozenPrivateWorkingContribution({ ...identity, snapshotId: request.predecessorCheckpointId, idempotencyKey: 'ar1b:legacy-capture' });
  const fixture = northstarLeadershipConversationFixture(w.identity.questionId);
  await s.receiveUpload({ ...identity, idempotencyKey: 'ar1b:legacy-upload', frozenSnapshotId: request.predecessorCheckpointId,
    purposeRef: 'leadership-conversation-capture', mediaType: 'text/plain', bytes: fixture.captureBytes,
    displayLabel: 'Isolated review notes', originalFilename: null });
  let state = await repo.read(w.identity.organizationId);
  await s.beginReviewedCarryForward({ ...identity, uploadReceiptId: state.store.uploadReceipts.at(-1)!.uploadReceiptId, idempotencyKey: 'ar1b:legacy-admit' });
  state = await repo.read(w.identity.organizationId);
  assert.equal(state.store.proposals.length, 5); assert(state.store.proposals.every(value => value.contractVersion === '2'));
  for (const proposal of state.store.proposals) await s.review({ ...identity, proposalId: proposal.proposalId,
    disposition: 'rejected', effectivePayload: null, reason: null, idempotencyKey: `ar1b:legacy-review:${proposal.kind}` });
  state = await repo.read(w.identity.organizationId);
  await s.completeReviewedCarryForward({ ...identity, idempotencyKey: 'ar1b:legacy-complete', expectedWorkflowRevision: state.revision });
  state = await repo.read(w.identity.organizationId);
  const metadata = resolveCurrentOccurrenceClosureMetadataV1({ ...identity, store: state.store });
  await s.completeCycle1Closure({ ...identity, seriesId: w.identity.seriesId, expectedWorkflowRevision: state.revision,
    idempotencyKey: 'ar1b:legacy-close', authorizedProjectionDigest: metadata.authorizedProjectionDigest,
    personalRoomSheetDigest: metadata.personalRoomSheetDigest, candidateAssessmentDigest: null, b11CommunicationDigest: null });
  await s.publishClosureWhatChanged(identity);
  state = await repo.read(w.identity.organizationId);
  assert.equal(state.store.cycle1ClosureCompletions![0]!.contractVersion, '1');
  const closed = await files(w.root), denied = await clone(w, 'legacy-revoked');
  const revokedBindingId = (await repository(denied).read(denied.identity.organizationId)).store.preparedWorkPublications!.at(-1)!.materialLineage!.sourceContentVersions[0]!.sourceBindingId;
  await revokeExactSource(denied);
  const revokedBefore = await files(denied.root), deniedReader = server(denied);
  const historical = await deniedReader.instance.productArtifactAccess.readHistoricalPredecessor(await historyRequest(denied));
  assert.equal(historical.outcome, 'revoked'); assert.equal(historical.projection, null);
  assert.equal(deniedReader.bodies.reads, 0); assert.equal(deniedReader.bodies.completedReads, 0);
  const historicalDeniedReads = deniedReader.reads();
  // This fixture shares required current Evidence with the revoked predecessor.
  // The real owner must deny, not invent an independently lawful fallback.
  const deniedBeforePrepare = await files(denied.root), deniedReadsBeforePrepare = deniedReader.reads();
  await assert.rejects(() => deniedReader.instance.prepareNextOccurrence({ ...identity }), /unavailable/i);
  assert.equal(deniedReader.bodies.reads, deniedReadsBeforePrepare.artifact); assert.equal(deniedReader.bodies.completedReads, 0);
  assert(!deniedReader.reads().sourceBindingIds.includes(revokedBindingId), 'revoked source body was completed');
  assert.deepEqual(await files(denied.root), deniedBeforePrepare);
  const coldDenied = server(denied);
  await assert.rejects(() => coldDenied.instance.prepareNextOccurrence({ ...identity }), /unavailable/i);
  assert.equal(coldDenied.bodies.reads, 0); assert.equal(coldDenied.bodies.completedReads, 0);
  assert(!coldDenied.reads().sourceBindingIds.includes(revokedBindingId));
  const deniedWorker = child(denied, 'allowed', denied.identity.conversationId, false, true);
  assert.equal(deniedWorker.outcome, 'owner-denied'); assert.equal(deniedWorker.reads.artifact, 0); assert(!deniedWorker.reads.sourceBindingIds.includes(revokedBindingId));
  assert.deepEqual(await files(denied.root), revokedBefore);
  assert.deepEqual(await files(denied.root), revokedBefore);
  const next = await s.prepareNextOccurrence(identity);
  const reloaded = await s.workspace({ ...identity, conversationId: next.nextWorkspace.conversationId });
  const predecessor = await s.workspace(identity);
  const continuity = projectMeetingExecutiveContinuity(predecessor);
  assert(predecessor.closureCompletion); assert(continuity.workflowDetails.length > 0);
  const prepare = composeChiefFirstPrepareViewFromWorkspace(reloaded);
  assert(prepare.whatMattersNow.length > 0); assert.equal(next.nextPrepare.priorCycle.status, 'completed');
  assert.deepEqual(prepare.whatMattersNow, next.nextPrepare.whatMattersNow);
  assert.equal(prepare.whatMattersNow[0], NORTHSTAR_PREPARED_CONTENT.situationSummary);
  assert.deepEqual((await repo.read(w.identity.organizationId)).store.cycle1ClosureCompletions, state.store.cycle1ClosureCompletions);
  const after = await files(w.root); assert.notDeepEqual(after, closed);
  await s.prepareNextOccurrence(identity); assert.deepEqual(await files(w.root), after);
  return { property: 'HISTORICAL_POLICY', surface: 'legacy shared-support continuation', owner: 'historical current-access owner → Prepare Again owner', closureVersion: '1', availableHistoricalPrepare: true,
    samePublicationSemanticPositive: true, revokedHistoricalOutcome: historical.outcome,
    sharedRequiredCurrentSupport: true, revokedContinuationDenied: true, replayUnchanged: true,
    independentSupportFallbackExecuted: false,
    denialAttribution: { historical: { artifactBodyAttempts: historicalDeniedReads.artifact, artifactBodyCompletions: deniedReader.bodies.completedReads, sourceBodyCompletionHooks: historicalDeniedReads.source }, warmPrepare: { artifactBodyAttempts: deniedReadsBeforePrepare.artifact, artifactBodyCompletions: deniedReader.bodies.completedReads, sourceBodyCompletionHooks: deniedReader.reads().source }, coldPrepare: { artifactBodyAttempts: coldDenied.bodies.reads, artifactBodyCompletions: coldDenied.bodies.completedReads, sourceBodyCompletionHooks: coldDenied.reads().source }, freshPrepare: { artifactBodyAttempts: deniedWorker.reads.artifact, sourceBodyCompletionHooks: deniedWorker.reads.source }, revokedHistoricalSourceBodyCompletions: 0, measuredHookCompletions: deniedReader.reads().source + coldDenied.reads().source + deniedWorker.reads.source, authorizationBasis: 'source-audited governed owner enforcement; no independent authorization instrumentation', ownerRuntimeInspection: 'not independently instrumented' },
    denialReplayReconstruction: { warm: 'typed denial', cold: 'typed denial', freshProcess: safeChild(deniedWorker), writes: 0 },
    topologyFinding: { independentHistoricalCurrentSupportReachable: false, basis: 'source-audited owner conflict; independent fallback is not executed' },
    limitation: 'Shared-support revocation must deny; lawful current source reads may precede exact-set denial, so no whole-set pre-read claim is made. Independently supported fallback is not reachable through the current public owner sequence.' };
}

async function artifactChecks(w: World) {
  const state = await repository(w).read(w.identity.organizationId), publication = state.store.preparedWorkPublications![0]!;
  const base = { contractVersion: '1' as const, organizationId: w.identity.organizationId, subjectId: w.identity.userId, artifactType: 'prepared-work', artifactId: publication.artifactId, artifactRevision: publication.artifactRevision, operation: 'product-artifact:read' as const, purpose: 'leadership-conversation-capture', scopeDigest: publication.materialLineage!.scopeDigest!, sensitivity: 'standard' as const, evaluatedAt: at };
  const cases = { foreignOrganization: { organizationId: 'ar1b:foreign' }, foreignParticipant: { subjectId: 'ar1b:foreign' }, missingArtifact: { artifactId: 'ar1b:missing' }, malformedRevision: { artifactRevision: '' }, staleRevision: { artifactRevision: 'ar1b:stale' } };
  const results: Record<string, unknown> = {};
  const positive = server(w);
  assert.equal((await positive.instance.productArtifactAccess.readAuthorized({ ...base, project: () => true })).disposition, 'eligible');
  assert(positive.bodies.reads > 0);
  for (const [name, change] of Object.entries(cases)) { const s = server(w), before = await files(w.root); let eligible = false;
    try { const result = await s.instance.productArtifactAccess.readAuthorized({ ...base, ...change, project: () => true }); eligible = result.disposition === 'eligible'; } catch { /* real owner rejected */ }
    assert.equal(eligible, false, name); assert.equal(s.bodies.reads, 0, name); assert.deepEqual(await files(w.root), before);
    results[name] = { eligible, protectedReads: s.reads() };
  }
  for (const [name, change] of Object.entries({ foreignQuestion: { questionId: 'ar1b:foreign' }, foreignSeries: { seriesId: 'ar1b:foreign' }, foreignOccurrence: { occurrenceId: 'ar1b:foreign' } })) {
    const s = server(w), before = await files(w.root); let eligible = false;
    try { const result = await s.instance.analyzeSourceScopedForDevelopment({ ...w.identity, occurrenceId: w.identity.conversationId, ...change }); eligible = result.result.status === 'eligible'; } catch { /* real identity owner rejected */ }
    assert.equal(eligible, false, name); assert.equal(s.reads().source, 0, name); assert.deepEqual(await files(w.root), before); results[name] = { eligible, protectedSourceReads: 0 };
  }
  return results;
}
async function freezeHistory(w: World) {
  const state = await repository(w).read(w.identity.organizationId);
  const publication = state.store.preparedWorkPublications!.at(-1)!;
  await server(w).instance.freeze({ ...w.identity, idempotencyKey: 'ar1b:history-freeze', artifactVersionId: publication.artifactRevision, privateWorkingContribution: { seriesId: w.identity.seriesId, occurrenceId: w.identity.conversationId, authorizationRevision: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision, provenanceDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest, selectedContent: [] } });
  return historyRequest(w);
}
async function historyRequest(w: World) {
  const state = await repository(w).read(w.identity.organizationId);
  const frozen = state.store.frozenSnapshotPublications![0]!;
  const prepared = state.store.preparedWorkPublications!.find(p => p.artifactRevision === frozen.preparedWorkProductVersionId)!;
  assert(prepared && frozen);
  return { contractVersion: '2' as const, organizationId: w.identity.organizationId, predecessorArtifactOrganizationId: w.identity.organizationId, productQuestionId: w.identity.questionId, meetingSeriesId: w.identity.seriesId, predecessorOccurrenceId: w.identity.conversationId, predecessorConversationId: w.identity.conversationId, predecessorCheckpointId: frozen.artifactId, subjectId: w.identity.userId, artifactId: prepared.artifactId, artifactRevision: prepared.artifactRevision, headerDigest: prepared.headerDigest, bodyRefDigest: prepared.protectedBody.refDigest, purpose: 'leadership-conversation-capture', scopeDigest: prepared.materialLineage!.scopeDigest!, sensitivity: 'standard' as const, evaluatedAt: at };
}
async function revokeExactSource(w: World) {
  const workflow = await repository(w).read(w.identity.organizationId);
  const publication = workflow.store.preparedWorkPublications![0]!;
  const source = publication.materialLineage!.sourceContentVersions[0]!;
  const r = new FilesystemOrganizationRuntimeRepository(locations(w.root).runtimeRoot), stored = await r.read(w.identity.organizationId); assert(stored);
  const binding = stored.runtime.memory.canonicalScopeLineageIndex!.sourceBindings.find(b => b.bindingId === source.sourceBindingId)!; assert(binding);
  const authorization = resolveScopedGovernanceContext({ organizationId: w.identity.organizationId, subjectId: w.identity.userId, requestedScope: binding.assertions[0]!.scope, operation: 'source-binding:revise-availability', purpose: 'leadership-conversation-capture', sensitivity: 'standard', evaluatedAt: at, temporal: { mode: 'current' }, serverResolvedAuthority: [{ authorityRef: 'ar1b:revoke', policyRef: 'ar1b:policy', organizationId: w.identity.organizationId, subjectId: w.identity.userId, scope: binding.assertions[0]!.scope, operations: ['source-binding:revise-availability'], sensitivity: ['standard'], relationship: 'direct', status: 'active', validFrom: '2026-01-01T00:00:00.000Z' }] });
  await new CanonicalLocalSourceBindingService(r, { now: () => at }).reviseCanonicalSourceBindingAvailability({ contractVersion: '1', organizationId: w.identity.organizationId, productQuestionId: w.identity.questionId, sourceType: binding.sourceType as 'markdown-upload', purposeRef: 'leadership-conversation-capture', normalizedContentDigest: binding.source.normalizedContentDigest, requestedScopeAssertions: binding.assertions, sensitivity: 'standard', availability: 'revoked', recordedAt: at, recordedByActorRef: w.identity.userId, idempotencyKey: 'ar1b:revoke', expectedRuntimeRevision: stored.revision, operation: { requestId: 'ar1b:revoke', operatorId: w.identity.userId }, authorization });
}
async function historicalControls(a: World, b: World) {
  const results = [];
  for (const w of [a, b]) {
    const request = await freezeHistory(w), warm = server(w);
    const positive = await warm.instance.productArtifactAccess.readHistoricalPredecessor(request);
    assert.equal(positive.outcome, 'accessible'); assert(positive.projection); assert(warm.bodies.reads > 0);
    const boundaries: Record<string, string> = {};
    const changes = [
      ['malformed', { bodyRefDigest: 'malformed' }], ['stale', { predecessorOccurrenceId: 'stale-occurrence' }],
      ['foreign', { predecessorArtifactOrganizationId: 'foreign-organization' }], ['absent', { artifactId: 'absent-artifact' }],
      ['withheld', { subjectId: 'foreign-participant' }],
    ] as const;
    for (const [outcome, change] of changes) {
      const reads = warm.reads(), before = await files(w.root);
      const denied = await warm.instance.productArtifactAccess.readHistoricalPredecessor({ ...request, ...change });
      assert.equal(denied.outcome, outcome); assert.equal(denied.projection, null); assert.deepEqual(warm.reads(), reads); assert.deepEqual(await files(w.root), before);
      boundaries[outcome] = denied.outcome;
    }
    // Corrupt copies only: actual metadata-owner ambiguity and lineage-integrity controls.
    for (const mutation of ['ambiguous', 'lineage-tampered'] as const) {
      const corrupt = await clone(w, mutation), repo = repository(corrupt), state = await repo.read(w.identity.organizationId), store = structuredClone(state.store);
      const publication = store.preparedWorkPublications!.find(p => p.artifactRevision === request.artifactRevision)!;
      if (mutation === 'ambiguous') store.preparedWorkPublications!.push(structuredClone(publication));
      else publication.headerDigest = 'tampered-header';
      await repo.replace(w.identity.organizationId, store, state.revision);
      await designateFixtureInputs(corrupt);
      const reader = server(corrupt), before = await files(corrupt.root);
      const denied = await reader.instance.productArtifactAccess.readHistoricalPredecessor(request);
      assert.equal(denied.outcome, mutation === 'ambiguous' ? 'ambiguous' : 'malformed'); assert.equal(denied.projection, null); assert.equal(reader.bodies.reads, 0); assert.deepEqual(await files(corrupt.root), before);
      boundaries[mutation] = denied.outcome;
    }
    await revokeExactSource(w);
    const before = await files(w.root), reads = warm.reads();
    const denied = await warm.instance.productArtifactAccess.readHistoricalPredecessor(request);
    assert.equal(denied.outcome, 'revoked'); assert.equal(denied.projection, null); assert.deepEqual(warm.reads(), reads);
    const cold = server(w), fresh = await cold.instance.productArtifactAccess.readHistoricalPredecessor(request);
    assert.equal(fresh.outcome, 'revoked'); assert.equal(fresh.projection, null); assert.equal(cold.bodies.reads, 0);
    assert.deepEqual(await files(w.root), before);
    const observation = { outcome: denied.outcome, projection: denied.projection };
    assert.equal(scanText('raw-historical-denial', JSON.stringify(observation), canaries).length, 0);
    const worker = child(w, 'allowed', w.identity.conversationId, true);
    assert.equal(worker.outcome, 'revoked'); assert.equal(worker.reads.artifact + worker.reads.source, 0); assert.deepEqual(await files(w.root), before);
    assert.equal(warm.bodies.reads, reads.artifact); assert.equal(warm.bodies.completedReads, reads.artifact);
    results.push({ positive: safeSemantic(positive.projection.content), observation, boundaries, warmReadDelta: warm.bodies.reads - reads.artifact, coldReads: cold.bodies.reads, freshWorker: worker });
  }
  return { positive: { property: 'LAWFUL_POSITIVE', ...compare(results[0]!.positive, results[1]!.positive, false) }, revoked: { property: 'ATOMIC_DENIAL', outcomes: results.map(value => value.observation.outcome), available: false }, boundaries: results[0]!.boundaries, warmReadDelta: results.map(r => r.warmReadDelta), coldReads: results.map(r => r.coldReads), freshProcessDenial: results.map(r => safeChild(r.freshWorker)) };
}
async function sourceDigest() {
  const paths = ['scripts/alpha-readiness/runAr1bNonDisclosureAdversarialAcceptance.ts', 'scripts/alpha-readiness/nonDisclosureDerivedInfluenceOracle.ts', 'scripts/alpha-readiness/protectedValueScanner.ts', 'product/integration/leadershipConversationServerComposition.ts', 'product/integration/canonicalLeadershipConversationOwnerRouter.ts', 'product/integration/canonicalProductArtifactCurrentAccessComposition.ts', 'product/integration/productArtifactCurrentOwnerStateResolver.ts', 'product/workflow/leadershipConversation/contracts.ts', 'product/workflow/leadershipConversation/operations.ts', 'product/integration/chiefLeadershipPreparationComposer.ts', 'product/workflow/leadershipConversation/chiefCommunicationPlan.ts', 'product/integration/reviewedCarryForward.ts', 'product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner.ts', 'engine/v3/governance/alphaAllowlistDisclosureProducer.ts', 'engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow.ts', 'engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding.ts', 'engine/v3/projection/organizationalUnderstandingProjection.ts', 'engine/v3/communication/productCommunicationPlan.ts', 'engine/v3/sources/governedSourceContentService.ts', 'engine/v3/governance/canonicalLocalSourceBindingService.ts', 'product/integration/chiefLeadershipEvidenceSupportResolver.ts', 'components/product-shell/data/buildYourOrganizationCommunicationView.ts', 'components/product-shell/data/buildActivatedYourOrganizationView.ts', 'components/product-shell/data/buildOrganizationExperienceFromProjection.ts', 'components/product-shell/data/buildUnifiedExecutiveWorkspaceView.ts', 'components/product-shell/data/composeActivatedYourOrganization.ts', 'product/integration/meetingExecutiveContentProjection.ts'];
  return safeDigest(await Promise.all(paths.map(async name => ({ name, digest: createHash('sha256').update(await readFile(path.join(repositoryRoot, name))).digest('hex') }))));
}
function child(w: World, mode: Mode, conversationId: string, historical = false, continuation = false) {
  const result = spawnSync(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url), '--read-worker', JSON.stringify({ w, mode, conversationId, historical, continuation })], { cwd: repositoryRoot, encoding: 'utf8', env: { PATH: process.env.PATH, NODE_PATH: process.env.NODE_PATH, NODE_ENV: 'test', NODE_OPTIONS: '--conditions=react-server' }, timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, 'read worker failed'); assert.equal(scanText('child', result.stdout + result.stderr, canaries).length, 0);
  return JSON.parse(result.stdout);
}
function safeChild(value: any) { return { outcome: value.outcome, ...(typeof value.digest === 'string' ? { digest: value.digest } : {}), reads: { artifact: value.reads.artifact, source: value.reads.source } }; }
async function main() {
  assert.equal(process.env.NODE_ENV, 'test');
  if (process.argv.includes('--read-worker')) {
    const { w, mode, conversationId, historical, continuation } = JSON.parse(process.argv.at(-1)!);
    assert(typeof w.root === 'string' && path.basename(w.root).startsWith('discovery-northstar-preparation-lineage-ar1b-'));
    if (continuation) {
      const before = await files(w.root), s = server(w, mode); let outcome = 'available';
      try { await s.instance.prepareNextOccurrence({ ...w.identity }); } catch (error) { outcome = 'owner-denied'; assert(error instanceof Error && /unavailable|access|authority/i.test(error.message)); }
      assert.deepEqual(await files(w.root), before);
      process.stdout.write(JSON.stringify({ outcome, reads: s.reads() }));
    } else if (historical) {
      const before = await files(w.root), s = server(w, mode);
      const result = await s.instance.productArtifactAccess.readHistoricalPredecessor(await historyRequest(w));
      assert.deepEqual(await files(w.root), before);
      const output = { outcome: result.outcome, projection: result.projection?.content ?? null };
      if (result.outcome !== 'accessible') assert.equal(scanText('historical-worker', JSON.stringify(output), canaries).length, 0);
      process.stdout.write(JSON.stringify({ digest: safeDigest(output), outcome: result.outcome, reads: s.reads() }));
    } else { const observed = await observe(w, mode, conversationId); process.stdout.write(JSON.stringify({ digest: safeDigest(observed.output), outcome: observed.outcome, reads: observed.reads })); }
    return;
  }
  let result: Record<string, unknown> | undefined;
  const preservationRoot = await mkdtemp(path.join(tmpdir(), 'discovery-ar1b-cleanup-preservation-'));
  const sentinel = path.join(preservationRoot, 'not-a-fixture.txt');
  await writeFile(sentinel, 'unrelated task-owned sentinel');
  const immutableSources = await sourceDigest();
  const lockDigest = createHash('sha256').update(await readFile(path.join(repositoryRoot, 'package-lock.json'))).digest('hex');
  assert.equal(lockDigest, 'd882c89972018abff19cfc254a6d58d249f17c3e7d1bfb9c5044c077b969a7dc');
  const output = process.stdout.write.bind(process.stdout), errorOutput = process.stderr.write.bind(process.stderr), streams: string[] = [];
  process.stdout.write = ((chunk: string | Uint8Array) => { streams.push(String(chunk)); return true; }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array) => { streams.push(String(chunk)); return true; }) as typeof process.stderr.write;
  try {
    phase = 'direct:seed'; const baseline = await seed(), a = await clone(baseline, 'a'), b = await clone(baseline, 'b');
    phase = 'direct:paired-publication'; const manifestA = await prepareTwin(a, 0), manifestB = await prepareTwin(b, 1); assert.equal(manifestA.lawfulInputDigest, manifestB.lawfulInputDigest); assert.notEqual(manifestA.payloadDigest, manifestB.payloadDigest);
    const cases: Record<string, unknown> = {}, accessResults: Record<string, unknown> = {};
    phase = 'direct:denied';
    for (const mode of ['absent', 'stale', 'revoked'] as const) accessResults[mode] = { A: await atomicDenial(a, mode), B: await atomicDenial(b, mode) };
    phase = 'ou:partial-disclosure'; const ou = await organizationalDisclosure(baseline);
    phase = 'direct:positive'; const left = await observe(a, 'allowed'), right = await observe(b, 'allowed'); assert(left.reads.artifact > 0 && right.reads.artifact > 0);
    const positive = compare(left.output, right.output, false); assert(positive.differencePaths.some(p => p.includes('summary')));
    assert(left.output && right.output); assert(left.output.available && right.output.available);
    for (const [id, surface] of [['A01', 'summary'], ['A02', 'priority'], ['A04', 'workspace']] as const) {
      cases[id] = { property: 'atomic-denial-and-lawful-positive', surface,
        owner: 'workspace → preparation composer → value-layer compiler', denials: accessResults,
        positive: compare(left.output[surface], right.output[surface], false), availablePositive: true,
        ...(id === 'A04' ? { organizationalUnderstandingDisclosure: ou } : {}) };
    }
    cases.A12 = { property: 'lawful-positive', negativeProperty: 'same-publication atomic-denial', owner: 'current-access authorized Prepared Work → real Product projection', protectedInput: 'owner-published Prepared Work body', ...positive, authorizedReads: [left.reads, right.reads], expectedDifference: 'summary, ordered priority and derived evidence-acquisition request', derivedAcquisition: compare((left.output as { recommendation: { acquisition: unknown } }).recommendation.acquisition, (right.output as { recommendation: { acquisition: unknown } }).recommendation.acquisition, false) };
    phase = 'direct:boundary'; cases.A05 = await artifactChecks(baseline); cases.A06 = { boundaries: cases.A05, currentAccess: accessResults };
    phase = 'lifecycle:owners'; const completed = await clone(baseline, 'lifecycle'), lifecycleResult = await lifecycle(completed);
    phase = 'legacy:continuation'; const legacy = await legacyContinuation(baseline);
    phase = 'historical:projection'; const saved = await files(completed.root);
    const historicalA = await clone(a, 'history-a'), historicalB = await clone(b, 'history-b');
    const history = await historicalControls(historicalA, historicalB);
    cases.A06 = { ...(cases.A06 as object), historical: history.boundaries };
    cases.A07 = { owner: 'real exact-source revocation → historical predecessor access', ...history };
    cases.A08 = { owner: 'same warmed owner, cold owner and fresh process after durable upstream revocation', ...history };
    phase = 'completed:twin-corrections';
    const reviewReady = await clone(baseline, 'review-ready'); await readyForReview(reviewReady);
    const cycleA = await clone(reviewReady, 'cycle-a'), cycleB = await clone(reviewReady, 'cycle-b');
    const lifecycleA = await lifecycle(cycleA, 0), lifecycleB = await lifecycle(cycleB, 1);
    assert.deepEqual(lifecycleA, lifecycleB, 'identical lifecycle shape and operation sequence');
    const visibleA = await observe(cycleA, 'allowed'), visibleB = await observe(cycleB, 'allowed');
    const deniedA = await observe(cycleA, 'revoked'), deniedB = await observe(cycleB, 'revoked');
    const nextA = await observe(cycleA, 'absent', lifecycleA.nextId), nextB = await observe(cycleB, 'absent', lifecycleB.nextId);
    assert.equal([deniedA, deniedB, nextA, nextB].reduce((sum, value) => sum + value.reads.artifact + value.reads.source, 0), 0);
    cases.A03 = { owner: 'reviewed correction → real closure What Changed → successor Prepare',
      twinVariable: 'lawfully accepted reviewed commitment correction', lifecycle: lifecycleA, legacy,
      authorizedWhatChanged: compare((visibleA.output as ReturnType<typeof semantic>).whatChanged, (visibleB.output as ReturnType<typeof semantic>).whatChanged, false),
      property: 'HISTORICAL_POLICY', inaccessibleTwinClaimed: false,
      deniedWhatChanged: [deniedA.outcome, deniedB.outcome], deniedPrepare: [nextA.outcome, nextB.outcome], protectedReads: 0,
      limitation: 'This shared-support continuation proves denial and replay/reconstruction policy; it does not claim independent H/C fallback.' };
    assert([deniedA, deniedB, nextA, nextB].every(value => value.outcome === 'owner-denied' && value.output === null));
    phase = 'replay:fresh'; const allowed = await observe(completed, 'allowed', lifecycleResult.nextId), worker1 = child(completed, 'allowed', lifecycleResult.nextId), worker2 = child(completed, 'allowed', lifecycleResult.nextId), deniedWorker = child(completed, 'revoked', lifecycleResult.nextId); assert.equal((allowed.output as ReturnType<typeof semantic>).available, true); assert(allowed.reads.artifact > 0); assert.equal(worker1.digest, safeDigest(allowed.output)); assert.deepEqual(worker1, worker2); assert.equal(deniedWorker.reads.artifact + deniedWorker.reads.source, 0); assert.deepEqual(await files(completed.root), saved);
    assert.equal(deniedWorker.outcome, 'owner-denied'); assert.equal(deniedWorker.reads.artifact + deniedWorker.reads.source, 0);
    cases.A09 = { property: 'REPLAY_RECONSTRUCTION', surface: 'successor Prepare workspace', owner: 'current-access owner → preparation composer', freshProcesses: 3, worker1: safeChild(worker1), worker2: safeChild(worker2), deniedWorker: safeChild(deniedWorker), exactResultEquality: true, limitation: 'Denied replay is typed owner denial; no fallback cognition is synthesized.' }; cases.A10 = { property: 'REPLAY_RECONSTRUCTION', surface: 'Close and Continue lifecycle', owner: 'closeAndContinue', lifecycle: lifecycleResult, unchangedOnReplay: true };
    phase = 'scanner'; assert.equal(scanText('denied', JSON.stringify(accessResults), canaries).length, 0); assert.equal(scanText('streams', streams.join('\n'), canaries).length, 0); assert.equal(scanText('sensitivity', payloads.join('\n'), canaries).length, 2);
    assert(telemetry.length > 0); assert.equal(scanText('raw-telemetry', JSON.stringify(telemetry), canaries).length, 0);
    cases.A11 = { scannerFindings: 0, sensitivityFindings: 2, telemetryEvents: telemetry.length, ...await scanFixtureBoundaries(), protectedFixtureInputExcluded: 'exact owner-staged input bytes, all denied invocations inventory-equal' };
    assert.equal(counts.network + counts.provider + counts.connectors + counts.drive + counts.live, 0); cases.A13 = { ...counts, categoryCeilingBasis: 'network is measured by intercepted socket/fetch calls; provider/connectors/Drive/live are bounded by injected task-owned composition and zero observed activity', independentCategoryCounters: false, deterministicTransportIsNotProvider: true };
    result = { schemaVersion: '2', fixtureArchitecture: 'direct/historical/completed-cycle', contractAmendment: { canonicalParent: '56881b7e08c42c63d5cde61b5064f7b710e35df1', propertyModel: ['ATOMIC_DENIAL', 'LAWFUL_POSITIVE', 'SURVIVING_DISCLOSURE', 'HISTORICAL_POLICY', 'REPLAY_RECONSTRUCTION', 'SCANNER', 'EXECUTION_BOUNDARY', 'CLEANUP_REPEATABILITY'], allowedDelta: 'protected Prepared Work body or reviewed correction; identical baseline, identity, grants, keys and owner sequence', oracle: 'typed atomic denial; available anchored OU disclosure equality; same-publication derived positive; historical policy and replay separately classified', normalization: 'surface: drop only two declared opaque Organizational Understanding audit identities (projectionMetadata.disclosureDecisionId and projectionId) plus existing value-layer item IDs; all text, order, status, role and other fields remain bound. Repeat: exclude only per-run input-sequence digest, operational telemetry and temporary-file counts.', topology: { independentHistoricalCurrentSupportReachable: false, futureRegate: 'Any future lawful public H/C continuation topology must trigger new AR-1B acceptance proving independent authorization, zero H body reads, lawful C availability, fallback projection and replay/reconstruction preservation.', ownerConflictEvidence: ['reviewed completion membership is distinct from generic V2 Evidence proposal membership', 'canonical Evidence materialization publishes What Changed under the occurrence workflow, conflicting with closure-owned What Changed identity/cardinality'] }, evidenceGate: 'all A01–A14, deterministic repeat, cleanup and scanner must succeed; reachable denial controls and topology finding must be complete' }, pairedInput: { manifestA, manifestB }, cases, sourceDigest: await sourceDigest() };
  } finally {
    try {
      for (const root of roots.slice().reverse()) await rm(root, { recursive: true, force: true });
      assert.equal(await readFile(sentinel, 'utf8'), 'unrelated task-owned sentinel');
      assert.equal(await sourceDigest(), immutableSources);
      assert.equal(createHash('sha256').update(await readFile(path.join(repositoryRoot, 'package-lock.json'))).digest('hex'), lockDigest);
    } finally { await rm(preservationRoot, { recursive: true, force: true }); process.stdout.write = output; process.stderr.write = errorOutput; }
  }
  for (const root of roots) await assert.rejects(() => lstat(root), { code: 'ENOENT' });
  assert(result); phase = 'repeat'; const repeatProjection = structuredClone(result) as { cases: Record<string, any> };
  for (const id of ['A03', 'A10']) delete repeatProjection.cases[id]?.lifecycle?.inputSequenceDigest;
  // Attempt counts and temporary-file inventories are measured hygiene, not cognition.
  delete repeatProjection.cases.A11.telemetryEvents;
  delete repeatProjection.cases.A11.filesScanned;
  delete repeatProjection.cases.A11.designatedInputFiles;
  const semanticDigest = safeDigest(repeatProjection);
  if (process.argv.includes('--repeat-worker')) { output(JSON.stringify({ semanticDigest, cleanup: roots.length, result: repeatProjection })); return; }
  const repeat = spawnSync(process.execPath, [...process.execArgv, fileURLToPath(import.meta.url), '--repeat-worker'], { cwd: repositoryRoot, encoding: 'utf8', env: { PATH: process.env.PATH, NODE_PATH: process.env.NODE_PATH, NODE_ENV: 'test', NODE_OPTIONS: '--conditions=react-server' }, timeout: 240000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(repeat.status, 0, 'repeat worker failed'); const repeated = JSON.parse(repeat.stdout); assert.equal(repeated.semanticDigest, semanticDigest, `repeat diverged at ${differencePaths(repeatProjection, repeated.result).join(', ')}`); assert.equal(repeated.cleanup, roots.length);
  (result.cases as Record<string, unknown>).A14 = { semanticDigest, repeatedDigest: repeated.semanticDigest, rootsRemoved: roots.length, rootsRemaining: 0, unrelatedSentinelPreserved: true, sourceAndLockUnchanged: true };
  assert.equal(Object.keys(result.cases as object).length, 14);
  const caseMeta: Record<string, { property: string; surface: string; owner: string; authorizationOutcome: string; readAttribution: string; semanticEvidence: string; limitation: string }> = {
    A01: { property: 'ATOMIC_DENIAL', surface: 'Prepared Work summary', owner: 'Product Artifact Current Access owner', authorizationOutcome: 'absent/stale/revoked typed denial; allowed twin lawful', readAttribution: 'artifact body attempts/completions measured as 0 on denial', semanticEvidence: 'same publication identity and no denied projection', limitation: 'Required support is atomic; no non-influence claim.' },
    A02: { property: 'LAWFUL_POSITIVE', surface: 'Chief priority projection', owner: 'preparation composer → Chief value-layer compiler', authorizationOutcome: 'allowed twin succeeds; denied twins fail closed', readAttribution: 'authorized artifact body completion only on allowed path', semanticEvidence: 'protected candidate changes derived priority', limitation: 'Positive coupling is limited to same-publication authorized reads.' },
    A03: { property: 'HISTORICAL_POLICY', surface: 'reviewed closure and shared-support successor Prepare', owner: 'reviewed carry-forward owners → closure/What Changed → Prepare Again', authorizationOutcome: 'accepted history succeeds; revoked required support is denied', readAttribution: 'historical and current support attribution kept separate', semanticEvidence: 'closure and What Changed remain singular; successor denial replays', limitation: 'Independent H/C fallback is unreachable and not claimed.' },
    A04: { property: 'SURVIVING_DISCLOSURE', surface: 'Organizational Understanding', owner: 'allowlist preflight → Runtime → disclosure resolver → organization composer', authorizationOutcome: 'lawful Runtime projection available; optional material partially disclosed', readAttribution: 'Runtime authorization and disclosure selection measured; protected source-body hook not exercised by this OU surface', semanticEvidence: 'lawful anchor identical across inaccessible optional twins', limitation: 'No protected source-body non-influence claim is made.' },
    A05: { property: 'ATOMIC_DENIAL', surface: 'artifact and source identity boundaries', owner: 'Product Artifact Current Access and Source Scoped Analysis owners', authorizationOutcome: 'foreign/malformed/stale identities denied', readAttribution: 'zero artifact body attempts and zero source-body completion hooks on denied cases', semanticEvidence: 'durable inventories unchanged', limitation: 'Counters are bounded to the injected fixture composition.' },
    A06: { property: 'HISTORICAL_POLICY', surface: 'historical predecessor access', owner: 'Product Artifact historical current-access owner', authorizationOutcome: 'typed malformed/stale/foreign/withheld/revoked outcomes', readAttribution: 'warm/cold body counters and historical outcomes recorded', semanticEvidence: 'positive historical projection only when accessible', limitation: 'Historical policy follows actual current-access semantics.' },
    A07: { property: 'HISTORICAL_POLICY', surface: 'revoked predecessor', owner: 'historical current-access owner', authorizationOutcome: 'revoked denial before body read', readAttribution: 'zero protected artifact body reads on revoked path', semanticEvidence: 'projection null and canary-free denial', limitation: 'Revoked required material does not enter equality oracle.' },
    A08: { property: 'REPLAY_RECONSTRUCTION', surface: 'historical denial replay', owner: 'historical current-access owner across warm/cold/fresh process', authorizationOutcome: 'revoked denial preserved', readAttribution: 'fresh process artifact body counters remain zero; source completion hook is reported separately', semanticEvidence: 'denial outcome stable across warm/cold/fresh process', limitation: 'Replay and reconstruction preserve denial; no cache bypass is observed.' },
    A09: { property: 'REPLAY_RECONSTRUCTION', surface: 'successor Prepare workspace', owner: 'current-access owner → preparation composer', authorizationOutcome: 'allowed replay available; revoked replay typed denial', readAttribution: 'fresh child-process results and body counters recorded', semanticEvidence: 'authorized fresh processes exact-equal', limitation: 'Denied replay is not normalized into equality.' },
    A10: { property: 'REPLAY_RECONSTRUCTION', surface: 'Close and Continue lifecycle', owner: 'closeAndContinue lifecycle owner', authorizationOutcome: 'interruption and concurrent re-entry converge lawfully', readAttribution: 'replay inventory is write-free', semanticEvidence: 'same lifecycle identity and successor link', limitation: 'Task-owned fixture only.' },
    A11: { property: 'SCANNER', surface: 'content-safe evidence and persistence boundaries', owner: 'content-safe observability and protected-value scanner', authorizationOutcome: 'protected plaintext excluded from outputs', readAttribution: 'designated owner-staged fixture inputs separated from persistence scan', semanticEvidence: 'zero unauthorized persisted findings', limitation: 'Sensitive values are counted in bounded fixture scan only.' },
    A12: { property: 'LAWFUL_POSITIVE', surface: 'same-publication acquisition text', owner: 'authorized Prepared Work current-access → Product projection', authorizationOutcome: 'lawful source produces expected semantic effect', readAttribution: 'authorized artifact reads recorded; no provider request', semanticEvidence: 'derived acquisition request differs materially with protected candidate', limitation: 'Does not claim unsupported fallback coupling.' },
    A13: { property: 'EXECUTION_BOUNDARY', surface: 'all AR-1B transports and roots', owner: 'injected deterministic transport and task-owned fixture roots', authorizationOutcome: 'network/live configuration blocked', readAttribution: 'network socket/fetch interceptions measured; provider/connectors/Drive/live activity bounded by injected composition and zero observed activity', semanticEvidence: 'all prohibited external counters zero', limitation: 'Deterministic transport is not a provider request; independent category counters are not claimed.' },
    A14: { property: 'CLEANUP_REPEATABILITY', surface: 'complete A01–A14 execution', owner: 'task-owned fixture lifecycle', authorizationOutcome: 'repeat process reproduces same semantic digest', readAttribution: 'temporary roots removed and source/lock unchanged', semanticEvidence: 'semanticDigest equals repeatedDigest', limitation: 'Operational counters are excluded only where declared.' }
  };
  for (const [id, meta] of Object.entries(caseMeta)) { const value = (result.cases as Record<string, any>)[id]; assert(value, `${id} missing`); Object.assign(value, meta); }
  assert(typeof (result as any).contractAmendment.topology.futureRegate === 'string' && (result as any).contractAmendment.topology.futureRegate.length > 0);
  assert(Object.values(caseMeta).every(meta => meta.property && meta.surface && meta.owner && meta.authorizationOutcome && meta.readAttribution && meta.semanticEvidence && meta.limitation));
  const legacyFinding = (result.cases as Record<string, any>).A03.legacy;
  assert.equal(legacyFinding.independentSupportFallbackExecuted, false);
  assert.equal(legacyFinding.topologyFinding.independentHistoricalCurrentSupportReachable, false);
  assert.equal(legacyFinding.revokedContinuationDenied, true);
  assert.equal(legacyFinding.denialReplayReconstruction.writes, 0);
  function redact(value: unknown): unknown { if (typeof value === 'string') return canaries.reduce((text, canary) => text.split(canary.value).join('<protected-fixture>'), value); if (Array.isArray(value)) return value.map(redact); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item)])); return value; }
  const rawEvidence = JSON.stringify(result);
  assert.equal(scanText('raw-evidence-before-persistence', rawEvidence, canaries).length, 0, 'protected plaintext escaped the bounded semantic evidence projection');
  const persistedResult = redact(result) as Record<string, unknown>;
  const complete = { ...persistedResult, result: 'PASS', resultDigest: safeDigest(persistedResult) }, json = JSON.stringify(complete, null, 2) + '\n';
  assert.equal(scanText('evidence', json, canaries).length, 0);
  assert.equal(scanText('repeat-process', repeat.stdout + repeat.stderr, canaries).length, 0);
  const report = '# AR-1B Non-Disclosure Adversarial Acceptance\n\n' + Object.entries(result.cases as Record<string, any>).sort(([a], [b]) => a.localeCompare(b)).map(([id, value]) => `## ${id}\n\n- Property: ${value.property}\n- Surface: ${value.surface}\n- Owner: ${value.owner}\n- Result: PASS\n- Authorization/read evidence: ${value.authorizationOutcome}; ${value.readAttribution}\n- Semantic evidence: ${value.semanticEvidence}\n- Limitation: ${value.limitation}`).join('\n\n') + `\n\nTopology finding: independentHistoricalCurrentSupportReachable = false (source-audited current owner graph; independent fallback execution is not claimed).\nFuture re-gate: any future lawful public H/C continuation must trigger new AR-1B acceptance proving independent H/C authorization, zero unauthorized H body reads, lawful C availability, fallback projection, and replay/reconstruction preservation.\n\nOU normalization: exactly two opaque audit identities excluded: projectionMetadata.disclosureDecisionId and projectionId; text/order/status/role remain compared.\n\nSource digest: ${result.sourceDigest}\nResult digest: ${complete.resultDigest}\n`;
  assert.equal(scanText('report', report, canaries).length, 0);
  if (process.argv.includes('--emit-evidence')) {
    await mkdir(evidenceDirectory, { recursive: true }); await writeFile(path.join(evidenceDirectory, evidenceNames[0]!), json); await writeFile(path.join(evidenceDirectory, evidenceNames[1]!), report);
  }
  output(JSON.stringify({ result: 'PASS', resultDigest: complete.resultDigest }));
}
void main().catch(error => { process.stderr.write(JSON.stringify({ result: 'BLOCKED', phase, errorName: error instanceof Error ? error.name : 'unknown', errorDigest: safeDigest(String(error)), message: error instanceof Error && !payloads.some(p => error.message.includes(p)) ? error.message.slice(0, 300) : 'protected assertion details withheld' }) + '\n'); process.exitCode = 1; }).finally(() => { net.Socket.prototype.connect = originalConnect; globalThis.fetch = originalFetch; });
