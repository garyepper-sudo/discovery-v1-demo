import assert from "node:assert/strict";
import path from "node:path";

const required = [
  "DISCOVERY_DATABASE_URL",
  "DISCOVERY_DATABASE_ADMIN_URL",
  "DISCOVERY_DATABASE_MIGRATION_URL",
  "DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY",
  "DISCOVERY_ALPHA_ORGANIZATION_ID",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

const missing = required.filter((name) => !process.env[name]?.trim());
assert.deepEqual(missing, [], `Missing deployment environment: ${missing.join(", ")}`);

for (const name of [
  "DISCOVERY_DATABASE_URL",
  "DISCOVERY_DATABASE_ADMIN_URL",
  "DISCOVERY_DATABASE_MIGRATION_URL",
] as const) {
  const value = process.env[name]!;
  const url = new URL(value);
  assert.match(url.protocol, /^postgres(ql)?:$/, `${name} must be PostgreSQL`);
  if (process.env.DISCOVERY_ALLOW_INSECURE_LOCAL_DATABASE !== "true") {
    assert.equal(
      url.searchParams.get("sslmode"),
      "require",
      `${name} must require TLS`,
    );
  }
}

assert.equal(
  path.isAbsolute(process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY!),
  true,
  "Runtime directory must be absolute",
);
assert.match(
  process.env.DISCOVERY_ALPHA_ORGANIZATION_ID!,
  /^[a-zA-Z0-9_-]+$/,
  "Organization id must be exact and filesystem-safe",
);
assert.match(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  /^pk_(test|live)_/,
  "Clerk publishable key has an invalid shape",
);
assert.match(
  process.env.CLERK_SECRET_KEY!,
  /^sk_(test|live)_/,
  "Clerk secret key has an invalid shape",
);
assert.equal(
  process.env.DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED,
  "true",
  "Bounded Alpha route must be explicitly enabled",
);

console.log(JSON.stringify({
  validation: "alpha-deployment-environment",
  result: "PASS",
  secretValuesPrinted: false,
  organizationId: process.env.DISCOVERY_ALPHA_ORGANIZATION_ID,
  runtimeDirectory: process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY,
}));
