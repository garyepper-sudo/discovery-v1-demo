import "server-only";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { createExecutiveHistoryAccessRepository } from "../../engine/v3/governance/executiveHistoryAccessRepository";
import { createOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { PostgresBlobSourceContentRepository } from "../../engine/v3/sources/sourceContentRepository";
import { PostgresAlphaTelemetryRepository } from "../../lib/telemetry/alphaTelemetryRepository";
import { PostgresBlobProductArtifactBodyRepository } from "../persistence/productArtifactBodyRepository";
import { PostgresProductWorkflowArtifactRepository } from "../workflow/leadershipConversation/productWorkflowArtifactRepository";
import { PostgresSourceScopedFrontierAttemptLifecycleV1 } from "./sourceScopedExecutiveAnalysis";

const required=["DISCOVERY_CHIEF_COMPOSITION","DISCOVERY_RUNTIME_STORAGE_BACKEND","DISCOVERY_EXECUTIVE_HISTORY_ACCESS_STORAGE_BACKEND","DISCOVERY_CHIEF_BLOB_PREFIX","DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY","CLERK_SECRET_KEY","NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY","OPENAI_API_KEY","CRON_SECRET"] as const;

function hasPrivateBlobAuthentication(environment:NodeJS.ProcessEnv):boolean{
  return Boolean(environment.BLOB_READ_WRITE_TOKEN?.trim()||(environment.BLOB_STORE_ID?.trim()&&environment.VERCEL==="1"&&environment.VERCEL_ENV==="production"));
}

/** Single server-only selector for the production Chief durable owners. */
export function createProductionChiefInfrastructure(environment:NodeJS.ProcessEnv=process.env){
  const missing=required.filter(name=>!environment[name]?.trim());
  if(environment.NODE_ENV!=="production"||environment.DISCOVERY_CHIEF_COMPOSITION!=="production"||missing.length)throw new Error(`Chief production configuration unavailable: ${missing.join(",")||"composition"}`);
  if(environment.DISCOVERY_RUNTIME_STORAGE_BACKEND!=="vercel-blob"||environment.DISCOVERY_EXECUTIVE_HISTORY_ACCESS_STORAGE_BACKEND!=="vercel-blob")throw new Error("Chief production configuration unavailable: hosted Blob owners required");
  if(!hasPrivateBlobAuthentication(environment))throw new Error("Chief production configuration unavailable: private Blob authentication required");
  const sql=postgres(requireDiscoveryDatabaseUrl("application",environment),{max:1});
  return {sql,workflow:new PostgresProductWorkflowArtifactRepository(sql),sources:new PostgresBlobSourceContentRepository(sql,environment.DISCOVERY_CHIEF_BLOB_PREFIX),artifactBodies:new PostgresBlobProductArtifactBodyRepository(sql,environment.DISCOVERY_CHIEF_BLOB_PREFIX),analysisLifecycle:{begin:(input:Parameters<typeof PostgresSourceScopedFrontierAttemptLifecycleV1.begin>[1])=>PostgresSourceScopedFrontierAttemptLifecycleV1.begin(sql,input)},telemetry:new PostgresAlphaTelemetryRepository(sql),runtime:createOrganizationRuntimeRepository(environment),executiveHistory:createExecutiveHistoryAccessRepository(environment),close:()=>sql.end({timeout:1})};
}
