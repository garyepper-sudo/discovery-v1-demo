import {
  OrganismLink,
  OrganismNode,
  PersistentOrganismState,
  UnderstandingState,
} from "../../understanding/types";

function clampStrength(value: number): number {
  return Math.max(0.1, Math.min(1, value));
}

export function evolveOrganismFromState(
  state: UnderstandingState,
  recentChangeNodeIds: string[] = []
): PersistentOrganismState {
  const observationNodes: OrganismNode[] = state.observations.map(
    (observation) => ({
      id: observation.id,
      kind: "observation",
      label: observation.statement,
      strength: clampStrength(observation.confidence),
      stability:
        observation.occurrenceCount >= 4
          ? "stable"
          : observation.occurrenceCount >= 2
            ? "forming"
            : "emerging",
    })
  );

  const beliefNodes: OrganismNode[] = state.beliefs.map((belief) => ({
    id: belief.id,
    kind: "belief",
    label: belief.statement,
    strength: clampStrength(belief.confidence),
    stability: belief.stability,
  }));

  const themeNodes: OrganismNode[] = state.themes.map((theme) => ({
    id: theme.id,
    kind: "theme",
    label: theme.label,
    strength: clampStrength(theme.confidence),
    stability: theme.stability,
  }));

  const contradictionNodes: OrganismNode[] = state.contradictions.map(
    (contradiction) => ({
      id: contradiction.id,
      kind: "contradiction",
      label: contradiction.statement,
      strength: clampStrength(contradiction.confidence),
      stability: "emerging",
    })
  );

  const mechanismNodes: OrganismNode[] = state.mechanisms.map((mechanism) => ({
    id: mechanism.id,
    kind: "mechanism",
    label: mechanism.label,
    strength: clampStrength(mechanism.confidence),
    stability: "forming",
  }));

  const stablePatternNodes: OrganismNode[] = state.stablePatterns.map(
    (pattern) => ({
      id: pattern.id,
      kind: "stablePattern",
      label: pattern.label,
      strength: clampStrength(pattern.confidence),
      stability: pattern.stability,
    })
  );

  const links: OrganismLink[] = [];

  state.beliefs.forEach((belief) => {
    belief.observationIds.forEach((observationId) => {
      links.push({
        id: `link-${observationId}-${belief.id}`,
        sourceId: observationId,
        targetId: belief.id,
        kind: "supports",
        strength: clampStrength(belief.confidence),
      });
    });

    belief.themeIds.forEach((themeId) => {
      links.push({
        id: `link-${themeId}-${belief.id}`,
        sourceId: themeId,
        targetId: belief.id,
        kind: "clusters",
        strength: clampStrength(belief.confidence),
      });
    });
  });

  state.contradictions.forEach((contradiction) => {
    contradiction.relatedBeliefIds.forEach((beliefId) => {
      links.push({
        id: `link-${contradiction.id}-${beliefId}`,
        sourceId: contradiction.id,
        targetId: beliefId,
        kind: "tensions",
        strength: clampStrength(contradiction.confidence),
      });
    });
  });

  state.mechanisms.forEach((mechanism) => {
    mechanism.relatedBeliefIds.forEach((beliefId) => {
      links.push({
        id: `link-${mechanism.id}-${beliefId}`,
        sourceId: mechanism.id,
        targetId: beliefId,
        kind: "explains",
        strength: clampStrength(mechanism.confidence),
      });
    });
  });

  state.stablePatterns.forEach((pattern) => {
    pattern.relatedBeliefIds.forEach((beliefId) => {
      links.push({
        id: `link-${pattern.id}-${beliefId}`,
        sourceId: pattern.id,
        targetId: beliefId,
        kind: "clusters",
        strength: clampStrength(pattern.confidence),
      });
    });

    pattern.relatedThemeIds.forEach((themeId) => {
      links.push({
        id: `link-${pattern.id}-${themeId}`,
        sourceId: pattern.id,
        targetId: themeId,
        kind: "clusters",
        strength: clampStrength(pattern.confidence),
      });
    });
  });

  return {
    version: state.organism.version + 1,
    nodes: [
      ...observationNodes,
      ...beliefNodes,
      ...themeNodes,
      ...contradictionNodes,
      ...mechanismNodes,
      ...stablePatternNodes,
    ],
    links,
    recentChangeNodeIds,
  };
}