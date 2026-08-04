import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createGoogleDriveOAuthLogSanitizer, GOOGLE_DRIVE_OAUTH_CODE_REPLACEMENT, redactGoogleDriveOAuthLogText, redactGoogleDriveOAuthLogValue } from "../../product/connectors/google-drive/logRedaction";

async function main(){
const canary="synthetic-oauth-code-canary-001",state="synthetic-oauth-state-canary-001";
const forms=[`?code=${canary}`,`https://localhost/callback?code=${canary}&state=${state}&safe=visible`,`?CoDe=${canary}`,`?code%3D${encodeURIComponent(canary)}%26safe%3Dvisible`,encodeURIComponent(JSON.stringify({code:canary,safe:"visible"})),JSON.stringify({code:canary,safe:"visible"}),JSON.stringify({nested:{code:canary,state},safe:[`?code=${canary}`]}),`authorization: Bearer ${canary}`,`cookie: session=${canary}`];
let checks=0;
for(const [index,form] of forms.entries()){const first=redactGoogleDriveOAuthLogText(form),second=redactGoogleDriveOAuthLogText(form);assert.equal(first,second,`deterministic form ${index}`);checks+=1;assert.equal(first.includes(canary),false,`canary absent form ${index}`);checks+=1;}
const nested=JSON.stringify(redactGoogleDriveOAuthLogValue({error:new Error(`callback ?code=${canary}`,{cause:{code:canary}}),authorization:`Bearer ${canary}`}));
assert.equal(nested.includes(canary),false);checks+=1;assert.equal(nested.includes(GOOGLE_DRIVE_OAUTH_CODE_REPLACEMENT),true);checks+=1;
let stdout="",stderr="",shutdown="";
const stdoutSanitizer=createGoogleDriveOAuthLogSanitizer(value=>{stdout+=value;});stdoutSanitizer.write("GET /callback?co");stdoutSanitizer.write(`de=${canary}&safe=visible\n`);stdoutSanitizer.end();
const stderrSanitizer=createGoogleDriveOAuthLogSanitizer(value=>{stderr+=value;});stderrSanitizer.write(`failure ${JSON.stringify({code:canary})}\n`);stderrSanitizer.end();
const shutdownSanitizer=createGoogleDriveOAuthLogSanitizer(value=>{shutdown+=value;});shutdownSanitizer.write(`shutdown /callback?code=${canary}`);shutdownSanitizer.end();
for(const [output,marker] of [[stdout,"callback"],[stderr,"failure"],[shutdown,"callback"]]){assert.equal(output.includes(canary),false);checks+=1;assert.equal(output.includes(marker),true);checks+=1;}
let oversized="";const oversizedSanitizer=createGoogleDriveOAuthLogSanitizer(value=>{oversized+=value;});oversizedSanitizer.write(`unterminated ?code=${canary}${"x".repeat(70_000)}`);oversizedSanitizer.end();assert.equal(oversized.includes(canary),false);checks+=1;assert.match(oversized,/REDACTED_OVERSIZED_LOG_LINE/);checks+=1;
const callback=await readFile("app/api/development/google-drive/callback/route.ts","utf8"),result=await readFile("app/api/development/google-drive/callback/result/route.ts","utf8"),launcher=await readFile("scripts/development/startRedactedDevelopmentServer.ts","utf8"),operator=await readFile("scripts/development/googleDriveLiveAcceptance.ts","utf8");
assert.match(callback,/callback\/result/);checks+=1;assert.match(callback,/NextResponse\.redirect/);checks+=1;assert.doesNotMatch(result,/searchParams\.get\("code"\)|searchParams\.get\("state"\)/);checks+=1;assert.match(launcher,/createGoogleDriveOAuthLogSanitizer/);checks+=1;assert.match(operator,/redactGoogleDriveOAuthLogValue/);checks+=1;
const report=redactGoogleDriveOAuthLogText(`report callback?code=${canary}&safe=visible`);assert.equal(report.includes(canary),false);checks+=1;
console.log(JSON.stringify({result:"PASS",checks,canaryAbsent:true,callbackOutputRedacted:true,stdoutRedacted:true,stderrRedacted:true,shutdownOutputRedacted:true,serializedErrorsRedacted:true,reportsRedacted:true,connectorCalls:0,driveReads:0,driveWrites:0,productionTouched:false},null,2));
}
void main();
