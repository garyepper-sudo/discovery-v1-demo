import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { buildShadowProductWorkspace } from "../../product/workflow/buildShadowProductWorkspace";

function exactArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1]?.trim() : "";
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function main(): Promise<void> {
  const userId = exactArgument("--user");
  const organizationId = exactArgument("--organization");
  const questionIndex = process.argv.indexOf("--question");
  const question = questionIndex >= 0 ? process.argv[questionIndex + 1]?.trim() : undefined;
  if (!/^user_[a-zA-Z0-9]+$/.test(userId)) throw new Error("--user must be one exact Clerk user id.");
  if (!/^onb-dev-[a-f0-9]+$/.test(organizationId)) {
    throw new Error("--organization must be one exact onb-dev-* organization id.");
  }
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    const result = await buildShadowProductWorkspace({
      identity: {
        consumerId: userId,
        provider: "clerk",
        verificationId: "local-shadow-diagnostic",
        verifiedAt: new Date().toISOString(),
      },
      organizationId,
      ...(question ? { question } : {}),
      resolvedAt: new Date().toISOString(),
      accessRepository: new PostgresAlphaAccessRecordRepository(sql),
      runtimeRepository: new FilesystemOrganizationRuntimeRepository(),
    });
    console.log(JSON.stringify(result.workspace, null, 2));
    console.log("\n--- MARKDOWN ---\n");
    console.log(result.markdown);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
