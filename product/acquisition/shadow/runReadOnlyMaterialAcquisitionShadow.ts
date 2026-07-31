import { createHash } from "node:crypto";

import type { OrganizationRuntimeRepository } from "../../../engine/v3/runtime/organizationRuntimeRepository";
import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../../lib/onboarding/testing";
import type { CanonicalProductWorkspaceAdapter } from "../../integration";
import { resolveProductObjectiveContext, type ProductObjectiveScope } from "../../objectives";
import { getProductUnknownHistory } from "../../unknowns";
import { selectMaterialInformationAcquisition } from "./selectMaterialInformationAcquisition";
import type { MaterialInformationAcquisitionInput, MaterialInformationAcquisitionResult } from "./contracts";

export type ReadOnlyMaterialAcquisitionShadowObservation = {
  classification: "live-read-only-shadow";
  organizationId: string;
  questionId: string;
  questionRevision: number;
  unknownId: string;
  unknownVersionRef: string;
  understandingRevisionRef: string;
  runtimeRevision: string;
  runtimeDigestBefore: string;
  runtimeDigestAfter: string;
  objectiveContextResolution: ReturnType<typeof resolveProductObjectiveContext> | null;
  selection: MaterialInformationAcquisitionResult;
  runtimeWrites: 0;
  externalActions: 0;
  connectorCalls: 0;
};

const digest = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

export async function runReadOnlyMaterialAcquisitionShadow(input: {
  environment?: Readonly<Record<string, string | undefined>>;
  userId: string;
  organizationId: string;
  questionId: string;
  unknownId: string;
  selectionInput: MaterialInformationAcquisitionInput;
  objectiveScope?: ProductObjectiveScope;
  adapter: Pick<CanonicalProductWorkspaceAdapter, "getQuestionWorkspace" | "listUnknowns">;
  runtimeRepository: Pick<OrganizationRuntimeRepository, "backend" | "read">;
}): Promise<ReadOnlyMaterialAcquisitionShadowObservation> {
  const configuration = validateOnboardingTestEnvironment(input.environment ?? process.env);
  if (configuration.environment !== "development" || configuration.runtimeStorage !== "filesystem"
    || input.runtimeRepository.backend !== "filesystem" || !isOnboardingTestOrganizationId(input.organizationId)) {
    throw new Error("Material acquisition shadow is limited to an isolated local onboarding Runtime.");
  }
  if (input.selectionInput.organizationId !== input.organizationId
    || input.selectionInput.questionId !== input.questionId
    || input.selectionInput.materialUncertainty.unknownId !== input.unknownId) {
    throw new Error("Material acquisition shadow input scope mismatch.");
  }

  // Both adapter reads authorize the exact principal and organization before protected Runtime retrieval.
  const workspaceRead = await input.adapter.getQuestionWorkspace({
    userId: input.userId,
    organizationId: input.organizationId,
    questionId: input.questionId,
  });
  const unknownRead = await input.adapter.listUnknowns({
    userId: input.userId,
    organizationId: input.organizationId,
    questionId: input.questionId,
    currentOnly: false,
  });
  const storedBefore = await input.runtimeRepository.read(input.organizationId);
  if (!storedBefore) throw new Error("Authorized shadow Runtime was not found.");
  const runtimeDigestBefore = digest(storedBefore.bytes);
  const unknown = unknownRead.unknowns.find((item) => item.unknownId === input.unknownId && item.current);
  if (!unknown || (unknown.status !== "open" && unknown.status !== "targeted")) {
    throw new Error("Material acquisition shadow requires one exact current actionable Unknown.");
  }
  const history = getProductUnknownHistory({ runtime: storedBefore.runtime, questionId: input.questionId, unknownId: unknown.unknownId });
  const currentUnknownVersion = history.at(-1)?.eventId;
  if (!currentUnknownVersion || currentUnknownVersion !== input.selectionInput.materialUncertainty.unknownVersionRef
    || unknown.status !== input.selectionInput.materialUncertainty.status) {
    throw new Error("Material acquisition shadow Unknown version is stale or mismatched.");
  }
  const understandingRevisionRef = `organization:${input.organizationId}:understanding:${storedBefore.runtime.metadata.investigationCount}`;
  if (understandingRevisionRef !== input.selectionInput.understandingRevisionRef) {
    throw new Error("Material acquisition shadow Understanding revision is stale or mismatched.");
  }
  const objectiveContextResolution = input.objectiveScope
    ? resolveProductObjectiveContext({
        runtime: storedBefore.runtime,
        scope: input.objectiveScope,
        evaluationAt: input.selectionInput.evaluatedAt,
      })
    : null;
  const selection = selectMaterialInformationAcquisition(input.selectionInput);
  const workspaceAfter = await input.adapter.getQuestionWorkspace({
    userId: input.userId,
    organizationId: input.organizationId,
    questionId: input.questionId,
  });
  if (JSON.stringify(workspaceRead.workspace) !== JSON.stringify(workspaceAfter.workspace)) {
    throw new Error("Read-only material acquisition shadow changed ProductQuestion output.");
  }
  const storedAfter = await input.runtimeRepository.read(input.organizationId);
  if (!storedAfter) throw new Error("Authorized shadow Runtime disappeared during observation.");
  const runtimeDigestAfter = digest(storedAfter.bytes);
  if (runtimeDigestBefore !== runtimeDigestAfter || storedBefore.revision !== storedAfter.revision) {
    throw new Error("Read-only material acquisition shadow changed Runtime bytes.");
  }
  return {
    classification: "live-read-only-shadow",
    organizationId: input.organizationId,
    questionId: input.questionId,
    questionRevision: workspaceRead.workspace.question.revision,
    unknownId: unknown.unknownId,
    unknownVersionRef: currentUnknownVersion,
    understandingRevisionRef,
    runtimeRevision: storedBefore.revision,
    runtimeDigestBefore,
    runtimeDigestAfter,
    objectiveContextResolution,
    selection,
    runtimeWrites: 0,
    externalActions: 0,
    connectorCalls: 0,
  };
}
