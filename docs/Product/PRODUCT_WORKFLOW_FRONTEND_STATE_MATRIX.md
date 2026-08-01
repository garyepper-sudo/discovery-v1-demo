# Product Workflow Frontend State Matrix

This is a semantic matrix, not visual design.

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
| human-authorized-operation-pending | Operation | none | executor absent | future owner / exact seed |
| human-declined | Human decision | return | distinct decline | correction / exact seed |
| human-deferred | Human decision | return later | distinct defer | correction / exact seed |
| operation-complete-outcome-unmeasured | Outcome | record observation | completion is not Outcome | observation / exact seed |
| information-produced-evidence-not-admitted | Learning | evaluate candidacy | information is not Evidence | admission / exact seed |
| evidence-admitted-unknown-unchanged | Learning | continue | admission is not change | more Evidence / exact seed |
| evidence-admitted-understanding-changed | Learning | review change | exact before/after | return / exact seed |
| longitudinal-what-changed | Learning | inspect lineage | immutable revisions | historical read / exact seed |
| withheld-and-unavailable | Understanding | seek authorized input | withheld absent; unavailable explicit | authority/input / exact seed |
| historical-revision-supersession | Learning | view lineage | old revision addressable | historical read / exact seed |
| fully-blocked-clarification | Objective/Context | answer one clarification | one primary blocker | Objective / exact seed |

Every state requires a stable loading shell, fail-closed error mapping, organization-preserving refresh, and byte-identical reset.
