import type { SourceScopedCandidateV1 } from "../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import type { ChiefFirstPrepareViewV1, LeadershipConversationWorkspaceV1 } from "../workflow/leadershipConversation";
import { leadershipDigest, leadershipId, leadershipStableSerialize } from "../workflow/leadershipConversation/determinism";
import {
  serializeMeetingPackAgenda,
  serializeMeetingPackTalkingPoints,
  type ChiefMeetingPackBodyV1,
} from "../workflow/leadershipConversation/meetingPackContracts";

type Note = { noteId: string; intent: "keep-private" | "talking-points" | "agenda"; text: string };
const statements = (candidate: SourceScopedCandidateV1, key: keyof SourceScopedCandidateV1["sections"]) => candidate.sections[key].map(item => item.statement);
const unique = (values: string[], limit: number) => [...new Set(values.map(value => value.trim()).filter(Boolean))].slice(0, limit);

export function chiefMeetingPackInputSnapshotDigest(input: {
  organizationId: string;
  questionId: string;
  seriesId: string;
  occurrenceId: string;
  userScopeDigest: string;
  preparedWorkPublicationDigest: string;
  analysisDigest: string;
  priorCompletionDigest: string | null;
  notes: Array<{ noteId: string; noteRevisionId: string; intent: string }>;
}): string {
  return leadershipDigest(leadershipStableSerialize({ ...input, notes: [...input.notes].sort((a, b) => a.noteId.localeCompare(b.noteId)) }));
}

export function composeChiefMeetingPack(input: {
  organizationId: string;
  questionId: string;
  seriesId: string;
  occurrenceId: string;
  userScopeDigest: string;
  prepare: ChiefFirstPrepareViewV1;
  workspace: LeadershipConversationWorkspaceV1;
  analysis: SourceScopedCandidateV1;
  notes: Note[];
  inputSnapshotDigest: string;
  sourceLineageDigest: string;
  preparedWorkPublicationDigest: string;
  priorCompletionDigest: string | null;
  createdAt: string;
  priorReviewedItems?: string[];
  priorMaterialChanges?: string[];
}): ChiefMeetingPackBodyV1 {
  const priorChanges=unique(input.priorMaterialChanges??[],4),analysisUpdates=unique(statements(input.analysis,"whatChanged"),4),changed=unique([...priorChanges,...analysisUpdates],8),priorReviewed=unique(input.priorReviewedItems??[],6), decisions = statements(input.analysis, "decisions"), commitments = statements(input.analysis, "commitments"), questions = statements(input.analysis, "openQuestions"), alternatives = statements(input.analysis, "competingExplanations"), contradictions = statements(input.analysis, "contradictions"), gaps = statements(input.analysis, "evidenceUncertainty"), attention = statements(input.analysis, "attention"), leanings = statements(input.analysis, "whatMattersNow"), changeConditions = statements(input.analysis, "whatWouldChangeAssessment"), agendaNotes = input.notes.filter(note => note.intent === "agenda"), talkingNotes = input.notes.filter(note => note.intent === "talking-points");
  const agendaItems = [
    ...priorChanges.map((topic, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "change", index + 1), topic, whyNow: topic, desiredOutcome: "Confirm what changed and its implications.", reason: "Changed since last time" as const })),
    ...analysisUpdates.map((topic, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "analysis-update", index + 1), topic, whyNow: topic, desiredOutcome: "Test this tentative analysis in the meeting.", reason: "Current analysis" as const })),
    ...decisions.map((topic, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "decision", index + 1), topic, whyNow: topic, desiredOutcome: "Make a bounded decision or preserve an explicit non-decision.", reason: "Decision required" as const })),
    ...questions.map((topic, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "question", index + 1), topic, whyNow: topic, desiredOutcome: "Resolve the question or identify the information owner.", reason: "Unresolved question" as const })),
    ...alternatives.map((topic, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "alternative", index + 1), topic, whyNow: topic, desiredOutcome: "Distinguish the supported explanations.", reason: "Competing explanations" as const })),
    ...gaps.map((topic, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "gap", index + 1), topic, whyNow: topic, desiredOutcome: "Identify what information should be acquired.", reason: "Evidence gap" as const })),
    ...agendaNotes.map((note, index) => ({ itemId: leadershipId("meeting-pack-agenda-item", input.inputSnapshotDigest, "user", index + 1), topic: note.text, whyNow: "You proposed this private context for your draft agenda.", desiredOutcome: "Discuss this user-proposed item.", reason: "Added by you" as const })),
  ].slice(0, 7);
  const desiredOutcomes = unique([...decisions, ...questions].map(value => value), 4);
  const talkingPoints = {
    questionsToAsk: unique([...questions, ...changeConditions], 6),
    currentLeaning: unique(leanings, 3),
    watchOuts: unique([...contradictions, ...alternatives, ...gaps], 6),
    doNotForget: unique([...priorReviewed,...commitments, ...attention], 8),
    privateContext: talkingNotes.map(note => note.text),
  };
  const core = {
    contractVersion: "1" as const,
    authority: "noncanonical-user-working-draft" as const,
    organizationId: input.organizationId,
    questionId: input.questionId,
    seriesId: input.seriesId,
    occurrenceId: input.occurrenceId,
    userScopeDigest: input.userScopeDigest,
    generatedAgendaId: leadershipId("chief-meeting-pack-agenda", input.inputSnapshotDigest),
    generatedTalkingPointsId: leadershipId("chief-meeting-pack-talking-points", input.inputSnapshotDigest, input.userScopeDigest),
    purpose: input.prepare.meeting.purpose,
    desiredOutcomes,
    agendaItems,
    closingCheck: ["Confirm the decision or explicit non-decision.", "Confirm the owner and next step.", "Name the evidence that would change the view."],
    talkingPoints,
  };
  const body: ChiefMeetingPackBodyV1 = {
    ...core,
    generatedAgendaText: serializeMeetingPackAgenda(core),
    generatedTalkingPointsText: serializeMeetingPackTalkingPoints(core),
    agendaText: serializeMeetingPackAgenda(core),
    talkingPointsText: serializeMeetingPackTalkingPoints(core),
    revisionKind: "generated",
    personaTrace: {
      chief: unique([...changed, ...attention, input.prepare.meeting.purpose], 8),
      counsel: unique([...alternatives, ...contradictions, ...changeConditions], 8),
      operator: unique([...decisions, ...commitments, ...questions], 8),
      scout: unique(gaps, 8),
    },
    inputBasis: {
      priorReviewedOutcomes: input.priorReviewedItems?.length??0,
      materialChanges: changed.length,
      openCommitments: commitments.length,
      unresolvedQuestions: questions.length,
      privateNotes: input.notes.length,
    },
    inputSnapshotDigest: input.inputSnapshotDigest,
    preparedWorkPublicationDigest: input.preparedWorkPublicationDigest,
    priorCompletionDigest: input.priorCompletionDigest,
    sourceLineageDigest: input.sourceLineageDigest,
    createdAt: input.createdAt,
  };
  return body;
}
