import {
  assertCompatibleReceipt,
  createOnboardingReceipt,
  stageReceipt,
} from "./onboardingReceipt";
import {
  createOnboardingStageHandlers,
  OnboardingStageError,
} from "./onboardingStages";
import {
  organizationOnboardingStages,
  type OrganizationOnboardingDependencies,
  type OrganizationOnboardingReceipt,
  type OrganizationOnboardingRequest,
} from "./types";

function copyReceipt(
  receipt: OrganizationOnboardingReceipt,
): OrganizationOnboardingReceipt {
  return structuredClone(receipt);
}

async function observe(
  receipt: OrganizationOnboardingReceipt,
  dependencies: OrganizationOnboardingDependencies,
): Promise<void> {
  await dependencies.observe?.(copyReceipt(receipt));
}

export async function runOrganizationOnboarding(
  request: OrganizationOnboardingRequest,
  dependencies: OrganizationOnboardingDependencies,
): Promise<OrganizationOnboardingReceipt> {
  const now = dependencies.now();
  const receipt = request.previousReceipt
    ? copyReceipt(request.previousReceipt)
    : createOnboardingReceipt(request, now);
  if (request.previousReceipt) assertCompatibleReceipt(request, receipt);

  const handlers = createOnboardingStageHandlers({
    request,
    receipt,
    dependencies,
  });

  for (const stage of organizationOnboardingStages) {
    const stageState = stageReceipt(receipt, stage);
    if (stageState.status === "Succeeded") continue;

    const startedAt = dependencies.now();
    receipt.currentStage = stage;
    receipt.lifecycleState = stage;
    receipt.updatedAt = startedAt;
    receipt.retry = { allowed: true, fromStage: stage };
    stageState.status = "Running";
    stageState.startedAt = startedAt;
    stageState.completedAt = undefined;
    stageState.attempts += 1;
    stageState.explanation = "Stage is running.";
    stageState.validationResults = [];
    stageState.warnings = [];
    stageState.failure = undefined;

    try {
      await observe(receipt, dependencies);
      const result = await handlers[stage]();
      const completedAt = dependencies.now();
      stageState.status = "Succeeded";
      stageState.completedAt = completedAt;
      stageState.explanation = result.explanation;
      stageState.validationResults = [...result.validationResults];
      stageState.warnings = [...(result.warnings ?? [])];
      receipt.warnings = [
        ...new Set([...receipt.warnings, ...stageState.warnings]),
      ].sort((left, right) => left.localeCompare(right, "en"));
      receipt.updatedAt = completedAt;
      await observe(receipt, dependencies);
    } catch (error) {
      const failure = error instanceof OnboardingStageError
        ? error
        : new OnboardingStageError(
            "stage-operation-failed",
            error instanceof Error ? error.message : "Stage operation failed.",
            true,
            "Inspect the stage operation, then retry from this stage.",
          );
      const failedAt = dependencies.now();
      stageState.status = "Failed";
      stageState.completedAt = failedAt;
      stageState.explanation = failure.message;
      stageState.failure = {
        code: failure.code,
        message: failure.message,
        recoverable: failure.recoverable,
        ...(failure.operatorAction
          ? { operatorAction: failure.operatorAction }
          : {}),
      };
      receipt.lifecycleState = "Failed";
      receipt.updatedAt = failedAt;
      receipt.retry = {
        allowed: failure.recoverable,
        fromStage: stage,
        ...(failure.operatorAction
          ? { operatorAction: failure.operatorAction }
          : {}),
      };
      await observe(receipt, dependencies);
      return receipt;
    }
  }

  const completedAt = dependencies.now();
  receipt.lifecycleState = "Ready";
  receipt.currentStage = "Ready";
  receipt.completedAt = completedAt;
  receipt.updatedAt = completedAt;
  receipt.retry = { allowed: false };
  await observe(receipt, dependencies);
  return receipt;
}
