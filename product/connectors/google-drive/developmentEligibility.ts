import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../../lib/onboarding/testing";
import { SANDBOX_ORGANIZATION_ID } from "../../simulations/living-organization-sandbox/manifest";

export const GOOGLE_DRIVE_DEVELOPMENT_PURPOSE = "development-connector";
export const GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE =
  "living-organization-sandbox-acceptance";

export type GoogleDriveDevelopmentPurpose =
  | typeof GOOGLE_DRIVE_DEVELOPMENT_PURPOSE
  | typeof GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE;

type GoogleDriveDevelopmentEligibilityInput = {
  organizationId: string;
  userId: string;
  purpose: GoogleDriveDevelopmentPurpose;
  environment?: Readonly<Record<string, string | undefined>>;
};

function isValidatedLocalDevelopment(
  environment: Readonly<Record<string, string | undefined>>,
): boolean {
  try {
    const validated = validateOnboardingTestEnvironment(environment);
    return validated.environment === "development"
      && validated.clerkInstance === "development";
  } catch {
    return false;
  }
}

function isKnownPurpose(value: string): value is GoogleDriveDevelopmentPurpose {
  return value === GOOGLE_DRIVE_DEVELOPMENT_PURPOSE
    || value === GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE;
}

export function isGoogleDriveSandboxAcceptanceScope(
  input: GoogleDriveDevelopmentEligibilityInput,
): boolean {
  const environment = input.environment ?? process.env;
  if (!isKnownPurpose(input.purpose)) return false;
  return isValidatedLocalDevelopment(environment)
    && input.organizationId === SANDBOX_ORGANIZATION_ID
    && input.purpose === GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE
    && environment.DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_ENABLED === "true"
    && environment.DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_USER_ID === input.userId;
}

export function isGoogleDriveDevelopmentOrganizationEligible(
  input: GoogleDriveDevelopmentEligibilityInput,
): boolean {
  const environment = input.environment ?? process.env;
  return isKnownPurpose(input.purpose)
    && isValidatedLocalDevelopment(environment)
    && (isOnboardingTestOrganizationId(input.organizationId)
      || isGoogleDriveSandboxAcceptanceScope(input));
}
