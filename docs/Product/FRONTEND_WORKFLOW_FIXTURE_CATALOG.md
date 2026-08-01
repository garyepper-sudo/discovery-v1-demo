# Frontend Workflow Fixture Catalog

Version 1 contains these deterministic version-2 workspace states:

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

Every fixture includes identity, contract/fixture versions, deterministic timestamp, organization scope, source refs, actions, unavailable/withheld fields, expected stage, reset seed/hash, and workspace digest. Reset is byte-identical. No fixture contains raw Runtime, credentials, personal/customer data, Production IDs, or benchmark answer keys.
