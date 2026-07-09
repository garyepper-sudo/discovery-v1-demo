import type { ExecutiveNarrativeContinuity } from "../executiveState";

const executiveLanguageMap: Record<string, string> = {
  "Leadership Dependency": "Critical decisions depend on too few people.",
  "Organizational Continuity Failure":
    "Knowledge transfer is becoming a business continuity risk.",
  "Cross Functional Execution Friction":
    "Teams are struggling to coordinate effectively.",
  "Decision Flow": "Decision ownership is shaping execution speed.",
  "Decision flow is becoming more visible":
    "Discovery increasingly explains execution delays through decision ownership rather than isolated approval bottlenecks.",
};

export function translateExecutiveTitle(title: string): string {
  return executiveLanguageMap[title] ?? title;
}

export function translateExecutiveSummary(summary: string): string {
  return summary
    .replaceAll(
      "Discovery identified",
      "Discovery now explains",
    )
    .replaceAll(
      "Discovery detected",
      "Discovery now explains",
    )
    .replaceAll(
      "Discovery noticed",
      "Discovery is beginning to explain",
    )
    .replaceAll(
      "Discovery believes",
      "Discovery is currently testing the explanation that",
    )
    .replaceAll(
      "is becoming more visible",
      "is becoming a stronger explanation for how the organization operates",
    )
    .replaceAll(
      "stronger signals that",
      "stronger support for the explanation that",
    )
    .replaceAll(
      "this pattern is becoming more visible",
      "this explanation is becoming more coherent across the organization",
    )
    .replaceAll(
      "pattern worth continuing to watch",
      "possible explanation worth testing across future investigations",
    )
    .replaceAll(
      "organizational theories",
      "stable organizational explanations",
    )
    .replaceAll(
      "organizational beliefs",
      "operating assumptions",
    );
}

export function translateExecutiveContinuity(
  continuity?: ExecutiveNarrativeContinuity,
): ExecutiveNarrativeContinuity | undefined {
  if (!continuity) return undefined;

  return {
    ...continuity,
    whatChanged: continuity.whatChanged.map(translateExecutiveSummary),
    whyChanged: continuity.whyChanged.map(translateExecutiveSummary),
    history: continuity.history.map((revision) => ({
      ...revision,
      headline: translateExecutiveTitle(revision.headline),
      summary: translateExecutiveSummary(revision.summary),
    })),
  };
}