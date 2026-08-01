# Product Workflow Frontend State Matrix

This is a semantic matrix, not visual design.

Each row is backed by canonical nested V2 state, not an orientation-only label. Semantic validation proves that orientation, stages, actions, Objective/Context, recommendation, human choice, operation result, Outcome, disclosure, and lineage agree wherever the row requires them.

| Fixture | Primary stage | User task / action | Truthful boundary | Transition / reset |
|---|---|---|---|---|
| question-created-insufficient-evidence | Understanding | add authorized Evidence | missing Evidence | contribution / exact seed |
| supported-answer | Objective/Context | create Objective | no inferred Objective | Objective version / exact seed |
| truthful-unknown | Understanding | add Evidence | no confidence | investigation / exact seed |
| missing-objective | Objective/Context | create Objective | bounded missing state | Objective version / exact seed |
| missing-optimization-context | Objective/Context | create Context | no default Context | Context version / exact seed |
| stale-context | Objective/Context | reaffirm Context | no silent carry-forward | reaffirmation / exact seed |
| recommendation-selected | Human decision | authorize/decline/defer | authorization does not execute | receipt / exact seed |
| recommendation-material-tie | Recommendation | clarify preference | IDs never break tie | governed input / exact seed |
| recommendation-stop | Recommendation | return | stop is not decline | return / exact seed |
| recommendation-abstain | Recommendation | add comparison input | abstain is not defer | recomparison / exact seed |
| recommendation-governance-prohibited | Recommendation | inspect limitation | governance dominates | governance change / exact seed |
| recommendation-authorization-revoked | Recommendation | request authority | history retained | authority / exact seed |
| human-decision-pending | Human decision | choose disposition | no default | receipt / exact seed |
| human-authorized-operation-pending | Operation | execute exact local inspection | human authorization is distinct from execution authority | operation result / exact seed |
| human-declined | Human decision | return | distinct immutable decline; no execution | return / exact seed |
| human-deferred | Human decision | wait for governed transition | distinct immutable defer; no execution | future governed transition / exact seed |
| operation-complete-outcome-unmeasured | Outcome | record observation | completion is not Outcome | observation / exact seed |
| information-produced-evidence-not-admitted | Learning | evaluate candidacy | information is not Evidence | admission / exact seed |
| evidence-admitted-unknown-unchanged | Learning | continue | admission is not change | more Evidence / exact seed |
| evidence-admitted-understanding-changed | Learning | review change | exact before/after | return / exact seed |
| longitudinal-what-changed | Learning | inspect lineage | immutable revisions | historical read / exact seed |
| withheld-and-unavailable | Understanding | seek authorized input | withheld absent; unavailable explicit | authority/input / exact seed |
| historical-revision-supersession | Learning | view lineage | old revision addressable | historical read / exact seed |
| fully-blocked-clarification | Objective/Context | await authority or clarification | no state-advancing mutation is enabled | authority or clarification / exact seed |

Every state requires a stable loading shell, fail-closed error mapping, organization-preserving refresh, and byte-identical reset.

The twenty-four rows are approved as UI/UX design and frontend acceptance coverage. This approval does not imply that V2 React implementation, final navigation, Production activation, connectors, or external execution has begun.
