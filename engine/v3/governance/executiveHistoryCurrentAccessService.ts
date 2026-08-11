import type { GovernedScopeRef, GovernedSensitivity } from "./scopedGovernanceContext";
import {
  assertExecutiveHistoryBinding,
  assertExecutiveHistoryPolicy,
  executiveHistoryDigest,
  executiveHistoryId,
  type ExecutiveHistoryAccessAction,
  type ExecutiveHistoryAccessBindingV1,
  type ExecutiveHistoryAccessEventV1,
  type ExecutiveHistoryAccessPolicyRevisionV1,
  type ExecutiveHistoryAccessRequestV1,
  type ExecutiveHistoryAccessResultV1,
  type ExecutiveHistoryAudienceClause,
  type ExecutiveHistoryPolicyLifecycle,
  type ExecutiveHistoryRecordKind,
} from "./executiveHistoryCurrentAccessContracts";
import {
  ExecutiveHistoryAccessConflictError,
  type ExecutiveHistoryAccessRepository,
} from "./executiveHistoryAccessRepository";

type PolicyInput = {
  organizationId: string;
  policyId?: string;
  actions: ExecutiveHistoryAccessAction[];
  purposes: string[];
  sensitivity: GovernedSensitivity;
  audience: ExecutiveHistoryAudienceClause[];
  effectiveAt: string;
  expiresAt?: string | null;
  authorityRevisionRefs: string[];
  actorRef: string;
  idempotencyKey: string;
};

type PolicyRevisionInput = PolicyInput & {
  policyId: string;
  expectedPolicyRevisionId: string;
};

type PolicyLifecycleInput = {
  organizationId: string;
  policyId: string;
  expectedPolicyRevisionId: string;
  occurredAt: string;
  actorRef: string;
  idempotencyKey: string;
};

type BindingInput = {
  organizationId: string;
  recordKind: ExecutiveHistoryRecordKind;
  recordId: string;
  parentReviewId?: string | null;
  policyRevisionId: string;
  sensitivity: GovernedSensitivity;
  creationOperationId: string;
  effectiveAt: string;
  actorRef: string;
  idempotencyKey: string;
};

type LifecycleInput = {
  organizationId: string;
  recordKind: ExecutiveHistoryRecordKind;
  recordId: string;
  occurredAt: string;
  actorRef: string;
  idempotencyKey: string;
};

const exact = (value: string): boolean =>
  value.trim() === value && value.length > 0 && value !== "*" && !value.includes("\0");
const unique = <T extends string>(values: T[]): T[] => [...new Set(values)].sort();
const safeStore = <T>(value: T): T => structuredClone(value);

function event(input: {
  organizationId: string;
  type: ExecutiveHistoryAccessEventV1["eventType"];
  recordId: string | null;
  policyId: string | null;
  revisionRef: string;
  occurredAt: string;
  actorRef: string;
}): ExecutiveHistoryAccessEventV1 {
  const unsigned = {
    contractVersion: "1" as const,
    eventId: executiveHistoryId(
      "executive-history-access-event",
      input.organizationId,
      input.type,
      input.revisionRef,
    ),
    organizationId: input.organizationId,
    eventType: input.type,
    recordId: input.recordId,
    policyId: input.policyId,
    revisionRef: input.revisionRef,
    occurredAt: input.occurredAt,
    actorRef: input.actorRef,
  };
  return { ...unsigned, eventDigest: executiveHistoryDigest(unsigned) };
}

function bindingHead(
  all: ExecutiveHistoryAccessBindingV1[],
  kind: ExecutiveHistoryRecordKind,
  id: string,
): ExecutiveHistoryAccessBindingV1 | undefined {
  const candidates = all.filter((value) => value.recordKind === kind && value.recordId === id);
  const superseded = new Set(
    candidates.map((value) => value.predecessorRevisionId).filter((value): value is string => Boolean(value)),
  );
  const heads = candidates.filter((value) => !superseded.has(value.bindingRevisionId));
  return heads.length === 1 ? heads[0] : undefined;
}

function policyHead(
  all: ExecutiveHistoryAccessPolicyRevisionV1[],
  id: string,
): ExecutiveHistoryAccessPolicyRevisionV1 | undefined {
  const candidates = all.filter((value) => value.policyId === id);
  const superseded = new Set(
    candidates.map((value) => value.predecessorRevisionId).filter((value): value is string => Boolean(value)),
  );
  const heads = candidates.filter((value) => !superseded.has(value.policyRevisionId));
  return heads.length === 1 ? heads[0] : undefined;
}

export class ExecutiveHistoryCurrentAccessService {
  constructor(
    private readonly repository: ExecutiveHistoryAccessRepository,
    private readonly scopeContains: (parent: GovernedScopeRef, child: GovernedScopeRef) => boolean =
      () => false,
  ) {}

  private async mutation<T>(
    organizationId: string,
    key: string,
    fingerprint: string,
    build: (
      store: Awaited<ReturnType<ExecutiveHistoryAccessRepository["read"]>>["store"],
    ) => { ref: string; value: T },
  ) {
    const current = await this.repository.read(organizationId);
    const store = safeStore(current.store);
    const keyDigest = executiveHistoryDigest(key);
    const prior = store.idempotency.find((value) => value.keyDigest === keyDigest);
    if (prior) {
      if (prior.requestFingerprint !== fingerprint) {
        throw new Error("Executive History access idempotency conflict.");
      }
      return { value: null as T | null, ref: prior.resultRef, snapshot: current, replayed: true };
    }
    const built = build(store);
    store.idempotency.push({ keyDigest, requestFingerprint: fingerprint, resultRef: built.ref });
    try {
      const persisted = await this.repository.replace(organizationId, store, current.revision);
      return { value: built.value, ref: built.ref, snapshot: persisted, replayed: false };
    } catch (error) {
      if (!(error instanceof ExecutiveHistoryAccessConflictError)) throw error;
      const latest = await this.repository.read(organizationId);
      const winner = latest.store.idempotency.find((value) => value.keyDigest === keyDigest);
      if (winner?.requestFingerprint === fingerprint) {
        return { value: null as T | null, ref: winner.resultRef, snapshot: latest, replayed: true };
      }
      if (winner) throw new Error("Executive History access idempotency conflict.");
      throw error;
    }
  }

  async createPolicy(input: PolicyInput): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    return this.createPolicyWithState(input, "active", "policy-created");
  }

  async createPendingPolicy(input: PolicyInput): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    return this.createPolicyWithState(input, "pending", "policy-pending");
  }

  private async createPolicyWithState(
    input: PolicyInput,
    state: "pending" | "active",
    eventType: "policy-pending" | "policy-created",
  ): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    if (
      ![input.organizationId, input.effectiveAt, input.actorRef, input.idempotencyKey].every(exact) ||
      input.actions.length === 0 ||
      input.purposes.length === 0 ||
      input.audience.length === 0
    ) {
      throw new Error("Executive History policy request is invalid.");
    }
    const normalized = {
      ...input,
      actions: unique(input.actions),
      purposes: unique(input.purposes),
      authorityRevisionRefs: unique(input.authorityRevisionRefs),
      expiresAt: input.expiresAt ?? null,
      state,
    };
    const policyId =
      input.policyId ??
      executiveHistoryId(
        "executive-history-access-policy",
        input.organizationId,
        normalized.actions,
        normalized.purposes,
        normalized.sensitivity,
        normalized.audience,
      );
    const fingerprint = executiveHistoryDigest(normalized);
    const result = await this.mutation(input.organizationId, input.idempotencyKey, fingerprint, (store) => {
      if (policyHead(store.policies, policyId)) throw new Error("Executive History policy already exists.");
      const base = {
        contractVersion: "1" as const,
        policyId,
        policyRevisionId: "",
        revision: 1,
        organizationId: input.organizationId,
        actions: normalized.actions,
        purposes: normalized.purposes,
        sensitivity: input.sensitivity,
        audience: structuredClone(input.audience),
        state,
        effectiveAt: input.effectiveAt,
        expiresAt: normalized.expiresAt,
        predecessorRevisionId: null,
        authorityRevisionRefs: normalized.authorityRevisionRefs,
        fingerprint,
      };
      const policyRevisionId = executiveHistoryId("executive-history-access-policy-revision", base);
      const unsigned = { ...base, policyRevisionId };
      const policy = { ...unsigned, integrityDigest: executiveHistoryDigest(unsigned) };
      assertExecutiveHistoryPolicy(policy);
      store.policies.push(policy);
      store.events.push(
        event({
          organizationId: input.organizationId,
          type: eventType,
          recordId: null,
          policyId,
          revisionRef: policyRevisionId,
          occurredAt: input.effectiveAt,
          actorRef: input.actorRef,
        }),
      );
      return { ref: policyRevisionId, value: policy };
    });
    return this.policyResult(result, "Executive History policy replay is unavailable.");
  }

  async activatePolicy(input: PolicyLifecycleInput): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    return this.transitionPolicy(input, "active", "policy-activated", ["pending"]);
  }

  async revisePolicy(input: PolicyRevisionInput): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    const replacement = {
      actions: unique(input.actions),
      purposes: unique(input.purposes),
      sensitivity: input.sensitivity,
      audience: structuredClone(input.audience),
      effectiveAt: input.effectiveAt,
      expiresAt: input.expiresAt ?? null,
      authorityRevisionRefs: unique(input.authorityRevisionRefs),
    };
    return this.transitionPolicy(
      {
        organizationId: input.organizationId,
        policyId: input.policyId,
        expectedPolicyRevisionId: input.expectedPolicyRevisionId,
        occurredAt: input.effectiveAt,
        actorRef: input.actorRef,
        idempotencyKey: input.idempotencyKey,
      },
      "active",
      "policy-revised",
      ["active"],
      replacement,
    );
  }

  async revokePolicy(input: PolicyLifecycleInput): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    return this.transitionPolicy(input, "revoked", "policy-revoked", ["active"]);
  }

  async restorePolicy(input: PolicyLifecycleInput): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    return this.transitionPolicy(input, "active", "policy-restored", ["revoked"]);
  }

  private async transitionPolicy(
    input: PolicyLifecycleInput,
    state: ExecutiveHistoryPolicyLifecycle,
    eventType: ExecutiveHistoryAccessEventV1["eventType"],
    allowed: ExecutiveHistoryPolicyLifecycle[],
    replacement?: Pick<
      ExecutiveHistoryAccessPolicyRevisionV1,
      "actions" | "purposes" | "sensitivity" | "audience" | "effectiveAt" | "expiresAt" | "authorityRevisionRefs"
    >,
  ): Promise<ExecutiveHistoryAccessPolicyRevisionV1> {
    const fingerprint = executiveHistoryDigest({ ...input, state, replacement: replacement ?? null });
    const result = await this.mutation(input.organizationId, input.idempotencyKey, fingerprint, (store) => {
      const prior = policyHead(store.policies, input.policyId);
      if (
        !prior ||
        prior.organizationId !== input.organizationId ||
        prior.policyRevisionId !== input.expectedPolicyRevisionId ||
        !allowed.includes(prior.state)
      ) {
        throw new Error("Executive History policy transition is unavailable.");
      }
      const base = {
        ...prior,
        ...(replacement ?? {}),
        policyRevisionId: "",
        revision: prior.revision + 1,
        state,
        effectiveAt: replacement?.effectiveAt ?? input.occurredAt,
        predecessorRevisionId: prior.policyRevisionId,
        fingerprint,
      };
      const { integrityDigest: _priorDigest, ...withoutDigest } = base;
      const policyRevisionId = executiveHistoryId("executive-history-access-policy-revision", withoutDigest);
      const unsigned = { ...withoutDigest, policyRevisionId };
      const next = { ...unsigned, integrityDigest: executiveHistoryDigest(unsigned) };
      assertExecutiveHistoryPolicy(next);
      store.policies.push(next);
      store.events.push(
        event({
          organizationId: input.organizationId,
          type: eventType,
          recordId: null,
          policyId: input.policyId,
          revisionRef: policyRevisionId,
          occurredAt: input.occurredAt,
          actorRef: input.actorRef,
        }),
      );
      return { ref: policyRevisionId, value: next };
    });
    return this.policyResult(result, "Executive History policy transition replay is unavailable.");
  }

  private policyResult(
    result: Awaited<ReturnType<ExecutiveHistoryCurrentAccessService["mutation"]>>,
    message: string,
  ): ExecutiveHistoryAccessPolicyRevisionV1 {
    if (result.value) return result.value as ExecutiveHistoryAccessPolicyRevisionV1;
    const found = result.snapshot.store.policies.find((value) => value.policyRevisionId === result.ref);
    if (!found) throw new Error(message);
    return found;
  }

  async createPendingBinding(input: BindingInput): Promise<ExecutiveHistoryAccessBindingV1> {
    const snapshot = await this.repository.read(input.organizationId);
    const policy = snapshot.store.policies.find((value) => value.policyRevisionId === input.policyRevisionId);
    if (
      !policy ||
      policy.state !== "active" ||
      policy.organizationId !== input.organizationId ||
      policyHead(snapshot.store.policies, policy.policyId)?.policyRevisionId !== policy.policyRevisionId
    ) {
      throw new Error("Executive History policy is unavailable.");
    }
    const semanticOwner = input.recordKind;
    const fingerprint = executiveHistoryDigest({
      ...input,
      parentReviewId: input.parentReviewId ?? null,
      semanticOwner,
    });
    const bindingId = executiveHistoryId(
      "executive-history-access-binding",
      input.organizationId,
      input.recordKind,
      input.recordId,
    );
    const result = await this.mutation(input.organizationId, input.idempotencyKey, fingerprint, (store) => {
      if (bindingHead(store.bindings, input.recordKind, input.recordId)) {
        throw new Error("Executive History binding already exists.");
      }
      const base = {
        contractVersion: "1" as const,
        bindingId,
        bindingRevisionId: "",
        revision: 1,
        organizationId: input.organizationId,
        recordKind: input.recordKind,
        recordId: input.recordId,
        semanticOwner,
        parentReviewId: input.parentReviewId ?? null,
        policyId: policy.policyId,
        policyRevisionId: policy.policyRevisionId,
        sensitivity: input.sensitivity,
        creationOperationId: input.creationOperationId,
        semanticOwnerPublicationRef: null,
        semanticOwnerIntegrityDigest: null,
        state: "pending" as const,
        effectiveAt: input.effectiveAt,
        predecessorRevisionId: null,
        fingerprint,
      };
      const bindingRevisionId = executiveHistoryId("executive-history-access-binding-revision", base);
      const unsigned = { ...base, bindingRevisionId };
      const binding = { ...unsigned, integrityDigest: executiveHistoryDigest(unsigned) };
      assertExecutiveHistoryBinding(binding);
      store.bindings.push(binding);
      store.events.push(
        event({
          organizationId: input.organizationId,
          type: "binding-pending",
          recordId: input.recordId,
          policyId: policy.policyId,
          revisionRef: bindingRevisionId,
          occurredAt: input.effectiveAt,
          actorRef: input.actorRef,
        }),
      );
      return { ref: bindingRevisionId, value: binding };
    });
    return this.bindingResult(result, "Executive History binding replay is unavailable.");
  }

  async activateBinding(
    input: LifecycleInput & {
      semanticOwnerPublicationRef: string;
      semanticOwnerIntegrityDigest: string;
    },
  ): Promise<ExecutiveHistoryAccessBindingV1> {
    return this.transitionBinding(
      input,
      "active",
      "binding-activated",
      ["pending"],
      input.semanticOwnerPublicationRef,
      input.semanticOwnerIntegrityDigest,
    );
  }

  async revokeBinding(input: LifecycleInput): Promise<ExecutiveHistoryAccessBindingV1> {
    return this.transitionBinding(input, "revoked", "binding-revoked", ["active", "restored"]);
  }

  async restoreBinding(input: LifecycleInput): Promise<ExecutiveHistoryAccessBindingV1> {
    return this.transitionBinding(input, "restored", "binding-restored", ["revoked"]);
  }

  async rebindPolicy(
    input: LifecycleInput & { policyRevisionId: string },
  ): Promise<ExecutiveHistoryAccessBindingV1> {
    const snapshot = await this.repository.read(input.organizationId);
    const policy = snapshot.store.policies.find((value) => value.policyRevisionId === input.policyRevisionId);
    if (
      !policy ||
      policy.organizationId !== input.organizationId ||
      policy.state !== "active" ||
      policyHead(snapshot.store.policies, policy.policyId)?.policyRevisionId !== policy.policyRevisionId
    ) {
      throw new Error("Executive History rebind policy is unavailable.");
    }
    return this.transitionBinding(
      input,
      "active",
      "binding-superseded",
      ["active", "restored", "revoked"],
      undefined,
      undefined,
      policy,
    );
  }

  private async transitionBinding(
    input: LifecycleInput,
    state: "active" | "revoked" | "restored",
    eventType: ExecutiveHistoryAccessEventV1["eventType"],
    allowed: ExecutiveHistoryAccessBindingV1["state"][],
    publication?: string,
    integrity?: string,
    replacementPolicy?: ExecutiveHistoryAccessPolicyRevisionV1,
  ): Promise<ExecutiveHistoryAccessBindingV1> {
    const fingerprint = executiveHistoryDigest({
      ...input,
      state,
      publication: publication ?? null,
      integrity: integrity ?? null,
      policyRevisionId: replacementPolicy?.policyRevisionId ?? null,
    });
    const result = await this.mutation(input.organizationId, input.idempotencyKey, fingerprint, (store) => {
      if (replacementPolicy) {
        const currentReplacementPolicy = policyHead(store.policies, replacementPolicy.policyId);
        if (
          currentReplacementPolicy?.organizationId !== input.organizationId ||
          currentReplacementPolicy.policyRevisionId !== replacementPolicy.policyRevisionId ||
          currentReplacementPolicy.state !== "active"
        ) {
          throw new Error("Executive History rebind policy is no longer current.");
        }
      }
      const prior = bindingHead(store.bindings, input.recordKind, input.recordId);
      if (!prior || !allowed.includes(prior.state)) {
        throw new Error("Executive History binding transition is invalid.");
      }
      const base = {
        ...prior,
        bindingRevisionId: "",
        revision: prior.revision + 1,
        state,
        effectiveAt: input.occurredAt,
        predecessorRevisionId: prior.bindingRevisionId,
        policyId: replacementPolicy?.policyId ?? prior.policyId,
        policyRevisionId: replacementPolicy?.policyRevisionId ?? prior.policyRevisionId,
        semanticOwnerPublicationRef: publication ?? prior.semanticOwnerPublicationRef,
        semanticOwnerIntegrityDigest: integrity ?? prior.semanticOwnerIntegrityDigest,
        fingerprint,
      };
      const { integrityDigest: _priorDigest, ...withoutDigest } = base;
      const bindingRevisionId = executiveHistoryId("executive-history-access-binding-revision", withoutDigest);
      const unsigned = { ...withoutDigest, bindingRevisionId };
      const next = { ...unsigned, integrityDigest: executiveHistoryDigest(unsigned) };
      assertExecutiveHistoryBinding(next);
      store.bindings.push(next);
      store.events.push(
        event({
          organizationId: input.organizationId,
          type: eventType,
          recordId: input.recordId,
          policyId: next.policyId,
          revisionRef: bindingRevisionId,
          occurredAt: input.occurredAt,
          actorRef: input.actorRef,
        }),
      );
      return { ref: bindingRevisionId, value: next };
    });
    return this.bindingResult(result, "Executive History binding transition replay is unavailable.");
  }

  private bindingResult(
    result: Awaited<ReturnType<ExecutiveHistoryCurrentAccessService["mutation"]>>,
    message: string,
  ): ExecutiveHistoryAccessBindingV1 {
    if (result.value) return result.value as ExecutiveHistoryAccessBindingV1;
    const found = result.snapshot.store.bindings.find((value) => value.bindingRevisionId === result.ref);
    if (!found) throw new Error(message);
    return found;
  }

  async authorize(request: ExecutiveHistoryAccessRequestV1): Promise<ExecutiveHistoryAccessResultV1> {
    const kind = request.recordKind === "observed-outcome" ? "executive-review" : request.recordKind;
    const id = request.recordKind === "observed-outcome" ? request.parentReviewId ?? "" : request.recordId;
    const snapshot = await this.repository.read(request.organizationId);
    const binding = bindingHead(snapshot.store.bindings, kind, id);
    const policy = binding ? policyHead(snapshot.store.policies, binding.policyId) : undefined;
    let matched: "direct" | "scope" | null = null;
    let refs: string[] = [];
    const expectedOperation = request.action === "history:list" ? "leadership-history:list" : "leadership-history:read";
    const contextMatches =
      request.governance.disposition === "authorized" &&
      request.governance.organizationId === request.organizationId &&
      request.governance.subjectId === request.subjectId &&
      request.governance.operation === expectedOperation &&
      request.governance.purpose === request.purpose &&
      request.governance.sensitivity === request.sensitivity &&
      request.governance.evaluatedAt === request.evaluatedAt &&
      sameScope(request.governance.requestedScope, request.requestedScope) &&
      request.requestedScope.organizationId === request.organizationId;
    const current =
      binding &&
      policy &&
      ["active", "restored"].includes(binding.state) &&
      binding.organizationId === request.organizationId &&
      policy.organizationId === request.organizationId &&
      binding.policyRevisionId === policy.policyRevisionId &&
      policy.state === "active" &&
      policy.actions.includes(request.action) &&
      policy.purposes.includes(request.purpose) &&
      policy.sensitivity === request.sensitivity &&
      binding.sensitivity === request.sensitivity &&
      Date.parse(policy.effectiveAt) <= Date.parse(request.evaluatedAt) &&
      (!policy.expiresAt || Date.parse(policy.expiresAt) > Date.parse(request.evaluatedAt)) &&
      request.assignment?.state === "active" &&
      contextMatches;
    if (current) {
      const direct = policy.audience.some(
        (value) =>
          value.kind === "direct" &&
          value.subjectId === request.subjectId &&
          value.assignmentRevision === request.assignment!.assignmentRevision,
      );
      const scope = policy.audience.some(
        (value) =>
          value.kind === "scope" &&
          (sameScope(value.scope, request.requestedScope) ||
            (value.coverage === "explicit-descendants" &&
              this.scopeContains(value.scope, request.requestedScope))),
      );
      matched = direct ? "direct" : scope ? "scope" : null;
      if (matched) {
        refs = unique([
          ...policy.authorityRevisionRefs,
          ...request.governance.authorityRefs,
          ...request.governance.policyRefs,
          request.assignment!.assignmentRevision,
        ]);
      }
    }
    const unsigned = {
      contractVersion: "1" as const,
      organizationId: request.organizationId,
      subjectId: request.subjectId,
      recordKind: request.recordKind,
      recordId: request.recordId,
      parentReviewId: request.parentReviewId ?? null,
      action: request.action,
      purpose: request.purpose,
      evaluatedAt: request.evaluatedAt,
      disposition: matched ? ("authorized" as const) : ("inaccessible" as const),
      bindingRevisionId: matched ? binding!.bindingRevisionId : null,
      policyRevisionId: matched ? policy!.policyRevisionId : null,
      matchedAuthorityRevisionRefs: refs,
      matchedAudience: matched,
    };
    return { ...unsigned, resultDigest: executiveHistoryDigest(unsigned) };
  }

  async authorizeBatch(requests: readonly ExecutiveHistoryAccessRequestV1[]) {
    const results: ExecutiveHistoryAccessResultV1[] = [];
    for (const request of requests) results.push(await this.authorize(request));
    return results;
  }
}

function sameScope(left: GovernedScopeRef, right: GovernedScopeRef): boolean {
  return (
    left.organizationId === right.organizationId && left.type === right.type && left.id === right.id
  );
}
