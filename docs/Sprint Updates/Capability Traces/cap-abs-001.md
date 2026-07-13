# Capability Trace — Organizational Concept Formation

Generated: 2026-07-13T01:15:59.075Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-ABS-001` |
| Capability name | Organizational Concept Formation |
| Cognitive domain | ABS |
| Architectural layer | COG |
| Canonical producer | `engine/v3/concepts/synthesizeOrganizationalConcepts.ts` |
| Runtime destination | `OrganizationModel.concepts` |
| Executive destination | `ExecutiveAssessment, ExecutiveProjection` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `OrganizationalConcept`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/compression/types.ts`
- `engine/v3/concepts/buildConceptCandidates.ts`
- `engine/v3/concepts/compressConceptCandidates.ts`
- `engine/v3/concepts/conceptCandidateTypes.ts`
- `engine/v3/concepts/synthesizeOrganizationalConcepts.ts`

### Capability Dependencies

- `CAP-UND-001`
- `CAP-UND-002`

### Declared Consumers

- `CAP-UND-003`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-ABS-001 |
| Canonical producer declared | ✅ | engine/v3/concepts/synthesizeOrganizationalConcepts.ts |
| Canonical producer exists | ✅ | engine/v3/concepts/synthesizeOrganizationalConcepts.ts |
| Implementation files | ✅ | 5 declared file(s) exist. |
| Runtime destination | ✅ | OrganizationModel.concepts |
| Executive destination | ✅ | ExecutiveAssessment, ExecutiveProjection |
| Consumers | ✅ | 1 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `app/page.tsx`
- `components/ActionPanel.tsx`
- `components/BeliefCard.tsx`
- `components/DeveloperPanel.tsx`
- `components/EvidencePrompt.tsx`
- `components/InspectionDrawer.tsx`
- `components/InvestigationNarrative.tsx`
- `components/StewardshipBrief.tsx`
- `components/UnderstandingTimeline.tsx`
- `components/cognition-lab/CognitiveLabPage.tsx`
- `components/executive-v2/ExecutiveExperience.tsx`
- `components/executive-v2/beliefs/ExecutiveBeliefs.tsx`
- `components/executive-v2/concepts/ExecutiveConcepts.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `components/executive/currentTheory/CurrentWorkingTheory.tsx`
- `components/investigation/ActionPanel.tsx`
- `components/investigation/DeveloperPanel.tsx`
- `components/investigation/EvidencePrompt.tsx`
- `components/investigation/InspectionDrawer.tsx`
- `components/investigation/InvestigationNarrative.tsx`
- `components/results/SemanticConceptInspector.tsx`
- `components/understanding/BeliefCard.tsx`
- `components/understanding/StewardshipBrief.tsx`
- `components/understanding/UnderstandingTimeline.tsx`
- `engine/atomize.ts`
- `engine/beliefs.ts`
- `engine/benchmark/architecture/index.ts`
- `engine/benchmark/architecture/verifyDependencies.ts`
- `engine/benchmark/architecture/verifyExecutive.ts`
- `engine/benchmark/architecture/verifyOperatingSystemCoverage.ts`
- `engine/benchmark/architecture/verifyOperatingSystems.ts`
- `engine/benchmark/architecture/verifyProducers.ts`
- `engine/benchmark/architecture/verifyRuntime.ts`
- `engine/benchmark/auditCapability.ts`
- `engine/benchmark/auditUnderstandingLayers.ts`
- `engine/benchmark/benchmarkReporter.ts`
- `engine/benchmark/benchmarkRunner.ts`
- `engine/benchmark/benchmarkScorer.ts`
- `engine/benchmark/benchmarkTypes.ts`
- `engine/benchmark/datasets/approval-bottleneck.json`
- `engine/benchmark/datasets/knowledge-fragmentation.json`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/understandingFitnessScorer.ts`
- `engine/brief.ts`
- `engine/concepts.ts`
- `engine/extractEvidence.ts`
- `engine/graph.ts`
- `engine/hypotheses.ts`
- `engine/index.ts`
- `engine/observations.ts`
- `engine/parse.ts`
- `engine/reasoning.ts`
- `engine/signals.ts`
- `engine/surprise.ts`
- `engine/tensions.ts`
- `engine/understanding.ts`
- `engine/understandingObject.ts`
- `engine/v2/index.ts`
- `engine/v3/beliefs.ts`
- `engine/v3/capabilities/inferOrganizationalCapabilities.ts`
- `engine/v3/causal.ts`
- `engine/v3/cognition/beliefs/mergeBeliefs.ts`
- `engine/v3/cognition/cognitionEngine.ts`
- `engine/v3/cognition/comparison/comparisonEngine.ts`
- `engine/v3/cognition/createInitialUnderstandingState.ts`
- `engine/v3/cognition/evolutionEngine.ts`
- `engine/v3/cognition/inference/beliefInference.ts`
- `engine/v3/cognition/observations/mergeObservations.ts`
- `engine/v3/cognition/organism/organismEvolution.ts`
- `engine/v3/cognition/patterns/mergePatterns.ts`
- `engine/v3/cognition/patterns/patternThemeCompression.ts`
- `engine/v3/cognition/semanticSimilarity.ts`
- `engine/v3/cognition/testEvolution.ts`
- `engine/v3/compression/consolidateMechanismFamilies.ts`
- `engine/v3/compression/reinforcePatternsFromBeliefs.ts`
- `engine/v3/compression/semanticCompression.ts`
- `engine/v3/confidencePropagation.ts`
- `engine/v3/contradictions.ts`
- `engine/v3/delta.ts`
- `engine/v3/dialectic.ts`
- `engine/v3/emergence.ts`
- `engine/v3/evidence.ts`
- `engine/v3/evidenceGraph.ts`
- `engine/v3/evidenceNetwork.ts`
- `engine/v3/evidenceRelationships.ts`
- `engine/v3/evidenceWeighting.ts`
- `engine/v3/executive/buildExecutiveDashboard.ts`
- `engine/v3/executive/expression/executiveConversation.ts`
- `engine/v3/executive/expression/executiveVoice.ts`
- `engine/v3/executive/interpretations/buildExecutiveInterpretation.ts`
- `engine/v3/executive/interpretations/competingExplanations.ts`
- `engine/v3/executive/interpretations/confidenceNarrative.ts`
- `engine/v3/executive/interpretations/explanationBuilder.ts`
- `engine/v3/executive/interpretations/uncertaintyNarrative.ts`
- `engine/v3/explanations.ts`
- `engine/v3/hypotheses.ts`
- `engine/v3/index.ts`
- `engine/v3/meaning/extractMeaning.ts`
- `engine/v3/meaning/meaningCatalog.ts`
- `engine/v3/mechanism.ts`
- `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`
- `engine/v3/model/buildOrganizationReasoningGraph.ts`
- `engine/v3/model/cognition/cognitiveOntology.ts`
- `engine/v3/model/inferReasoningRelationships.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildExecutivePriority.ts`
- `engine/v3/model/judgment/buildTheoryReflection.ts`
- `engine/v3/model/judgment/formOrganizationalTheories.ts`
- `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`
- `engine/v3/model/judgment/mechanismCandidateBuilder.ts`
- `engine/v3/model/judgment/mechanismInferenceTypes.ts`
- `engine/v3/model/judgment/mechanismInterpreter.ts`
- `engine/v3/model/judgment/mechanismSignals.ts`
- `engine/v3/model/judgment/organizationalMechanism.ts`
- `engine/v3/model/judgment/organizationalTheory.ts`
- `engine/v3/model/judgment/synthesizeExplanations.ts`
- `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`
- `engine/v3/model/memory/calculateMemoryMaturity.ts`
- `engine/v3/model/memory/consolidateOrganizationalTheories.ts`
- `engine/v3/model/memory/organizationalMemory.ts`
- `engine/v3/model/memory/organizationalTheories.ts`
- `engine/v3/model/observations/inferOrganizationalObservations.ts`
- `engine/v3/model/observations/organizationalObservations.ts`
- `engine/v3/model/organizationModel.ts`
- `engine/v3/model/predictions/buildPredictionReflection.ts`
- `engine/v3/model/predictions/inferOrganizationalPredictions.ts`
- `engine/v3/model/predictions/organizationalPrediction.ts`
- `engine/v3/model/reasoning/analyzeRootCauses.ts`
- `engine/v3/model/reasoning/classifyReasoningPath.ts`
- `engine/v3/model/reasoning/discoverReasoningPaths.ts`
- `engine/v3/model/reasoning/explainReasoningChain.ts`
- `engine/v3/model/reasoning/identifyLeveragePoints.ts`
- `engine/v3/model/reasoning/index.ts`
- `engine/v3/model/reasoning/inferIndirectEffects.ts`
- `engine/v3/model/reasoning/organizationalReasoningEngine.ts`
- `engine/v3/model/state/inferOrganizationalConditions.ts`
- `engine/v3/observations.ts`
- `engine/v3/organismState.ts`
- `engine/v3/phenomena/inferOrganizationalPhenomena.ts`
- `engine/v3/phenomena/organizationalPhenomena.ts`
- `engine/v3/priority.ts`
- `engine/v3/projection/ExecutiveProjectionCompiler.ts`
- `engine/v3/reasoningGraph.ts`
- `engine/v3/runtime/evolveOrganizationRuntime.ts`
- `engine/v3/runtime/organizationRuntime.ts`
- `engine/v3/runtime/organizationalUnderstandingState.ts`
- `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`
- `engine/v3/semantic/buildCognitiveObservations.ts`
- `engine/v3/semantic/buildSemanticCohorts.ts`
- `engine/v3/semantic/buildSemanticObservations.ts`
- `engine/v3/semantic/index.ts`
- `engine/v3/semantic/scoreSemanticCohorts.ts`
- `engine/v3/semantic/types.ts`
- `engine/v3/signals.ts`
- `engine/v3/themeRelationships.ts`
- `engine/v3/themes.ts`
- `engine/v3/types.ts`
- `engine/v3/understanding.ts`
- `engine/v3/understanding/compress.ts`
- `engine/v3/understanding/explain.ts`
- `engine/v3/understanding/index.ts`
- `engine/v3/understanding/narrative.ts`
- `engine/v3/understanding/prioritize.ts`
- `engine/v3/understanding/recommend.ts`
- `engine/v3/understanding/synthesizeUnderstanding.ts`
- `engine/v3/understanding/types.ts`
- `engine/v3/understandingObject.ts`
- `engine/v3/understandingSynthesizer.ts`
- `engine/v3/workspace.ts`
- `engine/workspace.ts`
- `scripts/cognition/discoverCapabilities.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Organizational Concept Formation`
- `organizationalConceptFormation`
- `OrganizationalConceptFormation`
- `organizational-concept-formation`
- `organizational concept formation`
- `CAP-ABS-001`
- `capAbs001`
- `CapAbs001`
- `cap-abs-001`
- `buildConceptCandidates`
- `BuildConceptCandidates`
- `build-concept-candidates`
- `buildconceptcandidates`
- `compressConceptCandidates`
- `CompressConceptCandidates`
- `compress-concept-candidates`
- `compressconceptcandidates`
- `conceptCandidateTypes`
- `ConceptCandidateTypes`
- `concept-candidate-types`
- `conceptcandidatetypes`
- `synthesizeOrganizationalConcepts`
- `SynthesizeOrganizationalConcepts`
- `synthesize-organizational-concepts`
- `synthesizeorganizationalconcepts`
- `types`
- `Types`
- `concepts`
- `Concepts`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 359 |
| Runtime | ✅ Found | 32 |
| Executive | ✅ Found | 10 |
| Projection | ✅ Found | 16 |
| UI | ✅ Found | 46 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 68 |
| Other | ✅ Found | 5 |

### Detailed Matches

#### Engine

##### `engine/atomize.ts`

- Line 1 · **import** · matched `types`
  - `import { CognitiveAtom } from "./types";`

##### `engine/beliefs.ts`

- Line 1 · **import** · matched `types`
  - `import { CognitiveAtom } from "./types";`
- Line 60 · **unknown** · matched `concepts`
  - `"Multiple concepts point toward an executive operating model."`

##### `engine/brief.ts`

- Line 9 · **import** · matched `types`
  - `} from "./types";`

##### `engine/concepts.ts`

- Line 1 · **import** · matched `types`
  - `import { CognitiveAtom } from "./types";`
- Line 17 · **unknown** · matched `concepts`
  - `export function extractConcepts(atoms: CognitiveAtom[]): StrategicConcept[] {`

##### `engine/extractEvidence.ts`

- Line 1 · **import** · matched `types`
  - `import { Evidence, InvestigationInput, ParsedInput } from "./types";`

##### `engine/graph.ts`

- Line 1 · **import** · matched `types`
  - `import { CognitiveAtom, KnowledgeGraph } from "./types";`
- Line 2 · **import** · matched `concepts`
  - `import { extractConcepts } from "./concepts";`
- Line 5 · **definition** · matched `concepts`
  - `const concepts = extractConcepts(atoms);`
- Line 14 · **unknown** · matched `concepts`
  - `for (const concept of concepts) {`

##### `engine/hypotheses.ts`

- Line 1 · **import** · matched `types`
  - `import { StrategicTension } from "./types";`

##### `engine/index.ts`

- Line 11 · **import** · matched `types`
  - `import { InvestigationInput, EngineResult } from "./types";`

##### `engine/observations.ts`

- Line 1 · **import** · matched `types`
  - `import { Observation, ParsedInput } from "./types";`

##### `engine/parse.ts`

- Line 1 · **import** · matched `types`
  - `import { InvestigationInput, ParsedInput } from "./types";`

##### `engine/reasoning.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`

##### `engine/signals.ts`

- Line 1 · **import** · matched `types`
  - `import { InvestigationInput, Observation, Signal } from "./types";`

##### `engine/surprise.ts`

- Line 1 · **import** · matched `types`
  - `import { Observation, Signal, Surprise } from "./types";`

##### `engine/tensions.ts`

- Line 1 · **import** · matched `types`
  - `import { KnowledgeGraph } from "./types";`

##### `engine/understanding.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/understandingObject.ts`

- Line 1 · **import** · matched `types`
  - `import { EngineResult } from "./types";`

##### `engine/v2/index.ts`

- Line 1 · **import** · matched `types`
  - `import { InvestigationInput } from "../types";`

##### `engine/v3/beliefs.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/capabilities/inferOrganizationalCapabilities.ts`

- Line 384 · **unknown** · matched `types`
  - `...(node.possibleMechanismTypes ?? []),`

##### `engine/v3/causal.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/cognition/beliefs/mergeBeliefs.ts`

- Line 4 · **import** · matched `types`
  - `} from "../../understanding/types";`

##### `engine/v3/cognition/cognitionEngine.ts`

- Line 1 · **import** · matched `types`
  - `import type { DiscoveryV3Result } from "../types";`

##### `engine/v3/cognition/comparison/comparisonEngine.ts`

- Line 5 · **import** · matched `types`
  - `} from "../../understanding/types";`

##### `engine/v3/cognition/createInitialUnderstandingState.ts`

- Line 1 · **import** · matched `types`
  - `import { UnderstandingState } from "../understanding/types";`

##### `engine/v3/cognition/evolutionEngine.ts`

- Line 6 · **import** · matched `types`
  - `} from "../understanding/types";`

##### `engine/v3/cognition/inference/beliefInference.ts`

- Line 5 · **import** · matched `types`
  - `} from "../../understanding/types";`

##### `engine/v3/cognition/observations/mergeObservations.ts`

- Line 5 · **import** · matched `types`
  - `} from "../../understanding/types";`

##### `engine/v3/cognition/organism/organismEvolution.ts`

- Line 6 · **import** · matched `types`
  - `} from "../../understanding/types";`

##### `engine/v3/cognition/patterns/mergePatterns.ts`

- Line 4 · **import** · matched `types`
  - `} from "../../understanding/types";`

##### `engine/v3/cognition/patterns/patternThemeCompression.ts`

- Line 1 · **import** · matched `types`
  - `import type { PatternLike } from "../../model/judgment/mechanismInferenceTypes";`

##### `engine/v3/cognition/semanticSimilarity.ts`

- Line 10 · **unknown** · matched `concepts`
  - `sharedConcepts: string[];`
- Line 95 · **unknown** · matched `concepts`
  - `function extractConcepts(text: string): string[] {`
- Line 97 · **type** · matched `concepts`
  - `const concepts: string[] = [];`
- Line 101 · **unknown** · matched `concepts`
  - `concepts.push(concept);`
- Line 105 · **unknown** · matched `concepts`
  - `return concepts;`
- Line 125 · **definition** · matched `concepts`
  - `const conceptsA = extractConcepts(a);`
- Line 126 · **definition** · matched `concepts`
  - `const conceptsB = extractConcepts(b);`
- Line 128 · **unknown** · matched `concepts`
  - `const sharedConcepts = conceptsA.filter((concept) => conceptsB.includes(concept));`
- Line 130 · **unknown** · matched `concepts`
  - `const conceptScore =`
- Line 131 · **unknown** · matched `concepts`
  - `sharedConcepts.length === 0`
- Line 133 · **read** · matched `concepts`
  - `: sharedConcepts.length / new Set([...conceptsA, ...conceptsB]).size;`
- Line 137 · **unknown** · matched `concepts`
  - `const score = Math.min(1, conceptScore * 0.75 + tokenScore * 0.25);`
- Line 141 · **unknown** · matched `concepts`
  - `sharedConcepts,`
- Line 143 · **unknown** · matched `concepts`
  - `sharedConcepts.length > 0`
- Line 144 · **type** · matched `concepts`
  - `? \`Shared semantic concepts: ${sharedConcepts.join(", ")}\``
- Line 145 · **unknown** · matched `concepts`
  - `: "No strong shared semantic concepts detected.",`

##### `engine/v3/cognition/testEvolution.ts`

- Line 5 · **import** · matched `types`
  - `import { UnderstandingEngineInput } from "../understanding/types";`

##### `engine/v3/compression/consolidateMechanismFamilies.ts`

- Line 9 · **unknown** · matched `types`
  - `dominantMechanismTypes: string[];`
- Line 125 · **unknown** · matched `types`
  - `const dominantMechanismTypes = Array.from(`
- Line 156 · **unknown** · matched `types`
  - `dominantMechanismTypes,`

##### `engine/v3/compression/reinforcePatternsFromBeliefs.ts`

- Line 1 · **import** · matched `types`
  - `import type { PersistentBelief } from "../understanding/types";`

##### `engine/v3/compression/semanticCompression.ts`

- Line 7 · **import** · matched `types`
  - `import type { OrganizationalConcept } from "./types";`
- Line 42 · **unknown** · matched `concepts`
  - `organizationalConcepts?: SourceRecord[];`
- Line 301 · **unknown** · matched `concepts`
  - `function createThematicFallbackConcepts(`
- Line 382 · **unknown** · matched `concepts`
  - `const thematicFallbacks = createThematicFallbackConcepts(understandings);`
- Line 409 · **unknown** · matched `concepts`
  - `for (const fallbackConcept of createThematicFallbackConcepts(understandings)) {`
- Line 447 · **unknown** · matched `concepts`
  - `organizationalConcepts: asArray(params.organizationalConcepts),`

##### `engine/v3/compression/types.ts`

- Line 1 · **unknown** · matched `concepts`
  - `export type OrganizationalConceptStatus =`
- Line 26 · **unknown** · matched `concepts`
  - `status: OrganizationalConceptStatus;`

##### `engine/v3/concepts/buildConceptCandidates.ts`

- Line 2 · **import** · matched `conceptCandidateTypes`
  - `import type { ConceptCandidate, ConceptCandidateSourceType } from "./conceptCandidateTypes";`
- Line 4 · **unknown** · matched `buildConceptCandidates`
  - `export type BuildConceptCandidatesParams = {`
- Line 13 · **type** · matched `concepts`
  - `concepts: string[];`
- Line 22 · **unknown** · matched `concepts`
  - `matchedConcepts: string[];`
- Line 28 · **unknown** · matched `types`
  - `const THEORY_PROTOTYPES: TheoryPrototype[] = [`
- Line 56 · **type** · matched `concepts`
  - `concepts: [`
- Line 95 · **type** · matched `concepts`
  - `concepts: [`
- Line 133 · **type** · matched `concepts`
  - `concepts: [`
- Line 171 · **type** · matched `concepts`
  - `concepts: [`
- Line 208 · **type** · matched `concepts`
  - `concepts: [`
- Line 245 · **type** · matched `concepts`
  - `concepts: [`
- Line 282 · **type** · matched `concepts`
  - `concepts: [`
- Line 330 · **unknown** · matched `types`
  - `sourceTypes: SemanticObservationSourceType[],`
- Line 342 · **unknown** · matched `types`
  - `return sourceTypes.find((sourceType): sourceType is ConceptCandidateSourceType =>`
- Line 366 · **type** · matched `concepts`
  - `concepts: string[];`
- Line 370 · **unknown** · matched `concepts`
  - `const canonicalConcepts = cohort.canonicalMeaning.conceptIds.map(normalize);`
- Line 381 · **read** · matched `concepts`
  - `const conceptMatches = prototype.concepts.filter((concept) => {`
- Line 385 · **unknown** · matched `concepts`
  - `canonicalConcepts.includes(normalizedConcept) \|\|`
- Line 393 · **type** · matched `concepts`
  - `concepts: unique(conceptMatches),`
- Line 411 · **unknown** · matched `types`
  - `return new Set(cohort.sourceTypes).size;`
- Line 428 · **unknown** · matched `concepts`
  - `matchedConcepts: string[],`
- Line 431 · **unknown** · matched `concepts`
  - `...matchedConcepts,`
- Line 442 · **unknown** · matched `concepts`
  - `matchedConcepts: string[];`
- Line 444 · **unknown** · matched `concepts`
  - `const { prototype, matchedKeywords, matchedConcepts } = params;`
- Line 447 · **unknown** · matched `concepts`
  - `const conceptScore = clamp01(matchedConcepts.length / 3);`
- Line 450 · **unknown** · matched `concepts`
  - `return clamp01(keywordScore * 0.4 + conceptScore * 0.6 - weakPenalty * 0.25);`
- Line 455 · **unknown** · matched `concepts`
  - `matchedConcepts: string[];`
- Line 459 · **unknown** · matched `concepts`
  - `const { cohort, matchedConcepts, matchedKeywords, prototype } = params;`
- Line 465 · **unknown** · matched `concepts`
  - `const enoughConcepts = matchedConcepts.length >= 1;`
- Line 471 · **unknown** · matched `concepts`
  - `(enoughConcepts \|\| enoughKeywords) &&`
- Line 480 · **unknown** · matched `types`
  - `return THEORY_PROTOTYPES.flatMap((prototype) =>`
- Line 487 · **read** · matched `concepts`
  - `matchedConcepts: matches.concepts,`
- Line 500 · **read** · matched `concepts`
  - `matchedConcepts: matches.concepts,`
- Line 502 · **read** · matched `concepts`
  - `explanatoryBreadth: explanatoryBreadthScore(cohort, matches.concepts),`
- Line 506 · **read** · matched `concepts`
  - `matchedConcepts: matches.concepts,`
- Line 541 · **unknown** · matched `concepts`
  - `interpretation.matchedConcepts.length > 0`
- Line 542 · **unknown** · matched `concepts`
  - `? \`${interpretation.matchedConcepts.length} matched canonical concepts\``
- Line 562 · **unknown** · matched `types`
  - `sourceType: conceptCandidateSourceType(cohort.sourceTypes),`
- Line 573 · **unknown** · matched `concepts`
  - `...interpretation.matchedConcepts,`
- Line 657 · **definition** · matched `buildConceptCandidates`
  - `export function buildConceptCandidates(`
- Line 658 · **unknown** · matched `buildConceptCandidates`
  - `params: BuildConceptCandidatesParams,`

##### `engine/v3/concepts/compressConceptCandidates.ts`

- Line 1 · **import** · matched `conceptCandidateTypes`
  - `import type { ConceptCandidate } from "./conceptCandidateTypes";`
- Line 2 · **import** · matched `types`
  - `import type { OrganizationalConcept } from "../compression/types";`
- Line 58 · **unknown** · matched `concepts`
  - `function conceptStatus(params: {`
- Line 833 · **unknown** · matched `concepts`
  - `status: conceptStatus({ confidence, stability }),`
- Line 844 · **definition** · matched `compressConceptCandidates`
  - `export function compressConceptCandidates(`

##### `engine/v3/concepts/conceptCandidateTypes.ts`

- Line 7 · **unknown** · matched `concepts`
  - `* Organizational Concepts.`

##### `engine/v3/concepts/synthesizeOrganizationalConcepts.ts`

- Line 1 · **import** · matched `types`
  - `import type { MeaningSignal, OrganizationalMeaningId } from "../meaning/types";`
- Line 491 · **unknown** · matched `concepts`
  - `function mergeConcepts(`
- Line 492 · **unknown** · matched `concepts`
  - `existingConcepts: OrganizationalConcept[],`
- Line 493 · **unknown** · matched `concepts`
  - `synthesizedConcepts: OrganizationalConcept[]`
- Line 495 · **unknown** · matched `concepts`
  - `const merged = [...existingConcepts];`
- Line 497 · **unknown** · matched `concepts`
  - `for (const concept of synthesizedConcepts) {`
- Line 550 · **definition** · matched `synthesizeOrganizationalConcepts`
  - `export function synthesizeOrganizationalConcepts(params: {`
- Line 552 · **unknown** · matched `concepts`
  - `existingConcepts?: OrganizationalConcept[];`
- Line 554 · **unknown** · matched `concepts`
  - `const { meaningSignals, existingConcepts = [] } = params;`
- Line 556 · **unknown** · matched `concepts`
  - `if (!meaningSignals.length) return existingConcepts;`
- Line 558 · **unknown** · matched `concepts`
  - `const recipeConcepts = CONCEPT_RECIPES.map((recipe) => {`
- Line 573 · **unknown** · matched `concepts`
  - `const emergentConcepts = meaningClusters.map((cluster) =>`
- Line 580 · **unknown** · matched `concepts`
  - `return mergeConcepts(existingConcepts, [`
- Line 581 · **unknown** · matched `concepts`
  - `...emergentConcepts,`
- Line 582 · **unknown** · matched `concepts`
  - `...recipeConcepts,`

##### `engine/v3/confidencePropagation.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/contradictions.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/delta.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/dialectic.ts`

- Line 1 · **import** · matched `types`
  - `import { V3Belief } from "./types";`

##### `engine/v3/emergence.ts`

- Line 8 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/evidence.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/evidenceGraph.ts`

- Line 5 · **import** · matched `types`
  - `} from "./types";`
- Line 32 · **unknown** · matched `types`
  - `dominantRelationshipTypes: V3EvidenceRelationshipType[];`
- Line 136 · **unknown** · matched `types`
  - `dominantRelationshipTypes: getDominantRelationshipTypes(`
- Line 183 · **unknown** · matched `types`
  - `function getDominantRelationshipTypes(`

##### `engine/v3/evidenceNetwork.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`
- Line 18 · **unknown** · matched `types`
  - `dominantRelationshipTypes: V3EvidenceRelationshipType[];`
- Line 47 · **unknown** · matched `types`
  - `dominantRelationshipTypes: getDominantRelationshipTypes(relationships),`
- Line 55 · **unknown** · matched `types`
  - `function getDominantRelationshipTypes(`

##### `engine/v3/evidenceRelationships.ts`

- Line 5 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/evidenceWeighting.ts`

- Line 1 · **import** · matched `types`
  - `import { V3Evidence } from "./types";`

##### `engine/v3/explanations.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/hypotheses.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/index.ts`

- Line 1 · **import** · matched `types`
  - `import { InvestigationInput } from "../types";`
- Line 25 · **import** · matched `types`
  - `import { DiscoveryV3Result } from "./types";`

##### `engine/v3/meaning/extractMeaning.ts`

- Line 2 · **import** · matched `types`
  - `import type { MeaningSignal } from "./types";`

##### `engine/v3/meaning/meaningCatalog.ts`

- Line 1 · **import** · matched `types`
  - `import type { OrganizationalMeaningId } from "./types";`

##### `engine/v3/mechanism.ts`

- Line 10 · **import** · matched `types`
  - `} from "./types";`
- Line 135 · **unknown** · matched `types`
  - `const relationshipTypes = relationships.map((item) => item.type);`
- Line 138 · **unknown** · matched `types`
  - `const type = inferMechanismType(relationshipTypes, combinedText, evidence);`
- Line 186 · **unknown** · matched `types`
  - `relationshipTypes: V3EvidenceRelationshipType[],`
- Line 191 · **unknown** · matched `types`
  - `relationshipTypes.includes("contradicts") \|\|`
- Line 198 · **unknown** · matched `types`
  - `relationshipTypes.includes("depends_on") \|\|`
- Line 205 · **unknown** · matched `types`
  - `relationshipTypes.includes("explains") \|\|`
- Line 216 · **unknown** · matched `types`
  - `relationshipTypes.filter((type) => type === "supports").length >= 1 \|\|`
- Line 217 · **unknown** · matched `types`
  - `relationshipTypes.includes("duplicates")`

##### `engine/v3/model/beliefs/inferOrganizationalBeliefs.ts`

- Line 180 · **unknown** · matched `concepts`
  - `organizationalConcepts?: SemanticObservationInput[];`
- Line 199 · **unknown** · matched `concepts`
  - `organizationalConcepts: asArray(params.organizationalConcepts),`

##### `engine/v3/model/buildOrganizationReasoningGraph.ts`

- Line 22 · **unknown** · matched `types`
  - `possibleMechanismTypes?: string[];`
- Line 188 · **unknown** · matched `types`
  - `possibleMechanismTypes: Array.isArray(phenomenon.possibleMechanismTypes)`
- Line 189 · **unknown** · matched `types`
  - `? phenomenon.possibleMechanismTypes`
- Line 254 · **unknown** · matched `types`
  - `const sourceMechanisms = new Set(source.possibleMechanismTypes ?? []);`
- Line 255 · **unknown** · matched `types`
  - `const hasSharedMechanism = (target.possibleMechanismTypes ?? []).some(`

##### `engine/v3/model/cognition/cognitiveOntology.ts`

- Line 118 · **unknown** · matched `concepts`
  - `export const DEPRECATED_COGNITIVE_CONCEPTS = [`
- Line 135 · **unknown** · matched `concepts`
  - `"Semantic concepts should support compression and labeling without competing with the ontology.",`

##### `engine/v3/model/inferReasoningRelationships.ts`

- Line 45 · **unknown** · matched `types`
  - `...(node.possibleMechanismTypes ?? []),`
- Line 363 · **unknown** · matched `types`
  - `const sourceMechanisms = new Set(source.possibleMechanismTypes ?? []);`
- Line 364 · **unknown** · matched `types`
  - `const sharedMechanism = (target.possibleMechanismTypes ?? []).find(`

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 17 · **import** · matched `conceptCandidateTypes`
  - `import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";`

##### `engine/v3/model/judgment/buildExecutivePriority.ts`

- Line 3 · **import** · matched `conceptCandidateTypes`
  - `import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";`

##### `engine/v3/model/judgment/buildTheoryReflection.ts`

- Line 8 · **import** · matched `conceptCandidateTypes`
  - `import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";`

##### `engine/v3/model/judgment/formOrganizationalTheories.ts`

- Line 79 · **unknown** · matched `types`
  - `const explanationTypes = unique(`
- Line 140 · **unknown** · matched `types`
  - `explanationTypes,`

##### `engine/v3/model/judgment/inferOrganizationalMechanisms.ts`

- Line 8 · **import** · matched `types`
  - `import type { InferOrganizationalMechanismsInput } from "./mechanismInferenceTypes";`
- Line 24 · **unknown** · matched `concepts`
  - `semanticConcepts: asArray(safeSource.semanticConcepts),`
- Line 36 · **unknown** · matched `concepts`
  - `safeInput.semanticConcepts.length > 0 \|\|`

##### `engine/v3/model/judgment/mechanismCandidateBuilder.ts`

- Line 7 · **import** · matched `types`
  - `} from "./mechanismInferenceTypes";`
- Line 387 · **unknown** · matched `concepts`
  - `const semanticConcepts = asArray(input.semanticConcepts);`
- Line 398 · **unknown** · matched `concepts`
  - `semanticConcepts.length > 0 \|\|`
- Line 414 · **unknown** · matched `concepts`
  - `semanticConcepts,`
- Line 421 · **unknown** · matched `types`
  - `const possibleMechanismTypes = unique(`
- Line 422 · **unknown** · matched `types`
  - `phenomenon.possibleMechanismTypes ?? [],`
- Line 425 · **unknown** · matched `types`
  - `possibleMechanismTypes.forEach((mechanismType) => {`

##### `engine/v3/model/judgment/mechanismInferenceTypes.ts`

- Line 25 · **unknown** · matched `types`
  - `possibleMechanismTypes?: string[];`
- Line 57 · **unknown** · matched `concepts`
  - `* Semantic concepts represent compressed organizational understanding.`
- Line 111 · **unknown** · matched `concepts`
  - `* Concepts can reinforce or contextualize operating forces.`
- Line 113 · **unknown** · matched `concepts`
  - `semanticConcepts?: SemanticConceptLike[];`

##### `engine/v3/model/judgment/mechanismInterpreter.ts`

- Line 7 · **import** · matched `types`
  - `import type { MechanismCandidate } from "./mechanismInferenceTypes";`

##### `engine/v3/model/judgment/mechanismSignals.ts`

- Line 7 · **import** · matched `types`
  - `} from "./mechanismInferenceTypes";`
- Line 38 · **unknown** · matched `concepts`
  - `semanticConcepts?: SemanticConceptLike[];`
- Line 50 · **unknown** · matched `types`
  - `...asArray(phenomenon.possibleMechanismTypes),`
- Line 85 · **unknown** · matched `concepts`
  - `const semanticConceptSignals: MechanismSignal[] = asArray(`
- Line 86 · **unknown** · matched `concepts`
  - `params.semanticConcepts,`
- Line 120 · **unknown** · matched `concepts`
  - `...semanticConceptSignals,`

##### `engine/v3/model/judgment/organizationalMechanism.ts`

- Line 22 · **unknown** · matched `types`
  - `// Legacy mechanism types (temporary compatibility)`
- Line 100 · **unknown** · matched `concepts`
  - `* These allow capabilities, phenomena, clusters, and concepts`
- Line 128 · **unknown** · matched `concepts`
  - `semanticConceptSupportCount?: number;`

##### `engine/v3/model/judgment/organizationalTheory.ts`

- Line 64 · **unknown** · matched `types`
  - `explanationTypes: OrganizationalExplanationType[];`

##### `engine/v3/model/judgment/synthesizeExplanations.ts`

- Line 5 · **import** · matched `types`
  - `import type { OrganizationalReasoningPath } from "../reasoning/reasoningTypes";`

##### `engine/v3/model/learning/computeOrganizationalLearningProfile.ts`

- Line 242 · **unknown** · matched `concepts`
  - `recommendations.push("Documents that reuse or clarify recurring organizational concepts");`

##### `engine/v3/model/memory/calculateMemoryMaturity.ts`

- Line 29 · **unknown** · matched `concepts`
  - `const conceptStability = scoreCount(conceptCount, 8);`
- Line 38 · **unknown** · matched `concepts`
  - `conceptStability * 0.06,`
- Line 49 · **unknown** · matched `concepts`
  - `conceptStability,`
- Line 56 · **unknown** · matched `concepts`
  - `\`${conceptCount} organizational concepts reused\`,`

##### `engine/v3/model/memory/consolidateOrganizationalTheories.ts`

- Line 24 · **type** · matched `concepts`
  - `concepts: TheorySignal[];`
- Line 38 · **unknown** · matched `concepts`
  - `concepts,`
- Line 45 · **unknown** · matched `concepts`
  - `concepts,`
- Line 67 · **import** · matched `concepts`
  - `: "A new organizational theory emerged from recurring beliefs, mechanisms, or concepts.",`
- Line 86 · **unknown** · matched `concepts`
  - `candidate.supportingConcepts.length +`
- Line 108 · **unknown** · matched `concepts`
  - `supportingConcepts: mergeIds(`
- Line 109 · **unknown** · matched `concepts`
  - `existing.supportingConcepts,`
- Line 110 · **unknown** · matched `concepts`
  - `candidate.supportingConcepts,`
- Line 168 · **type** · matched `concepts`
  - `concepts: TheorySignal[];`
- Line 172 · **unknown** · matched `concepts`
  - `const { beliefs, mechanisms, concepts, evidence, now } = params;`
- Line 173 · **read** · matched `concepts`
  - `const text = [...beliefs, ...mechanisms, ...concepts]`
- Line 189 · **unknown** · matched `concepts`
  - `concepts,`
- Line 213 · **unknown** · matched `concepts`
  - `concepts,`
- Line 237 · **unknown** · matched `concepts`
  - `concepts,`
- Line 253 · **unknown** · matched `concepts`
  - `concepts,`
- Line 269 · **unknown** · matched `concepts`
  - `concepts,`
- Line 285 · **type** · matched `concepts`
  - `concepts: TheorySignal[];`
- Line 291 · **read** · matched `concepts`
  - `const supportingConcepts = ids(params.concepts).slice(0, 12);`
- Line 297 · **unknown** · matched `concepts`
  - `supportingConcepts.length +`
- Line 303 · **read** · matched `concepts`
  - `...params.concepts.map((item) => item.confidence),`
- Line 334 · **unknown** · matched `concepts`
  - `supportingConcepts,`

##### `engine/v3/model/memory/organizationalMemory.ts`

- Line 2 · **import** · matched `types`
  - `import type { PersistentBelief } from "../../understanding/types";`

##### `engine/v3/model/memory/organizationalTheories.ts`

- Line 20 · **unknown** · matched `concepts`
  - `supportingConcepts: string[];`
- Line 59 · **unknown** · matched `concepts`
  - `conceptStability: number;`

##### `engine/v3/model/observations/inferOrganizationalObservations.ts`

- Line 48 · **unknown** · matched `types`
  - `observationTypes: OrganizationalObservationType[];`
- Line 49 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: string[];`
- Line 242 · **unknown** · matched `types`
  - `observationTypes: ["distributed_documentation", "knowledge_stored_locally"],`
- Line 243 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: [`
- Line 260 · **unknown** · matched `types`
  - `observationTypes: ["duplicated_work", "repeated_experiment"],`
- Line 261 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: [`
- Line 278 · **unknown** · matched `types`
  - `observationTypes: [`
- Line 283 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: [`
- Line 300 · **unknown** · matched `types`
  - `observationTypes: ["approval_waiting", "executive_escalation"],`
- Line 301 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: ["approval_bottleneck", "decision_latency"],`
- Line 433 · **unknown** · matched `concepts`
  - `function conceptScore(concept: SemanticConceptLike): number {`
- Line 439 · **unknown** · matched `concepts`
  - `function getConceptSupport(params: {`
- Line 441 · **unknown** · matched `concepts`
  - `semanticConcepts: SemanticConceptLike[];`
- Line 447 · **unknown** · matched `concepts`
  - `const { meaningIds, semanticConcepts } = params;`
- Line 450 · **unknown** · matched `concepts`
  - `if (!relevantMeaningIds.size \|\| !semanticConcepts.length) {`
- Line 458 · **unknown** · matched `concepts`
  - `const supportingConcepts = semanticConcepts.filter((concept) =>`
- Line 465 · **unknown** · matched `concepts`
  - `supportingConcepts.map((concept) => concept.id)`
- Line 469 · **unknown** · matched `concepts`
  - `supportingConcepts.flatMap((concept) =>`
- Line 476 · **unknown** · matched `concepts`
  - `const conceptReinforcement = average(supportingConcepts.map(conceptScore));`
- Line 491 · **unknown** · matched `types`
  - `const allowedTypes = new Set(definition.observationTypes);`
- Line 496 · **unknown** · matched `types`
  - `const typeMatches = allowedTypes.has(observation.type);`
- Line 575 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: definition.possiblePhenomenonTypes,`
- Line 581 · **unknown** · matched `concepts`
  - `semanticConcepts: SemanticConceptLike[] = []`
- Line 590 · **unknown** · matched `concepts`
  - `} = getConceptSupport({`
- Line 592 · **unknown** · matched `concepts`
  - `semanticConcepts,`
- Line 620 · **unknown** · matched `concepts`
  - `semanticConcepts?: SemanticConceptLike[];`
- Line 628 · **unknown** · matched `concepts`
  - `const patterns = inferPatterns(observations, params.semanticConcepts ?? []);`

##### `engine/v3/model/observations/organizationalObservations.ts`

- Line 61 · **unknown** · matched `types`
  - `possiblePhenomenonTypes: string[];`

##### `engine/v3/model/organizationModel.ts`

- Line 98 · **unknown** · matched `concepts`
  - `* storing duplicated organizational concepts.`

##### `engine/v3/model/predictions/buildPredictionReflection.ts`

- Line 77 · **unknown** · matched `concepts`
  - `* Concepts supporting the prediction.`
- Line 79 · **unknown** · matched `concepts`
  - `supportingConcepts: PredictionReflectionEvidence[];`
- Line 229 · **unknown** · matched `types`
  - `function predictionTypeScore(`
- Line 263 · **unknown** · matched `types`
  - `predictionTypeScore(`
- Line 503 · **unknown** · matched `concepts`
  - `supportingConcepts: [],`
- Line 556 · **unknown** · matched `concepts`
  - `const supportingConcepts =`
- Line 588 · **unknown** · matched `concepts`
  - `supportingConcepts.length > 0`
- Line 589 · **unknown** · matched `concepts`
  - `? \`${supportingConcepts.length} concept${`
- Line 590 · **unknown** · matched `concepts`
  - `supportingConcepts.length === 1`
- Line 647 · **unknown** · matched `concepts`
  - `supportingConcepts,`

##### `engine/v3/model/predictions/inferOrganizationalPredictions.ts`

- Line 11 · **import** · matched `types`
  - `} from "./predictionTypes";`

##### `engine/v3/model/predictions/organizationalPrediction.ts`

- Line 126 · **unknown** · matched `concepts`
  - `* Concepts supporting the prediction.`

##### `engine/v3/model/reasoning/analyzeRootCauses.ts`

- Line 4 · **import** · matched `types`
  - `} from "./reasoningTypes";`

##### `engine/v3/model/reasoning/classifyReasoningPath.ts`

- Line 4 · **import** · matched `types`
  - `} from "./reasoningTypes";`

##### `engine/v3/model/reasoning/discoverReasoningPaths.ts`

- Line 4 · **import** · matched `types`
  - `} from "./reasoningTypes";`

##### `engine/v3/model/reasoning/explainReasoningChain.ts`

- Line 5 · **import** · matched `types`
  - `} from "./reasoningTypes";`

##### `engine/v3/model/reasoning/identifyLeveragePoints.ts`

- Line 4 · **import** · matched `types`
  - `} from "./reasoningTypes";`

##### `engine/v3/model/reasoning/index.ts`

- Line 1 · **import** · matched `types`
  - `export * from "./reasoningTypes";`

##### `engine/v3/model/reasoning/inferIndirectEffects.ts`

- Line 4 · **import** · matched `types`
  - `} from "./reasoningTypes";`

##### `engine/v3/model/reasoning/organizationalReasoningEngine.ts`

- Line 7 · **import** · matched `types`
  - `import type { OrganizationalReasoningResult } from "./reasoningTypes";`

##### `engine/v3/model/state/inferOrganizationalConditions.ts`

- Line 29 · **type** · matched `concepts`
  - `concepts: any[];`
- Line 414 · **read** · matched `concepts`
  - `support.concepts.length > 0`
- Line 415 · **read** · matched `concepts`
  - `? \`${support.concepts.length} concept${support.concepts.length === 1 ? "" : "s"}\``
- Line 732 · **unknown** · matched `concepts`
  - `const topConcepts = topBySignal(`
- Line 733 · **read** · matched `concepts`
  - `support.concepts,`
- Line 760 · **unknown** · matched `concepts`
  - `...topConcepts.map((concept) => titleCase(labelOf(concept))),`
- Line 868 · **unknown** · matched `concepts`
  - `const matchingConcepts = conceptualUnderstanding.filter((concept) =>`
- Line 889 · **unknown** · matched `concepts`
  - `matchingConcepts.length +`
- Line 898 · **unknown** · matched `concepts`
  - `matchingConcepts.map((concept) => concept.confidence ?? 0.5),`
- Line 928 · **unknown** · matched `concepts`
  - `...matchingConcepts,`
- Line 988 · **type** · matched `concepts`
  - `concepts: matchingConcepts,`
- Line 1019 · **unknown** · matched `concepts`
  - `supportingConceptIds: unique(matchingConcepts.map((concept) => concept.id)),`

##### `engine/v3/observations.ts`

- Line 1 · **import** · matched `types`
  - `import type { V3Evidence, V3Observation, V3Signal, V3Theme } from "./types";`

##### `engine/v3/organismState.ts`

- Line 13 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/phenomena/inferOrganizationalPhenomena.ts`

- Line 30 · **unknown** · matched `types`
  - `possibleMechanismTypes: OrganizationalMechanismType[];`
- Line 68 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 85 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 101 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 117 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 132 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 147 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 162 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 197 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 224 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 249 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 274 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 298 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 323 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 348 · **unknown** · matched `types`
  - `possibleMechanismTypes: [`
- Line 364 · **unknown** · matched `types`
  - `possibleMechanismTypes: ["unknown"],`
- Line 487 · **unknown** · matched `types`
  - `possibleMechanismTypes: definition.possibleMechanismTypes,`
- Line 547 · **unknown** · matched `types`
  - `possibleMechanismTypes: definition.possibleMechanismTypes,`

##### `engine/v3/phenomena/organizationalPhenomena.ts`

- Line 52 · **unknown** · matched `types`
  - `possibleMechanismTypes: string[];`

##### `engine/v3/priority.ts`

- Line 8 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/reasoningGraph.ts`

- Line 14 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/semantic/buildCognitiveObservations.ts`

- Line 4 · **import** · matched `types`
  - `} from "./types";`
- Line 14 · **type** · matched `concepts`
  - `concepts: string[];`
- Line 18 · **unknown** · matched `concepts`
  - `const KNOWN_CONCEPTS = new Set([`
- Line 91 · **definition** · matched `concepts`
  - `function conceptsFromObservation(observation: SemanticObservation): string[] {`
- Line 93 · **unknown** · matched `concepts`
  - `observation.keywords.filter((keyword) => KNOWN_CONCEPTS.has(keyword)),`
- Line 128 · **type** · matched `concepts`
  - `concepts: conceptsFromObservation(observation),`

##### `engine/v3/semantic/buildSemanticCohorts.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`
- Line 213 · **unknown** · matched `types`
  - `const sourceTypes = unique(`
- Line 236 · **unknown** · matched `types`
  - `sourceTypes,`
- Line 273 · **unknown** · matched `types`
  - `sourceTypes.length > 1 \|\| observations.length > 1`
- Line 282 · **import** · matched `types`
  - `explanation: \`Persistent semantic cohort formed from ${observations.length} related observations across ${sourceTypes.length} cognitive source type(s).\`,`

##### `engine/v3/semantic/buildSemanticObservations.ts`

- Line 5 · **import** · matched `types`
  - `} from "./types";`
- Line 29 · **unknown** · matched `concepts`
  - `organizationalConcepts?: SemanticObservationInput[];`
- Line 551 · **unknown** · matched `concepts`
  - `function inferConcepts(text: string): string[] {`
- Line 577 · **unknown** · matched `concepts`
  - `...inferConcepts(text),`
- Line 641 · **definition** · matched `concepts`
  - `const concepts = inferConcepts(text);`
- Line 645 · **read** · matched `concepts`
  - `unique([...concepts, ...keywords, ...extractKeywords(statement)])`
- Line 738 · **unknown** · matched `concepts`
  - `inputs: params.organizationalConcepts,`

##### `engine/v3/semantic/index.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/semantic/scoreSemanticCohorts.ts`

- Line 5 · **import** · matched `types`
  - `} from "./types";`
- Line 60 · **unknown** · matched `types`
  - `const crossLayerSupport = clamp01(cohort.sourceTypes.length / 6);`
- Line 112 · **unknown** · matched `types`
  - `sourceTypeCount: cohort.sourceTypes.length,`

##### `engine/v3/semantic/types.ts`

- Line 44 · **unknown** · matched `concepts`
  - `* Canonical concepts represented by this semantic structure.`
- Line 96 · **unknown** · matched `types`
  - `sourceTypes: SemanticObservationSourceType[];`

##### `engine/v3/signals.ts`

- Line 1 · **import** · matched `types`
  - `import { V3Evidence, V3Signal } from "./types";`

##### `engine/v3/themeRelationships.ts`

- Line 5 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/themes.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/types.ts`

- Line 104 · **unknown** · matched `types`
  - `dominantRelationshipTypes: V3EvidenceRelationshipType[];`
- Line 134 · **unknown** · matched `types`
  - `dominantRelationshipTypes: V3EvidenceRelationshipType[];`

##### `engine/v3/understanding/compress.ts`

- Line 4 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/understanding/explain.ts`

- Line 5 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/understanding/index.ts`

- Line 1 · **import** · matched `types`
  - `import { V3ExecutiveUnderstanding } from "../types";`
- Line 7 · **import** · matched `types`
  - `import { UnderstandingEngineInput } from "./types";`
- Line 38 · **import** · matched `types`
  - `export type { ExecutiveNarrative } from "./types";`

##### `engine/v3/understanding/narrative.ts`

- Line 6 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/understanding/prioritize.ts`

- Line 1 · **import** · matched `types`
  - `import { UnderstandingEngineInput, PrioritizedUnderstanding } from "./types";`

##### `engine/v3/understanding/recommend.ts`

- Line 4 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/understanding/synthesizeUnderstanding.ts`

- Line 252 · **unknown** · matched `types`
  - `suggestedEvidenceTypes: [`
- Line 270 · **unknown** · matched `types`
  - `suggestedEvidenceTypes: [`
- Line 288 · **unknown** · matched `types`
  - `suggestedEvidenceTypes: [`

##### `engine/v3/understanding/types.ts`

- Line 8 · **import** · matched `types`
  - `} from "../types";`

##### `engine/v3/understanding.ts`

- Line 9 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/understandingObject.ts`

- Line 7 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/understandingSynthesizer.ts`

- Line 8 · **import** · matched `types`
  - `} from "./types";`

##### `engine/v3/workspace.ts`

- Line 21 · **import** · matched `types`
  - `} from "./types";`

##### `engine/workspace.ts`

- Line 1 · **import** · matched `types`
  - `import { Observation, Workspace, WorkspaceCluster } from "./types";`

#### Runtime

##### `engine/v3/runtime/evolveOrganizationRuntime.ts`

- Line 1 · **import** · matched `types`
  - `import type { DiscoveryV3Result } from "../types";`
- Line 30 · **import** · matched `synthesizeOrganizationalConcepts`
  - `import { synthesizeOrganizationalConcepts } from "../concepts/synthesizeOrganizationalConcepts";`
- Line 31 · **import** · matched `buildConceptCandidates`
  - `import { buildConceptCandidates } from "../concepts/buildConceptCandidates";`
- Line 32 · **import** · matched `compressConceptCandidates`
  - `import { compressConceptCandidates } from "../concepts/compressConceptCandidates";`
- Line 70 · **unknown** · matched `concepts`
  - `organizationalConcepts?: any[];`
- Line 71 · **unknown** · matched `concepts`
  - `semanticConcepts?: any[];`
- Line 240 · **unknown** · matched `synthesizeOrganizationalConcepts`
  - `const organizationalConcepts = synthesizeOrganizationalConcepts({`
- Line 242 · **unknown** · matched `concepts`
  - `existingConcepts: memory.organizationalConcepts ?? [],`
- Line 249 · **unknown** · matched `concepts`
  - `semanticConcepts: organizationalConcepts,`
- Line 349 · **unknown** · matched `concepts`
  - `semanticConcepts: organizationalConcepts,`
- Line 381 · **unknown** · matched `concepts`
  - `organizationalConcepts,`
- Line 405 · **type** · matched `concepts`
  - `concepts: organizationalConcepts,`
- Line 433 · **unknown** · matched `concepts`
  - `conceptCount: organizationalConcepts.length,`
- Line 465 · **unknown** · matched `concepts`
  - `organizationalConcepts,`
- Line 475 · **unknown** · matched `concepts`
  - `const semanticConcepts = semanticReasoning.observations;`
- Line 477 · **unknown** · matched `buildConceptCandidates`
  - `const conceptCandidates = buildConceptCandidates({`
- Line 482 · **unknown** · matched `compressConceptCandidates`
  - `compressConceptCandidates(conceptCandidates);`
- Line 780 · **unknown** · matched `concepts`
  - `semanticConceptCount: semanticConcepts.length,`
- Line 943 · **unknown** · matched `concepts`
  - `semanticConcepts,`
- Line 948 · **unknown** · matched `concepts`
  - `organizationalConcepts,`
- Line 995 · **unknown** · matched `concepts`
  - `semanticConcepts.length,`
- Line 1016 · **unknown** · matched `concepts`
  - `organizationalConcepts.length,`

##### `engine/v3/runtime/organizationRuntime.ts`

- Line 6 · **import** · matched `types`
  - `} from "../understanding/types";`
- Line 81 · **unknown** · matched `concepts`
  - `semanticConcepts: unknown[];`
- Line 83 · **unknown** · matched `concepts`
  - `organizationalConcepts: unknown[];`
- Line 166 · **unknown** · matched `concepts`
  - `semanticConcepts: [],`
- Line 168 · **unknown** · matched `concepts`
  - `organizationalConcepts: [],`

##### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 2 · **import** · matched `synthesizeOrganizationalConcepts`
  - `import type { OrganizationalConcept } from "../concepts/synthesizeOrganizationalConcepts";`
- Line 66 · **unknown** · matched `types`
  - `suggestedEvidenceTypes: string[];`
- Line 197 · **unknown** · matched `concepts`
  - `organizationalConcepts: OrganizationalConcept[];`
- Line 405 · **unknown** · matched `concepts`
  - `organizationalConcepts: [],`

##### `engine/v3/runtime/updateOrganizationalUnderstandingState.ts`

- Line 1 · **import** · matched `types`
  - `import type { DiscoveryV3Result } from "../types";`

#### Executive

##### `engine/v3/executive/buildExecutiveDashboard.ts`

- Line 22 · **import** · matched `types`
  - `import type { ExecutiveInterpretation } from "./interpretations/executiveInterpretationTypes";`

##### `engine/v3/executive/expression/executiveConversation.ts`

- Line 7 · **import** · matched `types`
  - `import type { ExecutiveInterpretation } from "../interpretations/executiveInterpretationTypes";`
- Line 128 · **unknown** · matched `concepts`
  - `"Every explanation can be traced back through supporting evidence, mechanisms, concepts, and reasoning.",`

##### `engine/v3/executive/expression/executiveVoice.ts`

- Line 1 · **import** · matched `types`
  - `import type { ExecutiveExpressionContext } from "./executiveExpressionTypes";`

##### `engine/v3/executive/interpretations/buildExecutiveInterpretation.ts`

- Line 19 · **import** · matched `types`
  - `} from "./executiveInterpretationTypes";`

##### `engine/v3/executive/interpretations/competingExplanations.ts`

- Line 1 · **import** · matched `types`
  - `import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";`

##### `engine/v3/executive/interpretations/confidenceNarrative.ts`

- Line 1 · **import** · matched `types`
  - `import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";`

##### `engine/v3/executive/interpretations/explanationBuilder.ts`

- Line 3 · **import** · matched `types`
  - `import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";`

##### `engine/v3/executive/interpretations/uncertaintyNarrative.ts`

- Line 1 · **import** · matched `types`
  - `import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";`

##### `components/executive/currentTheory/CurrentWorkingTheory.tsx`

- Line 1 · **import** · matched `types`
  - `import type { ExecutiveInterpretation } from "../../../engine/v3/executive/interpretations/executiveInterpretationTypes";`

#### Projection

##### `engine/v3/projection/ExecutiveProjectionCompiler.ts`

- Line 58 · **unknown** · matched `concepts`
  - `const conceptSupport = Math.min(`
- Line 69 · **unknown** · matched `concepts`
  - `conceptSupport * 0.1`

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 179 · **unknown** · matched `concepts`
  - `* Supporting concepts.`
- Line 181 · **unknown** · matched `concepts`
  - `supportingConcepts: string[];`
- Line 462 · **unknown** · matched `concepts`
  - `organizationalConcepts?: ExecutiveOrganizationalConcept[];`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 1 · **import** · matched `types`
  - `import type { DiscoveryV3Result } from "../../../engine/v3/types";`
- Line 152 · **unknown** · matched `concepts`
  - `organizationalConcepts?: RuntimeOrganizationalConcept[];`
- Line 501 · **unknown** · matched `concepts`
  - `supportingConcepts:`
- Line 506 · **unknown** · matched `concepts`
  - `function buildOrganizationalConceptsProjection(`
- Line 509 · **definition** · matched `concepts`
  - `const concepts =`
- Line 510 · **unknown** · matched `concepts`
  - `runtimeMemory?.organizationalConcepts;`
- Line 512 · **unknown** · matched `concepts`
  - `if (!concepts \|\| concepts.length === 0) {`
- Line 519 · **unknown** · matched `concepts`
  - `return concepts`
- Line 744 · **unknown** · matched `concepts`
  - `const organizationalConcepts =`
- Line 745 · **unknown** · matched `concepts`
  - `buildOrganizationalConceptsProjection(runtimeMemory);`
- Line 848 · **unknown** · matched `concepts`
  - `organizationalConcepts,`

#### UI

##### `components/ActionPanel.tsx`

- Line 1 · **import** · matched `types`
  - `import type { BeliefObject, EngineReport } from './types';`

##### `components/BeliefCard.tsx`

- Line 4 · **import** · matched `types`
  - `import type { BeliefObject, EngineReport } from "./types";`

##### `components/DeveloperPanel.tsx`

- Line 1 · **import** · matched `types`
  - `import type { EngineReport } from './types';`

##### `components/EvidencePrompt.tsx`

- Line 1 · **import** · matched `types`
  - `import type { DemoDoc } from './types';`

##### `components/InspectionDrawer.tsx`

- Line 1 · **import** · matched `types`
  - `import type { EngineReport, EvidenceObject, Relationship } from './types';`

##### `components/InvestigationNarrative.tsx`

- Line 3 · **import** · matched `types`
  - `import { V3EmergenceEvent } from "../engine/v3/types";`

##### `components/StewardshipBrief.tsx`

- Line 1 · **import** · matched `types`
  - `import type { BeliefObject, EngineReport, InsightFeedback } from "./types";`

##### `components/UnderstandingTimeline.tsx`

- Line 1 · **import** · matched `types`
  - `import type { DemoDoc } from './types';`

##### `components/cognition-lab/CognitiveLabPage.tsx`

- Line 8 · **unknown** · matched `concepts`
  - `\| "concepts"`
- Line 19 · **unknown** · matched `concepts`
  - `{ id: "concepts", label: "Concepts" },`
- Line 39 · **type** · matched `concepts`
  - `concepts: "",`
- Line 61 · **definition** · matched `concepts`
  - `const concepts = stageIndex >= 2`
- Line 101 · **unknown** · matched `concepts`
  - `if (activeStage.id === "concepts") return concepts.join("\n");`
- Line 110 · **unknown** · matched `concepts`
  - `concepts,`
- Line 199 · **unknown** · matched `concepts`
  - `<LabBlock title="Concepts" items={concepts} />`

##### `components/executive-v2/ExecutiveExperience.tsx`

- Line 8 · **import** · matched `concepts`
  - `import ExecutiveConcepts from "./concepts/ExecutiveConcepts";`
- Line 29 · **unknown** · matched `concepts`
  - `organizationalConcepts,`
- Line 69 · **unknown** · matched `concepts`
  - `{organizationalConcepts &&`
- Line 70 · **unknown** · matched `concepts`
  - `organizationalConcepts.length > 0 && (`
- Line 71 · **unknown** · matched `concepts`
  - `<ExecutiveConcepts concepts={organizationalConcepts} />`

##### `components/executive-v2/beliefs/ExecutiveBeliefs.tsx`

- Line 51 · **unknown** · matched `concepts`
  - `{belief.supportingConcepts.length} supporting concepts`

##### `components/executive-v2/concepts/ExecutiveConcepts.tsx`

- Line 3 · **type** · matched `concepts`
  - `type ExecutiveConceptsProps = {`
- Line 4 · **type** · matched `concepts`
  - `concepts: ExecutiveOrganizationalConcept[];`
- Line 24 · **unknown** · matched `concepts`
  - `export default function ExecutiveConcepts({`
- Line 25 · **unknown** · matched `concepts`
  - `concepts,`
- Line 26 · **unknown** · matched `concepts`
  - `}: ExecutiveConceptsProps) {`
- Line 27 · **unknown** · matched `concepts`
  - `const visibleConcepts = concepts.slice(0, 3);`
- Line 30 · **unknown** · matched `concepts`
  - `<section className="executive-v2-concepts">`
- Line 33 · **unknown** · matched `concepts`
  - `Organizational Concepts`
- Line 40 · **unknown** · matched `concepts`
  - `{visibleConcepts.map((concept) => (`

##### `components/investigation/ActionPanel.tsx`

- Line 1 · **import** · matched `types`
  - `import type { BeliefObject, EngineReport } from './types';`

##### `components/investigation/DeveloperPanel.tsx`

- Line 1 · **import** · matched `types`
  - `import type { EngineReport } from './types';`

##### `components/investigation/EvidencePrompt.tsx`

- Line 1 · **import** · matched `types`
  - `import type { DemoDoc } from './types';`

##### `components/investigation/InspectionDrawer.tsx`

- Line 1 · **import** · matched `types`
  - `import type { EngineReport, EvidenceObject, Relationship } from './types';`

##### `components/investigation/InvestigationNarrative.tsx`

- Line 3 · **import** · matched `types`
  - `import { V3EmergenceEvent } from "../../engine/v3/types";`

##### `components/results/SemanticConceptInspector.tsx`

- Line 21 · **definition** · matched `concepts`
  - `const concepts = runtime?.memory?.semanticConcepts \|\| [];`
- Line 26 · **unknown** · matched `concepts`
  - `if (!concepts.length) {`
- Line 31 · **unknown** · matched `concepts`
  - `<h3>No compressed concepts yet</h3>`
- Line 34 · **unknown** · matched `concepts`
  - `semantic concepts.`
- Line 45 · **unknown** · matched `concepts`
  - `<h3>Compressed Concepts</h3>`
- Line 48 · **unknown** · matched `concepts`
  - `{concepts.length} explanatory concepts.`
- Line 52 · **unknown** · matched `concepts`
  - `{concepts.map((concept: any) => {`

##### `components/understanding/BeliefCard.tsx`

- Line 4 · **import** · matched `types`
  - `import type { BeliefObject, EngineReport } from "../investigation/types";`

##### `components/understanding/StewardshipBrief.tsx`

- Line 1 · **import** · matched `types`
  - `import type { BeliefObject, EngineReport, InsightFeedback } from "../investigation/types";`

##### `components/understanding/UnderstandingTimeline.tsx`

- Line 1 · **import** · matched `types`
  - `import type { DemoDoc } from "../investigation/types";`

##### `app/page.tsx`

- Line 15 · **import** · matched `types`
  - `import type { DemoDoc, EngineReport, InsightFeedback } from '../components/investigation/types';`

#### Benchmark

##### `engine/benchmark/architecture/index.ts`

- Line 4 · **import** · matched `types`
  - `} from "./types";`

##### `engine/benchmark/architecture/verifyDependencies.ts`

- Line 1 · **import** · matched `types`
  - `import type { ArchitectureCheck } from "./types";`

##### `engine/benchmark/architecture/verifyExecutive.ts`

- Line 1 · **import** · matched `types`
  - `import type { ArchitectureCheck } from "./types";`

##### `engine/benchmark/architecture/verifyOperatingSystemCoverage.ts`

- Line 1 · **import** · matched `types`
  - `import type { ArchitectureCheck } from "./types";`

##### `engine/benchmark/architecture/verifyOperatingSystems.ts`

- Line 1 · **import** · matched `types`
  - `import type { ArchitectureCheck } from "./types";`

##### `engine/benchmark/architecture/verifyProducers.ts`

- Line 4 · **import** · matched `types`
  - `import type { ArchitectureCheck } from "./types";`

##### `engine/benchmark/architecture/verifyRuntime.ts`

- Line 1 · **import** · matched `types`
  - `import type { ArchitectureCheck } from "./types";`

##### `engine/benchmark/auditCapability.ts`

- Line 432 · **unknown** · matched `types`
  - `withFileTypes: true,`

##### `engine/benchmark/auditUnderstandingLayers.ts`

- Line 22 · **unknown** · matched `types`
  - `withFileTypes: true,`

##### `engine/benchmark/benchmarkReporter.ts`

- Line 6 · **import** · matched `types`
  - `} from "./benchmarkTypes";`
- Line 154 · **unknown** · matched `concepts`
  - `"      ✓ Patterns, mechanisms, and concepts are converging into coherent understanding.",`
- Line 239 · **unknown** · matched `concepts`
  - `"   Recommendation: improve synthesis across beliefs, mechanisms, concepts, and executive conclusions.",`
- Line 261 · **unknown** · matched `concepts`
  - `"   Recommendation: improve pattern coherence across mechanisms, concepts, and executive theory.",`
- Line 282 · **import** · matched `concepts`
  - `"   Recommendation: improve evidence attribution from executive conclusions back to mechanisms and concepts.",`

##### `engine/benchmark/benchmarkRunner.ts`

- Line 4 · **import** · matched `types`
  - `import type { DiscoveryBenchmarkCase } from "./benchmarkTypes";`

##### `engine/benchmark/benchmarkScorer.ts`

- Line 4 · **import** · matched `types`
  - `} from "./benchmarkTypes";`
- Line 46 · **unknown** · matched `concepts`
  - `compressedConcepts?: string[];`
- Line 316 · **unknown** · matched `concepts`
  - `finalConcepts: string[];`
- Line 320 · **unknown** · matched `concepts`
  - `expectedCompressedConcepts?: string[];`
- Line 324 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 328 · **unknown** · matched `concepts`
  - `expectedCompressedConcepts = [],`
- Line 331 · **unknown** · matched `concepts`
  - `const allText = [...mechanisms, ...finalConcepts, ...executiveText];`
- Line 338 · **unknown** · matched `concepts`
  - `const conceptCoverage = includesAny(finalConcepts, expectedCompressedConcepts);`
- Line 347 · **unknown** · matched `concepts`
  - `...finalConcepts,`
- Line 542 · **unknown** · matched `concepts`
  - `finalConcepts: string[];`
- Line 549 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 557 · **unknown** · matched `concepts`
  - `theorySignalScore([...executiveText, ...finalConcepts]),`
- Line 569 · **unknown** · matched `concepts`
  - `validationSignalScore([...executiveText, ...finalConcepts]),`
- Line 662 · **unknown** · matched `concepts`
  - `finalConcepts: string[];`
- Line 669 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 676 · **unknown** · matched `concepts`
  - `...finalConcepts,`
- Line 693 · **unknown** · matched `concepts`
  - `theorySignalScore([...executiveText, ...finalConcepts]),`
- Line 712 · **unknown** · matched `concepts`
  - `const compressedConcepts = actual.compressedConcepts ?? [];`
- Line 730 · **unknown** · matched `concepts`
  - `const finalConcepts =`
- Line 733 · **unknown** · matched `concepts`
  - `: compressedConcepts;`
- Line 761 · **unknown** · matched `concepts`
  - `const finalConceptScore = includesAny(`
- Line 762 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 763 · **unknown** · matched `concepts`
  - `benchmark.expected.compressedConcepts ?? [],`
- Line 768 · **unknown** · matched `concepts`
  - `...finalConcepts,`
- Line 774 · **unknown** · matched `concepts`
  - `finalConceptScore,`
- Line 781 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 785 · **unknown** · matched `concepts`
  - `expectedCompressedConcepts: benchmark.expected.compressedConcepts,`
- Line 833 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 852 · **unknown** · matched `concepts`
  - `finalConcepts,`
- Line 919 · **unknown** · matched `concepts`
  - `"Pattern coherence is weak: mechanisms, concepts, conditions, and executive assessment are not yet converging cleanly.",`
- Line 937 · **unknown** · matched `concepts`
  - `"Evidence attribution is weak: Discovery did not clearly trace the executive conclusion back to mechanisms, concepts, conditions, or evidence.",`

##### `engine/benchmark/benchmarkTypes.ts`

- Line 11 · **unknown** · matched `concepts`
  - `compressedConcepts?: string[];`

##### `engine/benchmark/datasets/approval-bottleneck.json`

- Line 78 · **unknown** · matched `concepts`
  - `"compressedConcepts": [`

##### `engine/benchmark/datasets/knowledge-fragmentation.json`

- Line 81 · **unknown** · matched `concepts`
  - `"compressedConcepts": [`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 2 · **import** · matched `types`
  - `import type { DiscoveryBenchmarkCase } from "./benchmarkTypes";`
- Line 182 · **unknown** · matched `concepts`
  - `compressedConcepts: [`
- Line 324 · **unknown** · matched `concepts`
  - `compressedConcepts: [`
- Line 460 · **unknown** · matched `concepts`
  - `compressedConcepts: [`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 8 · **import** · matched `types`
  - `import type { DiscoveryBenchmarkCase } from "./benchmarkTypes";`
- Line 24 · **unknown** · matched `concepts`
  - `conceptStability?: number;`
- Line 75 · **unknown** · matched `concepts`
  - `semanticConcepts?: Array<{`
- Line 196 · **unknown** · matched `concepts`
  - `compressedConcepts: string[];`
- Line 356 · **unknown** · matched `concepts`
  - `const compressedConcepts =`
- Line 357 · **unknown** · matched `concepts`
  - `memory.semanticConcepts?.map(`
- Line 478 · **unknown** · matched `concepts`
  - `compressedConcepts,`
- Line 511 · **unknown** · matched `concepts`
  - `compressedConcepts,`
- Line 545 · **unknown** · matched `concepts`
  - `compressedConcepts,`

##### `engine/benchmark/understandingFitnessScorer.ts`

- Line 1 · **import** · matched `types`
  - `import type { CognitiveFitnessScore } from "./benchmarkTypes";`
- Line 24 · **unknown** · matched `concepts`
  - `conceptStability?: number;`
- Line 32 · **unknown** · matched `concepts`
  - `compressedConcepts?: string[];`
- Line 109 · **unknown** · matched `concepts`
  - `const compressedConcepts = input.compressedConcepts ?? [];`
- Line 121 · **unknown** · matched `concepts`
  - `scorePresence(compressedConcepts.length, 3),`
- Line 143 · **unknown** · matched `concepts`
  - `scorePresence(compressedConcepts.length, 3),`

#### Other

##### `scripts/cognition/discoverCapabilities.mjs`

- Line 64 · **unknown** · matched `types`
  - `fileName === "types.ts" \|\|`
- Line 65 · **unknown** · matched `types`
  - `fileName === "types.tsx" \|\|`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 128 · **unknown** · matched `concepts`
  - `"Convert recurring lower-level organizational patterns into reusable higher-order concepts and models.",`
- Line 136 · **unknown** · matched `concepts`
  - `"Is abstraction already embedded in concepts, mechanisms, theories, patterns, compression, and understanding synthesis?",`
- Line 562 · **unknown** · matched `concepts`
  - `"Trace the relevant mechanisms, theories, conditions, concepts, graphs, and understanding structures before deciding whether a distinct capability is necessary.",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
