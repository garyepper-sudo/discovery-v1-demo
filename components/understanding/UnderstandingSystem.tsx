import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "../executive/ExecutiveBriefing";

type Props = {
  executiveDashboard: ExecutiveDashboard;
  focusedUnderstanding?: FocusedUnderstanding | null;
  onFocusUnderstanding?: (id: string) => void;
};

function formatConfidence(value?: number): string {
  if (value === undefined || value <= 0) return "—";

  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
}

export default function UnderstandingSystem({
  executiveDashboard,
  focusedUnderstanding,
  onFocusUnderstanding,
}: Props) {
  const interpretation = executiveDashboard.interpretation;
  const confidence = formatConfidence(
    executiveDashboard.hero.organizationConfidence,
  );

  const understandingNodes = [
    {
      id: "current-explanation",
      label: "Explanation",
      value: interpretation.currentExplanation,
    },
    {
      id: "confidence",
      label: "Confidence",
      value: interpretation.confidenceNarrative,
    },
    {
      id: "competing-explanations",
      label: "Alternatives",
      value: interpretation.competingExplanationNarrative,
    },
    {
      id: "remaining-uncertainty",
      label: "Uncertainty",
      value: interpretation.remainingUncertainty,
    },
    {
      id: "next-evidence",
      label: "Next Evidence",
      value: interpretation.evidenceThatCouldChangeTheExplanation,
    },
  ].filter((item) => item.value && item.value.trim().length > 0);

  return (
    <section className="understanding-system">
      <div className="understanding-system-header">
        <p className="briefing-eyebrow">Understanding System</p>
        <h2>Discovery&apos;s current organizational theory.</h2>
      </div>

      <div className="understanding-system-center">
        <div className="understanding-story-node">
          <span />

          <p className="briefing-section-label">Current Explanation</p>

          <h3>
            {focusedUnderstanding?.summary ??
              interpretation.currentExplanation}
          </h3>

          <p>
            Confidence: {confidence}. Discovery treats this as a living
            explanation that can strengthen, weaken, or change as new evidence
            arrives.
          </p>
        </div>

        <div className="understanding-node-row">
          {understandingNodes.map((item) => {
            const isFocused = focusedUnderstanding?.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`understanding-node ${
                  isFocused ? "is-focused" : ""
                }`}
                onClick={() => onFocusUnderstanding?.(item.id)}
              >
                <span />
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}