import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  ProductAnswer,
  ProductAnswerAbstention,
} from "../workflow/contracts";
import { normalize, stableId } from "../workflow/text";
import {
  buildDurableProductQuestion,
  productQuestionEvents,
} from "../questions/questionLifecycle";
import type { ProductQuestionEvent } from "../questions/contracts";
import {
  PRODUCT_ANSWER_CONTRACT_VERSION,
  PRODUCT_ANSWER_EVENT_KIND,
  PRODUCT_ANSWER_EVENT_SCHEMA_VERSION,
  type ProductAnswerAbstentionReason,
  type ProductAnswerConfidenceSnapshot,
  type ProductAnswerEvent,
  type ProductAnswerHistoryRecord,
  type ProductAnswerOperationReceipt,
  type ProductAnswerOperationRecordedEvent,
  type ProductAnswerOperationResult,
  type ProductAnswerProjection,
  type ProductAnswerType,
  type ProductAnswerVersion,
  type ProductAnswerVersionRecordedEvent,
} from "./contracts";

type LegacyAnswerRecordedEvent = Extract<
  ProductQuestionEvent,
  { type: "answer_recorded" }
>;

export type ProductAnswerEvaluation =
  | {
      kind: "answer";
      answerType: ProductAnswerType;
      answer: ProductAnswer;
    }
  | {
      kind: "targeted-abstention";
      reason: ProductAnswerAbstentionReason;
      limitation: string;
      evidenceConsidered: number;
      evidenceAdmitted: number;
      candidateUnknowns?: import("../unknowns/contracts").ProductUnknownCandidate[];
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isAnswerEvent(value: unknown): value is ProductAnswerEvent {
  if (!isRecord(value)) return false;
  if (
    value.kind !== PRODUCT_ANSWER_EVENT_KIND
    || value.schemaVersion !== PRODUCT_ANSWER_EVENT_SCHEMA_VERSION
    || typeof value.eventId !== "string"
    || typeof value.operationId !== "string"
    || typeof value.organizationId !== "string"
    || typeof value.questionId !== "string"
    || typeof value.occurredAt !== "string"
  ) return false;
  if (value.eventType === "answer-version-recorded") {
    const version = value.answerVersion;
    return isRecord(version)
      && version.contractVersion === PRODUCT_ANSWER_CONTRACT_VERSION
      && typeof version.answerVersionId === "string"
      && typeof version.answerLineageId === "string"
      && version.organizationId === value.organizationId
      && version.questionId === value.questionId;
  }
  if (value.eventType === "answer-operation-recorded") {
    const receipt = value.receipt;
    return isRecord(receipt)
      && receipt.operationId === value.operationId
      && receipt.organizationId === value.organizationId
      && receipt.questionId === value.questionId;
  }
  return false;
}

export function productAnswerEvents(runtime: OrganizationRuntime): ProductAnswerEvent[] {
  return runtime.memory.events
    .filter(isAnswerEvent)
    .filter((event) => event.organizationId === runtime.metadata.organizationId)
    .sort((left, right) =>
      left.occurredAt.localeCompare(right.occurredAt)
      || left.eventType.localeCompare(right.eventType)
      || left.eventId.localeCompare(right.eventId)
    );
}

export function productAnswerVersions(input: {
  runtime: OrganizationRuntime;
  questionId: string;
}): ProductAnswerVersion[] {
  return productAnswerEvents(input.runtime)
    .filter((event): event is ProductAnswerVersionRecordedEvent =>
      event.questionId === input.questionId
      && event.eventType === "answer-version-recorded"
    )
    .map((event) => event.answerVersion)
    .sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt)
      || left.answerVersionId.localeCompare(right.answerVersionId)
    );
}

export function productAnswerOperationReceipts(input: {
  runtime: OrganizationRuntime;
  questionId: string;
}): ProductAnswerOperationReceipt[] {
  return productAnswerEvents(input.runtime)
    .filter((event): event is ProductAnswerOperationRecordedEvent =>
      event.questionId === input.questionId
      && event.eventType === "answer-operation-recorded"
    )
    .map((event) => event.receipt);
}

export function productAnswerHistory(input: {
  runtime: OrganizationRuntime;
  questionId: string;
}): ProductAnswerHistoryRecord[] {
  const legacy: ProductAnswerHistoryRecord[] = productQuestionEvents(input.runtime)
    .filter((event): event is LegacyAnswerRecordedEvent =>
      event.questionId === input.questionId
      && event.type === "answer_recorded"
    )
    .map((event) => ({
      contractVersion: 1,
      source: "legacy-question-event",
      questionId: event.questionId,
      answerVersionId: event.answer.answerId,
      revision: event.answer.revision,
      occurredAt: event.occurredAt,
    }));
  const current: ProductAnswerHistoryRecord[] = productAnswerEvents(input.runtime)
    .filter((event): event is ProductAnswerVersionRecordedEvent =>
      event.questionId === input.questionId
      && event.eventType === "answer-version-recorded"
    )
    .map((event) => ({
      contractVersion: 2,
      source: "answer-version-event",
      questionId: event.questionId,
      answerVersionId: event.answerVersion.answerVersionId,
      revision: null,
      occurredAt: event.occurredAt,
      answerVersion: event.answerVersion,
    }));
  return [...legacy, ...current].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt)
    || left.contractVersion - right.contractVersion
    || left.answerVersionId.localeCompare(right.answerVersionId)
  );
}

export function currentProductAnswerVersion(input: {
  runtime: OrganizationRuntime;
  questionId: string;
}): ProductAnswerVersion | null {
  const versions = productAnswerVersions(input);
  const superseded = new Set(
    versions
      .map((version) => version.supersedesAnswerVersionId)
      .filter((value): value is string => Boolean(value)),
  );
  return versions
    .filter((version) => !superseded.has(version.answerVersionId))
    .sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
      || right.answerVersionId.localeCompare(left.answerVersionId)
    )[0] ?? null;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function evidenceIds(answer: ProductAnswer): string[] {
  return uniqueSorted(answer.discriminatingEvidence.map((item) => item.id));
}

function uniqueEvidence(answer: ProductAnswer): ProductAnswer["discriminatingEvidence"] {
  return [...new Map(
    [...answer.discriminatingEvidence]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((item) => [item.id, item]),
  ).values()];
}

function confidenceSnapshot(input: {
  answer: ProductAnswer;
  answerVersionId: string;
}): ProductAnswerConfidenceSnapshot {
  const unresolved = input.answer.unresolvedAlternatives.length;
  const weakened = input.answer.weakenedAlternatives.length;
  return {
    ownerType: "product-answer",
    ownerAnswerVersionId: input.answerVersionId,
    level: input.answer.confidence.level,
    score: input.answer.confidence.score,
    meaning: input.answer.confidence.meaning,
    principalLimiter: input.answer.confidence.principalLimiter,
    authoritativeSource: input.answer.confidence.authoritativeSource,
    basis: {
      evidentialSupport: input.answer.confidence.meaning,
      discrimination: unresolved > 0
        ? `${unresolved} competing explanation${unresolved === 1 ? " remains" : "s remain"} unresolved.`
        : "No unresolved competing explanation is exposed by the authorized Answer.",
      contradictionStatus: weakened > 0
        ? `${weakened} alternative explanation${weakened === 1 ? " is" : "s are"} weakened by admitted Evidence.`
        : "No weakened alternative is exposed by the authorized Answer.",
      freshnessStatus: "Freshness is not independently established by the current Answer projection.",
    },
    evidenceIds: evidenceIds(input.answer),
    calculatedAt: input.answer.generatedAt,
    calculationContractVersion: 1,
  };
}

function versionFingerprint(input: {
  organizationId: string;
  questionId: string;
  answerType: ProductAnswerType;
  answer: ProductAnswer;
  understandingRevisionRef: string;
  authorizationScopeRef: string;
}): string {
  const answer = input.answer;
  return JSON.stringify({
    organizationId: input.organizationId,
    questionId: input.questionId,
    answerType: input.answerType,
    statement: normalize(answer.conclusion),
    explanationSummary: normalize(answer.whyItMatters),
    evidence: answer.discriminatingEvidence
      .map((item) => ({ id: item.id, role: item.role, statement: normalize(item.statement) }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    weakened: answer.weakenedAlternatives
      .map((item) => ({ id: item.id, explanation: normalize(item.explanation) }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    unresolved: answer.unresolvedAlternatives
      .map((item) => ({ id: item.id, explanation: normalize(item.explanation) }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    confidence: answer.confidence,
    principalLimiter: normalize(answer.principalLimiter),
    understandingRevisionRef: input.understandingRevisionRef,
    authorizationScopeRef: input.authorizationScopeRef,
  });
}

function buildVersion(input: {
  organizationId: string;
  questionId: string;
  operationId: string;
  answerType: ProductAnswerType;
  answer: ProductAnswer;
  understandingRevisionRef: string;
  authorizationScopeRef: string;
  supersedesAnswerVersionId: string | null;
}): ProductAnswerVersion {
  const lineageId = stableId(
    "product-answer-lineage",
    input.organizationId,
    input.questionId,
  );
  const answerVersionId = stableId(
    "product-answer-version",
    lineageId,
    versionFingerprint(input),
  );
  const supporting = input.answer.discriminatingEvidence
    .filter((item) => item.role === "supports")
    .map((item) => item.id);
  const opposing = input.answer.discriminatingEvidence
    .filter((item) => item.role === "weakens")
    .map((item) => item.id);
  const informing = input.answer.discriminatingEvidence
    .filter((item) => item.role === "discriminates")
    .map((item) => item.id);
  return {
    contractVersion: PRODUCT_ANSWER_CONTRACT_VERSION,
    answerVersionId,
    answerLineageId: lineageId,
    organizationId: input.organizationId,
    questionId: input.questionId,
    answerType: input.answerType,
    statement: input.answer.conclusion,
    explanationSummary: input.answer.whyItMatters,
    evidenceBasis: {
      supportingEvidenceIds: uniqueSorted(supporting),
      opposingEvidenceIds: uniqueSorted(opposing),
      informingEvidenceIds: uniqueSorted(informing),
    },
    evidenceCitations: uniqueEvidence(input.answer),
    competingExplanationRefs: [
      ...input.answer.unresolvedAlternatives.map((item) => ({
        explanationId: item.id,
        explanation: item.explanation,
        role: "plausible" as const,
      })),
      ...input.answer.weakenedAlternatives.map((item) => ({
        explanationId: item.id,
        explanation: item.explanation,
        role: "weakened" as const,
      })),
    ].sort((left, right) => left.explanationId.localeCompare(right.explanationId)),
    confidence: null,
    understandingRevisionRef: input.understandingRevisionRef,
    answerOperationId: input.operationId,
    createdAt: input.answer.generatedAt,
    supersedesAnswerVersionId: input.supersedesAnswerVersionId,
    authorizationScopeRef: input.authorizationScopeRef,
    limitation: input.answer.principalLimiter || null,
  };
}

export function projectProductAnswerVersion(input: {
  version: ProductAnswerVersion;
  currentAnswerVersionId: string | null;
}): ProductAnswerProjection {
  return {
    answerVersionId: input.version.answerVersionId,
    questionId: input.version.questionId,
    answerType: input.version.answerType,
    statement: input.version.statement,
    why: input.version.explanationSummary,
    evidenceCitations: [...input.version.evidenceCitations],
    competingExplanations: [...input.version.competingExplanationRefs],
    confidence: input.version.confidence,
    current: input.version.answerVersionId === input.currentAnswerVersionId,
    superseded: input.version.answerVersionId !== input.currentAnswerVersionId,
    freshness: {
      status: "unknown",
      limitation: input.version.confidence?.basis.freshnessStatus ?? null,
    },
    limitation: input.version.limitation,
  };
}

function appendEvent(
  runtime: OrganizationRuntime,
  event: ProductAnswerEvent,
): OrganizationRuntime {
  if (event.organizationId !== runtime.metadata.organizationId) {
    throw new Error("Answer event organization does not match Runtime.");
  }
  if (productAnswerEvents(runtime).some((candidate) => candidate.eventId === event.eventId)) {
    return runtime;
  }
  return {
    ...runtime,
    metadata: { ...runtime.metadata, updatedAt: event.occurredAt },
    memory: { ...runtime.memory, events: [...runtime.memory.events, event] },
  };
}

function mapAbstention(answer: ProductAnswerAbstention): ProductAnswerAbstentionReason {
  if (answer.reason === "no_evidence") return "insufficient-evidence";
  if (answer.reason === "insufficient_discrimination") return "insufficient-discrimination";
  if (answer.reason === "authorization_limited") return "authorization-limited";
  return "relevance-threshold-not-met";
}

export function evaluationFromWorkspaceAnswer(input: {
  answer: ProductAnswer | ProductAnswerAbstention | null;
  evidenceConsidered: number;
  evidenceAdmitted: number;
}): ProductAnswerEvaluation {
  if (!input.answer || input.answer.kind === "abstention") {
    return {
      kind: "targeted-abstention",
      reason: input.answer ? mapAbstention(input.answer) : "insufficient-evidence",
      limitation: input.answer?.principalLimiter
        ?? "The authorized admitted Evidence does not support a truthful Answer.",
      evidenceConsidered: input.evidenceConsidered,
      evidenceAdmitted: input.evidenceAdmitted,
      candidateUnknowns: [],
    };
  }
  return {
    kind: "answer",
    answerType: "supported",
    answer: input.answer,
  };
}

export function recordProductAnswerEvaluation(input: {
  runtime: OrganizationRuntime;
  questionId: string;
  operationId: string;
  occurredAt: string;
  authorizationScopeRef: string;
  understandingRevisionRef: string;
  evaluation: ProductAnswerEvaluation;
  evidenceConsidered: number;
  evidenceAdmitted: number;
}): {
  runtime: OrganizationRuntime;
  result: ProductAnswerOperationResult;
  receipt: ProductAnswerOperationReceipt;
} {
  const question = buildDurableProductQuestion({
    runtime: input.runtime,
    questionId: input.questionId,
  });
  if (!question) {
    throw new Error("Product Question was not found in this organization.");
  }
  const expectedAuthorizationScope =
    `organization:${input.runtime.metadata.organizationId}:question:${input.questionId}`;
  if (input.authorizationScopeRef !== expectedAuthorizationScope) {
    throw new Error("Answer authorization scope does not match Runtime and Question.");
  }
  const existingReceipt = productAnswerOperationReceipts({
    runtime: input.runtime,
    questionId: input.questionId,
  }).find((receipt) => receipt.operationId === input.operationId);
  if (existingReceipt) {
    const current = currentProductAnswerVersion({
      runtime: input.runtime,
      questionId: input.questionId,
    });
    const result: ProductAnswerOperationResult = existingReceipt.answerVersionId && current
      ? {
          kind: "answer",
          answer: projectProductAnswerVersion({
            version: productAnswerVersions({
              runtime: input.runtime,
              questionId: input.questionId,
            }).find((item) => item.answerVersionId === existingReceipt.answerVersionId)!,
            currentAnswerVersionId: current.answerVersionId,
          }),
        }
      : {
          kind: "targeted-abstention",
          reason: existingReceipt.limitationCode && existingReceipt.limitationCode !== "blocked"
            ? existingReceipt.limitationCode
            : "unsupported-conclusion",
          limitation: existingReceipt.limitation
            ?? "The prior authorized Answer operation did not create an Answer version.",
          confidence: null,
          answerVersionId: null,
          candidateUnknowns: [],
        };
    return { runtime: input.runtime, result, receipt: existingReceipt };
  }

  const current = currentProductAnswerVersion({
    runtime: input.runtime,
    questionId: input.questionId,
  });
  let runtime = input.runtime;
  let answerVersion: ProductAnswerVersion | null = null;
  let result: ProductAnswerOperationResult;
  let receipt: ProductAnswerOperationReceipt;

  if (input.evaluation.kind === "targeted-abstention") {
    receipt = {
      operationId: input.operationId,
      organizationId: input.runtime.metadata.organizationId,
      questionId: input.questionId,
      result: "targeted-abstention",
      answerVersionId: null,
      priorAnswerVersionId: current?.answerVersionId ?? null,
      evidenceConsidered: input.evaluation.evidenceConsidered,
      evidenceAdmitted: input.evaluation.evidenceAdmitted,
      changeProduced: false,
      limitationCode: input.evaluation.reason,
      limitation: input.evaluation.limitation,
      occurredAt: input.occurredAt,
    };
    result = {
      kind: "targeted-abstention",
      reason: input.evaluation.reason,
      limitation: input.evaluation.limitation,
      confidence: null,
      answerVersionId: null,
      candidateUnknowns: input.evaluation.candidateUnknowns ?? [],
    };
  } else {
    if (input.evaluation.answer.questionId !== input.questionId) {
      throw new Error("Answer Question does not match the durable Product Question.");
    }
    if (input.evaluation.answer.discriminatingEvidence.length === 0) {
      throw new Error("An Answer version requires admitted Evidence.");
    }
    if (
      input.evaluation.answerType === "competing-explanations"
      && input.evaluation.answer.unresolvedAlternatives.length < 2
    ) {
      throw new Error(
        "A competing-explanations Answer requires at least two unresolved alternatives.",
      );
    }
    const candidate = buildVersion({
      organizationId: input.runtime.metadata.organizationId,
      questionId: input.questionId,
      operationId: input.operationId,
      answerType: input.evaluation.answerType,
      answer: input.evaluation.answer,
      understandingRevisionRef: input.understandingRevisionRef,
      authorizationScopeRef: input.authorizationScopeRef,
      supersedesAnswerVersionId: current?.answerVersionId ?? null,
    });
    const existingVersion = productAnswerVersions({
      runtime,
      questionId: input.questionId,
    }).find((version) => version.answerVersionId === candidate.answerVersionId);
    answerVersion = existingVersion ?? {
      ...candidate,
      supersedesAnswerVersionId: current?.answerVersionId ?? null,
      confidence: confidenceSnapshot({
        answer: input.evaluation.answer,
        answerVersionId: candidate.answerVersionId,
      }),
    };
    const changed = !existingVersion && answerVersion.answerVersionId !== current?.answerVersionId;
    if (!existingVersion) {
      runtime = appendEvent(runtime, {
        kind: PRODUCT_ANSWER_EVENT_KIND,
        schemaVersion: PRODUCT_ANSWER_EVENT_SCHEMA_VERSION,
        eventType: "answer-version-recorded",
        eventId: stableId("product-answer-event", answerVersion.answerVersionId),
        operationId: input.operationId,
        organizationId: runtime.metadata.organizationId,
        questionId: input.questionId,
        occurredAt: input.occurredAt,
        answerVersion,
      });
    }
    receipt = {
      operationId: input.operationId,
      organizationId: runtime.metadata.organizationId,
      questionId: input.questionId,
      result: changed
        ? current ? "answer-superseded" : "answer-created"
        : "answer-unchanged",
      answerVersionId: answerVersion.answerVersionId,
      priorAnswerVersionId: current?.answerVersionId ?? null,
      evidenceConsidered: input.evidenceConsidered,
      evidenceAdmitted: input.evidenceAdmitted,
      changeProduced: changed,
      limitationCode: null,
      limitation: null,
      occurredAt: input.occurredAt,
    };
    result = {
      kind: "answer",
      answer: projectProductAnswerVersion({
        version: answerVersion,
        currentAnswerVersionId: answerVersion.answerVersionId,
      }),
    };
  }

  runtime = appendEvent(runtime, {
    kind: PRODUCT_ANSWER_EVENT_KIND,
    schemaVersion: PRODUCT_ANSWER_EVENT_SCHEMA_VERSION,
    eventType: "answer-operation-recorded",
    eventId: stableId(
      "product-answer-operation-event",
      runtime.metadata.organizationId,
      input.questionId,
      input.operationId,
    ),
    operationId: input.operationId,
    organizationId: runtime.metadata.organizationId,
    questionId: input.questionId,
    occurredAt: input.occurredAt,
    receipt,
  });
  return { runtime, result, receipt };
}
