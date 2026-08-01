# Frontend Workflow Fixture Catalog

Version 1 contains these deterministic, semantically coherent version-2 workspace states:

1. question-created-insufficient-evidence
2. supported-answer
3. truthful-unknown
4. missing-objective
5. missing-optimization-context
6. stale-context
7. recommendation-selected
8. recommendation-material-tie
9. recommendation-stop
10. recommendation-abstain
11. recommendation-governance-prohibited
12. recommendation-authorization-revoked
13. human-decision-pending
14. human-authorized-operation-pending
15. human-declined
16. human-deferred
17. operation-complete-outcome-unmeasured
18. information-produced-evidence-not-admitted
19. evidence-admitted-unknown-unchanged
20. evidence-admitted-understanding-changed
21. longitudinal-what-changed
22. withheld-and-unavailable
23. historical-revision-supersession
24. fully-blocked-clarification

Every fixture now instantiates the canonical nested state required by its name: exact Objective/Context combinations, structural recommendation dispositions, immutable human-choice receipts, immutable local operation results, Outcome observations, Evidence-admission and no-change/changed Learning lineage, retained Answer revisions, or explicit disclosure state as applicable. Orientation is derived from and checked against the coherent stage/action surface; it is not a substitute for missing Product state.

Every fixture includes identity, contract/fixture versions, deterministic timestamp, organization scope, source refs, actions, unavailable/withheld fields, expected stage and transition, reset seed/hash, and workspace digest. The frontend-readiness validator checks semantic prerequisites, structural dispositions, receipt/result/Outcome presence, Evidence and revision lineage, non-leakage, blocked mutations, deterministic ordering, and byte-identical reset. No fixture contains raw Runtime, credentials, personal/customer data, Production IDs, or benchmark answer keys. These twenty-four fixtures are approved as the UI/UX design and frontend acceptance coverage surface for contract version 2.
