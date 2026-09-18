import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { FounderBootstrapFailure } from "../../lib/alpha-provisioning/founderBootstrapDiagnostics";
import { bootstrapProductionDesignPartner } from "../../product/integration/productionDesignPartnerBootstrap";
import { createProductionChiefInfrastructure } from "../../product/integration/productionChiefInfrastructure";

const publishableKey=`pk_live_${Buffer.from("example.clerk.accounts$").toString("base64url")}`;
const base=():NodeJS.ProcessEnv=>({
  NODE_ENV:"production",
  DISCOVERY_CHIEF_COMPOSITION:"production",
  DISCOVERY_RUNTIME_STORAGE_BACKEND:"vercel-blob",
  DISCOVERY_EXECUTIVE_HISTORY_ACCESS_STORAGE_BACKEND:"vercel-blob",
  DISCOVERY_CHIEF_BLOB_PREFIX:"discovery/chief/v1",
  DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY:"x".repeat(32),
  CLERK_SECRET_KEY:"sk_live_test",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:publishableKey,
  OPENAI_API_KEY:"test",
  CRON_SECRET:"test",
  DISCOVERY_DATABASE_URL:"postgresql://user:password@example.test/application?sslmode=require",
  DISCOVERY_DATABASE_ADMIN_URL:"postgresql://user:password@example.test/administration?sslmode=require",
});
const input={contractVersion:"1" as const,clerkSubject:"user_test",organization:{creationKey:"bootstrap-test",displayName:"Bootstrap Test",provenance:"test"},operationId:"bootstrap-test",occurredAt:"2026-09-18T04:00:00.000Z",productQuestion:"Question?",meetingExternalKey:"meeting-test",meetingTitle:"Meeting",meetingPurpose:"Question?",cadenceLabel:"Weekly",role:"Founder",preparationScopeExternalKey:"scope-test",sources:[{externalKey:"source-test",mediaType:"text/plain" as const,bytes:new TextEncoder().encode("test")}]} ;

async function accepted(environment:NodeJS.ProcessEnv){
  const infrastructure=createProductionChiefInfrastructure(environment);
  assert.equal(infrastructure.runtime.backend,"vercel-blob");
  assert.equal(infrastructure.executiveHistory.backend,"vercel-blob");
  await infrastructure.close();
}

function rejected(environment:NodeJS.ProcessEnv){
  assert.throws(()=>createProductionChiefInfrastructure(environment),/private Blob authentication required/);
}

async function bootstrapFailure(environment:NodeJS.ProcessEnv,correlationId:string){
  const saved=process.env;
  try{
    process.env=environment;
    let failure:FounderBootstrapFailure|undefined;
    await assert.rejects(
      ()=>bootstrapProductionDesignPartner(input,{correlationId}),
      (error:unknown)=>{if(error instanceof FounderBootstrapFailure){failure=error;return true;}return false;},
    );
    return failure!;
  }finally{process.env=saved;}
}

async function main(){
  const staticToken={...base(),BLOB_READ_WRITE_TOKEN:"test-static-token"};
  await accepted(staticToken);
  const scoped={...base(),VERCEL:"1",VERCEL_ENV:"production",BLOB_STORE_ID:"store_test"};
  assert.equal("VERCEL_OIDC_TOKEN" in scoped,false);
  await accepted(scoped);
  rejected({...base(),VERCEL:"1",VERCEL_ENV:"production"});
  rejected({...base(),BLOB_STORE_ID:"store_test"});
  rejected({...base(),VERCEL:"1",VERCEL_ENV:"preview",BLOB_STORE_ID:"store_test"});
  rejected(base());
  assert.throws(()=>createProductionChiefInfrastructure({...scoped,CRON_SECRET:""}),/CRON_SECRET/);

  const construction=await bootstrapFailure(base(),"production-infrastructure-construction");
  assert.equal(construction.diagnostic.stage,"PRODUCTION_INFRASTRUCTURE");
  assert.equal(construction.diagnostic.infrastructureSubstage,"CHIEF_INFRASTRUCTURE_CONSTRUCTION");
  const missingAdministration:NodeJS.ProcessEnv={...scoped,DISCOVERY_DATABASE_ADMIN_URL:undefined};
  const administration=await bootstrapFailure(missingAdministration,"production-infrastructure-administration");
  assert.equal(administration.diagnostic.infrastructureSubstage,"ADMINISTRATION_DATABASE_CLIENT");
  const advisoryLock=await bootstrapFailure({...scoped,DISCOVERY_DATABASE_URL:"postgresql://user:password@127.0.0.1:1/application?connect_timeout=1"},"production-infrastructure-advisory-lock");
  assert.equal(advisoryLock.diagnostic.infrastructureSubstage,"OPERATION_ADVISORY_LOCK");
  const diagnostic=JSON.stringify(advisoryLock.diagnostic);
  assert.equal(diagnostic.includes("postgresql://"),false);
  assert.equal(diagnostic.includes("127.0.0.1"),false);
  assert.equal(diagnostic.includes("password"),false);
  const bootstrapSource=await readFile(path.join(process.cwd(),"product/integration/productionDesignPartnerBootstrap.ts"),"utf8");
  assert.ok(bootstrapSource.includes('await infrastructure.sql`SELECT pg_advisory_lock(hashtextextended(${operationLock}, 0))`;\n    lockAcquired=true;\n    stage="ORGANIZATION_IDENTITY"'),"successful bootstrap sequence remains unchanged after lock acquisition");
  const deploymentValidator=await readFile(path.join(process.cwd(),"scripts/deployment/validateAlphaEnvironment.ts"),"utf8");
  assert.ok(deploymentValidator.includes('process.env.BLOB_STORE_ID && process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production"'),"deployment and Chief predicates accept the same scoped Vercel Blob context");
  assert.equal(deploymentValidator.includes("process.env.VERCEL_OIDC_TOKEN"),false,"deployment predicate does not require an environment OIDC token");

  console.log("RESULT PASS production-chief-infrastructure static=accepted scoped-vercel-oidc=accepted local-store-only=closed infrastructureSubstages=chief,administration,advisory-lock");
}

void main();
