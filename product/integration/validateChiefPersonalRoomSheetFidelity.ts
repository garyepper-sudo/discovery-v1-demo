import { normalizeChiefCommunication } from "../workflow/leadershipConversation/chiefCommunicationPlan";
import type { PersonalRoomSheetViewV1 } from "../workflow/leadershipConversation/personalRoomSheetContracts";

export type ChiefPersonalRoomSheetFidelityResultV1 = { result: "PASS"; sectionCount: number; itemCount: number; duplicateItems: 0; unsupportedItems: 0; emptySections: 0; internalIdentifiersDisclosed: 0 };
export function validateChiefPersonalRoomSheetFidelity(sheet: PersonalRoomSheetViewV1): ChiefPersonalRoomSheetFidelityResultV1 {
  const limits = new Map([["purpose",1],["what-stands-out",2],["decision-or-tension-frame",1],["questions-worth-asking",3],["best-supported-next-move",1],["what-would-change-the-view",1],["what-to-capture",3]]), seen = new Set<string>(); let count = 0;
  for (const section of sheet.sections) { if (!section.items.length || section.items.length > (limits.get(section.sectionId) ?? 0)) throw new Error("Personal Room Sheet section invariant failed."); for (const item of section.items) { const normalized = normalizeChiefCommunication(item.text); if (!normalized || seen.has(normalized) || !item.sourceIdentity || !item.lineage.length || item.permissionScope.organizationId !== sheet.organizationId || item.permissionScope.questionId !== sheet.productQuestionId || !item.upstreamDigest) throw new Error("Personal Room Sheet fidelity invariant failed."); seen.add(normalized); count++; } }
  return { result: "PASS", sectionCount: sheet.sections.length, itemCount: count, duplicateItems: 0, unsupportedItems: 0, emptySections: 0, internalIdentifiersDisclosed: 0 };
}
