import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "./ExecutiveBriefing";

type LivingUnderstandingsProps = {
  executiveDashboard: ExecutiveDashboard;
  livingUnderstandings?: FocusedUnderstanding[];
  focusedUnderstanding?: FocusedUnderstanding | null;
  onFocusUnderstanding?: (id: string) => void;
};

type LivingUnderstandingItem = FocusedUnderstanding & {
  summary?: string;
};

function normalizeConfidence(value?: number): string {
  if (value === undefined) return "—";

  const normalized = value <= 1 ? value * 100 : value;

  return `${Math.round(normalized)}%`;
}

function cleanSentence(value: string | undefined, fallback: string) {
  if (!value) return fallback;

  const cleaned = value.replace(/\s+/g, " ").trim();
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];

  return firstSentence.length > 88
    ? `${firstSentence.slice(0, 85)}...`
    : firstSentence;
}

function getTrajectory(index: number) {
  if (index === 0) return "Strengthening";
  if (index === 1) return "Evolving";
  if (index === 2) return "Stable";
  return "Tracked";
}

function getSparkBars(index: number) {
  if (index === 0) return [18, 28, 38, 52, 68, 82];
  if (index === 1) return [34, 38, 42, 52, 64, 72];
  if (index === 2) return [60, 60, 58, 64, 61, 66];
  return [28, 36, 46, 58, 70, 78];
}

export default function LivingUnderstandings({
  executiveDashboard,
  livingUnderstandings,
  focusedUnderstanding,
  onFocusUnderstanding,
}: LivingUnderstandingsProps) {
  const keyInsights = executiveDashboard.keyInsights ?? [];
  const stateItems = executiveDashboard.currentOrganizationalState ?? [];

  const fallbackUnderstandings: LivingUnderstandingItem[] =
    keyInsights.length > 0
      ? keyInsights.slice(0, 8).map((item, index) => ({
          id: `fallback-insight-${index}`,
          title: item.title,
          summary: item.summary,
          confidence: item.confidence,
          state: getTrajectory(index),
          tracked: true,
        }))
      : stateItems.slice(0, 8).map((item, index) => ({
          id: `fallback-state-${index}`,
          title: item.title,
          summary: item.summary,
          confidence: item.confidence,
          state: getTrajectory(index),
          tracked: true,
        }));

  const understandings: LivingUnderstandingItem[] =
    livingUnderstandings && livingUnderstandings.length > 0
      ? livingUnderstandings
      : fallbackUnderstandings;

  return (
    <section className="briefing-section living-understandings-v2">
      <div className="briefing-section-header">
        <div>
          <p className="briefing-eyebrow">Living Understandings</p>
          <h2>What Discovery is continuing to watch.</h2>
        </div>

        <span className="briefing-count-pill">
          {understandings.length} tracked
        </span>
      </div>

      <div className="living-understanding-list-v2">
        {understandings.length === 0 ? (
          <article className="living-understanding-empty-v2">
            <h3>No living understandings yet</h3>
            <p>
              Continue adding evidence and Discovery will begin tracking the
              organizational understandings that matter over time.
            </p>
          </article>
        ) : (
          understandings.map((item, index) => {
            const isFocused = focusedUnderstanding?.id === item.id;
            const bars = getSparkBars(index);

            return (
              <button
                className={`living-understanding-row-v2 ${
                  isFocused ? "is-focused" : ""
                }`}
                key={item.id}
                type="button"
                onClick={() => onFocusUnderstanding?.(item.id)}
              >
                <span className="living-understanding-main-v2">
                  <strong>{item.title}</strong>
                  <small>
                    {cleanSentence(
                      item.summary,
                      "Discovery is tracking this understanding over time.",
                    )}
                  </small>
                </span>

                <span className="living-understanding-state-v2">
                  {item.state ?? getTrajectory(index)}
                </span>

                <span className="living-understanding-spark-v2">
                  {bars.map((height, barIndex) => (
                    <span
                      key={`${item.id}-bar-${barIndex}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </span>

                <span className="living-understanding-confidence-v2">
                  {normalizeConfidence(item.confidence)}
                </span>

                <span className="living-understanding-tracked-v2">
                  {item.tracked === false ? "Watch" : "Tracked"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}