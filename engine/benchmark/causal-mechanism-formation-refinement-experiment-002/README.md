# Causal Mechanism Formation Refinement Experiment 002

## Objective and prior result

Experiment 001 demonstrated a narrow explicit linear-chain contract at `1.00`
precision and `0.75` recall. This benchmark tests only two extensions:
multi-signal implicit causal language and explicit/implicit branching or
converging topology. It is benchmark-only.

## Input boundary

Each case starts with raw distributed Evidence. The unchanged production-shadow
path runs `runDiscoveryV3` and in-memory `evolveOrganizationRuntime`, then
collects generated canonical artifacts. Candidate registration completes before
scoring truth or held-out futures are used. Opaque IDs carry no answers.

## Implicit support rules

An implicit edge requires at least two independent support forms among temporal
contrast, intervention response, comparable-group contrast, and repeated
transition. Temporal order alone remains ambiguous. At least one form must be
stronger than temporal sequence. Fixed parsing rules are shared by all cases.

## Topology

- **Linear:** one directed path.
- **Branching:** a supported mediator has at least two outgoing branches and an
  incoming path.
- **Converging:** at least two supported drivers reach a shared mediator that
  has a downstream path.
- **Mixed:** both degree patterns occur.
- **Unresolved:** no complete supported structure.

Every node and edge carries separate Evidence, artifact, and silo lineage.

## Qualification

Qualification requires a structurally complete topology, explicit or
deterministically derived edges, comparative alternative Evidence, no unresolved
confounder, implications, falsification, and lineage. Unsupported branches and
contributors are omitted. An ambiguous edge keeps the mechanism provisional.

## Scenario matrix

The matrix contains 36 cases:

- 4 explicit linear regressions;
- 6 implicit linear chains;
- 4 explicit branching mechanisms;
- 4 explicit converging mechanisms;
- 3 implicit branching mechanisms;
- 3 implicit converging mechanisms;
- 12 negative or underdetermined controls.

## Baselines and held-out evaluation

Baselines include the Experiment 001 producer, production Mechanisms, best
individual silo, generic all-Evidence summary, Full Canonical Combined
cognition, pairwise composition, topology without alternatives, and conservative
unified formation. Implications are registered before held-out Evidence.

## Hard gates

The benchmark fails on semantic leakage, temporal-only qualification, missing
lineage, unsupported branch/contributor retention, explicit-linear regression,
the prior false positive, mechanism false positives, blanket abstention, or
nondeterminism. Passing does not authorize production.

## Run

```bash
npx tsx engine/benchmark/causal-mechanism-formation-refinement-experiment-002/runCausalMechanismFormationRefinementExperiment002.ts
```

## Limitations

Implicit language uses a bounded grammar designed to isolate support-basis
composition, not general natural-language understanding. Alternative support is
structural rather than probabilistically calibrated. Feedback loops, persistence
inference, mixed topology, production Predictions, and production Interventions
remain out of scope.
