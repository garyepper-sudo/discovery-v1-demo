import { StrategicTension } from "./types";

export type Hypothesis = {
  title: string;
  explanation: string;
  confidence: number;
  supportingEvidence: string[];
  evidenceNeeded: string[];
};

export function generateHypotheses(tensions: StrategicTension[]): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  for (const tension of tensions) {
    if (tension.title === "Adoption Strategy") {
      hypotheses.push({
        title: "Immediate clarity may be the required wedge",
        explanation:
          "The product may need to prove value quickly before users will trust or return for deeper compounding intelligence.",
        confidence: 0.72,
        supportingEvidence: [tension.left, tension.right],
        evidenceNeeded: [
          "First-session user reactions",
          "Time-to-value testing",
          "Repeat usage behavior",
        ],
      });
    }

    if (tension.title === "Market Focus") {
      hypotheses.push({
        title: "The initial market may be too broad",
        explanation:
          "The engine is detecting multiple possible buyer groups, which may indicate opportunity but also positioning risk.",
        confidence: 0.66,
        supportingEvidence: [tension.left, tension.right],
        evidenceNeeded: [
          "CEO interview data",
          "Government use-case validation",
          "Buyer urgency comparison",
        ],
      });
    }

    if (tension.title === "Product Positioning") {
      hypotheses.push({
        title: "The product category may still be unstable",
        explanation:
          "Multiple product framings may be competing with each other, making it harder for buyers to understand what Discovery is.",
        confidence: 0.7,
        supportingEvidence: [tension.left, tension.right],
        evidenceNeeded: [
          "Messaging test results",
          "Investor comprehension feedback",
          "Demo recall analysis",
        ],
      });
    }
  }

  if (hypotheses.length === 0) {
    hypotheses.push({
      title: "No strong hypothesis formed yet",
      explanation:
        "The engine detected insufficient strategic tension to form a meaningful explanatory hypothesis.",
      confidence: 0.35,
      supportingEvidence: [],
      evidenceNeeded: [
        "More customer feedback",
        "More market evidence",
        "More contradiction-rich input",
      ],
    });
  }

  return hypotheses;
}