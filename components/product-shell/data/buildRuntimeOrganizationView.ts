import type { OrganizationRuntime } from "../../../engine/v3/runtime";

const UNAVAILABLE = "Runtime not yet available";
type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}
function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}
function text(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.replace(/\s+/g, " ").trim();
    }
  }
  return null;
}
function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
function distinct(values: Array<string | null>, limit: number): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value.toLocaleLowerCase())) continue;
    seen.add(value.toLocaleLowerCase());
    output.push(value);
    if (output.length === limit) break;
  }
  return output;
}

export type RuntimeOrganizationSection = {
  title: string;
  owner: string;
  available: boolean;
  summary: string;
  items: string[];
};

export type RuntimeOrganizationView = {
  currentUnderstanding: RuntimeOrganizationSection;
  explanations: RuntimeOrganizationSection;
  evidence: RuntimeOrganizationSection;
  uncertainty: RuntimeOrganizationSection;
  conditions: RuntimeOrganizationSection;
  organizationalState: RuntimeOrganizationSection;
  investigations: RuntimeOrganizationSection;
  recentChanges: RuntimeOrganizationSection;
  modelEvolution: RuntimeOrganizationSection;
};

function section(input: {
  title: string;
  owner: string;
  summary?: string | null;
  items?: Array<string | null>;
}): RuntimeOrganizationSection {
  const items = distinct(input.items ?? [], 4);
  const summary = input.summary ?? items[0] ?? null;
  return {
    title: input.title,
    owner: input.owner,
    available: Boolean(summary),
    summary: summary ?? UNAVAILABLE,
    items,
  };
}

export function buildRuntimeOrganizationView(
  runtime: OrganizationRuntime,
): RuntimeOrganizationView {
  const memory = record(runtime.memory);
  const understandingState = record(memory.organizationalUnderstandingState);
  const compositions = records(understandingState.canonicalCompositions);
  const explanations = records(memory.organizationalExplanations);
  const explanationsById = new Map(
    explanations.flatMap((explanation) => {
      const id = text(explanation.id);
      return id ? [[id, explanation] as const] : [];
    }),
  );
  const primaryComposition = compositions[0];
  const primaryExplanations = primaryComposition
    ? strings(primaryComposition.explanationIds)
        .map((id) => explanationsById.get(id))
        .filter((value): value is UnknownRecord => Boolean(value))
    : [];
  const readablePrimary = distinct(
    primaryExplanations.map((explanation) =>
      text(
        explanation.title,
        explanation.summary,
        record(explanation.claim).statement,
      ),
    ),
    3,
  );
  const explanationItems = distinct(
    explanations.map((explanation) =>
      text(
        explanation.title,
        explanation.summary,
        record(explanation.claim).statement,
      ),
    ),
    4,
  );
  const evidenceItems = distinct(
    primaryExplanations.flatMap((explanation) =>
      records(explanation.evidenceReferences).map((reference) =>
        text(reference.title, reference.label, reference.statement),
      ),
    ),
    4,
  );
  const uncertainty = record(memory.organizationalUncertainty);
  const uncertaintyItems = distinct(
    [
      ...primaryExplanations.flatMap((item) => strings(item.uncertainty)),
      ...strings(uncertainty.uncertainties),
      ...strings(uncertainty.missingEvidence),
      text(uncertainty.summary),
    ],
    4,
  );
  const conditions = records(memory.organizationalConditions);
  const conditionItems = distinct(
    conditions.map((condition) =>
      text(condition.name, condition.title, condition.summary),
    ),
    4,
  );
  const organizationalState = record(memory.organizationalState);
  const investigations = records(memory.investigationOpportunities);
  const learningEvents = records(memory.learningEvents);
  const evolutionHistory = records(understandingState.evolutionHistory);
  const theoryEvolution = records(memory.theoryEvolution);
  const understandingEvolution = record(memory.understandingEvolution);

  return {
    currentUnderstanding: section({
      title: "Current Organizational Understanding",
      owner: "Canonical Organizational Understanding",
      summary: readablePrimary[0],
      items: readablePrimary,
    }),
    explanations: section({
      title: "Top Organizational Explanations",
      owner: "Completed Organizational Explanations",
      summary: explanationItems[0],
      items: explanationItems,
    }),
    evidence: section({
      title: "Supporting Evidence",
      owner: "Evidence",
      summary: evidenceItems[0],
      items: evidenceItems,
    }),
    uncertainty: section({
      title: "Remaining Uncertainty",
      owner: "Organizational Uncertainty and completed Explanations",
      summary: uncertaintyItems[0],
      items: uncertaintyItems,
    }),
    conditions: section({
      title: "Relevant Conditions",
      owner: "Organizational Conditions",
      summary: conditionItems[0],
      items: conditionItems,
    }),
    organizationalState: section({
      title: "Current Organizational State",
      owner: "Organizational State",
      summary: text(organizationalState.summary),
      items: [
        text(organizationalState.executiveImplication),
        ...strings(organizationalState.recommendedFocus),
      ],
    }),
    investigations: section({
      title: "Investigation Opportunities",
      owner: "Investigation Opportunities",
      summary: text(
        investigations[0]?.suggestedExecutiveQuestion,
        investigations[0]?.topic,
      ),
      items: investigations.map((item) =>
        text(item.suggestedExecutiveQuestion, item.topic),
      ),
    }),
    recentChanges: section({
      title: "Recent Changes",
      owner: "Learning Events and Understanding Evolution",
      summary: text(
        learningEvents.at(-1)?.reason,
        evolutionHistory.at(-1)?.description,
      ),
      items: [
        ...learningEvents.slice(-4).reverse().map((item) => text(item.reason)),
        ...evolutionHistory
          .slice(-4)
          .reverse()
          .map((item) => text(item.description, item.title)),
      ],
    }),
    modelEvolution: section({
      title: "Model Evolution",
      owner: "Understanding and Theory Evolution",
      summary: text(
        understandingEvolution.summary,
        theoryEvolution.at(-1)?.reason,
        theoryEvolution.at(-1)?.summary,
      ),
      items: theoryEvolution
        .slice(-4)
        .reverse()
        .map((item) => text(item.reason, item.summary)),
    }),
  };
}
