import { createHash } from "node:crypto";
import type { ChiefAnalysisToActionV1 } from "../workflow/leadershipConversation/chiefAnalysisToAction";
import { normalizeChiefCommunication, type ChiefCommunicationPlanB11V1 } from "../workflow/leadershipConversation/chiefCommunicationPlan";
import { leadershipStableSerialize } from "../workflow/leadershipConversation/determinism";
import {
  PERSONAL_ROOM_SHEET_BOUNDARY_LABEL,
  PERSONAL_ROOM_SHEET_CONTRACT_VERSION,
  type ContentSafePersonalRoomSheetViewV1,
  type PersonalRoomSheetItemV1,
  type PersonalRoomSheetSectionIdV1,
  type PersonalRoomSheetSectionV1,
  type PersonalRoomSheetViewV1,
} from "../workflow/leadershipConversation/personalRoomSheetContracts";

const digest = (value: unknown) => createHash("sha256").update(leadershipStableSerialize(value)).digest("hex");
const LABELS: Record<PersonalRoomSheetSectionIdV1, string> = {
  purpose: "Purpose", "what-stands-out": "What stands out", "decision-or-tension-frame": "Decision or tension frame",
  "questions-worth-asking": "Questions worth asking", "best-supported-next-move": "Best supported next move",
  "what-would-change-the-view": "What would change the view", "what-to-capture": "What to capture",
};
const CAPTURE = ["Decision made", "Owner and next step", "What changed the view"] as const;
type Input = { organizationId: string; currentUserId: string; seriesId: string; occurrenceId: string; productQuestionId: string; meetingPurpose: string; sourceProjectionDigest: string; analysis: ChiefAnalysisToActionV1; b11Plan: ChiefCommunicationPlanB11V1; b11CommunicationDigest: string };

export function composeChiefPersonalRoomSheet(input: Input): PersonalRoomSheetViewV1 {
  if (input.organizationId !== input.analysis.organizationId || input.productQuestionId !== input.analysis.questionId || input.b11Plan.organizationId !== input.organizationId || input.b11Plan.questionId !== input.productQuestionId || input.sourceProjectionDigest !== input.analysis.supportProjectionDigest) throw new Error("Personal Room Sheet scope is unavailable.");
  const scope = { organizationId: input.organizationId, questionId: input.productQuestionId }, seen = new Set<string>(), omitted: PersonalRoomSheetViewV1["omitted"] = [], sections: PersonalRoomSheetSectionV1[] = [];
  const add = (sectionId: PersonalRoomSheetSectionIdV1, candidates: PersonalRoomSheetItemV1[], limit: number) => {
    const items: PersonalRoomSheetItemV1[] = [];
    for (const candidate of candidates) { const normalized = normalizeChiefCommunication(candidate.text); if (!normalized || seen.has(normalized)) { omitted.push({ sectionId, reason: normalized ? "duplicate" : "unsupported-empty" }); continue; } if (items.length >= limit) { omitted.push({ sectionId, reason: "section-limit" }); continue; } seen.add(normalized); items.push(candidate); }
    if (items.length) sections.push({ sectionId, label: LABELS[sectionId], items }); else omitted.push({ sectionId, reason: "unsupported-empty" });
  };
  const fixed = (sectionId: PersonalRoomSheetSectionIdV1, text: string, sourceIdentity: string, upstreamDigest: string): PersonalRoomSheetItemV1 => ({ itemId: `personal-room-sheet-item:${digest({ sectionId, sourceIdentity, text })}`, text, sourceRole: sectionId === "purpose" ? "occurrence-purpose" : sectionId === "what-to-capture" ? "fixed-capture-prompt" : "candidate1-assessment", sourceIdentity, lineage: [upstreamDigest], permissionScope: scope, upstreamDigest });
  const b11 = input.b11Plan.items.filter(item => item.surface === "first");
  const fromB11 = (item: typeof b11[number]): PersonalRoomSheetItemV1 => ({ itemId: `personal-room-sheet-item:${digest({ section: item.section, source: item.semanticSourceId })}`, text: item.renderedContent, sourceRole: "b11-first-surface", sourceIdentity: item.semanticSourceId, lineage: item.lineage, permissionScope: scope, upstreamDigest: input.b11CommunicationDigest });
  add("purpose", input.meetingPurpose.trim() ? [fixed("purpose", input.meetingPurpose.trim(), `occurrence:${input.occurrenceId}:purpose`, input.sourceProjectionDigest)] : [], 1);
  add("what-stands-out", b11.filter(item => item.section === "what-stands-out" || item.section === "what-changed" || item.section === "what-could-surprise-you").map(fromB11), 2);
  add("decision-or-tension-frame", b11.filter(item => item.section === "the-tension").map(fromB11), 1);
  add("questions-worth-asking", b11.filter(item => item.section === "question-worth-asking").map(fromB11), 3);
  add("best-supported-next-move", input.analysis.userFacingNextMove && input.analysis.nextMoveDisposition !== "abstain" && input.analysis.nextMoveDisposition !== "no-action" ? [fixed("best-supported-next-move", input.analysis.userFacingNextMove, `candidate1:${input.analysis.assessmentDigest}:next-move`, input.analysis.assessmentDigest)] : [], 1);
  add("what-would-change-the-view", input.analysis.whatWouldChangeTheView ? [fixed("what-would-change-the-view", input.analysis.whatWouldChangeTheView, `candidate1:${input.analysis.assessmentDigest}:change-view`, input.analysis.assessmentDigest)] : [], 1);
  add("what-to-capture", CAPTURE.map((text, index) => fixed("what-to-capture", text, `personal-room-sheet:capture:${index + 1}`, PERSONAL_ROOM_SHEET_CONTRACT_VERSION)), 3);
  const unsigned = { contractVersion: PERSONAL_ROOM_SHEET_CONTRACT_VERSION, authority: "non-authoritative-personal-product-material" as const, organizationId: input.organizationId, currentUserId: input.currentUserId, seriesId: input.seriesId, occurrenceId: input.occurrenceId, productQuestionId: input.productQuestionId, boundaryLabel: PERSONAL_ROOM_SHEET_BOUNDARY_LABEL, sourceProjectionDigest: input.sourceProjectionDigest, candidate1AssessmentDigest: input.analysis.assessmentDigest, b11CommunicationDigest: input.b11CommunicationDigest, sections, omitted };
  return { ...unsigned, personalRoomSheetDigest: digest(unsigned) };
}

export function projectContentSafePersonalRoomSheet(sheet: PersonalRoomSheetViewV1): ContentSafePersonalRoomSheetViewV1 {
  return { contractVersion: sheet.contractVersion, authority: sheet.authority, boundaryLabel: sheet.boundaryLabel, sourceProjectionDigest: sheet.sourceProjectionDigest, candidate1AssessmentDigest: sheet.candidate1AssessmentDigest, b11CommunicationDigest: sheet.b11CommunicationDigest, personalRoomSheetDigest: sheet.personalRoomSheetDigest, sections: sheet.sections.map(section => ({ sectionId: section.sectionId, label: section.label, items: section.items.map(({ itemId, text }) => ({ itemId, text })) })) };
}

export function createPersonalRoomSheetConfirmationDigest(sheet: PersonalRoomSheetViewV1): string {
  return digest({ contractVersion: sheet.contractVersion, currentUserId: sheet.currentUserId, organizationId: sheet.organizationId, seriesId: sheet.seriesId, occurrenceId: sheet.occurrenceId, productQuestionId: sheet.productQuestionId, sourceProjectionDigest: sheet.sourceProjectionDigest, candidate1AssessmentDigest: sheet.candidate1AssessmentDigest, b11CommunicationDigest: sheet.b11CommunicationDigest, personalRoomSheetDigest: sheet.personalRoomSheetDigest });
}
