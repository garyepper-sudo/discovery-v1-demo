import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "./ExecutiveBriefing";

type TodaysStoryProps = {
  executiveDashboard: ExecutiveDashboard;
  focusedUnderstanding?: FocusedUnderstanding | null;
};

function formatConfidence(value: unknown) {
  if (typeof value === "number" && value > 0) {
    const normalized = value <= 1 ? value * 100 : value;
    return `${Math.round(normalized)}%`;
  }

  if (typeof value === "string" && value.trim()) {
    return value.includes("%") ? value : `${value}%`;
  }

  return "72%";
}

function formatState(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "Strengthening";

  const normalized = value.replace(/[_-]/g, " ").trim();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

export default function TodaysStory({
  executiveDashboard,
  focusedUnderstanding,
}: TodaysStoryProps) {
  const interpretation = executiveDashboard.interpretation;

  const confidence = focusedUnderstanding
    ? formatConfidence(focusedUnderstanding.confidence)
    : formatConfidence(executiveDashboard.hero.organizationConfidence);

  const state = focusedUnderstanding
    ? formatState(focusedUnderstanding.trajectory ?? focusedUnderstanding.state)
    : "Updated";

  const explanationItems = [
    interpretation.explanationEvolution,
    interpretation.confidenceNarrative,
    interpretation.competingExplanationNarrative,
    interpretation.remainingUncertainty,
  ].filter(Boolean);

  return (
    <section className="briefing-section todays-story-v2">
      <p className="briefing-eyebrow">Current Explanation</p>

      <div className="todays-story-card-v2">
        <div className="todays-story-focus-v2">
          <span>Focused understanding</span>

          <strong>
            {focusedUnderstanding?.title ?? "Current organizational theory"}
          </strong>
        </div>

        <h2>{interpretation.currentMentalModel}</h2>

        <p>{interpretation.executiveSummary}</p>

        <div className="todays-story-metrics-v2">
          <span>{confidence} confidence</span>
          <span>
            {focusedUnderstanding?.tracked === false ? "Watching" : "Tracked"}
          </span>
          <span>{state}</span>
        </div>

        {explanationItems.length > 0 && (
          <div className="story-support-list-v2">
            {explanationItems.slice(0, 4).map((item, index) => (
              <article key={index}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}