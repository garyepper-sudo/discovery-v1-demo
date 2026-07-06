import type { DiscoveryV3Result } from "../types";
import type { OrganizationRuntime } from "./organizationRuntime";
import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import { buildOrganizationReasoningGraph } from "../model/buildOrganizationReasoningGraph";
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
import { runOrganizationCognition } from "../cognition/cognitionEngine";
import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";
import { consolidateUnderstanding } from "../understanding/consolidateUnderstanding";
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

  const candidateUnderstandings = (result.understanding ?? [])
    .map((understanding) => ({
      id: understanding.id,
      statement: understanding.summary || understanding.title,
      confidence: understanding.confidence,
      evidenceIds: understanding.evidenceIds ?? [],
      beliefIds: understanding.beliefIds ?? [],
      themeIds: understanding.themeIds ?? [],
      mechanismIds: understanding.mechanismIds ?? [],
      contradictionIds: [],
      source: "understanding",
    }))
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

  const updatedOrganizationalUnderstandingState: OrganizationalUnderstandingState =
    {
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
      organizationalUnderstandingState: updatedOrganizationalUnderstandingState,
      deltas: [...memory.deltas, result.delta].filter(Boolean),
    },

    organism: {
      ...runtime.organism,
      organismState: result.organismState || runtime.organism.organismState,
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
    understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,
    organizationReasoningGraph: preliminaryReasoningGraph,
    now,
  });

  console.log("Understanding Clusters", understandingClusters);

  const organizationalDynamicsState = inferFunctionalInterpretations({
    understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,
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

  const organizationalObservationState = inferOrganizationalObservations({
    evidence: result.evidence ?? [],
    entities: organizationModel.entities,
    semanticConcepts: organizationalConcepts,
    now,
  });

  const organizationalPhenomenaState = inferOrganizationalPhenomena({
    patterns: organizationalObservationState.patterns,
    clusters: understandingClusters,
    previousState: memory.organizationalPhenomenaState,
    now,
  });

  console.log("Organizational Observations", organizationalObservationState);
  console.log("Organizational Phenomena", organizationalPhenomenaState);

  const organizationReasoningGraph = buildOrganizationReasoningGraph({
    ...organizationModel,
    organizationalPhenomena: organizationalPhenomenaState,
  });

  const organizationReasoningRelationships =
    inferReasoningRelationships(organizationReasoningGraph);

  const organizationalReasoning = runOrganizationalReasoningEngine({
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

  console.log("Organization Reasoning Graph", organizationReasoningGraph);
  console.log(
    "Organization Reasoning Relationships",
    organizationReasoningRelationships,
  );
  console.log("Organizational Reasoning", organizationalReasoning);
  console.log("Organizational Explanations", organizationalExplanations);
  console.log("Organizational Judgments", organizationalJudgments);

  const detectedCapabilities = inferOrganizationalCapabilities({
    interpretations: organizationalDynamicsState.interpretations,
    organizationReasoningGraph,
  });

  console.log("Detected Capabilities", detectedCapabilities);

  const organizationalCapabilitiesState = updateOrganizationalCapabilities({
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
    edges: Array.isArray(mechanismNetwork?.edges) ? mechanismNetwork.edges : [],
    centralMechanismIds: Array.isArray(mechanismNetwork?.centralMechanismIds)
      ? mechanismNetwork.centralMechanismIds
      : [],
  };

  console.log("Mechanism Network", safeMechanismNetwork);

  const inferredOrganizationalBeliefs = inferOrganizationalBeliefs({
    mechanisms: safeMechanismNetwork.mechanisms,
    mechanismNetwork: safeMechanismNetwork.edges,
    centralMechanismIds: safeMechanismNetwork.centralMechanismIds,

    dynamics: organizationalDynamicsState.interpretations,
    understandingClusters,
    understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,

    organizationalConcepts,
    meaningSignals,
    phenomena: organizationalPhenomenaState.phenomena,

    explanations: organizationalExplanations,
    judgments: organizationalJudgments,
    capabilities: organizationalCapabilitiesState.capabilities,

    now,
  });

  const organizationalBeliefState = updateOrganizationalBeliefs({
    existingBeliefs: updatedOrganizationalUnderstandingState.organizationalBeliefs,
    incomingBeliefs: inferredOrganizationalBeliefs,
    now,
  });

  const beliefUpdatedOrganizationalUnderstandingState: OrganizationalUnderstandingState =
    {
      ...updatedOrganizationalUnderstandingState,
      organizationalBeliefs: organizationalBeliefState.beliefs,
      lastUpdatedAt: now,
    };

  const semanticReasoning = runSemanticCompression({
    dynamics: organizationalDynamicsState.interpretations,
    understandings:
      beliefUpdatedOrganizationalUnderstandingState.currentUnderstandings,
    meaningSignals,
    organizationalConcepts,
    phenomena: organizationalPhenomenaState.phenomena,
    mechanisms: safeMechanismNetwork.mechanisms,
    mechanismNetwork: safeMechanismNetwork.edges,
    mechanismPatterns: [],
    organizationalBeliefs: organizationalBeliefState.beliefs,
    understandingClusters,
  });

  const semanticConcepts = semanticReasoning.observations;

  const conceptCandidates = buildConceptCandidates({
    semanticCohorts: semanticReasoning.cohorts,
  });

  const conceptualUnderstanding = compressConceptCandidates(conceptCandidates);

  console.log("Semantic Reasoning", semanticReasoning);
  console.log("Concept Candidates", conceptCandidates);
  console.log("Conceptual Understanding", conceptualUnderstanding);

  console.log("Organizational Beliefs", organizationalBeliefState.beliefs);
  console.log(
    "Organizational Belief Revisions",
    organizationalBeliefState.revisions,
  );

  const executiveAssessment = buildExecutiveAssessment({
    judgments: organizationalJudgments,
    mechanisms: safeMechanismNetwork.mechanisms,
    conceptCandidates,
    conceptualUnderstanding,
    organizationalBeliefs: organizationalBeliefState.beliefs,
  });

  console.log("Executive Assessment", executiveAssessment);

  const updatedMemory = {
    ...cognitivelyUpdatedRuntime.memory,

    organizationReasoningGraph,
    organizationReasoningRelationships,
    organizationalReasoning,

    organizationalExplanations,
    organizationalJudgments,
    executiveAssessment,

    functionalInterpretationState: organizationalDynamicsState,
    organizationalCapabilitiesState,
    organizationalPhenomenaState,
    mechanismNetwork: safeMechanismNetwork,

    organizationalUnderstandingState:
      beliefUpdatedOrganizationalUnderstandingState,
    organizationalBeliefRevisions: [
      ...(memory.organizationalBeliefRevisions ?? []),
      ...organizationalBeliefState.revisions,
    ],

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
        evidenceCount: result.evidence?.length ?? 0,
        beliefCount: result.beliefs?.length ?? 0,
        organizationalBeliefCount: organizationalBeliefState.beliefs.length,
        organizationalBeliefRevisionCount:
          organizationalBeliefState.revisions.length,
        themeCount: result.themes?.length ?? 0,
        contradictionCount: result.contradictions?.length ?? 0,
        understandingClusterCount: understandingClusters.length,
        functionalInterpretationCount:
          organizationalDynamicsState.interpretations.length,
        organizationalCapabilityCount:
          organizationalCapabilitiesState.capabilities.length,
        semanticConceptCount: semanticConcepts.length,
        semanticCohortCount: semanticReasoning.cohorts.length,
        conceptCandidateCount: conceptCandidates.length,
        conceptualUnderstandingCount: conceptualUnderstanding.length,
        meaningSignalCount: meaningSignals.length,
        organizationalConceptCount: organizationalConcepts.length,
        organizationalPhenomenonCount:
          organizationalPhenomenaState.phenomena.length,
        mechanismCount: safeMechanismNetwork.mechanisms.length,
        mechanismEdgeCount: safeMechanismNetwork.edges.length,
        centralMechanismCount: safeMechanismNetwork.centralMechanismIds.length,
        organizationalReasoningPathCount: organizationalReasoning.paths.length,
        organizationalRootCauseCount: organizationalReasoning.rootCauses.length,
        organizationalReasoningConclusionCount:
          organizationalReasoning.conclusions.length,
        organizationalIndirectEffectCount:
          organizationalReasoning.indirectEffects.length,
        organizationalLeveragePointCount:
          organizationalReasoning.leveragePoints.length,
        organizationalExplanationCount: organizationalExplanations.length,
        organizationalJudgmentCount: organizationalJudgments.length,
        executiveAssessmentConfidence: executiveAssessment.confidence,
      },
    ],
  } as unknown as typeof cognitivelyUpdatedRuntime.memory & {
    organizationReasoningGraph: typeof organizationReasoningGraph;
    organizationReasoningRelationships: typeof organizationReasoningRelationships;
    organizationalReasoning: typeof organizationalReasoning;
    organizationalExplanations: typeof organizationalExplanations;
    organizationalJudgments: typeof organizationalJudgments;
    executiveAssessment: typeof executiveAssessment;
    mechanismNetwork: typeof safeMechanismNetwork;
    organizationalUnderstandingState: typeof beliefUpdatedOrganizationalUnderstandingState;
    organizationalBeliefRevisions: typeof organizationalBeliefState.revisions;
    semanticCohorts: typeof semanticReasoning.cohorts;
    conceptCandidates: typeof conceptCandidates;
    conceptualUnderstanding: typeof conceptualUnderstanding;
  };

  return {
    ...cognitivelyUpdatedRuntime,
    organizationModel,
    memory: updatedMemory,
  };
}