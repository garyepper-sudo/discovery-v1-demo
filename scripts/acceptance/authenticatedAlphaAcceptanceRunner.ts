import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { ACCEPTANCE_FRAMEWORK_ID,ACCEPTANCE_FRAMEWORK_VERSION,assertAcceptanceMeasurementEnvelopeV1,type AcceptanceMeasurementEnvelopeV1,type PhaseCategory,type ProducerCategory } from "./authenticatedAlphaAcceptanceContracts";
export type ChildMeasurementRequest={frameworkId:typeof ACCEPTANCE_FRAMEWORK_ID;frameworkVersion:typeof ACCEPTANCE_FRAMEWORK_VERSION;profileId:string;profileVersion:string;sourceDigest:string;taskDigest:string;runDigest:string;producer:ProducerCategory;phase:PhaseCategory};
export type ChildProcessDiagnostic={outcome:"child_process_terminated_before_execution_phase"|"child_process_completed";spawn:"succeeded"|"failed";executionPhaseCount:number;measurementCount:number;exit:"zero"|"nonzero"|"unavailable";signal:"none"|"terminated"|"killed"|"other";protocol:"complete"|"incomplete"|"invalid"};
export function classifyAcceptanceChildProcess(input:{status:number|null;signal:string|null;errorCode?:string;stdout:string}):ChildProcessDiagnostic{
 const lines=input.stdout.split("\n").filter(Boolean);let executionPhaseCount=0,measurementCount=0,invalid=false;
 for(const line of lines)try{const value=JSON.parse(line);if(value?.kind==="execution-phase")executionPhaseCount++;else if(value?.kind==="browser-measurement")measurementCount++;else invalid=true;}catch{invalid=true;}
 const complete=!invalid&&executionPhaseCount===1&&measurementCount===1&&input.status===0;
 return{outcome:complete?"child_process_completed":"child_process_terminated_before_execution_phase",spawn:input.errorCode?"failed":"succeeded",executionPhaseCount,measurementCount,exit:input.status===0?"zero":typeof input.status==="number"?"nonzero":"unavailable",signal:input.signal===null?"none":input.signal==="SIGTERM"?"terminated":input.signal==="SIGKILL"?"killed":"other",protocol:invalid?"invalid":complete?"complete":"incomplete"};
}
const allowedScripts=new Set(["scripts/acceptance/ar3ReplayObservabilityMeasurementProducer.ts","scripts/acceptance/validateAr3CurrentBuildConformance.ts"]);
export async function runAcceptanceMeasurementChild(input:{script:string;mode:string;request:ChildMeasurementRequest;env?:Record<string,string|undefined>;timeoutMs?:number}){
 if(!allowedScripts.has(input.script)||!/^[a-z][a-z0-9-]{2,63}$/.test(input.mode))throw new Error("Acceptance producer invocation is invalid");
 return await new Promise<{measurement:AcceptanceMeasurementEnvelopeV1;stdout:string;stderr:string}>((resolveResult,reject)=>{
  const child=spawn(process.execPath,["--conditions=react-server","--import","tsx",resolve(input.script),input.mode],{cwd:process.cwd(),env:{...process.env,...input.env,AR2_PRE_001B_MEASUREMENT_REQUEST:Buffer.from(JSON.stringify(input.request)).toString("base64")},stdio:["ignore","pipe","pipe"]});
  let stdout="",stderr="",settled=false;const timer=setTimeout(()=>{if(child.exitCode===null)child.kill("SIGTERM");if(!settled){settled=true;reject(new Error("Acceptance producer timed out"));}},input.timeoutMs??180_000);
  child.stdout.on("data",value=>stdout+=String(value));child.stderr.on("data",value=>stderr+=String(value));child.once("error",error=>{clearTimeout(timer);if(!settled){settled=true;reject(error);}});
  child.once("exit",code=>{clearTimeout(timer);if(settled)return;settled=true;if(code!==0){const stage=stderr.match(/AR2_PRE001B_PRODUCER_FAILED:([a-z0-9-]+)/)?.[1]??"unavailable";return reject(new Error(`Acceptance producer failed:${stage}`));}try{const value=JSON.parse(stdout.trim().split("\n").filter(Boolean).at(-1)??"");assertAcceptanceMeasurementEnvelopeV1(value);const r=input.request;if(value.framework.id!==r.frameworkId||value.framework.version!==r.frameworkVersion||value.profile.id!==r.profileId||value.profile.version!==r.profileVersion||value.sourceDigest!==r.sourceDigest||value.taskDigest!==r.taskDigest||value.producerRunDigest!==r.runDigest||value.producer!==r.producer||value.phase!==r.phase)throw new Error();resolveResult({measurement:value,stdout,stderr});}catch{reject(new Error("Acceptance producer output is invalid"));}});
 });
}
