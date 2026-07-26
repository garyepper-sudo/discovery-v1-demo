import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { requireDiscoveryDatabaseUrl } from "./config";
import * as schema from "./schema";

export function createDiscoveryApplicationDatabase() {
  return drizzle(neon(requireDiscoveryDatabaseUrl("application")), { schema });
}
