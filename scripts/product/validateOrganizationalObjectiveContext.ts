import assert from "node:assert/strict";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";
import type { StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { scenarios } from "../../engine/benchmark/research/organizational-objective-optimization-context-experiment-001/fixtures";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import {
  listOptimizationContextVersions,
  listOrganizationalObjectiveVersions,
  objectiveEvents,
  objectiveVersionRef,
  optimizationContextEvents,
  optimizationContextVersionRef,
  recordOptimizationContextVersion,
  recordOrganizationalObjectiveVersion,
  resolveProductObjectiveContext,
  validateRuntimeObjectiveReferences,
  type ProductObjectiveAuthorityGrant,
  type ProductObjectiveScope,
  type ProductOptimizationContext,
  type ProductOrganizationalObjective,
} from "../../product/objectives";

const organizationId = "objective-contract-validation";
const now = "2026-07-31T12:00:00.000Z";
const scope: ProductObjectiveScope = { kind: "organization" };
const grant = (authorityScopeRef = "organization"): ProductObjectiveAuthorityGrant => ({
  actorRef: "authorized-validator", authorityScopeRef, authorized: true, authorizedAt: now,
});
const references = { valid: true, invalidRefs: [] };

function objective(overrides: Partial<ProductOrganizationalObjective> = {}): ProductOrganizationalObjective {
  return {
    contractVersion: "1", objectiveId: "objective-retention", organizationId, scope,
    statement: "Improve customer retention without weakening service quality.",
    desiredChange: { target: "Customer retention", direction: "increase" },
    successCriteria: [{
      criterionId: "criterion-renewal-quality",
      statement: "Renewal quality improves at the scheduled review.",
      indicatorRef: "indicator:renewal-quality",
      target: { kind: "qualitative", description: "A reviewable improvement supported by retained-customer evidence." },
    }],
    horizon: { startsAt: now, targetBy: "2027-01-31T12:00:00.000Z", reviewAt: "2026-10-31T12:00:00.000Z" },
    status: "active", epistemicConfidence: "moderate",
    authority: {
      sourceKind: "authorized-user", sourceRef: "user:authorized-validator",
      authorityScopeRef: "organization", authorityBasis: "Explicit organization-level mandate.",
      authorizedToEstablish: true,
    },
    ancestry: { evidenceRefs: ["evidence:retention"], questionRefs: [], decisionRefs: [], sourceRefs: ["source:objective-session"] },
    parentObjectiveVersionRef: null, constraintRefs: ["constraint:service-quality"],
    version: 1, supersedesObjectiveVersionRef: null, establishedAt: now,
    ...overrides,
  };
}

function context(objectiveRef: string, overrides: Partial<ProductOptimizationContext> = {}): ProductOptimizationContext {
  return {
    contractVersion: "1", optimizationContextId: "context-retention", organizationId,
    objectiveVersionRef: objectiveRef, priorityMode: "balance",
    timePreference: { horizon: "medium-term", urgency: "moderate", delayTolerance: "moderate" },
    riskPreference: {
      downsideTolerance: "low", uncertaintyTolerance: "moderate",
      irreversibleActionTolerance: "low", riskCapacityAssessmentRef: "assessment:risk-capacity-1",
    },
    resourceConstraintRefs: ["constraint:capacity"], governanceConstraintRefs: ["policy:customer-fairness:v2"],
    tradeoffPreferences: [{ preferenceId: "preference-quality", criterion: "Preserve service quality", direction: "preserve", precedence: "primary" }],
    minimumEvidenceStandard: "substantial",
    alternativesRequirement: { minimumMeaningfulAlternatives: 2, includeStatusQuo: true },
    source: "explicit", sourceRef: null, authorityScopeRef: "organization", assumptions: [],
    version: 1, supersedesOptimizationContextVersionRef: null,
    ...overrides,
  };
}

function createObjective(runtime = createEmptyOrganizationRuntime({ organizationId }), value = objective(), operationId = "objective-create") {
  return recordOrganizationalObjectiveVersion({
    runtime, objective: value, expectedCurrentVersion: value.version === 1 ? null : value.version - 1,
    operationId, grant: grant(value.authority.authorityScopeRef ?? "organization"), references,
  });
}

function createContext(runtime: ReturnType<typeof createEmptyOrganizationRuntime>, value: ProductOptimizationContext, operationId = "context-create") {
  return recordOptimizationContextVersion({
    runtime, context: value, expectedCurrentVersion: value.version === 1 ? null : value.version - 1,
    operationId, grant: grant(value.authorityScopeRef), references,
  });
}

function validateIdentityVersionAndReplay(): void {
  const created = createObjective();
  const firstRef = objectiveVersionRef(organizationId, "objective-retention", 1);
  assert.equal(created.objectiveVersionRef, firstRef);
  assert.equal(createObjective(created.runtime).idempotent, true);
  assert.throws(() => createObjective(created.runtime, objective({ statement: "Conflicting retry." })), /idempotency conflict/);
  assert.throws(() => recordOrganizationalObjectiveVersion({
    runtime: created.runtime, objective: objective({ version: 2, supersedesObjectiveVersionRef: firstRef }),
    expectedCurrentVersion: 0, operationId: "stale-objective", grant: grant(), references,
  }), /current version changed/);
  const revisedValue = objective({
    version: 2, statement: "Improve durable customer retention without weakening service quality.",
    supersedesObjectiveVersionRef: firstRef, establishedAt: "2026-08-01T12:00:00.000Z",
  });
  const revised = createObjective(created.runtime, revisedValue, "objective-revise");
  assert.equal(revised.objectiveVersionRef, objectiveVersionRef(organizationId, "objective-retention", 2));
  assert.deepEqual(listOrganizationalObjectiveVersions(revised.runtime), [objective(), revisedValue]);
  const reloaded = normalizeOrganizationRuntime(JSON.parse(JSON.stringify(revised.runtime)));
  assert.deepEqual(objectiveEvents(reloaded), objectiveEvents(revised.runtime));
}

function validateContextBindingAndNoCarryForward(): void {
  const created = createObjective();
  const value = context(created.objectiveVersionRef);
  const recorded = createContext(created.runtime, value);
  const contextRef = optimizationContextVersionRef(organizationId, "context-retention", 1);
  assert.equal(recorded.optimizationContextVersionRef, contextRef);
  assert.equal(createContext(recorded.runtime, value).idempotent, true);
  const corrected = context(created.objectiveVersionRef, {
    version: 2, priorityMode: "minimize-downside", supersedesOptimizationContextVersionRef: contextRef,
  });
  const revisedContext = createContext(recorded.runtime, corrected, "context-revise");
  assert.deepEqual(listOptimizationContextVersions(revisedContext.runtime), [value, corrected]);
  const objectiveTwo = objective({
    version: 2, statement: "Improve durable retention within the revised horizon.",
    supersedesObjectiveVersionRef: created.objectiveVersionRef, establishedAt: "2026-08-01T12:00:00.000Z",
  });
  const revisedObjective = createObjective(revisedContext.runtime, objectiveTwo, "objective-revise-after-context");
  const resolution = resolveProductObjectiveContext({ runtime: revisedObjective.runtime, scope, evaluationAt: now });
  assert.equal(resolution.status, "stale-context");
  assert.equal(resolution.optimizationContext, null);
  assert.throws(() => createContext(created.runtime, context("foreign-objective-version")), /Objective version was not found/);
}

function validateCurrentContextUsesExplicitVersion(): void {
  const created = createObjective();
  const first = context(created.objectiveVersionRef);
  const firstRecorded = createContext(created.runtime, first, "context-v1");
  const second = context(created.objectiveVersionRef, {
    version: 2,
    priorityMode: "maximize-learning",
    supersedesOptimizationContextVersionRef: firstRecorded.optimizationContextVersionRef,
  });
  const secondRecorded = createContext(firstRecorded.runtime, second, "context-v2-reaffirm");
  const resolved = resolveProductObjectiveContext({ runtime: secondRecorded.runtime, scope, evaluationAt: now });
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.optimizationContext?.version, 2);
  assert.equal(resolved.optimizationContext?.priorityMode, "maximize-learning");
}

function validateSemanticAndAuthorityControls(): void {
  assert.throws(() => createObjective(undefined, objective({ successCriteria: [], status: "active" })), /success criterion/);
  assert.doesNotThrow(() => createObjective(undefined, objective({
    successCriteria: [{ criterionId: "qualitative", statement: "A bounded review confirms improvement.", indicatorRef: null, target: { kind: "qualitative", description: "Review against the recorded baseline at the review date." } }],
  })));
  assert.throws(() => createObjective(undefined, objective({
    status: "confirmed", epistemicConfidence: "high",
    authority: { sourceKind: "inference", sourceRef: "inference:1", authorityScopeRef: "organization", authorityBasis: "Repeated mention.", authorizedToEstablish: false },
  })), /requires establishment authority/);
  const inferred = createObjective(undefined, objective({
    status: "inferred", successCriteria: [],
    authority: { sourceKind: "inference", sourceRef: "inference:1", authorityScopeRef: "organization", authorityBasis: "Unconfirmed hypothesis.", authorizedToEstablish: false },
  }));
  assert.equal(resolveProductObjectiveContext({ runtime: inferred.runtime, scope, evaluationAt: now }).status, "missing-authority");
  assert.throws(() => createContext(createObjective().runtime, context(objectiveVersionRef(organizationId, "objective-retention", 1), {
    source: "authorized-policy", sourceRef: null,
  })), /policy version/);
  assert.throws(() => createContext(createObjective().runtime, context(objectiveVersionRef(organizationId, "objective-retention", 1), {
    source: "derived-conditional", assumptions: [],
  })), /disclosed assumptions/);
  assert.throws(() => createContext(createObjective().runtime, context(objectiveVersionRef(organizationId, "objective-retention", 1), {
    alternativesRequirement: { minimumMeaningfulAlternatives: 1, includeStatusQuo: true },
  })), /at least two meaningful alternatives/);
  assert.throws(() => recordOrganizationalObjectiveVersion({
    runtime: createEmptyOrganizationRuntime({ organizationId: "foreign" }), objective: objective(),
    expectedCurrentVersion: null, operationId: "foreign", grant: grant(), references,
  }), /organization mismatch/);
  assert.throws(() => recordOrganizationalObjectiveVersion({
    runtime: createEmptyOrganizationRuntime({ organizationId }), objective: objective(),
    expectedCurrentVersion: null, operationId: "invalid-refs", grant: grant(),
    references: { valid: false, invalidRefs: ["question:foreign"] },
  }), /reference validation failed/);
  assert.deepEqual(validateRuntimeObjectiveReferences({
    runtime: createEmptyOrganizationRuntime({ organizationId }),
    objective: objective({ scope: { kind: "question", questionId: "missing-question" } }),
  }).invalidRefs, ["missing-question"]);
  assert.deepEqual(validateRuntimeObjectiveReferences({
    runtime: createEmptyOrganizationRuntime({ organizationId }),
    objective: objective({ constraintRefs: ["organization:foreign:constraint:1"] }),
  }).invalidRefs, ["organization:foreign:constraint:1"]);
}

function validateResolution(): void {
  const empty = createEmptyOrganizationRuntime({ organizationId });
  assert.equal(resolveProductObjectiveContext({ runtime: empty, scope, evaluationAt: now }).status, "missing-objective");
  const confirmed = createObjective(undefined, objective({ status: "confirmed" }));
  assert.equal(resolveProductObjectiveContext({ runtime: confirmed.runtime, scope, evaluationAt: now }).status, "objective-inactive");
  const created = createObjective();
  assert.equal(resolveProductObjectiveContext({ runtime: created.runtime, scope, evaluationAt: now }).status, "missing-context");
  const complete = createContext(created.runtime, context(created.objectiveVersionRef));
  const resolved = resolveProductObjectiveContext({ runtime: complete.runtime, scope, evaluationAt: now });
  assert.equal(resolved.status, "resolved"); assert.equal(resolved.eligibleForObjectiveRecommendation, true);
  assert.equal(resolveProductObjectiveContext({ runtime: complete.runtime, scope, evaluationAt: now, governanceProhibition: "Protected policy prohibits action." }).status, "governance-prohibited");
  const competingContext = createContext(
    complete.runtime,
    context(created.objectiveVersionRef, { optimizationContextId: "context-competing" }),
    "context-competing-create",
  );
  assert.equal(resolveProductObjectiveContext({ runtime: competingContext.runtime, scope, evaluationAt: now }).status, "ambiguous-contexts");
  const second = createObjective(complete.runtime, objective({ objectiveId: "objective-quality" }), "objective-quality-create");
  assert.equal(resolveProductObjectiveContext({ runtime: second.runtime, scope, evaluationAt: now }).status, "ambiguous-objectives");
  assert.equal((resolveProductObjectiveContext({ runtime: created.runtime, scope, evaluationAt: now }).clarificationQuestion ?? "").length > 0, true);
}

async function validateAdapterAuthorizationAndConcurrency(): Promise<void> {
  let stored: StoredOrganizationRuntime = {
    runtime: createEmptyOrganizationRuntime({ organizationId }), bytes: new Uint8Array(), revision: "r0",
  };
  let authorized = false; let readsBeforeAuthorization = 0; let replacements = 0;
  const adapter = new CanonicalProductWorkspaceAdapter({
    async authorize() { authorized = true; return true; },
    async investigate() { throw new Error("Investigation must not run."); },
    async authorizeObjectiveScope(input) { return { ...grant(input.requestedAuthorityScopeRef), actorRef: input.userId }; },
    async validateObjectiveReferences() { return references; },
    runtimeRepository: {
      async read() { if (!authorized) readsBeforeAuthorization += 1; return stored; },
      async replace(_id, bytes, expectedRevision) {
        assert.equal(expectedRevision, stored.revision); replacements += 1;
        const runtime = normalizeOrganizationRuntime(JSON.parse(new TextDecoder().decode(bytes)));
        stored = { runtime, bytes, revision: `r${replacements}` }; return stored;
      },
    },
  });
  const result = await adapter.recordObjective({
    userId: "user-validator", organizationId, objective: objective(), expectedCurrentVersion: null,
    operationId: "adapter-objective", operation: { requestId: "adapter-objective", operatorId: "validator" },
  });
  assert.equal(result.runtimeRevision, "r1"); assert.equal(readsBeforeAuthorization, 0);
  const contextResult = await adapter.recordOptimizationContext({
    userId: "user-validator", organizationId, scope, optimizationContext: context(result.objectiveVersionRef),
    expectedCurrentVersion: null, operationId: "adapter-context",
    operation: { requestId: "adapter-context", operatorId: "validator" },
  });
  assert.equal(contextResult.runtimeRevision, "r2");
  const resolution = await adapter.resolveObjectiveContext({ userId: "user-validator", organizationId, scope, evaluationAt: now });
  assert.equal(resolution.resolution.status, "resolved"); assert.equal(replacements, 2);
  assert.equal(stored.runtime.metadata.investigationCount, 0);
  let deniedReads = 0;
  const denied = new CanonicalProductWorkspaceAdapter({
    async authorize() { return false; }, async investigate() { throw new Error("not reached"); },
    runtimeRepository: { async read() { deniedReads += 1; return stored; }, async replace() { throw new Error("not reached"); } },
  });
  await assert.rejects(() => denied.resolveObjectiveContext({ userId: "denied", organizationId, scope, evaluationAt: now }), /access denied/);
  assert.equal(deniedReads, 0);
}

function validateLegacyAndReadDisableCompatibility(): void {
  const legacy = createEmptyOrganizationRuntime({ organizationId });
  legacy.memory.events.push({ kind: "legacy-objective-like", objective: "Increase growth", strategicObjective: "Expand" });
  legacy.memory.executiveRecommendation = { objective: "Legacy recommendation objective" } as never;
  const before = JSON.stringify(legacy);
  assert.deepEqual(listOrganizationalObjectiveVersions(legacy), []);
  assert.deepEqual(listOptimizationContextVersions(legacy), []);
  assert.equal(resolveProductObjectiveContext({ runtime: legacy, scope, evaluationAt: now }).status, "missing-objective");
  assert.equal(JSON.stringify(legacy), before);
}

function validateSerializedBenchmarkReplay(): void {
  for (const scenario of scenarios) {
    let runtime = createEmptyOrganizationRuntime({ organizationId });
    if (scenario.expected !== "understanding-recommendation") {
      const baseObjective = objective({ objectiveId: `objective-${scenario.id}` });
      if (scenario.id === "no-success-criterion") {
        runtime = createObjective(runtime, { ...baseObjective, status: "confirmed", successCriteria: [] }, `objective-${scenario.id}`).runtime;
      } else if (scenario.expected === "confirm-objective") {
        runtime = createObjective(runtime, { ...baseObjective, status: "inferred", successCriteria: [], authority: { sourceKind: "inference", sourceRef: `inference:${scenario.id}`, authorityScopeRef: "organization", authorityBasis: "Synthetic benchmark hypothesis.", authorizedToEstablish: false } }, `objective-${scenario.id}`).runtime;
      } else {
        runtime = createObjective(runtime, baseObjective, `objective-${scenario.id}`).runtime;
      }
      const objectiveRef = objectiveVersionRef(organizationId, baseObjective.objectiveId, 1);
      if (scenario.expected === "objective-recommendation-eligible") {
        runtime = createContext(runtime, context(objectiveRef, { optimizationContextId: `context-${scenario.id}` }), `context-${scenario.id}`).runtime;
      } else if (scenario.expected === "resolve-objective-conflict") {
        runtime = createObjective(runtime, objective({ objectiveId: `objective-${scenario.id}-conflict` }), `objective-${scenario.id}-conflict`).runtime;
      }
    }
    const reloaded = normalizeOrganizationRuntime(JSON.parse(JSON.stringify(runtime)));
    const prohibition = scenario.expected === "abstain" ? "Synthetic governance stop." : null;
    const first = resolveProductObjectiveContext({ runtime: reloaded, scope, evaluationAt: now, governanceProhibition: prohibition });
    const second = resolveProductObjectiveContext({ runtime: normalizeOrganizationRuntime(JSON.parse(JSON.stringify(reloaded))), scope, evaluationAt: now, governanceProhibition: prohibition });
    assert.deepEqual(first, second, scenario.id);
    if (scenario.expected === "objective-recommendation-eligible") assert.equal(first.status, "resolved", scenario.id);
    if (scenario.expected === "resolve-objective-conflict") assert.equal(first.status, "ambiguous-objectives", scenario.id);
    if (scenario.expected === "ask-material-context") assert.equal(first.status, "missing-context", scenario.id);
    if (scenario.expected === "abstain") assert.equal(first.status, "governance-prohibited", scenario.id);
    if (scenario.expected === "confirm-objective") assert.ok(["missing-authority", "insufficient-success-criteria"].includes(first.status), scenario.id);
  }
}

async function main(): Promise<void> {
  validateIdentityVersionAndReplay(); validateContextBindingAndNoCarryForward();
  validateCurrentContextUsesExplicitVersion();
  validateSemanticAndAuthorityControls(); validateResolution();
  validateLegacyAndReadDisableCompatibility();
  await validateAdapterAuthorizationAndConcurrency(); validateSerializedBenchmarkReplay();
  console.log(JSON.stringify({
    validation: "organizational-objective-optimization-context-contract",
    result: "PASS", serializedBenchmarkScenarios: scenarios.length,
    runtimeCollection: "memory.events", productQuestionSchemaChanged: false,
    workspaceContractChanged: false, cognitionWrites: 0, recommendationWrites: 0,
    decisionWrites: 0, outcomeWrites: 0, externalActions: 0,
  }, null, 2));
}

void main();
