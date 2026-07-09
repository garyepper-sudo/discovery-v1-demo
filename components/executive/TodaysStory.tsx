import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "./ExecutiveBriefing";
import { buildExecutiveNarrative } from "./buildExecutiveNarrative";

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
  const story = executiveDashboard.conversation?.currentOrganizationalStory;
  const primaryNarrative = executiveDashboard.narratives?.[0];

  const narrative = buildExecutiveNarrative(focusedUnderstanding);

  const confidence = focusedUnderstanding
    ? formatConfidence(focusedUnderstanding.confidence)
    : "72%";

  const state = focusedUnderstanding
    ? formatState(focusedUnderstanding.trajectory ?? focusedUnderstanding.state)
    : "Updated";

  const storyItems =
    story?.items?.length > 0
      ? story.items
      : primaryNarrative
        ? [primaryNarrative.businessImpact, primaryNarrative.executiveConversation]
        : [];

  return (
    <section className="briefing-section todays-story-v2">
      <p className="briefing-eyebrow">Today’s Story</p>

      <div className="todays-story-card-v2">
        <div className="todays-story-focus-v2">
          <span>Focused understanding</span>

          <strong>
            {focusedUnderstanding?.title ?? "Current organization story"}
          </strong>
        </div>

        <h2>{narrative.confidenceNarrative}</h2>

        <p>{narrative.whyItMatters}</p>

        <div className="todays-story-metrics-v2">
          <span>{confidence} confidence</span>
          <span>
            {focusedUnderstanding?.tracked === false ? "Watching" : "Tracked"}
          </span>
          <span>{state}</span>
        </div>

        {storyItems.length > 0 && (
          <div className="story-support-list-v2">
            {storyItems
              .filter(Boolean)
              .slice(0, 3)
              .map((item, index) => (
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