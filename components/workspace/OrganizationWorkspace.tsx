"use client";

import ResultsOverview from "../results/ResultsOverview";
import ContinueLearningPanel from "./ContinueLearningPanel";
import CognitionInspector from "./CognitionInspector";

type Props = {
  result: any;
  loading: boolean;
  onContinueLearning: (nextInput: string) => void;
};

export default function OrganizationWorkspace({
  result,
  loading,
  onContinueLearning,
}: Props) {
  const v3 = result?.v3;
  const organizationRuntime = result?.organizationRuntime;

  return (
    <section className="organization-workspace">
      <section className="executive-experience-grid">
        <main className="executive-experience-main">
          <section className="executive-details-shell">
            <ResultsOverview
              executiveDashboard={v3?.executiveDashboard}
              understanding={v3?.executiveUnderstanding}
              reasoningGraph={v3?.reasoningGraph}
              organismState={v3?.organismState}
              organizationRuntime={organizationRuntime}
              delta={v3?.delta}
            />
          </section>
        </main>

        <aside className="executive-experience-sidebar">
          <CognitionInspector
  runtime={organizationRuntime}
  onExploreInsight={() => {
    document
      .querySelector(".executive-compressed-sections")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
/>

          <ContinueLearningPanel
            loading={loading}
            onContinue={onContinueLearning}
          />
        </aside>
      </section>
    </section>
  );
}