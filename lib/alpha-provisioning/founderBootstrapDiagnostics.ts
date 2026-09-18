export const founderBootstrapStages = [
  "BOOTSTRAP_AUTH", "CLERK_SUBJECT_RESOLUTION", "PARTICIPANT_BINDING", "ORGANIZATION_IDENTITY",
  "ORGANIZATION_ACCESS", "MEETING_SERIES", "EXACT_SERIES_ACCESS", "PRODUCT_QUESTION",
  "PREPARATION_SCOPE", "GOVERNED_SOURCE_METADATA", "GOVERNED_SOURCE_BODY", "WORKFLOW_BOOTSTRAP",
  "PREPARED_WORK", "MEETING_PACK_PREREQUISITES", "FINALIZATION",
] as const;

export type FounderBootstrapStage = (typeof founderBootstrapStages)[number];
export type FounderBootstrapFailureDiagnostic = Readonly<{
  correlationId: string;
  stage: FounderBootstrapStage;
  operation?: "REGISTER" | "REVISE_AVAILABILITY" | "RESOLVE_CURRENT";
  errorCode: string;
  safeStatus: "FAILED_CLOSED";
  resourceClass: "identity" | "runtime" | "access" | "workflow" | "source-metadata" | "source-body" | "prepared-work" | "finalization";
  durableWriteState: "BEFORE_ANY_DURABLE_WRITE" | "AFTER_OR_DURING_DURABLE_WRITE";
  retrySafe: boolean;
  resolutionFallbackAllowed: boolean;
  durableWriteOccurred: boolean | "unknown";
}>;

const resourceClassFor = (stage: FounderBootstrapStage): FounderBootstrapFailureDiagnostic["resourceClass"] => {
  if (stage === "PARTICIPANT_BINDING" || stage === "ORGANIZATION_IDENTITY") return "identity";
  if (stage === "ORGANIZATION_ACCESS" || stage === "EXACT_SERIES_ACCESS") return "access";
  if (stage === "GOVERNED_SOURCE_METADATA") return "source-metadata";
  if (stage === "GOVERNED_SOURCE_BODY") return "source-body";
  if (stage === "PREPARED_WORK") return "prepared-work";
  if (stage === "FINALIZATION") return "finalization";
  if (stage === "PRODUCT_QUESTION" || stage === "MEETING_SERIES" || stage === "PREPARATION_SCOPE" || stage === "WORKFLOW_BOOTSTRAP" || stage === "MEETING_PACK_PREREQUISITES") return "workflow";
  return "runtime";
};

export class FounderBootstrapFailure extends Error {
  readonly diagnostic: FounderBootstrapFailureDiagnostic;

  constructor(input: Pick<FounderBootstrapFailureDiagnostic, "correlationId" | "stage" | "durableWriteState"> & Partial<Pick<FounderBootstrapFailureDiagnostic, "operation" | "errorCode" | "retrySafe" | "resolutionFallbackAllowed" | "durableWriteOccurred">>) {
    super("Founder bootstrap failed closed.");
    this.name = "FounderBootstrapFailure";
    this.diagnostic = {
      ...input,
      errorCode: input.errorCode ?? "BOOTSTRAP_STAGE_FAILED",
      safeStatus: "FAILED_CLOSED",
      resourceClass: resourceClassFor(input.stage),
      retrySafe: input.retrySafe ?? false,
      resolutionFallbackAllowed: input.resolutionFallbackAllowed ?? false,
      durableWriteOccurred: input.durableWriteOccurred ?? "unknown",
    };
  }
}

export function asFounderBootstrapFailure(error: unknown, input: Pick<FounderBootstrapFailureDiagnostic, "correlationId" | "stage" | "durableWriteState"> & Partial<Pick<FounderBootstrapFailureDiagnostic, "operation" | "errorCode" | "retrySafe" | "resolutionFallbackAllowed" | "durableWriteOccurred">>): FounderBootstrapFailure {
  return error instanceof FounderBootstrapFailure ? error : new FounderBootstrapFailure(input);
}
