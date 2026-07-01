import { CognitiveAtom } from "./types";

export type Belief = {
  id: string;
  statement: string;

  confidence: number;

  supportingEvidence: string[];
  opposingEvidence: string[];

  assumptions: string[];

  evidenceNeeded: string[];

  status: "emerging" | "supported" | "uncertain";

  reasoning: string;
};

export function buildBeliefs(
  atoms: CognitiveAtom[]
): Belief[] {

  const beliefs: Belief[] = [];

  const text = atoms.map(a => a.subject.toLowerCase());

  if (text.some(t => t.includes("executive"))) {
    beliefs.push({
      id: "executive-os",
      statement:
        "Discovery may ultimately become an Executive Operating System.",

      confidence: 72,

      supportingEvidence: [
        "Executive OS",
        "Understanding Engine",
        "Leadership workflow"
      ],

      opposingEvidence: [
        "Product positioning remains unclear"
      ],

      assumptions: [
        "Executives want continuous strategic understanding."
      ],

      evidenceNeeded: [
        "Executive interviews",
        "Usage sessions",
        "Retention"
      ],

      status: "supported",

      reasoning:
        "Multiple concepts point toward an executive operating model."
    });
  }

  if (text.some(t => t.includes("government"))) {

    beliefs.push({

      id: "government-market",

      statement:
        "Government may become a strong secondary market.",

      confidence: 58,

      supportingEvidence: [
        "Government",
        "Research",
        "Decision support"
      ],

      opposingEvidence: [
        "CEO market remains primary."
      ],

      assumptions: [
        "Government organizations face similar complexity."
      ],

      evidenceNeeded: [
        "Customer interviews",
        "Use cases"
      ],

      status: "emerging",

      reasoning:
        "Government appears repeatedly but lacks validating evidence."
    });

  }

  return beliefs;
}