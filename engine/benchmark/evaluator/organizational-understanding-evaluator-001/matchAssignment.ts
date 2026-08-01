import type { SemanticAdjudication } from "./contracts";
import type { SelectedAdjudicationEdge } from "./phase2Contracts";

export const MATCH_ASSIGNMENT_VERSION = "one-to-one-assignment/v1" as const;

const creditClassifications = new Set(["exact", "equivalent", "partial", "overgeneralized", "undergeneralized", "contradictory"]);

export function assignCompletedAdjudications(adjudications: SemanticAdjudication[]): SelectedAdjudicationEdge[] {
  const ordered = [...adjudications].sort((a, b) => a.groundTruthPropositionId.localeCompare(b.groundTruthPropositionId) || (a.recoveredPropositionId ?? "").localeCompare(b.recoveredPropositionId ?? "") || a.adjudicationId.localeCompare(b.adjudicationId));
  const groundTruth = new Set<string>(), recovered = new Set<string>();
  for (const item of ordered) {
    if (item.classification === "ambiguous" || item.requiresHumanReview) throw new Error("Unresolved adjudication cannot be assigned.");
    if (!creditClassifications.has(item.classification)) continue;
    if (!item.recoveredPropositionId) throw new Error("Credit-bearing adjudication lacks a recovered proposition.");
    if (groundTruth.has(item.groundTruthPropositionId) || recovered.has(item.recoveredPropositionId)) throw new Error("Conflicting one-to-one adjudications require prior resolution.");
    groundTruth.add(item.groundTruthPropositionId); recovered.add(item.recoveredPropositionId);
  }
  return ordered.map((adjudication) => ({ adjudication, groundTruthPropositionId: adjudication.groundTruthPropositionId, recoveredPropositionId: adjudication.recoveredPropositionId, selected: creditClassifications.has(adjudication.classification), ...(!creditClassifications.has(adjudication.classification) ? { rejectionReason: `non-credit classification: ${adjudication.classification}` } : {}) }));
}
