export type DiscoveryDatabasePurpose =
  | "application"
  | "administration"
  | "migration";

const environmentByPurpose: Record<DiscoveryDatabasePurpose, string> = {
  application: "DISCOVERY_DATABASE_URL",
  administration: "DISCOVERY_DATABASE_ADMIN_URL",
  migration: "DISCOVERY_DATABASE_MIGRATION_URL",
};

export function requireDiscoveryDatabaseUrl(
  purpose: DiscoveryDatabasePurpose,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const name = environmentByPurpose[purpose];
  const value = environment[name];
  if (!value || value.trim() !== value || !/^postgres(ql)?:\/\//.test(value)) {
    throw new Error(`Discovery database configuration unavailable: ${name}`);
  }
  return value;
}
