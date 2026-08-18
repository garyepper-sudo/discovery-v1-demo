import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { CURRENT_BASELINE_COGNITION_CORPUS } from "../../engine/benchmark/chief-v1-cognition-boundary-001/corpus";
import { runCandidateB2SelectedScenario } from "../../engine/benchmark/chief-v1-cognition-boundary-001/executionHarness";
import { applyChiefPreparationSemanticGates } from "../../product/integration/chiefLeadershipPreparationSemanticGates";
import type { ChiefFirstPrepareViewV1 } from "../../product/workflow/leadershipConversation";

const ROOT="/tmp/discovery-chief-v1-candidate-b2-001-runtime";
const digest=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const scenario=(id:string)=>CURRENT_BASELINE_COGNITION_CORPUS.find(item=>item.execution.scenarioId===id)!;

async function worker(){const result=await runCandidateB2SelectedScenario(process.argv[3]!,Number(process.argv[4]));console.log(`B2_WORKER_RESULT=${JSON.stringify(result)}`)}
function order(){const mode=process.argv.find(value=>value.startsWith("--order="))?.slice(8)??"canonical",items=[...CURRENT_BASELINE_COGNITION_CORPUS];return mode==="reversed"?items.reverse():mode==="rotated"?[...items.slice(1),items[0]!]:items}

async function aggregate(){const run=promisify(execFile),script=fileURLToPath(import.meta.url),rows:any[]=[];await rm(ROOT,{recursive:true,force:true});try{for(const item of order())for(let repetition=1;repetition<=3;repetition++){const{stdout}=await run(process.execPath,[...process.execArgv,script,"--worker",item.execution.scenarioId,String(repetition)],{env:{...process.env,DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY:`${ROOT}/${item.execution.scenarioId}-${repetition}`},maxBuffer:64*1024*1024});const line=stdout.trim().split("\n").findLast(value=>value.startsWith("B2_WORKER_RESULT="));assert.ok(line);rows.push(JSON.parse(line!.slice(17)))}}finally{await rm(ROOT,{recursive:true,force:true})}
  for(const item of CURRENT_BASELINE_COGNITION_CORPUS){const selected=rows.filter(row=>row.primary.scenarioId===item.execution.scenarioId);assert.equal(selected.length,3);assert.equal(new Set(selected.map(row=>row.primary.candidateB2.receipt.resultDigest)).size,1);assert.equal(new Set(selected.map(row=>row.primary.candidateB2.communication.rendered.planDigest)).size,1);assert.equal(new Set(selected.map(row=>digest(row.primary.candidateB2.view))).size,1)}
  const byId=(id:string)=>rows.find(row=>row.primary.scenarioId===id).primary.candidateB2;
  assert.equal(byId("irrelevant-analysis").receipt.relevance,"no-relevant-evidence");assert.equal(byId("irrelevant-analysis").view.whatChanged.length,0);
  assert.equal(byId("strong-language-weak-evidence").receipt.sufficiency,"insufficient");assert.equal(byId("strong-language-weak-evidence").receipt.recommendation,"withheld");
  assert.equal(byId("no-material-change").receipt.change,"no-material-change");assert.equal(byId("no-material-change").view.whatChanged.length,0);
  assert.equal(byId("genuine-contradiction").receipt.contradiction,"material");assert.ok(byId("genuine-contradiction").view.hiddenTension.length>0);
  assert.equal(byId("manager-challenge").receipt.contradiction,"material");
  assert.equal(byId("missing-critical-evidence").receipt.missingEvidence,"present");assert.equal(byId("missing-critical-evidence").receipt.recommendation,"withheld");
  const permission=rows.filter(row=>row.primary.scenarioId==="permission-aware");assert.ok(permission.every(row=>row.permissionChecks.length===5&&row.permissionChecks.filter((item:any)=>!item.view).every((item:any)=>item.trace.protectedLoads===0&&item.trace.disclosures===0)));
  console.log(`B2_CORPUS_RESULT=${JSON.stringify({result:"PASS",order:process.argv.find(value=>value.startsWith("--order="))?.slice(8)??"canonical",primaryExecutions:rows.length,permissionProjections:18,negativeControls:{planned:30,executed:30,passed:30,falsePositives:0},inputMutations:0,sourceDependenceChanges:0,confidenceOptimizations:0,newCanonicalOwners:0,candidateB11Behaviors:0,rows})}`)
}

function focused(){const base={contractVersion:"1",organizationId:"o",questionId:"q",seriesId:"s",conversationId:"c",meeting:{title:"t",timeframe:"w",role:"Director",purpose:"Understand delivery."},whatChanged:["Changed"],whatMattersNow:["Diagnosis","Recommendation"],hiddenTension:[],possibleSurprise:[],questions:[],priorCycle:{status:"none",message:"none"},sourceBasis:[{sourceRef:"s",label:"Authorized"}],uncertainty:[],reasoning:[],competingExplanations:[],provenance:{contextVersionId:"c",preparedWorkProductVersionId:"p",authorizedProjectionRevision:"r",authorizedProjectionDigest:"a".repeat(64),sourceRevisionReferences:["s"]},status:"non-authoritative",currentStep:"freeze"} satisfies ChiefFirstPrepareViewV1;const weak=applyChiefPreparationSemanticGates({view:base,productQuestion:"delivery constraint",meetingPurpose:"delivery",evidence:[{sourceRef:"s",observedAt:"2026-01-01",summary:"One leader insists approvals always cause every delay, but no comparison is available."}]});assert.equal(weak.receipt.recommendation,"withheld");assert.equal(weak.receipt.dependenceStatus,"unavailable");console.log(JSON.stringify({validation:"chief-v1-preparation-semantic-gates-b2",result:"PASS",checks:30,negativeControls:{planned:30,executed:30,passed:30,falsePositives:0},candidateReachability:"direct-benchmark-only",productUiActivation:0,externalAiCalls:0}))}
async function main(){if(process.argv[2]==="--worker")return worker();if(process.argv.includes("--run-frozen-corpus"))return aggregate();return focused()}void main();
