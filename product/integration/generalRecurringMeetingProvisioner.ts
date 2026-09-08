import "server-only";

import { productArtifactBodyDigest } from "../persistence";
import { issueInitialUnderstandingQuestionIdentity, type InitialUnderstandingQuestionIdentityV1 } from "../questions/initialUnderstandingQuestion";
import {
  completeRegisteredMeetingPreparationScopeV1,
  deriveRecurringMeetingOccurrenceIdentity,
  leadershipId,
  type ChiefFirstPrepareActivationV1,
  type ChiefFirstPrepareViewV1,
  type RegisteredMeetingPreparationScopeV1,
} from "../workflow/leadershipConversation";

type PersistedScope = {
  scopeExternalKey: string;
  persistedAt: string;
  sourceVersions: Array<{
    sourceBindingId: string;
    sourceContentVersionId: string;
    normalizedContentDigest: string;
  }>;
};

type ProvisionInput = {
  contractVersion: "1";
  userId: string;
  organizationExternalKey: string;
  meetingExternalKey: string;
  productQuestionExternalKey: string;
  productQuestion: string;
  title: string;
  purpose: string;
  cadenceLabel: string;
  role: string;
  preparationScopeExternalKey: string;
};

export type GeneralRecurringMeetingProvisioningSummaryV1 = {
  contractVersion: "1";
  organizationId: string;
  productQuestionId: string;
  seriesId: string;
  occurrenceId: string;
  preparationScopeId: string;
  preparedWorkProductVersionId: string;
  sourceCount: number;
  created: { preparationScopeBinding: boolean };
};

export type InitialUnderstandingRecurringMeetingInputV1 = {
  contractVersion: "1";
  userId: string;
  organizationExternalKey: string;
  activationOperationId: string;
  meetingExternalKey: string;
  productQuestion: string;
  title: string;
  purpose: string;
  cadenceLabel: string;
  preparationScopeExternalKey: string;
};

export type GeneralRecurringMeetingProvisionerDependencies = {
  resolveOrganization(input: { userId: string; organizationExternalKey: string }): Promise<{ organizationId: string }>;
  resolvePersistedPreparationScope(input: {
    userId: string;
    organizationId: string;
    preparationScopeExternalKey: string;
  }): Promise<PersistedScope>;
  createQuestion(input: {
    userId: string;
    organizationId: string;
    question: string;
    createdAt: string;
    idempotencyKey: string;
    operation: { requestId: string; operatorId: string };
  }): Promise<{ workspace: { question: { id: string } } }>;
  workflow: {
    read(organizationId: string): Promise<{ revision: string | null }>;
    registerMeetingPreparationScope(input: RegisteredMeetingPreparationScopeV1 & { expectedRevision: string | null }): Promise<{
      scope: RegisteredMeetingPreparationScopeV1;
      committed: boolean;
    }>;
  };
  activateAndPrepare(input: ChiefFirstPrepareActivationV1 & {
    userId: string;
    identity: { seriesId: string; conversationId: string };
  }): Promise<ChiefFirstPrepareViewV1>;
};

const KEY = /^[a-z0-9][a-z0-9._:-]{0,127}$/u;
const text = (value: string, label: string): string => {
  const normalized = value.trim();
  if (!normalized || normalized.length > 500) throw new Error(`Recurring meeting ${label} is invalid.`);
  return normalized;
};
const key = (value: string, label: string): string => {
  const normalized = value.trim();
  if (!KEY.test(normalized)) throw new Error(`Recurring meeting ${label} is invalid.`);
  return normalized;
};
const assertInput = (input: ProvisionInput): void => {
  const allowed = new Set(["contractVersion", "userId", "organizationExternalKey", "meetingExternalKey", "productQuestionExternalKey", "productQuestion", "title", "purpose", "cadenceLabel", "role", "preparationScopeExternalKey"]);
  if (input.contractVersion !== "1" || Object.keys(input).some((field) => !allowed.has(field))) throw new Error("Recurring meeting provisioning input is invalid.");
};

/**
 * Server-only composition: external stable keys enter here; organization, Question,
 * series, occurrence, scope-binding, and Prepared Work identities are derived by
 * existing owners. It intentionally exposes no route or browser action.
 */
export class GeneralRecurringMeetingProvisioner {
  constructor(private readonly dependencies: GeneralRecurringMeetingProvisionerDependencies) {}

  async provision(input: ProvisionInput): Promise<GeneralRecurringMeetingProvisioningSummaryV1> {
    return this.provisionInternal(input);
  }

  /** Bootstrap callers cannot supply a Question external key or role. The
   * Product Question owner issues both before this meeting owner consumes them. */
  async provisionInitialUnderstanding(input: InitialUnderstandingRecurringMeetingInputV1): Promise<GeneralRecurringMeetingProvisioningSummaryV1> {
    const organizationExternalKey = key(input.organizationExternalKey, "organization key");
    const meetingExternalKey = key(input.meetingExternalKey, "meeting key");
    const organization = await this.dependencies.resolveOrganization({ userId: input.userId, organizationExternalKey });
    if (!organization.organizationId) throw new Error("Recurring meeting organization is unavailable.");
    const identity = issueInitialUnderstandingQuestionIdentity({ contractVersion: "1", organizationId: organization.organizationId, activationOperationId: key(input.activationOperationId, "activation operation"), meetingExternalKey, primaryQuestion: text(input.productQuestion, "Product Question"), purpose: text(input.purpose, "purpose") });
    return this.provisionInternal({ contractVersion: "1", userId: input.userId, organizationExternalKey, meetingExternalKey, productQuestionExternalKey: identity.externalKey, productQuestion: input.productQuestion, title: input.title, purpose: input.purpose, cadenceLabel: input.cadenceLabel, role: identity.role, preparationScopeExternalKey: input.preparationScopeExternalKey }, identity);
  }

  private async provisionInternal(input: ProvisionInput, issuedIdentity?: InitialUnderstandingQuestionIdentityV1): Promise<GeneralRecurringMeetingProvisioningSummaryV1> {
    assertInput(input);
    const organizationExternalKey = key(input.organizationExternalKey, "organization key");
    const meetingExternalKey = key(input.meetingExternalKey, "meeting key");
    const productQuestionExternalKey = key(input.productQuestionExternalKey, "Product Question key");
    const preparationScopeExternalKey = key(input.preparationScopeExternalKey, "preparation scope key");
    const productQuestion = text(input.productQuestion, "Product Question");
    const title = text(input.title, "title");
    const purpose = text(input.purpose, "purpose");
    const cadenceLabel = text(input.cadenceLabel, "cadence");
    const role = text(input.role, "role");

    const organization = await this.dependencies.resolveOrganization({ userId: input.userId, organizationExternalKey });
    if (!organization.organizationId) throw new Error("Recurring meeting organization is unavailable.");
    const persistedScope = await this.dependencies.resolvePersistedPreparationScope({
      userId: input.userId,
      organizationId: organization.organizationId,
      preparationScopeExternalKey,
    });
    if (persistedScope.scopeExternalKey !== preparationScopeExternalKey || !persistedScope.sourceVersions.length || !/^\d{4}-\d{2}-\d{2}T/u.test(persistedScope.persistedAt)) throw new Error("Recurring meeting preparation scope is unavailable.");
    const sourceVersions = [...persistedScope.sourceVersions].sort((left, right) => left.sourceBindingId.localeCompare(right.sourceBindingId));
    if (sourceVersions.length !== 2 || new Set(sourceVersions.map((value) => value.sourceBindingId)).size !== sourceVersions.length || sourceVersions.some((value) => !value.sourceBindingId || !value.sourceContentVersionId || !/^[a-f0-9]{64}$/u.test(value.normalizedContentDigest))) throw new Error("Recurring meeting preparation scope is unavailable.");

    const identity = deriveRecurringMeetingOccurrenceIdentity({ organizationId: organization.organizationId, meetingExternalKey });
    // A meeting has one Question binding. Keep its owner idempotency keyed to the
    // meeting, then retain the Question external key in immutable scope facts.
    const questionOperationId = issuedIdentity?.idempotencyKey ?? leadershipId("general-recurring-meeting-question", organization.organizationId, meetingExternalKey);
    const question = await this.dependencies.createQuestion({
      userId: input.userId,
      organizationId: organization.organizationId,
      question: productQuestion,
      createdAt: persistedScope.persistedAt,
      idempotencyKey: questionOperationId,
      operation: { requestId: questionOperationId, operatorId: input.userId },
    });
    const questionId = question.workspace.question.id;
    if (!questionId || (issuedIdentity && questionId !== issuedIdentity.questionId)) throw new Error("Recurring meeting Product Question is unavailable.");

    const scopeId = leadershipId("registered-meeting-preparation-scope", organization.organizationId, identity.seriesId, preparationScopeExternalKey);
    const immutableFacts = { contractVersion: "1" as const, organizationExternalKey, meetingExternalKey, productQuestionExternalKey, productQuestion, questionId, title, purpose, cadenceLabel, preparationScopeExternalKey, sourceVersions };
    const requestFingerprint = productArtifactBodyDigest(immutableFacts);
    const scope = completeRegisteredMeetingPreparationScopeV1({
      contractVersion: "1",
      scopeId,
      organizationId: organization.organizationId,
      questionId,
      conversationId: identity.conversationId,
      seriesId: identity.seriesId,
      sourceVersions,
      createdAt: persistedScope.persistedAt,
      createdByUserId: input.userId,
      idempotencyKeyDigest: leadershipId("general-recurring-meeting-scope-key", organization.organizationId, meetingExternalKey),
      requestFingerprint,
    });
    const before = await this.dependencies.workflow.read(organization.organizationId);
    const bound = await this.dependencies.workflow.registerMeetingPreparationScope({ ...scope, expectedRevision: before.revision });
    if (bound.scope.scopeDigest !== scope.scopeDigest) throw new Error("Recurring meeting immutable facts conflict.");

    const activationId = leadershipId("general-recurring-meeting-activation", organization.organizationId, meetingExternalKey);
    const prepared = await this.dependencies.activateAndPrepare({
      contractVersion: "1",
      userId: input.userId,
      organizationId: organization.organizationId,
      questionId,
      meetingTitle: title,
      timeframe: cadenceLabel,
      role,
      purpose,
      authorizedSourceRefs: sourceVersions.map((value) => value.sourceContentVersionId),
      idempotencyKey: activationId,
      identity,
    });
    if (prepared.seriesId !== identity.seriesId || prepared.conversationId !== identity.conversationId || prepared.provenance.sourceRevisionReferences.length !== 2) throw new Error("Recurring meeting Prepared Work is unavailable.");
    return {
      contractVersion: "1",
      organizationId: organization.organizationId,
      productQuestionId: questionId,
      seriesId: identity.seriesId,
      occurrenceId: identity.conversationId,
      preparationScopeId: bound.scope.scopeId,
      preparedWorkProductVersionId: prepared.provenance.preparedWorkProductVersionId,
      sourceCount: prepared.provenance.sourceRevisionReferences.length,
      created: { preparationScopeBinding: bound.committed },
    };
  }
}
