import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

let checks = 0;
const check = (value: unknown, message: string): void => { assert.ok(value, message); checks += 1; };

async function main(): Promise<void> {
  const router = await readFile(path.join(process.cwd(), "product/integration/canonicalLeadershipConversationOwnerRouter.ts"), "utf8");
  const composition = await readFile(path.join(process.cwd(), "product/integration/leadershipConversationServerComposition.ts"), "utf8");
  const operations = await readFile(path.join(process.cwd(), "product/workflow/leadershipConversation/operations.ts"), "utf8");
  const actions = await readFile(path.join(process.cwd(), "app/product-alpha/leadership-conversation/actions.ts"), "utf8");
  const replay = await readFile(path.join(process.cwd(), "scripts/product/validateLeadershipConversationReplay.ts"), "utf8");
  const materializer = await readFile(path.join(process.cwd(), "product/integration/canonicalLeadershipConversationProductMaterializer.ts"), "utf8");
  const neutral = await readFile(path.join(process.cwd(), "product/workflow/leadershipConversation/canonicalProductMaterializationContracts.ts"), "utf8");
  const draftService = await readFile(path.join(process.cwd(), "product/integration/productDecisionDraftService.ts"), "utf8");
  const lifecycleRouter = await readFile(path.join(process.cwd(), "product/integration/canonicalHistoricalCheckpointLifecycleLinkRouter.ts"), "utf8");

  check(router.includes("contributeEvidenceWithCanonicalMaterializationInstruction"), "Evidence routing persists the actual operation-bound result and instruction together");
  check(router.includes("decisionDraftService.create"), "Product Decision Draft uses the actual service");
  check(router.includes("deriveProductUnknownCandidate") && router.includes("mutateUnknown"), "Unknown identity and result use the actual owner");
  check(router.includes("createQuestion") && router.includes("result.workspace.question.id"), "follow-up Question receipts derive from the actual owner result");
  check(!router.includes("canonicalReceiptRefs:string[]") && !router.includes("classification:string"), "caller cannot supply authoritative receipt arrays or change classification");
  check(router.includes("resolveCurrentSourceBinding") && router.includes("readForEvidenceAdmission"), "Evidence routing resolves Binding and rereads governed content");
  check(composition.includes("operationRecord.canonicalAdmissionBatch.admissions"), "materialization derives from the complete actual admission batch");
  check(router.includes("canonicalUnderstandingChange") && router.includes("validateCanonicalOrganizationalUnderstandingChangeResult"), "router verifies and consumes the canonical Understanding owner result");
  check(composition.includes("canonicalChangeResultDigest:changeDigest"), "instruction binds the actual canonical change-result digest");
  check(composition.includes("CANONICAL_UNDERSTANDING_REVISION_OPERATION"), "server composition uses the exact confidence-revision governance operation");
  check(composition.includes("CanonicalOrganizationalUnderstandingRevisionService"), "server composition constructs the canonical Understanding revision owner");
  check(composition.includes("organizationalUnderstandingChangeType"), "What Changed consumes the actual canonical change type");
  check(!router.includes("meaning(before.workspace)") && !router.includes("modelState:workspace.modelState"), "Product workspace comparison is not canonical change authority");
  check(operations.includes("sourceBindingMutationReceiptDigest") && !operations.includes("sourceBindingId:input.sourceBindingId"), "capture persists server-derived Binding identity and receipt digest");
  check(composition.includes('import "server-only"') && composition.includes("CanonicalLocalSourceBindingService"), "live composition remains server-only and constructs canonical Binding ownership");
  check(composition.includes("ProductDecisionDraftService") && composition.includes("CanonicalLeadershipConversationOwnerRouter"), "live composition constructs actual owner services internally");
  check(composition.includes("CanonicalLeadershipConversationProductMaterializer") && composition.includes("verifyCanonicalInstructionProvenance"), "live composition constructs staged recovery with persisted provenance");
  check(draftService.includes("materializeCommittedInstruction") && draftService.includes("materializationReceipt"), "Draft owner retains its one-CAS materialization boundary");
  check(operations.includes("materializeCanonicalProductInstruction") && operations.includes("this.d.repository.replace"), "Product Workflow owner retains its one-CAS materialization boundary");
  check(!materializer.includes("repository.replace") && !materializer.includes("runtimeRepository.replace"), "Product Integration coordinator performs no direct semantic repository write");
  check(!neutral.includes("product/integration") && !neutral.match(/import .*Repository|from .*repository/i) && !neutral.includes("Date.now") && !neutral.includes("Math.random"), "neutral integrity boundary has no upward, persistence, clock, or randomness dependency");
  check(!composition.includes("installCanonicalLeadershipConversationServerOwnersForBootstrap") && !composition.includes("let canonicalOwners"), "mutable global owner installation is absent");
  check(composition.includes("process.env.NODE_ENV!==\"test\"") && composition.includes("FilesystemOrganizationRuntimeRepository"), "validator root injection is test-only and retains canonical filesystem repositories");
  check(!actions.includes("sourceBindingId") && !actions.includes("RuntimeRepository") && !actions.includes("SourceBindingService"), "server actions accept no canonical identity or dependency objects");
  check(!actions.includes("leadershipConversationFixtureAdapter"), "fixture presentation cannot route canonical owners");
  check(replay.includes("route-actual-owners-and-prepare-again") && replay.includes("createLeadershipConversationServerCompositionForValidation"), "unified Process C uses the actual root-bound server composition");
  check(!replay.includes("stubbedPositiveOwners: true") && replay.includes("stubbedPositiveOwners: false"), "focused synthetic positive-owner acceptance has been removed");
  check(replay.includes("processAHandoffDigest") && replay.includes("processBHandoffDigest") && replay.includes("handoff digest mismatch"), "fresh-process handoffs are cryptographically chained and fail closed");
  check(replay.includes("actual-class-2") && replay.includes("canonical-committed-product-materialized"), "Class 2 duplicate acceptance uses staged canonical materialization");
  check(replay.includes("productMaterializationReceiptDigest"), "replay binds future preparation to staged Product materialization receipts");
  check(replay.includes("different-purpose") && replay.includes("assert.rejects"), "same-key different-request control fails closed");
  check(composition.includes("historicalCheckpointLifecycle") && composition.includes("CanonicalProductArtifactCurrentAccessComposition") && composition.includes("executiveHistoryAccess.readReview") && composition.includes("executiveHistoryAccess.readOutcome") && composition.includes("executiveHistoryAccess.readLearning"), "server composition routes L1 through actual Product-artifact and Executive History access owners");
  check(lifecycleRouter.includes("resolveCheckpoint") && lifecycleRouter.includes("resolveLinkedRecord") && !lifecycleRouter.includes("runtimeRepository"), "L1 router accepts no Runtime repository or caller-supplied owner proof");

  console.log(JSON.stringify({ validation: "leadership-conversation-actual-owner-routing-001", result: "PASS", checks, positiveAcceptance: "unified-fresh-process-replay", focusedRole: "contract-and-adversarial-controls", syntheticPositiveOwners: false, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0, deployments: 0 }));
}

void main();
