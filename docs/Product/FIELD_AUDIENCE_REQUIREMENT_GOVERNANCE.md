# Field Audience-Requirement Governance Contract

**Status:** Shadow-only contract complete; not activated
**Classification:** C
**Recommendation:** READY FOR NEXT DERIVED UPSTREAM TASK

## Canonical answer

A separately versioned field-family policy, with an exact target-version-bound
override where necessary, owns the audience authority required to receive an
exact canonical Organizational Understanding field. Only an independent
`manage-field-audience-requirements` administrative authority revision may
issue a proposal. Approval is a separate immutable act bound to that exact
proposal revision; holding authority is not approval.

The classifier accepts no recipient, access assignment,
`RecipientAudienceGrant`, role, title, hierarchy, default scope, display scope,
customer prose, session, or browser state. The pure resolver is not wired into
disclosure or Product behavior.

## Ownership and separation

| Concept | Canonical owner | Security meaning |
|---|---|---|
| Organization access | `AlphaOrganizationAccessRecord` and its append-only current-head resolution | entry to one organization experience only |
| Recipient audience authority | immutable `RecipientAudienceGrant` revision bound to an exact current assignment revision | scopes one recipient may receive |
| Field audience requirement | `FieldAudienceFamilyPolicy`, then an exact `ExactFieldAudienceRequirement` override | authority required for one exact field |
| Subject scope | canonical field/composition owner | organizational part described |
| Source scope | canonical source binding | provenance origin |
| Evidence scope | canonical Evidence attribution | context to which Evidence applies |
| Support lineage | canonical cognition and scope-lineage owners | objects supporting the field |
| Default Product scope | Product context | initial navigation emphasis only |
| Display scope and role | presentation metadata | human-readable labels only |
| Nested-field disclosure | future canonical Understanding disclosure owner | later recipient-specific direct/safe-abstracted/withheld/unavailable decision |

No row implies another. Classification authority grants no receive authority;
receive authority grants no classification authority.

## Administrative-capability inventory

| Capability | Current exact owner | Persistence/mutation/lifecycle | Current consumers | Receive authority | Field-classification authority |
|---|---|---|---|---|---|
| Organization provisioning | bounded provisioning services and receipts | existing provisioning/Runtime and access owners | activation and onboarding | no | no |
| `manage-organization-membership` | no canonical general contract | future | none | no | no |
| `manage-organization-access-assignments` | bounded Alpha provisioning and append-only access lifecycle; no general delegated capability | Alpha access repository/current-head resolver | Alpha preflight and sandbox administration | no | no |
| `manage-recipient-audience-grants` | issuer operation is named by the shadow grant contract; canonical administrative authority is incomplete | future separate repository and issuance events | no live consumer | no | no |
| `manage-field-audience-requirements` | new shadow `FieldAudienceAdministrativeAuthority` revision | unpersisted immutable revision contract | field policy/override constructors only | no | yes |
| `manage-canonical-scope-topology` | `CanonicalScopeTopology` owns values; administrative issuance contract absent | canonical topology values; future administration | scope-lineage producers | no | no |
| `view-governance-audit` | audit artifacts exist; delegated viewing capability absent | existing owner-specific audit history | validators/operators | no | no |
| `manage-administrative-delegation` | absent | future | none | no | no |
| `invoke-break-glass-receive` | absent | future separate exceptional contract | none | only if later explicitly issued | no |

Clerk roles, organization creator status, first sign-in, email domain, billing
ownership, CEO title, and reporting hierarchy are not administrative authority.
There is no canonical general super-admin primitive.

## Separation-of-powers proof

The executable benchmark proves:

1. membership administration does not authorize content or classification;
2. access-assignment administration does not authorize content or classification;
3. grant administration does not authorize classification;
4. field classification does not authorize receive;
5. topology administration does not authorize receive;
6. audit viewing does not disclose protected content;
7. receive authority does not authorize administration;
8. role and title changes do not alter any capability;
9. break-glass is absent and therefore cannot become an implicit fallback.

Any future break-glass contract must be separate, explicit, exceptional,
bounded, canonically time-limited, audited, and ordinarily absent.

## Field-family inventory

All current families lack a governed audience requirement. `canonicalCompositions`
remains the Product-visible Understanding owner; field classification remains
separate governance.

| Field family | Semantic / identity / version owner | Scope and support owners | Current disclosure / Product visibility | Requirement strategy | Historical status |
|---|---|---|---|---|---|
| composition claim | canonical composition / composition ID / revision ID | composition subject scope; Explanation refs | canonical disclosure; visible when authorized | family policy + exact override | exact revision available |
| composition identity | canonical composition ID | organization and composition owner | structural reference | family policy normally sufficient | immutable reference |
| composition revision | canonical composition revision | composition owner | structural reference | family policy normally sufficient | immutable revision |
| Explanation claim | completed Explanation / Explanation ID / unresolved immutable version owner | claim subject scope and supports | canonical disclosure; visible when authorized | exact override may be required | version boundary remains open |
| Explanation identity | completed Explanation ID | Explanation owner | structural reference | family policy normally sufficient | identity exists |
| Explanation version basis | completed Explanation owner | unresolved | currently incomplete | cannot activate until version owner closes | open blocker |
| bounded Evidence reference | canonical Evidence/admission identity | source binding, Evidence attribution, comparative role | bounded reference; body unavailable | family policy + possible exact override | exact attribution digest available |
| Evidence source identity | connector/source identity owner | source binding | bounded provenance | family policy normally sufficient | versioned externally |
| comparative Evidence role | completed Explanation comparative-role owner | exact Explanation/Evidence relationship | bounded support meaning | exact override may be required | retained on Explanation |
| Evidence count | projection owner over authorized inputs | disclosed Evidence refs only | side-channel governed | family policy + disclosure-side count protection | recomputed, not independent truth |
| Evidence body | canonical Evidence owner | Evidence admission and source lineage | intentionally unavailable | intentionally-unavailable policy | no activation planned |
| condition | canonical condition producer | later condition scope owner | projected when authorized | blocked pending scope/version lineage | incomplete |
| investigation | investigation opportunity owner | downstream of condition scope | projected when authorized | blocked pending canonical references | incomplete |
| confidence | exact canonical confidence owner | exact owning object/support | projected without transfer | family policy + exact owner binding | owner-specific |
| uncertainty | canonical uncertainty owner | exact composition/Explanation support | projected when authorized | family policy + exact override possible | retained canonical state |
| unknown | Product Unknown owner | Question and source ancestry | Product Workflow | separate Product contract; no inference | versioned Product events |
| contradiction | canonical contradiction owner | Evidence and cognition supports | projected when authorized | family policy + exact override possible | retained canonical state |
| history | owning object histories | exact immutable references | current-policy reevaluation required | family policy plus exact historical target | history immutable |
| evolution | canonical Understanding evolution owner | current/prior revisions | projected when authorized | family policy plus exact revision binding | immutable history |
| authority receipt | owner-specific authority transition | exact operation and object | internal/audit only | restricted policy; exact override likely | immutable receipt |
| audit reference | owner-specific audit producer | exact decision/operation refs | internal only | restricted policy | immutable reference |
| safe lineage | canonical disclosure owner over underlying lineage | disclosed supports only | recipient-safe projection | downstream; cannot classify itself | derived per evaluation |
| availability | projection/disclosure owner | source owner state | bounded availability | downstream disclosure result, not authority | recomputed under current policy |

Organization-specific policy is permitted because governance may differ by
organization. Exact-object overrides are required for exceptional fields,
mixed sensitivity, or explicit administrative decisions. They never infer from
subject, source, or Evidence scope.

## Selected Model D

- **Model A — embedded on cognition:** rejected. Governance revision would
  rewrite cognition and couples independent lifecycles.
- **Model B — separate exact-field record:** safe but rejected as the sole
  owner because every field would require manual classification.
- **Model C — field-family policy:** safe but incomplete for mixed-sensitivity
  targets and exceptions.
- **Model D — policy plus exact override:** selected. It preserves independent
  lifecycle, deterministic precedence, target binding, and explicit authority.
- **Model E — derive from scope/provenance:** rejected. Subject, source, and
  Evidence scopes carry no audience authority.
- **Model F — explicit administration only:** safe but rejected as the sole
  model because missing classifications and operational burden do not scale.

## Contract schema

Version 1 is limited to resource
`canonical-organizational-understanding`, operation `receive`, and purpose
`organizational-understanding`.

An exact target binds organization, object kind, object ID, exact object
revision or proven immutable version basis, field family, and stable field
path. Prose and array position never own identity.

Requirements use disjunctive normal form: outer alternatives are OR; each
inner scope list is AND. Empty classification is invalid. `unresolved` and
`intentionally-unavailable` carry no scopes. Scope arrays and clauses are
deduplicated and canonically ordered. There is no broadest, narrowest, role,
default-scope, or newest-string fallback.

Policy identity binds organization/resource/operation/purpose/field family and
stable field path.
Exact requirement identity additionally binds the complete exact target.
Every proposal revision hashes all normalized security-relevant fields: target
version, scope expression, disposition, policy version, issuer authority
revision, lifecycle, effective time, and predecessor. Integrity is a separate
digest over the complete proposal revision.

`FieldAudienceRequirementApproval` binds exact organization, proposal kind,
proposal identity/revision/integrity, exact target when present, field
family/path, approving principal, administrative authority identity/revision,
decision, operation, and effective time. Approval identity, revision, and
integrity are deterministic and independently reconstructable. An immutable
issuance receipt independently binds the proposal and final requirement
identity, revision, and integrity; target/policy boundary; ordered approval and
authority references; approval-set digest and principal counts; issuing
authority; operation/resource/purpose; explicit times; receipt identity,
revision, and integrity.

## Administrative authority and dual control

An issuer must hold an exact active, unexpired, organization-bound
`manage-field-audience-requirements` authority revision at issuance time.
Approvers independently require that capability when approving. Membership,
access, grant, topology, audit, receive, role, and break-glass capabilities
cannot substitute.

Organization-wide classifications require a second distinct authorized
principal. Exact overrides require dual control only when normalized DNF and an
integrity-validated `CanonicalScopeTopology` prove the override broader than
its family policy. Equal and narrowing overrides require one approval;
incomparable relationships fail closed. Duplicate records or multiple
authority revisions for one principal never increase the principal count.

The public issuance-authorizer accepts no approval threshold or caller-selected
comparison. `deriveFieldAudienceApprovalPolicy` produces one immutable policy
revision from the exact proposal, governing family policy, and validated
topology. Non-organization-wide family policies and equal or narrower exact
overrides require one principal; organization-wide policies and broader
overrides require two. Missing policy, incomparable scope, intentionally
unavailable content, or invalid topology produces no usable threshold.

The executed temporal comparison selects T3: approval-time plus issuance-time
authority. Every required authority must remain a current active head when new
issuance is authorized. Later revocation blocks new approval, new issuance,
and reuse of a pending approval, but does not rewrite a historical receipt.
The requirement's independent lifecycle governs current validity.

## Lifecycle and precedence

Policies, overrides, and administrative authorities are immutable revisions in
`proposed`, `active`, `inactive`, `revoked`, or `superseded` state. Revision 1
has no predecessor; later revisions name exactly one predecessor. Forked or
multiple active terminal revisions conflict and fail closed. Revocation never
reactivates. Restoration creates a new active successor; stale approval or
target revisions fail closed.

An exact active override has precedence only after exact target, topology,
identity, revision, integrity, issuer, approval-policy, and approval-set
validation. Two active exact overrides, two active policies, tampering, invalid
authority or approval, unsupported versions, incomparable DNF, or
cross-organization data fail closed. A revoked or inactive override does not
suppress a valid policy.

## Pure resolver

```ts
resolveCurrentFieldAudienceRequirement({
  organizationId,
  target,
  policies,
  exactRequirements,
  historicalAuthorities,
  approvals,
  issuanceReceipts,
  topology,
  asOf,
})
```

The internal result distinguishes `resolved`, `unresolved`, `inactive`, `revoked`, `conflicting`,
`intentionally-unavailable`, `stale-target`, `invalid-authority`,
`invalid-approval`, `invalid-topology`, `malformed`, and
`cross-organization`. Only `resolved` contains the normalized scope expression,
its policy/override basis, and a validated historical issuance receipt. The
resolver never creates a receipt. This object must not
cross the ordinary Product/browser boundary.

## Future bootstrap, persistence, and migration

The initial organization governance administrator must be created by a
governed organization-provisioning operation with an immutable receipt. It is
never inferred. That authority may later delegate membership, access,
recipient-grant, field-requirement, topology, audit, or delegation capabilities
as separate revisions. Delegation, revocation, supersession, stale writes, and
dual control require a dedicated administrative repository and optimistic
current-head mutation boundary.

No such repository, bootstrap, delegation, persistence, migration, admin UI,
or break-glass operation is implemented here. Future persistence requires a
separate reviewed migration. No current Northstar field is classified and no
existing assignment receives grandfathered authority.

On future activation, an unclassified historical field fails closed. It does
not inherit from any scope, role, hierarchy, Alpha admission, or existing
grant. Historical Runtime and cognition remain immutable. Migration may use a
governed family-policy activation or generated proposals requiring explicit
human approval; it may not rewrite Runtime or automatically broaden access.

## Benchmark result

The first final review rejected the earlier oracle because it hardcoded Model D,
classification, readiness, and next task; used a tampered digest as a false
missing-approval test; lacked revision-bound approval acts; and omitted real
topology transformations. Renewed review then rejected the incomplete receipt
and manually assigned model oracle. Renewed review also rejected caller control
over the threshold and remaining assigned findings. The reconstructed oracle runs 22 behavioral
scenarios against six ownership models: 132 exact cells, eight neutrality
invariants, two approval validations, two issuance validations, two historical
receipt validations, four revocation validations, two topology validations,
three target-version validations, eight tamper validations, and 20 dynamic
controls. Models A–F and T1–T3 execute common harnesses; controls rerun altered
adapters or requirements. Every eligibility field derives from executed outputs. Duplicate, missing, and
unexpected cells are zero.
Repeated byte-identical runs produce byte-identical `results.json` and report
digests.

Changed governed content under an unchanged opaque upstream revision is not
locally detectable. It remains an explicit upstream target-version integrity
dependency rather than a scenario simulated by changing object identity.

The derived next owner is completed Organizational Explanation immutable-version
ownership. The exact next task is:

**DISCOVERY COMPLETED ORGANIZATIONAL EXPLANATION IMMUTABLE-VERSION OWNERSHIP
CONTRACT 001**

Audience-lineage production and recipient-scoped nested-field disclosure remain
blocked. Current Product and Production behavior remain unchanged.
