# Discovery Snapshot — Sprint 79 Startup

This is the minimum implementation snapshot for the next sprint. Product authority resides in:

1. `docs/Product/MVP_PRODUCT_SPECIFICATION.md`
2. `docs/Product/ORGANIZATION_PAGE_SPEC.md`

Architecture and engineering authority remains in the Architecture Canon and `docs/Engineering/CODEX_GUIDE.md`.

## Product identity

Discovery is an Executive Cognitive Operating System centered on a continuously evolving **Organization Model**. The interface calls it **Your Organization**. The Organization Model—not a dashboard, chat surface, or collection of tools—is the product.

The user is its steward. Product interactions must improve, validate, challenge, query, experiment with, or act on the model.

## Current implementation state

The engine and Runtime already support the first end-to-end executive workflow. Persistent organization identity and Semantic Fidelity are now implemented:

- Canonical organization identity resolution: `engine/v3/runtime/activeOrganization.ts`
- Organization-scoped Runtime persistence
- Consistent identity across product API routes
- Stable opaque onboarding identity propagated through Discovery, Simulation, Decision, and Decision Commit
- Evidence-grounded emergent Themes with the existing `V3Theme` contract
- Phenomena with direct Understanding ancestry and preserved organization-specific meaning
- Conceptual Understanding with stable normalized identity plus concise source-grounded manifestations

No planned Sprint 79 shell, new navigation, or Organization maturity-state UI should be described as implemented yet.

## Semantic Fidelity baseline

The Executive Meaning Preservation benchmark now reports:

| Layer | Status |
|---|---|
| Evidence | PASS |
| Understanding | PASS |
| Semantic Concepts | PASS |
| Phenomena | PASS |
| Conceptual Understanding | PASS |
| First diagnostic semantic degradation | none |
| First required semantic failure | none |

Completed corrections:

- Removed canonical lexical Theme labels such as `Consulting Pattern` and `Founder Pattern`.
- Themes now use evidence relationships and signal overlap to identify organizational patterns.
- Runtime supplies current Understandings to Phenomena inference.
- Understanding clusters use real Understanding IDs rather than reasoning-graph entity IDs.
- Cluster-driven Phenomena preserve semantic content and direct lineage; pattern-driven behavior remains stable.
- Concept Candidates retain normalized prototype statements while summaries and explanations preserve the organization-specific manifestation.
- Candidate IDs and ranking remain unchanged; no fixture-specific prototype exists.

## Validation baseline

- TypeScript: PASS
- Production build: PASS with existing React hook warnings outside the changed scope
- Meaning Preservation: PASS
- Phenomenon Semantic Validation: PASS
- Full suite: 15/15, 100% integrity
- Normalization audit: successful exit with known `NORMALIZATION REQUIRED` findings
- Architecture verifier: 291/302 checks, 96%, with 11 pre-existing registry/dependency failures

The normalization and architecture findings are known baseline issues, not Semantic Fidelity regressions.

## Runtime validation at startup

Read `docs/Architecture/Validation/RUNTIME_VALIDATION.md` before work that depends on actual cognitive output or lineage.

Architecture documents describe intended behavior. Runtime validation confirms actual behavior.

> Do not infer Runtime behavior solely from producer contracts or architecture documentation. Inspect representative Runtime state when actual output semantics or lineage matter.

Before architectural, cognitive, projection, or executive-experience changes:

1. Inspect one relevant current file in `.discovery-runtime/organizations/*.json` when available.
2. Compare the actual organization identity, persistence, memory structure, Understandings, Themes and semantic patterns, Phenomena, mechanism ancestry, beliefs, semantic cohorts, concept candidates, `conceptualUnderstanding`, conditions, primary constraint, assessment, recommendation, communication, decision records, and learning state with canonical expectations.
3. Treat discrepancies as validation findings rather than immediately adding architecture.

Latest validated Runtime semantics:

- Emergent Themes preserve evidence-grounded organizational relationships.
- Phenomena preserve direct Understanding ancestry.
- The Understanding → Phenomena → Mechanisms lineage discontinuity is removed.
- Conceptual Understanding preserves normalized identity and organization-specific manifestation.
- Executive Meaning Preservation reports no diagnostic degradation and no required semantic failure.

Confirmed presentation caveat: some normalized labels or primary descriptions remain more generic than the richer source-grounded meaning retained in summaries, evidence fields, or ancestry. Inspect the richer fields before concluding meaning is absent.

No dedicated Runtime-inspection command exists in `package.json`. Use the verified `npm run sprint:brief` startup command and inspect representative persisted Runtime directly when relevant.

## Locked information architecture

```text
Your Organization — observe and improve
Decisions         — act, track, review, learn
Research          — investigate, compare, simulate, optimize
Ask               — query and challenge
```

Older primary navigation centered on Home, Executive Work, Executive Brief, Decision Lab, or a separate Operating Model destination is superseded. Existing decision, simulation, communication, and learning capabilities remain reusable beneath the new structure.

## One Organization experience

Onboarding is a maturity state, not a destination:

```text
EMPTY → EMERGING → DEVELOPING → ACTIVE → EVOLVING
```

The same Your Organization page supports initial and mature use. It begins with one initiative, asks for one supporting document, produces one meaningful understanding, requests validation or correction, and reveals the next relevant opportunity. The initial visualization should show increasing coherence—not data volume—and remain deliberately simple.

## Sprint 79 target

Audit the current executive-v3 shell and routing, then design the smallest migration to the locked navigation and maturity-state Organization experience without changing the engine.

Implementation order after approval:

1. Persistent shell and left navigation
2. One stateful Your Organization page
3. Placeholder visualization states
4. Reuse current Runtime and engine for initiative, evidence, understanding, validation, and recommendation
5. Decisions, Research, and Ask after the stewardship loop works

## Rules

- Do not expand cognition to satisfy presentation requirements.
- Preserve source meaning through executive projections.
- Reuse existing systems.
- Minimize reading through progressive disclosure.
- Do not create a dashboard, onboarding wizard, or ingestion progress visualization.
- Custom-build Discovery's organizational intelligence; use mature libraries for commodity behavior.
