# Discovery Product Decision Draft Operation and Immutable Receipt 001

## Status

Implemented and independently reviewed as the bounded draft prerequisite for
`GAP-A-012`. The broader gap remains open until a reviewed Product operation
promotes an eligible draft through the existing Executive Decision pipeline.

## Ownership

The implementation selects ownership Model B: `ProductDecisionDraft` is a
non-authoritative Product Workflow object. It does not own an actual Decision.
`ExecutiveDecisionRecord` and the existing Executive Decision pipeline remain
the sole owners of committed Decisions.

## Implemented boundary

- Versioned immutable draft revisions are retained as typed Product Workflow
  events in authorized Organization Runtime event persistence.
- Create, revise, and read operations preserve exact ProductQuestion and
  ProductAnswer ancestry.
- Initial draft identity is owner-derived; revisions have deterministic
  identities and exact predecessor linkage.
- Exact operation, purpose, organization, scope, sensitivity, status, and
  validity authorization is evaluated before repository reads.
- Optimistic concurrency rejects stale predecessors and ambiguous or branched
  histories fail closed.
- Idempotency binds the complete authorized request, actor, authority, policy,
  ancestry, and content; mismatched reuse is rejected.
- Immutable receipts identify the request, resulting revision and persisted
  event, include the result digest, and replay the original canonical receipt.
- The ProductQuestion workspace projects active or superseded draft state and
  explicit available, unavailable, or withheld disclosure.
- Service responses are re-derived from the event actually retained by the
  atomic Runtime replacement.

## Explicit non-effects

Draft persistence is storage in the existing authorized Runtime event boundary;
it is not organizational cognition evolution. The operation creates no actual
Decision, performs no Decision promotion, creates no Outcome, adds no generic
Outcome routing, and changes no Evidence, Source Content, connector, route, or
Production owner.

## Validation

Focused operation validation passes 38 checks. Fresh-process replay passes six
isolated filesystem-backed processes covering three authorization roles twice,
with byte-stable results and removed temporary roots. Product governance,
typecheck, lint, build, deterministic replay, disclosure/revocation, Question
lifecycle and lineage, Decision ancestry, Outcome learning, authorization,
Runtime recovery, and retained-Runtime protection were reviewed. The retained
Northstar Runtime digest remained unchanged.

## Remaining limitations

- Product Decision promotion and actual Decision creation remain unimplemented.
- Generic Outcome routing and Outcome persistence remain unimplemented.
- No route or component exposes this operation.
- `GAP-A-012` therefore remains open at its promotion-and-commit boundary.

The immediate successor is **DISCOVERY LEADERSHIP CONVERSATION TYPED CANONICAL
OWNER ROUTING AND SERVER COMPOSITION 001**, rerun from the resulting canonical
main while safely transferring the preserved nineteen-file Leadership
Conversation implementation into a new clean continuation worktree.
