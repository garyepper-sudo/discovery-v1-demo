# Discovery Canonical Local Source Binding Registration, Persistence, and Immutable Receipt 001

**Status:** Canonical bounded prerequisite
**Gap:** `GAP-B-019`
**Roadmap phase:** Leadership Conversation Phase 1
**Architecture change:** None; additive versioning inside the existing Source Binding owner

## Capability

The canonical Source Binding owner in
`engine/v3/governance/canonicalScopeLineage.ts` now provides an
authorization-first operational boundary for local registration, current
resolution, and immutable availability revision. Canonical state continues to
live only in `OrganizationRuntime.memory.canonicalScopeLineageIndex`;
immutable operation records use existing Runtime events. No separate
repository or Product Workflow, Source Content, connector, Evidence, or
cognition owner was added.

Index version 2 retains the complete already-canonical
`CanonicalScopeTopology` required after restart. Historical version-1 indexes
remain readable with their original representation and digest. They are never
assigned invented topology and fail closed for new governed local operations
that require complete topology.

## Operations

- `registerCanonicalLocalSourceBinding` authorizes before Runtime access,
  derives canonical identities, and persists through expected-revision CAS.
- `resolveCanonicalCurrentSourceBinding` authorizes first and resolves the
  authoritative available revision from persisted topology and history.
- `reviseCanonicalSourceBindingAvailability` appends deterministic revoke or
  restore successors and never mutates prior revisions.

Receipts are versioned, immutable, request-bound, integrity-checked, and safe.
They contain canonical references and digests, not bytes, paths, authorization
objects, raw idempotency keys, Evidence, cognition, or Product state. Exact
replay returns the stored receipt without replacement; semantic duplicates
reuse the current binding; conflicting or stale operations fail closed.

## Recovery and validation

Fresh Process A registers and persists the binding. Process B reloads it and
writes exact content through `GovernedSourceContentService`. Process C reloads
both owners and reads the same content. Cross-owner failure is resumed through
idempotent replay; immutable binding history is never compensated away.

Validation passed 28 focused checks, two complete ten-process recovery/replay
runs, the 59-check canonical lineage suite, Source Content owner/replay,
Evidence/admission and cognition replay, Product lifecycle/firewall suites,
Product governance at 188 checks and 43 decisions, and the canonical
architecture baseline at 295/302 with the same seven findings. The retained
Northstar Runtime remained exact at
`824a4c2e3f86cf000e3f8442d2bf38a97b4281e545959a49bf2bc6f41bb8b047`.

## Successor

This closes only the missing fresh-process Source Binding prerequisite. It does
not close Leadership Conversation routing, Decision promotion, generic Outcome
routing, Production readiness, connectors, or route promotion. Next, run
**DISCOVERY LEADERSHIP CONVERSATION TYPED CANONICAL OWNER ROUTING AND SERVER
COMPOSITION 001** in a new clean continuation from canonical main. Transfer the
preserved 24 paths by the established two-layer method, inject this service
into server composition, and do not rebuild already valid routing.
