import type { OrganizationalUnderstandingState } from "../../runtime/organizationalUnderstandingState";
import type { PersistentBelief } from "../../understanding/types";
import type {
  OrganizationalMemoryMaturity,
  OrganizationalTheory,
  OrganizationalTheoryEvolution,
  UnderstandingEvolution,
} from "./organizationalTheories";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationSeed,
} from "../judgment/organizationalJudgment";

export type OrganizationalMemory = {
  beliefs: PersistentBelief[];
  theories: OrganizationalTheory[];
  organizationalExplanationSeeds?: OrganizationalExplanationSeed[];
  organizationalExplanations?: OrganizationalExplanation[];
  theoryEvolution: OrganizationalTheoryEvolution[];
  understandingEvolution: UnderstandingEvolution | null;
  maturity: OrganizationalMemoryMaturity | null;
  understandingState: OrganizationalUnderstandingState;
  lastUpdatedAt: string;
};
