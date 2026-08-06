# Field Audience-Requirement Governance

## Canonical status

Discovery has a shadow-only, directly validated field audience-requirement
issuance security contract. It is unpersisted and has no live Product consumer.
Current field-family policies, exact requirements, approvals, and issuance
receipts remain zero.

```text
authoritative proposal
+ exact governing family policy when applicable
+ validated canonical topology
→ content-addressed approval-policy derivation
→ reconstructable issuance authorization
→ independently validated receipt construction
→ independently validated historical issuance
→ separate current requirement lifecycle
```

Approval-policy derivation binds the exact proposal, normalized requirement
expression, applicable governing family-policy revision, and canonical topology.
Callers cannot supply organization-wide status, policy comparison, approval
threshold, policy revision, or reason. Ordinary, equal, and provably narrowing
proposals require one distinct principal; organization-wide and provably
broadening proposals require two. Incomparable or invalid inputs fail closed.

Issuance authorization independently reconstructs its identity, revision, and
integrity from authoritative inputs. Receipt construction validates that
authorization before returning a receipt. Historical validation rederives the
applicable policy, reconstructs authorization and receipt, and never trusts a
threshold or policy reference merely because it appears in stored data.

Current administrative authority, approval, issuance authorization, historical
receipt, and current requirement lifecycle are distinct. Later administrator
revocation blocks future issuance without rewriting a valid historical receipt.
Requirement revocation or supersession governs current requirement state without
rewriting prior issuance history.

Field-classification authority does not grant receive authority, and receive
authority does not grant field-classification authority. Role, title, hierarchy,
default Product scope, subject scope, source scope, and Evidence scope grant no
authority by themselves.

Administrative persistence, bootstrap, delegation, migration, live integration,
and nested disclosure remain blocked. The contract changes no Runtime,
authorization, disclosure, projection, Product Communication, presentation, or
route behavior.

Comparative ownership/temporal research is preserved on
`research/field-audience-requirement-comparative-model-temporal-preservation-001`.
It is noncanonical and is not a closure gate. It establishes no canonical model,
temporal selection, readiness classification, owner graph, or next task.

`npm run validate:field-audience-requirement-direct-security` executes 47
direct-security cases, caller-control negative tests, deterministic replay, and
ordering invariance. The accepted direct-security classification is A.

The exact next governed task is review-only:

**DISCOVERY POST-FIELD-AUDIENCE DIRECT-SECURITY GOVERNANCE OWNER-GRAPH
RECONCILIATION 001**
