export const PERSONAL_ROOM_SHEET_CONTRACT_VERSION = "1" as const;
export const PERSONAL_ROOM_SHEET_BOUNDARY_LABEL = "Prepared for your use. Review before sharing." as const;
export const PERSONAL_ROOM_SHEET_EXPLANATION = "This sheet uses your current authorized view. Discovery has not checked it for other recipients." as const;
export const PERSONAL_ROOM_SHEET_CONFIRMATION_TEXT = "I reviewed this personal meeting sheet." as const;

export type PersonalRoomSheetSectionIdV1 =
  | "purpose"
  | "what-stands-out"
  | "decision-or-tension-frame"
  | "questions-worth-asking"
  | "best-supported-next-move"
  | "what-would-change-the-view"
  | "what-to-capture";

export type PersonalRoomSheetSourceRoleV1 = "occurrence-purpose" | "b11-first-surface" | "candidate1-assessment" | "fixed-capture-prompt";
export type PersonalRoomSheetItemV1 = {
  itemId: string;
  text: string;
  sourceRole: PersonalRoomSheetSourceRoleV1;
  sourceIdentity: string;
  lineage: string[];
  permissionScope: { organizationId: string; questionId: string };
  upstreamDigest: string;
};
export type PersonalRoomSheetSectionV1 = { sectionId: PersonalRoomSheetSectionIdV1; label: string; items: PersonalRoomSheetItemV1[] };

export type PersonalRoomSheetViewV1 = {
  contractVersion: typeof PERSONAL_ROOM_SHEET_CONTRACT_VERSION;
  authority: "non-authoritative-personal-product-material";
  organizationId: string;
  currentUserId: string;
  seriesId: string;
  occurrenceId: string;
  productQuestionId: string;
  boundaryLabel: typeof PERSONAL_ROOM_SHEET_BOUNDARY_LABEL;
  sourceProjectionDigest: string;
  candidate1AssessmentDigest: string;
  b11CommunicationDigest: string;
  sections: PersonalRoomSheetSectionV1[];
  omitted: Array<{ sectionId: PersonalRoomSheetSectionIdV1; reason: "unsupported-empty" | "duplicate" | "section-limit" }>;
  personalRoomSheetDigest: string;
};

export type ContentSafePersonalRoomSheetItemV1 = Pick<PersonalRoomSheetItemV1, "itemId" | "text">;
export type ContentSafePersonalRoomSheetViewV1 = Pick<PersonalRoomSheetViewV1,
  "contractVersion" | "authority" | "boundaryLabel" | "sourceProjectionDigest" | "candidate1AssessmentDigest" | "b11CommunicationDigest" | "personalRoomSheetDigest"
> & { sections: Array<{ sectionId: PersonalRoomSheetSectionIdV1; label: string; items: ContentSafePersonalRoomSheetItemV1[] }> };

export type PersonalRoomSheetConfirmationRequestV1 = {
  contractVersion: typeof PERSONAL_ROOM_SHEET_CONTRACT_VERSION;
  occurrenceRef: string;
  expectedSourceProjectionDigest: string;
  expectedCandidate1AssessmentDigest: string;
  expectedB11CommunicationDigest: string;
  expectedPersonalRoomSheetDigest: string;
  requestSequence: number;
};
export type PersonalRoomSheetConfirmationResponseV1 = {
  contractVersion: typeof PERSONAL_ROOM_SHEET_CONTRACT_VERSION;
  sheet: ContentSafePersonalRoomSheetViewV1;
  personalRoomSheetDigest: string;
  confirmationDigest: string;
  requestSequence: number;
};

export function serializePersonalRoomSheetPlainText(sheet: ContentSafePersonalRoomSheetViewV1): string {
  return [sheet.boundaryLabel, ...sheet.sections.flatMap(section => ["", section.label, ...section.items.map(item => item.text)])].join("\n");
}
