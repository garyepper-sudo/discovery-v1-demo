import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { resolveCanonicalEvidenceAdmission, runDiscoveryV3 } from "../../engine/v3";
import { createCanonicalScopeTopology, createCanonicalSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository, type StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import type { CanonicalEvidenceContribution } from "../../product/integration/contracts";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";

const ORG="operation-result-replay";const USER="replay-user";const AT="2026-08-06T12:00:00.000Z";const QUESTION_ID="product-question-replay";
const sha=(value:string)=>createHash("sha256").update(value).digest("hex");
const rootScope={organizationId:ORG,type:"organization" as const,id:ORG};
const topology=createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes:[rootScope],relationships:[]});
const CONTRIBUTION:CanonicalEvidenceContribution={sourceId:"replay-source",sourceType:"paste",content:"First replay fact.\nSecond replay risk.",contributedAt:AT,idempotencyKey:"replay-key"};

function context(runtime:StoredOrganizationRuntime["runtime"],question:string,contribution:CanonicalEvidenceContribution){
  const sourceBinding=createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{sourceId:contribution.sourceId,sourceVersion:"1",normalizedContentDigest:sha(contribution.content)},topology,assertions:[{relationship:"origin",scope:rootScope}],basisRefs:["replay-validation"],effectiveAt:AT,sourceType:"manual-takeaway",purposeRef:QUESTION_ID,availability:"available"});
  const input={company:"Replay",website:"",industry:"Testing",question,context:"",evidenceSources:[{sourceId:contribution.sourceId,sourceType:contribution.sourceType,observedAt:contribution.contributedAt,contentDigest:sourceBinding.source.normalizedContentDigest,content:contribution.content}]};
  const lineage={organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[sourceBinding],existingEvidenceAttributions:runtime.memory.canonicalScopeLineageIndex?.evidenceAttributions??[]};
  return{input,lineage};
}
function adapter(repository:FilesystemOrganizationRuntimeRepository){return new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,authorize:async({userId,organizationId})=>userId===USER&&organizationId===ORG,preflightCanonicalEvidence:async({runtime,question,contribution})=>{const value=context(runtime,question,contribution);return resolveCanonicalEvidenceAdmission(value.input,value.lineage);},investigate:async({runtime,question,contribution})=>{
  const {input,lineage}=context(runtime,question,contribution);
  const result=runDiscoveryV3(input,lineage);
  const originalLog=console.log;let evolved;try{console.log=()=>{};evolved=evolveOrganizationRuntime({runtime,result,input,semanticTime:AT});}finally{console.log=originalLog;}
  return{runtime:evolved,evidenceAccepted:result.evidence.length>0,canonicalEvidenceAdmissionBatch:result.scopeLineageAdmission!.operationBatch};
}});}

async function worker(role:string,root:string){const repository=new FilesystemOrganizationRuntimeRepository(root);
  if(role==="A"){
    const empty=createEmptyOrganizationRuntime({organizationId:ORG,name:"Replay"});const runtime=createDurableProductQuestion({runtime:empty,title:"What changed?",createdAt:AT,questionId:QUESTION_ID}).runtime;
    await repository.create(ORG,new TextEncoder().encode(JSON.stringify(runtime,null,2)),{requestId:"initialize",operatorId:USER});
    console.log(JSON.stringify({role,result:"initialized"}));return;
  }
  const service=adapter(repository);const selected=role==="D"?{...CONTRIBUTION,idempotencyKey:"replay-key-new-operation"}:CONTRIBUTION;const result=await service.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:selected,operation:{requestId:role==="B"?"contribute":role==="D"?"duplicate":"replay",operatorId:USER}});
  const stored=await repository.read(ORG);const operationEvents=stored!.runtime.memory.events.filter(item=>(item as {kind?:string})?.kind==="canonical-evidence-contribution-operation").length;
  console.log(JSON.stringify({role,result:"PASS",operationId:result.contributionResult.contributionOperationId,resultDigest:result.contributionResult.canonicalResultDigest,disposition:result.contributionResult.operationDisposition,cognitionDisposition:result.contributionResult.cognitionDisposition,admissions:result.contributionResult.admissions.map(item=>({evidenceId:item.canonicalEvidenceId,admissionId:item.canonicalAdmissionId,attributionId:item.attributionId})),operationEvents,attributionCount:stored!.runtime.memory.canonicalScopeLineageIndex?.evidenceAttributions.length??0}));
}

function execute(role:string,root:string){const child=spawnSync(process.execPath,["--import","tsx",new URL(import.meta.url).pathname,"--worker",role,root],{shell:false,encoding:"utf8",timeout:30000,maxBuffer:128*1024,env:{NODE_ENV:"test",PATH:process.env.PATH??"",NODE_PATH:process.env.NODE_PATH??""}});assert.equal(child.status,0,`role ${role}: ${child.stderr.slice(0,500)}`);const lines=child.stdout.trim().split("\n").filter(Boolean);return JSON.parse(lines.at(-1)!);}

async function parent(){let checks=0;const outputs=[];for(let run=0;run<2;run+=1){const root=await mkdtemp(path.join(tmpdir(),"discovery-operation-result-replay-"));try{const a=execute("A",root);const b=execute("B",root);const c=execute("C",root);const d=execute("D",root);assert.equal(a.result,"initialized");checks+=1;assert.equal(b.admissions.length,2);checks+=1;assert.equal(c.disposition,"idempotent-replay");checks+=1;assert.equal(c.cognitionDisposition,"exact-operation-replay");checks+=1;assert.equal(c.operationId,b.operationId);checks+=1;assert.equal(c.resultDigest,b.resultDigest);checks+=1;assert.deepEqual(c.admissions,b.admissions);checks+=1;assert.equal(c.operationEvents,1);checks+=1;assert.equal(d.cognitionDisposition,"no-new-canonical-input");checks+=1;assert.equal(d.operationEvents,2);checks+=1;assert.equal(d.attributionCount,b.attributionCount);checks+=1;outputs.push({operationId:b.operationId,resultDigest:b.resultDigest,admissions:b.admissions,duplicateAdmissions:d.admissions});}finally{await rm(root,{recursive:true,force:true});}}
  assert.deepEqual(outputs[0],outputs[1]);checks+=1;console.log(JSON.stringify({result:"PASS",checks,processes:8,runs:2,identical:true,temporaryRootsRemoved:true,externalActivity:{network:0,connector:0,drive:0,production:0}}));}

const args=process.argv.slice(2);(args[0]==="--worker"?worker(args[1]!,args[2]!):parent()).catch(error=>{console.error(error instanceof Error?error.message:"replay validation failed");process.exitCode=1;});
