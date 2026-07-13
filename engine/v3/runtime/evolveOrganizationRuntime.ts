import type { DiscoveryV3Result } from "../types";
import type { OrganizationRuntime } from "./organizationRuntime";
import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import { buildOrganizationReasoningGraph } from "../model/buildOrganizationReasoningGraph";
import { buildUnderstandingEvolution } from "../model/memory/buildUnderstandingEvolution";
import { calculateMemoryMaturity } from "../model/memory/calculateMemoryMaturity";
import { inferOrganizationalObservations } from "../model/observations/inferOrganizationalObservations";
import { inferReasoningRelationships } from "../model/inferReasoningRelationships";
import { runOrganizationalReasoningEngine } from "../model/reasoning";
import { synthesizeExplanations } from "../model/judgment/synthesizeExplanations";
import { evaluateExplanations } from "../model/judgment/evaluateExplanations";
import { detectJudgmentContradictions } from "../model/judgment/detectJudgmentContradictions";
import { buildExecutiveAssessment } from "../model/judgment/buildExecutiveAssessment";
import { inferOrganizationalMechanisms } from "../model/judgment/inferOrganizationalMechanisms";
import { inferOrganizationalBeliefs } from "../model/beliefs/inferOrganizationalBeliefs";
import { updateOrganizationalBeliefs } from "../model/beliefs/updateOrganizationalBeliefs";
import { consolidateOrganizationalTheories } from "../model/memory/consolidateOrganizationalTheories";
import { computeOrganizationalLearningProfile } from "../model/learning/computeOrganizationalLearningProfile";
import { runOrganizationCognition } from "../cognition/cognitionEngine";
import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";
import {
  consolidateUnderstanding,
  type UnderstandingCandidate,
} from "../understanding/consolidateUnderstanding";
import { synthesizeUnderstanding } from "../understanding/synthesizeUnderstanding";
import { buildExecutiveUnderstandingCandidates } from "../understanding/buildExecutiveUnderstandingCandidates";
import { buildUnderstandingClusters } from "../understanding/understandingClusters";
import { runSemanticCompression } from "../compression/semanticCompression";
import { inferOrganizationalPhenomena } from "../phenomena/inferOrganizationalPhenomena";
import { synthesizeOrganizationalConcepts } from "../concepts/synthesizeOrganizationalConcepts";
import { buildConceptCandidates } from "../concepts/buildConceptCandidates";
import { compressConceptCandidates } from "../concepts/compressConceptCandidates";
import { extractMeaningSignals } from "../meaning/extractMeaning";
import { inferOrganizationalCapabilities } from "../capabilities/inferOrganizationalCapabilities";
import { updateOrganizationalCapabilities } from "../capabilities/updateOrganizationalCapabilities";
import { inferFunctionalInterpretations } from "../functional/inferFunctionalInterpretations";
import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import { synchronizeOrganizationModel } from "../model/synchronizeOrganizationModel";
import { inferOrganizationRelationships } from "../model/inferOrganizationRelationships";
import { inferOrganizationalConditions } from "../model/state/inferOrganizationalConditions";
import { buildInvestigationOpportunities } from "../model/investigation/buildInvestigationOpportunities";
import { inferOrganizationalPredictions } from "../model/predictions/inferOrganizationalPredictions";
import { buildPredictionReflection } from "../model/predictions/buildPredictionReflection";
import { evaluatePredictionOutcomes } from "../model/predictions/evaluatePredictionOutcomes";
import { simulateOrganization } from "../model/simulate/simulateOrganization";


export function evolveOrganizationRuntime(params: {
  runtime: OrganizationRuntime;
  result: DiscoveryV3Result;
  input: {
    company: string;
    website: string;
    industry: string;
    question: string;
    context: string;
  };
}): OrganizationRuntime {
  const { runtime, result, input } = params;

  const memory = runtime.memory as typeof runtime.memory & {
    functionalInterpretationState?: any;
    organizationalCapabilitiesState?: any;
    organizationalPhenomenaState?: any;
    mechanismNetwork?: any;
    organizationReasoningGraph?: any;
    organizationReasoningRelationships?: any[];
    organizationalReasoning?: any;
    organizationalExplanations?: any[];
    organizationalJudgments?: any[];
    executiveAssessment?: any;
    meaningSignals?: any[];
    organizationalConcepts?: any[];
    semanticConcepts?: any[];
    semanticCohorts?: any[];
    conceptualUnderstanding?: any[];
    conceptCandidates?: any[];
    understandingClusters?: any[];
    organizationalBeliefRevisions?: any[];
    theories?: any[];
    theoryEvolution?: any[];
    understandingEvolution?: any;
    memoryMaturity?: any;

    understandingSnapshots?: any[];
    learningEvents?: any[];
    organizationalLearningProfile?: any;
    organizationalConditions?: any[];
    organizationalState?: any;
    investigationStrategy?: any;
    investigationOpportunities?: any[];
    organizationalPredictions?: any[];
    predictionReflection?: any;
    predictionEvaluations?: any[];
    simulatedOrganizationStates?: any[];
  };

  const now = new Date().toISOString();
  const eventId = `event-${memory.events.length + 1}`;

  const existingOrganizationalUnderstandingState:
    OrganizationalUnderstandingState =
    memory.organizationalUnderstandingState ??
    createEmptyOrganizationalUnderstandingState({
      organizationId: runtime.metadata.organizationId,
      name: input.company || runtime.metadata.name,
      industry: input.industry || runtime.metadata.industry,
      website: input.website || runtime.metadata.website,
      now,
    });

  const candidateUnderstandings: UnderstandingCandidate[] = (
    result.understanding ?? []
  )
    .map(
      (understanding): UnderstandingCandidate => ({
        id: understanding.id,
        statement: understanding.summary || understanding.title,
        confidence: understanding.confidence,
        evidenceIds: understanding.evidenceIds ?? [],
        beliefIds: understanding.beliefIds ?? [],
        themeIds: understanding.themeIds ?? [],
        mechanismIds: understanding.mechanismIds ?? [],
        contradictionIds: [],
        source: "investigation-understanding",
      }),
    )
    .filter((candidate) => Boolean(candidate.statement));

  const baseOrganizationalUnderstandingState =
    updateOrganizationalUnderstandingState({
      state: existingOrganizationalUnderstandingState,
      result,
      now,
    });

  const consolidationResult = consolidateUnderstanding(
    baseOrganizationalUnderstandingState,
    candidateUnderstandings,
  );

  const updatedOrganizationalUnderstandingState:
    OrganizationalUnderstandingState = {
    ...baseOrganizationalUnderstandingState,
    currentUnderstandings: consolidationResult.updatedUnderstandings,
    lastUpdatedAt: now,
    evolutionHistory: [
      ...baseOrganizationalUnderstandingState.evolutionHistory,
      ...consolidationResult.changes.map((change) => ({
        id: `understanding-change-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        date: now,
        type: change.type,
        title: change.title,
        description: change.description,
        relatedUnderstandingIds: change.relatedUnderstandingIds,
      })),
    ],
  };

  const runtimeBeforeCognition: OrganizationRuntime = {
    ...runtime,

    metadata: {
      ...runtime.metadata,
      name: input.company || runtime.metadata.name,
      industry: input.industry || runtime.metadata.industry,
      website: input.website || runtime.metadata.website,
      updatedAt: now,
      investigationCount: runtime.metadata.investigationCount + 1,
    },

    memory: {
      ...memory,
      understandingState: result,
      organizationalUnderstandingState:
        updatedOrganizationalUnderstandingState,
      deltas: [...memory.deltas, result.delta].filter(Boolean),
    },

    organism: {
      ...runtime.organism,
      organismState:
        result.organismState || runtime.organism.organismState,
      lastEvolutionAt: result.organismState
        ? now
        : runtime.organism.lastEvolutionAt,
    },
  };

  const cognitivelyUpdatedRuntime = runOrganizationCognition({
    runtime: runtimeBeforeCognition,
    result,
    eventId,
    now,
  });

  const cognitiveMemory =
    cognitivelyUpdatedRuntime.memory as typeof cognitivelyUpdatedRuntime.memory & {
      understandingState?: {
        patterns?: any[];
        stablePatterns?: any[];
        beliefs?: any[];
      };
    };

  const ontologyPatterns = [
    ...(cognitiveMemory.understandingState?.stablePatterns ?? []),
    ...(cognitiveMemory.understandingState?.patterns ?? []),
  ];

  const synchronizedOrganizationModel = synchronizeOrganizationModel(
    cognitivelyUpdatedRuntime,
  );

  const organizationModel = inferOrganizationRelationships(
    synchronizedOrganizationModel,
  );

  const preliminaryReasoningGraph =
    buildOrganizationReasoningGraph(organizationModel);

  const understandingClusters = buildUnderstandingClusters({
    understandings:
      updatedOrganizationalUnderstandingState.currentUnderstandings,
    organizationReasoningGraph: preliminaryReasoningGraph,
    now,
  });

  console.log("Understanding Clusters", understandingClusters);

  const organizationalDynamicsState = inferFunctionalInterpretations({
    understandings:
      updatedOrganizationalUnderstandingState.currentUnderstandings,
    existingState: memory.functionalInterpretationState,
    now,
  });

  const meaningSignals = extractMeaningSignals({
    interpretations: organizationalDynamicsState.interpretations,
    existingSignals: memory.meaningSignals ?? [],
  });

  const organizationalConcepts = synthesizeOrganizationalConcepts({
    meaningSignals,
    existingConcepts: memory.organizationalConcepts ?? [],
  });

  const organizationalObservationState =
    inferOrganizationalObservations({
      evidence: result.evidence ?? [],
      entities: organizationModel.entities,
      semanticConcepts: organizationalConcepts,
      now,
    });

  const organizationalPhenomenaState =
    inferOrganizationalPhenomena({
      patterns: organizationalObservationState.patterns,
      clusters: understandingClusters,
      previousState: memory.organizationalPhenomenaState,
      now,
    });

  console.log(
    "Organizational Observations",
    organizationalObservationState,
  );
  console.log(
    "Organizational Phenomena",
    organizationalPhenomenaState,
  );

  const organizationReasoningGraph =
    buildOrganizationReasoningGraph({
      ...organizationModel,
      organizationalPhenomena: organizationalPhenomenaState,
    });

  const organizationReasoningRelationships =
    inferReasoningRelationships(organizationReasoningGraph);

  const organizationalReasoning =
    runOrganizationalReasoningEngine({
      reasoningGraph: {
        ...organizationReasoningGraph,
        edges: organizationReasoningRelationships,
      },
      maxDepth: 5,
      maxPaths: 50,
    });

  const organizationalExplanations = synthesizeExplanations({
    reasoningPaths: organizationalReasoning.paths,
    indirectEffects: organizationalReasoning.indirectEffects,
    leveragePoints: organizationalReasoning.leveragePoints,
    rootCauses: organizationalReasoning.rootCauses,
    executiveConclusions: organizationalReasoning.conclusions,
  });

  let organizationalJudgments = evaluateExplanations({
    explanations: organizationalExplanations,
  });

  organizationalJudgments = detectJudgmentContradictions({
    explanations: organizationalExplanations,
    judgments: organizationalJudgments,
  });

  console.log(
    "Organization Reasoning Graph",
    organizationReasoningGraph,
  );
  console.log(
    "Organization Reasoning Relationships",
    organizationReasoningRelationships,
  );
  console.log(
    "Organizational Reasoning",
    organizationalReasoning,
  );
  console.log(
    "Organizational Explanations",
    organizationalExplanations,
  );
  console.log(
    "Organizational Judgments",
    organizationalJudgments,
  );

  const detectedCapabilities = inferOrganizationalCapabilities({
    interpretations: organizationalDynamicsState.interpretations,
    organizationReasoningGraph,
  });

  console.log("Detected Capabilities", detectedCapabilities);

  const organizationalCapabilitiesState =
    updateOrganizationalCapabilities({
      existingState: memory.organizationalCapabilitiesState,
      detectedCapabilities,
      now,
    });

  const mechanismNetwork = inferOrganizationalMechanisms({
    phenomena: organizationalPhenomenaState.phenomena,
    patterns: ontologyPatterns,
    explanations: organizationalExplanations,
    reasoningPaths: organizationalReasoning.paths,
    capabilities: organizationalCapabilitiesState.capabilities,
    understandingClusters,
    judgments: organizationalJudgments,
    semanticConcepts: organizationalConcepts,
  });

  const safeMechanismNetwork = {
    ...mechanismNetwork,
    mechanisms: Array.isArray(mechanismNetwork?.mechanisms)
      ? mechanismNetwork.mechanisms
      : [],
    edges: Array.isArray(mechanismNetwork?.edges)
      ? mechanismNetwork.edges
      : [],
    centralMechanismIds: Array.isArray(
      mechanismNetwork?.centralMechanismIds,
    )
      ? mechanismNetwork.centralMechanismIds
      : [],
  };

  console.log("Mechanism Network", safeMechanismNetwork);

  const inferredOrganizationalBeliefs =
    inferOrganizationalBeliefs({
      mechanisms: safeMechanismNetwork.mechanisms,
      mechanismNetwork: safeMechanismNetwork.edges,
      centralMechanismIds:
        safeMechanismNetwork.centralMechanismIds,

      dynamics: organizationalDynamicsState.interpretations,
      understandingClusters,
      understandings:
        updatedOrganizationalUnderstandingState.currentUnderstandings,

      organizationalConcepts,
      meaningSignals,
      phenomena: organizationalPhenomenaState.phenomena,

      explanations: organizationalExplanations,
      judgments: organizationalJudgments,
      capabilities: organizationalCapabilitiesState.capabilities,

      now,
    });

  const organizationalBeliefState =
    updateOrganizationalBeliefs({
      existingBeliefs:
        updatedOrganizationalUnderstandingState.organizationalBeliefs,
      incomingBeliefs: inferredOrganizationalBeliefs,
      now,
    });

  const organizationalTheoryState =
    consolidateOrganizationalTheories({
      existingTheories: memory.theories ?? [],
      beliefs: organizationalBeliefState.beliefs,
      mechanisms: safeMechanismNetwork.mechanisms,
      concepts: organizationalConcepts,
      evidence: result.evidence ?? [],
      now,
    });

  const understandingEvolution = buildUnderstandingEvolution({
    beliefRevisions: organizationalBeliefState.revisions,
    theoryEvolution:
      organizationalTheoryState.theoryEvolution,
  });

  const memoryMaturity = calculateMemoryMaturity({
    persistentBeliefs:
      organizationalBeliefState.beliefs.length,
    recurringMechanisms:
      safeMechanismNetwork.mechanisms.length,
    stableTheories:
      organizationalTheoryState.theories.filter(
        (theory) =>
          theory.status === "stable" ||
          theory.status === "strengthening",
      ).length,
    historicalEvents:
      cognitivelyUpdatedRuntime.memory.events.length + 1,
    theoryEvolutionEvents: [
      ...(memory.theoryEvolution ?? []),
      ...organizationalTheoryState.theoryEvolution,
    ].length,
    conceptCount: organizationalConcepts.length,
  });

  console.log(
    "Organizational Theories",
    organizationalTheoryState.theories,
  );
  console.log(
    "Organizational Theory Evolution",
    organizationalTheoryState.theoryEvolution,
  );
  console.log("Memory Maturity", memoryMaturity);

  const beliefUpdatedOrganizationalUnderstandingState:
    OrganizationalUnderstandingState = {
    ...updatedOrganizationalUnderstandingState,
    organizationalBeliefs:
      organizationalBeliefState.beliefs,
    lastUpdatedAt: now,
  };

  const synthesizedOrganizationalUnderstandingState =
    synthesizeUnderstanding({
      state: beliefUpdatedOrganizationalUnderstandingState,
      now,
    });

  const semanticReasoning = runSemanticCompression({
    dynamics: organizationalDynamicsState.interpretations,
    understandings:
      synthesizedOrganizationalUnderstandingState.currentUnderstandings,
    meaningSignals,
    organizationalConcepts,
    phenomena: organizationalPhenomenaState.phenomena,
    mechanisms: safeMechanismNetwork.mechanisms,
    mechanismNetwork: safeMechanismNetwork.edges,
    mechanismPatterns: [],
    organizationalBeliefs:
      organizationalBeliefState.beliefs,
    understandingClusters,
  });

  const semanticConcepts = semanticReasoning.observations;

  const conceptCandidates = buildConceptCandidates({
    semanticCohorts: semanticReasoning.cohorts,
  });

  const conceptualUnderstanding =
    compressConceptCandidates(conceptCandidates);

  const organizationalConditionResult =
    inferOrganizationalConditions({
      conceptualUnderstanding,
      organizationalBeliefs:
        organizationalBeliefState.beliefs,
      mechanisms: safeMechanismNetwork.mechanisms,
      theories: organizationalTheoryState.theories,
      theoryEvolution: [
        ...(memory.theoryEvolution ?? []),
        ...organizationalTheoryState.theoryEvolution,
      ],
      capabilities:
        organizationalCapabilitiesState.capabilities,
      memoryMaturity,
      previousConditions:
        memory.organizationalConditions ?? [],
      previousState: memory.organizationalState,
      now,
    });

  const organizationalConditions =
    organizationalConditionResult.conditions;

  const organizationalState =
    organizationalConditionResult.state;

  const organizationalPredictionResult =
    inferOrganizationalPredictions({
      conditions: organizationalConditions.map(
        (condition) => ({
          id: condition.id,
          name: condition.name,
          domain: condition.domain,

          status: condition.status,
          trend: condition.trend,
          priority: condition.priority,

          confidence: condition.confidence,
          strength: condition.strength,

          supportingConceptIds:
            condition.supportingConceptIds,
          supportingBeliefIds:
            condition.supportingBeliefIds,
          supportingTheoryIds:
            condition.supportingTheoryIds,

          upstreamConditionIds:
            condition.upstreamConditionIds,

          downstreamConditionIds:
            condition.downstreamConditionIds,

          missingEvidence:
            condition.missingEvidence,
          confidenceLimiters:
            condition.confidenceLimiters,
        }),
      ),

      organizationalState: {
        id: organizationalState.id,
        status: organizationalState.status,
        confidence: organizationalState.confidence,

        dominantConditionIds:
          organizationalState.dominantConditions,
        improvingConditionIds:
          organizationalState.improvingConditions,
        deterioratingConditionIds:
          organizationalState.deterioratingConditions,
        unresolvedConditionIds:
          organizationalState.unresolvedTensions,
      },

      learningProfile:
        memory.organizationalLearningProfile,

      previousPredictions:
        memory.organizationalPredictions,

      now,
    });

  const organizationalPredictions =
    organizationalPredictionResult.predictions;

  const predictionReflection =
    buildPredictionReflection({
      predictions: organizationalPredictions,

      priorityConditionIds:
        organizationalState.dominantConditions,

      labels: {
        conditionLabels: Object.fromEntries(
          organizationalConditions.map(
            (condition) => [
              condition.id,
              condition.name,
            ],
          ),
        ),
      },
    });

  /**
   * CAP-ADP-001 — Prediction Outcome Evaluation
   *
   * Prediction evaluation is explicitly longitudinal.
   *
   * The predictions created during this investigation cannot yet be
   * evaluated because their outcomes have not had time to occur.
   * Instead, this stage registers evaluations for predictions persisted
   * by a previous investigation and supplies the current investigation's
   * evidence as the later context.
   *
   * Current scaffold behavior:
   * - loads predictions from the previous runtime
   * - preserves their original identity and confidence
   * - attaches current evidence provenance
   * - records the evaluation as inconclusive
   *
   * Deferred implementation:
   * - semantically compare prior predictions with current observations,
   *   conditions, understanding, and evidence
   * - classify outcomes as confirmed, partially-confirmed,
   *   not-confirmed, or inconclusive
   * - calculate prediction accuracy and calibration deltas
   * - generate durable confidence adjustments and learning signals
   * - feed prediction performance into the Organizational Learning Profile
   * - expose prediction performance through Executive Projection and Atlas
   */
  const previousOrganizationalPredictions =
    Array.isArray(memory.organizationalPredictions)
      ? memory.organizationalPredictions
      : [];

  const previousPredictionReflection =
    memory.predictionReflection;

  const currentSupportingEvidenceIds = (
    result.evidence ?? []
  )
    .map((evidence) => evidence.id)
    .filter(Boolean);

  const predictionEvaluations =
  evaluatePredictionOutcomes({
    predictions:
      previousOrganizationalPredictions,

    observedConditions:
      organizationalConditions,

    predictionReflection:
      previousPredictionReflection,

    supportingEvidenceIds:
      currentSupportingEvidenceIds,

    evaluatedAt:
      now,
  });

  const investigationOpportunityResult =
    buildInvestigationOpportunities({
      conditions: organizationalConditions,

      previousLearningProfile:
        memory.organizationalLearningProfile,

      previousInvestigationOpportunities:
        memory.investigationOpportunities,
    });

  const investigationStrategy =
    investigationOpportunityResult.strategy;

  const investigationOpportunities =
    investigationOpportunityResult.opportunities;

  console.log("Semantic Reasoning", semanticReasoning);
  console.log("Concept Candidates", conceptCandidates);
  console.log(
    "Conceptual Understanding",
    conceptualUnderstanding,
  );
  console.log(
    "Organizational Conditions",
    organizationalConditions,
  );
  console.log(
    "Organizational State",
    organizationalState,
  );
  console.log(
    "Organizational Predictions",
    organizationalPredictions,
  );
  console.log(
    "Prediction Reflection",
    predictionReflection,
  );
  console.log(
    "Prediction Evaluations",
    predictionEvaluations,
  );
  console.log(
    "Investigation Strategy",
    investigationStrategy,
  );
  console.log(
    "Investigation Opportunities",
    investigationOpportunities,
  );

  console.log(
    "Organizational Beliefs",
    organizationalBeliefState.beliefs,
  );
  console.log(
    "Organizational Belief Revisions",
    organizationalBeliefState.revisions,
  );

  const executiveAssessment = buildExecutiveAssessment({
    judgments: organizationalJudgments,
    mechanisms: safeMechanismNetwork.mechanisms,
    conceptCandidates,
    conceptualUnderstanding,
    organizationalBeliefs:
      organizationalBeliefState.beliefs,
    organizationalConditions,
    organizationalState,
    investigationOpportunities,
    predictionReflection,
  });

  const executiveUnderstandingCandidates =
    buildExecutiveUnderstandingCandidates({
      executiveAssessment,
      organizationalState,
      organizationalConditions,
      organizationalBeliefs:
        organizationalBeliefState.beliefs,
      theories: organizationalTheoryState.theories,
      mechanisms: safeMechanismNetwork.mechanisms,
    });

  const canonicalUnderstandingBase:
    OrganizationalUnderstandingState = {
    ...existingOrganizationalUnderstandingState,

    currentUnderstandings:
      existingOrganizationalUnderstandingState.currentUnderstandings.filter(
        (understanding) =>
          understanding.source === "executive-assessment",
      ),

    organizationalBeliefs:
      organizationalBeliefState.beliefs,

    lastUpdatedAt: now,
  };

  const finalUnderstandingConsolidation =
    consolidateUnderstanding(
      canonicalUnderstandingBase,
      executiveUnderstandingCandidates,
    );

  const finalOrganizationalUnderstandingState =
    synthesizeUnderstanding({
      state: {
        ...canonicalUnderstandingBase,

        currentUnderstandings:
          finalUnderstandingConsolidation.updatedUnderstandings,

        organizationalBeliefs:
          organizationalBeliefState.beliefs,

        evolutionHistory: [
          ...canonicalUnderstandingBase.evolutionHistory,

          ...finalUnderstandingConsolidation.changes.map(
            (change) => ({
              id: `executive-understanding-change-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,
              date: now,
              type: change.type,
              title: change.title,
              description: change.description,
              relatedUnderstandingIds:
                change.relatedUnderstandingIds,
            }),
          ),
        ],

        lastUpdatedAt: now,
      },

      now,
    });

  console.log(
    "FINAL UNDERSTANDINGS",
    finalOrganizationalUnderstandingState.currentUnderstandings.map(
      (understanding) => ({
        source: understanding.source,
        statement: understanding.statement,
        confidence: understanding.confidence,
        explanatoryPower:
          understanding.explanatoryPower,
        supportCount: understanding.supportCount,
      }),
    ),
  );

  console.log(
    "Executive Assessment",
    executiveAssessment,
  );

  const understandingSnapshot = {
    id: `snapshot-${eventId}`,
    investigationId: eventId,
    timestamp: now,

    company: input.company,
    question: input.question,

    memoryMaturityScore: memoryMaturity.score,
    organizationalUnderstandingScore:
      finalOrganizationalUnderstandingState.score.overall,

    beliefCount:
      organizationalBeliefState.beliefs.length,
    theoryCount:
      organizationalTheoryState.theories.length,
    stableTheoryCount:
      organizationalTheoryState.theories.filter(
        (theory) =>
          theory.status === "stable" ||
          theory.status === "strengthening",
      ).length,

    mechanismCount:
      safeMechanismNetwork.mechanisms.length,
    mechanismEdgeCount:
      safeMechanismNetwork.edges.length,
    centralMechanismCount:
      safeMechanismNetwork.centralMechanismIds.length,

    semanticCohortCount:
      semanticReasoning.cohorts.length,
    semanticConceptCount: semanticConcepts.length,
    conceptCandidateCount: conceptCandidates.length,
    conceptualUnderstandingCount:
      conceptualUnderstanding.length,
    organizationalConditionCount:
      organizationalConditions.length,
    organizationalStateSummary:
      organizationalState.summary,
    organizationalStateConfidence:
      organizationalState.confidence,

    organizationalPhenomenonCount:
      organizationalPhenomenaState.phenomena.length,
    organizationalCapabilityCount:
      organizationalCapabilitiesState.capabilities.length,
    understandingClusterCount:
      understandingClusters.length,

    executiveAssessmentConfidence:
      executiveAssessment.confidence,
  };

  const learningEvents = [
    ...organizationalBeliefState.revisions.map(
      (revision) => ({
        id: `learning-${eventId}-${revision.beliefId}`,
        investigationId: eventId,
        timestamp: now,

        objectType: "belief",
        objectId: revision.beliefId,

        changeType: revision.trend,

        previousConfidence:
          revision.previousConfidence,
        currentConfidence:
          revision.revisedConfidence,
        confidenceDelta:
          revision.revisedConfidence -
          revision.previousConfidence,

        reason: revision.reason,
      }),
    ),

    ...organizationalTheoryState.theoryEvolution.map(
      (evolution) => ({
        id: `learning-${eventId}-${evolution.theoryId}`,
        investigationId: eventId,
        timestamp: now,

        objectType: "theory",
        objectId: evolution.theoryId,

        changeType: evolution.status,

        previousConfidence:
          evolution.previousConfidence,
        currentConfidence:
          evolution.currentConfidence,
        confidenceDelta: evolution.delta,

        reason: evolution.reason,
      }),
    ),
  ];

  const understandingSnapshots = [
    ...(memory.understandingSnapshots ?? []),
    understandingSnapshot,
  ];

  const allLearningEvents = [
    ...(memory.learningEvents ?? []),
    ...learningEvents,
  ];

  const organizationalLearningProfile =
    computeOrganizationalLearningProfile({
      snapshots: understandingSnapshots,
      learningEvents: allLearningEvents,
    });

  console.log(
  "Organizational Learning Profile",
  organizationalLearningProfile,
);

/**
 * CAP-SIM-001 — Organizational Simulation
 *
 * Version 1 preserves the current cognitive state and calibrates
 * simulation confidence using longitudinal prediction accuracy.
 */
const simulatedOrganizationState =
  simulateOrganization({
    organizationId:
      runtime.metadata.organizationId,

    conditions:
      organizationalConditions,

    beliefs:
      organizationalBeliefState.beliefs,

    predictions:
      organizationalPredictions,

    predictionEvaluations,

    learningProfile:
      organizationalLearningProfile,

    simulatedAt:
      now,

    timeHorizon:
      "near-term",
  });

const simulatedOrganizationStates = [
  ...(memory.simulatedOrganizationStates ?? []),
  simulatedOrganizationState,
];

console.log(
  "Simulated Organization State",
  simulatedOrganizationState,
);

const updatedMemory = {
    ...cognitivelyUpdatedRuntime.memory,

    organizationReasoningGraph,
    organizationReasoningRelationships,
    organizationalReasoning,

    organizationalExplanations,
    organizationalJudgments,
    executiveAssessment,
    organizationalConditions,
    organizationalState,
    organizationalPredictions,
    predictionReflection,
    predictionEvaluations,
    simulatedOrganizationStates,
    investigationStrategy,
    investigationOpportunities,

    functionalInterpretationState:
      organizationalDynamicsState,
    organizationalCapabilitiesState,
    organizationalPhenomenaState,
    mechanismNetwork: safeMechanismNetwork,

    organizationalUnderstandingState:
      finalOrganizationalUnderstandingState,

    organizationalBeliefRevisions: [
      ...(memory.organizationalBeliefRevisions ?? []),
      ...organizationalBeliefState.revisions,
    ],

    theories: organizationalTheoryState.theories,

    theoryEvolution: [
      ...(memory.theoryEvolution ?? []),
      ...organizationalTheoryState.theoryEvolution,
    ],

    understandingEvolution,
    memoryMaturity,

    understandingSnapshots,
    learningEvents: allLearningEvents,
    organizationalLearningProfile,

    organizationalMemory: {
      beliefs: organizationalBeliefState.beliefs,
      theories: organizationalTheoryState.theories,

      theoryEvolution: [
        ...(memory.theoryEvolution ?? []),
        ...organizationalTheoryState.theoryEvolution,
      ],

      understandingEvolution,
      maturity: memoryMaturity,

      understandingState:
        finalOrganizationalUnderstandingState,

      lastUpdatedAt: now,

      understandingSnapshots,
      learningEvents: allLearningEvents,
      organizationalLearningProfile,
      organizationalConditions,
      organizationalState,
      organizationalPredictions,
      predictionReflection,
      simulatedOrganizationStates,
      predictionEvaluations,
      investigationStrategy,
      investigationOpportunities,
    },

    understandingClusters,
    semanticConcepts,
    semanticCohorts: semanticReasoning.cohorts,
    conceptCandidates,
    conceptualUnderstanding,
    meaningSignals,
    organizationalConcepts,

    events: [
      ...cognitivelyUpdatedRuntime.memory.events,

      {
        id: eventId,
        timestamp: now,
        company: input.company,
        question: input.question,

        evidenceCount:
          result.evidence?.length ?? 0,

        beliefCount:
          result.beliefs?.length ?? 0,

        organizationalBeliefCount:
          organizationalBeliefState.beliefs.length,

        organizationalBeliefRevisionCount:
          organizationalBeliefState.revisions.length,

        organizationalTheoryCount:
          organizationalTheoryState.theories.length,

        organizationalTheoryEvolutionCount:
          organizationalTheoryState.theoryEvolution.length,

        memoryMaturityScore: memoryMaturity.score,

        themeCount:
          result.themes?.length ?? 0,

        contradictionCount:
          result.contradictions?.length ?? 0,

        understandingClusterCount:
          understandingClusters.length,

        functionalInterpretationCount:
          organizationalDynamicsState.interpretations.length,

        organizationalCapabilityCount:
          organizationalCapabilitiesState.capabilities.length,

        semanticConceptCount:
          semanticConcepts.length,

        semanticCohortCount:
          semanticReasoning.cohorts.length,

        conceptCandidateCount:
          conceptCandidates.length,

        conceptualUnderstandingCount:
          conceptualUnderstanding.length,

        organizationalConditionCount:
          organizationalConditions.length,

        organizationalStateConfidence:
          organizationalState.confidence,

        meaningSignalCount:
          meaningSignals.length,

        organizationalConceptCount:
          organizationalConcepts.length,

        organizationalPhenomenonCount:
          organizationalPhenomenaState.phenomena.length,

        mechanismCount:
          safeMechanismNetwork.mechanisms.length,

        mechanismEdgeCount:
          safeMechanismNetwork.edges.length,

        centralMechanismCount:
          safeMechanismNetwork.centralMechanismIds.length,

        organizationalReasoningPathCount:
          organizationalReasoning.paths.length,

        organizationalRootCauseCount:
          organizationalReasoning.rootCauses.length,

        organizationalReasoningConclusionCount:
          organizationalReasoning.conclusions.length,

        organizationalIndirectEffectCount:
          organizationalReasoning.indirectEffects.length,

        organizationalLeveragePointCount:
          organizationalReasoning.leveragePoints.length,

        organizationalExplanationCount:
          organizationalExplanations.length,

        organizationalJudgmentCount:
          organizationalJudgments.length,

        executiveAssessmentConfidence:
          executiveAssessment.confidence,

        organizationalUnderstandingScore:
          finalOrganizationalUnderstandingState.score.overall,

        understandingSnapshotId:
          understandingSnapshot.id,

        learningEventCount:
          learningEvents.length,

        totalLearningEventCount:
          allLearningEvents.length,

        learningVelocity:
          organizationalLearningProfile.learningVelocity,

        learningVelocityScore:
          organizationalLearningProfile.learningVelocityScore,

        understandingGrowth:
          organizationalLearningProfile.understandingGrowth,

        memoryGrowth:
          organizationalLearningProfile.memoryGrowth,

        predictionEvaluationCount:
          predictionEvaluations.length,
      },
    ],
  } as unknown as typeof cognitivelyUpdatedRuntime.memory & {
    organizationReasoningGraph:
      typeof organizationReasoningGraph;

    organizationReasoningRelationships:
      typeof organizationReasoningRelationships;

    organizationalReasoning:
      typeof organizationalReasoning;

    organizationalExplanations:
      typeof organizationalExplanations;

    organizationalJudgments:
      typeof organizationalJudgments;

    executiveAssessment:
      typeof executiveAssessment;

    mechanismNetwork:
      typeof safeMechanismNetwork;

    organizationalUnderstandingState:
      typeof finalOrganizationalUnderstandingState;

    organizationalBeliefRevisions:
      typeof organizationalBeliefState.revisions;

    theories:
      typeof organizationalTheoryState.theories;

    theoryEvolution:
      typeof organizationalTheoryState.theoryEvolution;

    understandingEvolution:
      typeof understandingEvolution;

    memoryMaturity:
      typeof memoryMaturity;

    semanticCohorts:
      typeof semanticReasoning.cohorts;

    conceptCandidates:
      typeof conceptCandidates;

    conceptualUnderstanding:
      typeof conceptualUnderstanding;

    understandingSnapshots:
      (typeof understandingSnapshot)[];

    learningEvents:
      typeof allLearningEvents;

    organizationalLearningProfile:
      typeof organizationalLearningProfile;

    organizationalConditions:
      typeof organizationalConditions;

    organizationalState:
      typeof organizationalState;

    organizationalPredictions:
      typeof organizationalPredictions;

    predictionReflection:
      typeof predictionReflection;

    predictionEvaluations:
      typeof predictionEvaluations;

    simulatedOrganizationStates:
      typeof simulatedOrganizationStates;

    investigationStrategy:
      typeof investigationStrategy;

    investigationOpportunities:
      typeof investigationOpportunities;
  };

  return {
    ...cognitivelyUpdatedRuntime,
    organizationModel,
    memory: updatedMemory,
  };
}
