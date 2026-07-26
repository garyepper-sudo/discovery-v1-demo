import { defineConfig } from "drizzle-kit";

import { requireDiscoveryDatabaseUrl } from "./db/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: requireDiscoveryDatabaseUrl("migration"),
  },
  strict: true,
  verbose: true,
});
