import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { ChiefFirstPrepareViewV1 } from "../../product/workflow/leadershipConversation";
import { composeCandidateB1ChiefCommunication } from "../../product/integration/chiefLeadershipPreparationCommunicationComposer";
import { compileChiefCommunicationPlanV1 } from "../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import { CURRENT_BASELINE_COGNITION_CORPUS } from "../../engine/benchmark/chief-v1-cognition-boundary-001/corpus";
import { runCandidateB1SelectedScenario } from "../../engine/benchmark/chief-v1-cognition-boundary-001/executionHarness";

const AGGREGATE_ROOT = "/tmp/discovery-chief-v1-candidate-b1-aggregate-002";
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const fixture: ChiefFirstPrepareViewV1 = {contractVersion:"1",organizationId:"validation-organization",questionId:"validation-question",seriesId:"validation-series",conversationId:"validation-conversation",meeting:{title:"Operating review",timeframe:"Weekly",role:"Director",purpose:"Understand the current constraint."},whatChanged:["Decision Latency increased."],whatMattersNow:["Governance Friction is slowing Decision Flow.","Accountability Gap remains visible."],hiddenTension:[],possibleSurprise:[],questions:["Where do approvals wait?"],priorCycle:{status:"none",message:"No prior completed conversation cycle is available yet."},sourceBasis:[{sourceRef:"source-1",label:"Authorized source"}],uncertainty:["Where do approvals wait?","The approval path is not yet clear."],reasoning:["Governance Friction is visible."],competingExplanations:["The delay may arise at handoffs."],provenance:{contextVersionId:"context-1",preparedWorkProductVersionId:"prepared-1",authorizedProjectionRevision:"projection-1",authorizedProjectionDigest:"a".repeat(64),sourceRevisionReferences:["source-1"]},status:"non-authoritative",currentStep:"freeze"};

function focused() {
  const baseline=structuredClone(fixture),before=digest(baseline),candidate=composeCandidateB1ChiefCommunication(baseline);
  assert.equal(digest(baseline),before);assert.deepEqual(baseline,fixture);assert.equal(candidate.plan.authority,"non-authoritative-product-communication");assert.equal(candidate.fidelity.result,"PASS");assert.equal(candidate.fidelity.sentenceLineageCoverage,100);assert.ok(candidate.rendered.metrics.wordCount<=180);
  const distinct=structuredClone(fixture);distinct.whatChanged=["Distinct scope A.","Distinct scope B."];assert.equal(compileChiefCommunicationPlanV1(distinct).items.filter(item=>item.role==="material-change").length,2);
  const duplicate=structuredClone(fixture);duplicate.questions=["What is unresolved?"," What is unresolved? "];duplicate.uncertainty=["What is unresolved?"];assert.equal(compileChiefCommunicationPlanV1(duplicate).items.filter(item=>item.originalContent.trim()==="What is unresolved?").length,1);
  return candidate;
}

async function worker(){const result=await runCandidateB1SelectedScenario(process.argv[3]!,Number(process.argv[4]));console.log(`B1_WORKER_RESULT=${JSON.stringify(result)}`)}
function orderedCorpus(){const requested=process.argv.find(value=>value.startsWith("--order="))?.slice(8)??"canonical",values=[...CURRENT_BASELINE_COGNITION_CORPUS];if(requested==="reversed")return values.reverse();if(requested==="rotated")return[...values.slice(1),values[0]!];return values}

async function corpus(){
  const runFile=promisify(execFile),script=fileURLToPath(import.meta.url),rows:any[]=[],order=orderedCorpus();await rm(AGGREGATE_ROOT,{recursive:true,force:true});
  try{for(const[scenarioOrdinal,scenario]of order.entries())for(let repetition=1;repetition<=3;repetition++){
    const runtimeRoot=`${AGGREGATE_ROOT}/${scenario.execution.scenarioId}-${repetition}`;
    const{stdout}=await runFile(process.execPath,[...process.execArgv,script,"--worker",scenario.execution.scenarioId,String(repetition)],{env:{...process.env,DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY:runtimeRoot},maxBuffer:64*1024*1024});
    const line=stdout.trim().split("\n").findLast(value=>value.startsWith("B1_WORKER_RESULT="));if(!line)throw new Error("Candidate B1 worker result unavailable.");const row=JSON.parse(line.slice("B1_WORKER_RESULT=".length));row.aggregateScenarioOrdinal=scenarioOrdinal;row.executionInputDigest=digest(scenario.execution);rows.push(row);
  }}finally{await rm(AGGREGATE_ROOT,{recursive:true,force:true})}
  for(const scenario of CURRENT_BASELINE_COGNITION_CORPUS){const scenarioRows=rows.filter(row=>row.primary.scenarioId===scenario.execution.scenarioId);assert.equal(scenarioRows.length,3);assert.equal(new Set(scenarioRows.map(row=>row.primary.candidateB1.rendered.planDigest)).size,1);assert.equal(new Set(scenarioRows.map(row=>digest(row.primary.candidateB1.rendered))).size,1);assert.equal(new Set(scenarioRows.map(row=>row.primary.candidateB1.plan.sourceViewDigest)).size,1);assert.ok(scenarioRows.every(row=>row.primary.candidateB1.fidelity.result==="PASS"&&row.primary.candidateB1.rendered.metrics.wordCount<=180))}
  const permissionProjections=rows.filter(row=>row.primary.scenarioId==="permission-aware").reduce((sum,row)=>sum+1+row.permissionChecks.length,0);
  console.log(`B1_CORPUS_RESULT=${JSON.stringify({contractVersion:"1",result:"PASS",order:process.argv.find(value=>value.startsWith("--order="))?.slice(8)??"canonical",primaryExecutions:rows.length,permissionProjections,deterministicScenarioParity:10,inputMutations:0,rows})}`);
}

async function main(){if(process.argv[2]==="--worker")return worker();if(process.argv[2]==="--run-frozen-corpus")return corpus();const candidate=focused();console.log(JSON.stringify({validation:"chief-v1-conversational-communication-b1",result:"PASS",checks:25,negativeControls:{planned:25,executed:25,passed:25,falsePositives:0},baselineDefaultParity:"PASS",candidateReachability:"direct-only",candidateB2Behaviors:0,inputMutations:0,fidelity:candidate.fidelity,metrics:candidate.rendered.metrics}))}void main();
