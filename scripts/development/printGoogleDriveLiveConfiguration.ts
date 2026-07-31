import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  GOOGLE_DRIVE_AUTHORIZE_PATH,
  GOOGLE_DRIVE_CALLBACK_PATH,
  GOOGLE_DRIVE_DEVELOPMENT_ORIGIN,
  inspectGoogleDriveLiveConfiguration,
} from "../../product/connectors/google-drive/liveConfiguration";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";

const root = process.cwd();
const status = inspectGoogleDriveLiveConfiguration(process.env);
let developmentEnvironmentValid = false;
try {
  const environment = validateOnboardingTestEnvironment();
  developmentEnvironmentValid =
    environment.environment === "development"
    && environment.clerkInstance === "development"
    && environment.database === "localhost"
    && environment.runtimeStorage === "filesystem";
} catch {
  developmentEnvironmentValid = false;
}
const output = {
  developmentEnvironmentValid,
  clientIdPresent: status.clientIdPresent,
  clientSecretPresent: status.clientSecretPresent,
  redirectUriPresentAndExact: status.redirectUriPresentAndExact,
  encryptionKeyValid: status.encryptionKeyValid,
  signingSecretValid: status.signingSecretValid,
  callbackRouteRegistered: existsSync(join(root, "app", GOOGLE_DRIVE_CALLBACK_PATH, "route.ts")),
  authorizeRouteRegistered: existsSync(join(root, "app", GOOGLE_DRIVE_AUTHORIZE_PATH, "route.ts")),
  expectedAuthorizationUrl:
    `${GOOGLE_DRIVE_DEVELOPMENT_ORIGIN}${GOOGLE_DRIVE_AUTHORIZE_PATH}?organizationId=<required>`,
};

console.log(JSON.stringify(output, null, 2));
