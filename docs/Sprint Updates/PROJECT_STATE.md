# Discovery Project State

**Active branch:** `sprint-79-organization-experience`
**Current phase:** benchmark-guided optimization of executive judgment
**Next investigation:** calibrate the remaining deterministic Ground Truth deductions before authorizing production work

# Product Identity

Discovery is an Executive Operating System centered on one continuously evolving **Organization Model**. Runtime is the canonical persistent organization record. Product workspaces, executive reasoning, decisions, simulations, research, and questions operate on that same model.

> The Organization Model is the product.

# Operating Model

Runtime is the canonical persisted Organization Model. Evidence, organizational cognition, executive work, decisions, reviews, and learning evolve that one model. Evidence IDs generated within an investigation are positional; stable cognitive identity must come from canonical objects such as Organizational Mechanisms.

# Implemented

### Product and Runtime

- Organization-scoped Runtime persistence and canonical organization identity.
- Active organization preservation through product navigation.
- Read-only Runtime-backed organization registry.
- Runtime-backed Your Organization, Decisions, Research, and Ask workspaces.
- Provider-independent Executive Conversation Intelligence adapter with an ephemeral interpretation contract, deterministic mock provider, `none` fallback, and optional Ask composition input.
- Experimental OpenAI Conversation Interpreter with minimized read-only context, strict structured-output validation, bounded input, sanitized observability, and direct provider-to-`none` fallback.
- Executive recommendation, simulation, decision recording, communication, review, and learning pipelines.

### Executive judgment and decision optimization

- Executive Decision Lab with typed cases, hidden ground truth, deterministic stress scenarios, semantic intervention correspondence, structured scope comparison, robustness/sensitivity evaluation, metamorphic validation, and failure taxonomy.
- Intervention Profiles carrying intrinsic scope, burden, disruption, reversibility, leadership attention, coordination requirements, time to effect, implementation risk, and preconditions.
- Capacity-aware feasibility that filters nonviable options before simulation.
- Localized intervention scope propagated from conditions and mechanisms through option generation, simulation, and recommendation.

### Longitudinal Organization Model learning

- Operating Model Evolution Lab with reusable timelines, eight evolution dimensions, stress scenarios, metamorphic transformations, failure taxonomy, production Runtime adapter, and deterministic in-memory replay.
- Immediate-previous mechanism identity reconciliation for `same mechanism` versus `new mechanism`.
- Longitudinal contradiction synthesis comparing current evidence with immediately previous evidence.
- Contradiction-aware belief revision using the stable challenged mechanism identity.
- Contradiction-aware mechanism confidence transition for continuing mechanisms whose current evidence ancestry intersects qualifying opposing evidence.
- Intervention-specific risk preservation from the winning intervention option into the final Executive Recommendation.
- Runtime-backed projection of the selected Executive Decision recommendation's existing risks into the primary Decisions workspace.
- Living Organization Model interaction loop across Insights, Think, Decisions, and Session Impact.
- Unified Executive Workspace as the primary organization entry, combining the highest-priority insight, interactive Organization Model, Think, Decide, Experiment, Brief, Session Impact, and the learning loop in one compact Runtime-backed surface.
- Self-contained Ground Truth evaluation that builds and scores an isolated deterministic 48-artifact Northstar replay, then restores the previously persisted Runtime.

# Current Validation Goal

Verify that the Organization Model learns appropriately across time while preserving stable identity, unrelated knowledge, recommendation continuity, and historical truth. Sprint 101 closed the measured mechanism-confidence stagnation; explicit historical mechanism truth remains deferred.

# Validated

- Mechanism identity continuity now passes the production replay.
- Qualifying contradiction now lowers the confidence of the continuing mechanism when opposing evidence intersects its current evidence ancestry (`0.396425` to `0.352025` in the production replay).
- Qualifying evidence now lowers persistent belief confidence and satisfies the replay's belief-weakening invariant.
- Executive recommendation identity remains stable through the replay.
- Executive Recommendation synthesis now preserves the selected intervention's existing risks in deterministic source order and removes exact duplicates without changing recommendation identity, confidence, or scenario ranking.
- The focused Sprint 102 recommendation-risk regression passes, and the Executive Decision Lab's baseline risk-recognition score improves from `1/5` to `5/5`.
- Sprint 104 projects the selected recommendation's existing risk array without rewriting, reordering, ranking, or mutating it. The Decisions workspace omits the section when the selected recommendation has no risks.
- Sprint 104 Decisions Experience validation passes `23` checks, the focused recommendation-risk regression passes, Executive Decision Lab passes `39/39`, and Operating Model Evolution Lab passes `14/14`.
- Sprint 105 makes the Organization Model visible in Insights, Think, and Decisions; supports explicit context, challenge, save-as-insight, brainstorming, and leadership-decision actions; and summarizes only successfully persisted session-derived changes while keeping unsaved discussion provisional. Save as insight records executive input through the canonical organization-investigation and evidence path; it does not create a parallel insight object or store.
- Sprint 105 reuses canonical organization investigation and Executive Decision Record persistence. Product interaction requests reject unsupported actions, preserve canonical organization identity, and use stable interaction identities so retries do not duplicate investigation or decision writes. Leadership-added decisions retain their origin and condition relationships without changing Discovery recommendation identity or confidence.
- Living interaction loop validation passes `18/18`; product interaction boundary validation passes `14/14`; existing Organization, Ask, Decisions, and Research product validations pass; Executive Decision Lab passes `39/39`; Operating Model Evolution Lab passes `14/14`; typecheck, build, cognition validation, and `git diff --check` pass.
- Sprint 106 makes `/your-organization` the unified executive landing workspace while preserving the existing focused routes. It composes existing Organization, Ask, Decisions, simulation, executive communication, Session Impact, stewardship, and canonical identity capabilities without adding cognition, Runtime objects, or parallel stores.
- Unified Executive Workspace validation passes `28/28`. Visual review at `1440 × 900` and `1728 × 1117` confirms the primary insight, interactive model, four functional mode panels, Session Impact rail, and learning strip fit without page scrolling.
- Sprint 103 Ground Truth output is independent of prior Cognitive Trace, Cognitive Layer Validation, Atlas, Executive Decision Lab, and Operating Model Evolution Lab execution.
- Repeated canonical Northstar replays produce identical Runtime content and identical Ground Truth score details whether a persisted Northstar Runtime exists or not.
- Executive Decision Lab, Operating Model Evolution Lab foundation, Evolution stress pilot, Judgment Lab, Executive Decision regressions, simulation, recommendation Runtime, Runtime-backed executive language, and Decision Quality complete successfully.
- Recent typecheck and production build pass; existing React Hook dependency warnings remain in Cognition Lab and Organism Viewer.

Decision Quality remains approximately `88% / B+`, with its existing single-scenario differentiation diagnostic. Direct recommendation evidence grounding remains open in the Executive Decision Lab. The reduced-capacity scenario's risk-language scoring remains a benchmark diagnostic even though its selected intervention risks are now preserved.

Ground Truth is now deterministic at `75 / 100`. Its remaining deductions are excessive-concurrent-work wording sensitivity (`-20`) and the explicit staffing-boundary phrase (`-5`). The investigation found semantic equivalents in production output, so these remain benchmark-calibration findings rather than demonstrated production defects.

# Measured Weaknesses

1. **Executive conversation does not adapt to the current turn.** The Sprint 107 Executive Collaboration Lab scores `65.21 / 100`. Across all six scenarios, the current Ask projection repeats the same Runtime-derived response as the executive changes the question, adds evidence, or changes direction. Executive understanding is `3.33 / 15` and conversational continuity is `5.72 / 10`.
2. **Constructive challenge is inconsistent.** Constructive challenge scores `5.33 / 10`; both required-challenge cases fail to challenge the weak assumption.
3. **A full evidence save can recompute unrelated model areas.** Model stewardship scores `13.33 / 15`; the new-evidence scenario changes the unrelated Knowledge Continuity condition during canonical Runtime evolution. This is measured separately from the primary conversation-projection gap.
4. **Historical mechanism truth is absent.** Runtime retains the current mechanism network but has no explicit durable mechanism revision or lineage history.

# Designed but Deferred

`docs/Architecture/Canon/ORGANIZATIONAL_MECHANISM_LIFECYCLE.md` defines creation, revision, unchanged continuity, merge, split, retirement, reactivation, and supersession.

Only immediate-previous identity reconciliation is implemented. The following remain designed but deferred:

- mechanism merge and split;
- retirement and reactivation;
- supersession;
- revision history and historical lineage.

# Current Product Lifecycle

```text
Organization → Organization Model → Continuous Understanding
→ Executive Work → Decision Support → Commitment
→ Execution → Review → Learning → Organization Model Evolution
```

# Benchmark Systems

### 0. Executive Collaboration Lab

Sprint 107 adds six deterministic, multi-turn executive scenarios: symptom versus root cause, acquisition brainstorming, changed direction, new evidence, weak assumption, and idea-to-decision. It scores executive understanding, question quality, collaborative reasoning, constructive challenge, continuity, model stewardship, recommendation quality, action handoff, Session Impact accuracy, and executive trust. The `65.21 / 100` baseline has zero hard failures, passes repeated-run and reversed-order determinism, preserves organization isolation, and restores pre-existing Runtime artifacts.

Sprint 108 extends every turn with an explicit ephemeral interpretation and keeps the interpretation and composed response separately observable. The Runtime-only baseline remains `65.21 / 100`. With the deterministic mock enabled, the controlled-interpreter baseline scores `90.36 / 100`: executive understanding `14.17 / 15`, collaborative reasoning `14.5 / 15`, constructive challenge `8 / 10`, continuity `10 / 10`, and trust `4.36 / 5`. This controlled score demonstrates the potential value of turn-aware interpretation; it is not evidence of live-provider quality or unseen-conversation generalization.

### 1. Executive Judgment and Decision Lab

Established decision-cycle validation and optimization. The Executive Decision Lab is the primary regression system for intervention quality, feasibility, sensitivity, robustness, scope, evidence grounding, and executive communication.

### 2. Operating Model Evolution Lab

Established longitudinal validation for learning, stability, coherence, identity continuity, scope preservation, historical truth, decision learning, and recommendation continuity.

### 3. Evidence and Model Integrity validation

Existing evidence, semantic fidelity, phenomenon, normalization, Runtime, and architecture checks provide integrity coverage. Future checks should consolidate into a durable suite rather than creating unrelated labs.

### 4. Cognitive System Reliability validation

Existing Judgment Lab, stress, regression, simulation, recommendation, communication, and Decision Quality benchmarks provide reliability coverage. Future reliability checks should be grouped under this model.

# Runtime Boundary

Runtime remains canonical. No new Runtime schema, persistence model, mechanism-history collection, or lineage structure was added by the recent optimization work.

Evidence IDs generated by `runDiscoveryV3`, such as `E6`, are investigation-local and positional. They must not be described or used as globally durable longitudinal identity.

# Current Product Focus

Sprint 109 is complete. Preserve three distinct baselines: Runtime-only `none` at `65.21 / 100`, controlled deterministic `mock` at `90.36 / 100`, and live OpenAI `gpt-4o-mini` Prompt Version 1 at `78.49 / 100` combined (`78.93` development, `77.85` held-out). The live run completed 30 calls with zero fallbacks, schema repairs, invalid outputs, or critical failures while preserving Runtime restoration and organization isolation. The provider remains experimental and feature-flagged; `none` remains default, Prompt Version 1 is frozen, and no Runtime or cognition authority moved to the provider.

# Current Product Principles

- Benchmark evidence justifies production changes.
- Preserve established architecture and deterministic behavior.
- Make one narrow production change per optimization sprint.
- Run Decision and Evolution regression gates after production changes.
- Do not broaden confidence work into mechanism lifecycle implementation.
- Do not claim designed lifecycle behavior is implemented.

# Document Status

Current through completed Sprint 109 live provider evaluation.
