import { Theme } from "./themes";
import { V2Explanation, V2Tension } from "./reasoning";

export interface V2ExecutiveBrief {
  headline: string;
  summary: string;
  topExplanation: string;
  tensions: string[];
  recommendedQuestions: string[];
  nextMoves: string[];
}

export function createExecutiveBriefV2(input: {
  themes: Theme[];
  tensions: V2Tension[];
  explanations: V2Explanation[];
}): V2ExecutiveBrief {
  const topExplanation = input.explanations[0];

  return {
    headline: topExplanation?.title || "No dominant explanation yet",

    summary: topExplanation
      ? topExplanation.explanation
      : "The evidence is not yet strong enough to form a confident executive explanation.",

    topExplanation: topExplanation?.explanation || "More evidence is needed.",

    tensions: input.tensions.map((tension) => tension.title),

    recommendedQuestions: [
      "What evidence would most strengthen or weaken the leading explanation?",
      "Which customer segment is most affected by the identified friction?",
      "Which strategic bet has the clearest measurable link to retention?",
    ],

    nextMoves: [
      "Collect evidence that directly tests the leading explanation.",
      "Separate customer friction by pricing, content fatigue, and plan confusion.",
      "Compare retention impact across ads, games, and live events.",
    ],
  };
}