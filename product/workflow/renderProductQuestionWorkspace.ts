import type { ProductQuestionWorkspace } from "./contracts";
import { customerModelDevelopmentalState } from "./customerLanguage";

function section(title: string, lines: Array<string | null | undefined>): string {
  const content = lines.filter((line): line is string => Boolean(line?.trim()));
  return content.length ? `## ${title}\n\n${content.join("\n")}` : "";
}

export function renderProductQuestionWorkspace(workspace: ProductQuestionWorkspace): string {
  const answer = workspace.answer?.kind === "answer" ? workspace.answer : null;
  const abstention = workspace.answer?.kind === "abstention" ? workspace.answer : null;
  const rendered = [
    section("Question", [workspace.question.text]),
    section("Information Reviewed", [
      workspace.searchPlan?.status === "authorization_required"
        ? "Permission is required before connected records can be reviewed."
        : workspace.searchPlan?.status === "completed"
          ? "The available authorized information has been reviewed."
          : workspace.searchPlan?.status === "ready"
            ? "Add information to begin."
            : null,
      ...(workspace.searchPlan?.limitations ?? []).map((item) => `- ${item}`),
    ]),
    section("Answer", [answer?.conclusion, abstention?.explanation]),
    section("Confidence", answer ? [
      `${answer.confidence.level}${answer.confidence.score === null ? "" : ` — ${Math.round(answer.confidence.score * 100)}%`}`,
      answer.confidence.meaning,
      `Main limitation: ${answer.confidence.principalLimiter}`,
    ] : []),
    section("Why It Matters", [answer?.whyItMatters]),
    section("Discriminating Evidence", answer?.discriminatingEvidence.map((item) => `- ${item.statement}`) ?? []),
    section("What Remains Uncertain", [
      answer?.principalLimiter ?? abstention?.principalLimiter,
      ...(answer?.unresolvedAlternatives.map((item) => `- ${item.explanation}`) ?? []),
    ]),
    section("Best Way to Improve Understanding", [
      answer?.bestNextImprovement?.title ?? abstention?.bestNextImprovement?.title,
      answer?.bestNextImprovement?.reason ?? abstention?.bestNextImprovement?.reason,
    ]),
    section("Decision", [
      workspace.activeDecision
        ? `${workspace.activeDecision.status}: ${workspace.activeDecision.intervention}`
        : workspace.decisionDraft
          ? `${workspace.decisionDraft.readiness === "not_ready" ? "Not ready to commit" : "Ready for review"}: ${workspace.decisionDraft.intervention}`
          : null,
    ]),
    section("Outcome", [
      workspace.latestOutcomeReview?.status === "too_early"
        ? "It is too early to judge this decision."
        : workspace.latestOutcomeReview?.status?.replaceAll("_", " "),
      workspace.latestOutcomeReview?.interpretation,
    ]),
    section("Organizational Model Change", [
      workspace.latestChange?.summary,
      `The organizational model ${customerModelDevelopmentalState(workspace.modelState.developmentalState)}.`,
      ...workspace.modelState.latestMeaningfulGrowth.map((item) => `- ${item}`),
    ]),
    section("Proactive Insights", workspace.proactiveInsights.map((item) => `- ${item.conclusion}`)),
  ].filter(Boolean);
  return rendered.join("\n\n");
}
