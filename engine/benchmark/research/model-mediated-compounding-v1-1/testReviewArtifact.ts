// Test-only constructor. This module is never imported by production dispatch code and
// its artifacts carry no authority outside temporary validation archives.
import {readPilot,reviewExpectation} from "./pilotController";
import {contentAddressReview,type ProceduralReviewArtifact,type ReviewGate} from "./reviewArtifact";
import os from "node:os";

export async function testReviewArtifact(root:string,gateName:ReviewGate,scheduleOrManifestDigest:string,terminalClassification:string,assignmentId=`test-${gateName}`):Promise<ProceduralReviewArtifact>{
  if(!root.startsWith(os.tmpdir()))throw new Error("test review artifacts require a temporary validation root");
  const state=await readPilot(root),expectation=reviewExpectation(state,gateName,assignmentId,scheduleOrManifestDigest,terminalClassification),instant=new Date().toISOString();
  return contentAddressReview({schemaVersion:"model-mediated-v1.1-procedural-review/v1",executionVersion:"model-mediated-compounding/v1.1",gateName,assignmentId,assignedAt:instant,frozenAt:instant,reviewerRole:"test-independent-reviewer",reviewerInvocationId:`test-invocation-${assignmentId}`,writerRole:"test-writer",providerControllerRole:"test-provider-controller",candidateDigest:expectation.candidateDigest,preregistrationDigest:expectation.preregistrationDigest,scheduleOrManifestDigest,reviewedStateDigest:expectation.currentReviewedStateDigest,requiredChecks:expectation.requiredChecks,commands:[{command:"test-only-independent-validation",exitCode:0,evidenceDigest:"a".repeat(64),observedResult:"PASS"}],materialFindings:[],terminalClassification,noMutationPerformed:true,completedAt:instant,orchestrationEvidence:{distinctInvocationRecord:`test-orchestration-log-${assignmentId}`,writerActive:false,providerControllerActive:false}})
}
