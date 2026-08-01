import type { CanonicalProductWorkspaceAdapter } from "../integration";
import { buildFrontendReadyProductQuestionWorkspace, type ProductQuestionWorkspaceV2 } from "../workflow";

export type CanonicalFrontendWorkspaceReadResult = { workspace: ProductQuestionWorkspaceV2; runtimeRevision: string; authorizationChecks: 1; repositoryReads: 1; payloadBytes: number };

export async function readFrontendReadyProductQuestionWorkspace(input: { adapter: Pick<CanonicalProductWorkspaceAdapter, "getQuestionWorkspace">; userId: string; organizationId: string; questionId: string }): Promise<CanonicalFrontendWorkspaceReadResult> {
  const result = await input.adapter.getQuestionWorkspace(input);
  const workspace = buildFrontendReadyProductQuestionWorkspace({ workspace: result.workspace, unavailableFields: ["objective-context-resolution", "material-information-acquisition-selection", "operation-outcome"] });
  return { workspace, runtimeRevision: result.runtimeRevision, authorizationChecks: 1, repositoryReads: 1, payloadBytes: new TextEncoder().encode(JSON.stringify(workspace)).byteLength };
}
