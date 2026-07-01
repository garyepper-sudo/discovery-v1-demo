import { EngineResult } from "./types";

export interface UnderstandingObject {
  currentBelief: {
    title: string;
    summary: string;
    confidence: number;
  };

  supportingThemes: {
    title: string;
    description: string;
    confidence: number;
  }[];

  competingExplanations: {
    title: string;
    summary: string;
    confidence: number;
  }[];

  nextBestAction: {
    title: string;
    explanation: string;
  };

  nextEvidence: {
    title: string;
    why: string;
    potentialLift: number;
  };

  reasoning: {
    evidenceCount: number;
    strongestSignals: string[];
    keyTensions: string[];
  };
}

export function buildUnderstanding(
  result: EngineResult
): UnderstandingObject {

  const belief =
    result.beliefs?.[0] ??
    {
      statement: "No stable belief formed.",
      reasoning: "Insufficient evidence.",
      confidence: 0,
    };

  return {

    currentBelief: {
      title: belief.statement,
      summary: belief.reasoning,
      confidence: belief.confidence,
    },

    supportingThemes:
      (result.workspace?.clusters ?? [])
        .slice(0, 3)
        .map(cluster => ({
          title: cluster.title,
          description: cluster.theme,
          confidence: cluster.confidence,
        })),

    competingExplanations:
      (result.hypotheses ?? [])
        .slice(0, 3)
        .map(h => ({
          title: h.title,
          summary: h.explanation,
          confidence: h.confidence,
        })),

    nextBestAction: {
      title:
        result.brief?.recommendedNextMoves?.[0] ??
        "Collect additional evidence",

      explanation:
        result.brief?.leadershipQuestions?.[0] ??
        "Reduce uncertainty before acting.",
    },

    nextEvidence: {
      title:
        result.hypotheses?.[0]?.evidenceNeeded?.[0] ??
        "Gather higher quality evidence.",

      why:
        "This evidence is expected to change the current belief the most.",

      potentialLift: Math.min(
        belief.confidence + 15,
        100
      ),
    },

    reasoning: {

      evidenceCount:
        result.workspace?.evidenceCount ?? 0,

      strongestSignals:
        (result.signals ?? [])
          .slice(0, 5)
          .map(s => s.title),

      keyTensions:
        (result.tensions ?? [])
          .slice(0, 3)
          .map(t => t.title),

    },

  };
}