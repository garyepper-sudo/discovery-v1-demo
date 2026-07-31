import "server-only";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { runDiscoveryV3 } from "../../engine/v3";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import {
  createOrganizationRuntimeRepository,
  type StoredOrganizationRuntime,
} from "../../engine/v3/runtime";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../lib/onboarding/testing";
import {
  CanonicalProductWorkspaceAdapter,
  type CanonicalEvidenceContribution,
  type ProductHistoricalAnswerResolution,
  type ProductQuestionSummary,
} from "../integration";
import type { ProductQuestionWorkspace } from "../workflow";

export type LiveSandboxSnapshot = {
  contractVersion: "1";
  organizationId: string;
  questions: ProductQuestionSummary[];
  workspace: ProductQuestionWorkspace | null;
  historicalAnswers: ProductHistoricalAnswerResolution[];
};

function exactOrganizationId(value: string): string {
  if (!isOnboardingTestOrganizationId(value)) {
    throw new Error("Live sandbox requires an exact onboarding organization.");
  }
  return value;
}

function safeError(error: unknown): Error {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("access denied")) return new Error("Organization access denied.");
  if (message.includes("not found")) return new Error("Question not found.");
  if (message.includes("revision") || message.includes("conflict")) {
    return new Error("This understanding changed before the update could be saved. Reload and try again.");
  }
  if (message.includes("evidence") || message.includes("Investigation")) {
    return new Error("Discovery could not save this update.");
  }
  return new Error("The live sandbox operation could not be completed.");
}

export async function withLiveSandboxProductAdapter<T>(input: {
  userId: string;
  organizationId: string;
  operation(adapter: CanonicalProductWorkspaceAdapter): Promise<T>;
}): Promise<T> {
  validateOnboardingTestEnvironment();
  const organizationId = exactOrganizationId(input.organizationId);
  const runtimeRepository = createOrganizationRuntimeRepository();
  if (runtimeRepository.backend !== "filesystem") {
    throw new Error("Live sandbox requires filesystem Runtime storage.");
  }
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const accessRepository = new PostgresAlphaAccessRecordRepository(sql);
    const adapter = new CanonicalProductWorkspaceAdapter({
      runtimeRepository,
      authorize: async ({ userId, organizationId: requestedOrganizationId }) => {
        if (requestedOrganizationId !== organizationId || userId !== input.userId) return false;
        const records = await accessRepository.findAccessRecords({
          consumerId: userId,
          organizationId,
          experience: "organization",
          resolvedAt: new Date().toISOString(),
        });
        const now = Date.now();
        return records.some((record) =>
          record.status === "active"
          && (!record.validUntil || Date.parse(record.validUntil) > now)
        );
      },
      investigate: async ({ runtime, question, contribution }) =>
        investigate(runtime, question, contribution),
    });
    return await input.operation(adapter);
  } catch (error) {
    throw safeError(error);
  } finally {
    await sql.end();
  }
}

async function investigate(
  runtime: StoredOrganizationRuntime["runtime"],
  question: string,
  contribution: CanonicalEvidenceContribution,
) {
  const investigationInput = {
    company: runtime.metadata.name || runtime.metadata.organizationId,
    website: runtime.metadata.website ?? "",
    industry: runtime.metadata.industry ?? "",
    question,
    context: contribution.content,
    evidenceSources: [{
      sourceId: contribution.sourceId,
      sourceType: contribution.sourceType,
      observedAt: contribution.contributedAt,
      ingestionMethod: contribution.sourceType === "paste" ? "paste" as const : "file" as const,
      content: contribution.content,
    }],
  };
  const result = runDiscoveryV3(investigationInput);
  return {
    evidenceAccepted: result.evidence.length > 0,
    runtime: evolveOrganizationRuntime({
      runtime,
      result,
      input: investigationInput,
    }),
  };
}

function unavailableHistory(workspace: ProductQuestionWorkspace): ProductHistoricalAnswerResolution[] {
  return workspace.question.answerHistory.map((entry) => ({
    status: "unavailable",
    answerId: entry.answerId,
    questionRevision: entry.revision,
    reason: "source-missing",
  }));
}

export async function readLiveSandbox(input: {
  userId: string;
  organizationId: string;
  questionId?: string;
  adoptLegacy?: boolean;
}): Promise<LiveSandboxSnapshot> {
  return withLiveSandboxProductAdapter({
    ...input,
    operation: async (adapter) => {
      if (input.adoptLegacy) {
        await adapter.adoptLegacyQuestions({
          userId: input.userId,
          organizationId: input.organizationId,
          operation: {
            requestId: `product-alpha-adopt:${input.organizationId}`,
            operatorId: input.userId,
          },
        });
      }
      const questions = await adapter.listQuestions({
        userId: input.userId,
        organizationId: input.organizationId,
      });
      const questionId = input.questionId && questions.some((item) => item.id === input.questionId)
        ? input.questionId
        : questions[0]?.id;
      const workspace = questionId
        ? (await adapter.getQuestionWorkspace({
            userId: input.userId,
            organizationId: input.organizationId,
            questionId,
          })).workspace
        : null;
      return {
        contractVersion: "1",
        organizationId: input.organizationId,
        questions,
        workspace,
        historicalAnswers: workspace ? unavailableHistory(workspace) : [],
      };
    },
  });
}

export async function mutateLiveSandbox(input: {
  userId: string;
  organizationId: string;
  command:
    | { type: "create"; question: string; idempotencyKey: string }
    | { type: "contribute"; questionId: string; content: string; idempotencyKey: string }
    | { type: "archive"; questionId: string; idempotencyKey: string };
}): Promise<LiveSandboxSnapshot> {
  return withLiveSandboxProductAdapter({
    ...input,
    operation: async (adapter) => {
      const now = new Date().toISOString();
      const operation = {
        requestId: input.command.idempotencyKey,
        operatorId: input.userId,
      };
      let questionId: string;
      if (input.command.type === "create") {
        const result = await adapter.createQuestion({
          userId: input.userId,
          organizationId: input.organizationId,
          question: input.command.question,
          createdAt: now,
          idempotencyKey: input.command.idempotencyKey,
          operation,
        });
        questionId = result.workspace.question.id;
      } else if (input.command.type === "contribute") {
        const result = await adapter.contributeEvidence({
          userId: input.userId,
          organizationId: input.organizationId,
          questionId: input.command.questionId,
          contribution: {
            sourceId: `product-alpha:${input.command.idempotencyKey}`,
            sourceType: "paste",
            content: input.command.content,
            contributedAt: now,
            idempotencyKey: input.command.idempotencyKey,
          },
          operation,
        });
        questionId = result.workspace.question.id;
      } else {
        await adapter.archiveQuestion({
          userId: input.userId,
          organizationId: input.organizationId,
          questionId: input.command.questionId,
          archivedAt: now,
          operation,
        });
        questionId = "";
      }
      const questions = await adapter.listQuestions({
        userId: input.userId,
        organizationId: input.organizationId,
      });
      if (!questionId) questionId = questions[0]?.id ?? "";
      const workspace = questionId
        ? (await adapter.getQuestionWorkspace({
            userId: input.userId,
            organizationId: input.organizationId,
            questionId,
          })).workspace
        : null;
      return {
        contractVersion: "1",
        organizationId: input.organizationId,
        questions,
        workspace,
        historicalAnswers: workspace ? unavailableHistory(workspace) : [],
      };
    },
  });
}
