import { RuntimeStorageConflictError, type RuntimeStorageOperationMetadata } from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { ProductDecisionDraftService } from "./productDecisionDraftService";
import type { LeadershipConversationProductOperations } from "../workflow/leadershipConversation/operations";
import {
  assertCanonicalProductMaterializationInstructionIntegrityV1,
  createCanonicalProductDecisionDraftMaterializationResultDigestV1,
  createCanonicalProductMaterializationRecoveryResultDigestV1,
  type CanonicalProductDecisionDraftMaterializationResultV1,
  type CanonicalProductMaterializationRecoveryResultV1,
} from "../workflow/leadershipConversation/canonicalProductMaterializationContracts";
import type {
  CanonicalLeadershipConversationProductMaterializerInputV1,
  CanonicalLeadershipConversationProductMaterializerResultV1,
} from "./canonicalMutationProductMaterializationContracts";

export type CanonicalLeadershipConversationProductMaterializerDependencies = {
  productDecisionDraftService: Pick<ProductDecisionDraftService, "materializeCommittedInstruction">;
  productWorkflowOperations: Pick<LeadershipConversationProductOperations, "materializeCanonicalProductInstruction">;
  storageOperation(input: { canonicalOperationId: string; stage: "draft" }): RuntimeStorageOperationMetadata;
};

export class CanonicalLeadershipConversationProductMaterializer {
  constructor(private readonly dependencies: CanonicalLeadershipConversationProductMaterializerDependencies) {}

  async materialize(
    input: CanonicalLeadershipConversationProductMaterializerInputV1,
  ): Promise<CanonicalLeadershipConversationProductMaterializerResultV1> {
    const { instruction } = input;
    assertCanonicalProductMaterializationInstructionIntegrityV1(instruction);
    let draftResult: CanonicalProductDecisionDraftMaterializationResultV1;
    if (!instruction.draftMaterialization.required) {
      const unsigned = {
        contractVersion: "1" as const,
        status: "not-applicable" as const,
        canonicalOperationId: instruction.canonicalOperationId,
        instructionDigest: instruction.instructionDigest,
        receipt: null,
      };
      draftResult = {
        ...unsigned,
        resultDigest: createCanonicalProductDecisionDraftMaterializationResultDigestV1(unsigned),
      };
    } else if (input.draftResult?.status === "materialized") {
      draftResult = input.draftResult;
    } else {
      try {
        const materialized = await this.dependencies.productDecisionDraftService.materializeCommittedInstruction({
          instruction,
          storageOperation: this.dependencies.storageOperation({ canonicalOperationId: instruction.canonicalOperationId, stage: "draft" }),
        });
        if (!materialized.materializationReceipt) throw new Error("Canonical Draft stage receipt is unavailable.");
        const unsigned = {
          contractVersion: "1" as const,
          status: "materialized" as const,
          canonicalOperationId: instruction.canonicalOperationId,
          instructionDigest: instruction.instructionDigest,
          receipt: materialized.materializationReceipt,
        };
        draftResult = { ...unsigned, resultDigest: createCanonicalProductDecisionDraftMaterializationResultDigestV1(unsigned) };
      } catch (error) {
        const conflict = error instanceof RuntimeStorageConflictError;
        const unsignedDraft = {
          contractVersion: "1" as const,
          status: conflict ? "pending" as const : "integrity-failure" as const,
          canonicalOperationId: instruction.canonicalOperationId,
          instructionDigest: instruction.instructionDigest,
          receipt: null,
        };
        const pendingDraft = { ...unsignedDraft, resultDigest: createCanonicalProductDecisionDraftMaterializationResultDigestV1(unsignedDraft) };
        const unsignedRecovery = {
          contractVersion: "1" as const,
          canonicalOperationId: instruction.canonicalOperationId,
          instructionDigest: instruction.instructionDigest,
          stage: conflict ? "canonical-committed-draft-pending" as const : "canonical-committed-terminal-integrity-failure" as const,
          draftResult: pendingDraft,
          productReceipt: null,
          retryable: conflict,
        };
        void error;
        return { ...unsignedRecovery, resultDigest: createCanonicalProductMaterializationRecoveryResultDigestV1(unsignedRecovery) };
      }
    }
    try {
      const product = await this.dependencies.productWorkflowOperations.materializeCanonicalProductInstruction({ instruction, draftResult });
      const unsignedRecovery = {
        contractVersion: "1" as const,
        canonicalOperationId: instruction.canonicalOperationId,
        instructionDigest: instruction.instructionDigest,
        stage: product.idempotent ? "canonical-replayed-product-materialized" as const : "canonical-committed-product-materialized" as const,
        draftResult,
        productReceipt: product.receipt,
        retryable: false,
      };
      return { ...unsignedRecovery, resultDigest: createCanonicalProductMaterializationRecoveryResultDigestV1(unsignedRecovery) };
    } catch (error) {
      const conflict = error instanceof Error && error.message === "Product Workflow store revision changed.";
      const unsignedRecovery = {
        contractVersion: "1" as const,
        canonicalOperationId: instruction.canonicalOperationId,
        instructionDigest: instruction.instructionDigest,
        stage: conflict ? "canonical-committed-draft-materialized-product-workflow-pending" as const : "canonical-committed-terminal-integrity-failure" as const,
        draftResult,
        productReceipt: null,
        retryable: conflict,
      };
      void error;
      return { ...unsignedRecovery, resultDigest: createCanonicalProductMaterializationRecoveryResultDigestV1(unsignedRecovery) };
    }
  }
}
