import type { ExecutiveNarrativeContinuity } from "../executiveState";

const executiveLanguageMap: Record<string, string> = {
  "Leadership Dependency": "Critical decisions depend on too few people.",
  "Organizational Continuity Failure":
    "Knowledge transfer is becoming a business continuity risk.",
  "Cross Functional Execution Friction":
    "Teams are struggling to coordinate effectively.",
};

export function translateExecutiveTitle(title: string): string {
  return executiveLanguageMap[title] ?? title;
}

export function translateExecutiveSummary(summary: string): string {
  return summary
    .replaceAll("Discovery identified", "Discovery noticed")
    .replaceAll("Discovery believes", "Discovery is still testing whether")
    .replaceAll("Discovery strengthened", "Discovery strengthened")
    .replaceAll("Discovery detected", "Discovery noticed")
    .replaceAll("organizational theories", "stable organizational patterns")
    .replaceAll("organizational beliefs", "operating assumptions");
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