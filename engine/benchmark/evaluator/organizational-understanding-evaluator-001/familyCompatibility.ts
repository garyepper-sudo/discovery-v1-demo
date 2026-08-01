import type { PropositionFamily } from "./contracts";
import { propositionFamilies } from "./frozenSemantics";

export const FAMILY_COMPATIBILITY_VERSION = "proposition-family-compatibility/v1" as const;
export const familyCompatibilityMatrix = Object.freeze(Object.fromEntries(propositionFamilies.map((family) => [family, Object.freeze(propositionFamilies.filter((candidate) => candidate === family))])) as Record<PropositionFamily, readonly PropositionFamily[]>);
export const familiesCompatible = (groundTruth: PropositionFamily, recovered: PropositionFamily) => familyCompatibilityMatrix[groundTruth].includes(recovered);
