import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "../executive/ExecutiveBriefing";

type Props = {
  executiveDashboard: ExecutiveDashboard;
  focusedUnderstanding?: FocusedUnderstanding | null;
  onFocusUnderstanding?: (id: string) => void;
};

export default function UnderstandingSystem({
  executiveDashboard,
  focusedUnderstanding,
  onFocusUnderstanding,
}: Props) {
  const understandings = executiveDashboard.keyInsights.slice(0, 6);

  return (
    <section className="understanding-system">
      <div className="understanding-system-header">
        <p className="briefing-eyebrow">Understanding System</p>
        <h2>Discovery’s current mental model.</h2>
      </div>

      <div className="understanding-system-center">
        <div className="understanding-story-node">
          <span />
          <h3>{focusedUnderstanding?.title ?? "Current Story"}</h3>
          <p>
            {focusedUnderstanding
              ? "This understanding is currently in focus."
              : "Select an understanding to focus the briefing."}
          </p>
        </div>

        <div className="understanding-node-row">
          {understandings.map((item, index) => {
            const id = item.title ?? `understanding-${index}`;
            const isFocused = focusedUnderstanding?.id === id;

            return (
              <button
                key={id}
                type="button"
                className={`understanding-node ${isFocused ? "is-focused" : ""}`}
                onClick={() => onFocusUnderstanding?.(id)}
              >
                <span />
                <strong>{item.title}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}