# Sprint 122 — Explanation Seed and Theory Ancestry Bridge

## Status

Complete.

**Classification: A — Structural bridge validated**

Sprint 122 implements the minimum deterministic bridge required to construct
completed Organizational Explanations from structured production ancestry. It
does not integrate competing-explanation adjudication or change authoritative
executive reasoning.

## Architecture implemented

The active cognition chain is now:

```text
Evidence
→ reasoning relationship
→ reasoning path
→ OrganizationalExplanationSeed
→ Mechanism
→ Belief and Concept
→ canonical persisted Theory
→ completed OrganizationalExplanation
→ Condition ancestry
```

The existing persisted Runtime Theory remains canonical. The inactive judgment
Theory was not promoted and no third Theory representation was created.

## Seed semantics

`OrganizationalExplanationSeed` is an investigation-local structured causal
hypothesis formed from one or more reasoning paths before canonical Mechanisms
and Theories exist.

A Seed retains:

- organization identity;
- a deterministic semantic key;
- normalized organizational scope;
- structured outcome references;
- reasoning-path IDs;
- reasoning-relationship semantic IDs;
- direct Evidence IDs where present;
- the existing explanation family, root-cause, leverage, assumption, and
  confidence fields needed by the early judgment pipeline.

The producer is now explicitly named `synthesizeExplanationSeeds()`.
`synthesizeExplanations` remains only as a transitional source alias. Active
Runtime uses the explicit Seed producer.

Seed identity excludes confidence, timestamps, input order, ranking,
recommendation, and leader state.

## Completed Explanation semantics

A completed `OrganizationalExplanation` is formed only after canonical Theory
consolidation.

It contains:

- organization identity and deterministic semantic key;
- normalized scope;
- root Mechanism IDs;
- structured outcome references;
- causal relation family;
- Seed, path, Mechanism, Belief, and Theory IDs;
- explicit Evidence IDs;
- contradiction IDs and assumptions;
- unadjudicated viability.

No comparative Evidence roles, leader state, adjudication result, recommendation
implication, or longitudinal revision history is persisted.

## Completeness gate

Completion requires:

1. organization identity;
2. normalized scope;
3. at least one Seed;
4. at least one reasoning path;
5. at least one root Mechanism;
6. at least one canonical persisted Theory;
7. at least one structured outcome reference;
8. explicit Evidence ancestry;
9. a deterministic semantic key.

Missing relationships produce a structured completion failure. They do not
produce a guessed Explanation. No lexical fallback or fixture exception exists.

## Active call graph

```text
buildOrganizationReasoningGraph()
→ inferReasoningRelationships()
→ runOrganizationalReasoningEngine()
→ synthesizeExplanationSeeds()
→ evaluateExplanations()
→ detectJudgmentContradictions()
→ inferOrganizationalMechanisms()
→ inferOrganizationalBeliefs()
→ consolidateOrganizationalTheories()
→ completeOrganizationalExplanations()
→ inferOrganizationalConditions()
```

The current early judgment and Mechanism stages consume Seeds. Completed
Explanations are unavailable until Theory formation has finished.

## Data-contract changes

Added:

- `OrganizationalScopeRef`;
- `OrganizationalOutcomeRef`;
- `OrganizationalExplanationSeed`;
- completed `OrganizationalExplanation`;
- direct `"evidence"` support in `KnowledgeReference`;
- optional Seed, path, scope, and outcome ancestry on canonical Theory;
- optional Seed, scope, and outcome ancestry on Mechanism;
- optional completed-Explanation ancestry on Conditions.

Existing Mechanism IDs, Theory IDs, confidence formulas, selection logic, and
ordering remain unchanged.

## Runtime changes

Runtime memory now retains:

- `organizationalExplanationSeeds`;
- `organizationalExplanations`;
- `organizationalExplanationCompletionFailures`.

Canonical Theory records retain additive:

- `explanationSeedIds`;
- `reasoningPathIds`;
- `scopeRefs`;
- `outcomeRefs`.

Completed Explanations are persisted only after the completeness gate passes.
Repeated completion deduplicates by stable semantic identity.

## Backward compatibility

Runtime loading normalizes missing Sprint 122 collections to empty arrays.
Missing Theory ancestry fields also normalize to empty arrays.

Old Runtime records:

- remain readable;
- retain existing Theory identities;
- receive no synthetic ancestry;
- receive no synthetic completed Explanations;
- require no destructive migration.

## Candidate-construction results

The Sprint 122 bridge benchmark covers the required Atlas, Northstar,
knowledge-fragmentation, competing-cause, feedback-loop, sparse, scope,
order-reversal, repeated-evolution, and old-Runtime controls.

| Measure | Result |
|---|---:|
| Scenarios | 17 |
| Accepted completed Explanations | 18 |
| Precision | 1.000 |
| Recall | 1.000 |
| Exact candidate sets | 17/17 |
| Unsupported candidates | 0 |
| Missing candidates | 0 |

An actual isolated Atlas production replay generated:

```text
Seeds: 1
Completed Explanations: 1
```

## Ancestry completeness

All 18 accepted completed Explanations retain:

- Seed identity;
- reasoning-path identity;
- root Mechanism identity;
- canonical Theory identity;
- direct Evidence identity;
- normalized scope;
- structured outcome identity.

Result:

```text
18/18 complete
```

The no-complete-ancestry control produced no completed Explanation.

## Identity results

- repeated replay: PASS;
- Evidence-order invariance: PASS;
- path-order invariance: PASS;
- source-order invariance: PASS;
- repeated persistence without duplication: PASS;
- support-time changes preserve semantic identity: PASS;
- scope changes alter identity: PASS;
- root Mechanism changes alter identity: PASS;
- outcome changes alter identity: PASS.

Identity excludes confidence, Evidence count, timestamps, viability, ranking,
leader state, recommendation, and input ordering.

## Condition-link results

Conditions receive `supportingExplanationIds` through structured Mechanism or
Theory ancestry.

This link is ancestry-only:

- Condition scoring is unchanged;
- confidence is unchanged;
- status, trend, and priority are unchanged;
- primary-constraint selection is unchanged;
- Executive Assessment is unchanged.

Conditions do not reconstruct Explanations from prose.

## Production-behavior comparison

The bridge adds structured metadata without changing authoritative behavior:

- Ground Truth remains 75/100;
- candidate and causal benchmark classifications remain unchanged;
- recommendation families remain unchanged;
- Executive Decision Lab remains 39/39;
- Operating Model Evolution remains 14/14;
- Executive Simulation remains unchanged;
- primary-constraint and Condition ranking behavior remain unchanged.

## Regression results

- Sprint 122 bridge benchmark: PASS, Classification A;
- Sprint 121 Structured Explanation Candidate Shadow: accepted historical
  Classification C;
- Sprint 119 Competing Explanation Adjudication: Classification A;
- Sprint 120 Production Shadow: Classification C;
- Causal Constraint Reasoning: Classification A;
- Causal Constraint Production Shadow: accepted Classification B;
- Ground Truth: 75/100;
- Judgment Lab: 15/15;
- Judgment Lab Expansion: 15/15;
- Evidence Provenance: 16/16;
- Executive Decision Lab: 39/39;
- Decision Order Independence: PASS;
- Operating Model Evolution: 14/14;
- Atlas production evolution replay: PASS;
- Executive Simulation: PASS;
- cognition validation: PASS with 32 capabilities;
- architecture validation: accepted 291/302 baseline;
- typecheck: PASS;
- build: PASS with six existing React Hook warnings;
- canonical fixture integrity: PASS;
- `git diff --check`: PASS.

The first Decision Order Independence invocation encountered a transient child
process launch failure. Its immediate isolated rerun passed every semantic and
fixture-integrity assertion.

## Architecture and capability ownership

Active Runtime continues to use `consolidateOrganizationalTheories()` while the
capability registry still names inactive `formOrganizationalTheories()` as the
canonical Theory producer.

Sprint 122 did not duplicate production or modify the registry. The accepted
291/302 architecture baseline remains unchanged. Producer-authority
reconciliation remains a dedicated architecture correction.

## Classification

**A — Structural bridge validated**

Candidate construction, ancestry, identity, Runtime compatibility, and
production-behavior gates all pass. The sprint does not validate the existing
keyword-driven Theory selection policy and does not authorize production
adjudication by itself.

## Recommendation

Authorize one production-shadow experiment that feeds completed production
Organizational Explanations into the already validated Sprint 119 adjudicator.

Keep the experiment:

- shadow-only;
- ephemeral;
- read-only with respect to Runtime adjudication state;
- bounded to completed Explanations that pass the Sprint 122 ancestry gate.

Do not modify recommendations, Executive Assessment, Condition ranking,
providers, UI, or Runtime persistence during that experiment.
