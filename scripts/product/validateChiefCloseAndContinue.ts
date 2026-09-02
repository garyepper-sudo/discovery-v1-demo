import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import path from "node:path";

const child=spawnSync(process.execPath,["--conditions=react-server","--import","tsx",path.join(process.cwd(),"scripts/product/validateReviewedCarryForward.ts")],{cwd:process.cwd(),encoding:"utf8",env:{...process.env,NODE_ENV:"test"}});
assert.equal(child.status,0,child.stderr);
const result=JSON.parse(child.stdout.trim().split("\n").at(-1)!) as Record<string,unknown>;
assert.equal(result.result,"PASS");
assert.equal(result.closureRecords,1);
assert.equal(result.whatChangedArtifacts,1);
assert.equal(result.prepareAgainLinks,1);
assert.equal(result.successorOccurrences,1);
assert.equal(result.providerRequests,0);
assert.equal(result.canonicalResultDuplicates,0);
assert.equal(result.forgedSuccessorAttempts,1);
assert.equal(result.forgedSuccessorGate2Writes,0);
assert.equal(result.forgedSuccessorProtectedDisclosures,0);
assert.equal(result.accidentalOccurrence3Records,0);
process.stdout.write(JSON.stringify({validation:"chief-close-and-continue-v1",result:"PASS",executableOwnerFlow:"reviewed-carry-forward→closure→what-changed→prepare-again→successor",checks:11,forgedSuccessorAttempts:1,forgedSuccessorGate2Writes:0,forgedSuccessorProtectedDisclosures:0,accidentalOccurrence3Records:0,providerRequests:0,duplicateClosureRecords:0,duplicateWhatChangedArtifacts:0,duplicatePrepareAgainArtifacts:0,duplicateSuccessorOccurrences:0,duplicateCanonicalResults:0}));
