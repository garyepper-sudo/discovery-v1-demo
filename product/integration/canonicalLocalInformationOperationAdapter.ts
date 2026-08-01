import type { RuntimeStorageOperationMetadata } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { executeLocalInformationOperation, type ProductLocalInformationOperationRequest } from "../improvements";
import { CanonicalProductWorkspaceAdapter, type CanonicalProductWorkspaceAdapterDependencies } from "./canonicalProductWorkspaceAdapter";
import type { CanonicalLocalInformationOperationResult } from "./contracts";

export type CanonicalLocalInformationOperationAdapterDependencies = CanonicalProductWorkspaceAdapterDependencies & {
  authorizeLocalInformationOperation(input: { userId: string; organizationId: string; operation: "operation:execute-local" }): Promise<boolean>;
};

export class CanonicalLocalInformationOperationAdapter extends CanonicalProductWorkspaceAdapter {
  constructor(private readonly operationDependencies: CanonicalLocalInformationOperationAdapterDependencies) {
    super(operationDependencies);
  }

  async executeLocalInformationOperation(input: {
    userId: string;
    organizationId: string;
    request: ProductLocalInformationOperationRequest;
    expectedRuntimeRevision: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalLocalInformationOperationResult> {
    const generallyAuthorized = await this.operationDependencies.authorize(input);
    const operationAuthorized = await this.operationDependencies.authorizeLocalInformationOperation({ ...input, operation: "operation:execute-local" });
    if (!generallyAuthorized || !operationAuthorized) throw new Error("Product improvement operation access denied.");
    const stored = await this.operationDependencies.runtimeRepository.read(input.organizationId);
    if (!stored || stored.runtime.metadata.organizationId !== input.organizationId) throw new Error("Authorized Organization Runtime is missing or mismatched.");
    if (stored.revision !== input.expectedRuntimeRevision) throw new Error("Local information operation Runtime revision changed.");
    if (input.request.actorRef !== input.userId || input.request.organizationId !== input.organizationId) throw new Error("Local information operation request scope mismatch.");
    const executed = executeLocalInformationOperation({ runtime: stored.runtime, request: input.request });
    if (executed.runtime === stored.runtime) return { result: executed.result, idempotent: executed.idempotent, runtimeRevision: stored.revision };
    const persisted = await this.operationDependencies.runtimeRepository.replace(input.organizationId, new TextEncoder().encode(JSON.stringify(executed.runtime, null, 2)), stored.revision, input.operation);
    return { result: executed.result, idempotent: executed.idempotent, runtimeRevision: persisted.revision };
  }
}
