import {
  Workspace,
  Hypothesis,
  Signal,
  Surprise,
  Understanding,
} from "./types";

export function createUnderstandings(input: {
  workspace: Workspace;
  hypotheses: Hypothesis[];
  signals: Signal[];
  surprises: Surprise[];
}): Understanding[] {
  const understandings: Understanding[] = [];

  input.workspace.clusters.forEach((cluster, index) => {
    understandings.push({
      id: `understanding-${index + 1}`,

      title: cluster.title,

      summary: buildSummary(cluster),

      confidence: Math.min(
        95,
        Math.round(
          (cluster.confidence +
            (input.hypotheses[0]?.confidence ?? 50)) / 2
        )
      ),

      evidenceIds: cluster.evidenceIds,

      observationIds: [],

      supportingHypotheses:
        input.hypotheses.length > 0
          ? [input.hypotheses[0].title]
          : [],

      conflictingEvidence: [],

      relatedUnderstandings: [],

      openQuestions: [
        `What additional evidence would strengthen ${cluster.title}?`,
      ],

      status:
        cluster.confidence > 80
          ? "strong"
          : cluster.confidence > 60
          ? "developing"
          : "emerging",

      lastUpdated: new Date().toISOString(),
    });
  });

  return understandings;
}

function buildSummary(cluster: Workspace["clusters"][0]): string {
  const intro = cluster.observations
    .slice(0, 2)
    .join(" ");

  return `${cluster.title} appears to be an emerging pattern. The evidence suggests ${intro.toLowerCase()}.`;
}