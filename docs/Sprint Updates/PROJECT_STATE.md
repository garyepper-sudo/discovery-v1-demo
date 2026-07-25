# Discovery Project State

**Active branch:** `sprint-79-organization-experience`
**Next investigation:** complete final repository cleanup and comparator
validation before authorizing any production reasoning change

## Current Phase

Repository Integration Completion and Benchmark-Driven Reasoning Validation.
Repository integration is nearly complete. Production reasoning changes remain
benchmark-gated, and no new feature sprint should begin until generated
artifacts, local-output handling, and final comparator validation are complete.

## Strategic Product Direction

Discovery is canonically a platform that continuously builds shared organizational intelligence that becomes more valuable than the sum of its contributors, information, and experiences.

`docs/Architecture/Canon/SHARED_ORGANIZATIONAL_INTELLIGENCE.md` now defines the long-term hierarchy: Organizational Intelligence is the broader product and architectural construct; the Operating Model is a primary representation of how the organization functions; Organization Runtime remains the canonical persistence boundary; and the Executive Operating System is Discovery's first major application.

This documentation direction authorizes no new Runtime contract, cognitive layer, Intelligence Scope, governance model, orchestration system, or application. The immediate benchmark roadmap and current conversation/reasoning work remain unchanged.

# Product Identity

Discovery is a shared organizational intelligence platform whose first major application is the Executive Operating System. Runtime is the canonical persistent organization record. Product workspaces, executive reasoning, decisions, simulations, research, and questions operate on the same Organizational Intelligence.

> The Organization Model is the primary representation used by Discovery's current Executive Operating System application.

# Operating Model

Runtime is the canonical persisted Organization Model. Evidence, organizational cognition, executive work, decisions, reviews, and learning evolve that one model. Evidence IDs generated within an investigation are positional; stable cognitive identity must come from canonical objects such as Organizational Mechanisms.

# Implemented

### Product and Runtime

- Discovery's implementation foundation is defined by the Product Canon, Platform Principles, Design Language, UI System, Component Library, Motion System, Copy Guide, View Model Architecture, and Frontend Architecture.
- The deterministic Interactive Prototype Alpha implements the approved nine-scene Understanding journey under `/alpha`, with a server-side shared-password advisor access gate and deployment-safe routing.
- Prototype Alpha is intentionally fixture-backed. It does not read from or write to Organization Runtime, invoke cognition, call an AI provider, or represent completed Runtime integration.
- Organization-scoped Runtime persistence and canonical organization identity.
- Active organization preservation through product navigation.
- Read-only Runtime-backed organization registry.
- Runtime-backed Your Organization, Decisions, Research, and Ask workspaces.
- Provider-independent Executive Conversation Intelligence adapter with an ephemeral interpretation contract, deterministic mock provider, `none` fallback, optional Ask composition input, and advisory reasoning analysis.
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

Re-establish all canonical benchmark baselines from a clean repository state, record deterministic and pre-existing validation findings, and rank measured reasoning regressions before selecting one narrow production improvement. Runtime integration of Prototype Alpha is explicitly out of scope and has not begun.

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

1. **Detected challenge opportunities are not yet composed into sufficiently useful challenge.** Sprint 110 Provider V2 detects challenge opportunities at `4.44 / 5`, but challenge quality remains `2.84 / 5`. The remaining defect is downstream response composition rather than conversation interpretation.
2. **Executive conversation still has scenario-specific meaning loss.** Provider V2 improves combined collaboration to `81.55 / 100`, but executive understanding remains `9.69 / 15` and continuity `8.25 / 10`.
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

Discovery 2 Phase 1 is active and ready for focused integration. Phase 2,
production Explanation adjudication, and downstream role consumption remain
separately gated.

# Current Product Principles

- Benchmark evidence justifies production changes.
- Preserve established architecture and deterministic behavior.
- Make one narrow production change per optimization sprint.
- Run Decision and Evolution regression gates after production changes.
- Do not broaden confidence work into mechanism lifecycle implementation.
- Do not claim designed lifecycle behavior is implemented.

# Document Status

Current through Discovery 2 Phase 1 activation and validation.

# Discovery 2 Phase 1 Status

Comparative Evidence Roles are active in normal forward Runtime evolution.
Completed Organizational Explanations may now contain deterministic
`supports`, `opposes`, and `shared` Evidence-role assignments produced solely
by `completeOrganizationalExplanations()`.

The Phase 1 production gate passes `20/20`. It validates direct support,
opposition, shared support, repeated and reversed-order determinism,
organization isolation, historical missing-field compatibility, and downstream
noninterference.

Historical Runtime records remain compatible without migration. Completed
Explanations remain `viability: unadjudicated`; no downstream production
consumer interprets the roles. Confidence, viability, ranking, Conditions,
State, Executive Assessment, recommendations, projection, and application
behavior remain unchanged.

Discovery Scorecard closure:

- Organizational Understanding Index: explicit representation enabled; no
  measurable downstream improvement yet.
- User Intelligence Index: unchanged.
- Collective Intelligence Index: unchanged.
- Governance Integrity Index: explicit traceable Evidence semantics supported;
  no regression.
- System Sustainability Index: unchanged; no regression.

Phase 2 remains separately gated. Production Explanation adjudication and
consumption are not implemented.
