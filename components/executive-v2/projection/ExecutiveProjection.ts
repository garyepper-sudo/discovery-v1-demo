export type ExecutiveEvolutionMilestone = {
  id: string;
  label: string;
  description: string;
  isCurrent: boolean;
};

export type ExecutiveAttentionSeverity =
  | "low"
  | "medium"
  | "high";

export type ExecutiveProjection = {
  /**
   * Executive workspace metadata.
   *
   * These values describe the current executive session,
   * not Discovery's cognitive state.
   */
  workspace: {
    title: string;
    status: string;
    updatedLabel: string | null;
  };

  /**
   * Discovery's current leading organizational understanding.
   */
  currentUnderstanding: {
    belief: string;
    mindStatus: string;
    confidence: number;
    organizationalCoherence: number;
  };

  /**
   * Executive explanation of the current understanding.
   */
  explanation: {
    why: string;
    whatCouldChangeThis: string;
    nextMove: string;
  };

  /**
   * The single highest-priority item that deserves
   * executive attention right now.
   */
  executiveAttention: {
    title: string;
    summary: string;
    severity: ExecutiveAttentionSeverity;
  };

  /**
   * How Discovery arrived at its current understanding.
   */
  evolution: {
    milestones: ExecutiveEvolutionMilestone[];
  };
};