import { Observation, Workspace, WorkspaceCluster } from "./types";

export function buildWorkspace(observations: Observation[]): Workspace {
  const clusters = buildClusters(observations);
  const contradictions = findContradictions(observations);

  return {
    clusters,
    contradictions,
    dominantTheme: clusters[0]?.title || "No dominant theme yet",
    openQuestions: buildOpenQuestions(clusters, contradictions),
    workspaceHealth: {
      coherence: Math.min(95, 40 + clusters.length * 15),
      instability: Math.min(95, contradictions.length * 30 + clusters.length * 8),
      surprisePotential: Math.min(95, contradictions.length * 35 + clusters.length * 10),
    },
    evidenceCount: observations.length,
    clusterCount: clusters.length,
  };
}

function buildClusters(observations: Observation[]): WorkspaceCluster[] {
  const clusterRules = [
    {
      title: "Customer Experience",
      keywords: ["customer", "complaint", "complaints", "price", "pricing", "content fatigue", "confusing plans"],
      tags: ["customer", "retention"],
    },
    {
      title: "Competitive Pressure",
      keywords: ["competitor", "competitors", "bundling", "bundle"],
      tags: ["market", "competition"],
    },
    {
      title: "Strategic Bets",
      keywords: ["ads", "games", "live events", "investing", "bets", "retention"],
      tags: ["strategy", "growth"],
    },
    {
      title: "Leadership Narrative",
      keywords: ["leadership", "engagement", "strong"],
      tags: ["leadership", "narrative"],
    },
    {
      title: "Growth Uncertainty",
      keywords: ["growth", "slowing", "inconsistent", "unclear"],
      tags: ["growth", "uncertainty"],
    },
    {
      title: "Product Identity",
      keywords: ["what discovery", "actually is", "executive os", "understanding engine"],
      tags: ["product", "positioning"],
    },
    {
      title: "Differentiation",
      keywords: ["differentiation", "competitor", "ai agents"],
      tags: ["market", "positioning"],
    },
    {
      title: "Adoption Risk",
      keywords: ["ceo", "upload", "every week", "monday morning"],
      tags: ["adoption", "workflow"],
    },
    {
      title: "Deep Insight",
      keywords: ["deep insight", "memory", "surprise", "edge of chaos", "curiosity"],
      tags: ["intelligence", "learning"],
    },
    {
      title: "Investor Messaging",
      keywords: ["investor", "simpler language", "messaging"],
      tags: ["investor", "story"],
    },
    {
      title: "MVP Focus",
      keywords: ["mvp", "immediate value", "immediate clarity", "test"],
      tags: ["mvp", "focus"],
    },
  ];

  return clusterRules
    .map((rule, index) => {
      const matched = observations.filter((obs) =>
        rule.keywords.some((keyword) =>
          obs.description.toLowerCase().includes(keyword)
        )
      );

      return {
        id: `cluster-${index + 1}`,
        title: rule.title,
        theme: rule.title,
        evidenceIds: matched.map((_, matchedIndex) => `evidence-${matchedIndex + 1}`),
        observations: matched.map((obs) => obs.description),
        confidence: Math.min(95, 45 + matched.length * 15),
        tags: rule.tags,
      };
    })
    .filter((cluster) => cluster.observations.length > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

function findContradictions(observations: Observation[]) {
  const text = observations.map((obs) => obs.description.toLowerCase()).join(" ");
  const contradictions = [];

  if (
    text.includes("engagement is strong") &&
    (text.includes("customer complaints") ||
      text.includes("pricing") ||
      text.includes("content fatigue"))
  ) {
    contradictions.push({
      title: "Strong engagement vs. customer dissatisfaction",
      tension:
        "Leadership signals suggest engagement is healthy, while customer-facing evidence points to pricing, content, or plan friction.",
      relatedObservations: observations
        .filter((obs) => {
          const lower = obs.description.toLowerCase();
          return (
            lower.includes("engagement") ||
            lower.includes("customer") ||
            lower.includes("pricing") ||
            lower.includes("content fatigue")
          );
        })
        .map((obs) => obs.description),
    });
  }

  if (
    text.includes("ads") &&
    text.includes("games") &&
    text.includes("live events") &&
    text.includes("unclear")
  ) {
    contradictions.push({
      title: "Multiple bets vs. unclear retention impact",
      tension:
        "The company appears to be pursuing several growth bets at once, but the evidence does not yet clarify which bets improve retention.",
      relatedObservations: observations
        .filter((obs) => {
          const lower = obs.description.toLowerCase();
          return (
            lower.includes("ads") ||
            lower.includes("games") ||
            lower.includes("live events") ||
            lower.includes("retention")
          );
        })
        .map((obs) => obs.description),
    });
  }

  if (text.includes("immediate clarity") && text.includes("deep insight")) {
    contradictions.push({
      title: "Immediate clarity vs. deep insight",
      tension:
        "The input suggests the product must create immediate utility while also building toward deeper intelligence over time.",
      relatedObservations: observations
        .filter((obs) => {
          const lower = obs.description.toLowerCase();
          return lower.includes("immediate clarity") || lower.includes("deep insight");
        })
        .map((obs) => obs.description),
    });
  }

  if (text.includes("organism") && text.includes("abstract")) {
    contradictions.push({
      title: "Resonant metaphor vs. adoption clarity",
      tension:
        "The organism concept appears compelling, but the input also raises concern that it may be too abstract for buyers.",
      relatedObservations: observations
        .filter((obs) => {
          const lower = obs.description.toLowerCase();
          return lower.includes("organism") || lower.includes("abstract");
        })
        .map((obs) => obs.description),
    });
  }

  return contradictions;
}

function buildOpenQuestions(
  clusters: WorkspaceCluster[],
  contradictions: ReturnType<typeof findContradictions>
): string[] {
  const questions = [
    "What decision is this investigation meant to improve?",
    "What evidence would most improve the workspace?",
  ];

  if (clusters.some((cluster) => cluster.title === "Customer Experience")) {
    questions.push("Are pricing complaints, content fatigue, or plan confusion driving more customer friction?");
  }

  if (clusters.some((cluster) => cluster.title === "Strategic Bets")) {
    questions.push("Which strategic bet is most clearly improving retention?");
  }

  if (clusters.some((cluster) => cluster.title === "Leadership Narrative")) {
    questions.push("Does internal engagement data conflict with customer sentiment?");
  }

  if (clusters.some((cluster) => cluster.title === "Product Identity")) {
    questions.push("Is Discovery best framed as a tool, platform, engine, or operating system?");
  }

  if (clusters.some((cluster) => cluster.title === "Adoption Risk")) {
    questions.push("What would make this useful enough for a CEO to return every week?");
  }

  if (contradictions.length > 0) {
    questions.push("Which tension should leadership resolve first?");
  }

  return questions;
}