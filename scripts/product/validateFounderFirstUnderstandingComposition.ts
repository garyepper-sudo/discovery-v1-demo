import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import postgres from "postgres";
import { PostgresParticipantReferenceAccessRepository, PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { ExistingParticipantIdentityResolutionService } from "../../lib/auth/existingParticipantIdentityResolutionCore";
import { verifyFounderFirstUnderstandingRequest, assertFounderFirstUnderstandingVerifiedRequest } from "../../lib/alpha-activation/founderFirstUnderstandingRequestAuthority";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalLocalSourceBindingService } from "../../engine/v3/governance/canonicalLocalSourceBindingService";
import { GovernedSourceContentService } from "../../engine/v3/sources";
import { ParticipantReferenceAccessAdministration } from "../../lib/alpha-activation/participantReferenceAccess";
import { LeadershipConversationProductOperations } from "../../product/workflow/leadershipConversation/operations";
import { GeneralRecurringMeetingProvisioner } from "../../product/integration/generalRecurringMeetingProvisioner";
import { provisionOrganizationUnderstandingBootstrap } from "../../lib/alpha-provisioning/provisionDesignPartner";
import { issueInitialUnderstandingQuestionIdentity } from "../../product/questions/initialUnderstandingQuestion";
import { founderAuthorizedMeetingDirectory } from "../../product/integration/founderAuthorizedMeetingDirectory";
import { createFounderFirstUnderstandingOwnerBundleForIsolatedValidation } from "../../lib/alpha-activation/founderFirstUnderstandingOwnerBundle";

const verifiedRequest = {
  status: "verified" as const,
  identity: { consumerId: "user_synthetic_request", provider: "clerk" as const, verificationId: "session_synthetic_request", verifiedAt: "2026-09-09T00:00:00.000Z" },
};

function participantLookupRepository(input: { binding: "found" | "absent" | "unavailable"; namespace?: "ready" | "unavailable" }) {
  let writes = 0;
  let protectedReads = 0;
  const repository = {
    inspectActiveParticipantIdentityNamespace: async () => input.namespace === "unavailable" ? undefined : { scheme: "clerk-user-v2" as const, anchorId: "synthetic-anchor" },
    findExistingParticipantIdentityBinding: async () => {
      if (input.binding === "unavailable") throw new Error("synthetic participant lookup unavailable");
      return input.binding === "found" ? { bindingId: "synthetic-binding", participantRef: "participant:synthetic-existing-v2", createdAt: "2026-09-09T00:00:00.000Z" } : undefined;
    },
    resolveOrBindExistingParticipantIdentity: async () => { writes += 1; throw new Error("page load must not create a binding"); },
    activateLegacyParticipantIdentityNamespaceAnchor: async () => { writes += 1; throw new Error("page load must not activate a namespace"); },
    readProtectedWorkspace: async () => { protectedReads += 1; throw new Error("denied request must not read protected workspace"); },
  };
  return { repository, writes: () => writes, protectedReads: () => protectedReads };
}

async function assertParticipantLookupParity() {
  const found = participantLookupRepository({ binding: "found" });
  const request = await verifyFounderFirstUnderstandingRequest(verifiedRequest, found.repository);
  assert.equal(request.participantRef, "participant:synthetic-existing-v2");
  assert.equal(found.writes(), 0);
  assert.equal(found.protectedReads(), 0);

  const absent = participantLookupRepository({ binding: "absent" });
  await assert.rejects(() => verifyFounderFirstUnderstandingRequest(verifiedRequest, absent.repository), /Founder participant setup is required/);
  assert.equal(absent.writes(), 0);
  assert.equal(absent.protectedReads(), 0);

  for (const denied of [participantLookupRepository({ binding: "unavailable" }), participantLookupRepository({ binding: "found", namespace: "unavailable" })]) {
    await assert.rejects(() => verifyFounderFirstUnderstandingRequest(verifiedRequest, denied.repository), /Founder participant identity is unavailable|Active V2 participant namespace is unavailable/);
    assert.equal(denied.writes(), 0);
    assert.equal(denied.protectedReads(), 0);
  }
}

async function main() {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-first-understanding-construction-"));
  const sql = postgres(process.env.DISCOVERY_TEST_DATABASE_URL??"postgres://discovery_local:discovery_local_only@127.0.0.1:55432/discovery_alpha", { max: 1, connect_timeout: 1 });
  try {
    const identities = new ExistingParticipantIdentityResolutionService(new PostgresAlphaAccessRecordRepository(sql, undefined, "isolated-validation-locator-key-long-enough", "isolated.clerk.accounts.dev"));
    const bundle = createFounderFirstUnderstandingOwnerBundleForIsolatedValidation({ runtime: new FilesystemOrganizationRuntimeRepository(path.join(root, "runtime")), accessRepository: new PostgresParticipantReferenceAccessRepository(sql), workflowRoot: path.join(root, "workflow"), sourceRoot: path.join(root, "sources"), bodyRoot: path.join(root, "bodies"), participantRef: "participant:synthetic-existing-v2", consumerId: "user_synthetic_request", close: async () => { await sql.end({ timeout: 1 }); } });
    const categories:unknown[]=[verifyFounderFirstUnderstandingRequest,identities,bundle.bootstrap,bundle.runtime,bundle.access,bundle.access.grant,bundle.question,bundle.sourceBindings,bundle.sourceContent,bundle.workflow,bundle.provisioner,bundle.access.grant,bundle.operations,bundle.meetingAddress];
    const canonicalMethods:unknown[]=[bundle.sourceBindings.registerCanonicalLocalSourceBinding,bundle.sourceContent.write,bundle.sourceContent.inspectExactWriteState,bundle.workflow.registerMeetingPreparationScope,bundle.provisioner.provisionInitialUnderstanding,bundle.operations.recordPreparation];
    function assertConcrete(values:unknown[],methods:unknown[]){
      assert.equal(values.length,14);
      assert.equal(values[0],verifyFounderFirstUnderstandingRequest);
      assert.ok(values[1] instanceof ExistingParticipantIdentityResolutionService);
      assert.equal((values[1] as ExistingParticipantIdentityResolutionService).lookupExistingParticipantBinding,ExistingParticipantIdentityResolutionService.prototype.lookupExistingParticipantBinding);
      assert.equal(values[2],provisionOrganizationUnderstandingBootstrap);assert.ok(values[3] instanceof FilesystemOrganizationRuntimeRepository);
      assert.ok(values[4] instanceof ParticipantReferenceAccessAdministration);assert.equal(values[5],ParticipantReferenceAccessAdministration.prototype.grant);
      assert.equal(values[6],issueInitialUnderstandingQuestionIdentity);assert.ok(values[7] instanceof CanonicalLocalSourceBindingService);assert.ok(values[8] instanceof GovernedSourceContentService);
      assert.equal(Object.getPrototypeOf(values[9]),Object.getPrototypeOf(bundle.workflow));
      assert.ok(values[10] instanceof GeneralRecurringMeetingProvisioner);assert.equal(values[11],ParticipantReferenceAccessAdministration.prototype.grant);assert.ok(values[12] instanceof LeadershipConversationProductOperations);assert.equal(values[13],founderAuthorizedMeetingDirectory);
      assert.deepEqual(methods,canonicalMethods);assert.ok(methods.every(value=>typeof value==="function"));
    }
    assertConcrete(categories,canonicalMethods);
    for(let index=0;index<categories.length;index++){
      for(const replacement of [undefined,null,async()=>({status:"success"})]){
        const substituted=[...categories];substituted[index]=replacement;
        assert.throws(()=>assertConcrete(substituted,canonicalMethods),`category ${index+1} rejects substituted missing/canned owner`);
      }
    }
    for(let index=0;index<canonicalMethods.length;index++){const substituted=[...canonicalMethods];substituted[index]=async()=>({status:"success"});assert.throws(()=>assertConcrete(categories,substituted));}
    assert.throws(()=>assertFounderFirstUnderstandingVerifiedRequest({participantRef:"participant:forged",consumerId:"user_forged",route:"/onboarding/first-understanding",namespaceScheme:"clerk-user-v2",namespaceAnchorId:"forged"}),"plain objects cannot mint request authority");
    await assertParticipantLookupParity();
    assert.deepEqual(await readdir(root), [], "construction performs no filesystem writes");
    await bundle.close();
    console.log("PASS concrete owner categories=14 placeholder owner categories=0 missing owner categories=0 construction writes=0 negative control=PASS");
  } finally { await sql.end({ timeout: 1 }); await rm(root, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error); process.exitCode=1; });
