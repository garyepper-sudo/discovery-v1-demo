import { createHash } from "node:crypto";

import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { stableId } from "../workflow/text";
import { createDurableProductQuestion } from "./questionLifecycle";

export const INITIAL_UNDERSTANDING_QUESTION_ROLE = "initial-understanding-requester" as const;

export type InitialUnderstandingQuestionIdentityV1 = {
  contractVersion: "1";
  organizationId: string;
  externalKey: string;
  questionId: string;
  role: typeof INITIAL_UNDERSTANDING_QUESTION_ROLE;
  normalizedQuestionDigest: string;
  idempotencyKey: string;
};

const normalize = (value: string, label: string): string => {
  const normalized = value.trim().replace(/\s+/gu, " ");
  if (!normalized || normalized.length > 500 || normalized.includes("\0")) throw new Error(`Initial Product Question ${label} is invalid.`);
  return normalized;
};
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** Issues the first Question's identity and provenance-only role. Callers can
 * neither choose this identity nor turn the role into authorization. */
export function issueInitialUnderstandingQuestionIdentity(input: {
  contractVersion: "1";
  organizationId: string;
  activationOperationId: string;
  meetingExternalKey: string;
  primaryQuestion: string;
  purpose: string;
}): InitialUnderstandingQuestionIdentityV1 {
  if (input.contractVersion !== "1") throw new Error("Initial Product Question input is invalid.");
  const organizationId = normalize(input.organizationId, "organization");
  const activationOperationId = normalize(input.activationOperationId, "operation");
  const meetingExternalKey = normalize(input.meetingExternalKey, "meeting key");
  const primaryQuestion = normalize(input.primaryQuestion, "text");
  normalize(input.purpose, "purpose");
  const normalizedQuestionDigest = digest(primaryQuestion.toLocaleLowerCase("en-US"));
  const keyDigest = digest({ scheme: "initial-understanding-question.v1", organizationId, activationOperationId, meetingExternalKey, normalizedQuestionDigest });
  const externalKey = `initial-understanding-question:${keyDigest}`;
  const idempotencyKey = `initial-understanding-question:${digest({ organizationId, activationOperationId, externalKey })}`;
  return { contractVersion: "1", organizationId, externalKey, questionId: stableId("product-question", organizationId, idempotencyKey), role: INITIAL_UNDERSTANDING_QUESTION_ROLE, normalizedQuestionDigest, idempotencyKey };
}

export function recordInitialUnderstandingQuestion(input: {
  runtime: OrganizationRuntime;
  identity: InitialUnderstandingQuestionIdentityV1;
  primaryQuestion: string;
  createdAt: string;
}): { runtime: OrganizationRuntime; identity: InitialUnderstandingQuestionIdentityV1 } {
  const bootstrap = input.runtime.memory.initialUnderstandingBootstrap;
  if (input.runtime.metadata.organizationId !== input.identity.organizationId || bootstrap?.initialProductQuestionId !== input.identity.questionId || bootstrap.initialProductQuestionRole !== input.identity.role) throw new Error("Initial Product Question identity is unavailable.");
  const created = createDurableProductQuestion({ runtime: input.runtime, title: normalize(input.primaryQuestion, "text"), createdAt: input.createdAt, questionId: input.identity.questionId });
  if (created.question.id !== input.identity.questionId || created.question.status !== "created") throw new Error("Initial Product Question could not be established.");
  return { runtime: created.runtime, identity: input.identity };
}
