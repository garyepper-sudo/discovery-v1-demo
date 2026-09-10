import assert from "node:assert/strict";
import { resumeAddGovernedContextReconciliationAction, type FounderAddContextRecoveryActionState } from "../../app/product-alpha/meetings/[seriesAddress]/actions";
import { createFounderAddContextReconciliationApplicationServiceFromRequest } from "../../lib/alpha-activation/founderFirstUnderstandingRequestComposition";

const initial:FounderAddContextRecoveryActionState={status:"idle",sourceCount:null,destination:null,message:null};
const globals=globalThis as typeof globalThis&{__reconciliationAddresses:string[];__reconciliationComposition:string[];__reconciliationIdentity:{status:string}};
async function main(){
 const prior=process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED,priorKey=process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY,priorPublishable=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED="true";process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY="a".repeat(32);process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_composition";globals.__reconciliationAddresses=[];globals.__reconciliationComposition=[];globals.__reconciliationIdentity={status:"verified"};
 try{
  const composed=await createFounderAddContextReconciliationApplicationServiceFromRequest();assert.deepEqual(globals.__reconciliationComposition,["clerk-request","instance","database-url","postgres","alpha-access","verify-v2","participant-access","access-administration","owner:participant-existing:consumer-existing"]);await composed.close();assert.equal(globals.__reconciliationComposition.at(-1),"owner-close");let checks=3;
  const valid=new FormData();for(const key of ["$ACTION_KEY","$ACTION_REF_generated:0"])valid.append(key,"transport-only");
  const result=await resumeAddGovernedContextReconciliationAction("opaque-series",initial,valid);assert.equal(result.status,"success");assert.deepEqual(globals.__reconciliationAddresses.slice(-2),["opaque-series:false","opaque-series:true"]);checks+=2;
  const afterValid=globals.__reconciliationComposition.length;for(const field of ["participantRef","organizationId","productQuestionId","occurrenceId","sourceIds","targetSourceSet","scopeId","preparedWorkId","expectedRevision","capability","callback","ACTION_FAKE","$ACTION","$action_fake","X$ACTION_FAKE"]){const forged=new FormData();forged.append(field,"forged");const rejected=await resumeAddGovernedContextReconciliationAction("opaque-series",initial,forged);assert.equal(rejected.message,"Unexpected context-refresh field.");assert.equal(globals.__reconciliationComposition.length,afterValid);checks+=2;}
  globals.__reconciliationIdentity={status:"unverified"};await assert.rejects(()=>createFounderAddContextReconciliationApplicationServiceFromRequest(),/participant identity/);checks++;
  console.log(`RESULT PASS authenticated-add-context-reconciliation-action checks=${checks} real-composition=Clerk-V2-access-owner forged-domain-inputs=0`);
 }finally{if(prior===undefined)delete process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;else process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED=prior;if(priorKey===undefined)delete process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY;else process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY=priorKey;if(priorPublishable===undefined)delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;else process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=priorPublishable;}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
