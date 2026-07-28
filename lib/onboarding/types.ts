export const ORGANIZATION_ONBOARDING_VERSION = "discovery-onboarding/v1" as const;

export const organizationOnboardingStages = [
  "Created",
  "ConfigurationValidated",
  "RuntimeProvisioned",
  "GovernanceProvisioned",
  "UsersAssigned",
  "HealthVerified",
  "SmokeTestPassed",
  "Ready",
] as const;

export type OrganizationOnboardingStage =
  (typeof organizationOnboardingStages)[number];

export type OnboardingStageStatus =
  | "Pending"
  | "Running"
  | "Succeeded"
  | "Failed";

export type OnboardingLifecycleState =
  | OrganizationOnboardingStage
  | "Failed";

export type OnboardingFailure = {
  code: string;
  message: string;
  recoverable: boolean;
  operatorAction?: string;
};

export type OnboardingStageReceipt = {
  stage: OrganizationOnboardingStage;
  status: OnboardingStageStatus;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  explanation: string;
  validationResults: string[];
  warnings: string[];
  failure?: OnboardingFailure;
};

export type OnboardingRuntimeReceipt = {
  location: string;
  digest: string;
  revision: string;
  provisionedAt: string;
};

export type OnboardingUserReceipt = {
  consumerId: string;
  accessRecordId: string;
  assignedAt: string;
};

export type OrganizationOnboardingReceipt = {
  receiptVersion: typeof ORGANIZATION_ONBOARDING_VERSION;
  receiptId: string;
  requestFingerprint: string;
  organizationId: string;
  organizationName: string;
  requestedRuntimeDigest: string;
  requestedConsumerIds: string[];
  lifecycleState: OnboardingLifecycleState;
  currentStage: OrganizationOnboardingStage;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  stages: OnboardingStageReceipt[];
  runtime?: OnboardingRuntimeReceipt;
  assignedUsers: OnboardingUserReceipt[];
  health: {
    status: "Pending" | "Ready" | "Failed";
    checks: Record<string, boolean>;
  };
  smokeTest: {
    status: "Pending" | "Passed" | "Failed";
    checks: string[];
  };
  warnings: string[];
  retry: {
    allowed: boolean;
    fromStage?: OrganizationOnboardingStage;
    operatorAction?: string;
  };
};

export type OrganizationOnboardingRequest = {
  organizationId: string;
  organizationName: string;
  runtime: {
    bytes: Uint8Array;
    digest: string;
  };
  initialConsumerIds: string[];
  previousReceipt?: OrganizationOnboardingReceipt;
};

export type RuntimeInspection =
  | { status: "absent" }
  | {
      status: "present";
      location: string;
      digest: string;
      revision: string;
      provisionedAt: string;
    };

export type AccessInspection =
  | { status: "absent" }
  | {
      status: "active";
      accessRecordId: string;
      assignedAt: string;
    };

export type OrganizationOnboardingDependencies = {
  now(): string;
  observe?(receipt: OrganizationOnboardingReceipt): void | Promise<void>;
  validateConfiguration(input: {
    organizationId: string;
  }): Promise<{ checks: Record<string, boolean>; warnings?: string[] }>;
  inspectRuntime(input: {
    organizationId: string;
  }): Promise<RuntimeInspection>;
  provisionRuntime(input: {
    organizationId: string;
    runtimeBytes: Uint8Array;
    expectedDigest: string;
    idempotencyKey: string;
  }): Promise<Exclude<RuntimeInspection, { status: "absent" }>>;
  validateGovernance(input: {
    organizationId: string;
  }): Promise<{ checks: Record<string, boolean>; warnings?: string[] }>;
  inspectAccess(input: {
    organizationId: string;
    consumerId: string;
  }): Promise<AccessInspection>;
  assignAccess(input: {
    organizationId: string;
    consumerId: string;
    idempotencyKey: string;
  }): Promise<Exclude<AccessInspection, { status: "absent" }>>;
  verifyHealth(input: {
    organizationId: string;
  }): Promise<{ ready: boolean; checks: Record<string, boolean> }>;
  runSmokeTest(input: {
    organizationId: string;
    consumerIds: string[];
  }): Promise<{ passed: boolean; checks: string[]; warnings?: string[] }>;
};

export type OnboardingSummary = {
  organization: {
    id: string;
    name: string;
  };
  currentStage: OrganizationOnboardingStage;
  completedStages: OrganizationOnboardingStage[];
  remainingStages: OrganizationOnboardingStage[];
  health: OrganizationOnboardingReceipt["health"];
  warnings: string[];
  ready: boolean;
};
