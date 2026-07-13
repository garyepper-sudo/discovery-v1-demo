# Capability Trace — Theory Validation

Generated: 2026-07-13T17:05:59.237Z

## Verified Architecture

**Connection status:** ✅ Connected

| Property | Value |
|---|---|
| Capability ID | `CAP-SELF-001` |
| Capability name | Theory Validation |
| Cognitive domain | SELF |
| Architectural layer | COG |
| Canonical producer | `engine/v3/model/judgment/buildTheoryReflection.ts` |
| Runtime destination | `ExecutiveAssessment.theoryValidation` |
| Executive destination | `ExecutiveProjection, TheoryValidation` |
| Atlas coverage | yes |
| Registry status | canonical |

### Produced Cognitive Objects

- `TheoryValidation`

### Consumed Cognitive Objects

None declared.

### Implementation Files

- `engine/v3/model/judgment/buildTheoryReflection.ts`

### Capability Dependencies

- `CAP-UND-001`
- `CAP-UND-002`
- `CAP-UND-003`

### Declared Consumers

- `CAP-SELF-002`
- `CAP-SYS-001`

## Architecture Verification

| Check | Status | Detail |
|---|:---:|---|
| Capability registry entry | ✅ | Matched capability ID: CAP-SELF-001 |
| Canonical producer declared | ✅ | engine/v3/model/judgment/buildTheoryReflection.ts |
| Canonical producer exists | ✅ | engine/v3/model/judgment/buildTheoryReflection.ts |
| Implementation files | ✅ | 1 declared file(s) exist. |
| Runtime destination | ✅ | ExecutiveAssessment.theoryValidation |
| Executive destination | ✅ | ExecutiveProjection, TheoryValidation |
| Consumers | ✅ | 2 declared consumer(s). |
| Atlas coverage | ✅ | yes |
| Structural implementation coverage | ✅ | All declared implementation files appeared in the structural trace. |

## Architecture Drift

### Structural Matches Not Declared as Implementation Files

Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.

- `components/executive-v2/answers/ExecutiveAnswerGrid.tsx`
- `components/executive-v2/projection/ExecutiveProjection.ts`
- `components/executive-v2/projection/buildExecutiveProjection.ts`
- `engine/benchmark/benchmarkReporter.ts`
- `engine/benchmark/benchmarkScorer.ts`
- `engine/benchmark/benchmarkTypes.ts`
- `engine/benchmark/runAtlasSimulation.ts`
- `engine/benchmark/runBenchmarkInvestigation.ts`
- `engine/benchmark/understandingFitnessScorer.ts`
- `engine/v3/model/judgment/buildExecutiveAssessment.ts`
- `engine/v3/model/judgment/buildOrganizationalUnderstanding.ts`
- `engine/v3/model/judgment/organizationalJudgment.ts`
- `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`
- `scripts/cognition/generateCognitiveRegistry.mjs`
- `scripts/cognition/reviewCognitiveDomain.mjs`

## Structural Search

This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.

### Search Terms

- `Theory Validation`
- `theoryValidation`
- `TheoryValidation`
- `theory-validation`
- `theory validation`
- `CAP-SELF-001`
- `capSelf001`
- `CapSelf001`
- `cap-self-001`
- `buildTheoryReflection`
- `BuildTheoryReflection`
- `build-theory-reflection`
- `buildtheoryreflection`
- `theoryvalidation`

### Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 49 |
| Runtime | ❌ Not found | 0 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 23 |
| UI | ✅ Found | 10 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 111 |
| Other | ✅ Found | 6 |

### Detailed Matches

#### Engine

##### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 2 · **import** · matched `buildTheoryReflection`
  - `import { buildTheoryReflection } from "./buildTheoryReflection";`
- Line 292 · **definition** · matched `theoryValidation`
  - `const theoryValidation = buildTheoryReflection({`
- Line 356 · **unknown** · matched `theoryValidation`
  - `theoryValidation.whyDiscoveryBelievesIt`
- Line 358 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation`
- Line 359 · **unknown** · matched `theoryValidation`
  - `} ${theoryValidation.executiveRecommendation}\``
- Line 361 · **unknown** · matched `theoryValidation`
  - `? \`${strongestJudgment.assessment} This explanation ranked highest because it had the strongest combined judgment score across evidence, explanatory power, causal plausibility, executive significance, and intervention leverage. ${theoryValidation.calibratedConfidenceExplanation}\``
- Line 418 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`
- Line 466 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`

##### `engine/v3/model/judgment/buildOrganizationalUnderstanding.ts`

- Line 3 · **unknown** · matched `theoryValidation`
  - `TheoryValidation,`
- Line 4 · **unknown** · matched `theoryValidation`
  - `TheoryValidationEvidence,`
- Line 23 · **type** · matched `theoryValidation`
  - `theoryValidation: TheoryValidation;`
- Line 32 · **unknown** · matched `theoryValidation`
  - `): TheoryValidationEvidence {`
- Line 54 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`
- Line 81 · **unknown** · matched `theoryValidation`
  - `theoryValidation.supportingMechanisms.length > 0`
- Line 82 · **unknown** · matched `theoryValidation`
  - `? theoryValidation.supportingMechanisms`
- Line 87 · **unknown** · matched `theoryValidation`
  - `: theoryValidation.dominantTheory`
- Line 88 · **unknown** · matched `theoryValidation`
  - `? theoryValidation.dominantTheory`
- Line 100 · **unknown** · matched `theoryValidation`
  - `dominantTheory: theoryValidation.dominantTheory,`
- Line 105 · **unknown** · matched `theoryValidation`
  - `theoryValidation.supportingOrganizationalBeliefs,`
- Line 108 · **unknown** · matched `theoryValidation`
  - `theoryValidation.competingTheoriesConsidered,`
- Line 111 · **unknown** · matched `theoryValidation`
  - `theoryValidation.contradictoryOrWeakeningEvidence,`
- Line 116 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation,`
- Line 119 · **unknown** · matched `theoryValidation`
  - `theoryValidation.additionalEvidenceThatWouldIncreaseConfidence,`
- Line 122 · **unknown** · matched `theoryValidation`
  - `theoryValidation.evidenceThatWouldFalsifyTheory,`
- Line 125 · **unknown** · matched `theoryValidation`
  - `theoryValidation.executiveRecommendation,`

##### `engine/v3/model/judgment/buildTheoryReflection.ts`

- Line 3 · **unknown** · matched `theoryValidation`
  - `TheoryValidation,`
- Line 4 · **unknown** · matched `theoryValidation`
  - `TheoryValidationEvidence,`
- Line 35 · **unknown** · matched `buildTheoryReflection`
  - `export type BuildTheoryReflectionInput = {`
- Line 73 · **unknown** · matched `theoryValidation`
  - `}): TheoryValidationEvidence[] {`
- Line 99 · **unknown** · matched `theoryValidation`
  - `}): TheoryValidationEvidence[] {`
- Line 160 · **unknown** · matched `theoryValidation`
  - `}): TheoryValidationEvidence[] {`
- Line 194 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms: TheoryValidationEvidence[];`
- Line 195 · **unknown** · matched `theoryValidation`
  - `supportingBeliefs: TheoryValidationEvidence[];`
- Line 196 · **unknown** · matched `theoryValidation`
  - `contradictoryEvidence: TheoryValidationEvidence[];`
- Line 308 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms: TheoryValidationEvidence[],`
- Line 328 · **definition** · matched `buildTheoryReflection`
  - `export function buildTheoryReflection(`
- Line 329 · **unknown** · matched `buildTheoryReflection`
  - `input: BuildTheoryReflectionInput,`
- Line 330 · **unknown** · matched `theoryValidation`
  - `): TheoryValidation {`

##### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 82 · **unknown** · matched `theoryValidation`
  - `export type TheoryValidationEvidence = {`
- Line 95 · **unknown** · matched `theoryValidation`
  - `export type TheoryValidation = {`
- Line 100 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms: TheoryValidationEvidence[];`
- Line 101 · **unknown** · matched `theoryValidation`
  - `supportingOrganizationalBeliefs: TheoryValidationEvidence[];`
- Line 105 · **unknown** · matched `theoryValidation`
  - `contradictoryOrWeakeningEvidence: TheoryValidationEvidence[];`
- Line 176 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms: TheoryValidationEvidence[];`
- Line 181 · **unknown** · matched `theoryValidation`
  - `supportingOrganizationalBeliefs: TheoryValidationEvidence[];`
- Line 191 · **unknown** · matched `theoryValidation`
  - `contradictoryOrWeakeningEvidence: TheoryValidationEvidence[];`
- Line 280 · **type** · matched `theoryValidation`
  - `theoryValidation?: TheoryValidation;`

##### `engine/v3/understanding/buildExecutiveUnderstandingCandidates.ts`

- Line 9 · **type** · matched `theoryValidation`
  - `theoryValidation?: {`
- Line 93 · **read** · matched `theoryValidation`
  - `input.executiveAssessment?.theoryValidation?.dominantTheory;`

#### Projection

##### `components/executive-v2/projection/ExecutiveProjection.ts`

- Line 13 · **unknown** · matched `theoryValidation`
  - `export type ExecutiveTheoryValidationEvidence = {`
- Line 26 · **unknown** · matched `theoryValidation`
  - `export type ExecutiveTheoryValidation = {`
- Line 30 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms: ExecutiveTheoryValidationEvidence[];`
- Line 31 · **unknown** · matched `theoryValidation`
  - `supportingOrganizationalBeliefs: ExecutiveTheoryValidationEvidence[];`
- Line 34 · **unknown** · matched `theoryValidation`
  - `contradictoryOrWeakeningEvidence: ExecutiveTheoryValidationEvidence[];`
- Line 68 · **type** · matched `theoryValidation`
  - `theoryValidation?: ExecutiveTheoryValidation;`
- Line 499 · **unknown** · matched `Theory Validation`
  - `* This remains available independently because Theory Validation`
- Line 502 · **type** · matched `theoryValidation`
  - `theoryValidation?: ExecutiveTheoryValidation;`

##### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 23 · **unknown** · matched `theoryValidation`
  - `ExecutiveTheoryValidation,`
- Line 160 · **type** · matched `theoryValidation`
  - `theoryValidation?: ExecutiveTheoryValidation;`
- Line 414 · **type** · matched `theoryValidation`
  - `theoryValidation:`
- Line 415 · **read** · matched `theoryValidation`
  - `executiveAssessment.theoryValidation,`
- Line 419 · **unknown** · matched `theoryValidation`
  - `function buildTheoryValidationProjection(`
- Line 421 · **unknown** · matched `theoryValidation`
  - `): ExecutiveTheoryValidation \| undefined {`
- Line 422 · **read** · matched `theoryValidation`
  - `return runtimeMemory?.executiveAssessment?.theoryValidation;`
- Line 815 · **definition** · matched `theoryValidation`
  - `const theoryValidation =`
- Line 816 · **unknown** · matched `theoryValidation`
  - `buildTheoryValidationProjection(runtimeMemory);`
- Line 878 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.dominantTheory \|\|`
- Line 894 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.whyDiscoveryBelievesIt \|\|`
- Line 903 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.evidenceThatWouldFalsifyTheory?.[0] \|\|`
- Line 904 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.calibratedConfidenceExplanation \|\|`
- Line 914 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.executiveRecommendation \|\|`
- Line 944 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`

#### UI

##### `components/executive-v2/answers/ExecutiveAnswerGrid.tsx`

- Line 3 · **unknown** · matched `theoryValidation`
  - `ExecutiveTheoryValidation,`
- Line 8 · **type** · matched `theoryValidation`
  - `theoryValidation?: ExecutiveTheoryValidation;`
- Line 13 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`
- Line 16 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.whyDiscoveryBelievesIt ??`
- Line 20 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.calibratedConfidenceExplanation ??`
- Line 24 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.executiveRecommendation ??`
- Line 38 · **unknown** · matched `theoryValidation`
  - `{theoryValidation?.supportingMechanisms?.length ? (`
- Line 40 · **unknown** · matched `theoryValidation`
  - `{theoryValidation.supportingMechanisms`
- Line 60 · **unknown** · matched `theoryValidation`
  - `{theoryValidation?.evidenceThatWouldFalsifyTheory`
- Line 63 · **unknown** · matched `theoryValidation`
  - `{theoryValidation.evidenceThatWouldFalsifyTheory`

#### Benchmark

##### `engine/benchmark/benchmarkReporter.ts`

- Line 162 · **read** · matched `theoryValidation`
  - `if (score.theoryValidationScore >= 70) {`
- Line 198 · **read** · matched `theoryValidation`
  - `if (score.theoryValidationScore < 50) {`
- Line 266 · **read** · matched `theoryValidation`
  - `if (score.theoryValidationScore < 60) {`
- Line 268 · **unknown** · matched `Theory Validation`
  - `"   Recommendation: improve theory validation inside buildExecutiveAssessment().",`
- Line 335 · **unknown** · matched `Theory Validation`
  - `console.log(\`   Theory Validation      : ${score.theoryValidationScore}%\`);`

##### `engine/benchmark/benchmarkScorer.ts`

- Line 7 · **type** · matched `theoryValidation`
  - `type TheoryValidationItem = {`
- Line 52 · **type** · matched `theoryValidation`
  - `theoryValidation?: {`
- Line 55 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms?: TheoryValidationItem[];`
- Line 56 · **unknown** · matched `theoryValidation`
  - `supportingOrganizationalBeliefs?: TheoryValidationItem[];`
- Line 58 · **unknown** · matched `theoryValidation`
  - `contradictoryOrWeakeningEvidence?: TheoryValidationItem[];`
- Line 244 · **definition** · matched `theoryValidation`
  - `function theoryValidationText(`
- Line 245 · **type** · matched `theoryValidation`
  - `theoryValidation: ActualBenchmarkOutput["theoryValidation"],`
- Line 247 · **unknown** · matched `theoryValidation`
  - `if (!theoryValidation) return [];`
- Line 250 · **unknown** · matched `theoryValidation`
  - `theoryValidation.dominantTheory ?? undefined,`
- Line 251 · **unknown** · matched `theoryValidation`
  - `theoryValidation.whyDiscoveryBelievesIt,`
- Line 252 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.supportingMechanisms?.flatMap((item) => [`
- Line 256 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.supportingOrganizationalBeliefs?.flatMap((item) => [`
- Line 260 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.competingTheoriesConsidered?.flatMap((item) => [`
- Line 265 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.contradictoryOrWeakeningEvidence?.flatMap((item) => [`
- Line 269 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation,`
- Line 270 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence ?? []),`
- Line 271 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.evidenceThatWouldFalsifyTheory ?? []),`
- Line 272 · **unknown** · matched `theoryValidation`
  - `theoryValidation.executiveRecommendation,`
- Line 541 · **definition** · matched `theoryValidation`
  - `function theoryValidationScore(params: {`
- Line 546 · **type** · matched `theoryValidation`
  - `theoryValidation?: ActualBenchmarkOutput["theoryValidation"];`
- Line 553 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`
- Line 558 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.dominantTheory) ? 1 : 0,`
- Line 563 · **unknown** · matched `theoryValidation`
  - `arrayPresenceScore(theoryValidation?.supportingMechanisms, 3),`
- Line 570 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.whyDiscoveryBelievesIt) ? 1 : 0,`
- Line 574 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.competingTheoriesConsidered,`
- Line 579 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.contradictoryOrWeakeningEvidence,`
- Line 595 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore: number;`
- Line 599 · **type** · matched `theoryValidation`
  - `theoryValidation?: ActualBenchmarkOutput["theoryValidation"];`
- Line 603 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore,`
- Line 607 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`
- Line 612 · **read** · matched `theoryValidation`
  - `...theoryValidationText(theoryValidation),`
- Line 616 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.calibratedConfidenceExplanation,`
- Line 622 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.competingTheoriesConsidered,`
- Line 627 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.contradictoryOrWeakeningEvidence,`
- Line 632 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.additionalEvidenceThatWouldIncreaseConfidence,`
- Line 637 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.evidenceThatWouldFalsifyTheory,`
- Line 642 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore * 0.3 +`
- Line 664 · **type** · matched `theoryValidation`
  - `theoryValidation?: ActualBenchmarkOutput["theoryValidation"];`
- Line 671 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`
- Line 677 · **read** · matched `theoryValidation`
  - `...theoryValidationText(theoryValidation),`
- Line 682 · **unknown** · matched `theoryValidation`
  - `arrayPresenceScore(theoryValidation?.supportingMechanisms, 2),`
- Line 686 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.supportingOrganizationalBeliefs,`
- Line 694 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.dominantTheory) ? 1 : 0,`
- Line 727 · **read** · matched `theoryValidation`
  - `...theoryValidationText(actual.theoryValidation),`
- Line 832 · **definition** · matched `theoryValidation`
  - `const theoryValidation = theoryValidationScore({`
- Line 837 · **type** · matched `theoryValidation`
  - `theoryValidation: actual.theoryValidation,`
- Line 842 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore: theoryValidation,`
- Line 846 · **type** · matched `theoryValidation`
  - `theoryValidation: actual.theoryValidation,`
- Line 854 · **type** · matched `theoryValidation`
  - `theoryValidation: actual.theoryValidation,`
- Line 869 · **unknown** · matched `theoryValidation`
  - `theoryValidation * 0.05 +`
- Line 923 · **unknown** · matched `theoryValidation`
  - `if (theoryValidation < 0.6) {`
- Line 925 · **unknown** · matched `Theory Validation`
  - `"Theory validation is weak: Discovery preserved theory support but did not clearly explain how theories support the condition-level assessment.",`
- Line 964 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore: Math.round(theoryValidation * 100),`

##### `engine/benchmark/benchmarkTypes.ts`

- Line 15 · **unknown** · matched `theoryValidation`
  - `export type BenchmarkTheoryValidation = {`
- Line 124 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore: number;`

##### `engine/benchmark/runAtlasSimulation.ts`

- Line 553 · **definition** · matched `theoryValidation`
  - `const theoryValidation = asRecord(`
- Line 554 · **read** · matched `theoryValidation`
  - `executiveAssessment.theoryValidation,`
- Line 602 · **unknown** · matched `theoryValidation`
  - `theoryValidation.whyDiscoveryBelievesIt ??`
- Line 608 · **unknown** · matched `theoryValidation`
  - `theoryValidation.supportingMechanisms,`
- Line 613 · **unknown** · matched `theoryValidation`
  - `theoryValidation.competingTheoriesConsidered,`
- Line 618 · **unknown** · matched `theoryValidation`
  - `theoryValidation.contradictoryOrWeakeningEvidence,`
- Line 623 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation,`
- Line 628 · **unknown** · matched `theoryValidation`
  - `theoryValidation.additionalEvidenceThatWouldIncreaseConfidence,`
- Line 633 · **unknown** · matched `theoryValidation`
  - `theoryValidation.evidenceThatWouldFalsifyTheory,`
- Line 638 · **unknown** · matched `theoryValidation`
  - `theoryValidation.executiveRecommendation ??`

##### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 134 · **type** · matched `theoryValidation`
  - `theoryValidation?: {`
- Line 237 · **definition** · matched `theoryValidation`
  - `function theoryValidationText(`
- Line 238 · **type** · matched `theoryValidation`
  - `theoryValidation:`
- Line 241 · **read** · matched `theoryValidation`
  - `>["theoryValidation"]`
- Line 244 · **unknown** · matched `theoryValidation`
  - `if (!theoryValidation) {`
- Line 249 · **unknown** · matched `theoryValidation`
  - `theoryValidation.dominantTheory ??`
- Line 252 · **unknown** · matched `theoryValidation`
  - `theoryValidation.whyDiscoveryBelievesIt,`
- Line 254 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.supportingMechanisms?.flatMap(`
- Line 261 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.supportingOrganizationalBeliefs?.flatMap(`
- Line 268 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.competingTheoriesConsidered?.flatMap(`
- Line 276 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.contradictoryOrWeakeningEvidence?.flatMap(`
- Line 283 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation,`
- Line 285 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence ??`
- Line 288 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.evidenceThatWouldFalsifyTheory ??`
- Line 291 · **unknown** · matched `theoryValidation`
  - `theoryValidation.executiveRecommendation,`
- Line 466 · **unknown** · matched `theoryValidation`
  - `theoryValidationText(`
- Line 468 · **read** · matched `theoryValidation`
  - `?.theoryValidation,`
- Line 498 · **type** · matched `theoryValidation`
  - `theoryValidation:`
- Line 500 · **read** · matched `theoryValidation`
  - `?.theoryValidation,`
- Line 540 · **type** · matched `theoryValidation`
  - `theoryValidation:`
- Line 542 · **read** · matched `theoryValidation`
  - `?.theoryValidation,`

##### `engine/benchmark/understandingFitnessScorer.ts`

- Line 3 · **type** · matched `theoryValidation`
  - `type TheoryValidationItem = {`
- Line 48 · **type** · matched `theoryValidation`
  - `theoryValidation?: {`
- Line 51 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms?: TheoryValidationItem[];`
- Line 52 · **unknown** · matched `theoryValidation`
  - `supportingOrganizationalBeliefs?: TheoryValidationItem[];`
- Line 54 · **unknown** · matched `theoryValidation`
  - `contradictoryOrWeakeningEvidence?: TheoryValidationItem[];`
- Line 114 · **definition** · matched `theoryValidation`
  - `const theoryValidation = input.theoryValidation;`
- Line 127 · **unknown** · matched `theoryValidation`
  - `scorePresence(theoryValidation?.supportingMechanisms?.length ?? 0, 3),`
- Line 128 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.whyDiscoveryBelievesIt) ? 1 : 0,`
- Line 148 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.dominantTheory) ? 1 : 0,`
- Line 150 · **unknown** · matched `theoryValidation`
  - `scorePresence(theoryValidation?.competingTheoriesConsidered?.length ?? 0, 2),`
- Line 154 · **unknown** · matched `theoryValidation`
  - `scorePresence(theoryValidation?.supportingMechanisms?.length ?? 0, 3),`
- Line 156 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.supportingOrganizationalBeliefs?.length ?? 0,`
- Line 166 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.executiveRecommendation) ? 1 : 0,`
- Line 171 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.calibratedConfidenceExplanation) ? 1 : 0,`
- Line 172 · **unknown** · matched `theoryValidation`
  - `scorePresence(theoryValidation?.competingTheoriesConsidered?.length ?? 0, 1),`
- Line 174 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.contradictoryOrWeakeningEvidence?.length ?? 0,`
- Line 178 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.additionalEvidenceThatWouldIncreaseConfidence?.length ??`
- Line 182 · **unknown** · matched `theoryValidation`
  - `scorePresence(theoryValidation?.evidenceThatWouldFalsifyTheory?.length ?? 0, 2),`
- Line 187 · **unknown** · matched `theoryValidation`
  - `hasText(theoryValidation?.dominantTheory) ? 1 : 0,`
- Line 188 · **unknown** · matched `theoryValidation`
  - `scorePresence(theoryValidation?.competingTheoriesConsidered?.length ?? 0, 2),`

#### Other

##### `scripts/cognition/generateCognitiveRegistry.mjs`

- Line 87 · **unknown** · matched `theoryValidation`
  - `/theoryValidation/i,`

##### `scripts/cognition/reviewCognitiveDomain.mjs`

- Line 117 · **unknown** · matched `CAP-SELF-001`
  - `"CAP-SELF-001",`
- Line 213 · **unknown** · matched `CAP-SELF-001`
  - `"CAP-SELF-001",`
- Line 220 · **unknown** · matched `theoryValidation`
  - `"TheoryValidation",`
- Line 241 · **unknown** · matched `CAP-SELF-001`
  - `"CAP-SELF-001",`
- Line 251 · **unknown** · matched `theoryValidation`
  - `"TheoryValidation",`

## Interpretation

The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.

A capability is considered fully connected only when:

1. its canonical producer is declared and exists,
2. its implementation files exist,
3. its Runtime destination is declared,
4. its downstream consumers are declared,
5. its Executive or Projection destination is known where applicable,
6. and its Atlas or benchmark coverage is recorded.
