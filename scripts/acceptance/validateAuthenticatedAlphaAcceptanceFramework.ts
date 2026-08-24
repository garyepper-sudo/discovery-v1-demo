import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { scanText } from "../alpha-readiness/protectedValueScanner";
import { adjudicateAuthenticatedAlphaAcceptance } from "./authenticatedAlphaAcceptanceAdjudicator";
import { ACCEPTANCE_FRAMEWORK_ID, ACCEPTANCE_FRAMEWORK_VERSION, acceptanceDigest, assertAcceptanceMeasurementEnvelopeV1, assertAcceptanceProfileRequirementsV1, canonicalAcceptanceSerialize, createAcceptanceMeasurementEnvelopeV1, type AcceptanceMeasurementEnvelopeV1, type AcceptanceProfileRequirementsV1, type ObservationState, type PhaseCategory, type ProducerCategory } from "./authenticatedAlphaAcceptanceContracts";

const evidenceRoot="docs/agent-work-orders/evidence/alpha-readiness/ar2-pre-001a",jsonPath=path.join(evidenceRoot,"AR2_PRE_001A_MEASURED_ACCEPTANCE_FRAMEWORK_QUALIFICATION_RESULTS.json"),reportPath=path.join(evidenceRoot,"AR2_PRE_001A_MEASURED_ACCEPTANCE_FRAMEWORK_QUALIFICATION_REPORT.md");
const sourcePaths=["scripts/acceptance/authenticatedAlphaAcceptanceContracts.ts","scripts/acceptance/authenticatedAlphaAcceptanceAdjudicator.ts","scripts/acceptance/validateAuthenticatedAlphaAcceptanceFramework.ts","scripts/alpha-readiness/protectedValueScanner.ts","package.json"] as const;
const hash=(value:string|Buffer)=>createHash("sha256").update(value).digest("hex"),sourceIdentity=hash("qualified-source"),taskIdentity=hash("qualified-task"),framework={id:ACCEPTANCE_FRAMEWORK_ID,version:ACCEPTANCE_FRAMEWORK_VERSION},profileIdentity={id:"qualification-profile",version:"version-1"};
const protectedValues=[{category:"protected",value:"AR2PRE001A-PROTECTED-CANARY"},{category:"credential",value:"sk_test_ar2pre001a_forbidden"}] as const;
async function sourceDigest(){return hash((await Promise.all(sourcePaths.map(async file=>`${file}\0${hash(await readFile(file))}\n`))).join(""));}
const profile=():AcceptanceProfileRequirementsV1=>({schemaVersion:"1",kind:"acceptance-profile-requirements",framework,profile:profileIdentity,requiredMeasurements:[{producer:"browser",phase:"browser-journey",multiplicity:"exactly-one",factIds:["browser-reached"]},{producer:"scanner",phase:"surface-scan",multiplicity:"exactly-one",factIds:["scanner-clean"]},{producer:"independent-zero",phase:"zero-verification",multiplicity:"exactly-one",factIds:["external-zero"]}],orderingConstraints:[{beforeFactId:"browser-reached",afterFactId:"scanner-clean"},{beforeFactId:"scanner-clean",afterFactId:"external-zero"}],identityBindings:["framework","profile","source","task"]});
function measurement(producer:ProducerCategory,phase:PhaseCategory,sequence:number,facts:readonly [string,ObservationState][],overrides:Partial<{sourceDigest:string;taskDigest:string;profileId:string;measurementId:string;producerRunDigest:string}>={}):AcceptanceMeasurementEnvelopeV1{return createAcceptanceMeasurementEnvelopeV1({framework,profile:{id:overrides.profileId??profileIdentity.id,version:profileIdentity.version},producer,phase,sourceDigest:overrides.sourceDigest??sourceIdentity,taskDigest:overrides.taskDigest??taskIdentity,measurementId:overrides.measurementId??hash(`measurement:${producer}:${phase}:${sequence}`),producerRunDigest:overrides.producerRunDigest??hash(`run:${producer}`),sequence,observations:facts.map(([factId,state])=>({factId,state}))});}
const complete=(browserState:ObservationState="executed")=>[measurement("browser","browser-journey",1,[["browser-reached",browserState]]),measurement("scanner","surface-scan",2,[["scanner-clean","match"]]),measurement("independent-zero","zero-verification",3,[["external-zero","observed"]])];
const adjudicate=(measurements:readonly unknown[],inputProfile:unknown=profile(),source=sourceIdentity,task=taskIdentity)=>adjudicateAuthenticatedAlphaAcceptance({profile:inputProfile,measurements,sourceDigest:source,taskDigest:task});
const clone=<T>(value:T):T=>structuredClone(value);

type Case={id:string;status:"PASS"};
function qualificationCases(){const cases:Case[]=[];const check=(id:string,block:()=>void)=>{block();cases.push({id,status:"PASS"});},rejects=(id:string,block:()=>void)=>check(id,()=>assert.throws(block));
 check("valid-profile",()=>assertAcceptanceProfileRequirementsV1(profile()));
 rejects("unknown-profile-field",()=>assertAcceptanceProfileRequirementsV1({...profile(),unknown:"value"}));
 rejects("missing-profile-field",()=>{const value:any=profile();delete value.profile;assertAcceptanceProfileRequirementsV1(value);});
 rejects("profile-observed-facts",()=>assertAcceptanceProfileRequirementsV1({...profile(),observations:[]}));
 rejects("profile-overall-result",()=>assertAcceptanceProfileRequirementsV1({...profile(),result:"PASS"}));
 check("valid-measurement",()=>assertAcceptanceMeasurementEnvelopeV1(complete()[0]));
 rejects("unknown-measurement-field",()=>assertAcceptanceMeasurementEnvelopeV1({...complete()[0],unknown:"value"}));
 rejects("missing-measurement-field",()=>{const value:any=clone(complete()[0]);delete value.phase;assertAcceptanceMeasurementEnvelopeV1(value);});
 rejects("measurement-overall-result",()=>assertAcceptanceMeasurementEnvelopeV1({...complete()[0],result:"PASS"}));
 rejects("measurement-arbitrary-metadata",()=>assertAcceptanceMeasurementEnvelopeV1({...complete()[0],metadata:{}}));
 rejects("measurement-disallowed-fields",()=>assertAcceptanceMeasurementEnvelopeV1({...complete()[0],url:"https://invalid.test",selector:"button",script:"run",command:"execute",expectedOutcome:"PASS"}));
 check("wrong-framework-blocked",()=>{const value:any=clone(complete()[0]);value.framework={id:"foreign-framework",version:"v1"};value.measurementDigest=acceptanceDigest(Object.fromEntries(Object.entries(value).filter(([key])=>key!=="measurementDigest")));assert.equal(adjudicate([value,...complete().slice(1)]).result,"BLOCKED");});
 check("wrong-profile-blocked",()=>assert.equal(adjudicate([measurement("browser","browser-journey",1,[["browser-reached","executed"]],{profileId:"foreign-profile"}),...complete().slice(1)]).result,"BLOCKED"));
 check("wrong-producer-blocked",()=>assert.equal(adjudicate([measurement("lifecycle","browser-journey",1,[["browser-reached","executed"]]),...complete().slice(1)]).result,"BLOCKED"));
 check("wrong-phase-blocked",()=>assert.equal(adjudicate([measurement("browser","surface-scan",1,[["browser-reached","executed"]]),...complete().slice(1)]).result,"BLOCKED"));
 check("wrong-task-blocked",()=>assert.equal(adjudicate([measurement("browser","browser-journey",1,[["browser-reached","executed"]],{taskDigest:hash("foreign-task")}),...complete().slice(1)]).result,"BLOCKED"));
 check("stale-source-blocked",()=>assert.equal(adjudicate([measurement("browser","browser-journey",1,[["browser-reached","executed"]],{sourceDigest:hash("stale-source")}),...complete().slice(1)]).result,"BLOCKED"));
 check("wrong-digest-blocked",()=>{const value:any=clone(complete()[0]);value.measurementDigest="0".repeat(64);assert.equal(adjudicate([value,...complete().slice(1)]).result,"BLOCKED");});
 check("duplicate-producer-blocked",()=>assert.equal(adjudicate([...complete(),clone(complete()[0])]).result,"BLOCKED"));
 check("duplicate-fact-blocked",()=>{const value:any=clone(complete()[0]);value.observations.push(clone(value.observations[0]));value.measurementDigest=acceptanceDigest(Object.fromEntries(Object.entries(value).filter(([key])=>key!=="measurementDigest")));assert.equal(adjudicate([value,...complete().slice(1)]).result,"BLOCKED");});
 check("conflicting-measurements-blocked",()=>assert.equal(adjudicate([...complete(),measurement("browser","browser-journey",4,[["browser-reached","failed"]])]).result,"BLOCKED"));
 check("transformed-measurement-blocked",()=>{const value:any=clone(complete()[0]);value.observations[0].state="failed";assert.equal(adjudicate([value,...complete().slice(1)]).result,"BLOCKED");});
 check("profile-as-observation-blocked",()=>assert.equal(adjudicate([profile(),...complete().slice(1)]).result,"BLOCKED"));
 check("static-all-pass-blocked",()=>assert.equal(adjudicate([{...complete()[0],result:"PASS"},...complete().slice(1)]).result,"BLOCKED"));
 check("missing-browser-blocked",()=>assert.equal(adjudicate(complete().slice(1)).result,"BLOCKED"));
 check("missing-scanner-blocked",()=>assert.equal(adjudicate([complete()[0],complete()[2]]).result,"BLOCKED"));
 check("malformed-evidence-blocked",()=>assert.equal(adjudicate(["PASS",...complete().slice(1)]).result,"BLOCKED"));
 check("measured-failure-fails",()=>assert.equal(adjudicate(complete("failed")).result,"FAIL"));
 check("complete-inventory-passes",()=>assert.equal(adjudicate(complete()).result,"PASS"));
 check("failure-plus-blocker-blocked",()=>assert.equal(adjudicate([...complete("failed"),clone(complete("failed")[0])]).result,"BLOCKED"));
 check("profile-defaults-do-not-fill",()=>assert.equal(adjudicate(complete().slice(0,2)).result,"BLOCKED"));
 check("stdout-prose-blocked",()=>assert.equal(adjudicate([{stdout:"PASS",error:"everything passed"},...complete().slice(1)]).result,"BLOCKED"));
 check("deterministic-adjudication",()=>assert.deepEqual(adjudicate(complete()),adjudicate(complete())));
 check("source-change-stales",()=>assert.equal(adjudicate(complete(),profile(),hash("changed-source"),taskIdentity).result,"BLOCKED"));
 check("scanner-sensitivity",()=>assert.equal(scanText("sensitivity",protectedValues.map(value=>value.value).join("\n"),protectedValues).length,protectedValues.length));
 check("scanner-false-positive",()=>assert.deepEqual(scanText("false-positive","closed identities and measured categories only",protectedValues),[]));
 rejects("canonical-undefined-rejected",()=>canonicalAcceptanceSerialize({value:undefined}));
 rejects("canonical-nonfinite-rejected",()=>canonicalAcceptanceSerialize({value:Number.NaN}));
 rejects("canonical-function-rejected",()=>canonicalAcceptanceSerialize({value:()=>true}));
 rejects("canonical-class-instance-rejected",()=>canonicalAcceptanceSerialize(new Date(0)));
 rejects("canonical-machine-path-rejected",()=>canonicalAcceptanceSerialize({value:"/private/tmp/foreign"}));
 check("digest-covers-content",()=>assert.notEqual(acceptanceDigest({value:"observed"}),acceptanceDigest({value:"failed"})));
 check("ordering-conflict-blocked",()=>assert.equal(adjudicate([measurement("browser","browser-journey",3,[["browser-reached","executed"]]),measurement("scanner","surface-scan",2,[["scanner-clean","match"]]),measurement("independent-zero","zero-verification",1,[["external-zero","observed"]])]).result,"BLOCKED"));
 return cases;
}

type QualificationResult={schemaVersion:"1";framework:{id:string;version:string};sourceDigest:string;qualificationCases:{total:number;passed:number;failed:number;blocked:number;caseIds:readonly string[]};controls:{positiveControl:"PASS";staticPassResistance:"PASS";schemaClosure:"PASS";identityBinding:"PASS";deterministicRepeat:"PASS";scanner:"PASS";evidenceHygiene:"PASS"};result:"PASS";qualificationResultDigest:string};
function report(value:QualificationResult){return`# AR-2-PRE-001A Measured Acceptance Framework Qualification\n\n- Framework: **${value.framework.id} v${value.framework.version}**\n- Qualification: **${value.result}**\n- Cases: **${value.qualificationCases.passed}/${value.qualificationCases.total} PASS**\n- Static-PASS resistance: **${value.controls.staticPassResistance}**\n- Schema closure: **${value.controls.schemaClosure}**\n- Identity binding: **${value.controls.identityBinding}**\n- Deterministic repeat: **${value.controls.deterministicRepeat}**\n- Scanner and evidence hygiene: **${value.controls.scanner} / ${value.controls.evidenceHygiene}**\n- Source digest: \`${value.sourceDigest}\`\n- Qualification digest: \`${value.qualificationResultDigest}\`\n\nThis is framework qualification only. It is not current-build Product conformance and contains no browser, Clerk, Product, Runtime, authorization, cognition, persistence, AR-5A, or AR-5B result.\n`;}
async function measured():Promise<QualificationResult>{const first=qualificationCases(),second=qualificationCases();assert.deepEqual(first,second);const source=await sourceDigest(),base={schemaVersion:"1" as const,framework,sourceDigest:source,qualificationCases:{total:first.length,passed:first.length,failed:0,blocked:0,caseIds:first.map(value=>value.id)},controls:{positiveControl:"PASS" as const,staticPassResistance:"PASS" as const,schemaClosure:"PASS" as const,identityBinding:"PASS" as const,deterministicRepeat:"PASS" as const,scanner:"PASS" as const,evidenceHygiene:"PASS" as const},result:"PASS" as const},qualificationResultDigest=acceptanceDigest(base),value={...base,qualificationResultDigest};assert.deepEqual(scanText("qualification-json",JSON.stringify(value),protectedValues),[]);assert.deepEqual(scanText("qualification-report",report(value),protectedValues),[]);return value;}
async function verify(){const expected=await measured(),json=`${JSON.stringify(expected,null,2)}\n`,markdown=report(expected);assert.equal(await readFile(jsonPath,"utf8"),json);assert.equal(await readFile(reportPath,"utf8"),markdown);process.stdout.write(`${JSON.stringify({validation:"authenticated-alpha-acceptance-framework",mode:"verify",result:"PASS",frameworkVersion:ACCEPTANCE_FRAMEWORK_VERSION,cases:expected.qualificationCases.total,sourceDigest:expected.sourceDigest,qualificationResultDigest:expected.qualificationResultDigest})}\n`);}
async function write(){const value=await measured();await mkdir(evidenceRoot,{recursive:true});await writeFile(jsonPath,`${JSON.stringify(value,null,2)}\n`);await writeFile(reportPath,report(value));await verify();}
async function validate(){const value=await measured();process.stdout.write(`${JSON.stringify({validation:"authenticated-alpha-acceptance-framework",mode:"validate",result:"PASS",frameworkVersion:ACCEPTANCE_FRAMEWORK_VERSION,cases:value.qualificationCases.total,sourceDigest:value.sourceDigest,qualificationResultDigest:value.qualificationResultDigest})}\n`);}
void(process.argv.includes("--write")?write():process.argv.includes("--verify")?verify():validate());
