import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { stableId } from "../workflow/text";
import { buildDurableProductQuestion } from "../questions/questionLifecycle";
import {
  PRODUCT_OBJECTIVE_EVENT_KIND,
  PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION,
  PRODUCT_OPTIMIZATION_CONTEXT_EVENT_KIND,
  type ProductObjectiveAuthorityGrant,
  type ProductObjectiveReferenceValidation,
  type ProductObjectiveScope,
  type ProductObjectiveVersionEvent,
  type ProductOptimizationContext,
  type ProductOptimizationContextVersionEvent,
  type ProductOrganizationalObjective,
} from "./contracts";

const text = (value: string, label: string): string => {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
};
const iso = (value: string | null, label: string): string | null => {
  if (value === null) return null;
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp.`);
  return value;
};
const unique = (values: string[], label: string): string[] => {
  const normalized = values.map((value) => text(value, label));
  if (new Set(normalized).size !== normalized.length) throw new Error(`${label} must be unique.`);
  return normalized;
};
const oneOf = <T extends string>(value: string, allowed: readonly T[], label: string): T => {
  if (!allowed.includes(value as T)) throw new Error(`${label} is invalid.`);
  return value as T;
};

export const objectiveVersionRef = (organizationId: string, objectiveId: string, version: number): string =>
  stableId("product-objective-version", organizationId, objectiveId, String(version));
export const optimizationContextVersionRef = (organizationId: string, contextId: string, version: number): string =>
  stableId("product-optimization-context-version", organizationId, contextId, String(version));

export function scopeKey(scope: ProductObjectiveScope): string {
  if (scope.kind === "organization") return "organization";
  if (scope.kind === "team") return `team:${text(scope.teamRef, "Team reference")}`;
  if (scope.kind === "initiative") return `initiative:${text(scope.initiativeRef, "Initiative reference")}`;
  return `question:${text(scope.questionId, "Question reference")}`;
}

export function validateProductOrganizationalObjective(value: ProductOrganizationalObjective): void {
  if (value.contractVersion !== "1") throw new Error("Objective contract version is unsupported.");
  text(value.objectiveId, "Objective id"); text(value.organizationId, "Organization id");
  scopeKey(value.scope); text(value.statement, "Objective statement");
  text(value.desiredChange.target, "Desired change target");
  oneOf(value.desiredChange.direction, ["increase", "decrease", "maintain", "achieve", "avoid"] as const, "Desired change direction");
  oneOf(value.status, ["proposed", "inferred", "confirmed", "active", "suspended", "achieved", "abandoned", "expired", "superseded"] as const, "Objective status");
  if (value.epistemicConfidence !== null) oneOf(value.epistemicConfidence, ["low", "moderate", "high"] as const, "Objective epistemic confidence");
  oneOf(value.authority.sourceKind, ["authorized-user", "governed-policy", "decision", "inference"] as const, "Objective authority source kind");
  iso(value.horizon.startsAt, "Objective start"); iso(value.horizon.targetBy, "Objective target");
  iso(value.horizon.reviewAt, "Objective review"); iso(value.establishedAt, "Objective established time");
  if (!Number.isInteger(value.version) || value.version < 1) throw new Error("Objective version must be a positive integer.");
  if (value.status === "active" && value.successCriteria.length === 0) {
    throw new Error("An active Objective requires at least one success criterion.");
  }
  if (["confirmed", "active", "suspended", "achieved", "abandoned", "expired"].includes(value.status)
    && !value.authority.authorizedToEstablish) throw new Error("An authoritative Objective status requires establishment authority.");
  if (value.status === "inferred" && value.authority.sourceKind !== "inference") {
    throw new Error("An inferred Objective must preserve inference authority ancestry.");
  }
  if (value.authority.sourceKind === "inference" && value.authority.authorizedToEstablish) {
    throw new Error("Inference cannot establish Objective authority.");
  }
  text(value.authority.sourceRef, "Objective authority source");
  text(value.authority.authorityBasis, "Objective authority basis");
  const criterionIds = unique(value.successCriteria.map((item) => item.criterionId), "Success criterion id");
  if (criterionIds.length !== value.successCriteria.length) throw new Error("Success criterion identity mismatch.");
  for (const criterion of value.successCriteria) {
    text(criterion.statement, "Success criterion statement");
    if (criterion.indicatorRef !== null) text(criterion.indicatorRef, "Indicator reference");
    if (criterion.target.kind === "qualitative") text(criterion.target.description, "Qualitative target");
    else {
      if (criterion.target.kind !== "quantitative") throw new Error("Success criterion target kind is invalid.");
      if (!Number.isFinite(criterion.target.value)) throw new Error("Quantitative target value must be finite.");
      text(criterion.target.unit, "Quantitative target unit");
    }
  }
  unique(value.ancestry.evidenceRefs, "Evidence reference");
  unique(value.ancestry.questionRefs, "Question reference");
  unique(value.ancestry.decisionRefs, "Decision reference");
  unique(value.ancestry.sourceRefs, "Source reference");
  unique(value.constraintRefs, "Constraint reference");
}

export function validateProductOptimizationContext(value: ProductOptimizationContext): void {
  if (value.contractVersion !== "1") throw new Error("Optimization Context contract version is unsupported.");
  text(value.optimizationContextId, "Optimization Context id"); text(value.organizationId, "Organization id");
  text(value.objectiveVersionRef, "Objective version reference");
  text(value.authorityScopeRef, "Optimization Context authority scope");
  oneOf(value.priorityMode, ["maximize-progress", "minimize-downside", "maximize-learning", "preserve-optionality", "balance"] as const, "Priority mode");
  oneOf(value.timePreference.horizon, ["immediate", "near-term", "medium-term", "long-term"] as const, "Time horizon");
  oneOf(value.timePreference.urgency, ["low", "moderate", "high", "critical"] as const, "Urgency");
  oneOf(value.timePreference.delayTolerance, ["low", "moderate", "high"] as const, "Delay tolerance");
  oneOf(value.riskPreference.downsideTolerance, ["low", "moderate", "high"] as const, "Downside tolerance");
  oneOf(value.riskPreference.uncertaintyTolerance, ["low", "moderate", "high"] as const, "Uncertainty tolerance");
  oneOf(value.riskPreference.irreversibleActionTolerance, ["low", "moderate", "high"] as const, "Irreversibility tolerance");
  oneOf(value.minimumEvidenceStandard, ["exploratory", "directional", "substantial", "high-confidence"] as const, "Minimum Evidence standard");
  oneOf(value.source, ["explicit", "authorized-policy", "derived-conditional"] as const, "Optimization Context source");
  if (!Number.isInteger(value.version) || value.version < 1) throw new Error("Optimization Context version must be a positive integer.");
  if (value.alternativesRequirement.minimumMeaningfulAlternatives < 2
    || !Number.isInteger(value.alternativesRequirement.minimumMeaningfulAlternatives)) {
    throw new Error("Optimization Context requires at least two meaningful alternatives.");
  }
  if (!value.alternativesRequirement.includeStatusQuo) throw new Error("Optimization Context must include status quo.");
  if (value.source === "authorized-policy" && !value.sourceRef) throw new Error("Policy-derived Context requires an exact policy version reference.");
  if (value.source === "derived-conditional" && value.assumptions.length === 0) throw new Error("Conditional-derived Context requires disclosed assumptions.");
  if (value.source === "explicit" && value.sourceRef !== null) text(value.sourceRef, "Explicit Context source reference");
  unique(value.resourceConstraintRefs, "Resource constraint reference");
  unique(value.governanceConstraintRefs, "Governance constraint reference");
  unique(value.assumptions, "Optimization Context assumption");
  unique(value.tradeoffPreferences.map((item) => item.preferenceId), "Tradeoff preference id");
  for (const preference of value.tradeoffPreferences) {
    text(preference.criterion, "Tradeoff criterion");
    oneOf(preference.direction, ["increase", "decrease", "preserve"] as const, "Tradeoff direction");
    oneOf(preference.precedence, ["primary", "secondary", "tie-breaker"] as const, "Tradeoff precedence");
  }
}

const assertGrant = (grant: ProductObjectiveAuthorityGrant, authorityScopeRef: string): void => {
  if (!grant.authorized) throw new Error("Objective scope authority denied.");
  if (grant.authorityScopeRef !== authorityScopeRef) throw new Error("Objective authority scope mismatch.");
  text(grant.actorRef, "Objective actor"); iso(grant.authorizedAt, "Objective authorization time");
};
const assertRefs = (validation: ProductObjectiveReferenceValidation): void => {
  if (!validation.valid || validation.invalidRefs.length > 0) throw new Error("Objective or Context reference validation failed.");
};

export function objectiveEvents(runtime: OrganizationRuntime): ProductObjectiveVersionEvent[] {
  return runtime.memory.events.filter((event): event is ProductObjectiveVersionEvent => Boolean(
    event && typeof event === "object"
    && (event as { kind?: unknown }).kind === PRODUCT_OBJECTIVE_EVENT_KIND
    && (event as { schemaVersion?: unknown }).schemaVersion === PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION
    && (event as { organizationId?: unknown }).organizationId === runtime.metadata.organizationId,
  )).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.eventId.localeCompare(b.eventId));
}
export function optimizationContextEvents(runtime: OrganizationRuntime): ProductOptimizationContextVersionEvent[] {
  return runtime.memory.events.filter((event): event is ProductOptimizationContextVersionEvent => Boolean(
    event && typeof event === "object"
    && (event as { kind?: unknown }).kind === PRODUCT_OPTIMIZATION_CONTEXT_EVENT_KIND
    && (event as { schemaVersion?: unknown }).schemaVersion === PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION
    && (event as { organizationId?: unknown }).organizationId === runtime.metadata.organizationId,
  )).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.eventId.localeCompare(b.eventId));
}

export const listOrganizationalObjectiveVersions = (runtime: OrganizationRuntime): ProductOrganizationalObjective[] =>
  objectiveEvents(runtime).map((event) => event.objective);
export const listOptimizationContextVersions = (runtime: OrganizationRuntime): ProductOptimizationContext[] =>
  optimizationContextEvents(runtime).map((event) => event.context);

const latestObjectiveEvent = (events: ProductObjectiveVersionEvent[]): ProductObjectiveVersionEvent | undefined =>
  events.reduce<ProductObjectiveVersionEvent | undefined>((latest, event) =>
    !latest || event.objective.version > latest.objective.version ? event : latest, undefined);
const latestContextEvent = (events: ProductOptimizationContextVersionEvent[]): ProductOptimizationContextVersionEvent | undefined =>
  events.reduce<ProductOptimizationContextVersionEvent | undefined>((latest, event) =>
    !latest || event.context.version > latest.context.version ? event : latest, undefined);

export function validateRuntimeObjectiveReferences(input: {
  runtime: OrganizationRuntime;
  objective?: ProductOrganizationalObjective;
  optimizationContext?: ProductOptimizationContext;
}): ProductObjectiveReferenceValidation {
  const invalidRefs: string[] = [];
  const foreign = (ref: string): boolean => {
    const match = ref.match(/organization:([^:]+)/);
    return Boolean(match && match[1] !== input.runtime.metadata.organizationId);
  };
  if (input.objective) {
    const value = input.objective;
    if (value.scope.kind === "question" && !buildDurableProductQuestion({ runtime: input.runtime, questionId: value.scope.questionId })) {
      invalidRefs.push(value.scope.questionId);
    }
    for (const ref of value.ancestry.questionRefs) {
      const id = ref.startsWith("question:") ? ref.slice("question:".length) : ref;
      if (!buildDurableProductQuestion({ runtime: input.runtime, questionId: id })) invalidRefs.push(ref);
    }
    const decisionIds = new Set(input.runtime.memory.executiveDecisionRecords.map((record) => record.id));
    for (const ref of value.ancestry.decisionRefs) {
      const id = ref.startsWith("decision:") ? ref.slice("decision:".length) : ref;
      if (!decisionIds.has(id)) invalidRefs.push(ref);
    }
    if (value.parentObjectiveVersionRef && !objectiveEvents(input.runtime).some((event) => event.objectiveVersionRef === value.parentObjectiveVersionRef)) {
      invalidRefs.push(value.parentObjectiveVersionRef);
    } else if (value.parentObjectiveVersionRef) {
      const parent = objectiveEvents(input.runtime).find((event) => event.objectiveVersionRef === value.parentObjectiveVersionRef)?.objective;
      const rank = (scope: ProductObjectiveScope): number => scope.kind === "organization" ? 0 : scope.kind === "question" ? 2 : 1;
      if (parent && (rank(parent.scope) > rank(value.scope)
        || (rank(parent.scope) === rank(value.scope) && scopeKey(parent.scope) !== scopeKey(value.scope)))) {
        invalidRefs.push(value.parentObjectiveVersionRef);
      }
    }
    for (const ref of [
      ...value.ancestry.evidenceRefs, ...value.ancestry.sourceRefs,
      ...value.constraintRefs,
    ]) if (foreign(ref)) invalidRefs.push(ref);
  }
  if (input.optimizationContext) {
    const value = input.optimizationContext;
    for (const ref of [
      ...(value.riskPreference.riskCapacityAssessmentRef ? [value.riskPreference.riskCapacityAssessmentRef] : []),
      ...value.resourceConstraintRefs, ...value.governanceConstraintRefs,
      ...(value.sourceRef ? [value.sourceRef] : []),
    ]) if (foreign(ref)) invalidRefs.push(ref);
  }
  return { valid: invalidRefs.length === 0, invalidRefs: [...new Set(invalidRefs)].sort() };
}

export function recordOrganizationalObjectiveVersion(input: {
  runtime: OrganizationRuntime;
  objective: ProductOrganizationalObjective;
  expectedCurrentVersion: number | null;
  operationId: string;
  grant: ProductObjectiveAuthorityGrant;
  references: ProductObjectiveReferenceValidation;
}): { runtime: OrganizationRuntime; objectiveVersionRef: string; idempotent: boolean } {
  validateProductOrganizationalObjective(input.objective);
  if (input.objective.organizationId !== input.runtime.metadata.organizationId) throw new Error("Objective organization mismatch.");
  const scope = scopeKey(input.objective.scope);
  assertGrant(input.grant, input.objective.authority.authorityScopeRef ?? scope);
  assertRefs(input.references);
  const events = objectiveEvents(input.runtime);
  const operation = events.find((event) => event.operationId === input.operationId);
  const versionRef = objectiveVersionRef(input.objective.organizationId, input.objective.objectiveId, input.objective.version);
  if (operation) {
    if (operation.objectiveVersionRef !== versionRef || JSON.stringify(operation.objective) !== JSON.stringify(input.objective)) {
      throw new Error("Objective operation idempotency conflict.");
    }
    return { runtime: input.runtime, objectiveVersionRef: versionRef, idempotent: true };
  }
  const versions = events.filter((event) => event.objective.objectiveId === input.objective.objectiveId);
  const current = latestObjectiveEvent(versions);
  if ((current?.objective.version ?? null) !== input.expectedCurrentVersion) throw new Error("Objective current version changed.");
  if (input.objective.version !== (input.expectedCurrentVersion ?? 0) + 1) throw new Error("Objective version is not sequential.");
  if (input.objective.version === 1 && input.objective.supersedesObjectiveVersionRef !== null) throw new Error("Initial Objective cannot supersede a version.");
  if (input.objective.version > 1 && input.objective.supersedesObjectiveVersionRef !== current?.objectiveVersionRef) throw new Error("Objective supersession reference mismatch.");
  const event: ProductObjectiveVersionEvent = {
    kind: PRODUCT_OBJECTIVE_EVENT_KIND, schemaVersion: PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION,
    eventId: stableId("product-objective-event", input.objective.organizationId, input.operationId),
    operationId: text(input.operationId, "Objective operation id"), organizationId: input.objective.organizationId,
    objectiveVersionRef: versionRef, objective: input.objective, actorRef: input.grant.actorRef,
    authorityScopeRef: input.grant.authorityScopeRef, occurredAt: input.objective.establishedAt,
  };
  return {
    runtime: {
      ...input.runtime,
      metadata: { ...input.runtime.metadata, updatedAt: event.occurredAt },
      memory: { ...input.runtime.memory, events: [...input.runtime.memory.events, event] },
    },
    objectiveVersionRef: versionRef,
    idempotent: false,
  };
}

export function recordOptimizationContextVersion(input: {
  runtime: OrganizationRuntime;
  context: ProductOptimizationContext;
  expectedCurrentVersion: number | null;
  operationId: string;
  grant: ProductObjectiveAuthorityGrant;
  references: ProductObjectiveReferenceValidation;
}): { runtime: OrganizationRuntime; optimizationContextVersionRef: string; idempotent: boolean } {
  validateProductOptimizationContext(input.context);
  if (input.context.organizationId !== input.runtime.metadata.organizationId) throw new Error("Optimization Context organization mismatch.");
  assertGrant(input.grant, input.context.authorityScopeRef); assertRefs(input.references);
  const objective = objectiveEvents(input.runtime).find((event) => event.objectiveVersionRef === input.context.objectiveVersionRef);
  if (!objective) throw new Error("Optimization Context Objective version was not found.");
  const events = optimizationContextEvents(input.runtime);
  const operation = events.find((event) => event.operationId === input.operationId);
  const versionRef = optimizationContextVersionRef(input.context.organizationId, input.context.optimizationContextId, input.context.version);
  if (operation) {
    if (operation.optimizationContextVersionRef !== versionRef || JSON.stringify(operation.context) !== JSON.stringify(input.context)) {
      throw new Error("Optimization Context operation idempotency conflict.");
    }
    return { runtime: input.runtime, optimizationContextVersionRef: versionRef, idempotent: true };
  }
  const versions = events.filter((event) => event.context.optimizationContextId === input.context.optimizationContextId);
  const current = latestContextEvent(versions);
  if ((current?.context.version ?? null) !== input.expectedCurrentVersion) throw new Error("Optimization Context current version changed.");
  if (input.context.version !== (input.expectedCurrentVersion ?? 0) + 1) throw new Error("Optimization Context version is not sequential.");
  if (input.context.version === 1 && input.context.supersedesOptimizationContextVersionRef !== null) throw new Error("Initial Context cannot supersede a version.");
  if (input.context.version > 1 && input.context.supersedesOptimizationContextVersionRef !== current?.optimizationContextVersionRef) throw new Error("Optimization Context supersession reference mismatch.");
  const event: ProductOptimizationContextVersionEvent = {
    kind: PRODUCT_OPTIMIZATION_CONTEXT_EVENT_KIND, schemaVersion: PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION,
    eventId: stableId("product-optimization-context-event", input.context.organizationId, input.operationId),
    operationId: text(input.operationId, "Optimization Context operation id"), organizationId: input.context.organizationId,
    optimizationContextVersionRef: versionRef, context: input.context, actorRef: input.grant.actorRef,
    authorityScopeRef: input.grant.authorityScopeRef, occurredAt: input.grant.authorizedAt,
  };
  return {
    runtime: {
      ...input.runtime,
      metadata: { ...input.runtime.metadata, updatedAt: event.occurredAt },
      memory: { ...input.runtime.memory, events: [...input.runtime.memory.events, event] },
    },
    optimizationContextVersionRef: versionRef,
    idempotent: false,
  };
}
