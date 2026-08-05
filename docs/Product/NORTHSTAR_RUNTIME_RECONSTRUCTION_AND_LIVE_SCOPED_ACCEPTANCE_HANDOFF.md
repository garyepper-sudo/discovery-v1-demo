# Northstar Runtime Reconstruction and Live Scoped Acceptance Handoff

**Status:** Reviewed sprint handoff

**Gap:** `GAP-B-014`

**Roadmap phase:** Phase 5 — Connected understanding

**Architecture change:** None; existing reconstruction, Runtime, scope-lineage,
authorization, disclosure, Product projection, and frontend owners are reused.

## Completed reconstruction

`living-organization-reconstruction-input/v1` is the canonical replay-input
contract. Repository-corpus Package A and retained-local-metadata Package B
matched byte-for-byte at digest
`1c6577ab69236f84d9b5011e40c069e8130a941f6f8865431dfe1d43b37535e2`.
Three isolated canonical candidates were byte-identical. The durable Northstar
Runtime was atomically reconstructed and independently reloaded at revision
`824a4c2e3f86cf000e3f8442d2bf38a97b4281e545959a49bf2bc6f41bb8b047`.
It is newly reconstructed from retained canonical local source state, not a
surviving temporary Sync 5 Runtime. Reconstruction performed no Drive read,
connector call, synchronization, Production access, or deployment.

## Protected-page safety

The development live route synchronously destroys protected presentation before
Clerk sign-out and hard-revalidates hidden, frozen, BFCache-restored, and
back/forward-restored documents. Clerk sign-out remains awaited and history is
replaced. CEO, Director, and Manager authorization, sign-out/Back isolation,
copied-URL and reload denial, sequential account switching, and Manager
revocation/restoration passed. Current server authorization is reevaluated;
private/no-store remains active; Production returns 404. An independent live
two-tab/stale-tab witness remains required before promotion.

## Bounded Product gap

All three accounts authenticate and resolve their exact organization, function,
or team scope. All three currently receive truthful unavailable/empty Product
projections. The earliest observed seam is
`product/integration/liveScopedRoleAwareAdapter.ts::sourceForRetainedRuntime`:
it returns an authorized canonical source with `items: []` even though the
reconstructed Runtime contains canonical Understanding and derived scope
lineage. Scoped selection, disclosure, and presentation therefore receive no
candidates. This is a Product-input-population gap, not evidence of an
authorization, disclosure, reconstruction, or architecture failure.

Do not populate the interface by changing source content, broadening bindings
or permissions, deriving access from role, fabricating role-specific content,
or weakening unavailable/withheld semantics. `/your-organization` remains
unchanged and the development route remains unpromoted.

## Next governed task

**DISCOVERY NORTHSTAR SOURCE-TO-PRODUCT PROJECTION POPULATION AND MATERIAL ROLE
DIFFERENTIATION 001**

Begin diagnostically from the resulting exact `origin/main` in a new branch and
worktree. Trace canonical cognition production → scoped Product input population
→ scoped selection → disclosure → presentation mapping. After useful,
permission-safe differentiation and closure, run **DISCOVERY LIVE MULTI-ROLE
UNAUTHORIZED DISCLOSURE AND INFERENCE STRESS TEST 001**. Only after both tasks
and the independent two-tab gate pass may route promotion or replacement of
`/your-organization` be considered.
