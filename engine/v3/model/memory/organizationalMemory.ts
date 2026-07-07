import type { OrganizationalUnderstandingState } from "../../runtime/organizationalUnderstandingState";
import type { PersistentBelief } from "../../understanding/types";
import type {
  OrganizationalMemoryMaturity,
  OrganizationalTheory,
  OrganizationalTheoryEvolution,
  UnderstandingEvolution,
} from "./organizationalTheories";

export type OrganizationalMemory = {
  beliefs: PersistentBelief[];
  theories: OrganizationalTheory[];
  theoryEvolution: OrganizationalTheoryEvolution[];
  understandingEvolution: UnderstandingEvolution | null;
  maturity: OrganizationalMemoryMaturity | null;
  understandingState: OrganizationalUnderstandingState;
  lastUpdatedAt: string;
};