import assert from "node:assert/strict";

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

async function accepted(environment:NodeJS.ProcessEnv){
  const infrastructure=createProductionChiefInfrastructure(environment);
  assert.equal(infrastructure.runtime.backend,"vercel-blob");
  assert.equal(infrastructure.executiveHistory.backend,"vercel-blob");
  await infrastructure.close();
}

function rejected(environment:NodeJS.ProcessEnv){
  assert.throws(()=>createProductionChiefInfrastructure(environment),/private Blob authentication required/);
}

async function main(){
  const staticToken={...base(),BLOB_READ_WRITE_TOKEN:"test-static-token"};
  await accepted(staticToken);
  const oidc={...base(),VERCEL_OIDC_TOKEN:"test-oidc-token",BLOB_STORE_ID:"store_test"};
  await accepted(oidc);
  rejected({...base(),VERCEL_OIDC_TOKEN:"test-oidc-token"});
  rejected({...base(),BLOB_STORE_ID:"store_test"});
  rejected(base());
  assert.throws(()=>createProductionChiefInfrastructure({...oidc,CRON_SECRET:""}),/CRON_SECRET/);

  const saved=process.env;
  try{
    process.env=base();
    await assert.rejects(
      ()=>bootstrapProductionDesignPartner({contractVersion:"1",clerkSubject:"user_test",organization:{creationKey:"bootstrap-test",displayName:"Bootstrap Test",provenance:"test"},operationId:"bootstrap-test",occurredAt:"2026-09-18T04:00:00.000Z",productQuestion:"Question?",meetingExternalKey:"meeting-test",meetingTitle:"Meeting",meetingPurpose:"Question?",cadenceLabel:"Weekly",role:"Founder",preparationScopeExternalKey:"scope-test",sources:[{externalKey:"source-test",mediaType:"text/plain",bytes:new TextEncoder().encode("test")}]} ,{correlationId:"production-infrastructure-validation"}),
      (error:unknown)=>error instanceof FounderBootstrapFailure&&error.diagnostic.stage==="PRODUCTION_INFRASTRUCTURE",
    );
  }finally{process.env=saved;}

  console.log("RESULT PASS production-chief-infrastructure static=accepted oidc=accepted incompleteOidc=closed diagnosticStage=production-infrastructure");
}

void main();
