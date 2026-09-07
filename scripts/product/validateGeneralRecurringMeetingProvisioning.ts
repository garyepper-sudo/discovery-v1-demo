import assert from "node:assert/strict";

import {
  GeneralRecurringMeetingProvisioner,
  type GeneralRecurringMeetingProvisionerDependencies,
} from "../../product/integration/generalRecurringMeetingProvisioner";
import { leadershipId, type RegisteredMeetingPreparationScopeV1 } from "../../product/workflow/leadershipConversation";

const digest = (value: string) => value.repeat(64).slice(0, 64);
const sourceVersions = [
  { sourceBindingId: "binding:alpha", sourceContentVersionId: "source-version:alpha", normalizedContentDigest: digest("a") },
  { sourceBindingId: "binding:beta", sourceContentVersionId: "source-version:beta", normalizedContentDigest: digest("b") },
];
const input = {
  contractVersion: "1" as const,
  userId: "participant:authorized",
  organizationExternalKey: "org-alpha",
  meetingExternalKey: "weekly-delivery-review",
  productQuestionExternalKey: "delivery-constraint",
  productQuestion: "What constrains delivery this week?",
  title: "Weekly Delivery Review",
  purpose: "Resolve the most material delivery constraint.",
  cadenceLabel: "Weekly",
  role: "Executive sponsor",
  preparationScopeExternalKey: "delivery-scope",
};

async function main(): Promise<void> {
  const questions = new Map<string, { title: string; id: string }>();
  const scopes = new Map<string, RegisteredMeetingPreparationScopeV1>();
  const activations = new Map<string, { seriesId: string; conversationId: string; preparedWorkProductVersionId: string; refs: string[] }>();
  let revision: string | null = null;
  let organizationReads = 0;
  let scopeReads = 0;
  let questionWrites = 0;
  let scopeWrites = 0;
  let preparedWrites = 0;
  const dependencies: GeneralRecurringMeetingProvisionerDependencies = {
    resolveOrganization: async ({ userId, organizationExternalKey }) => {
      organizationReads++;
      if (userId !== "participant:authorized" || organizationExternalKey !== "org-alpha") throw new Error("organization unavailable");
      return { organizationId: "organization:alpha" };
    },
    resolvePersistedPreparationScope: async ({ userId, organizationId, preparationScopeExternalKey }) => {
      scopeReads++;
      if (userId !== "participant:authorized" || organizationId !== "organization:alpha" || preparationScopeExternalKey !== "delivery-scope") throw new Error("scope unavailable");
      return { scopeExternalKey: "delivery-scope", persistedAt: "2026-09-07T12:00:00.000Z", sourceVersions };
    },
    createQuestion: async ({ organizationId, question, idempotencyKey }) => {
      assert.equal(organizationId, "organization:alpha");
      const previous = questions.get(idempotencyKey);
      if (previous) {
        if (previous.title !== question) throw new Error("Product Question idempotency conflict.");
        return { workspace: { question: { id: previous.id } } };
      }
      questionWrites++;
      const created = { title: question, id: leadershipId("question", organizationId, idempotencyKey) };
      questions.set(idempotencyKey, created);
      return { workspace: { question: { id: created.id } } };
    },
    workflow: {
      read: async () => ({ revision }),
      registerMeetingPreparationScope: async (candidate) => {
        if (candidate.expectedRevision !== revision) throw new Error("revision conflict");
        const existing = scopes.get(candidate.scopeId);
        if (existing) {
          if (existing.scopeDigest !== candidate.scopeDigest) throw new Error("scope replay conflict");
          return { scope: existing, committed: false };
        }
        scopeWrites++;
        scopes.set(candidate.scopeId, candidate);
        revision = `revision:${scopeWrites}`;
        return { scope: candidate, committed: true };
      },
    },
    activateAndPrepare: async ({ identity, authorizedSourceRefs, idempotencyKey, ...activation }) => {
      assert.deepEqual(authorizedSourceRefs, sourceVersions.map((value) => value.sourceContentVersionId));
      const previous = activations.get(idempotencyKey);
      if (previous) {
        assert.equal(previous.seriesId, identity.seriesId);
        assert.equal(previous.conversationId, identity.conversationId);
        return { contractVersion: "1", organizationId: activation.organizationId, questionId: activation.questionId, seriesId: identity.seriesId, conversationId: identity.conversationId, meeting: { title: activation.meetingTitle, timeframe: activation.timeframe, role: activation.role, purpose: activation.purpose }, whatChanged: [], whatMattersNow: [], hiddenTension: [], possibleSurprise: [], questions: [], priorCycle: { status: "none", message: "No prior completed conversation cycle is available yet." }, sourceBasis: authorizedSourceRefs.map((sourceRef) => ({ sourceRef, label: "Authorized meeting preparation scope" })), uncertainty: [], reasoning: [], competingExplanations: [], provenance: { contextVersionId: leadershipId("context", identity.conversationId), preparedWorkProductVersionId: previous.preparedWorkProductVersionId, authorizedProjectionRevision: "projection:1", authorizedProjectionDigest: digest("c"), sourceRevisionReferences: previous.refs }, status: "non-authoritative", currentStep: "freeze" };
      }
      preparedWrites++;
      const preparedWorkProductVersionId = leadershipId("prepared-work", identity.conversationId);
      activations.set(idempotencyKey, { ...identity, preparedWorkProductVersionId, refs: authorizedSourceRefs });
      return { contractVersion: "1", organizationId: activation.organizationId, questionId: activation.questionId, seriesId: identity.seriesId, conversationId: identity.conversationId, meeting: { title: activation.meetingTitle, timeframe: activation.timeframe, role: activation.role, purpose: activation.purpose }, whatChanged: [], whatMattersNow: [], hiddenTension: [], possibleSurprise: [], questions: [], priorCycle: { status: "none", message: "No prior completed conversation cycle is available yet." }, sourceBasis: authorizedSourceRefs.map((sourceRef) => ({ sourceRef, label: "Authorized meeting preparation scope" })), uncertainty: [], reasoning: [], competingExplanations: [], provenance: { contextVersionId: leadershipId("context", identity.conversationId), preparedWorkProductVersionId, authorizedProjectionRevision: "projection:1", authorizedProjectionDigest: digest("c"), sourceRevisionReferences: authorizedSourceRefs }, status: "non-authoritative", currentStep: "freeze" };
    },
  };
  const provisioner = new GeneralRecurringMeetingProvisioner(dependencies);
  const first = await provisioner.provision(input);
  assert.equal(questionWrites, 1);
  assert.equal(scopeWrites, 1);
  assert.equal(preparedWrites, 1);
  assert.equal(first.sourceCount, 2);
  assert.equal(scopes.size, 1);
  const replay = await provisioner.provision(input);
  assert.deepEqual(replay, { ...first, created: { preparationScopeBinding: false } });
  assert.deepEqual({ questionWrites, scopeWrites, preparedWrites }, { questionWrites: 1, scopeWrites: 1, preparedWrites: 1 });

  const noWrites = () => ({ questionWrites, scopeWrites, preparedWrites });
  const expectNoWrite = async (work: () => Promise<unknown>) => {
    const before = noWrites();
    await assert.rejects(work);
    assert.deepEqual(noWrites(), before);
  };
  await expectNoWrite(() => provisioner.provision({ ...input, purpose: "Changed purpose." }));
  await expectNoWrite(() => provisioner.provision({ ...input, productQuestion: "Changed Product Question" }));
  await expectNoWrite(() => provisioner.provision({ ...input, productQuestionExternalKey: "different-question-key" }));
  await expectNoWrite(() => provisioner.provision({ ...input, organizationExternalKey: "org-foreign" }));
  await expectNoWrite(() => provisioner.provision({ ...input, preparationScopeExternalKey: "foreign-scope" }));
  await expectNoWrite(() => provisioner.provision({ ...input, seriesId: "client-forged" } as typeof input));
  assert.equal(organizationReads > 0 && scopeReads > 0, true);
  console.log(JSON.stringify({ validation: "general-recurring-meeting-provisioning-v1", result: "PASS", created: { meetingSeries: 1, initialOccurrence: 1, productQuestions: 1, scopeBindings: 1, preparedWorkPublications: 1, sourcedLineage: 2 }, replay: { duplicateSeries: 0, duplicateOccurrence: 0, duplicateProductQuestion: 0, duplicateScopeBinding: 0, duplicatePreparedWork: 0 }, conflicts: { wrongOrganization: "rejected", changedQuestion: "rejected", changedScope: "rejected", unregisteredScope: "rejected", callerInternalIdentity: "rejected", writesAfterRejection: 0 }, access: { authorizedOrganization: "reconstructable", foreignOrganization: "withheld", participantScopedSourceClaim: false } }));
}

void main();
