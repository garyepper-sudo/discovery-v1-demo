# Organizational Understanding Disclosure and Revocation Contract

**Status:** Canonical Phase 5B production contract
**Activation:** Contract active; application enforcement and durable
revocation activation blocked

## Responsibility chain

```text
Canonical Organizational Understanding
→ Authority
→ Disclosure
→ Projection
→ Application
```

- Organizational Understanding owns truth.
- The Phase 5A authority boundary determines whether cognition is canonical.
- Disclosure determines whether an identified consumer may receive canonical
  Understanding.
- Projection determines presentation shape.
- Applications determine experience.

No downstream responsibility may become a truth owner.

## Minimum disclosure decision

`OrganizationalUnderstandingDisclosureDecision` is an already-resolved,
consumer-specific decision:

- stable decision identity;
- organization identity;
- consumer identity;
- `eligible`, `withheld`, or `revoked` disposition;
- effective time;
- optional superseded-decision reference;
- explicit basis.

It is not a permission, membership, role, purpose, policy, or Intelligence
Scope definition. Phase 5B intentionally does not assign a production decision
producer because the repository has no canonical owner capable of resolving
those inputs.

The enforcement function fails closed when organization or consumer identity
does not match. It discloses only compositions carrying an explicit Phase 5A
authorized disposition. Historical compositions without that receipt are not
silently promoted.

## Revocation contract

Revocation is a successor disclosure disposition affecting future reads.

It changes:

- future disclosure eligibility;
- future projection input;
- future application visibility once enforcement is activated.

It never changes:

- canonical composition identity or content;
- completed Explanation claims or ancestry;
- Evidence provenance;
- historical Runtime;
- prior disclosure history;
- organizational truth ownership.

Phase 5B does not persist revocation history. Durable revocation activation is
blocked until a canonical decision-history authority exists outside
Organization Runtime.

## Rollback

Remove the disclosure enforcement call. Canonical Runtime and application
behavior are unchanged because the contract is pure and is not yet wired into
production projections.
