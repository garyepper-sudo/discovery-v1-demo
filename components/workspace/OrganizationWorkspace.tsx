"use client";

import ResultsOverview from "../results/ResultsOverview";
import ContinueLearningPanel from "./ContinueLearningPanel";
import CognitionInspector from "./CognitionInspector";
import OrganizationMemoryCard from "./OrganizationMemoryCard";

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
    <section>
      <section className="executive-briefing" style={{ marginBottom: 32 }}>
        <div>
          <OrganizationMemoryCard organizationRuntime={organizationRuntime} />
          <CognitionInspector runtime={organizationRuntime} />
        </div>

        <ContinueLearningPanel
          loading={loading}
          onContinue={onContinueLearning}
        />
      </section>

      <ResultsOverview
        understanding={v3?.executiveUnderstanding}
        beliefs={v3?.beliefs}
        hypotheses={v3?.hypotheses}
        themes={v3?.themes}
        contradictions={v3?.contradictions}
        causalChains={v3?.causalChains}
        evidence={v3?.evidence}
        reasoningGraph={v3?.reasoningGraph}
        organismState={v3?.organismState}
        organizationRuntime={organizationRuntime}
        delta={v3?.delta}
      />
    </section>
  );
}