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

function buildInterpretationUnderstandings(
  executiveDashboard: ExecutiveDashboard,
): LivingUnderstandingItem[] {
  const interpretation = executiveDashboard.interpretation;
  const confidence = executiveDashboard.hero.organizationConfidence;

  return [
    {
      id: "current-explanation",
      title: "Current Explanation",
      summary: interpretation.currentExplanation,
      confidence,
      state: "Strengthening",
      tracked: true,
    },
    {
      id: "organizational-theory",
      title: "Organizational Theory",
      summary: interpretation.organizationalTheory,
      confidence,
      state: "Evolving",
      tracked: true,
    },
    {
      id: "current-mental-model",
      title: "Current Mental Model",
      summary: interpretation.currentMentalModel,
      confidence,
      state: "Tracked",
      tracked: true,
    },
    {
      id: "remaining-uncertainty",
      title: "Remaining Uncertainty",
      summary: interpretation.remainingUncertainty,
      confidence,
      state: "Watch",
      tracked: true,
    },
  ].filter((item) => item.summary && item.summary.trim().length > 0);
}

export default function LivingUnderstandings({
  executiveDashboard,
  livingUnderstandings,
  focusedUnderstanding,
  onFocusUnderstanding,
}: LivingUnderstandingsProps) {
  const interpretationUnderstandings =
    buildInterpretationUnderstandings(executiveDashboard);

  const understandings: LivingUnderstandingItem[] =
    livingUnderstandings && livingUnderstandings.length > 0
      ? livingUnderstandings
      : interpretationUnderstandings;

  return (
    <section className="briefing-section living-understandings-v2">
      <div className="briefing-section-header">
        <div>
          <p className="briefing-eyebrow">Living Understanding</p>
          <h2>How Discovery&apos;s organizational theory is evolving.</h2>
        </div>

        <span className="briefing-count-pill">
          {understandings.length} tracked
        </span>
      </div>

      <div className="living-understanding-list-v2">
        {understandings.length === 0 ? (
          <article className="living-understanding-empty-v2">
            <h3>No living understanding yet</h3>
            <p>
              Continue adding evidence and Discovery will begin forming
              explanations that can strengthen, weaken, or resolve over time.
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
                      "Discovery is testing this explanation over time.",
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