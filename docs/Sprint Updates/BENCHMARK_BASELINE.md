# Discovery Benchmark Baseline

Date: 2026-07-23
Branch: `sprint-79-organization-experience`
Commit: `5bee35a827a51b5aadf9d33b83d5ba89457396f9`

## Scope and safety

This is an investigation baseline, not an optimization. No production, Runtime, cognition, confidence, contradiction, ranking, recommendation, simulation, explanation, projection, product, or architecture behavior was changed.

The working tree was dirty before this investigation. It contained uncommitted Sprint 110 conversation and benchmark work, generated benchmark and architecture output, local Runtime fixtures, canonical/Alpha documentation, and unrelated user work. Nothing was staged. The investigation did not stage or commit any of those changes. `npm run cognition:validate` regenerated the already-dirty capability-audit output as designed; it was not restored because it was not clean at startup.

The Northstar cognitive trace and layer validators changed the previously clean tracked Northstar Runtime fixture. The Atlas simulation changed the previously clean tracked Atlas fixture. Both files were restored byte-for-byte from pre-run copies. No pre-existing Runtime file was restored or altered.

## Repository-state classification

| Class | Files present before this investigation |
| --- | --- |
| Sprint 110 | `engine/benchmark/executive-collaboration-lab/{executiveConversationTypes,scoreExecutiveConversation,validateExecutiveCollaborationLab}.ts`; `engine/conversation/{MockConversationInterpreter,OpenAIConversationInterpreter,executiveConversationTypes,index}.ts`; `scripts/product/validateExecutiveConversationIntelligence.ts`; `package.json`; untracked `evaluateReasoningInterpretation.ts` and `reasoningHeldOutConversationScenarios.ts` |
| Generated benchmark output | `provider-benchmark.txt` |
| Generated architecture output | `discovery-brief.txt`; capability audit/registry/state JSON; `ARCHITECTURE_HANDOFF.md`; five capability traces |
| Runtime fixtures | Three untracked `org_*.json` files |
| Documentation | Modified Executive Conversation Intelligence canon; untracked Platform Principles, Governance canon, Universal Intelligence Lifecycle, Alpha experience documents, Design Language, UI System, and Component Library |
| Unrelated user work | Untracked empty file `Does` |

## Canonical benchmark inventory

| Benchmark / validator | Purpose and fixture | Entry command | Output / score | Determinism | Repository mutation | Ground Truth contributor |
| --- | --- | --- | --- | --- | --- | --- |
| Northstar Ground Truth | Scores a canonical isolated 48-artifact Northstar replay against five semantic expectations | `npm run northstar:ground-truth` | Console; 0–100 | Yes; fixed replay and timestamp | Restores Runtime | Yes |
| Northstar Precision Gap | Locates first semantic presence/loss by cognitive layer in persisted Northstar state | `npm run northstar:precision-gap:001` | Diagnostic trace; no aggregate | Conditional on fixture | Read-only | No |
| Northstar Cognitive Trace | Traces the Northstar pipeline | `npm run northstar:cognitive-trace:001` | Layer trace; no aggregate | Yes for fixed fixture | Writes Northstar Runtime | No |
| Cognitive Layer Validation | Validates 15 layers and 12 handoffs | `npm run northstar:cognitive-layer-validation:001` | Pass/fail | Yes for fixed fixture | Writes Northstar Runtime | No |
| Atlas simulation | Exercises canonical organizational reasoning and simulation | `npm run simulate:atlas` | Legacy and canonical scorecards | Yes for fixed fixture | Writes Atlas Runtime | No |
| Generic benchmark runner | Runs dataset and longitudinal benchmark fixtures | `npm run benchmark` | Aggregate benchmark output | Not established here | Writes benchmark Runtime | No |
| Judgment Lab | Tests hidden truth, evidence boundaries, determinism, metamorphic fixtures, and evaluation separation | `npx tsx .../validateJudgmentLab.ts`; expansion validator | Independent pass/fail checks; deliberately no aggregate | Yes | No durable production state | No |
| Executive Decision Lab | Tests decision selection, recommendation, confidence, risks, simulation, and identity against Atlas decision fixtures | `npx tsx .../validateExecutiveDecisionLab.ts` | 39 checks | Deterministic only from expected fixture state | Reads shared persisted Atlas fixture | No |
| Operating Model Evolution Lab | Tests isolated organizational evolution invariants | `npx tsx .../validateOperatingModelEvolutionLab.ts` | 14 checks and 8-dimensional scorecard | Yes | No durable production state | No |
| Production evolution replay | Tests production evolution, historical behavior, and mechanism-confidence regression | `npx tsx .../validateProductionOperatingModelReplay.ts` | 8 expectations plus focused confidence regression | Yes | No durable production state | No |
| Executive Simulation | Tests scenario identity, ranking, coverage, recommendation preservation, and determinism | `npx tsx .../executiveSimulationSynthesis001.ts` | 15 checks | Yes with fixed timestamp | No | No |
| Executive Collaboration Lab | Scores multi-turn executive collaboration in Runtime-only and interpreter modes | `npm run benchmark:executive-collaboration` | 0–100 plus dimensions | Runtime-only/mock yes; live provider no | Restores scenario Runtime | No |
| Organizational Intelligence Lab | Tests recursive scoped intelligence, privacy, governance-policy wrappers, and context complexity | `npm run benchmark:organizational-intelligence` | 0–100 plus architecture-fit classifications | Yes | Runtime unchanged | No |
| Living Interaction Loop | Validates interaction-loop product boundaries | `npx tsx scripts/product/validateLivingInteractionLoop.ts` | 18 checks | Yes | No | No |
| Product Interaction Boundary | Validates product-to-Runtime action boundaries | `npx tsx scripts/product/validateProductInteractionBoundary.ts` | 14 checks | Yes | No | No |
| Capability Registry Validation | Checks registry metadata completeness and internal references | `npm run cognition:validate` | Counts and pass/fail | Yes | Regenerates capability audit | No |
| Architecture Verification | Checks producer exports, dependency links, and reciprocal relationships | `npm run verify:architecture` | 302 checks | Yes | Read-only | No |

`npm run benchmark` was inventoried but not executed because its persisted benchmark-state mutation was unnecessary for the requested canonical baseline and unsafe in this already dirty worktree.

## Commands and fresh results

| Command | Result | Runtime |
| --- | --- | --- |
| `npm run northstar:ground-truth` (run 1) | 75/100 | 8.22 s |
| `npm run northstar:ground-truth` (run 2) | 75/100 | 8.47 s |
| Ground Truth determinism regression | PASS; complete Runtime restored and equal | focused |
| `npm run northstar:precision-gap:001` | PASS diagnostic | 0.26 s |
| `npm run northstar:cognitive-trace:001` | PASS | 0.39 s |
| `npm run northstar:cognitive-layer-validation:001` | 15/15 layers, 12/12 handoffs | 0.42 s |
| `npm run simulate:atlas` | Legacy 73% fail; canonical 100% pass | 0.68 s |
| Executive Decision Lab, after exact fixture restoration | 39/39 PASS | focused |
| Operating Model Evolution Lab | 14/14 PASS; all eight dimensions 5/5 | 0.22 s |
| Production Operating Model Replay | 7/8 expectations; focused mechanism-confidence regression PASS | 0.49 s |
| Executive Simulation Synthesis | PASS, 15 invariants | 0.34 s |
| Judgment Lab framework | 15/15 PASS; sensitivity observed: limited | 0.70 s |
| Judgment Lab expansion | 15/15 PASS | 0.21 s |
| Executive Collaboration Lab, dirty Sprint 110 tree | Runtime-only 67.47; mock 91.67; integrity gates PASS | 0.74 s |
| Organizational Intelligence Lab | 99.63/100; `PARTIALLY_SUPPORTED_GENUINE_GAP_FOUND` | 0.34 s |
| Living Interaction Loop | 18 PASS | 0.23 s |
| Product Interaction Boundary | 14 PASS | 0.23 s |
| `npm run cognition:validate` | PASS; 32 capabilities, no registry metadata omissions | 0.10 s |
| `npm run verify:architecture` | 291/302 PASS; 11 known findings | 0.35 s |
| `npm run typecheck` | PASS | — |
| `npm run build` | PASS with six existing React Hook warnings | — |

The first sandboxed attempt to run six `tsx` validators failed with `listen EPERM` before benchmark code executed. The identical commands succeeded outside the restricted sandbox. This was an infrastructure failure, not a benchmark failure.

## Historical Ground Truth reconciliation

The recoverable historical baseline is `engine/benchmark/high-volume/northstar/results/ground-truth/LATEST.md`, committed by `db2d069e0bc22c9950ac5673464be09c9f6b9eca` on 2026-07-16 as “Record Northstar ground truth baseline at 85.”

Its rubric and denominator match the current benchmark:

- excessive concurrent work: 30
- decision bottlenecks: 25
- acquisition drag: 20
- staffing is not the root cause: 15
- customer pressure is secondary: 10
- total: 100, with false-positive and calibration penalties

The historical score was 85: concurrent work 20/30, decision 25/25, acquisition 20/20, staffing 10/15, customer 10/10, no penalties, and executive confidence 79.3%.

Commit `2933331609324f8f90ad050531f98e05b12c6d5d` later changed state construction from whatever persisted Northstar Runtime existed to `runCanonicalNorthstarGroundTruthReplay()`: a fresh isolated deterministic 48-artifact replay with Runtime restoration. It did not change the rubric. The fresh score is 75: concurrent work 10/30, decision 25/25, acquisition 20/20, staffing 10/15, customer 10/10, no penalties, and executive confidence 83.94%.

Classification: **PARTIALLY COMPARABLE**. The rubric, fixtures, weights, and denominator are comparable; the state-construction method and commit context are not identical. The ten-point difference is therefore not sufficient evidence of a production regression.

## Ground Truth detail and determinism

The two fresh runs were substantively identical. The focused regression compares the complete produced Runtime, so mechanisms, conditions, recommendations, confidence, executive judgment, and narrative were equal; the pre-run Runtime was also restored. No approved timestamp exception was needed.

Current deductions:

- excessive concurrent work: 1 of 3 expected semantic groups, 10/30
- staffing is not the root cause: 2 of 3 expected semantic groups, 10/15

The persisted-state Precision Gap diagnostic places the earliest loss for both themes at the Observations-to-Signals handoff. Because that diagnostic does not consume the isolated Ground Truth replay, this is strong directional evidence, not yet a fully controlled causal proof.

## Sprint 110 analysis

The recorded values `63.36`, `90.88`, `77.81`, and `81.55` come from the uncommitted split-dimension Executive Collaboration evaluation in `evaluateReasoningInterpretation.ts`, not Ground Truth.

It combines six development scenarios, four prior held-out scenarios, and six untracked reasoning held-out scenarios. The scorer retains a 100-point denominator but splits constructive challenge into 5-point challenge-opportunity detection and 5-point challenge quality. Runtime-only uses no interpreter; mock uses the deterministic `MockConversationInterpreter`; Provider V1 and V2 use live OpenAI interpretations and are nondeterministic.

The recorded runs belong to a dirty working tree, not committed HEAD. The provider outputs were not regenerated. The current development-only validator produced 67.47 Runtime-only and 91.67 mock; those values are not replacements for the recorded combined development-plus-held-out scores.

## Score comparability matrix

| Score | Benchmark / fixtures | Provider | Deterministic | Weight / denominator | Code state | Comparable with Ground Truth |
| --- | --- | --- | --- | --- | --- | --- |
| Historical 85 | Northstar Ground Truth; historical persisted-state context | None | Not fully established historically | 30/25/20/15/10; 100 | `db2d069…` | PARTIAL |
| Current 75 | Isolated canonical 48-artifact Northstar replay | None | Yes | same rubric; 100 | HEAD-compatible reasoning code | YES to repeat runs; PARTIAL to 85 |
| Sprint 110 Runtime-only 63.36 | 16 collaboration scenarios, combined | None | Yes | collaboration dimensions; 100 | dirty Sprint 110 tree | NO |
| Sprint 110 mock 90.88 | same collaboration fixtures | deterministic mock | Yes | collaboration dimensions; 100 | dirty Sprint 110 tree | NO |
| Sprint 110 Provider V1 77.81 | same collaboration fixtures | OpenAI V1 | No | collaboration dimensions; 100 | dirty Sprint 110 tree | NO |
| Sprint 110 Provider V2 81.55 | same collaboration fixtures | OpenAI V2 | No | collaboration dimensions; 100 | dirty Sprint 110 tree | NO |
| Fresh Runtime-only 67.47 | six development collaboration scenarios only | None | Yes | split collaboration dimensions; 100 | dirty Sprint 110 tree | NO |
| Fresh mock 91.67 | six development collaboration scenarios only | deterministic mock | Yes | split collaboration dimensions; 100 | dirty Sprint 110 tree | NO |
| Organizational Intelligence 99.63 | 12 recursive/governance benchmark cases | None | Yes | 18 benchmark dimensions; 100 | dirty docs/Sprint 110 tree, benchmark wrappers | NO |

Incompatible scores must not be averaged.

## Architecture validation reconciliation

The “100% architecture health” startup/cognition result means the capability registry has 32 unique, structurally complete entries with declared producers, consumers, Runtime destinations, and resolvable dependency identifiers.

`verify:architecture` performs deeper checks against actual canonical exports and reciprocal dependency declarations. It remains 291/302 (96%) with 11 checks failing:

- three reciprocal links: CAP-UND-003→CAP-UND-001, CAP-LRN-002→CAP-ADP-001, CAP-SYS-001→CAP-SIM-001
- six undeclared canonical producer exports: CAP-SYS-001, CAP-SYS-002, CAP-SIM-003, CAP-DEC-005, CAP-DEC-006, CAP-DEC-007

The validator reports 11 failed checks because some findings affect more than one check. These results measure different invariants and are not contradictory. The deeper findings are known validation debt and were not repaired.

## Baseline conclusion

The authoritative current Ground Truth baseline is **75/100 on the deterministic isolated replay**. The historical 85 remains a recoverable, partially comparable baseline. Core cognitive handoffs, canonical Atlas reasoning, decision behavior from a clean fixture, simulation, evolution, product boundaries, and deterministic replay remain healthy. Benchmark fixture isolation and semantic preservation into Signals are the two material investigation areas.
