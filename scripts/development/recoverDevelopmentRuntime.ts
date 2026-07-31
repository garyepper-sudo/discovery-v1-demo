import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import {
  createOrganizationRuntimeRepository,
} from "../../engine/v3/runtime";
import { getRuntimeOrganizationsDirectory } from "../../engine/v3/runtime/runtimeStorageLocation";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import {
  FileDevelopmentRuntimeRecoveryLineageRepository,
  isOnboardingTestOrganizationId,
  recoverDevelopmentOrganizationRuntime,
  type DevelopmentRuntimeRecoveryReason,
} from "../../lib/onboarding/testing";

type Arguments = {
  confirm: boolean;
  userId: string;
  organizationId: string;
  organizationName: string;
  industry: string | null;
  website: string | null;
  reason: DevelopmentRuntimeRecoveryReason;
  requestId: string;
  operatorIdentity: string;
};

function required(value: string | undefined, label: string): string {
  if (!value || value === "*" || value.trim() !== value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function parseArguments(argv: string[]): Arguments {
  const values = new Map<string, string>();
  let confirm = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--confirm") {
      confirm = true;
      continue;
    }
    if (!argument.startsWith("--")) throw new Error(`Unknown argument: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${argument} requires an exact value.`);
    }
    values.set(argument, value);
    index += 1;
  }
  const reason = (values.get("--reason") ?? "missing-ephemeral-runtime") as
    DevelopmentRuntimeRecoveryReason;
  return {
    confirm,
    userId: required(values.get("--user"), "--user"),
    organizationId: required(values.get("--organization"), "--organization"),
    organizationName: required(values.get("--name"), "--name"),
    industry: values.get("--industry") ?? null,
    website: values.get("--website") ?? null,
    reason,
    requestId: required(values.get("--request-id"), "--request-id"),
    operatorIdentity: required(values.get("--operator"), "--operator"),
  };
}

async function optionalFileDigest(filePath: string): Promise<string | null> {
  try {
    return createHash("sha256").update(await readFile(filePath)).digest("hex");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  const environment = validateOnboardingTestEnvironment();
  if (!isOnboardingTestOrganizationId(args.organizationId)) {
    throw new Error("--organization must be one exact onb-dev organization.");
  }
  const runtimeRepository = createOrganizationRuntimeRepository();
  if (runtimeRepository.backend !== "filesystem") {
    throw new Error("Development Runtime recovery requires filesystem storage.");
  }
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  const accessRepository = new PostgresAlphaAccessRecordRepository(sql);
  const connectorRoot = path.join(
    process.cwd(),
    ".discovery-runtime",
    "onboarding-google-drive",
  );
  const connectorFiles = [
    path.join(connectorRoot, "credentials.enc.json"),
    path.join(connectorRoot, "metadata.json"),
  ];
  try {
    const records = await accessRepository.findAccessRecords({
      consumerId: args.userId,
      organizationId: args.organizationId,
      experience: "organization",
      resolvedAt: new Date().toISOString(),
    });
    const runtime = await runtimeRepository.read(args.organizationId);
    const readiness = {
      developmentEnvironmentValid: environment.environment === "development",
      filesystemRuntime: runtimeRepository.backend === "filesystem",
      exactOrganization: args.organizationId,
      exactActiveAccess: records.filter((record) => record.status === "active").length === 1,
      runtimePresent: Boolean(runtime),
      mutationConfirmed: args.confirm,
    };
    if (!args.confirm) {
      console.log(JSON.stringify(readiness, null, 2));
      return;
    }
    const connectorBefore = await Promise.all(connectorFiles.map(optionalFileDigest));
    const receipt = await recoverDevelopmentOrganizationRuntime({
      request: {
        organizationId: args.organizationId,
        authorizedUserId: args.userId,
        organizationName: args.organizationName,
        industry: args.industry,
        website: args.website,
        reason: args.reason,
        requestId: args.requestId,
        operatorIdentity: args.operatorIdentity,
      },
      runtimeRepository,
      accessRepository,
      lineageRepository: new FileDevelopmentRuntimeRecoveryLineageRepository(),
    });
    const connectorAfter = await Promise.all(connectorFiles.map(optionalFileDigest));
    if (JSON.stringify(connectorBefore) !== JSON.stringify(connectorAfter)) {
      throw new Error("Development Runtime recovery changed Google connector state.");
    }
    const reloaded = await runtimeRepository.read(args.organizationId);
    console.log(JSON.stringify({
      ...receipt,
      runtimeValid: Boolean(
        reloaded
        && reloaded.runtime.metadata.organizationId === args.organizationId
        && reloaded.runtime.metadata.investigationCount === 0,
      ),
      runtimeDirectory: getRuntimeOrganizationsDirectory(),
      googleConnectionStatePreserved: true,
    }, null, 2));
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Development Runtime recovery failed.");
  process.exitCode = 1;
});
