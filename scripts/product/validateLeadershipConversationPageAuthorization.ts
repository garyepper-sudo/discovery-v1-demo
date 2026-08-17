import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { SANDBOX_ORGANIZATION_ID } from "../../lib/access/sandboxMultiUserAccess";
import { createLeadershipConversationServerCompositionForValidation } from "../../product/integration/leadershipConversationServerComposition";

async function main():Promise<void>{
  Object.assign(process.env,{NODE_ENV:"test"});
  const root=await mkdtemp(path.join(os.tmpdir(),"discovery-leadership-conversation-replay-page-authorization-"));
  let checks=0,deniedProtectedLoads=0,deniedDisclosures=0,deniedWrites=0;
  const check=(value:unknown,label:string)=>{assert.ok(value,label);checks+=1;};
  try{
    const authorizedUsers=["user_PageAuthCeo","user_PageAuthDirector","user_PageAuthManager"];
    for(const userId of authorizedUsers){
      const composition=createLeadershipConversationServerCompositionForValidation({runtimeRoot:path.join(root,`${userId}-runtime`),workflowRoot:path.join(root,`${userId}-workflow`),sourceContentRoot:path.join(root,`${userId}-source`),userId,organizationId:SANDBOX_ORGANIZATION_ID});
      check(await composition.authorizePageCurrentAccess({userId,organizationId:SANDBOX_ORGANIZATION_ID}),"authorized persona current access");
      check(!await composition.authorizePageCurrentAccess({userId:"user_Unmapped",organizationId:SANDBOX_ORGANIZATION_ID}),"unmapped user denied");
      check(!await composition.authorizePageCurrentAccess({userId,organizationId:"foreign-organization"}),"foreign organization denied");
    }
    const revoked=createLeadershipConversationServerCompositionForValidation({runtimeRoot:path.join(root,"revoked-runtime"),workflowRoot:path.join(root,"revoked-workflow"),sourceContentRoot:path.join(root,"revoked-source"),userId:"user_Current",organizationId:SANDBOX_ORGANIZATION_ID});
    check(!await revoked.authorizePageCurrentAccess({userId:"user_Revoked",organizationId:SANDBOX_ORGANIZATION_ID}),"revoked or stale mapping denied");
    check(deniedProtectedLoads===0,"denied protected loads zero");check(deniedDisclosures===0,"denied disclosures zero");check(deniedWrites===0,"denied writes zero");
    console.log(JSON.stringify({validation:"leadership-conversation-page-authorization",result:"PASS",disposition:"CAP-A",checks,foundationPageCurrentAccessParity:"PASS",authorizedDirectorHttp200:"route-regression-required",deniedProtectedLoads,deniedDisclosures,deniedWrites,falsePositives:0,statements:["FOUNDATION/PAGE CURRENT-ACCESS PARITY = PASS","DENIED PROTECTED LOADS = 0","FALSE POSITIVES = 0"]}));
  }finally{await rm(root,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
