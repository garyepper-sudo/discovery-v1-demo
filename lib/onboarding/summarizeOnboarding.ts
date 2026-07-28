import {
  organizationOnboardingStages,
  type OnboardingSummary,
  type OrganizationOnboardingReceipt,
} from "./types";

export function summarizeOnboarding(
  receipt: OrganizationOnboardingReceipt,
): OnboardingSummary {
  const completedStages = receipt.stages
    .filter(({ status }) => status === "Succeeded")
    .map(({ stage }) => stage);
  const completed = new Set(completedStages);
  return {
    organization: {
      id: receipt.organizationId,
      name: receipt.organizationName,
    },
    currentStage: receipt.currentStage,
    completedStages,
    remainingStages: organizationOnboardingStages.filter(
      (stage) => !completed.has(stage),
    ),
    health: {
      status: receipt.health.status,
      checks: { ...receipt.health.checks },
    },
    warnings: [...receipt.warnings],
    ready: receipt.lifecycleState === "Ready",
  };
}
