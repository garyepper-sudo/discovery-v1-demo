import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ALPHA_OBSERVABILITY_SCHEMA_VERSION,
  alphaBuildCategories,
  alphaEventCategories,
  alphaFailureCategories,
  alphaLatencyBuckets,
  alphaOccurrenceCategories,
  alphaProtectedLoadCategories,
  alphaReplayRecoveryCategories,
  alphaRoleCategories,
  alphaTransitionCategories,
  alphaViewportCategories,
  alphaWorkflowStages,
  alphaOutcomeCategories,
  assertAlphaContentSafeObservabilityEventV1,
  type AlphaContentSafeObservabilityEventV1,
} from "../../lib/observability/alphaContentSafeObservabilityContracts";
import { AlphaContentSafeObservabilityOwner, alphaObservationDefaults } from "../../lib/observability/alphaContentSafeObservabilityOwner";
import { scanText } from "../alpha-readiness/protectedValueScanner";

let checks=0; const check=(value:unknown,message:string)=>{assert.ok(value,message);checks+=1;};
const event=(overrides:Partial<AlphaContentSafeObservabilityEventV1>={}):AlphaContentSafeObservabilityEventV1=>({schemaVersion:ALPHA_OBSERVABILITY_SCHEMA_VERSION,eventCategory:"workflow-transition",workflowStage:"prepare",transitionCategory:"completed",outcomeCategory:"success",...alphaObservationDefaults,buildCategory:"test",sequence:1,correlation:"run-1",...overrides});
const rejects=(value:unknown)=>{assert.throws(()=>assertAlphaContentSafeObservabilityEventV1(value));checks+=1;};

export const requiredJourney=["activate","prepare","private-working","contribute","freeze","reload","capture","review","closure","what-changed","prepare-again","occurrence-2","acceptance","cleanup"] as const;
export function adjudicateAlphaObservabilityReadiness(input:{events:readonly AlphaContentSafeObservabilityEventV1[];malformed?:boolean;leaks?:number;cleanup?:boolean}){
  try{input.events.forEach(assertAlphaContentSafeObservabilityEventV1);}catch{return"BLOCKED";}
  const first=requiredJourney.map(stage=>input.events.findIndex(value=>value.workflowStage===stage)),sequence=input.events.map(value=>value.sequence),correlations=new Set(input.events.map(value=>value.correlation));
  const ordered=first.every((index,position)=>index>=0&&(position===0||index>first[position-1]!)),monotonic=sequence.every((value,index)=>index===0||value>sequence[index-1]!);
  const cleanup=input.events.at(-1);
  return !input.malformed&&!input.leaks&&input.cleanup===true&&ordered&&monotonic&&correlations.size===1&&cleanup?.workflowStage==="cleanup"&&cleanup.transitionCategory==="cleaned"&&cleanup.outcomeCategory==="success"?"PASS":"BLOCKED";
}

async function main(){
  const {createAlphaOperationalJsonOutputOwner,writeAlphaOperationalLog}=await import("../../lib/operations/alphaOperationalLog");
  for(const value of alphaEventCategories)assertAlphaContentSafeObservabilityEventV1(event({eventCategory:value}));
  for(const value of alphaWorkflowStages)assertAlphaContentSafeObservabilityEventV1(event({workflowStage:value}));
  for(const value of alphaTransitionCategories)assertAlphaContentSafeObservabilityEventV1(event({transitionCategory:value}));
  for(const value of alphaOutcomeCategories)assertAlphaContentSafeObservabilityEventV1(event({outcomeCategory:value}));
  for(const value of alphaRoleCategories)assertAlphaContentSafeObservabilityEventV1(event({roleCategory:value}));
  for(const value of alphaOccurrenceCategories)assertAlphaContentSafeObservabilityEventV1(event({occurrenceCategory:value}));
  for(const value of alphaViewportCategories)assertAlphaContentSafeObservabilityEventV1(event({viewportCategory:value}));
  for(const value of alphaLatencyBuckets)assertAlphaContentSafeObservabilityEventV1(event({latencyBucket:value}));
  for(const value of alphaReplayRecoveryCategories)assertAlphaContentSafeObservabilityEventV1(event({replayRecoveryCategory:value}));
  for(const value of alphaFailureCategories)assertAlphaContentSafeObservabilityEventV1(event({failureCategory:value}));
  for(const value of alphaBuildCategories)assertAlphaContentSafeObservabilityEventV1(event({buildCategory:value}));
  for(const value of alphaProtectedLoadCategories)assertAlphaContentSafeObservabilityEventV1(event({protectedLoadCategory:value}));
  checks+=alphaEventCategories.length+alphaWorkflowStages.length+alphaTransitionCategories.length+alphaOutcomeCategories.length+alphaRoleCategories.length+alphaOccurrenceCategories.length+alphaViewportCategories.length+alphaLatencyBuckets.length+alphaReplayRecoveryCategories.length+alphaFailureCategories.length+alphaBuildCategories.length+alphaProtectedLoadCategories.length;
  rejects({...event(),unknown:"value"}); rejects({...event(),outcomeCategory:{nested:"value"}}); rejects({...event(),outcomeCategory:"free form reason"});
  for(const bad of ["user_abc123","org_abc123","request_abc123","artifact_abc123","person@example.test","Bearer credential","session_token","https://example.test/path","/private/tmp/value","private working text","a".repeat(32)])rejects({...event(),outcomeCategory:bad});
  const canary="AR3-PROTECTED-CANARY"; for(const bad of [canary,canary.toLowerCase(),Buffer.from(canary).toString("base64"),canary.split("").join(" ")])rejects({...event(),outcomeCategory:bad});
  const emitted:AlphaContentSafeObservabilityEventV1[]=[]; const enabled=new AlphaContentSafeObservabilityOwner({emit:value=>{emitted.push(value);}}),disabled=new AlphaContentSafeObservabilityOwner(),throwing=new AlphaContentSafeObservabilityOwner({emit(){throw new Error("contained");}});
  const draft={eventCategory:"workflow-transition",workflowStage:"prepare",transitionCategory:"completed",outcomeCategory:"success",...alphaObservationDefaults} as const;
  assert.equal(await enabled.observe(draft),"emitted"); assert.equal(await disabled.observe(draft),"disabled"); assert.equal(await throwing.observe(draft),"sink-failed"); check(emitted.length===1,"enabled sink measured");
  const jsonLines:string[]=[];const jsonOwner=createAlphaOperationalJsonOutputOwner(line=>{jsonLines.push(line);});
  assert.equal(await writeAlphaOperationalLog(draft,jsonOwner),"emitted");assertAlphaContentSafeObservabilityEventV1(JSON.parse(jsonLines[0]!));check(jsonLines.length===1,"explicit legacy adapter emits one validated enum-only JSON line");
  assert.equal(await writeAlphaOperationalLog({...draft,organizationId:"org_forbidden"} as typeof draft,jsonOwner),"rejected");check(jsonLines.length===1,"legacy adapter rejects additional identifier fields");
  const neutralA=event({eventCategory:"access-check",outcomeCategory:"access-unavailable",roleCategory:"unavailable"}),neutralB=event({eventCategory:"access-check",outcomeCategory:"access-unavailable",roleCategory:"unavailable"}); assert.deepEqual(neutralA,neutralB);checks+=1;
  const journey=requiredJourney.map((stage,index)=>event({workflowStage:stage,sequence:index+1,correlation:"run-2",transitionCategory:stage==="cleanup"?"cleaned":"completed"}));
  check(adjudicateAlphaObservabilityReadiness({events:journey,cleanup:true})==="PASS","complete journey passes");
  for(const blocked of [{events:journey.slice(1),cleanup:true},{events:journey,cleanup:false},{events:journey,cleanup:true,malformed:true},{events:journey,cleanup:true,leaks:1},{events:[...journey].reverse(),cleanup:true},{events:journey.map((value,index)=>({...value,sequence:index?1:value.sequence})),cleanup:true}])check(adjudicateAlphaObservabilityReadiness(blocked)==="BLOCKED","incomplete evidence blocks");
  const sensitivity=scanText("sensitivity",canary,[{category:"protected-body",value:canary}]); const falsePositive=scanText("false-positive","closed categories only",[{category:"protected-body",value:canary}]); check(sensitivity.length===1&&falsePositive.length===0,"scanner controls");
  const [runtimeEvolution,runtimeRepository,health,operational,workflowRepository,serverComposition]=await Promise.all([readFile("engine/v3/runtime/evolveOrganizationRuntime.ts","utf8"),readFile("engine/v3/runtime/organizationRuntimeRepository.ts","utf8"),readFile("app/api/health/route.ts","utf8"),readFile("lib/operations/alphaOperationalLog.ts","utf8"),readFile("product/workflow/leadershipConversation/productWorkflowArtifactRepository.ts","utf8"),readFile("product/integration/leadershipConversationServerComposition.ts","utf8")]);
  check(!runtimeEvolution.includes("console.log"),"cognition direct output removed"); check(!runtimeRepository.includes("logStorageOperation"),"raw repository logging removed"); check(!health.includes("console.error"),"health error output bounded"); check(!operational.includes("organizationId")&&!operational.includes("requestId")&&!operational.includes("reason:"),"operational adapter is closed");
  check(workflowRepository.includes("publication.artifactId===value.artifactId&&publication.artifactRevision===value.artifactRevision")&&!workflowRepository.includes("publicationReceipts:(source.publicationReceipts??[]).filter(value=>records.has(value.artifactRevision))"),"occurrence receipt selection requires the exact artifact tuple and excludes a different artifact sharing revision 1");
  check(!serverComposition.includes("error.message")&&!serverComposition.includes("error.name")&&!serverComposition.includes("error.stack")&&!serverComposition.includes("/(?:unavailable"),"server observability does not classify exception text");
  console.log(JSON.stringify({validation:"alpha-content-safe-observability-001",result:"PASS",checks,schemaValues:checks,readinessNegativeControls:6,sinkParity:true,shapeNeutrality:true,scannerSensitivity:true,directOutputSafe:true}));
}
void main();
