export const GOOGLE_DRIVE_DEVELOPMENT_PORT = 3010;
export const GOOGLE_DRIVE_CALLBACK_PATH =
  "/api/development/google-drive/callback";
export const GOOGLE_DRIVE_AUTHORIZE_PATH =
  "/api/development/google-drive/authorize";
export const GOOGLE_DRIVE_DEVELOPMENT_ORIGIN =
  `http://localhost:${GOOGLE_DRIVE_DEVELOPMENT_PORT}`;
export const GOOGLE_DRIVE_EXPECTED_REDIRECT_URI =
  `${GOOGLE_DRIVE_DEVELOPMENT_ORIGIN}${GOOGLE_DRIVE_CALLBACK_PATH}`;

export const GOOGLE_DRIVE_ENVIRONMENT_KEYS = [
  "GOOGLE_DRIVE_CLIENT_ID",
  "GOOGLE_DRIVE_CLIENT_SECRET",
  "GOOGLE_DRIVE_REDIRECT_URI",
  "GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY",
  "GOOGLE_DRIVE_STATE_SIGNING_SECRET",
] as const;

export type GoogleDriveLiveConfiguration = {
  clientId: string;
  clientSecret: string;
  redirectUri: typeof GOOGLE_DRIVE_EXPECTED_REDIRECT_URI;
  credentialEncryptionKey: string;
  stateSigningSecret: string;
};

export type GoogleDriveLiveConfigurationStatus = {
  developmentEnvironmentValid: boolean;
  clientIdPresent: boolean;
  clientSecretPresent: boolean;
  redirectUriPresentAndExact: boolean;
  encryptionKeyValid: boolean;
  signingSecretValid: boolean;
  missingOrInvalid: string[];
};

function standardBase64Bytes(value: string): Buffer | null {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    return null;
  }
  try {
    const decoded = Buffer.from(value, "base64");
    return decoded.toString("base64") === value ? decoded : null;
  } catch {
    return null;
  }
}

export function inspectGoogleDriveLiveConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): GoogleDriveLiveConfigurationStatus {
  const encryptionBytes = environment.GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY
    ? standardBase64Bytes(environment.GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY)
    : null;
  const status = {
    developmentEnvironmentValid:
      environment.DISCOVERY_ENV === "development"
      && environment.NEXT_PUBLIC_DISCOVERY_ENV === "development"
      && environment.DISCOVERY_ONBOARDING_TEST_ENABLED === "true"
      && environment.NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED === "true",
    clientIdPresent: Boolean(environment.GOOGLE_DRIVE_CLIENT_ID),
    clientSecretPresent: Boolean(environment.GOOGLE_DRIVE_CLIENT_SECRET),
    redirectUriPresentAndExact:
      environment.GOOGLE_DRIVE_REDIRECT_URI === GOOGLE_DRIVE_EXPECTED_REDIRECT_URI,
    encryptionKeyValid: encryptionBytes?.length === 32,
    signingSecretValid:
      typeof environment.GOOGLE_DRIVE_STATE_SIGNING_SECRET === "string"
      && environment.GOOGLE_DRIVE_STATE_SIGNING_SECRET.length >= 32,
  };
  return {
    ...status,
    missingOrInvalid: [
      ...(!status.developmentEnvironmentValid ? ["validated development environment"] : []),
      ...(!status.clientIdPresent ? ["GOOGLE_DRIVE_CLIENT_ID"] : []),
      ...(!status.clientSecretPresent ? ["GOOGLE_DRIVE_CLIENT_SECRET"] : []),
      ...(!status.redirectUriPresentAndExact ? [
        `GOOGLE_DRIVE_REDIRECT_URI (must equal ${GOOGLE_DRIVE_EXPECTED_REDIRECT_URI})`,
      ] : []),
      ...(!status.encryptionKeyValid ? [
        "GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY (standard Base64 for exactly 32 bytes)",
      ] : []),
      ...(!status.signingSecretValid ? [
        "GOOGLE_DRIVE_STATE_SIGNING_SECRET (at least 32 characters)",
      ] : []),
    ],
  };
}

export function requireGoogleDriveLiveConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): GoogleDriveLiveConfiguration {
  const status = inspectGoogleDriveLiveConfiguration(environment);
  if (status.missingOrInvalid.length) {
    throw new Error(
      `Google Drive live configuration is incomplete: ${status.missingOrInvalid.join("; ")}.`,
    );
  }
  return {
    clientId: environment.GOOGLE_DRIVE_CLIENT_ID!,
    clientSecret: environment.GOOGLE_DRIVE_CLIENT_SECRET!,
    redirectUri: GOOGLE_DRIVE_EXPECTED_REDIRECT_URI,
    credentialEncryptionKey: environment.GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY!,
    stateSigningSecret: environment.GOOGLE_DRIVE_STATE_SIGNING_SECRET!,
  };
}
