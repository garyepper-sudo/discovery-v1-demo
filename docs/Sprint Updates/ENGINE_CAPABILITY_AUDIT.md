# Engine Capability Audit

**Status:** Canonical operational audit (Sprint 79 baseline)

## Purpose

This document records the current health and product-use boundary of Discovery's implemented cognitive capabilities. The Capability Registry remains authoritative for individual capability ownership and producers. Benchmarks validate behavior. The Sprint 79 product specifications determine how capabilities are presented.

## Architecture position

The Cognitive Operating System, Capability Registry, Runtime, and current semantic architecture are stable. New presentation requirements do not justify new cognition. Architectural changes require a demonstrated benchmark gap.

The engine already provides canonical cognition for evidence, understanding, phenomena, mechanisms, beliefs, concepts, organizational conditions, assessment, recommendation, optimization, simulation, decision recording, communication, learning, and persistent organizational memory.

## Persistent organization capability

- `engine/v3/runtime/activeOrganization.ts` owns canonical organization identity resolution.
- Runtime persistence is organization-scoped.
- Discovery, scenario, decision, and decision-record routes use the canonical resolver.
- Integrated onboarding generates a stable opaque ID independent of company name.
- Organization identity reaches Discovery Lab, Executive Workspace, Simulation, Decision, and Decision Commit.

Authentication remains separate from Runtime organization identity. Organization switching and Clerk are not part of this completed milestone.

## Semantic Fidelity capability

### Themes

- Emergent Themes use deterministic evidence relationships and signal overlap.
- Repeated keywords no longer directly create labels such as `Consulting Pattern` or `Founder Pattern`.
- Theme evidence and signal ancestry remain grounded.
- The `V3Theme` contract is unchanged.

### Phenomena

- Runtime passes current Understandings into Phenomena inference.
- Understanding clusters preserve real Understanding IDs.
- Cluster-driven Phenomena retain organization-specific descriptions and direct ancestry.
- The Understanding → Phenomena → Mechanisms lineage discontinuity is removed.
- Pattern-driven Phenomena remain unchanged and benchmark-valid.

### Conceptual Understanding

- Theory prototype statements remain normalized and reusable.
- Candidate summaries and explanations preserve concise organization-specific manifestations from Semantic Cohort observations.
- Candidate IDs, semantic signatures, confidence calculations, ancestry, and ranking remain stable.
- No founder-, consulting-, organization-, or fixture-specific prototype was added.
- Final conceptual-understanding summaries carry both normalized identity and source meaning.

## Current validation

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS; existing out-of-scope React hook warnings only |
| Executive Meaning Preservation | PASS |
| Phenomenon Semantic Validation | PASS |
| Full benchmark suite | 15/15 checks, 100% integrity |
| Cognitive Semantic Normalization Audit | Successful exit; `NORMALIZATION REQUIRED` findings remain |
| Architecture verification | 291/302 checks, 96% |

Architecture verification currently has 11 known registry/dependency failures, including undeclared canonical exports and dependency reciprocity gaps. These and the normalization audit findings pre-date the completed Semantic Fidelity work and are not newly introduced regressions. Therefore older handoff claims of a completely passing architecture verifier are superseded.

## Meaning-preservation result

- Evidence: PASS
- Understanding: PASS
- Semantic Concepts: PASS
- Phenomena: PASS
- Conceptual Understanding: PASS
- First diagnostic semantic degradation: none
- First required semantic failure: none

## Product-use boundary

The Organization Model is the product. Existing cognition should now be composed into:

- **Your Organization:** observe and improve the model
- **Decisions:** recommendations, decision tracking, review, and learning
- **Research:** investigation, comparison, simulation, and optimization
- **Ask:** query and challenge the model

Executive Brief, Decision Lab, Executive Work, simulation, and decision capabilities remain implemented capabilities, but they are not locked primary navigation destinations.

## Sprint 79 engineering priority

The next target is a product-shell and Organization-experience implementation, not an engine expansion:

1. Audit executive-v3 UI and routing.
2. Plan the smallest navigation migration.
3. Add the persistent shell.
4. Implement one Your Organization page supporting EMPTY, EMERGING, DEVELOPING, ACTIVE, and EVOLVING.
5. Reuse current engine and Runtime behavior.
6. Add Decisions, Research, and Ask only after the stewardship experience works.

## Capability guardrails

- Preserve one canonical producer per cognitive object.
- Reuse Runtime and existing engine outputs.
- Preserve organization-specific meaning in every executive projection.
- Do not add cognitive capabilities to solve layout or wording problems.
- Keep visualization and onboarding state in the product layer.
- Validate architectural changes with benchmarks before expanding the registry.
