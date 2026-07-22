# Discovery Project State

**Active branch:** `sprint-78-persistent-organizations`  
**Current milestone:** Persistent Organizations and Semantic Fidelity complete  
**Next sprint:** Sprint 79 — Organization Experience / Model Stewardship MVP

## Current phase

Discovery's Cognitive Operating System, Capability Registry, Runtime, and current semantic architecture are stable. The immediate development target is the product shell and **Your Organization** experience, not additional engine architecture.

The locked product principle is:

> **The Organization Model is the product.**

Use **Your Organization** in the interface and **Organization Model** in product and engineering discussion. The user is the model's steward. Every important interaction should improve, validate, challenge, query, experiment with, or act on the model.

## Completed milestones

### Persistent organization identity

- `engine/v3/runtime/activeOrganization.ts` is the canonical resolver.
- Runtime already persisted organization-scoped state.
- Discovery, scenario, decision, and decision-record API routes resolve identity consistently.
- Integrated onboarding creates a stable opaque organization ID independently of display fields.
- Identity flows through Discovery Lab, Executive Workspace, Simulation, Decision, and Decision Commit.

### Semantic Fidelity

- Themes now synthesize evidence-grounded organizational relationships instead of repeated-keyword taxonomy labels.
- Runtime passes current Understandings into Phenomena inference.
- Understanding clusters preserve genuine Understanding ancestry.
- Cluster-driven Phenomena retain source meaning; pattern-driven Phenomena are unchanged.
- The Understanding → Phenomena → Mechanisms lineage discontinuity is removed.
- Concept Candidate statements remain normalized while summaries and explanations retain concise source-grounded organizational manifestations.
- Concept IDs, signatures, confidence calculations, and ranking remain unchanged.
- No organization-, founder-, industry-, or fixture-specific prototype was introduced.

## Canonical product direction

The authoritative Sprint 79 specifications are:

- `docs/Product/MVP_PRODUCT_SPECIFICATION.md`
- `docs/Product/ORGANIZATION_PAGE_SPEC.md`

They supersede older primary-navigation assumptions when conflicts exist.

Primary navigation:

| Destination | Purpose |
|---|---|
| Your Organization | Observe and improve the Organization Model |
| Decisions | Recommendations, tracking, review, and learning |
| Research | Investigation, intervention comparison, simulation, and optimization |
| Ask | Query and challenge the Organization Model |

Home, Executive Work, Executive Brief, Decision Lab, and Operating Model are not separate primary destinations. Existing capabilities should be composed beneath the locked navigation.

## Your Organization maturity model

Onboarding and mature use share one canonical page:

```text
EMPTY → EMERGING → DEVELOPING → ACTIVE → EVOLVING
```

There is no separate onboarding wizard. First use asks for one important initiative, then one supporting document, surfaces one meaningful understanding for validation or correction, and reveals value progressively. Visual coherence increases only when meaningful learning occurs.

The stewardship loop is:

```text
Teach → Discovery Learns → Discovery Produces Value
→ User Validates or Challenges → Organization Model Improves
→ Discovery Earns the Next Request
```

## Validation baseline

| Validation | Current result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS; existing out-of-scope React hook warnings only |
| Executive Meaning Preservation | PASS end to end |
| Phenomenon Semantic Validation | PASS |
| Full benchmark suite | 15/15, 100% integrity |
| Cognitive Semantic Normalization Audit | Successful exit; existing `NORMALIZATION REQUIRED` findings remain |
| Architecture verification | 291/302, 96%; 11 known pre-existing registry/dependency failures |

Meaning-preservation layers now report Evidence, Understanding, Semantic Concepts, Phenomena, and Conceptual Understanding as PASS, with no diagnostic degradation and no required semantic failure. Remaining audit findings are not regressions introduced by this work.

## Immediate next implementation target

First audit the current executive-v3 UI and routing. Produce the smallest migration plan for a persistent shell, the locked navigation, and a single stateful Your Organization page supporting all five maturity states without changing the engine.

After plan approval:

1. Implement the shell and left navigation.
2. Implement Your Organization with placeholder coherence states.
3. Reuse existing Runtime and engine capabilities for initiative, evidence, understanding, validation, and recommendation.
4. Add Decisions, Research, and Ask only after the primary stewardship experience works.

## Guardrails

- Benchmark evidence, not presentation preference, justifies cognitive changes.
- Reuse existing cognition and Runtime.
- Preserve organization-specific meaning in projections.
- Use progressive disclosure and minimize reading.
- Do not build a dashboard, separate onboarding wizard, or visualization gimmick.
- Keep custom code focused on Discovery's unique organizational understanding.
