import {
  isValidatedLocalOnboardingTestEnvironment,
} from "../environment/discoveryEnvironment";

export const YOUR_ORGANIZATION_ALPHA_ACTIVATION_FLAG =
  "DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED";

export function isYourOrganizationAlphaActivationEnabled(
  environment?: Readonly<Record<string, string | undefined>>,
): boolean {
  return environment
    ? environment[YOUR_ORGANIZATION_ALPHA_ACTIVATION_FLAG] === "true"
    : process.env.DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED === "true";
}

export function isLocalOnboardingAlphaPresentationEnabled(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return isValidatedLocalOnboardingTestEnvironment(environment);
}

export function isYourOrganizationAlphaPresentationEnabled(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return (
    isYourOrganizationAlphaActivationEnabled(environment) ||
    isLocalOnboardingAlphaPresentationEnabled(environment)
  );
}
