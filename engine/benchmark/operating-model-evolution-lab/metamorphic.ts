import type {
  EvidenceEvent,
  OrganizationTimeline,
  OrganizationTimelineStep,
} from "./contracts";

export type EvolutionMetamorphicRelation =
  | "duplicate-historical-evidence"
  | "evidence-replay"
  | "out-of-order-evidence"
  | "equivalent-wording"
  | "contradictory-wording"
  | "entity-rename"
  | "department-rename"
  | "executive-rename"
  | "repeated-intervention"
  | "repeated-decisions";

export type EvolutionMetamorphicInvariant =
  | "identity-continuity"
  | "semantic-equivalence"
  | "scope-preservation"
  | "historical-truth-preservation"
  | "duplicate-resistance"
  | "appropriate-change"
  | "recommendation-continuity";

export type EvolutionMetamorphicHook = {
  relation: EvolutionMetamorphicRelation;
  description: string;
  expectedInvariants: EvolutionMetamorphicInvariant[];
  transform: (
    timeline: OrganizationTimeline,
  ) => OrganizationTimeline;
};

export type EvolutionMetamorphicCase = {
  id: string;
  baselineTimelineId: string;
  relation: EvolutionMetamorphicRelation;
  expectedInvariants: EvolutionMetamorphicInvariant[];
};

export const supportedEvolutionMetamorphicRelations:
  EvolutionMetamorphicRelation[] = [
    "duplicate-historical-evidence",
    "evidence-replay",
    "out-of-order-evidence",
    "equivalent-wording",
    "contradictory-wording",
    "entity-rename",
    "department-rename",
    "executive-rename",
    "repeated-intervention",
    "repeated-decisions",
  ];

function clone(timeline: OrganizationTimeline): OrganizationTimeline {
  return JSON.parse(JSON.stringify(timeline)) as OrganizationTimeline;
}

function evidenceSteps(timeline: OrganizationTimeline) {
  return timeline.steps.filter(
    (step): step is OrganizationTimelineStep & { event: EvidenceEvent } =>
      step.event.eventType === "evidence",
  );
}

export function applyEvolutionMetamorphicTransformation(
  timeline: OrganizationTimeline,
  relation: EvolutionMetamorphicRelation,
): OrganizationTimeline {
  const transformed = clone(timeline);
  const evidence = evidenceSteps(transformed);
  switch (relation) {
    case "duplicate-historical-evidence":
      if (evidence[0]?.event.eventType === "evidence") evidence[0].event.evidence.evidenceIds.push(...evidence[0].event.evidence.evidenceIds);
      break;
    case "evidence-replay":
      if (evidence.at(-1)) {
        const last = evidence.at(-1)!;
        last.event.evidence.evidenceIds.push(last.event.evidence.evidenceIds[0]);
      }
      break;
    case "out-of-order-evidence":
      if (evidence.length >= 2 && evidence[0].event.eventType === "evidence" && evidence[1].event.eventType === "evidence") [evidence[0].event.evidence, evidence[1].event.evidence] = [evidence[1].event.evidence, evidence[0].event.evidence];
      break;
    case "equivalent-wording":
      if (evidence[0]?.event.eventType === "evidence") evidence[0].event.evidence.summary = `Equivalent statement: ${evidence[0].event.evidence.summary}`;
      break;
    case "contradictory-wording":
      if (evidence.at(-1)) {
        const last = evidence.at(-1)!;
        last.event.evidence.summary = `Contradictory statement: ${last.event.evidence.summary}`;
      }
      break;
    case "department-rename":
      for (const step of transformed.steps) if (step.event.eventType === "evidence") step.event.evidence.summary = step.event.evidence.summary.replace(/Delivery Operations/g, "Client Operations");
      break;
    case "executive-rename":
      for (const step of transformed.steps) {
        if (step.event.eventType === "decision") {
          step.event.decision.executive = step.event.decision.executive
            ? { ...step.event.decision.executive, name: `Renamed ${step.event.decision.executive.name}` }
            : { id: "benchmark-executive", name: "Renamed Executive" };
        }
      }
      break;
    case "repeated-intervention": {
      const index = transformed.steps.findIndex((step) => step.event.eventType === "intervention");
      if (index >= 0) {
        const repeated = clone({ ...transformed, steps: [transformed.steps[index]] }).steps[0];
        repeated.event.id = `${repeated.event.id}-repeated`;
        transformed.steps.splice(index + 1, 0, repeated);
      }
      break;
    }
    case "repeated-decisions": {
      const index = transformed.steps.findIndex((step) => step.event.eventType === "decision");
      if (index >= 0) {
        const repeated = clone({ ...transformed, steps: [transformed.steps[index]] }).steps[0];
        repeated.event.id = `${repeated.event.id}-repeated`;
        transformed.steps.splice(index + 1, 0, repeated);
      }
      break;
    }
    case "entity-rename":
      for (const step of transformed.steps) if (step.event.eventType === "evidence") step.event.evidence.summary = `Renamed entity: ${step.event.evidence.summary}`;
      break;
  }
  return transformed;
}
