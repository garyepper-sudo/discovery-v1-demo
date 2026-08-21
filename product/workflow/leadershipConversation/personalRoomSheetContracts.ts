import type { ChiefFirstPrepareViewV1 } from "./contracts";

export const PERSONAL_ROOM_SHEET_CONTRACT_VERSION = "1" as const;
export const PERSONAL_ROOM_SHEET_BOUNDARY_LABEL = "Only you can see this working sheet. It is preparation, not a meeting record." as const;
export const PERSONAL_ROOM_SHEET_EXPLANATION = "Nothing here enters Capture unless you explicitly contribute it." as const;
export const PERSONAL_ROOM_SHEET_CONFIRMATION_TEXT = "I reviewed this private working view." as const;

export function stabilizePersonalRoomSheetPrepareInput(view: ChiefFirstPrepareViewV1): ChiefFirstPrepareViewV1 {
  return view.currentStep === "freeze" ? view : { ...view, currentStep: "freeze" };
}

export function createPersonalRoomSheetReplayKey(seedDigest: string, currentUserId: string): string {
  if (!seedDigest || !currentUserId) throw new Error("Personal Room Sheet replay identity is unavailable.");
  return `candidate3a-route:${seedDigest}:${currentUserId}`;
}

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

export function resolvePersonalRoomSheetContribution(
  sheet: ContentSafePersonalRoomSheetViewV1,
  input: { expectedPersonalRoomSheetDigest: string; selectedItemIds: string[] },
): string[] {
  if (input.expectedPersonalRoomSheetDigest !== sheet.personalRoomSheetDigest || !input.selectedItemIds.length) {
    throw new Error("Private Working contribution is stale or invalid.");
  }
  const items = new Map(sheet.sections.flatMap(section => section.items).map(item => [item.itemId, item.text]));
  const selected = [...new Set(input.selectedItemIds)];
  if (selected.length !== input.selectedItemIds.length || selected.some(itemId => !items.has(itemId))) {
    throw new Error("Private Working contribution is stale or invalid.");
  }
  return selected.map(itemId => items.get(itemId)!);
}

export type PersonalRoomSheetContributionActionState<TWorkspace> = {
  checkpointId: string | null;
  contributionArtifactIds: string[];
  workspace: TWorkspace;
  error: string | null;
};

export function reconstructPersonalRoomSheetContributionActionState<TWorkspace>(
  previous: PersonalRoomSheetContributionActionState<TWorkspace>,
  result: { checkpointId: string; contributionArtifactIds: string[]; workspace: TWorkspace },
): PersonalRoomSheetContributionActionState<TWorkspace> {
  return { checkpointId: result.checkpointId, contributionArtifactIds: [...result.contributionArtifactIds], workspace: result.workspace, error: null };
}

export function serializePersonalRoomSheetPlainText(sheet: ContentSafePersonalRoomSheetViewV1): string {
  return [sheet.boundaryLabel, ...sheet.sections.flatMap(section => ["", section.label, ...section.items.map(item => item.text)])].join("\n");
}
