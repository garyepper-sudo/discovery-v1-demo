import assert from "node:assert/strict";
import {mkdtemp,readFile,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {run} from "../compounding-capture-quality-v1/runBenchmark";
import {blockedSchedule,derivePackets} from "../model-mediated-compounding-v1/harness";
import {buildPilotSchedule,PILOT_AMENDMENT_DIGEST} from "./pilotDesign";
import {V11_OUTPUT_VERSION} from "./contracts";
import {AUTHORIZED_V1_ROOT} from "./v1Anchor";
import {approvePredispatch,dispatchPilot,initializePilot,readPilot,type Entry} from "./pilotController";import {testReviewArtifact} from "./testReviewArtifact";import {PREDISPATCH_ACCEPTANCE_CLASSIFICATION} from "./reviewArtifact";
async function main(){
 const source=await mkdtemp(path.join(os.tmpdir(),"mm-usage-source-")),restricted=await mkdtemp(path.join(os.tmpdir(),"mm-usage-archive-"));
 try{
  await run(source);const models=JSON.parse(await readFile(path.join(source,"model-packets.json"),"utf8")).packets,graders=JSON.parse(await readFile(path.join(source,"grader-packets.json"),"utf8")).packets,pilot=buildPilotSchedule(blockedSchedule(derivePackets(models,graders))),schedule=pilot.schedule as Entry[],root=path.join(restricted,"model-mediated-compounding-v1-1",pilot.archiveId);
  await initializePilot(restricted,AUTHORIZED_V1_ROOT,pilot.archiveId,pilot.ledgerId,PILOT_AMENDMENT_DIGEST,schedule);await approvePredispatch(root,await testReviewArtifact(root,"pre-dispatch-integrity",(await readPilot(root)).scheduleDigest,PREDISPATCH_ACCEPTANCE_CLASSIFICATION));
  const output={schemaVersion:V11_OUTPUT_VERSION,items:[],agenda:[],questions:[],followThrough:[]};
  await dispatchPilot(root,schedule[0],async()=>({kind:"envelope",body:Buffer.from(JSON.stringify({id:"usage-realistic",model:"gpt-5.6-sol",status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify(output)}]}],usage:{input_tokens:100,input_tokens_details:{cached_tokens:20,cache_write_tokens:10},output_tokens:30,output_tokens_details:{reasoning_tokens:7},total_tokens:130}})),receipt:{httpStatus:200,contentType:"application/json",providerRequestId:"usage-request",receivedAt:"fixture"}}));
  const a=(await readPilot(root)).attempts[0];assert.deepEqual({responseId:a.responseId,input:a.inputTokens,cached:a.cachedInputTokens,written:a.cacheWriteInputTokens,output:a.outputTokens,reasoning:a.reasoningTokens,total:a.totalTokens,cost:a.costMicros},{responseId:"usage-realistic",input:100,cached:20,written:10,output:30,reasoning:7,total:130,cost:938});
  console.log(JSON.stringify({validation:"model-mediated-v1.1-usage-partitions",result:"PASS",realProviderCalls:0,usagePartitions:"nonzero"}));
 }finally{await rm(source,{recursive:true,force:true});await rm(restricted,{recursive:true,force:true})}
}
main().catch(e=>{console.error(e);process.exitCode=1});
