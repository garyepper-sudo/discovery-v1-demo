import assert from "node:assert/strict";
import {addFounderGovernedContextAction,type FounderAddContextActionState} from "../../app/product-alpha/meetings/[seriesAddress]/actions";

const initial:FounderAddContextActionState={status:"idle",sourceCount:null,destination:null,message:null};
const globals=globalThis as typeof globalThis&{__founderAddContextParsed:string[][];__founderAddContextServices:number;__founderAddContextApplications:Array<{seriesAddress:string;input:{sources:Array<{name:string}>}}>};
const form=()=>{const data=new FormData();data.set("intent","add-governed-context");data.append("files",new File(["first source"],"first.txt"));data.append("sourcePurpose","Decision relevance");return data;};

async function main(){
 const prior=process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED="true";globals.__founderAddContextParsed=[];globals.__founderAddContextServices=0;globals.__founderAddContextApplications=[];
 try{const rendered=form();rendered.append("$ACTION_KEY","opaque-react-postback");const result=await addFounderGovernedContextAction("opaque-series",initial,rendered);assert.equal(result.status,"success");assert.deepEqual(globals.__founderAddContextParsed,[['intent','files','sourcePurpose']]);assert.equal(globals.__founderAddContextServices,1);assert.deepEqual(globals.__founderAddContextApplications,[{seriesAddress:"opaque-series",input:{sources:[{name:"validated-source"}]}}]);let checks=4;
  for(const field of ["unexpectedField","participantRef","organizationId","productQuestionId","occurrenceId","scopeId","expectedRevision","sourceDigest","capability","callback"]){const forged=form();forged.append(field,"forged");const rejected=await addFounderGovernedContextAction("opaque-series",initial,forged);assert.equal(rejected.message,"Unexpected add-context field.");assert.equal(globals.__founderAddContextServices,1);checks+=2;}
  const duplicate=form();duplicate.append("$ACTION_KEY","one");duplicate.append("$ACTION_KEY","two");const rejected=await addFounderGovernedContextAction("opaque-series",initial,duplicate);assert.equal(rejected.message,"Unexpected add-context field.");assert.equal(globals.__founderAddContextServices,1);checks+=2;console.log(`PASS Founder Add Context exported-action boundary checks=${checks} valid-service-calls=1 invalid-service-calls=0 transport=$ACTION_KEY`);
 }finally{if(prior===undefined)delete process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED;else process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED=prior;}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
