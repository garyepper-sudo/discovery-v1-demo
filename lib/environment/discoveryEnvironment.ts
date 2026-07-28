export type DiscoveryEnvironment = "development" | "staging" | "production";

export type DiscoveryEnvironmentSummary = {
  environment: DiscoveryEnvironment;
  onboardingTestEnabled: boolean;
  clerkInstance: "development" | "production";
  database: "localhost" | "isolated-remote" | "production-remote";
  runtimeStorage: "filesystem" | "vercel-blob";
  isolationId?: string;
};

const DATABASE_KEYS = [
  "DISCOVERY_DATABASE_URL",
  "DISCOVERY_DATABASE_ADMIN_URL",
  "DISCOVERY_DATABASE_MIGRATION_URL",
] as const;

function exactEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): DiscoveryEnvironment {
  const value = environment.DISCOVERY_ENV;
  if (value !== "development" && value !== "staging" && value !== "production") {
    throw new Error(
      "DISCOVERY_ENV must explicitly be development, staging, or production.",
    );
  }
  return value;
}

function databaseUrls(
  environment: Readonly<Record<string, string | undefined>>,
): URL[] {
  return DATABASE_KEYS.map((name) => {
    const value = environment[name];
    if (!value) throw new Error(`Missing non-production database configuration: ${name}`);
    const url = new URL(value);
    if (!/^postgres(ql)?:$/.test(url.protocol)) {
      throw new Error(`${name} must use PostgreSQL.`);
    }
    return url;
  });
}

function isLocalDatabase(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

function validateDevelopment(
  environment: Readonly<Record<string, string | undefined>>,
  urls: URL[],
): void {
  if (urls.some((url) => !isLocalDatabase(url))) {
    throw new Error(
      "Development onboarding requires localhost PostgreSQL; remote databases are refused.",
    );
  }
  if (environment.DISCOVERY_RUNTIME_STORAGE_BACKEND !== "filesystem") {
    throw new Error("Development onboarding requires filesystem Runtime storage.");
  }
  const directory = environment.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY;
  if (
    !directory ||
    !directory.startsWith("/") ||
    directory.split("/").includes("..") ||
    !directory.toLowerCase().includes("onboarding")
  ) {
    throw new Error(
      "Development Runtime directory must be absolute and visibly onboarding-isolated.",
    );
  }
}

function validateStaging(
  environment: Readonly<Record<string, string | undefined>>,
  urls: URL[],
): void {
  const isolationId = environment.DISCOVERY_NON_PRODUCTION_ISOLATION_ID;
  if (!isolationId || !/^[a-zA-Z0-9_-]{6,80}$/.test(isolationId)) {
    throw new Error("Staging requires DISCOVERY_NON_PRODUCTION_ISOLATION_ID.");
  }
  if (urls.some((url) => !url.hostname.includes(isolationId.toLowerCase()))) {
    throw new Error("Every staging database hostname must contain the isolation id.");
  }
  if (environment.DISCOVERY_RUNTIME_STORAGE_BACKEND !== "vercel-blob") {
    throw new Error("Staging onboarding requires isolated Vercel Blob storage.");
  }
  const prefix = environment.DISCOVERY_RUNTIME_BLOB_PREFIX ?? "";
  if (!prefix.toLowerCase().includes(isolationId.toLowerCase())) {
    throw new Error("Staging Runtime Blob prefix must contain the isolation id.");
  }
  if (!environment.BLOB_READ_WRITE_TOKEN && !environment.VERCEL_OIDC_TOKEN) {
    throw new Error("Staging Runtime Blob authentication is unavailable.");
  }
}

export function validateOnboardingTestEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): DiscoveryEnvironmentSummary {
  const discoveryEnvironment = exactEnvironment(environment);
  if (discoveryEnvironment === "production") {
    throw new Error("Onboarding test operations are forbidden in production.");
  }
  if (environment.NEXT_PUBLIC_DISCOVERY_ENV !== discoveryEnvironment) {
    throw new Error(
      "NEXT_PUBLIC_DISCOVERY_ENV must exactly match DISCOVERY_ENV.",
    );
  }
  if (environment.DISCOVERY_ONBOARDING_TEST_ENABLED !== "true") {
    throw new Error("DISCOVERY_ONBOARDING_TEST_ENABLED must be explicitly true.");
  }
  if (environment.NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED !== "true") {
    throw new Error(
      "NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED must be explicitly true.",
    );
  }
  if (
    !environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") ||
    !environment.CLERK_SECRET_KEY?.startsWith("sk_test_")
  ) {
    throw new Error("Onboarding testing requires a Clerk development instance.");
  }
  if (
    environment.DISCOVERY_ALPHA_ORGANIZATION_ID ===
      "atlas-manufacturing-simulation" ||
    environment.DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED === "true" ||
    environment.DISCOVERY_RUNTIME_PROVISIONING_ENABLED === "true" ||
    environment.DISCOVERY_ACCESS_PROVISIONING_ENABLED === "true"
  ) {
    throw new Error(
      "Atlas activation and production provisioning controls must remain disabled.",
    );
  }

  const urls = databaseUrls(environment);
  if (discoveryEnvironment === "development") {
    validateDevelopment(environment, urls);
  } else {
    validateStaging(environment, urls);
    throw new Error(
      "Staging onboarding remains disabled until isolated Blob lifecycle operations are implemented.",
    );
  }

  return {
    environment: discoveryEnvironment,
    onboardingTestEnabled: true,
    clerkInstance: "development",
    database: discoveryEnvironment === "development"
      ? "localhost"
      : "isolated-remote",
    runtimeStorage: environment.DISCOVERY_RUNTIME_STORAGE_BACKEND as
      | "filesystem"
      | "vercel-blob",
    ...(environment.DISCOVERY_NON_PRODUCTION_ISOLATION_ID
      ? { isolationId: environment.DISCOVERY_NON_PRODUCTION_ISOLATION_ID }
      : {}),
  };
}

export function onboardingTestEnvironmentEnabled(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  if (environment.DISCOVERY_ONBOARDING_TEST_ENABLED !== "true") return false;
  validateOnboardingTestEnvironment(environment);
  return true;
}
