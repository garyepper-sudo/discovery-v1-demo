# Benchmark Checkpoint and Priorities

Date: 2026-07-23
Branch: `sprint-79-organization-experience`
Commit: `5bee35a827a51b5aadf9d33b83d5ba89457396f9`

## Purpose and repository safety

This checkpoint ranks measured deficiencies. It does not change cognition,
Runtime, schemas, pipeline ordering, confidence, contradiction handling,
recommendations, simulations, architecture, product behavior, fixtures,
benchmark expectations, or scoring.

Nothing was staged at startup. The dirty tree was classified as follows:

| Class | Current files |
| --- | --- |
| Sprint 110 | modified conversation interpreters, collaboration scorer/types/validator, product validation, `package.json`; untracked reasoning evaluator and held-out scenarios |
| Baseline reports | `BENCHMARK_BASELINE.md`, `BENCHMARK_REGRESSION_ANALYSIS.md` |
| Decision Lab isolation | modified validator; untracked isolated fixture loader and order-independence regression |
| Semantic trace | `OBSERVATIONS_TO_SIGNALS_TRACE.md`, `traceConcurrencyStaffingSemantics.ts` |
| Theme-policy experiment | `THEME_COMPOSITION_POLICY_EXPERIMENT.md`, `themeCompositionPolicyExperiment.ts` |
| Joint-composition experiment | `JOINT_COMPOSITION_EXPERIMENT.md`, `jointCompositionExperiment.ts` |
| Relationship feasibility | `EXPLANATORY_RELATIONSHIP_FEASIBILITY.md`, `explanatoryRelationshipFeasibility.ts` |
| Generated architecture | `discovery-brief.txt`, capability audit/registry/state JSON, architecture handoff, five capability traces |
| Runtime | three untracked `org_*.json` files |
| Provider output | `provider-benchmark.txt` |
| Strategic/product documentation | untracked Platform, Governance, Lifecycle, Alpha, Design Language, UI, and component documents |
| Unrelated user work | `Does` |

Canonical tracked Atlas and Northstar fixtures had no diff. Sprint 110 and
unrelated files were not edited by this checkpoint.

## Canonical benchmark scorecard

| Benchmark | Current authoritative result | Determinism and comparability | Disposition |
| --- | --- | --- | --- |
| Northstar Ground Truth | 75/100 | deterministic isolated 48-artifact replay | authoritative current Ground Truth |
| Historical Northstar | approximately 85/100 | partially comparable; older persisted-state construction | historical methodology reference, not a regression |
| Atlas canonical | 100%, PASS | deterministic fixed fixture | healthy |
| Atlas legacy | 73%, not passed | deterministic but different legacy model | historical/legacy diagnostic |
| Executive Decision Lab | 39/39 PASS | deterministic after fixture isolation | healthy |
| Decision order independence | PASS both directions and repeated execution | isolated fixture restored | fixture defect resolved benchmark-locally |
| Cognitive Layer Validation | 15/15 layers; 12/12 handoffs | deterministic | healthy |
| Operating Model Evolution | 14/14 PASS; all dimensions 5/5 | deterministic benchmark-only foundation | healthy |
| Production evolution replay | 7/8 | deterministic | historical mechanism truth remains missing |
| Executive Simulation | 15 invariants PASS | deterministic fixed time | healthy |
| Judgment Lab | framework 15/15; expansion 15/15 | deterministic; sensitivity reported as limited | diagnosis unresolved |
| Executive Collaboration historical Runtime-only | 65.21/100 | deterministic six-scenario historical baseline | superseded methodology reference |
| Sprint 110 Runtime-only | 63.36 combined | deterministic, dirty uncommitted split-dimension tree | not a committed canonical baseline |
| Sprint 110 deterministic mock | 90.88 combined | deterministic, dirty uncommitted tree | controlled oracle only |
| Provider V1 | 77.81 combined | live provider, nondeterministic | frozen experimental baseline |
| Provider V2 | 81.55 combined | live provider, nondeterministic; 96/96 calls, zero fallbacks | experimental improvement, uncommitted |
| Organizational Intelligence | 99.63/100 | deterministic, 12 cases | benchmark wrappers demonstrate reuse; governance gaps remain |
| Product Interaction Boundary | 14/14 PASS | deterministic | healthy |
| Living Interaction Loop | 18/18 PASS | deterministic | healthy |
| Cognition registry | 32 capabilities; no registry integrity failures | deterministic; regenerates audit | healthy at registry depth |
| Deep architecture verification | 291/302 PASS | deterministic | 11 known checks remain |

Scores from different fixtures, providers, evaluators, denominators, or state
construction must not be averaged.

## Validated finding inventory

| Finding | Classification | Capability and impact | Diagnosis confidence | Architecture / implementation risk | Coverage and disposition |
| --- | --- | --- | --- | --- | --- |
| Ground Truth 75 misses priority/sequencing and explicit no-headcount meaning | validated limitation; production change not justified | complete organizational explanation; executives receive a broadly correct but compressed diagnosis | high on loss location; high that tested repairs are insufficient | high because missing conditional representation has no safe owner | deterministic semantic, Theme, joint, and relationship studies; close production-repair thread |
| Historical 85 versus current 75 | evaluator/methodology deficiency | benchmark provenance only | high | low | preserve as partially comparable historical result |
| Independent first-five composition bounds | proven production behavior, not independently sufficient as defect repair | Theme and causal composition | high | medium | widening/reranking failed; no change authorized |
| Missing conditional relationship | representation research limitation | conditional organizational explanation | high | high | current structured producers cannot populate it early |
| Relationship feasibility | research closed as not feasible | explanatory composition | high | high | 0% conditional recall; generic support cannot be called causality |
| Production replay historical overwrite | proven production reasoning deficiency; intentionally deferred | historical mechanism memory and longitudinal understanding | high | high implementation and regression risk | 7/8 replay plus focused confidence regression |
| Judgment Lab limited sensitivity | provisional production reasoning deficiency | judgment responsiveness to decisive evidence | low | low for benchmark investigation; unknown for repair | controlled ablation not yet run |
| Decision Lab shared fixture | benchmark/fixture deficiency | regression reliability, no production impact | high | low | isolation and order regression complete |
| Atlas canonical 100 / legacy 73 | methodology/legacy distinction | no demonstrated canonical deficiency | high | low | report separately |
| Collaboration Runtime-only weakness | product/communication and conversation-understanding deficiency | executive collaboration, continuity, trust | high for measured output | medium; Sprint 110 is uncommitted | Runtime 63.36, mock 90.88, provider results separate |
| Provider V2 challenge opportunity 4.44/5 but challenge quality 2.84/5 | product communication/composition deficiency | executive challenge usefulness | high on measured gap | medium | next conversation experiment belongs to Sprint 110, not engine cognition |
| Organizational Intelligence governance enforcement | intentionally deferred architecture/product behavior | future privacy, authorization, temporal policy | high | high | visibility is benchmark-policy-only; persistent authorization and temporal policy are genuine gaps |
| 11 deep architecture checks | known architecture validation debt | maintainability, impact traceability, export assurance | high | medium | three reciprocal-link findings and six producer-export findings produce 11 failed checks |
| React Hook warnings | implementation debt, not reasoning | developer quality; no measured executive impact | high | low | six unchanged warnings |
| Sandbox `tsx` IPC failures | infrastructure finding | local benchmark execution only | high | none in product | run validators in IPC-capable environment |

Deep architecture details:

- reciprocal declarations: `CAP-UND-003→CAP-UND-001`,
  `CAP-LRN-002→CAP-ADP-001`, `CAP-SYS-001→CAP-SIM-001`;
- undeclared canonical producer exports: `CAP-SYS-001`, `CAP-SYS-002`,
  `CAP-SIM-003`, `CAP-DEC-005`, `CAP-DEC-006`, `CAP-DEC-007`;
- some findings affect multiple checks, producing 11 failures total.

## Deficiency classifications

### A. Proven production reasoning deficiency

- Historical mechanism truth is overwritten during longitudinal evolution.

### B. Provisional production reasoning deficiency

- Judgment may be insufficiently sensitive to decisive evidence. The benchmark
  has not separated fixture, evaluator, and production causes.

### C. Benchmark or fixture deficiency

- The former shared mutable Decision Lab Atlas fixture. Isolation is now
  present and regression-covered.

### D. Evaluator or methodology deficiency

- Historical Ground Truth 85 lacks fully comparable state-construction
  provenance.
- Atlas legacy 73 and canonical 100 measure different models.
- Historical and split-dimension collaboration scores use different scenario
  sets and must remain separate.

### E. Known architecture validation debt

- Eleven deep reciprocity/export checks.
- Governance enforcement remains benchmark-only or unimplemented.

### F. Product or presentation deficiency

- Runtime-only executive collaboration.
- Provider V2 detects challenge opportunities better than Ask turns them into
  useful challenge.
- Existing React Hook warnings are implementation quality debt, not cognitive
  behavior.

### G. Intentionally deferred behavior

- historical mechanism lineage;
- merge, split, retirement, reactivation, and supersession;
- persistent authorization and temporal governance policy;
- Alpha Runtime integration.

### H. Research opportunity

- controlled decisive-evidence Judgment Lab ablation;
- Organizational Intelligence Evolution Lab after checkpoint prerequisites;
- future conditional representation only if independent evidence reopens it.

## Prioritization model

Actionable items are compared dimension by dimension. Ratings are
`high`, `medium`, or `low`; risk and complexity are costs, so lower is better.

| Priority candidate | Org-understanding value | Breadth / frequency | Severity | Root-cause confidence | Measurable gain | Determinism / regression risk | Architecture / complexity | Reversible | New representation dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Judgment decisive-evidence ablation | high if defect confirmed | broad judgment pipeline; frequency unknown | potentially high | low today | high diagnostic value | low / low, benchmark-only | low | high | none |
| Historical mechanism lifecycle | high longitudinal value | evolution and all future persistent applications | high | high | high | medium / high | high | medium | substantial lifecycle work |
| Sprint 110 challenge composition | medium organizational, high executive value | executive conversations only | medium | high | measurable in five dimensions | provider variance / medium | medium | high | none |
| Architecture reciprocity/export debt | indirect | broad engineering assurance | medium | high | directly measurable | low / low | medium | high | none |
| Governance production enforcement | high future platform value | all shared-intelligence applications | high when productized | high gap confidence | high eventually | high / high | high | medium | authorization infrastructure |
| Ground Truth relationship thread | high theoretical value | unknown beyond Northstar | medium | high that current path is infeasible | low under current constraints | high / high | high | low | required |

## Ranked actionable priorities

### 1. Controlled Judgment Lab decisive-evidence ablation

This is the highest ROI next benchmark sprint. It can determine whether
Discovery responds inadequately to decisive evidence without changing
production. The potential organizational-intelligence value is broad, the
experiment is deterministic and reversible, and the current uncertainty is
precisely what a benchmark should resolve.

### 2. Clean checkpoint for the Organizational Intelligence Evolution Lab

The adaptive lab has high cross-application value, but comparator fairness
requires a clean, immutable starting point. It should follow isolation of the
approved benchmark work from Sprint 110, generated files, Runtime state, and
provider output.

### 3. Historical mechanism lifecycle

This is the only proven remaining production reasoning defect. It ranks below
the two benchmark steps because its architecture and regression surface are
large, and its behavior is explicitly deferred. It should be reconsidered
only after an evolution benchmark defines lifecycle expectations beyond the
single overwrite failure.

### 4. Sprint 110 challenge response composition

The measured gap is real, narrow, and valuable for executives, but it is
conversation communication rather than Shared Organizational Intelligence.
It should remain a separate Sprint 110 follow-up after that work is reviewed
and committed.

### 5. Architecture reciprocity/export debt

High confidence and measurable, but no observed reasoning failure. Address in
a dedicated maintenance sprint.

Governance implementation is not ranked as immediately actionable because the
product phase has not authorized production enforcement. The Ground Truth
relationship thread is excluded from actionable ranking because feasibility
failed.

## Explanatory-relationship thread disposition

**VALIDATED LIMITATION — PRODUCTION CHANGE NOT JUSTIFIED**

Not authorized:

- widening Theme composition;
- widening causal-chain composition;
- bounded diversity or connectivity policies;
- generic relationship graphs;
- typed conditional relationship schema;
- a new explanatory-relationship capability.

Why:

- widening one boundary does not improve final explanation;
- unbounded dual composition still lacks the counterfactual;
- bounded alternatives trade one required meaning for another;
- relationship-guided selection reproduces generic support ranking;
- conditional recall is 0%;
- early rejected-alternative recall is 0%;
- generic support is too ambiguous to relabel as causality;
- no current producer owns reliable early conditional inference.

Reopen only if an independent benchmark outside Northstar demonstrates the
same missing conditional structure, identifies a general structured producer
already available before composition, and shows bounded improvement without
false causal claims or regressions.

## Organizational Intelligence Evolution Lab readiness

**NOT READY**

The reasoning baseline itself is stable, but the repository checkpoint is not
safe enough for fair adaptive comparison:

| Readiness gate | Status |
| --- | --- |
| deterministic baseline | ready |
| fixture isolation | ready for Decision and Northstar/Atlas restoration |
| Runtime immutability | ready in current isolated validators |
| canonical score stability | ready: Ground Truth 75 and Atlas 100 |
| evaluator separation | ready |
| dirty-tree safety | not ready |
| unresolved production changes | Sprint 110 remains uncommitted |
| comparator fairness | not ready until all comparator code and fixtures come from one explicit checkpoint |

Before the lab begins:

1. isolate or commit approved Sprint 110 work separately;
2. isolate the benchmark investigations and Decision fixture work from
   generated artifacts, Runtime state, provider output, and unrelated files;
3. start the lab in a clean worktree at an explicit commit;
4. freeze fixture hashes, evaluator version, seeded entropy, replay time, and
   Runtime restoration checks;
5. use the same evidence and evaluation for stateless/current, persistent, and
   bounded-adaptive comparators;
6. treat existing historical-overwrite behavior as a declared baseline, not an
   adaptive advantage or hidden failure.

## Recommended next benchmark sprint

Run one controlled Judgment Lab decisive-evidence ablation.

The sprint should vary only declared decisive evidence, hold fixture and
evaluator constant, measure judgment, confidence, uncertainty, causal
selection, and recommendation response, and classify the result as production,
fixture, evaluator, or no issue. Do not repair production during that sprint.

After that ablation and repository cleanup, begin the Organizational
Intelligence Evolution Lab from the explicit clean checkpoint.

## Recommended next production sprint

**No production sprint is justified at this checkpoint.**

Historical mechanism lifecycle is proven but needs a broader lifecycle
benchmark before implementation. The Ground Truth relationship path is closed.
Sprint 110 challenge composition remains separate uncommitted product work.

## Explicit behavior confirmation

This checkpoint changes documentation only. No production behavior, cognition,
Runtime, schema, pipeline, confidence, contradiction, recommendation,
simulation, explanation, architecture, product behavior, canonical fixture,
benchmark expectation, or score changed.

## Remaining uncertainty

- Judgment sensitivity ownership remains unresolved until the ablation.
- The adaptive lab may expose a different highest-value persistent-learning
  deficiency.
- Historical lifecycle breadth beyond overwrite is not yet measured.
- Sprint 110 scores remain tied to an uncommitted tree and should not be treated
  as clean canonical baselines.
