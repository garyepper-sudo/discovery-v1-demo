# Discovery Operation-Bound Canonical Evidence Contribution and Admission Result 001

## Status

Implemented and independently reviewed as the exact Evidence-admission result
prerequisite for the Leadership Conversation routing slice under `GAP-B-019`.
The router, changed/unchanged evaluation, generic Outcome routing, route
promotion, and Production activation remain unimplemented.

## Ownership

Canonical Evidence continues to own Evidence identity, content identity,
organization binding, confidence, and lifecycle. Canonical admission and
attribution continue to own admission identity, provenance, scope lineage,
ordering, deduplication, and replay. Source Binding continues to own source
identity, version, purpose, scope, availability, and organization binding.

Product integration owns only the non-authoritative record that one exact,
authorized contribution operation processed a particular zero/one/many batch
of canonical Evidence and admission results. That record does not participate
in Evidence, admission, attribution, Source Binding, confidence, or cognition
identity.

## Implemented boundary

- `admitCanonicalEvidenceScopeLineage` directly returns a versioned operation
  batch constructed during the exact admission invocation.
- The batch supports zero, one, and multiple admissions without a singular
  outer Evidence or admission convenience field.
- Ordering preserves the first investigation-local Evidence ordinal, with
  deterministic identity tie-breakers; local IDs and Source Bindings also use
  explicit stable ordering.
- Each result distinguishes new canonical Evidence, existing Evidence with new
  provenance, and exact attribution replay.
- An authorized zero-admission operation returns an empty batch and
  `not-admitted`; denial and failure return no canonical result.
- `contributeEvidenceWithCanonicalResult` is additive. Existing
  `contributeEvidence` callers and `evidenceAccepted` semantics remain intact.
- A typed immutable Product operation record is appended to existing Runtime
  event persistence in the same optimistic-concurrency replacement as the
  successful mutation. No result survives failed persistence.
- Operation identity and result digests bind the complete semantic request and
  persisted result without raw content, raw idempotency keys, machine paths,
  or wall-clock randomness.
- Exact same-request replay loads the retained operation record and performs no
  investigation, cognition execution, event append, or Runtime replacement.
  Conflicting key reuse fails closed.
- The original contribution still runs the existing canonical Evidence and
  Runtime evolution path; only replay skips cognition and persistence.

## Compatibility and non-effects

The change adds no Organization Runtime top-level field, Evidence migration,
admission or attribution migration, Source Binding identity change, confidence
owner, cognition owner, ProductQuestion workspace version, route, component,
connector behavior, or Production behavior. The retained Northstar Runtime
remains unchanged.

## Leadership Conversation effect

The next routing task may consume the exact operation-bound zero/one/many batch
after governed Source Content reread, authorization, proposal approval, and
canonical admission. It must derive changed or unchanged separately through
the existing revision and change owners. It must not scan Runtime, select a
first attribution, assume one result, accept client-supplied canonical IDs, or
manufacture canonical receipts.

## Validation

Focused validation passes 58 checks. Fresh-process replay passes 17 checks
across six isolated processes. Canonical scope lineage passes 59 checks and
cross-investigation admission identity passes 32 checks. Product governance,
typecheck, lint, build, deterministic replay, authorization isolation,
serialization firewalls, and retained-Runtime protection remain validated.

## Immediate successor

**DISCOVERY LEADERSHIP CONVERSATION TYPED CANONICAL OWNER ROUTING AND SERVER
COMPOSITION 001** must begin from the resulting canonical main in a new clean
continuation worktree and consume this exact operation result. Product strategy
must not be reopened.
