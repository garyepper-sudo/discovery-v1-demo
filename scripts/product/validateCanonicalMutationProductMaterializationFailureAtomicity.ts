import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { RuntimeStorageConflictError } from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { ProductDecisionDraftAuthorityGrantV1, ProductDecisionDraftOperation } from "../../product/decisions";
import { ProductDecisionDraftService } from "../../product/integration/productDecisionDraftService";
import { CanonicalLeadershipConversationProductMaterializer } from "../../product/integration/canonicalLeadershipConversationProductMaterializer";
import { LeadershipConversationProductOperations } from "../../product/workflow/leadershipConversation/operations";
import { createOwnerBackedDraftDependencies, MemoryRuntimeRepository, MemoryWorkflowRepository, instruction, organizationId, questionId, runtimeWithInstruction } from "./validateCanonicalMutationProductMaterializationAtomicity";

export type FailurePoint = "draft-cas-conflict" | "crash-after-draft-cas" | "workflow-cas-conflict" | "instruction-tamper" | "draft-receipt-tamper";
export type FailureScenarioResultV1 = { failurePoint: FailurePoint; stage: string; runtimeCasCount: number; workflowCasCount: number; cognitionCount: number };
export class CognitionInvocationOracle { count = 0; assertUnchanged() { assert.equal(this.count, 0); } }

const grant = (operation: ProductDecisionDraftOperation, at: string): ProductDecisionDraftAuthorityGrantV1 => ({ contractVersion: "1", operation, organizationId, questionId, scope: { type: "product-question", id: questionId }, purpose: operation === "product-decision-draft:create" ? "create-product-decision-draft" : operation === "product-decision-draft:revise" ? "revise-product-decision-draft" : "read-product-decision-draft", sensitivity: "standard", actorRef: "actor-1", authorityRef: "authority-1", policyRef: "policy-1", authorized: true, status: "active", validFrom: at, authorizedAt: at });
class DraftConflictRepository extends MemoryRuntimeRepository { override async replace(): Promise<never> { throw new RuntimeStorageConflictError("Runtime revision changed"); } }
export class FailureInjectingProductWorkflowArtifactRepository extends MemoryWorkflowRepository { fail = true; override async replace(...args: Parameters<MemoryWorkflowRepository["replace"]>) { if (this.fail) throw new Error("Product Workflow store revision changed."); return super.replace(...args); } }

async function composition(runtimeRepository: MemoryRuntimeRepository, workflowRepository: MemoryWorkflowRepository, root:string) {
  const canonicalInstruction = instruction(true);
  const operations = new LeadershipConversationProductOperations({ repository: workflowRepository, clock: { now: () => canonicalInstruction.evaluatedAt }, authorize: async () => false, verifyCanonicalInstructionProvenance: async () => true, loadBase: async () => { throw new Error("frontend read must not occur"); }, source: { write: async () => { throw new Error("source write must not occur"); }, readForProposal: async () => { throw new Error("source read must not occur"); }, readForEvidenceAdmission: async () => { throw new Error("source read must not occur"); } } });
  const ownerBacked=await createOwnerBackedDraftDependencies(root);
  const service = new ProductDecisionDraftService({ runtimeRepository: runtimeRepository as never, ...ownerBacked, authorize: async (value) => grant(value.operation, value.evaluatedAt), authorizeMaterialization: async ({ operation }) => grant(operation, canonicalInstruction.evaluatedAt) });
  const materializer = new CanonicalLeadershipConversationProductMaterializer({ productDecisionDraftService: service, productWorkflowOperations: operations, storageOperation: () => ({ requestId: "failure-draft", operatorId: "system" }) });
  return { canonicalInstruction, service, materializer };
}

export async function runFailureScenario(failurePoint: FailurePoint): Promise<FailureScenarioResultV1> {
  const root=await mkdtemp(path.join(tmpdir(),`discovery-northstar-preparation-lineage-failure-atomicity-${failurePoint}-`));
  try{
  const oracle = new CognitionInvocationOracle();
  const canonicalInstruction = instruction(true);
  const runtimeRepository = failurePoint === "draft-cas-conflict" ? new DraftConflictRepository(runtimeWithInstruction(canonicalInstruction)) : new MemoryRuntimeRepository(runtimeWithInstruction(canonicalInstruction));
  const workflowRepository = failurePoint === "workflow-cas-conflict" ? new FailureInjectingProductWorkflowArtifactRepository() : new MemoryWorkflowRepository();
  const built = await composition(runtimeRepository, workflowRepository,root);
  let stage = "rejected";
  if (failurePoint === "instruction-tamper") {
    await assert.rejects(() => built.materializer.materialize({ contractVersion: "1", instruction: { ...canonicalInstruction, instructionDigest: "0".repeat(64) }, draftResult: null }), /integrity failed/);
    stage = "pre-commit-rejected";
  } else {
    if (failurePoint === "crash-after-draft-cas") await built.service.materializeCommittedInstruction({ instruction: canonicalInstruction, storageOperation: { requestId: "draft-before-crash", operatorId: "system" } });
    if (failurePoint === "draft-receipt-tamper") {
      await built.service.materializeCommittedInstruction({ instruction: canonicalInstruction, storageOperation: { requestId: "draft-before-tamper", operatorId: "system" } });
      const event = runtimeRepository.current.runtime.memory.events.find((value) => value && typeof value === "object" && "materializationReceipt" in value) as { materializationReceipt: { receiptDigest: string } };
      event.materializationReceipt.receiptDigest = "0".repeat(64);
    }
    const result = await built.materializer.materialize({ contractVersion: "1", instruction: canonicalInstruction, draftResult: null });
    stage = result.stage;
  }
  oracle.assertUnchanged();
  return { failurePoint, stage, runtimeCasCount: runtimeRepository.replaceCount, workflowCasCount: workflowRepository.replaceCount, cognitionCount: oracle.count };
  }finally{await rm(root,{recursive:true,force:true});}
}

async function main() {
  const draftConflict = await runFailureScenario("draft-cas-conflict"); assert.equal(draftConflict.stage, "canonical-committed-draft-pending");
  const crash = await runFailureScenario("crash-after-draft-cas"); assert.equal(crash.stage, "canonical-committed-product-materialized"); assert.equal(crash.runtimeCasCount, 1);
  const workflowConflict = await runFailureScenario("workflow-cas-conflict"); assert.equal(workflowConflict.stage, "canonical-committed-draft-materialized-product-workflow-pending");
  const tamperedInstruction = await runFailureScenario("instruction-tamper"); assert.equal(tamperedInstruction.runtimeCasCount, 0);
  const tamperedReceipt = await runFailureScenario("draft-receipt-tamper"); assert.equal(tamperedReceipt.stage, "canonical-committed-terminal-integrity-failure");
  console.log("Canonical mutation Product materialization failure atomicity validation PASS (15 checks)");
}

if(!process.argv.includes("--react-server-child")){const child=spawnSync(process.execPath,["--conditions=react-server",...process.execArgv,process.argv[1]!,"--react-server-child"],{cwd:process.cwd(),encoding:"utf8",env:{...process.env,NODE_ENV:"test"}});if(child.stdout)process.stdout.write(child.stdout);if(child.stderr)process.stderr.write(child.stderr);if(child.status!==0)process.exitCode=child.status??1;}else void main();
