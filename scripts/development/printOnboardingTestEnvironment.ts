import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";

try {
  const summary = validateOnboardingTestEnvironment();
  console.log("Discovery onboarding environment:");
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
