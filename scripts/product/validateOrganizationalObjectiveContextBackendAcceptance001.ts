import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  FilesystemOrganizationRuntimeRepository,
  RuntimeStorageConflictError,
  type OrganizationRuntimeRepository,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import {
  listOptimizationContextVersions,
  listOrganizationalObjectiveVersions,
  objectiveEvents,
  objectiveVersionRef,
  optimizationContextEvents,
  optimizationContextVersionRef,
  type ProductObjectiveScope,
  type ProductOptimizationContext,
  type ProductOrganizationalObjective,
} from "../../product/objectives";
import {
  DevelopmentObjectiveAuthorityPolicyMapper,
  DevelopmentObjectiveReferenceOwner,
  type DevelopmentObjectiveAuthorityPolicy,
  type DevelopmentObjectiveReferenceRegistry,
} from "../../product/objectives/development";

const principalId = "development-principal-objective-acceptance";
const organizationId = "objctx-dev-acceptance-001-a";
const otherOrganizationId = "objctx-dev-acceptance-001-b";
const questionText = "Which operating change should improve durable retention?";
const questionOperationId = "acceptance-question-create";
const times = Array.from({ length: 30 }, (_, index) => `2026-08-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`);
const organizationScope: ProductObjectiveScope = { kind: "organization" };
const teamScope: ProductObjectiveScope = { kind: "team", teamRef: "team:acceptance:customer-success" };
const initiativeScope: ProductObjectiveScope = { kind: "initiative", initiativeRef: "initiative:acceptance:retention" };
let questionId = "";

const safeEnvironment = {
  DISCOVERY_ENV: "development",
  NEXT_PUBLIC_DISCOVERY_ENV: "development",
  DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_objective_acceptance",
  CLERK_SECRET_KEY: "sk_test_objective_acceptance",
  DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery_acceptance",
  DISCOVERY_DATABASE_ADMIN_URL: "postgresql://127.0.0.1/discovery_acceptance",
  DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery_acceptance",
  DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
  DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/discovery-onboarding-objective-context-acceptance",
  DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
  DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false",
  DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
} as const;

const authorityRef = (scope: ProductObjectiveScope): string => {
  if (scope.kind === "organization") return "objective-acceptance-policy:v1:organization";
  if (scope.kind === "team") return "objective-acceptance-policy:v1:team:customer-success";
  if (scope.kind === "initiative") return "objective-acceptance-policy:v1:initiative:retention";
  return "objective-acceptance-policy:v1:question:retention";
};
const readRef = (scope: ProductObjectiveScope): string => scope.kind === "organization" ? "organization" : JSON.stringify(scope);

function policy(): DevelopmentObjectiveAuthorityPolicy {
  const scopes = [organizationScope, teamScope, initiativeScope, { kind: "question", questionId } as ProductObjectiveScope];
  return {
    policyId: "objective-acceptance-policy",
    policyVersion: "1",
    principalId,
    organizationId,
    grants: scopes.flatMap((scope) => [
      { authorityScopeRef: authorityRef(scope), scope, operations: ["objective:create", "objective:revise", "context:create", "context:revise"] },
      { authorityScopeRef: readRef(scope), scope, operations: ["read"] },
    ]),
  };
}

function registry(policyRef = "policy:objective-acceptance:v1"): DevelopmentObjectiveReferenceRegistry {
  return {
    organizationId, principalId,
    teamRefs: [teamScope.kind === "team" ? teamScope.teamRef : ""],
    initiativeRefs: [initiativeScope.kind === "initiative" ? initiativeScope.initiativeRef : ""],
    evidenceRefs: ["evidence:acceptance:retention"],
    sourceRefs: ["source:acceptance:objective-session"],
    resourceConstraintRefs: ["constraint:acceptance:capacity"],
    governanceConstraintRefs: ["policy:acceptance:customer-protection:v3"],
    riskCapacityAssessmentRefs: ["assessment:acceptance:risk-capacity:v1"],
    policyRefs: [policyRef],
  };
}

function objective(input: {
  objectiveId?: string; scope?: ProductObjectiveScope; version: number; status: ProductOrganizationalObjective["status"];
  establishedAt: string; supersedes?: string | null; criteria?: boolean; authorityScopeRef?: string;
  parentObjectiveVersionRef?: string | null;
}): ProductOrganizationalObjective {
  const scope = input.scope ?? organizationScope;
  return {
    contractVersion: "1", objectiveId: input.objectiveId ?? "objective-acceptance-retention", organizationId, scope,
    statement: input.version === 1 ? "Improve durable customer retention." : `Improve durable customer retention, revision ${input.version}.`,
    desiredChange: { target: "Durable customer retention", direction: "increase" },
    successCriteria: input.criteria === false ? [] : [{
      criterionId: "criterion-acceptance-retention", statement: "A scheduled review confirms durable retention improved.",
      indicatorRef: "indicator:acceptance:retention-quality",
      target: { kind: "qualitative", description: "Reviewable improvement relative to the recorded baseline." },
    }],
    horizon: { startsAt: times[0]!, targetBy: times[20]!, reviewAt: times[10]! },
    status: input.status, epistemicConfidence: "moderate",
    authority: {
      sourceKind: "authorized-user", sourceRef: `principal:${principalId}`,
      authorityScopeRef: input.authorityScopeRef ?? authorityRef(scope),
      authorityBasis: "Explicit development acceptance policy grant.", authorizedToEstablish: true,
    },
    ancestry: {
      evidenceRefs: ["evidence:acceptance:retention"], questionRefs: [], decisionRefs: [],
      sourceRefs: ["source:acceptance:objective-session"],
    },
    parentObjectiveVersionRef: input.parentObjectiveVersionRef ?? null,
    constraintRefs: ["constraint:acceptance:capacity", "policy:acceptance:customer-protection:v3"],
    version: input.version, supersedesObjectiveVersionRef: input.supersedes ?? null, establishedAt: input.establishedAt,
  };
}

function context(input: {
  objectiveRef: string; version: number; contextId?: string; supersedes?: string | null;
  source?: ProductOptimizationContext["source"]; sourceRef?: string | null; authorityScopeRef?: string;
}): ProductOptimizationContext {
  return {
    contractVersion: "1", optimizationContextId: input.contextId ?? "context-acceptance-retention",
    organizationId, objectiveVersionRef: input.objectiveRef, priorityMode: "balance",
    timePreference: { horizon: "medium-term", urgency: "high", delayTolerance: "moderate" },
    riskPreference: {
      downsideTolerance: "low", uncertaintyTolerance: "moderate", irreversibleActionTolerance: "low",
      riskCapacityAssessmentRef: "assessment:acceptance:risk-capacity:v1",
    },
    resourceConstraintRefs: ["constraint:acceptance:capacity"],
    governanceConstraintRefs: ["policy:acceptance:customer-protection:v3"],
    tradeoffPreferences: [{
      preferenceId: "tradeoff-acceptance-quality", criterion: "Preserve customer experience quality",
      direction: "preserve", precedence: "primary",
    }],
    minimumEvidenceStandard: "substantial",
    alternativesRequirement: { minimumMeaningfulAlternatives: 3, includeStatusQuo: true },
    source: input.source ?? "explicit", sourceRef: input.sourceRef ?? null,
    authorityScopeRef: input.authorityScopeRef ?? authorityRef(organizationScope),
    assumptions: input.source === "derived-conditional" ? ["The recorded review horizon remains applicable."] : [],
    version: input.version, supersedesOptimizationContextVersionRef: input.supersedes ?? null,
  };
}

type Counters = { authorize: number; runtimeReads: number; investigate: number; connector: number; external: number };

function adapter(input: {
  repository: Pick<OrganizationRuntimeRepository, "read" | "replace">;
  mapper: DevelopmentObjectiveAuthorityPolicyMapper;
  references: DevelopmentObjectiveReferenceOwner;
  counters: Counters;
}): CanonicalProductWorkspaceAdapter {
  return new CanonicalProductWorkspaceAdapter({
    runtimeRepository: {
      async read(id) { input.counters.runtimeReads += 1; return input.repository.read(id); },
      async replace(id, bytes, revision, metadata) { return input.repository.replace(id, bytes, revision, metadata); },
    },
    async authorize(value) {
      input.counters.authorize += 1;
      return value.userId === principalId && value.organizationId === organizationId;
    },
    async authorizeObjectiveScope(value) { return input.mapper.authorize(value); },
    async validateObjectiveReferences(value) { return input.references.validate(value); },
    async investigate() { input.counters.investigate += 1; throw new Error("Acceptance must not investigate."); },
  });
}

const operation = (id: string) => ({ requestId: id, operatorId: principalId });

function semanticWorkspace<T extends {
  answer: { generatedAt: string } | null;
  modelState: { projectedAt: string };
}>(workspace: T): T {
  return {
    ...workspace,
    answer: workspace.answer ? { ...workspace.answer, generatedAt: "<projection-time>" } : null,
    modelState: { ...workspace.modelState, projectedAt: "<projection-time>" },
  } as T;
}

async function childReload(directory: string): Promise<void> {
  const repository = new FilesystemOrganizationRuntimeRepository(directory);
  const stored = await repository.read(organizationId);
  assert.ok(stored);
  console.log(JSON.stringify({
    organizationId: stored.runtime.metadata.organizationId,
    objectiveEvents: objectiveEvents(stored.runtime).length,
    contextEvents: optimizationContextEvents(stored.runtime).length,
    revision: stored.revision,
  }));
}

async function main(): Promise<void> {
  if (process.argv[2] === "child-reload") return childReload(process.argv[3]!);
  const directory = await mkdtemp(path.join(tmpdir(), "discovery-onboarding-objective-context-acceptance-"));
  const counters: Counters = { authorize: 0, runtimeReads: 0, investigate: 0, connector: 0, external: 0 };
  try {
    assert.throws(() => new DevelopmentObjectiveAuthorityPolicyMapper(
      { ...safeEnvironment, DISCOVERY_ENV: "production", NEXT_PUBLIC_DISCOVERY_ENV: "production" },
      policy(),
      () => times[0]!,
    ), /forbidden|Development onboarding/i);
    const repository = new FilesystemOrganizationRuntimeRepository(directory);
    await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(createEmptyOrganizationRuntime({ organizationId }), null, 2)), operation("runtime-create-a"));
    await repository.create(otherOrganizationId, new TextEncoder().encode(JSON.stringify(createEmptyOrganizationRuntime({ organizationId: otherOrganizationId }), null, 2)), operation("runtime-create-b"));
    const mapper = new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, policy(), () => times[0]!);
    const referenceOwner = new DevelopmentObjectiveReferenceOwner(registry());
    const firstAdapter = adapter({ repository, mapper, references: referenceOwner, counters });
    const question = await firstAdapter.createQuestion({
      userId: principalId, organizationId, question: questionText, createdAt: times[0]!,
      idempotencyKey: questionOperationId, operation: operation(questionOperationId),
    });
    questionId = question.workspace.question.id;
    const mapperWithQuestion = new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, policy(), () => times[1]!);
    const accepted = adapter({ repository, mapper: mapperWithQuestion, references: referenceOwner, counters });
    const beforeObjective = await repository.read(organizationId); assert.ok(beforeObjective);
    const baselineWorkspace = await accepted.getQuestionWorkspace({ userId: principalId, organizationId, questionId });

    const v1 = objective({ version: 1, status: "proposed", establishedAt: times[1]!, criteria: false });
    const created = await accepted.recordObjective({
      userId: principalId, organizationId, objective: v1, expectedCurrentVersion: null,
      operationId: "objective-create-v1", operation: operation("objective-create-v1"),
    });
    assert.equal(created.objectiveVersionRef, objectiveVersionRef(organizationId, v1.objectiveId, 1));
    const independentlyReloaded = await new FilesystemOrganizationRuntimeRepository(directory).read(organizationId); assert.ok(independentlyReloaded);
    assert.equal(objectiveEvents(independentlyReloaded.runtime).length, 1);
    assert.equal(objectiveEvents(independentlyReloaded.runtime)[0]?.actorRef, principalId);
    assert.equal(objectiveEvents(independentlyReloaded.runtime)[0]?.operationId, "objective-create-v1");
    assert.equal(independentlyReloaded.runtime.memory.events.length, beforeObjective.runtime.memory.events.length + 1);

    const retry = await accepted.recordObjective({
      userId: principalId, organizationId, objective: v1, expectedCurrentVersion: null,
      operationId: "objective-create-v1", operation: operation("objective-create-v1-retry"),
    });
    assert.equal(retry.idempotent, true);
    const afterRetry = await repository.read(organizationId); assert.ok(afterRetry);
    await assert.rejects(() => accepted.recordObjective({
      userId: principalId, organizationId, objective: { ...v1, statement: "Conflicting retry." }, expectedCurrentVersion: null,
      operationId: "objective-create-v1", operation: operation("objective-create-v1-conflict"),
    }), /idempotency conflict/);
    assert.equal((await repository.read(organizationId))?.revision, afterRetry.revision);

    const v2 = objective({ version: 2, status: "proposed", establishedAt: times[2]!, criteria: false, supersedes: created.objectiveVersionRef });
    const corrected = await accepted.recordObjective({ userId: principalId, organizationId, objective: v2, expectedCurrentVersion: 1, operationId: "objective-v2", operation: operation("objective-v2") });
    assert.equal(corrected.objectiveVersionRef, objectiveVersionRef(organizationId, v1.objectiveId, 2));
    const v3 = objective({ version: 3, status: "proposed", establishedAt: times[3]!, criteria: false, supersedes: corrected.objectiveVersionRef });
    const concurrentA = adapter({ repository: new FilesystemOrganizationRuntimeRepository(directory), mapper: mapperWithQuestion, references: referenceOwner, counters });
    const concurrentB = adapter({ repository: new FilesystemOrganizationRuntimeRepository(directory), mapper: mapperWithQuestion, references: referenceOwner, counters });
    const won = await concurrentA.recordObjective({ userId: principalId, organizationId, objective: v3, expectedCurrentVersion: 2, operationId: "objective-v3-a", operation: operation("objective-v3-a") });
    await assert.rejects(() => concurrentB.recordObjective({
      userId: principalId, organizationId,
      objective: { ...v3, statement: "Stale competing correction.", establishedAt: times[4]! },
      expectedCurrentVersion: 2, operationId: "objective-v3-b", operation: operation("objective-v3-b"),
    }), /current version changed|Runtime revision changed/);

    const v4 = objective({ version: 4, status: "confirmed", establishedAt: times[5]!, criteria: false, supersedes: won.objectiveVersionRef });
    const confirmed = await accepted.recordObjective({ userId: principalId, organizationId, objective: v4, expectedCurrentVersion: 3, operationId: "objective-v4-confirm", operation: operation("objective-v4-confirm") });
    const activeWithoutCriteria = objective({ version: 5, status: "active", establishedAt: times[6]!, criteria: false, supersedes: confirmed.objectiveVersionRef });
    await assert.rejects(() => accepted.recordObjective({ userId: principalId, organizationId, objective: activeWithoutCriteria, expectedCurrentVersion: 4, operationId: "objective-v5-invalid", operation: operation("objective-v5-invalid") }), /success criterion/);
    const noRevisePolicy = policy();
    noRevisePolicy.grants = noRevisePolicy.grants.map((item) => ({ ...item, operations: item.operations.filter((item) => item !== "objective:revise") }));
    const noAuthorityAdapter = adapter({ repository, mapper: new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, noRevisePolicy, () => times[6]!), references: referenceOwner, counters });
    await assert.rejects(() => noAuthorityAdapter.recordObjective({ userId: principalId, organizationId, objective: { ...activeWithoutCriteria, successCriteria: v1.successCriteria }, expectedCurrentVersion: 4, operationId: "objective-v5-no-authority", operation: operation("objective-v5-no-authority") }), /authority denied/);
    const v5 = objective({ version: 5, status: "confirmed", establishedAt: times[7]!, supersedes: confirmed.objectiveVersionRef });
    const criteriaEstablished = await accepted.recordObjective({ userId: principalId, organizationId, objective: v5, expectedCurrentVersion: 4, operationId: "objective-v5-criteria", operation: operation("objective-v5-criteria") });
    const v6 = objective({ version: 6, status: "active", establishedAt: times[8]!, supersedes: criteriaEstablished.objectiveVersionRef });
    const activated = await accepted.recordObjective({ userId: principalId, organizationId, objective: v6, expectedCurrentVersion: 5, operationId: "objective-v6-active", operation: operation("objective-v6-active") });

    const c1 = context({ objectiveRef: activated.objectiveVersionRef, version: 1 });
    const contextCreated = await accepted.recordOptimizationContext({ userId: principalId, organizationId, scope: organizationScope, optimizationContext: c1, expectedCurrentVersion: null, operationId: "context-v1", operation: operation("context-v1") });
    const resolvedV6 = await accepted.resolveObjectiveContext({ userId: principalId, organizationId, scope: organizationScope, evaluationAt: times[9]! });
    assert.equal(resolvedV6.resolution.status, "resolved"); assert.deepEqual(resolvedV6.resolution.optimizationContext, c1);
    const v7 = objective({ version: 7, status: "active", establishedAt: times[10]!, supersedes: activated.objectiveVersionRef });
    const revised = await accepted.recordObjective({ userId: principalId, organizationId, objective: v7, expectedCurrentVersion: 6, operationId: "objective-v7", operation: operation("objective-v7") });
    assert.equal((await accepted.resolveObjectiveContext({ userId: principalId, organizationId, scope: organizationScope, evaluationAt: times[11]! })).resolution.status, "stale-context");
    const c2 = context({ objectiveRef: revised.objectiveVersionRef, version: 2, supersedes: contextCreated.optimizationContextVersionRef });
    await accepted.recordOptimizationContext({ userId: principalId, organizationId, scope: organizationScope, optimizationContext: c2, expectedCurrentVersion: 1, operationId: "context-v2-reaffirm", operation: operation("context-v2-reaffirm") });
    assert.equal((await accepted.resolveObjectiveContext({ userId: principalId, organizationId, scope: organizationScope, evaluationAt: times[12]! })).resolution.status, "resolved");

    const teamObjective = objective({ objectiveId: "objective-team", scope: teamScope, version: 1, status: "active", establishedAt: times[13]!, authorityScopeRef: authorityRef(teamScope) });
    const teamCreated = await accepted.recordObjective({ userId: principalId, organizationId, objective: teamObjective, expectedCurrentVersion: null, operationId: "team-objective", operation: operation("team-objective") });
    const policyContext = context({ objectiveRef: teamCreated.objectiveVersionRef, version: 1, contextId: "context-team-policy", source: "authorized-policy", sourceRef: "policy:objective-acceptance:v1", authorityScopeRef: authorityRef(teamScope) });
    await accepted.recordOptimizationContext({ userId: principalId, organizationId, scope: teamScope, optimizationContext: policyContext, expectedCurrentVersion: null, operationId: "team-policy-context", operation: operation("team-policy-context") });
    const outOfScopePolicy = new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, {
      ...policy(), grants: policy().grants.filter((item) => JSON.stringify(item.scope) === JSON.stringify(teamScope)),
    }, () => times[14]!);
    await assert.rejects(() => adapter({ repository, mapper: outOfScopePolicy, references: referenceOwner, counters }).recordOptimizationContext({
      userId: principalId, organizationId, scope: organizationScope,
      optimizationContext: context({ objectiveRef: revised.objectiveVersionRef, version: 1, contextId: "context-policy-outside", source: "authorized-policy", sourceRef: "policy:objective-acceptance:v1" }),
      expectedCurrentVersion: null, operationId: "policy-outside", operation: operation("policy-outside"),
    }), /authority denied/);
    const policyVersionTwo = { ...policy(), policyVersion: "2" };
    const versionTwoMapper = new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, policyVersionTwo, () => times[14]!);
    const versionTwoReferences = new DevelopmentObjectiveReferenceOwner(registry("policy:objective-acceptance:v2"));
    assert.equal(versionTwoMapper.policy.policyVersion, "2");
    assert.equal(versionTwoReferences.registry.policyRefs[0], "policy:objective-acceptance:v2");
    assert.equal(
      listOptimizationContextVersions((await repository.read(organizationId))!.runtime)
        .find((item) => item.optimizationContextId === policyContext.optimizationContextId)?.sourceRef,
      "policy:objective-acceptance:v1",
    );

    mapperWithQuestion.revoke("objective:revise"); mapperWithQuestion.revoke("context:revise");
    const beforeRevocationAttempt = (await repository.read(organizationId))?.revision;
    await assert.rejects(() => accepted.recordObjective({ userId: principalId, organizationId, objective: objective({ version: 8, status: "active", establishedAt: times[15]!, supersedes: revised.objectiveVersionRef }), expectedCurrentVersion: 7, operationId: "revoked-objective", operation: operation("revoked-objective") }), /authority denied/);
    await assert.rejects(() => accepted.recordOptimizationContext({ userId: principalId, organizationId, scope: organizationScope, optimizationContext: context({ objectiveRef: revised.objectiveVersionRef, version: 3, supersedes: optimizationContextVersionRef(organizationId, c2.optimizationContextId, 2) }), expectedCurrentVersion: 2, operationId: "revoked-context", operation: operation("revoked-context") }), /authority denied/);
    assert.equal((await repository.read(organizationId))?.revision, beforeRevocationAttempt);
    assert.equal((await accepted.resolveObjectiveContext({ userId: principalId, organizationId, scope: organizationScope, evaluationAt: times[16]! })).resolution.status, "resolved");

    let unauthorizedReads = 0;
    const guardedRepository = {
      async read(id: string) { unauthorizedReads += 1; return repository.read(id); },
      async replace(id: string, bytes: Uint8Array, revision: string, metadata: { requestId: string; operatorId: string }) { return repository.replace(id, bytes, revision, metadata); },
    };
    const unauthorized = adapter({ repository: guardedRepository, mapper: mapperWithQuestion, references: referenceOwner, counters });
    await assert.rejects(() => unauthorized.resolveObjectiveContext({ userId: "unknown-principal", organizationId, scope: organizationScope, evaluationAt: times[16]! }), /access denied/);
    assert.equal(unauthorizedReads, 0);

    const crossReferences = new DevelopmentObjectiveReferenceOwner({ ...registry(), evidenceRefs: [], sourceRefs: [], resourceConstraintRefs: [], governanceConstraintRefs: [], riskCapacityAssessmentRefs: [], policyRefs: [] });
    const crossAdapter = adapter({ repository, mapper: mapperWithQuestion, references: crossReferences, counters });
    const beforeCrossOrganizationAttempts = (await repository.read(organizationId))?.revision;
    await assert.rejects(() => crossAdapter.recordObjective({
      userId: principalId, organizationId,
      objective: {
        ...objective({ objectiveId: "cross-objective", version: 1, status: "proposed", establishedAt: times[17]!, parentObjectiveVersionRef: objectiveVersionRef(otherOrganizationId, "parent", 1) }),
        ancestry: {
          evidenceRefs: [`organization:${otherOrganizationId}:evidence:1`],
          questionRefs: [`organization:${otherOrganizationId}:question:1`],
          decisionRefs: [`organization:${otherOrganizationId}:decision:1`],
          sourceRefs: [`organization:${otherOrganizationId}:source:1`],
        },
        constraintRefs: [`organization:${otherOrganizationId}:constraint:1`],
      },
      expectedCurrentVersion: null, operationId: "cross-references", operation: operation("cross-references"),
    }), /reference validation failed/);
    await assert.rejects(() => crossAdapter.recordOptimizationContext({
      userId: principalId,
      organizationId,
      scope: organizationScope,
      optimizationContext: {
        ...context({
          objectiveRef: revised.objectiveVersionRef,
          version: 1,
          contextId: "cross-context",
          source: "authorized-policy",
          sourceRef: `organization:${otherOrganizationId}:policy:1`,
        }),
        governanceConstraintRefs: [`organization:${otherOrganizationId}:governance:1`],
        riskPreference: {
          ...c2.riskPreference,
          riskCapacityAssessmentRef: `organization:${otherOrganizationId}:risk-capacity:1`,
        },
      },
      expectedCurrentVersion: null,
      operationId: "cross-context",
      operation: operation("cross-context"),
    }), /reference validation failed/);
    assert.equal((await repository.read(organizationId))?.revision, beforeCrossOrganizationAttempts);
    assert.equal((await repository.read(otherOrganizationId))?.runtime.memory.events.length, 0);

    for (const [index, targetScope] of [initiativeScope, { kind: "question", questionId } as ProductObjectiveScope].entries()) {
      const scoped = objective({ objectiveId: `objective-scope-${index}`, scope: targetScope, version: 1, status: "active", establishedAt: times[18 + index]!, authorityScopeRef: authorityRef(targetScope) });
      await accepted.recordObjective({ userId: principalId, organizationId, objective: scoped, expectedCurrentVersion: null, operationId: `scoped-${index}`, operation: operation(`scoped-${index}`) });
    }
    const narrowOnly = new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, {
      ...policy(), grants: policy().grants.filter((item) => JSON.stringify(item.scope) === JSON.stringify(teamScope)),
    }, () => times[20]!);
    await assert.rejects(() => adapter({ repository, mapper: narrowOnly, references: referenceOwner, counters }).recordObjective({
      userId: principalId, organizationId, objective: objective({ objectiveId: "broad-from-narrow", version: 1, status: "proposed", establishedAt: times[20]! }),
      expectedCurrentVersion: null, operationId: "broad-from-narrow", operation: operation("broad-from-narrow"),
    }), /authority denied/);
    const incompatibleParent = objective({
      objectiveId: "incompatible-parent", scope: organizationScope, version: 1, status: "proposed", establishedAt: times[21]!,
      parentObjectiveVersionRef: teamCreated.objectiveVersionRef,
    });
    await assert.rejects(() => accepted.recordObjective({ userId: principalId, organizationId, objective: incompatibleParent, expectedCurrentVersion: null, operationId: "incompatible-parent", operation: operation("incompatible-parent") }), /reference validation failed/);

    const governance = await accepted.resolveObjectiveContext({ userId: principalId, organizationId, scope: organizationScope, evaluationAt: times[22]!, governanceProhibition: "policy:acceptance:customer-protection:v3 prohibits this action." });
    assert.equal(governance.resolution.status, "governance-prohibited");
    assert.equal(governance.resolution.limitations[0]?.includes("v3"), true);
    assert.equal(c2.riskPreference.downsideTolerance, "low");
    assert.equal(c2.riskPreference.riskCapacityAssessmentRef, "assessment:acceptance:risk-capacity:v1");
    const missingRiskOwner = new DevelopmentObjectiveReferenceOwner({ ...registry(), riskCapacityAssessmentRefs: [] });
    await assert.rejects(() => adapter({ repository, mapper: new DevelopmentObjectiveAuthorityPolicyMapper(safeEnvironment, policy(), () => times[23]!), references: missingRiskOwner, counters }).recordOptimizationContext({
      userId: principalId, organizationId, scope: teamScope,
      optimizationContext: context({ objectiveRef: teamCreated.objectiveVersionRef, version: 1, contextId: "context-missing-risk", authorityScopeRef: authorityRef(teamScope) }),
      expectedCurrentVersion: null, operationId: "missing-risk", operation: operation("missing-risk"),
    }), /reference validation failed/);
    const missingPreference = await accepted.resolveObjectiveContext({ userId: principalId, organizationId, scope: initiativeScope, evaluationAt: times[23]! });
    assert.equal(missingPreference.resolution.status, "missing-context");
    assert.equal((missingPreference.resolution.clarificationQuestion ? 1 : 0) <= 1, true);

    const finalStored = await repository.read(organizationId); assert.ok(finalStored);
    const objectives = listOrganizationalObjectiveVersions(finalStored.runtime);
    const contexts = listOptimizationContextVersions(finalStored.runtime);
    assert.deepEqual(objectives.filter((item) => item.objectiveId === v1.objectiveId).map((item) => item.version).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(contexts.filter((item) => item.optimizationContextId === c1.optimizationContextId).map((item) => item.version).sort((a, b) => a - b), [1, 2]);
    assert.equal(contexts.find((item) => item.optimizationContextId === "context-team-policy")?.sourceRef, "policy:objective-acceptance:v1");
    const workspaceAfter = await accepted.getQuestionWorkspace({ userId: principalId, organizationId, questionId });
    assert.deepEqual(semanticWorkspace(workspaceAfter.workspace), semanticWorkspace(baselineWorkspace.workspace));

    const legacyRepository = new FilesystemOrganizationRuntimeRepository(directory);
    const legacyId = "objctx-dev-acceptance-001-legacy";
    await legacyRepository.create(legacyId, new TextEncoder().encode(JSON.stringify(createEmptyOrganizationRuntime({ organizationId: legacyId }), null, 2)), operation("legacy-create"));
    const legacy = await legacyRepository.read(legacyId); assert.ok(legacy);
    assert.deepEqual(listOrganizationalObjectiveVersions(legacy.runtime), []);
    assert.deepEqual(listOptimizationContextVersions(legacy.runtime), []);

    const child = spawnSync(process.execPath, ["--import", "tsx", fileURLToPath(import.meta.url), "child-reload", directory], { encoding: "utf8" });
    assert.equal(child.status, 0, child.stderr); assert.match(child.stdout, /"objectiveEvents"/);
    assert.equal(counters.investigate, 0); assert.equal(counters.connector, 0); assert.equal(counters.external, 0);
    assert.equal(await repository.exists(otherOrganizationId), true);
    const other = await repository.read(otherOrganizationId); assert.ok(other);
    assert.equal(other.runtime.memory.events.length, 0);

    console.log(JSON.stringify({
      validation: "organizational-objective-context-backend-acceptance-001", result: "PASS",
      classification: "A", organizationId, secondaryOrganizationId: otherOrganizationId,
      objectiveVersions: objectives.length, contextVersions: contexts.length,
      mainObjectiveVersions: [1, 2, 3, 4, 5, 6, 7], mainContextVersions: [1, 2],
      policyId: mapperWithQuestion.policy.policyId, policyVersion: mapperWithQuestion.policy.policyVersion,
      policyDerivedContextVersionPreserved: "policy:objective-acceptance:v1",
      childProcessReload: true, authorizationBeforeRuntimeRead: true,
      staleContext: true, explicitReaffirmation: true, revocationPreservedHistory: true,
      organizationIsolation: true, scopeIsolation: true, governanceDominant: true,
      readerRollbackWorkspaceUnchanged: true, legacyBackfillCount: 0,
      connectorCalls: counters.connector, cognitionMutations: 0, recommendationWrites: 0,
      decisionWrites: 0, outcomeWrites: 0, materialAcquisitionSelections: 0, externalActions: counters.external,
    }, null, 2));
  } finally {
    if (directory.includes("discovery-onboarding-objective-context-acceptance-")) await rm(directory, { recursive: true, force: true });
  }
}

void main();
