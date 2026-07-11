# Capability Trace — Theory Validation

Generated: 2026-07-10T23:26:38.725Z

## Search Terms

- `Theory Validation`
- `theoryValidation`
- `TheoryValidation`
- `theory-validation`
- `theory validation`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 20 |
| Runtime | ❌ Not found | 0 |
| Executive | ❌ Not found | 0 |
| Projection | ✅ Found | 20 |
| UI | ✅ Found | 10 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ✅ Found | 108 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/model/judgment/buildExecutiveAssessment.ts`

- Line 522 · **definition** · matched `theoryValidation`
  - `const theoryValidation = buildTheoryReflection({`
- Line 570 · **unknown** · matched `theoryValidation`
  - `} ${theoryValidation.whyDiscoveryBelievesIt} ${theoryValidation.calibratedConfidenceExplanation} ${theoryValidation.executiveRecommendation}``
- Line 572 · **unknown** · matched `theoryValidation`
  - `? `${strongestJudgment.assessment} This explanation ranked highest because it had the strongest combined judgment score across evidence, explanatory power, causal plausibility, executive significance, and intervention leverage. ${theoryValidation.calibratedConfidenceExplanation}``
- Line 608 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`

#### `engine/v3/model/judgment/buildTheoryReflection.ts`

- Line 3 · **unknown** · matched `theoryValidation`
  - `TheoryValidation,`
- Line 4 · **unknown** · matched `theoryValidation`
  - `TheoryValidationEvidence,`
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
- Line 330 · **unknown** · matched `theoryValidation`
  - `): TheoryValidation {`

#### `engine/v3/model/judgment/organizationalJudgment.ts`

- Line 81 · **unknown** · matched `theoryValidation`
  - `export type TheoryValidationEvidence = {`
- Line 94 · **unknown** · matched `theoryValidation`
  - `export type TheoryValidation = {`
- Line 99 · **unknown** · matched `theoryValidation`
  - `supportingMechanisms: TheoryValidationEvidence[];`
- Line 100 · **unknown** · matched `theoryValidation`
  - `supportingOrganizationalBeliefs: TheoryValidationEvidence[];`
- Line 104 · **unknown** · matched `theoryValidation`
  - `contradictoryOrWeakeningEvidence: TheoryValidationEvidence[];`
- Line 129 · **type** · matched `theoryValidation`
  - `theoryValidation?: TheoryValidation;`

### Projection

#### `components/executive-v2/projection/ExecutiveProjection.ts`

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
- Line 90 · **unknown** · matched `Theory Validation`
  - `* rendering when runtime theory validation is not yet available.`
- Line 92 · **type** · matched `theoryValidation`
  - `theoryValidation?: ExecutiveTheoryValidation;`

#### `components/executive-v2/projection/buildExecutiveProjection.ts`

- Line 8 · **unknown** · matched `theoryValidation`
  - `ExecutiveTheoryValidation,`
- Line 54 · **type** · matched `theoryValidation`
  - `theoryValidation?: ExecutiveTheoryValidation;`
- Line 272 · **unknown** · matched `theoryValidation`
  - `function buildTheoryValidationProjection(`
- Line 274 · **unknown** · matched `theoryValidation`
  - `): ExecutiveTheoryValidation \| undefined {`
- Line 275 · **read** · matched `theoryValidation`
  - `return runtimeMemory?.executiveAssessment?.theoryValidation;`
- Line 294 · **definition** · matched `theoryValidation`
  - `const theoryValidation =`
- Line 295 · **unknown** · matched `theoryValidation`
  - `buildTheoryValidationProjection(runtimeMemory);`
- Line 329 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.dominantTheory \|\|`
- Line 345 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.whyDiscoveryBelievesIt \|\|`
- Line 354 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.evidenceThatWouldFalsifyTheory?.[0] \|\|`
- Line 355 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.calibratedConfidenceExplanation \|\|`
- Line 365 · **unknown** · matched `theoryValidation`
  - `theoryValidation?.executiveRecommendation \|\|`
- Line 377 · **unknown** · matched `theoryValidation`
  - `theoryValidation,`

### UI

#### `components/executive-v2/answers/ExecutiveAnswerGrid.tsx`

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

### Benchmark

#### `engine/benchmark/benchmarkReporter.ts`

- Line 162 · **read** · matched `theoryValidation`
  - `if (score.theoryValidationScore >= 70) {`
- Line 198 · **read** · matched `theoryValidation`
  - `if (score.theoryValidationScore < 50) {`
- Line 266 · **read** · matched `theoryValidation`
  - `if (score.theoryValidationScore < 60) {`
- Line 268 · **unknown** · matched `Theory Validation`
  - `"   Recommendation: improve theory validation inside buildExecutiveAssessment().",`
- Line 335 · **unknown** · matched `Theory Validation`
  - `console.log(`   Theory Validation      : ${score.theoryValidationScore}%`);`

#### `engine/benchmark/benchmarkScorer.ts`

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

#### `engine/benchmark/benchmarkTypes.ts`

- Line 15 · **unknown** · matched `theoryValidation`
  - `export type BenchmarkTheoryValidation = {`
- Line 124 · **unknown** · matched `theoryValidation`
  - `theoryValidationScore: number;`

#### `engine/benchmark/runAtlasSimulation.ts`

- Line 553 · **definition** · matched `theoryValidation`
  - `const theoryValidation = asRecord(`
- Line 554 · **read** · matched `theoryValidation`
  - `executiveAssessment.theoryValidation,`
- Line 597 · **unknown** · matched `theoryValidation`
  - `theoryValidation.whyDiscoveryBelievesIt ??`
- Line 603 · **unknown** · matched `theoryValidation`
  - `theoryValidation.supportingMechanisms,`
- Line 608 · **unknown** · matched `theoryValidation`
  - `theoryValidation.competingTheoriesConsidered,`
- Line 613 · **unknown** · matched `theoryValidation`
  - `theoryValidation.contradictoryOrWeakeningEvidence,`
- Line 618 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation,`
- Line 623 · **unknown** · matched `theoryValidation`
  - `theoryValidation.additionalEvidenceThatWouldIncreaseConfidence,`
- Line 628 · **unknown** · matched `theoryValidation`
  - `theoryValidation.evidenceThatWouldFalsifyTheory,`
- Line 633 · **unknown** · matched `theoryValidation`
  - `theoryValidation.executiveRecommendation ??`

#### `engine/benchmark/runBenchmarkInvestigation.ts`

- Line 111 · **type** · matched `theoryValidation`
  - `theoryValidation?: {`
- Line 172 · **definition** · matched `theoryValidation`
  - `function theoryValidationText(`
- Line 173 · **type** · matched `theoryValidation`
  - `theoryValidation:`
- Line 174 · **read** · matched `theoryValidation`
  - `\| NonNullable<BenchmarkRuntimeMemory["executiveAssessment"]>["theoryValidation"]`
- Line 177 · **unknown** · matched `theoryValidation`
  - `if (!theoryValidation) return "";`
- Line 180 · **unknown** · matched `theoryValidation`
  - `theoryValidation.dominantTheory ?? undefined,`
- Line 181 · **unknown** · matched `theoryValidation`
  - `theoryValidation.whyDiscoveryBelievesIt,`
- Line 182 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.supportingMechanisms?.flatMap((item) => [`
- Line 186 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.supportingOrganizationalBeliefs?.flatMap((item) => [`
- Line 190 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.competingTheoriesConsidered?.flatMap((item) => [`
- Line 195 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.contradictoryOrWeakeningEvidence?.flatMap((item) => [`
- Line 199 · **unknown** · matched `theoryValidation`
  - `theoryValidation.calibratedConfidenceExplanation,`
- Line 200 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence ?? []),`
- Line 201 · **unknown** · matched `theoryValidation`
  - `...(theoryValidation.evidenceThatWouldFalsifyTheory ?? []),`
- Line 202 · **unknown** · matched `theoryValidation`
  - `theoryValidation.executiveRecommendation,`
- Line 285 · **read** · matched `theoryValidation`
  - `theoryValidationText(memory.executiveAssessment?.theoryValidation),`
- Line 304 · **type** · matched `theoryValidation`
  - `theoryValidation: memory.executiveAssessment?.theoryValidation,`
- Line 321 · **type** · matched `theoryValidation`
  - `theoryValidation: memory.executiveAssessment?.theoryValidation,`

#### `engine/benchmark/understandingFitnessScorer.ts`

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

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
