import type { RecoveredProposition } from "./contracts";
import type { CollapsedRecoveredGraph, ExplicitDuplicateGroup } from "./phase2Contracts";
import { canonicalHash } from "./canonicalSerialization";

export const DUPLICATE_COLLAPSE_VERSION = "duplicate-collapse/v1" as const;

const canonicalStructure = (item: RecoveredProposition) => JSON.stringify({ family: item.family, subjectRefs: [...item.subjectRefs].sort(), predicate: item.predicate, objectRefs: [...item.objectRefs].sort(), polarity: item.polarity, modality: item.modality, temporality: item.temporality, normalizedConfidence: item.normalizedConfidence, supportingEvidenceRefs: [...item.supportingEvidenceRefs].sort(), opposingEvidenceRefs: [...item.opposingEvidenceRefs].sort(), relatedPropositionRefs: [...item.relatedPropositionRefs].sort(), authorizationScope: [...item.authorizationScope].sort() });

export function collapseExplicitDuplicates(input: { graph: CollapsedRecoveredGraph | Omit<CollapsedRecoveredGraph, "collapsedMemberIds" | "duplicateAuditAncestry">; groups: ExplicitDuplicateGroup[] }): CollapsedRecoveredGraph {
  const byId = new Map(input.graph.propositions.map((item) => [item.id, item]));
  const collapsed = new Set<string>();
  const ancestry = new Map<string, CollapsedRecoveredGraph["duplicateAuditAncestry"][number]>();
  const retainAncestry = (canonical: RecoveredProposition, member: RecoveredProposition, basis: "explicit-group" | "exact-structured-equality") => ancestry.set(member.id, { canonicalRecoveredPropositionId: canonical.id, memberRecoveredPropositionId: member.id, basis, canonicalSourceClaimRefs: [...canonical.sourceClaimRefs].sort(), memberSourceClaimRefs: [...member.sourceClaimRefs].sort(), canonicalPropositionHash: canonicalHash(canonical), memberPropositionHash: canonicalHash(member) });
  for (const group of [...input.groups].sort((a, b) => a.canonicalRecoveredPropositionId.localeCompare(b.canonicalRecoveredPropositionId))) {
    const canonical = byId.get(group.canonicalRecoveredPropositionId);
    if (!canonical) throw new Error("Duplicate group canonical proposition is missing.");
    for (const memberId of [...new Set(group.memberRecoveredPropositionIds)].sort()) {
      if (memberId === canonical.id) continue;
      const member = byId.get(memberId);
      if (!member) throw new Error("Duplicate group member is missing.");
      if (canonicalStructure(canonical) !== canonicalStructure(member)) throw new Error("Explicit duplicates have incompatible structured meaning or scope.");
      collapsed.add(memberId);
      retainAncestry(canonical, member, "explicit-group");
    }
  }
  const seen = new Map<string, string>();
  for (const item of [...input.graph.propositions].sort((a, b) => a.id.localeCompare(b.id))) {
    if (collapsed.has(item.id)) continue;
    const key = canonicalStructure(item);
    const first = seen.get(key);
    if (first) { collapsed.add(item.id); retainAncestry(byId.get(first)!, item, "exact-structured-equality"); } else seen.set(key, item.id);
  }
  const explicitMetadata = input.groups.map((group) => ({ canonicalRecoveredPropositionId: group.canonicalRecoveredPropositionId, duplicateCount: group.memberRecoveredPropositionIds.filter((id) => id !== group.canonicalRecoveredPropositionId).length, duplicatedSurfaceForms: group.memberRecoveredPropositionIds.filter((id) => id !== group.canonicalRecoveredPropositionId).map((id) => byId.get(id)?.recoveredMeaning ?? id).sort() }));
  const metadata = [...input.graph.duplicates, ...explicitMetadata].sort((a, b) => a.canonicalRecoveredPropositionId.localeCompare(b.canonicalRecoveredPropositionId));
  return { ...input.graph, propositions: input.graph.propositions.filter((item) => !collapsed.has(item.id)).sort((a, b) => a.id.localeCompare(b.id)), duplicates: metadata, collapsedMemberIds: [...collapsed].sort(), duplicateAuditAncestry: [...ancestry.values()].sort((a, b) => a.memberRecoveredPropositionId.localeCompare(b.memberRecoveredPropositionId)) };
}
