import { mkdir, readFile, rename, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { costFromUsage, deriveEnvelope, type Receipt } from "../model-mediated-compounding-v1/controller";
import { sha256, stable } from "../model-mediated-compounding-v1/contracts";
import { assertPhysicalV11Separation, v11ArchiveLayout } from "./archive";
import { V11_PROVIDER_MANIFEST, V11_SCHEMA_DIGEST } from "./contracts";
import { parseV11 } from "./schema";

export type Outcome = "completed"|"provider-refused"|"provider-error"|"transport-failed"|"schema-parse-failed"|"model-drift-blocked";
export type V11ProviderResult={kind:"envelope";body:Buffer;receipt:Receipt}|{kind:"provider-error";body:Buffer;receipt:Receipt;errorClass:string};
export type V11Provider=(entry:Entry)=>Promise<V11ProviderResult>;
type Provider=V11Provider;
type ProviderResult=V11ProviderResult;
export type Entry = { ordinal:number; requestId:string; requestDigest:string; inputTokenEstimate:number; request:unknown };
export type Attempt = { attemptId:string; ordinal:number; requestId:string; requestDigest:string; state:"claimed"|Outcome; claimedAt:string; responseDigest?:string; responseBytes?:number; returnedModel?:string; providerStatus?:string; parsedDigest?:string; costMicros:number };
export type Gate = { schemaVersion:"model-mediated-v1.1-gate/v1"; stage:1|16|192|1920; archiveId:string; scheduleDigest:string; manifestDigest:string; classification:string; reviewer:string; issuedAt:string; digest:string };
export type Durable = { schemaVersion:"model-mediated-v1.1-ledger/v1"; archiveId:string; scheduleDigest:string; preregistrationDigest:string; v1AuthenticationDigest:string; v1AttemptCount:16; phase:"canary"|"technical"|"adequacy"|"full"|"sealed"; schedule:Array<Omit<Entry,"request">>; attempts:Attempt[]; gates:Gate[] };
const lock=(root:string)=>path.join(root,".v11-lock"), stateFile=(root:string)=>path.join(root,"execution-ledger.json");
async function acquire(root:string){for(let i=0;i<1000;i++){try{await mkdir(lock(root),{mode:0o700});return}catch{await new Promise(r=>setTimeout(r,4))}}throw new Error("V1.1 dispatch lock timeout")}
async function save(root:string,s:Durable){const f=stateFile(root),t=`${f}.${process.pid}.tmp`;await writeFile(t,JSON.stringify(s,null,2)+"\n",{mode:0o600});await rename(t,f)}
const scheduleDigest=(s:Array<Omit<Entry,"request">>)=>sha256(stable(s.map(x=>[x.ordinal,x.requestId,x.requestDigest,x.inputTokenEstimate])));
export function assertDurable(_s:Durable):Durable{throw new Error("obsolete 1,920-request V1.1 ledger permanently disabled; use pilotController")}
export async function initializeDurable(_restrictedRoot:string,_v1Archive:string,_archiveId:string,_preregistrationDigest:string,_v1AuthenticationDigest:string,_schedule:Entry[]):Promise<never>{throw new Error("obsolete 1,920-request V1.1 controller permanently disabled; use pilotController")}
export async function readDurable(root:string){return assertDurable(JSON.parse(await readFile(stateFile(root),"utf8")))}
async function claim(root:string,e:Entry){await acquire(root);try{const s=await readDurable(root),f=s.schedule[e.ordinal-1],{request:_,...identity}=e;if(!f||stable(f)!==stable(identity))throw new Error("schedule claim mismatch");if(s.attempts.some(a=>a.requestId===e.requestId))throw new Error("semantic retry prohibited");const limits={canary:1,technical:16,adequacy:192,full:1920,sealed:0};if(e.ordinal!==s.attempts.length+1||e.ordinal>limits[s.phase])throw new Error("phase claim blocked");const a:Attempt={attemptId:sha256(`model-mediated-v1.1-attempt\0${e.requestId}`),ordinal:e.ordinal,requestId:e.requestId,requestDigest:e.requestDigest,state:"claimed",claimedAt:new Date().toISOString(),costMicros:0};s.attempts.push(a);await save(root,s);return a}finally{await rmdir(lock(root))}}
async function finish(root:string,id:string,patch:Partial<Attempt>&{state:Outcome}){await acquire(root);try{const s=await readDurable(root),a=s.attempts.find(x=>x.attemptId===id);if(!a||a.state!=="claimed")throw new Error("attempt not claimed");Object.assign(a,patch);assertDurable(s);await save(root,s);return a}finally{await rmdir(lock(root))}}
async function artifact(root:string,id:string,name:string,value:Buffer|string){const d=path.join(root,"attempts",id);await mkdir(d,{recursive:true,mode:0o700});const f=path.join(d,name);await writeFile(f,value,{flag:"wx",mode:0o600});return path.relative(root,f)}
export async function dispatchV11(_root:string,_e:Entry,_provider:Provider):Promise<never>{throw new Error("obsolete 1,920-request V1.1 dispatch permanently disabled; use pilotController")}
export async function recordGate(_root:string,_stage:Gate["stage"],_classification:string,_reviewer:string,_manifestDigest:string):Promise<never>{throw new Error("obsolete adequacy/full gate permanently disabled; use pilotController")}
