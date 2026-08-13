# Leadership Conversation Prepare/Capture Specification 001

**Status:** Canonical implementation boundary; implementation not begun
**Gap:** `GAP-B-019`
**Roadmap phase:** Leadership Conversation Phase 1
**Architecture change:** None. This specification composes existing owners.

## Objective

Prove the smallest deterministic loop:

```text
Prepare the conversation
→ capture what happened
→ approve what matters
→ improve Organizational Understanding
→ prepare the next conversation better
```

The slice is development-only, shared organization-wide, and anchored by
`ProductQuestion`. It creates no route, persistence implementation, adapter,
API, UI, or Runtime behavior through this document.

This first slice applies the shared persona architecture without creating
persona-specific state. Chief organizes the one visible workflow; Counsel is a
bounded Prepare/Review challenge that may abstain; Operator provides only the
post-conversation Draft/signal/Outcome/review linkage; Scout remains deferred
except for a recommendation tied to a named uncertainty. Every responsibility
uses the same permission-aware projection and existing canonical owners.

Activation begins with one user, one recurring consequential meeting, one
material Question, the user's role and purpose, and recent authorized agenda,
notes, or reports. It must yield useful preparation in one session and must not
begin with an empty workspace, model-building exercise, persona selector,
broad questionnaire, or organization-wide rollout.

## Reused owners

- `ProductQuestion` and `ProductQuestionWorkspace`;
- authorized `OrganizationalUnderstandingProjection`;
- Product Communication and bounded Evidence references;
- canonical source binding and Evidence admission;
- Material Information Acquisition proposal patterns;
- `ProductDecisionDraft` and canonical Decision records;
- Outcome, Learning, Unknown, and Product Workflow event lifecycles;
- Runtime evolution after canonical admission;
- exact before/after references and change receipts;
- authorization-before-read adapters.

## Bounded Product contracts

These are planning contracts. Their exact TypeScript version, migration review,
fixtures, and validators belong to the implementation task.

### `LeadershipConversationContext`

Minimum fields:

- exact organization and `ProductQuestion` references;
- conversation type and title;
- date or timeframe;
- participants as descriptive metadata only;
- purpose: `align | decide | learn | explore | communicate | review`;
- intended outcome;
- optional leader context.

No field grants authority or disclosure permission.

### `PreparedWorkProduct`

Minimum fields:

- deterministic artifact identity;
- organization and `ProductQuestion` identities;
- artifact version and predecessor version;
- canonical creation time;
- conversation context;
- source projection and Product Communication revisions;
- bounded Evidence references;
- prepared content, unavailable areas, and caveats;
- append-only leader-edit references;
- frozen snapshot identity and digest;
- lifecycle: `draft | frozen | superseded`.

The contract owns Product composition only. Confidence stays with exact source
owners. Frozen versions are immutable.

### `ConversationUploadReceipt`

Minimum fields:

- deterministic source identity;
- source type;
- filename or user label as non-authoritative metadata;
- exact and normalized-content digests;
- organization, `ProductQuestion`, and Prepared Work Product references;
- upload time and uploader identity;
- duplicate status and source-binding status;
- explicit statement that metadata grants no authority.

### `TakeawayProposalEnvelope`

Minimum proposal kinds:

- Evidence candidate;
- proposed Decision, Outcome, Learning, or Unknown;
- proposed commitment;
- proposed assumption change or correction;
- proposed follow-up Question.

Every proposal contains deterministic identity, source references, proposed
statement, proposed canonical owner, uncertainty treatment, affected Question
and Prepared Work Product, duplicate/conflict status, reviewer disposition,
append-only edit history, and an admission receipt only after approval.

The envelope is not a generic Takeaway owner.

### Capture events

Use the smallest lossless append-only set. The implementation review should
attempt to combine events where state remains unambiguous. Required semantics:

- Capture started and source received;
- proposals generated;
- proposal reviewed, including edits and disposition;
- canonical admission completed;
- Runtime evolution completed;
- change receipt created;
- later-preparation linkage created.

## Prepared content

Default output is concise and purpose-relative. Eligible sections are current
Understanding, relevant material changes, Conditions, tensions,
contradictions, assumptions, Unknowns, open Questions, Decisions requiring
attention, prior commitments, agenda, talking points, suggested Questions,
bounded Evidence references, unavailable areas, caveats, and “worth keeping in
mind.”

Not every available field is included. “Worth keeping in mind” is
evidence-grounded, adjacent context, non-predictive, non-alarmist, and
subordinate to the stated purpose. Discovery does not predict what another
leader will say.

The default three-minute brief prioritizes six questions: what changed; what
matters now; where the hidden tension is; what might surprise the user; what to
ask; and what happened last time. It is a derived `PreparedWorkProduct`, not a
new canonical Meeting Brief. Evidence basis, uncertainty, reasoning, competing
explanations, and provenance use progressive disclosure.

Private working preparation may explore counterarguments, missing Evidence,
failure conditions, communication choices, and whether the user's
interpretation is mistaken. It remains private Product working state unless
the user explicitly selects material for governed contribution. Private
reasoning never automatically becomes Source Content, Evidence, Organizational
Understanding, Decision, Learning, or an employee-evaluation artifact.

## Persistence classification

| Candidate | First-proof classification | Boundary |
|---|---|---|
| `ProductQuestion` | Must persist | Existing owner only |
| Conversation context | Must persist | Product Workflow event/history boundary |
| Prepared Work Product versions | Must persist | New bounded contract; no generic Runtime store |
| Leader-edit events | Must persist | Append-only |
| Frozen snapshot | Must persist | Immutable deterministic artifact |
| Upload receipt | Must persist | Exact source identity and digests |
| Takeaway proposals and dispositions | Must persist | Proposal state, not canonical truth |
| Admission receipts | Must persist | Existing canonical owners |
| Capture events | Must persist | Append-only Product events |
| Before/after change receipt | Must persist | Existing change semantics extended by reference |
| Later-preparation linkage | Must persist | Question/artifact history |
| Unsaved editor keystrokes and transient layout state | May remain in memory | No semantic authority |
| Raw generated intermediate reasoning | Must not persist | Not a Product contract |
| Raw Runtime snapshot in Prepared Work Product | Must not persist | Projection firewall |
| Evidence bodies in the default artifact | Must not persist | References only |
| New product data inside Organization Runtime | Requires bounded contract before persistence | Runtime is not generic Product storage |

The implementation task must select an existing appropriate Product Workflow
persistence boundary or return a bounded architecture decision. It may not use
Organization Runtime as an unreviewed generic document store.

## UX state model

One `ProductQuestion`-centered workspace progresses through:

```text
Set up → Prepare → Freeze → Capture → Review → What changed → Prepare again
```

- Entry: “What are you trying to accomplish?”
- Primary action: “Prepare for a leadership conversation.”
- Setup: minimum context fields.
- Prepare: concise editable content; deeper lineage hidden by default.
- Freeze: immutable version used for the external conversation.
- Capture: paste or upload bounded material.
- Review: compact proposals with explicit dispositions.
- What changed: admitted, changed, unchanged, unresolved, and deferred states.
- Return: next preparation incorporates approved learning.

Capture, Review, and What Changed should complete as a two-minute closure
covering what was decided, changed, unchanged, unresolved, worth watching, and
owed. Follow-through uses existing Draft, commitment, expected-signal, Outcome,
review-condition, and Question owners; it does not create generic tasks.

Dashboard-first, generic chat-first, task management, raw Runtime, and live
meeting participation are excluded.

## Human-review and mutation boundary

Extraction creates proposals only. The leader approves, edits and approves,
rejects, or defers each proposal. Only approved proposals may be presented to
their canonical admission owner. Approval itself performs no admission.
Runtime evolution runs only after successful canonical admission. Upload,
proposal generation, review, and approval never directly mutate Runtime.

## What-changed states

The implementation must represent independently:

1. source uploaded;
2. proposals generated;
3. proposals reviewed and dispositioned;
4. canonical records admitted;
5. Runtime evolution attempted/completed;
6. Organizational Understanding changed or unchanged;
7. confidence, uncertainty, Decision, Outcome, Learning, or Unknown changed;
8. future preparation context changed.

No state implies another without an exact receipt or before/after reference.

Historical disposition is richer than binary changed/unchanged. Where existing
owners support it, the checkpoint and delta must distinguish: conclusion
changed; confidence changed without conclusion change; supporting explanation
changed; uncertainty increased or decreased; competing explanation
strengthened or weakened; scope-specific divergence remained justified;
disagreement remained unresolved; Source Content was relevant but insufficient;
proposed Evidence was not admitted; proposed interpretation was rejected; no
material challenge was found; no change was warranted; Decision material
remained provisional; and canonical Decision authority was not exercised.
Authorized inspection preserves rejection and justified non-change; absence of
change never erases the transition.

## Deterministic Northstar acceptance

Primary scenario: a recurring cross-functional Northstar leadership/staff
conversation.

The fixture must demonstrate:

1. existing or newly created canonical `ProductQuestion` anchor;
2. stated purpose and intended outcome;
3. useful preparation from the current organization-wide projection;
4. leader edit and immutable freeze;
5. simulated external conversation and bounded upload;
6. exact source receipt and content digests;
7. multiple proposal kinds;
8. at least one approval, edited approval, rejection, and deferral;
9. only approved proposals reaching canonical owners;
10. governed Runtime evolution;
11. truthful changed and unchanged results;
12. next preparation incorporating approved learning;
13. byte-equivalent reset and replay.

The scenario includes one approved new Evidence item, one corrected assumption
or Understanding, one proposed Decision or commitment, one rejection, one
deferred Unknown or follow-up, one approved item producing no Understanding
change, and one approved item materially changing later preparation.

Role differentiation is not required. CEO, Director, and Manager receive the
same substantive projection.

The Alpha acceptance uses two deterministic cycles around the same
`ProductQuestion`. Cycle one establishes, prepares, freezes, captures, reviews,
and preserves changed, confidence-only, unchanged, rejected, divergent,
unresolved, and provisional results where applicable. After an authorized
intervening Evidence admission, simulated Outcome, operating result, condition
change, or other governed update, cycle two reloads the exact prior checkpoint,
proves no later-information contamination, compares expected and observed
signals where available, prepares from updated governed state, and preserves
lineage across both cycles. A simulated organization is sufficient for the
first proof.

The two-cycle proof is mandatory rather than an optional historical extension.
It must show a measurable second-cycle advantage from exact authorized history,
not merely successful replay.

## Minimum historical checkpoint requirement

Before substantial persona implementation relies on historical semantics, the
foundation must reuse an existing immutable snapshot, receipt, Product Workflow
history record, versioned package, historical projection, or exact canonical
references. It must bind: organization; Question; actor/recipient context;
scope; purpose; cutoff/freeze; exact Understanding identity and revision;
Source Binding, Source Content revisions, and Evidence basis; applicable
Prepared Work revision; interpretation-affecting model, rubric, evaluator,
prompt, and algorithm versions; conclusions; confidence; uncertainty;
assumptions; supporting and contradicting basis; competing explanations;
known unknowns; scope divergence; falsification/reconsideration conditions;
available expected signals/Outcomes; deterministic identity; immutable lineage;
creation authorization; and historical-read authorization.

The package is authentic historical basis, not present-day reconstruction.
Later Decision, Outcome, and Learning records link without rewriting it.
Generated output gains no Evidence, Understanding, or Decision authority.
Historical-read authorization is reevaluated independently: revocation may deny
current access but cannot rewrite immutable history.

## Validation metrics

Acceptance implements the constitution’s ten Alpha criteria and complete
negative-control set. A positive fixture must not require manufactured
disagreement: Counsel may truthfully return no material challenge. Meeting
notes remain governed Source Content and proposals, never Evidence or truth by
presentation. Product Decision Draft remains visibly non-authoritative. Scout
recommendations without a named uncertainty fail closed. No persona name,
interface, or stored output supplies authority.

- preparation time saved and context-reconstruction steps removed;
- perceived preparation quality and content retained/edited;
- trust in prepared content and “what changed”;
- proposal approval, correction, false, and irrelevant rates;
- cognitive effort and willingness to return;
- improvement between first and second preparation;
- useful canonical Evidence and corrections admitted.
- time to first useful brief and post-meeting closure time;
- repeat use for the same meeting series and use of prior context;
- user-rated material insight, better-question help, likely-surprise detection,
  confidence explaining the issue, and willingness to attend without Discovery;
- commitments, unresolved issues, expected signals, and review conditions
  carried forward through existing owners.

Retrieval volume is not the primary metric. No Decision Readiness score or
business-outcome improvement claim is permitted.

## Required implementation validation

The focused historical-foundation suite must separately prove all twenty
requirements before promotion:

1. historical immutability;
2. fresh-process reload;
3. exact owner-backed basis;
4. no retrospective contamination;
5. current-state mutation isolation;
6. generated-output non-authority;
7. rejected-contribution persistence;
8. justified non-change persistence;
9. confidence-only change;
10. distinguishable histories that converge to the same present state;
11. same-input replay;
12. different-input collision failure;
13. scope and non-disclosure;
14. revocation without rewriting immutable history;
15. direct and inherited scope lineage;
16. Outcome-linkage readiness;
17. target-independent identity;
18. fixture-only reset;
19. historical projection authorization; and
20. later model/rubric/prompt/evaluator version separation.

This focused suite is not the permanent governed-cognition twin-world release
benchmark. Neither suite is complete through this documentation task.

- contract version, fixtures, validator, migration and compatibility review;
- deterministic identity, ordering, serialization, reset, and replay;
- authorization before every read and mutation;
- organization and Question isolation;
- no Evidence body, raw Runtime, or hidden identifier leakage;
- idempotent upload, proposal, review, admission, and evolution receipts;
- stale revision, duplicate, conflict, revoked, malformed, and
  cross-organization fail-closed controls;
- exact no-change as well as material-change acceptance;
- Product projection firewall and customer-language validation.

## Explicit exclusions

No Production, route promotion, connector call, Drive access, live calendar,
email, Slack/Teams, real-time meeting participation, transcription, reminders,
automatic note requests, role differentiation, field-audience persistence,
recipient-grant activation, nested disclosure, safe abstraction, Decision
Readiness score, Attention Queue, Environmental Intelligence, autonomous
admission, decision, task creation, or Runtime mutation from uploaded prose.
