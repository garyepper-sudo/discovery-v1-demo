import type { ProductArtifactBodyRefV1 } from "../../persistence/productArtifactBodyContracts";

export const CHIEF_MEETING_PACK_CONTRACT_VERSION = "1" as const;
export type MeetingPackPrivateNoteIntentV1 = "keep-private" | "talking-points" | "agenda";

export type MeetingPackPrivateNoteBodyV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  seriesId: string;
  occurrenceId: string;
  userScopeDigest: string;
  noteId: string;
  intent: MeetingPackPrivateNoteIntentV1;
  text: string;
  textDigest: string;
  createdAt: string;
};

export type MeetingPackPrivateNotePublicationV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  conversationId: string;
  seriesId: string;
  occurrenceId: string;
  userScopeDigest: string;
  noteId: string;
  noteRevisionId: string;
  intent: MeetingPackPrivateNoteIntentV1;
  protectedBody: ProductArtifactBodyRefV1;
  ownerStageReceiptDigest: string;
  createdAt: string;
  idempotencyKeyDigest: string;
  requestFingerprint: string;
  publicationDigest: string;
};

export type ChiefMeetingPackAgendaItemV1 = {
  itemId: string;
  topic: string;
  whyNow: string;
  desiredOutcome: string;
  reason: "Changed since last time" | "Current analysis" | "Decision required" | "Commitment at risk" | "Unresolved question" | "Competing explanations" | "Evidence gap" | "Added by you";
};

/** Compact provenance is projected with the draft item rather than replacing
 * it with a lineage aggregate.  It deliberately carries no source body. */
export type ChiefMeetingPackCitationProjectionV1 = {
  itemId: string;
  statement: string;
  classification: "source-derived" | "non-source-derived";
  citations: Array<{ sourceId: string; sourceVersion: string; bodyDigest: string }>;
};

export type ChiefMeetingPackBodyV1 = {
  contractVersion: "1";
  authority: "noncanonical-user-working-draft";
  organizationId: string;
  questionId: string;
  seriesId: string;
  occurrenceId: string;
  userScopeDigest: string;
  generatedAgendaId: string;
  generatedTalkingPointsId: string;
  purpose: string;
  desiredOutcomes: string[];
  agendaItems: ChiefMeetingPackAgendaItemV1[];
  citationProjection?: {
    agenda: ChiefMeetingPackCitationProjectionV1[];
    talkingPoints: ChiefMeetingPackCitationProjectionV1[];
  };
  closingCheck: string[];
  talkingPoints: {
    questionsToAsk: string[];
    currentLeaning: string[];
    watchOuts: string[];
    doNotForget: string[];
    privateContext: string[];
  };
  generatedAgendaText: string;
  generatedTalkingPointsText: string;
  agendaText: string;
  talkingPointsText: string;
  revisionKind: "generated" | "user-edit";
  personaTrace: {
    chief: string[];
    counsel: string[];
    operator: string[];
    scout: string[];
  };
  inputBasis: {
    priorReviewedOutcomes: number;
    materialChanges: number;
    openCommitments: number;
    unresolvedQuestions: number;
    privateNotes: number;
  };
  inputSnapshotDigest: string;
  preparedWorkPublicationDigest: string;
  priorCompletionDigest: string | null;
  sourceLineageDigest: string;
  createdAt: string;
};

export type ChiefMeetingPackPublicationV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  conversationId: string;
  seriesId: string;
  occurrenceId: string;
  userScopeDigest: string;
  artifactId: string;
  artifactRevision: string;
  revision: number;
  predecessorArtifactRevision: string | null;
  generatedAgendaId: string;
  generatedTalkingPointsId: string;
  inputSnapshotDigest: string;
  /** Present on content-aware refresh publications. Historical publications
   * remain readable and derive this value from their protected body. */
  candidateSemanticDigest?: string;
  sourceLineageDigest: string;
  protectedBody: ProductArtifactBodyRefV1;
  ownerStageReceiptDigest: string;
  createdAt: string;
  idempotencyKeyDigest: string;
  requestFingerprint: string;
  publicationDigest: string;
};

export type ChiefMeetingPackViewV1 = Omit<ChiefMeetingPackBodyV1,
  "organizationId" | "questionId" | "seriesId" | "occurrenceId" | "userScopeDigest" | "personaTrace" | "sourceLineageDigest"
> & {
  artifactRevision: string;
  revision: number;
  potentiallyOutOfDate: boolean;
  privateNotes: Array<{ noteId: string; intent: MeetingPackPrivateNoteIntentV1; text: string }>;
};

export function reconcileMeetingPackDraftBuffers(current:{agendaText:string;talkingPointsText:string},next:ChiefMeetingPackViewV1|null,preserveUnsavedEdits:boolean){
  return next&&!preserveUnsavedEdits?{agendaText:next.agendaText,talkingPointsText:next.talkingPointsText}:current;
}

export function serializeMeetingPackAgenda(body: Pick<ChiefMeetingPackBodyV1, "purpose" | "desiredOutcomes" | "agendaItems" | "closingCheck">): string {
  return [
    "Draft agenda · not yet shared",
    "",
    `Purpose\n${body.purpose}`,
    body.desiredOutcomes.length ? `\nDesired outcomes\n${body.desiredOutcomes.map(value => `- ${value}`).join("\n")}` : "",
    body.agendaItems.length ? `\nProposed agenda\n${body.agendaItems.map(value => `- ${value.topic} — ${value.desiredOutcome} [${value.reason}]`).join("\n")}` : "",
    body.closingCheck.length ? `\nClosing check\n${body.closingCheck.map(value => `- ${value}`).join("\n")}` : "",
  ].filter(Boolean).join("\n");
}

export function serializeMeetingPackTalkingPoints(body: Pick<ChiefMeetingPackBodyV1, "talkingPoints">): string {
  const sections: Array<[string, string[]]> = [
    ["Questions to ask", body.talkingPoints.questionsToAsk],
    ["Tentative analysis · not my settled view", body.talkingPoints.currentLeaning],
    ["Watch-outs", body.talkingPoints.watchOuts],
    ["Do not forget", body.talkingPoints.doNotForget],
    ["My private context", body.talkingPoints.privateContext],
  ];
  return ["Private talking points · only you can see this", ...sections.flatMap(([label, items]) => items.length ? ["", label, ...items.map(value => `- ${value}`)] : [])].join("\n");
}
