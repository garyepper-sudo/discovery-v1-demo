import "server-only";

import { join } from "node:path";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../db/governance/postgresRepositories";
import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import {
  GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
  isGoogleDriveDevelopmentOrganizationEligible,
  isGoogleDriveSandboxAcceptanceScope,
  type GoogleDriveDevelopmentPurpose,
} from "./developmentEligibility";
import { GoogleDriveApi } from "./googleApi";
import { requireGoogleDriveLiveConfiguration } from "./liveConfiguration";
import {
  EncryptedFileGoogleDriveCredentialRepository,
  FileGoogleDriveAuthorizationStateRepository,
  FileGoogleDriveMetadataRepository,
  type GoogleDriveMetadataRepository,
} from "./repositories";
import {
  GoogleDriveConnectorService,
  type GoogleDriveProductAdapter,
} from "./service";

const unavailableProductAdapter: GoogleDriveProductAdapter = {
  async getQuestionWorkspace() {
    throw new Error("Product workspace operations are unavailable at the OAuth boundary.");
  },
  async contributeEvidence() {
    throw new Error("Evidence operations are unavailable at the OAuth boundary.");
  },
  async recordSearch() {
    throw new Error("Search operations are unavailable at the OAuth boundary.");
  },
};

async function authorized(input: {
  userId: string;
  organizationId: string;
  purpose: GoogleDriveDevelopmentPurpose;
}): Promise<boolean> {
  if (!isGoogleDriveDevelopmentOrganizationEligible(input)) return false;
  if (isGoogleDriveSandboxAcceptanceScope(input)) return true;
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const repository = new PostgresAlphaAccessRecordRepository(sql);
    const records = await repository.findAccessRecords({
      consumerId: input.userId,
      organizationId: input.organizationId,
      experience: "organization",
      resolvedAt: new Date().toISOString(),
    });
    const now = Date.now();
    return records.some((record) =>
      record.status === "active"
      && (!record.validUntil || Date.parse(record.validUntil) > now)
    );
  } finally {
    await sql.end();
  }
}

export function createDevelopmentGoogleDriveOAuthService(
  productAdapter: GoogleDriveProductAdapter = unavailableProductAdapter,
  options: {
    purpose?: GoogleDriveDevelopmentPurpose;
    metadataRepository?: GoogleDriveMetadataRepository;
  } = {},
): GoogleDriveConnectorService {
  const environment = validateOnboardingTestEnvironment();
  if (environment.environment !== "development" || environment.runtimeStorage !== "filesystem") {
    throw new Error("Google Drive OAuth is available only in isolated local development.");
  }
  const configuration = requireGoogleDriveLiveConfiguration();
  const storageRoot = join(
    process.cwd(),
    ".discovery-runtime",
    "onboarding-google-drive",
  );
  return new GoogleDriveConnectorService({
    api: new GoogleDriveApi(configuration),
    credentials: new EncryptedFileGoogleDriveCredentialRepository(
      join(storageRoot, "credentials.enc.json"),
      configuration.credentialEncryptionKey,
    ),
    metadata: options.metadataRepository ?? new FileGoogleDriveMetadataRepository(
      join(storageRoot, "metadata.json"),
    ),
    authorizationStates: new FileGoogleDriveAuthorizationStateRepository(
      join(storageRoot, "oauth-states.json"),
    ),
    productAdapter,
    authorize: authorized,
    authorizationPurpose: options.purpose ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
    stateSigningSecret: configuration.stateSigningSecret,
    now: () => new Date().toISOString(),
  });
}
