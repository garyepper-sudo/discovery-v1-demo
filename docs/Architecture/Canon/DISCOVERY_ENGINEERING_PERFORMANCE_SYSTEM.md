# Discovery Engineering Performance System

**Status:** Canonical engineering measurement architecture
**Scope:** Engineering instrumentation and interpretation
**Authority:** Engineering evidence and promotion decisions only

---

# Purpose and Boundary

The Discovery Engineering Performance System (DEPS) answers:

> Is Discovery objectively becoming a better organizational intelligence
> platform, why did it change, and was the added complexity justified?

DEPS unifies existing evidence without replacing its owners. It is not a
benchmark, production capability, Runtime object, research method, Scorecard
metric, or user-facing feature.

| Existing system | Authority retained | DEPS responsibility |
| --- | --- | --- |
| Discovery Scorecard | Five and only five project-level scores | Report evidence-supported directional effects |
| Organizational Understanding Research Framework | Six dimensions and research method | Reference adapted results and evidence maturity |
| Local Understanding Utility | Optional benchmark-only profile for one protocol | Keep local; never aggregate across experiments |
| Benchmark and regression gates | Native fixtures, results, and classifications | Register provenance, comparability, and movement |
| Architecture and capability validation | Structural and deep findings | Track assurance, ownership, coupling, debt, and drift |
| Runtime validation and replay | Actual persistence, compatibility, and determinism | Record replay and migration evidence |
| Sprint documents | Current state, hypothesis, and decisions | Apply one reporting standard |

DEPS does not change production, Runtime, cognition, Organizational
Understanding, governance, benchmark behavior, research results, or the
Discovery Scorecard.

---

# Measurement Philosophy

Every measure must be:

- observable from a named artifact;
- repeatable under a stated protocol;
- traceable to source, scenario, capability, producer, and change;
- bounded to its fixture, method, scope, and time;
- actionable for promotion, rollback, investigation, or a no-claim result.

Canonical rules:

1. Report direction before aggregation.
2. Never average unlike measurements.
3. Missing evidence is `not measured`, not neutral.
4. Determinism proves reproducibility, not correctness or replication.
5. A regression pass proves preservation, not improvement.
6. Research evidence does not imply production readiness.
7. Governance or sustainability regressions cannot be canceled by an
   understanding gain.
8. Complexity is a visible cost, not a hidden negative weight.
9. Accepted debt remains visible and does not authorize new debt.
10. More code, objects, capabilities, benchmarks, or output are not value.

---

# Unified Measurement Hierarchy

A single linear hierarchy is misleading because repository health and
organizational value answer different questions. DEPS uses two coordinated
stacks joined by a trace ledger.

## Assurance stack

```text
Repository Health
↓
Architecture Health
↓
Capability Health
↓
Benchmark and Research Integrity
↓
Migration, Compatibility, and Runtime Assurance
```

This stack asks whether Discovery can be built, understood, replayed, changed,
and trusted. It supplies Governance Integrity and System Sustainability
evidence, but does not prove organizational value.

## Value-evidence stack

```text
Native Benchmark or Product Observation
↓
Capability Movement
↓
Organizational Understanding Research Dimensions, when applicable
↓
Local Understanding Utility, only for a named experiment
↓
Five-score Discovery Scorecard Interpretation
↓
Promotion Decision
```

## Trace ledger

```text
change
→ source run and protocol
→ native result
→ capability and earliest responsible producer
→ assurance effect
→ Scorecard interpretation
→ complexity delta
→ decision
```

Native artifacts remain authoritative. The ledger stores references and
normalized interpretations, not copied benchmark logic.

The Engineering Performance Report combines both stacks. There is no weighted
DEPS total. Overall health is an explicit judgment supported by the full
profile.

---

# Current Measurement Source Inventory

## Repository and engineering assurance

| Source | Measures | Limitation |
| --- | --- | --- |
| `git diff --check` | Patch integrity | No semantic evidence |
| Typecheck | Contract consistency | No Runtime evidence |
| Build | Compilation, lint/type integration, packaging | Warnings and behavior remain separate |
| Cognitive file registry | Files, imports, exports, classification | Structural inventory only |
| Capability registry and audit | IDs, owners, consumers, destinations, dependencies | Declarations may differ from code |
| Deep architecture verification | Producers, reciprocity, Runtime, executive and OS checks | No cognitive-quality evidence |
| Architecture state, handoff, and traces | Structural summary, visibility, navigation | Generated interpretation |
| Runtime validation | Inspection protocol and known discrepancies | Often manual without replay |
| Deterministic and historical replay | Byte stability, ordering, persistence, compatibility | Reproducible output may still be wrong |

## Cognition and Organizational Understanding

| Source family | Measures | Limitation |
| --- | --- | --- |
| Northstar Ground Truth | End-to-end semantic fidelity | Protocol versions are partly comparable |
| Cognitive layer and trace validation | Layer presence, handoffs, ancestry | Presence is not quality |
| Judgment Lab | Evidence sensitivity, mechanisms, constraints, theories, explanations | Protocols cover different responsibilities |
| Provenance and independence gates | Identity, ancestry, duplicate resistance | Do not prove final utility |
| Explanation construction and ancestry gates | Structure, identity, trace | Construction is not adjudication |
| Comparative Evidence Roles gate | Deterministic role production | Roles do not resolve alternatives |
| Adjudication shadows | Candidate-relative discrimination | Semantics remain benchmark-owned |
| Explanation-aware Understanding shadow | Reusable unadjudicated composition | Shadow is not activation |
| Compatibility and ownership migration gates | Preservation, ownership, rollback | Primarily architecture/noninterference evidence |
| Mechanism and causal-constraint suites | Causal structure, composition, ranking, sensitivity | Fixture-specific; some are shadows |
| Longitudinal runner and integrity checks | Learning, stability, memory and understanding growth | Legacy scores require provenance |

## Product and human value

| Source family | Measures | Limitation |
| --- | --- | --- |
| Executive Collaboration Lab | Understanding, continuity, challenge, action, trust | Provider and deterministic cohorts differ |
| Conversation validation | Interpretation and fallback invariants | No direct user capability proof |
| Decision Lab and decision cycle | Comparison, ranking, recommendation, calibration | Fixture-bounded |
| Executive Communication | Grounded expression and communication fidelity | Presentation is not cognition |
| Projection and product-boundary gates | Stable consumption and disclosure | Equivalence is preservation |
| Simulation and optimization suites | Scenarios, constraints, intervention correspondence | Utility depends on fixture validity |
| Operating Model Evolution Lab | Replay, revision, persistence, learning | Historical mechanism lifecycle gaps remain |

## Organization, governance, research, and migration

| Source family | Measures | Limitation |
| --- | --- | --- |
| Organizational Intelligence Lab | Reuse, scoped composition, policy behavior | Some enforcement is benchmark-only |
| Cross-silo and emergence experiments | Joint insight, novelty, necessary-source contribution | Research-only |
| Candidate ecology and architecture experiments | Bounded variation, selection, retention | Synthetic; not universal architecture |
| OU Research Framework | Six-dimensional research interpretation | No universal aggregate |
| Localized Nonlinear Research Adapter | One Local Understanding Utility profile | Decision is `replicate` |
| Provenance and scope checks | Traceability and isolation | Provenance is not authority |
| Disclosure/projection checks | Visible-output and disclosure preservation | Governance remains partly conceptual |
| Research adapters | Treatment, controls, complexity, decision | Native experiment remains authoritative |
| Production shadows | Potential gain and noninterference | Never activate production |
| Compatibility shadows | Equivalence and adapter boundary | Can retain legacy dependency |
| Migration gates | Ownership, compatibility, replay, rollback | Bounded to one responsibility |
| Benchmark baseline/regression reports | Authoritative results and known debt | Narrative can drift |

---

# Overlap and Canonicalization

Intentional overlaps observe different invariants:

- registry health versus deep architecture integrity;
- deterministic replay versus semantic correctness;
- Explanation construction versus comparative roles versus adjudication;
- collaboration versus communication versus projection;
- compatibility readiness versus activated migration;
- research dimensions versus five-score interpretation.

Overlap becomes duplication only when two sources claim the same owner,
protocol, fixture, invariant, and decision authority. DEPS assigns each exact
invariant one canonical source and an `overlapGroup`; diagnostic sources remain
linked but are never double-counted.

---

# Current Measurement Gaps

| Gap | Needed evidence |
| --- | --- |
| Cross-sprint comparability | Versioned manifest and comparability cohorts |
| Direct User Intelligence | Controlled user-task outcomes |
| Direct Collective Intelligence | Governed multi-contributor and cross-scope outcomes |
| Context burden | Context supplied, requested, and avoided per task |
| Time to useful understanding | Fixed start and independently judged useful-understanding event |
| Investigation efficiency | Cycles, evidence requests, unresolved questions, and outcome quality |
| Capability contribution | Producer/capability ablations under unchanged protocols |
| Complexity delta | File, dependency, contract, branch, Runtime, migration, and maintenance deltas |
| Runtime cost | Fixed-fixture elapsed time, peak memory, artifact growth, and variance |
| Benchmark coverage | Capability-to-invariant coverage matrix |
| Technical-debt trend | Stable identities, severity, age, owner, and disposition |
| Governance enforcement | Phase-appropriate authority, scope, disclosure, and temporal protocols |
| Trend attribution | Change-to-result ledger with repository identity |

DEPS reports these as `not measured` until valid protocols exist.

---

# Measurement Domains

## Architecture

Truth-owner count, semantic ownership, duplicate destinations and derivations,
dependency reciprocity, producer/export validity, layer coupling, abstraction
count, migration readiness, rollback evidence, architecture drift, and debt
age.

## Cognition

Reasoning and mechanism fidelity, explanatory depth, Evidence integration,
alternative retention and discrimination, uncertainty and contradiction,
state awareness, longitudinal learning, and ablation-supported emergent
insight. Research interpretation uses the existing six OU dimensions.

## Product

Named-protocol Local Understanding Utility, User Intelligence, context burden,
continuity, Action Utility, trust calibration, time to useful understanding,
and investigation efficiency.

## Organization

OUI evidence, Collective Intelligence, governed reuse, duplicate-investigation
reduction, cross-silo integration, emergent insight, and learning velocity.

## Engineering

Determinism, regression/replay/compatibility/migration coverage, Runtime and
build stability, validation coverage, technical-debt movement, failure
reproducibility, and diagnosis confidence.

## Governance

Authority correctness, provenance, organization and intelligence scope,
disclosure, traceability, revision, and temporal correctness.

## Sustainability

Complexity and coupling growth, processing/memory/artifact growth, migration
and rollback burden, maintenance surface, architectural simplicity, and
duplicate-ownership risk.

Domain assessments are engineering drill-downs, not new Scorecard scores.

---

# Future Measurement Record

The smallest machine-readable unit should be a reference record:

```ts
interface EngineeringMeasurementRecord {
  measurementId: string;
  metricDefinitionId: string;
  changeId: string;
  source: {
    command?: string;
    artifactRefs: string[];
    protocolVersion: string;
    fixtureIds: string[];
    environmentClass: string;
    repositoryRevision: string;
    worktreeState: "clean" | "dirty";
  };
  scope: {
    domain: string;
    capabilityIds: string[];
    producerRefs: string[];
  };
  observation: {
    baseline: string | number | boolean | null;
    current: string | number | boolean | null;
    state: "not-measured" | "unsupported" | "mixed" | "supported" | "replicated";
    movement: "regressed" | "unchanged" | "improved" | "indeterminate";
  };
  quality: {
    deterministic: boolean | "not-applicable";
    comparable: boolean;
    comparabilityCohort: string;
    independentReplication: boolean;
    limitations: string[];
  };
  interpretation: {
    scorecardEffects: {
      organizationalUnderstanding: "++" | "+" | "=" | "-" | "--" | "?";
      userIntelligence: "++" | "+" | "=" | "-" | "--" | "?";
      collectiveIntelligence: "++" | "+" | "=" | "-" | "--" | "?";
      governanceIntegrity: "++" | "+" | "=" | "-" | "--" | "?";
      systemSustainability: "++" | "+" | "=" | "-" | "--" | "?";
    };
    complexityEffect: "increased" | "unchanged" | "decreased" | "unknown";
    rationale: string;
  };
}
```

This is a DEPS tooling design, not an authorized production or benchmark
schema.

---

# Engineering Performance Dashboard

The dashboard is a generated engineering artifact, not a UI or single score.

## Summary

- report/protocol version;
- repository revision and dirty-tree state;
- baseline and comparison period;
- comparability warnings;
- decision: `promote`, `hold`, `rollback`, or `insufficient evidence`.

## Movement profile

```text
Organizational Understanding  + | evidence-supported
User Intelligence             = | measured unchanged
Collective Intelligence       ? | not measured
Governance Integrity          = | guardrail preserved
System Sustainability         + | rollback improved

Complexity                    - | reduced
Regression Risk               - | reduced
```

Symbols express direction and materiality, never weights.

## Assurance panel

Repository gates, architecture checks and debt delta, capability coverage and
owner changes, benchmark determinism and isolation, Runtime replay, migration
and rollback, and new versus accepted debt.

## Value panel

Five-score profile, applicable OU research dimensions, named Local
Understanding Utility, user or product evidence, collective evidence, and
explicit no-claim areas.

## Complexity justification

Production files, dependencies, objects, fields, capabilities, owners and
branches added/removed; processing and artifact deltas when measured;
migration, rollback, maintenance and validation burden; attributable value;
and `justified`, `temporarily justified`, `not justified`, or `not measured`.

## Risk and decision

Regressions, accepted debt, new findings, unknowns, earliest producer,
rollback boundary, promotion decision, and rationale.

Scenario observations, logs, traces, provider responses, Evidence items,
graphs, and Runtime snapshots remain drill-down links.

Never aggregate:

- different fixtures, providers, denominators, or protocols;
- deterministic and live-provider results;
- Local Understanding Utility across experiments;
- the five Scorecard scores;
- measured and unmeasured dimensions;
- accepted debt and new regressions;
- pass counts into a user- or organization-value claim.

---

# Trend Architecture

Every immutable report records its report ID, change/sprint, repository and
worktree state, metric and protocol versions, fixtures, provider/environment
class, clock/seed policy, native artifact digests, baseline, and comparability
cohort.

A direct delta is valid only when metric definition, fixture family,
evaluator, provider class, state construction, and denominator are compatible.
Protocol changes start a new series and preserve the prior baseline. A
calibration run may bridge series but never rewrite history.

Trend views:

- sprint and month movement within comparable cohorts;
- capability contribution;
- regression/debt age;
- complexity versus demonstrated value;
- migration/rollback reliability;
- benchmark usefulness: defects found, false alarms, decisions influenced,
  and promotions supported.

DEPS refuses false numeric rankings across incompatible experiments.

---

# Sprint Reporting Standard

Before implementation, record:

1. change ID, scope, owner, and hypothesis;
2. earliest producer and affected capabilities;
3. baseline and native evidence;
4. expected five-score direction;
5. expected complexity;
6. measured and explicitly unmeasured domains;
7. success, regression, and stop criteria;
8. fixtures, controls, replay, compatibility, and rollback;
9. comparability cohort.

After implementation, record:

1. exact repository/environment identity;
2. native results and artifact references;
3. capability movement;
4. observed five-score direction and evidence maturity;
5. complexity/cost delta;
6. new, resolved, and unchanged debt;
7. regressions and diagnosis confidence;
8. determinism, replay, migration, and rollback;
9. no-claim areas;
10. classification and promotion decision.

Expected and observed profiles appear together. Completed implementation
without measured objective improvement is infrastructure, research, or a
rejected hypothesis—not successful product optimization.

---

# Regression Reporting Standard

Every regression has a stable ID, first/last report, command/protocol/fixture,
baseline and current result, classification, affected capability/producer/
consumer, Scorecard effect, reproducibility, severity, new/pre-existing
status, diagnosis confidence, decision, and resolution evidence.

Status is:

```text
new
confirmed
accepted-with-expiry
investigating
resolved
not-comparable
false-positive
```

`not-comparable` requires a concrete methodology difference. “Known issue” is
not a disposition.

---

# Long-Term Workflow

```text
State hypothesis and expected Scorecard/complexity effects
↓
Select existing measurements and identify gaps
↓
Capture immutable versioned baseline
↓
Implement the smallest bounded change
↓
Run native gates, controls, replay, and rollback
↓
Write records referencing native artifacts
↓
Interpret capability, Scorecard, governance, and sustainability movement
↓
Generate Engineering Performance Report
↓
Promote, hold, rollback, or continue research
↓
Append to comparable trend history
```

Monthly review asks which comparable measures improved, which changes caused
them, which complexity remains unjustified, which debt is aging, which
capabilities lack contribution evidence, which benchmarks changed decisions,
and which research satisfies the existing readiness standard.

---

# Repository Integration Plan

Recommended future engineering-only structure:

```text
engineering/performance/
  metric-catalog.json
  source-catalog.json
  baselines/
  reports/
  trends/

scripts/performance/
  inventoryMeasurementSources.mjs
  collectPerformanceEvidence.mjs
  validatePerformanceReport.mjs
  renderPerformanceReport.mjs
```

These paths are not created by this design.

Native benchmarks remain unchanged. Adapters parse existing machine-readable
outputs or reference reports and fail closed on missing provenance. Generated
reports never write Runtime or benchmark results. Dirty-tree evidence,
provider-backed evidence, and incompatible protocols remain explicit separate
cohorts. Sprint startup may link the latest report but must not silently run
expensive, mutating, or provider-backed suites.

---

# Recommended Implementation Roadmap

## DEPS 0 — Catalog and baseline

Create stable source/metric IDs with owners, commands, native artifacts,
protocols, cohorts, capabilities, and Scorecard relevance. Hand-curate one
baseline from current authoritative results.

## DEPS 1 — Contract and validator

Implement a reference-only report manifest. Validate provenance, explicit
`not measured`, comparability, five-score completeness, complexity disclosure,
and rollback.

## DEPS 2 — Deterministic collection

Adapt non-mutating sources first: diff check, typecheck, build, capability
validation, architecture verification, selected canonical result artifacts,
and deterministic replay/migration gates.

## DEPS 3 — First continuous report

Generate JSON and Markdown dashboard reports and compare one sprint to exactly
one compatible baseline.

## DEPS 4 — Trends

Append immutable reports by cohort, track debt age, and reject invalid deltas.

## DEPS 5 — Coverage and contribution

Add the capability-to-invariant matrix and bounded capability ablations.

## DEPS 6 — Product and organizational outcomes

Add direct context burden, time-to-useful-understanding, investigation
efficiency, User Intelligence, and governed Collective Intelligence only after
valid protocols exist.

## DEPS 7 — Cost envelope

Add fixed-fixture time, memory, artifact growth, and variance as System
Sustainability evidence, never as a hidden Scorecard weight.

---

# Smallest First Implementation

The smallest implementation capable of producing the first continuous
Discovery performance report is:

1. one hand-curated, versioned catalog of existing deterministic sources;
2. one reference-only JSON report manifest containing repository identity,
   protocol, native artifact links, directional five-score effects, complexity,
   comparability, and decision;
3. one validator that fails on missing provenance, hidden `not measured`
   dimensions, incompatible deltas, or missing rollback disclosure;
4. one Markdown renderer;
5. one comparison against exactly one compatible baseline.

The first version should consume existing output and may normalize it manually.
It should not orchestrate every benchmark, invent scoring, modify production,
write Runtime, or alter native benchmark and research results.

---

# Phase 1 Continuous Reporting Workflow

DEPS Phase 1 implements the smallest first-report architecture in
engineering-only tooling:

```text
engineering/performance/measurement-source-catalog.v1.json
engineering/performance/current-report.json
engineering/performance/reports/deps-baseline-v1.json
scripts/performance/validatePerformanceReport.mjs
scripts/performance/comparePerformanceReports.mjs
scripts/performance/renderPerformanceReport.mjs
```

The first manifest is **DEPS Baseline v1**. It references the completed
Discovery 2 Phase 4C ownership migration and its native evidence. It does not
create synthetic history.

Every future substantial Discovery sprint should end as follows:

1. run the sprint's native benchmarks and required repository validations;
2. preserve their authoritative outputs without copying or rewriting them;
3. create a new versioned DEPS report manifest referencing those artifacts;
4. update `engineering/performance/current-report.json` to select that
   manifest and its deterministic Markdown output;
5. compare only with a compatible predecessor and state incompatible evidence
   separately;
6. record all five Scorecard states, explicit unknowns, complexity,
   regressions, rollback, and the engineering decision;
7. run:

```text
npm run deps:report
```

The command fails closed when evidence, provenance, the five canonical
Scorecard entries, explicit unmeasured areas, complexity justification,
comparability, or rollback is missing. It writes the deterministic human
report to:

```text
engineering/performance/reports/DEPS_PHASE_1_1.md
```

## Phase 1.1 compatible progress reports

# Architecture compression and feature-value evidence

Future DEPS reports should record, without collapsing unlike protocols:

- owners, repositories, schemas, migrations, access/policy families, and
  disclosure surfaces added per capability;
- bespoke versus conforming mechanics and conformance coverage;
- extension lead time, replay and concurrency evidence, and migration burden;
- user utility, learning leverage, Alpha necessity, reuse breadth, and risk
  reduction;
- an explicitly provisional value-to-enduring-cost comparison.

Scores are heuristics for prioritization, not performance claims or authority.
Security, privacy, current access, lineage, replay, and non-disclosure remain
hard gates. A capability manifest may later improve traceability, but must not
duplicate the Capability Registry or become a runtime owner.
Phase 1.1 adds a compatible-predecessor comparison layer. A current report may
be compared only when:

- its `schemaVersion` equals the predecessor;
- its `comparabilityCohort` equals the predecessor;
- its baseline reference matches the predecessor series;
- the predecessor path resolves and its report identity matches;
- every movement references evidence in the current manifest;
- every benchmark `previousResult` equals the predecessor's recorded result.

The comparison engine supplies one shared comparison object to both the
Markdown renderer and compact terminal summary. The terminal does not
recalculate or reinterpret movement.

Each report contains a stored report version, generation timestamp, repository
revision, baseline reference, and compatible predecessor. These are manifest
facts, so repeated generation is byte-identical. No synthetic history is
created.

Future sprints create a new manifest, select it in `current-report.json`, and
run `npm run deps:report`. If no compatible predecessor exists, the report
starts a new cohort rather than inventing a comparison.

Later phases may add automated evidence collection and multi-report
cohort-aware trend history without changing native benchmarks.
