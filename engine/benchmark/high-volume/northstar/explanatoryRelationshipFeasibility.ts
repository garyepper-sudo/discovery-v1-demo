import { spawnSync } from "node:child_process";

import type {
  DiscoveryV3Result,
  V3EvidenceRelationship,
  V3Signal,
  V3Theme,
} from "../../../v3/types";
import type { OrganizationRuntime } from "../../../v3/runtime/organizationRuntime";
import { runCanonicalNorthstarGroundTruthReplay } from "./runCanonicalNorthstarGroundTruthReplay";

const FIXED_TIME = "2026-07-22T20:00:00.000Z";
const LIMIT = 5;

type RelationshipType =
  | "contributes-to"
  | "weakens-explanation"
  | "conditional-on"
  | "leads-to";

type DerivationAvailability =
  | "directly-available"
  | "deterministically-derivable"
  | "acceptable-heuristic"
  | "free-text-only"
  | "requires-llm"
  | "unavailable"
  | "ambiguous";

type ExplanatoryRelationship = {
  id: string;
  sourceObjectId: string;
  targetObjectId: string;
  relationshipType: RelationshipType;
  direction: "source-to-target";
  confidence: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  scope: string;
  inferredAt: string;
  derivationSource: string;
  lineage: string[];
  falsification: string[];
  availability: DerivationAvailability;
  eligibleBeforeThemeComposition: boolean;
  eligibleBeforeCausalComposition: boolean;
  ambiguous: boolean;
};

type FixtureCase = {
  id: string;
  state: DiscoveryV3Result;
  runtime?: OrganizationRuntime;
};

const POST_RUN_EXPLANATION_PARTS = [
  {
    id: "pressure",
    phrases: ["execution capacity is under pressure", "capacity pressure"],
  },
  {
    id: "causal-driver",
    phrases: ["concurrent work", "reprioritization", "effective capacity"],
  },
  {
    id: "rejected-alternative",
    phrases: [
      "staffing may not be the primary root cause",
      "staffing is not the primary",
    ],
  },
  {
    id: "counterfactual",
    phrases: [
      "staffing is sufficient if",
      "staffing may support planned throughput if",
      "if concurrent work is reduced",
    ],
  },
  {
    id: "consequence",
    phrases: [
      "reducing active work may improve throughput",
      "reduce active work",
      "sequencing",
    ],
  },
] as const;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function explanationParts(value: unknown): string[] {
  const text = normalize(JSON.stringify(value));
  return POST_RUN_EXPLANATION_PARTS.filter((part) =>
    part.phrases.some((phrase) => text.includes(normalize(phrase))),
  ).map((part) => part.id);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function stateFromRuntime(runtime: OrganizationRuntime): DiscoveryV3Result {
  const state = runtime.memory.understandingState as
    | DiscoveryV3Result
    | undefined;
  if (!state) throw new Error("Fixture has no understanding state.");
  return state;
}

function loadCommittedRuntime(path: string): OrganizationRuntime {
  const result = spawnSync("git", ["show", `HEAD:${path}`], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`Unable to load fixture ${path}`);
  return JSON.parse(result.stdout) as OrganizationRuntime;
}

function relationship(
  params: Omit<
    ExplanatoryRelationship,
    "id" | "direction" | "inferredAt"
  >,
  index: number,
): ExplanatoryRelationship {
  return {
    id: `BER-${index + 1}`,
    direction: "source-to-target",
    inferredAt: FIXED_TIME,
    ...params,
    supportingEvidenceIds: unique(params.supportingEvidenceIds),
    contradictingEvidenceIds: unique(params.contradictingEvidenceIds),
    lineage: unique(params.lineage),
    falsification: unique(params.falsification),
  };
}

function evidenceRelationships(
  relationships: V3EvidenceRelationship[],
  offset: number,
): ExplanatoryRelationship[] {
  return relationships
    .filter((item) =>
      ["supports", "explains", "depends_on"].includes(item.type),
    )
    .map((item, index) =>
      relationship(
        {
          sourceObjectId: item.sourceEvidenceId,
          targetObjectId: item.targetEvidenceId,
          relationshipType: "contributes-to",
          confidence: item.confidence,
          supportingEvidenceIds: [
            item.sourceEvidenceId,
            item.targetEvidenceId,
          ],
          contradictingEvidenceIds: [],
          scope: "evidence",
          derivationSource: `evidenceRelationship:${item.type}`,
          lineage: [item.id, item.sourceEvidenceId, item.targetEvidenceId],
          falsification: [
            "Remove or invalidate the structured evidence relationship.",
          ],
          availability: "directly-available",
          eligibleBeforeThemeComposition: true,
          eligibleBeforeCausalComposition: true,
          ambiguous: item.type !== "explains",
        },
        offset + index,
      ),
    );
}

function contradictionRelationships(
  state: DiscoveryV3Result,
  offset: number,
): ExplanatoryRelationship[] {
  return state.contradictions.flatMap((contradiction, contradictionIndex) => {
    const signalIds = contradiction.signalIds ?? [];
    if (signalIds.length === 0) return [];
    return signalIds.map((signalId, signalIndex) =>
      relationship(
        {
          sourceObjectId: contradiction.id,
          targetObjectId: signalId,
          relationshipType: "weakens-explanation",
          confidence: contradiction.confidence,
          supportingEvidenceIds: contradiction.evidenceIds,
          contradictingEvidenceIds:
            contradiction.opposingEvidenceIds ?? contradiction.evidenceIds,
          scope: "unspecified",
          derivationSource: "contradiction.signalIds",
          lineage: [contradiction.id, signalId],
          falsification: [
            "Resolve the contradiction or remove the opposing evidence.",
          ],
          availability: "directly-available",
          eligibleBeforeThemeComposition: false,
          eligibleBeforeCausalComposition: true,
          ambiguous:
            (contradiction.opposingEvidenceIds?.length ?? 0) === 0 ||
            signalIds.length > 1,
        },
        offset + contradictionIndex * 20 + signalIndex,
      ),
    );
  });
}

function lateCausalRelationships(
  state: DiscoveryV3Result,
  offset: number,
): ExplanatoryRelationship[] {
  const chainEdges = state.causalChains.flatMap((chain, chainIndex) =>
    (chain.themeIds ?? []).map((themeId, themeIndex) =>
      relationship(
        {
          sourceObjectId: themeId,
          targetObjectId: chain.id,
          relationshipType: "leads-to",
          confidence: chain.confidence,
          supportingEvidenceIds: chain.evidenceIds,
          contradictingEvidenceIds: [],
          scope: "unspecified",
          derivationSource: "causalChain.themeIds",
          lineage: [themeId, chain.id, ...chain.evidenceIds],
          falsification: chain.assumptions ?? [],
          availability: "directly-available",
          eligibleBeforeThemeComposition: false,
          eligibleBeforeCausalComposition: false,
          ambiguous: false,
        },
        offset + chainIndex * 20 + themeIndex,
      ),
    ),
  );
  const mechanismEdges = state.mechanisms.flatMap(
    (mechanism, mechanismIndex) =>
      mechanism.themeIds.map((themeId, themeIndex) =>
        relationship(
          {
            sourceObjectId: themeId,
            targetObjectId: mechanism.id,
            relationshipType: "contributes-to",
            confidence: mechanism.confidence,
            supportingEvidenceIds: mechanism.supportingEvidenceIds,
            contradictingEvidenceIds: mechanism.contradictingEvidenceIds,
            scope: "unspecified",
            derivationSource: "mechanism.themeIds",
            lineage: [
              themeId,
              mechanism.id,
              ...mechanism.relationshipIds,
            ],
            falsification: mechanism.assumptions,
            availability: "directly-available",
            eligibleBeforeThemeComposition: false,
            eligibleBeforeCausalComposition: false,
            ambiguous: false,
          },
          offset + 500 + mechanismIndex * 20 + themeIndex,
        ),
      ),
  );
  return [...chainEdges, ...mechanismEdges];
}

function buildGraph(state: DiscoveryV3Result): ExplanatoryRelationship[] {
  return [
    ...evidenceRelationships(state.evidenceRelationships, 0),
    ...contradictionRelationships(state, 1000),
    ...lateCausalRelationships(state, 2000),
  ].sort(
    (left, right) =>
      left.relationshipType.localeCompare(right.relationshipType) ||
      left.sourceObjectId.localeCompare(right.sourceObjectId) ||
      left.targetObjectId.localeCompare(right.targetObjectId) ||
      left.id.localeCompare(right.id),
  );
}

function signalThemes(signals: V3Signal[]): V3Theme[] {
  return signals.map((signal, index) => ({
    id: `FEASIBILITY-T${index + 1}`,
    title: signal.title,
    description: signal.description,
    evidenceIds: unique(signal.evidenceIds),
    signalIds: [signal.id],
    confidence: signal.confidence,
    keywords: [],
    entities: [],
    polarity: signal.polarity,
    strength: "moderate",
    stability: signal.confidence,
  }));
}

function relationshipGuidedSignals(
  signals: V3Signal[],
  graph: ExplanatoryRelationship[],
): V3Signal[] {
  const earlyEdges = graph.filter(
    (edge) => edge.eligibleBeforeThemeComposition,
  );
  const relatedEvidence = new Set(
    earlyEdges.flatMap((edge) => edge.supportingEvidenceIds),
  );
  return [...signals]
    .sort((left, right) => {
      const relationshipSupport = (signal: V3Signal) =>
        unique(signal.evidenceIds).filter((id) => relatedEvidence.has(id))
          .length;
      return (
        relationshipSupport(right) - relationshipSupport(left) ||
        right.confidence - left.confidence ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
      );
    })
    .slice(0, LIMIT);
}

function relationshipGuidedThemes(
  themes: V3Theme[],
  graph: ExplanatoryRelationship[],
): V3Theme[] {
  const usableEdges = graph.filter(
    (edge) => edge.eligibleBeforeCausalComposition,
  );
  const relationshipObjectIds = new Set(
    usableEdges.flatMap((edge) => [
      edge.sourceObjectId,
      edge.targetObjectId,
      ...edge.supportingEvidenceIds,
    ]),
  );
  return [...themes]
    .sort((left, right) => {
      const coverage = (theme: V3Theme) =>
        [
          theme.id,
          ...(theme.signalIds ?? []),
          ...theme.evidenceIds,
        ].filter((id) => relationshipObjectIds.has(id)).length;
      return (
        coverage(right) - coverage(left) ||
        right.confidence - left.confidence ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
      );
    })
    .slice(0, LIMIT);
}

function composition(state: DiscoveryV3Result) {
  const graph = buildGraph(state);
  const currentSignals = state.signals.slice(0, LIMIT);
  const allSignals = [...state.signals];
  const guidedSignals = relationshipGuidedSignals(state.signals, graph);
  const currentThemes = signalThemes(currentSignals).slice(0, LIMIT);
  const allThemes = signalThemes(allSignals);
  const guidedThemes = relationshipGuidedThemes(
    signalThemes(guidedSignals),
    graph,
  );

  return [
    {
      path: "A",
      name: "current bounded control",
      signals: currentSignals,
      themes: currentThemes,
    },
    {
      path: "B",
      name: "unbounded control",
      signals: allSignals,
      themes: allThemes,
    },
    {
      path: "C",
      name: "relationship-guided bounded composition",
      signals: guidedSignals,
      themes: guidedThemes,
    },
  ].map((item) => {
    const evidenceIds = unique(item.themes.flatMap((theme) => theme.evidenceIds));
    const availableEvidenceIds = unique(
      state.signals.flatMap((signal) => signal.evidenceIds),
    );
    const parts = explanationParts(item.themes);
    return {
      path: item.path,
      name: item.name,
      selectedSignalIds: item.signals.map((signal) => signal.id),
      selectedThemeTitles: item.themes.map((theme) => theme.title),
      retainedExplanationParts: parts,
      completeExplanation:
        parts.length === POST_RUN_EXPLANATION_PARTS.length,
      evidenceCoverage:
        availableEvidenceIds.length === 0
          ? 1
          : evidenceIds.length / availableEvidenceIds.length,
      lineageCompleteness:
        item.themes.length === 0
          ? 1
          : item.themes.filter(
              (theme) =>
                (theme.signalIds?.length ?? 0) === 1 &&
                theme.evidenceIds.length > 0,
            ).length / item.themes.length,
      relationshipTypesUsed: unique(
        graph
          .filter((edge) =>
            item.themes.some(
              (theme) =>
                theme.id === edge.sourceObjectId ||
                (theme.signalIds ?? []).includes(edge.targetObjectId) ||
                theme.evidenceIds.some((id) =>
                  edge.supportingEvidenceIds.includes(id),
                ),
            ),
          )
          .map((edge) => edge.relationshipType),
      ),
      themeCount: item.themes.length,
    };
  });
}

function evaluateFixture(fixture: FixtureCase) {
  const graph = buildGraph(fixture.state);
  const ambiguous = graph.filter((edge) => edge.ambiguous);
  const unsupported = graph.filter(
    (edge) =>
      edge.supportingEvidenceIds.length === 0 &&
      edge.lineage.length === 0,
  );
  const early = graph.filter((edge) => edge.eligibleBeforeThemeComposition);
  const beforeCausal = graph.filter(
    (edge) => edge.eligibleBeforeCausalComposition,
  );
  return {
    fixture: fixture.id,
    graph: {
      relationshipCount: graph.length,
      typeCounts: Object.fromEntries(
        (
          [
            "contributes-to",
            "weakens-explanation",
            "conditional-on",
            "leads-to",
          ] as RelationshipType[]
        ).map((type) => [
          type,
          graph.filter((edge) => edge.relationshipType === type).length,
        ]),
      ),
      earlyRelationshipCount: early.length,
      beforeCausalRelationshipCount: beforeCausal.length,
      unsupportedRelationshipRate:
        graph.length === 0 ? 0 : unsupported.length / graph.length,
      ambiguousRelationshipRate:
        graph.length === 0 ? 0 : ambiguous.length / graph.length,
      lineageCompleteness:
        graph.length === 0
          ? 1
          : graph.filter((edge) => edge.lineage.length > 0).length /
            graph.length,
      scopeSpecifiedRate:
        graph.length === 0
          ? 1
          : graph.filter((edge) => edge.scope !== "unspecified").length /
            graph.length,
      relationships: graph,
    },
    composition: composition(fixture.state),
  };
}

const northstarRuntime = runCanonicalNorthstarGroundTruthReplay();
const atlasRuntime = loadCommittedRuntime(
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const knowledgeRuntime = loadCommittedRuntime(
  ".discovery-runtime/organizations/benchmark-knowledge-fragmentation.json",
);
const northstarState = stateFromRuntime(northstarRuntime);
const noCausalState: DiscoveryV3Result = {
  ...northstarState,
  signals: [],
  themes: [],
  contradictions: [],
  mechanisms: [],
  causalChains: [],
  explanations: [],
  evidenceRelationships: [],
};

const fixtures: FixtureCase[] = [
  { id: "northstar", state: northstarState, runtime: northstarRuntime },
  {
    id: "atlas",
    state: stateFromRuntime(atlasRuntime),
    runtime: atlasRuntime,
  },
  {
    id: "executive-decision",
    state: stateFromRuntime(atlasRuntime),
    runtime: atlasRuntime,
  },
  {
    id: "knowledge-continuity",
    state: stateFromRuntime(knowledgeRuntime),
    runtime: knowledgeRuntime,
  },
  {
    id: "contradiction-heavy",
    state: {
      ...northstarState,
      contradictions: [
        ...northstarState.contradictions,
        ...northstarState.contradictions,
      ],
    },
  },
  {
    id: "multi-scope",
    state: northstarState,
  },
  {
    id: "rejected-alternative",
    state: northstarState,
  },
  {
    id: "conditional-relationship",
    state: northstarState,
  },
  {
    id: "action-consequence",
    state: northstarState,
  },
  { id: "no-meaningful-causal-relationship", state: noCausalState },
];

const report = {
  generatedAt: FIXED_TIME,
  productionUnchanged: true,
  vocabulary: [
    {
      type: "contributes-to",
      meaning:
        "A source supplies structured support to another explanatory object.",
      direction: "source-to-target",
      requiredEvidence: "explicit relationship or canonical ancestry",
      contradictionBehavior:
        "opposition must remain separate rather than treated as support",
      confidenceBehavior: "inherits bounded relationship confidence",
      scopeBehavior: "intersection or explicit source scope required",
      temporalBehavior: "does not imply temporal precedence",
      falsification: "remove or invalidate the supporting relationship",
    },
    {
      type: "weakens-explanation",
      meaning:
        "A contradiction or opposing object reduces support for an explanation.",
      direction: "opposing-object-to-explanation",
      requiredEvidence: "explicit contradiction target and opposing evidence",
      contradictionBehavior: "is the contradiction relationship",
      confidenceBehavior: "inherits contradiction confidence",
      scopeBehavior: "must not broaden beyond the contradiction scope",
      temporalBehavior: "latest evidence may revise but not erase history",
      falsification: "resolve the contradiction or invalidate opposing evidence",
    },
    {
      type: "conditional-on",
      meaning:
        "A conclusion holds only when an explicit antecedent condition holds.",
      direction: "conclusion-to-antecedent",
      requiredEvidence: "structured antecedent and consequent",
      contradictionBehavior:
        "contradicting the antecedent weakens applicability, not necessarily the conclusion",
      confidenceBehavior: "bounded by the weaker side",
      scopeBehavior: "intersection of antecedent and consequent",
      temporalBehavior: "antecedent must precede or coexist with consequence",
      falsification: "observe the consequent fail while the antecedent holds",
    },
    {
      type: "leads-to",
      meaning:
        "A structured explanatory object produces or precedes a consequence.",
      direction: "cause-to-consequence",
      requiredEvidence: "causal chain, mechanism, prediction, or outcome link",
      contradictionBehavior: "counterexamples weaken the relationship",
      confidenceBehavior: "inherits bounded causal confidence",
      scopeBehavior: "consequence cannot silently broaden cause scope",
      temporalBehavior: "cause must precede or coexist with consequence",
      falsification: "observe repeated absence of the consequence after the cause",
    },
  ],
  rejectedVocabulary: [
    {
      type: "implies-response",
      reason:
        "Action recommendation is a downstream projection of explanation; treating it as an early causal relation would duplicate recommendation cognition.",
    },
  ],
  responsibilityAudit: [
    {
      relationship: "contributes-to",
      implicitLocation: "evidence relationships, mechanisms, theories",
      earliestReliableInferencePoint: "evidence network",
      rightfulOwner: "existing evidence relationship producer",
      duplicationRisk: "medium",
      architectureRisk: "low for evidence support; high if treated as causality",
    },
    {
      relationship: "weakens-explanation",
      implicitLocation: "contradictions, belief contradiction IDs",
      earliestReliableInferencePoint: "contradiction producer",
      rightfulOwner: "existing contradiction capability",
      duplicationRisk: "low",
      architectureRisk:
        "medium because contradictions are currently produced after Themes",
    },
    {
      relationship: "conditional-on",
      implicitLocation: "evidence prose, some prediction conditions",
      earliestReliableInferencePoint: "unavailable before semantic interpretation",
      rightfulOwner: "unresolved",
      duplicationRisk: "high",
      architectureRisk: "high",
    },
    {
      relationship: "leads-to",
      implicitLocation: "causal chains, mechanisms, predictions, simulations",
      earliestReliableInferencePoint: "causal-chain producer",
      rightfulOwner: "existing causal/mechanism capability",
      duplicationRisk: "high if produced earlier",
      architectureRisk: "high because it is too late for its own selection",
    },
  ],
  producerFeasibility: {
    contributesTo:
      "directly available for evidence support; ambiguous as explanatory causality",
    weakensExplanation:
      "direct only when contradiction.signalIds identifies a target; otherwise ambiguous",
    conditionalOn:
      "unavailable structurally and derivable only from free text in Northstar",
    leadsTo:
      "direct in causal chains and mechanisms, but produced too late for bounded causal composition",
  },
  fixtures: fixtures.map(evaluateFixture),
  deterministicCost: {
    graphConstruction: "linear in explicit canonical relationships",
    boundedSelection:
      "relationship coverage counts plus deterministic O(n log n) sorting",
    engineeringComplexity:
      "low for the benchmark graph; high for reliable conditional ownership and pipeline timing",
  },
  limitations: [
    "Ground Truth vocabulary is used only to evaluate composition after graph derivation.",
    "No benchmark-specific lexical rule is used to create relationships.",
    "The multi-scope control exposes that target Signal/Theme scope is unspecified rather than inventing scopes.",
    "The no-causal control removes relationship-bearing inputs and must produce an empty graph.",
    "Benchmark-local graph edges are not platform capabilities and are never persisted.",
  ],
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
