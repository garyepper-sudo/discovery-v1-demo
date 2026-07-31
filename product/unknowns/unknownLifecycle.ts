import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { buildDurableProductQuestion } from "../questions/questionLifecycle";
import { normalize, stableId } from "../workflow/text";
import {
  PRODUCT_UNKNOWN_EVENT_KIND,
  PRODUCT_UNKNOWN_EVENT_SCHEMA_VERSION,
  type ProductUnknownCandidate,
  type ProductUnknownCategory,
  type ProductUnknownLifecycleEvent,
  type ProductUnknownOperationInput,
  type ProductUnknownOperationReceipt,
  type ProductUnknownProjection,
  type ProductUnknownResolutionAncestry,
  type ProductUnknownSourceAncestry,
  type ProductUnknownStatus,
  type ProductUnknownTarget,
} from "./contracts";

const CATEGORIES: ProductUnknownCategory[] = [
  "missing-evidence", "missing-relationship", "unresolved-contradiction",
  "competing-explanation-discrimination", "measurement-gap",
  "authority-or-ownership-gap", "freshness-gap", "scope-or-permission-gap",
  "outcome-validation-gap", "unsupported-assumption",
];

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).sort().join(",")}]`;
  if (record(value)) {
    return `{${Object.keys(value).sort().map((key) => `${key}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(typeof value === "string" ? normalize(value) : value);
}

function validTarget(value: unknown): value is ProductUnknownTarget {
  if (!record(value) || typeof value.kind !== "string") return false;
  const values = Object.entries(value).filter(([key]) => key !== "kind");
  return values.length > 0 && values.every(([, item]) => typeof item === "string" && item.length > 0);
}

function validAncestry(value: unknown): value is ProductUnknownSourceAncestry {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    record(item) && typeof item.kind === "string" && typeof item.id === "string" && item.id.length > 0
  );
}

function validResolution(value: unknown): value is ProductUnknownResolutionAncestry {
  if (!record(value) || typeof value.kind !== "string") return false;
  if (value.kind === "evidence") {
    return Array.isArray(value.evidenceIds)
      && value.evidenceIds.length > 0
      && value.evidenceIds.every((id) => typeof id === "string" && id.length > 0);
  }
  return (
    (value.kind === "outcome" && typeof value.outcomeVersionId === "string")
    || (value.kind === "decision" && typeof value.decisionId === "string")
    || (value.kind === "governed-determination" && typeof value.determinationRef === "string")
  );
}

function isUnknownEvent(value: unknown): value is ProductUnknownLifecycleEvent {
  if (!record(value)) return false;
  const base = value.kind === PRODUCT_UNKNOWN_EVENT_KIND
    && value.schemaVersion === PRODUCT_UNKNOWN_EVENT_SCHEMA_VERSION
    && typeof value.eventType === "string"
    && typeof value.eventId === "string"
    && typeof value.operationId === "string"
    && typeof value.operationFingerprint === "string"
    && typeof value.organizationId === "string"
    && typeof value.questionId === "string"
    && typeof value.unknownId === "string"
    && CATEGORIES.includes(value.category as ProductUnknownCategory)
    && validTarget(value.target)
    && validAncestry(value.sourceAncestry)
    && typeof value.summary === "string"
    && typeof value.whyItMatters === "string"
    && typeof value.reason === "string"
    && typeof value.actorRef === "string"
    && typeof value.authorizationScopeRef === "string"
    && typeof value.occurredAt === "string";
  if (!base) return false;
  if (value.eventType === "unknown-resolved") {
    return validResolution(value.resolutionAncestry)
      && value.supersededByUnknownId === null
      && value.targetingOperationRef === null;
  }
  if (value.eventType === "unknown-superseded") {
    return typeof value.supersededByUnknownId === "string"
      && value.supersededByUnknownId.length > 0
      && value.resolutionAncestry === null
      && value.targetingOperationRef === null;
  }
  if (value.eventType === "unknown-targeted") {
    return typeof value.targetingOperationRef === "string"
      && value.targetingOperationRef.length > 0
      && value.resolutionAncestry === null
      && value.supersededByUnknownId === null;
  }
  return ["unknown-opened", "unknown-reopened", "unknown-retired"].includes(
    String(value.eventType),
  )
    && value.resolutionAncestry === null
    && value.supersededByUnknownId === null
    && value.targetingOperationRef === null;
}

export function productUnknownEvents(runtime: OrganizationRuntime): ProductUnknownLifecycleEvent[] {
  return runtime.memory.events
    .map((event, index) => ({ event, index }))
    .filter((item): item is { event: ProductUnknownLifecycleEvent; index: number } =>
      isUnknownEvent(item.event)
      && item.event.organizationId === runtime.metadata.organizationId
    )
    .sort((left, right) =>
      left.event.occurredAt.localeCompare(right.event.occurredAt)
      || left.index - right.index
    )
    .map((item) => item.event);
}

export function deriveProductUnknownCandidate(input: Omit<ProductUnknownCandidate, "unknownId">):
ProductUnknownCandidate {
  if (!CATEGORIES.includes(input.category)) throw new Error("Unknown category is unsupported.");
  if (!validTarget(input.target)) throw new Error("Unknown requires a typed target.");
  if (!validAncestry(input.sourceAncestry)) throw new Error("Unknown requires source ancestry.");
  const source = [...input.sourceAncestry].sort((a, b) =>
    a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)
  );
  return {
    ...input,
    sourceAncestry: source,
    unknownId: stableId(
      "product-unknown",
      input.organizationId,
      input.questionId,
      input.category,
      canonical(input.target),
      canonical(source),
    ),
  };
}

function project(events: ProductUnknownLifecycleEvent[]): ProductUnknownProjection | null {
  const opened = events.find((event) => event.eventType === "unknown-opened");
  if (!opened) return null;
  let status: ProductUnknownStatus = "open";
  let resolution: ProductUnknownResolutionAncestry | null = null;
  let supersededBy: string | null = null;
  let targetingOperationRef: string | null = null;
  let summary = opened.summary;
  let whyItMatters = opened.whyItMatters;
  let sourceAncestry = opened.sourceAncestry;
  for (const event of events) {
    summary = event.summary;
    whyItMatters = event.whyItMatters;
    sourceAncestry = event.sourceAncestry;
    if (event.eventType === "unknown-targeted") {
      status = "targeted";
      targetingOperationRef = event.targetingOperationRef;
    } else if (event.eventType === "unknown-resolved") {
      status = "resolved";
      resolution = event.resolutionAncestry;
    } else if (event.eventType === "unknown-reopened") {
      status = "open";
      resolution = null;
      targetingOperationRef = null;
    } else if (event.eventType === "unknown-superseded") {
      status = "superseded";
      supersededBy = event.supersededByUnknownId;
    } else if (event.eventType === "unknown-retired") {
      status = "retired";
    }
  }
  const last = events[events.length - 1]!;
  return {
    unknownId: opened.unknownId,
    organizationId: opened.organizationId,
    questionId: opened.questionId,
    category: opened.category,
    target: opened.target,
    status,
    summary,
    whyItMatters,
    sourceAncestry,
    resolutionAncestry: resolution,
    openedAt: opened.occurredAt,
    lastChangedAt: last.occurredAt,
    current: status === "open" || status === "targeted",
    actionable: status === "open" || status === "targeted",
    supersededByUnknownId: supersededBy,
    targetingOperationRef,
  };
}

export function getProductUnknownHistory(input: {
  runtime: OrganizationRuntime; questionId: string; unknownId: string;
}): ProductUnknownLifecycleEvent[] {
  return productUnknownEvents(input.runtime).filter((event) =>
    event.questionId === input.questionId && event.unknownId === input.unknownId
  );
}

export function listProductUnknowns(input: {
  runtime: OrganizationRuntime; questionId: string;
}): ProductUnknownProjection[] {
  const events = productUnknownEvents(input.runtime).filter((event) =>
    event.questionId === input.questionId
  );
  return [...new Set(events.map((event) => event.unknownId))]
    .map((unknownId) => project(events.filter((event) => event.unknownId === unknownId)))
    .filter((item): item is ProductUnknownProjection => Boolean(item))
    .sort((a, b) => a.unknownId.localeCompare(b.unknownId));
}

export function listCurrentProductUnknowns(input: {
  runtime: OrganizationRuntime; questionId: string;
}): ProductUnknownProjection[] {
  return listProductUnknowns(input).filter((item) => item.current);
}

function transitionStatus(type: ProductUnknownOperationInput["transition"]["type"]):
ProductUnknownStatus {
  return type === "open" || type === "reopen" ? "open"
    : type === "target" ? "targeted"
      : type === "resolve" ? "resolved"
        : type === "supersede" ? "superseded"
          : "retired";
}

function assertTransition(
  prior: ProductUnknownStatus | null,
  transition: ProductUnknownOperationInput["transition"],
): void {
  if (transition.type === "open" && prior !== null) throw new Error("Unknown is already open.");
  if (transition.type === "target" && prior !== "open") throw new Error("Only an open Unknown can be targeted.");
  if (transition.type === "resolve" && prior !== "open" && prior !== "targeted") {
    throw new Error("Only an unresolved Unknown can be resolved.");
  }
  if (transition.type === "reopen" && prior !== "resolved") throw new Error("Only a resolved Unknown can be reopened.");
  if (transition.type === "supersede" && prior !== "open" && prior !== "targeted") {
    throw new Error("Only a current unresolved Unknown can be superseded.");
  }
  if (transition.type === "retire" && prior !== "open" && prior !== "targeted" && prior !== "resolved") {
    throw new Error("Unknown cannot be retired from its current state.");
  }
}

export function recordProductUnknownOperation(input: ProductUnknownOperationInput): {
  runtime: OrganizationRuntime;
  projection: ProductUnknownProjection;
  receipt: ProductUnknownOperationReceipt;
} {
  const organizationId = input.runtime.metadata.organizationId;
  if (!buildDurableProductQuestion({ runtime: input.runtime, questionId: input.questionId })) {
    throw new Error("Product Question was not found in this organization.");
  }
  if (
    input.candidate.organizationId !== organizationId
    || input.candidate.questionId !== input.questionId
    || input.authorizationScopeRef !== `organization:${organizationId}:question:${input.questionId}`
  ) throw new Error("Unknown authorization scope does not match Runtime and Question.");
  const expected = deriveProductUnknownCandidate({
    organizationId, questionId: input.questionId,
    category: input.candidate.category, target: input.candidate.target,
    summary: input.candidate.summary, whyItMatters: input.candidate.whyItMatters,
    sourceAncestry: input.candidate.sourceAncestry,
  });
  if (expected.unknownId !== input.candidate.unknownId) throw new Error("Unknown identity is invalid.");
  if (!input.reason.trim() || !input.actorRef.trim()) throw new Error("Unknown transition requires attribution.");
  if (input.transition.type === "resolve" && !validResolution(input.transition.resolutionAncestry)) {
    throw new Error("Unknown resolution requires valid explicit ancestry.");
  }
  if (input.transition.type === "target" && !input.transition.targetingOperationRef.trim()) {
    throw new Error("Targeting requires a future-operation reference.");
  }
  if (input.transition.type === "supersede") {
    const replacement = deriveProductUnknownCandidate(input.transition.replacement);
    if (replacement.unknownId === input.candidate.unknownId) {
      throw new Error("Supersession requires a materially different Unknown identity.");
    }
  }
  const fingerprint = stableId("product-unknown-operation", canonical({
    questionId: input.questionId,
    unknownId: input.candidate.unknownId,
    transition: input.transition,
    reason: input.reason,
    actorRef: input.actorRef,
  }));
  const priorEvent = productUnknownEvents(input.runtime).find((event) =>
    event.operationId === input.operationId
  );
  if (priorEvent) {
    if (priorEvent.operationFingerprint !== fingerprint) {
      throw new Error("Unknown operation ID was already used with different semantic input.");
    }
    const lineage = getProductUnknownHistory({
      runtime: input.runtime,
      questionId: input.questionId,
      unknownId: input.candidate.unknownId,
    });
    const eventIndex = lineage.findIndex((event) => event.eventId === priorEvent.eventId);
    const replayed = project(lineage.slice(0, eventIndex + 1));
    const replayPrior = project(lineage.slice(0, eventIndex));
    if (!replayed) throw new Error("Unknown replay history is malformed.");
    return {
      runtime: input.runtime,
      projection: replayed,
      receipt: {
        operationId: priorEvent.operationId,
        organizationId,
        questionId: input.questionId,
        unknownId: priorEvent.unknownId,
        result: priorEvent.eventType.replace("unknown-", "") as ProductUnknownOperationReceipt["result"],
        priorStatus: replayPrior?.status ?? null,
        currentStatus: replayed.status,
        eventId: priorEvent.eventId,
        changeProduced: true,
        limitationCode: null,
        occurredAt: priorEvent.occurredAt,
      },
    };
  }
  const prior = listProductUnknowns({ runtime: input.runtime, questionId: input.questionId })
    .find((item) => item.unknownId === input.candidate.unknownId) ?? null;
  assertTransition(prior?.status ?? null, input.transition);
  const eventType = `unknown-${input.transition.type === "target" ? "targeted"
    : input.transition.type === "resolve" ? "resolved"
      : input.transition.type === "reopen" ? "reopened"
        : input.transition.type === "supersede" ? "superseded"
          : input.transition.type === "retire" ? "retired" : "opened"}` as ProductUnknownLifecycleEvent["eventType"];
  const event: ProductUnknownLifecycleEvent = {
    kind: PRODUCT_UNKNOWN_EVENT_KIND,
    schemaVersion: PRODUCT_UNKNOWN_EVENT_SCHEMA_VERSION,
    eventType,
    eventId: stableId("product-unknown-event", input.operationId, fingerprint),
    operationId: input.operationId,
    operationFingerprint: fingerprint,
    organizationId,
    questionId: input.questionId,
    unknownId: input.candidate.unknownId,
    category: input.candidate.category,
    target: input.candidate.target,
    sourceAncestry: input.transition.type === "reopen"
      ? [...input.transition.sourceAncestry]
      : [...input.candidate.sourceAncestry],
    summary: input.candidate.summary,
    whyItMatters: input.candidate.whyItMatters,
    reason: input.reason,
    actorRef: input.actorRef,
    authorizationScopeRef: input.authorizationScopeRef,
    occurredAt: input.occurredAt,
    targetingOperationRef: input.transition.type === "target"
      ? input.transition.targetingOperationRef : null,
    resolutionAncestry: input.transition.type === "resolve"
      ? input.transition.resolutionAncestry : null,
    supersededByUnknownId: input.transition.type === "supersede"
      ? deriveProductUnknownCandidate(input.transition.replacement).unknownId : null,
  };
  let runtime: OrganizationRuntime = {
    ...input.runtime,
    metadata: { ...input.runtime.metadata, updatedAt: input.occurredAt },
    memory: { ...input.runtime.memory, events: [...input.runtime.memory.events, event] },
  };
  if (input.transition.type === "supersede") {
    const replacement = deriveProductUnknownCandidate(input.transition.replacement);
    runtime = recordProductUnknownOperation({
      ...input,
      runtime,
      operationId: `${input.operationId}:replacement-open`,
      candidate: replacement,
      transition: { type: "open" },
      reason: `Replacement for ${input.candidate.unknownId}.`,
    }).runtime;
  }
  const projection = listProductUnknowns({ runtime, questionId: input.questionId })
    .find((item) => item.unknownId === input.candidate.unknownId)!;
  return {
    runtime,
    projection,
    receipt: {
      operationId: input.operationId,
      organizationId,
      questionId: input.questionId,
      unknownId: input.candidate.unknownId,
      result: eventType.replace("unknown-", "") as ProductUnknownOperationReceipt["result"],
      priorStatus: prior?.status ?? null,
      currentStatus: transitionStatus(input.transition.type),
      eventId: event.eventId,
      changeProduced: true,
      limitationCode: null,
      occurredAt: input.occurredAt,
    },
  };
}

export const openProductUnknown = recordProductUnknownOperation;
export const targetProductUnknown = recordProductUnknownOperation;
export const resolveProductUnknown = recordProductUnknownOperation;
export const reopenProductUnknown = recordProductUnknownOperation;
export const supersedeProductUnknown = recordProductUnknownOperation;
export const retireProductUnknown = recordProductUnknownOperation;
