# Discovery Sprint [NUMBER] — [SPRINT NAME]

Before making recommendations, proposing architecture changes, or writing code:

Treat every document in:

docs/Sprint Updates/

as the canonical working state of Discovery.

These documents represent the current product, architecture, capabilities, benchmark status, simulation readiness, and development priorities.

Read them in this order:

1. DISCOVERY_SNAPSHOT.md
2. ENGINE_CAPABILITY_AUDIT.md
3. PROJECT_STATE.md
4. NEXT_CHAT.md

Use the following reference documents only when the sprint requires them.

Implementation/
- CANONICAL_ARCHITECTURE.md
- COMPONENT_ARCHITECTURE.md
- ARCHITECTURE_MIGRATION_BOARD.md
- COMPONENT_OWNERSHIP.md
- ORGANISM_ARCHITECTURE.md

Product Vision/
- DISCOVERY_CANON.md
- DISCOVERY_NORTH_STAR.md
- ROADMAP.md

Cognitive Theory/
- COGNITIVE_ARCHITECTURE.md
- UNDERSTANDING_ENGINE.md
- ORGANIZATIONAL_THEORY.md
- DISCOVERY_COGNITIVE_THEORY.md
- COGNITIVE_OBJECT_MODEL.md
- COGNITIVE_ONTOLOGY.md

Benchmarks and Evaluation/
- DISCOVERY_COGNITIVE_FITNESS_PROFILE.md
- UNDERSTANDING_SCORECARD_BASELINE.md
- Relevant benchmark reports or datasets

------------------------------------------------------------

After reviewing the sprint documents, summarize:

1. Current milestone

2. Current development phase

3. Current architecture

4. Current executive experience

5. Current engine and runtime capabilities

6. Existing capabilities that are not yet projected or visible

7. Current benchmark health

8. Current simulation readiness

9. Current blockers or unresolved questions

10. Exact stopping point from the previous sprint

11. Recommended next step

Clearly distinguish between:

- confirmed implementation
- documented intent
- inferred capability
- unverified assumptions

Do not claim a capability is complete unless the sprint documents or inspected code support that conclusion.

------------------------------------------------------------

Before recommending new work, always ask:

- Does Discovery already produce this capability?
- Is it persisted in runtime?
- Is it benchmarked?
- Is it already projected?
- Is it already visible somewhere in the product?
- Is there an existing component, route, or legacy implementation that already expresses it?
- Which executive question does it answer?
- Does it improve executive decision making?
- Does it improve simulation readiness?
- Does it measurably improve the Discovery Understanding Scorecard?

Never recommend building a new engine when an existing engine already provides the capability.

Prefer exposing, testing, validating, integrating, and improving existing capabilities before adding new ones.

------------------------------------------------------------

Development principles

- Preserve the canonical architecture.
- Preserve the canonical component ownership model.
- Preserve the established application routes.
- Keep zero TypeScript errors.
- Prefer incremental improvements.
- Prefer complete file rewrites when requested.
- Default to step-by-step instructions.
- Do not redesign folders unless explicitly requested.
- Do not introduce duplicate implementations.
- Do not bypass projection boundaries.
- Do not let presentation components consume internal cognitive models directly.
- Do not present placeholder data as live organizational intelligence.
- Preserve progressive disclosure.
- Preserve the executive-first experience.
- Evaluate new work against the Discovery Understanding Scorecard.
- Delay broad legacy cleanup until the simulation baseline is stable, unless legacy code is blocking current work.

------------------------------------------------------------

Current development philosophy

The immediate objective is not to add more engines.

The immediate objective is to expose, validate, benchmark, integrate, and pressure-test the intelligence Discovery already possesses.

The canonical development sequence is:

1. Capability Audit
2. Executive Capability Integration
3. Simulation Readiness
4. Simulated Organization Baseline
5. Pressure Testing
6. Architecture and Legacy Cleanup
7. Engine Quality Improvements

Do not skip directly to engine expansion unless the capability audit and simulation results demonstrate a genuine reasoning gap.

------------------------------------------------------------

Planning rules

Before coding, identify:

- the capability being improved
- the executive question it answers
- the current engine source
- the runtime source, if any
- the projection boundary
- the UI owner
- the benchmark or simulation that will validate it
- the expected Understanding Scorecard improvement

At the end of the startup summary, provide:

1. The single highest-leverage next step

2. Why it is higher leverage than the alternatives

3. The exact files that should be inspected or modified

4. A step-by-step implementation plan

5. The success criteria

6. The validation method

Do not begin coding until the plan has been approved.

------------------------------------------------------------

End-of-sprint requirements

Before ending the sprint:

- Confirm zero TypeScript errors.
- Confirm the runtime behavior.
- Update DISCOVERY_SNAPSHOT.md.
- Update ENGINE_CAPABILITY_AUDIT.md.
- Update PROJECT_STATE.md.
- Update NEXT_CHAT.md with the exact stopping point.
- Record benchmark or simulation results when relevant.
- State what remains unverified.