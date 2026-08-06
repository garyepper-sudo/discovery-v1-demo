# Discovery Leadership Conversation Product Constitution

**Status:** Canonical Product and architecture governance

**Scope:** Leadership Conversation Product direction and first-slice boundary

**Decision:** `DEC-PROD-041`

## North star and mission

> **Discovery exists to reduce the cognitive cost of leadership.**

Discovery reduces the effort leaders spend reconstructing context, preparing,
understanding, synthesizing, conversing, deciding, communicating, remembering,
and learning.

> **Every important leadership activity should begin with an already-prepared
> understanding.**

For the first vertical slice:

> **Discovery prepares leaders for an important conversation, captures what
> changed through that conversation, routes approved takeaways through existing
> canonical owners, and prepares the next conversation better.**

## Product thesis

Discovery is not enterprise search, generic AI chat, dashboard or reporting
software, transcription software, project or task management, or a generic
meeting assistant.

Discovery is **a Leadership Workspace powered by a continuously evolving,
governed Organizational Understanding**.

The first Product wedge is preparing leaders for recurring leadership
conversations and preserving the approved organizational learning that emerges
from them. Leaders receive less context reconstruction, faster preparation,
fewer avoidable surprises, stronger continuity, better talking points and
questions, and lower understanding fatigue. The organization gains stronger
memory, explicit assumption changes, governed Capture, and progressively better
future preparation.

## Permanent Product laws

1. **Prepare before requesting contribution.** Save the leader time before
   asking the leader to contribute information.
2. **Never begin from a blank page.** Every Leadership Workspace begins with
   current authorized Organizational Understanding.
3. **Do not create documentation work.** Never ask a user to document work they
   were not already going to perform.
4. **Human conversations remain human.** Discovery prepares, enriches, and
   preserves learning; it does not replace judgment, intuition, spontaneity,
   coaching, persuasion, or dialogue.
5. **Capture understanding changes, not merely notes.** Prioritize what changed,
   was learned, was corrected, remains unresolved, or became a decision,
   commitment, or changed assumption.
6. **No automatic truth promotion.** Uploads and generated takeaways are
   candidates or proposals, never canonical truth by default.
7. **Existing owners remain authoritative.** Prepared work and Capture never
   compete with Evidence, Decision, Outcome, Learning, Unknown,
   `ProductQuestion`, Organizational Understanding, commitment, or source
   identity owners.
8. **Progressive disclosure.** Show concise preparation and change summaries
   first; expose authorized lineage, Evidence references, confidence, and
   reasoning only on demand.
9. **Preserve architectural simplicity.** Create no second cognition engine,
   Runtime, conversation identity, Organizational Understanding, or role-specific
   truth model.
10. **Earn expansion through evidence.** Broader Leadership Workspaces require
    customer and benchmark evidence before implementation.

## Canonical architecture

```text
Evidence
→ Organizational Understanding
→ Governance
→ Authorized Projection
→ Prepared Leadership Work
→ Leadership Conversation
→ Capture
→ Human Review
→ Canonical Admission
→ Governed Runtime Evolution
→ Learning
→ Improved Organizational Understanding
→ Better Future Preparation
```

Organizational Understanding remains the engine. Leadership Workspaces are the
Product surface. The leader—not Discovery—makes the final decision.

## Canonical Product anchor

`ProductQuestion` remains the canonical long-lived Product Workflow anchor.
Conversation context, preparation, Capture, review, change, and future
preparation link to the appropriate Question. No second conversation-workflow
identity is permitted.

## Prepared Work Product boundary

`PreparedWorkProduct` is a bounded, deterministic, versioned Product Workflow
artifact for work the leader already intended to perform. It may represent an
agenda, concise context, talking points, suggested questions, a pre-read, or a
decision-preparation packet.

It is not cognition, a second Organizational Understanding, a generic report,
a raw Runtime snapshot, an authorization or disclosure owner, a second
`ProductQuestion`, canonical Evidence, or a canonical Decision. It references
existing owners and preserves exact organization, Question, projection,
lineage, unavailable areas, caveats, and source revisions. Confidence stays on
its existing exact owner and is never assigned to the artifact as a whole.

## Initial user and conversation wedge

The initial user is a Director, VP, executive, Chief of Staff, or another leader
who synthesizes information across people, teams, initiatives, and time
horizons. Title, role label, hierarchy, participants, and reporting relationship
grant no authorization or disclosure permission.

The first wedge is **one generic Leadership Conversation contract with one
primary deterministic Northstar scenario: a recurring cross-functional
leadership or staff conversation**. It is recurring, preparation-intensive,
organization-wide, and capable of producing useful assumptions, decisions,
commitments, corrections, Evidence, and Unknowns without requiring material
role differentiation.

Sensitive one-on-one preparation is deferred until privacy, sensitivity, and
role-specific governance have stronger acceptance.

## Conversation context

The first slice uses the smallest bounded representation of:

- conversation type, title, date or timeframe;
- participants as descriptive metadata only;
- purpose: align, decide, learn, explore, communicate, or review;
- intended outcome;
- optional leader-supplied context.

This is Product Workflow context, not a universal intent ontology or an
authorization source.

## Canonical loop

```text
Prepare
→ converse
→ capture
→ review
→ admit
→ learn
→ show what changed
→ prepare better next time
```

The leader starts from “What are you trying to accomplish?”, selects or
describes a conversation, and reuses an existing `ProductQuestion` when
appropriate or creates one through its existing owner. Discovery consumes the
authorized projection and composes concise editable preparation. The leader
edits it; Discovery preserves append-only edits and freezes an immutable
snapshot. The conversation occurs outside Discovery.

On return, the leader supplies bounded notes, text, transcript, summary, or
selected takeaways. Discovery preserves exact source identity, generates
structured proposals, and requires human disposition. Only approved proposals
enter their canonical owners. Runtime evolution occurs only after canonical
admission. Discovery separately reports what was uploaded, proposed, reviewed,
approved, admitted, changed, unchanged, unresolved, or deferred, and uses
approved learning in later preparation.

## Capture and human-review boundary

Capture creates source-bound proposal envelopes, not canonical truth. The
smallest truthful disposition set supports approval, edited approval,
rejection, and deferral. Every proposal names its proposed canonical owner,
source, affected Question and Prepared Work Product, uncertainty, duplicate or
conflict status, edits, reviewer disposition, and—only after approval—admission
receipt.

There is no generic Takeaway owner. Evidence candidates, Decisions, Outcomes,
Learning, Unknowns, commitments, corrections, and follow-ups remain governed by
their existing owners. Approval is not admission; admission is not Runtime
evolution; Runtime evolution is not proof that Organizational Understanding
changed.

## What-changed truth boundary

The Product must distinguish:

- source uploaded;
- proposals generated and reviewed;
- proposals approved, rejected, or deferred;
- canonical records admitted;
- Organizational Understanding changed or unchanged;
- confidence or uncertainty changed;
- Decision, Outcome, Learning, or Unknown changed;
- future preparation context changed.

An upload does not change the organization. An approved proposal need not
change Organizational Understanding. Every displayed change requires exact
before/after or truthful no-change lineage.

## First-slice UX boundary

The first slice is one stateful, `ProductQuestion`-centered workspace:

```text
Set up → Prepare → Freeze → Capture → Review → What changed → Prepare again
```

It begins with “What are you trying to accomplish?” and the action “Prepare for
a leadership conversation.” Preparation is concise and editable; deeper
authorized lineage is hidden by default. The workspace is not dashboard-first,
chat-first, task management, raw Runtime presentation, or live meeting
participation.

## First-slice exclusions

The first slice is development-only and uses shared organization-wide
semantics. CEO, Director, and Manager receive the same substantive authorized
projection. It includes no claim of material role differentiation, Evidence
body, persisted field-audience requirement, active `RecipientAudienceGrant`,
nested disclosure, safe abstraction, autonomous admission, title-based
authorization, route promotion, Production deployment, external connector
operation, or live transcription.

## Validation gates

The deterministic Northstar scenario must prove Prepare–Capture–Prepare,
immutable preparation, exact source receipt, multiple proposal kinds, approval,
edited approval, rejection, deferral, canonical admission only for approved
items, governed evolution, truthful change/no-change, and byte-equivalent reset
and replay.

Product validation measures preparation time saved, preparation quality,
retained and edited content, trust, cognitive effort, proposal approval and
correction, false/irrelevant proposals, willingness to return, improvement
between preparations, useful admitted Evidence and corrections, and eliminated
context-reconstruction steps. Retrieval volume, engagement, opaque Decision
Readiness, or unproven business outcomes are not success measures.

## Phased roadmap

0. Product canonization and closure.
1. Development-only shared Prepare/Capture vertical slice.
2. Product Workflow persistence, reload, idempotency, audit, reset, replay, and
   failure recovery.
3. Director/VP customer validation and cognitive-cost measurement.
4. Organization-wide Production readiness and security acceptance.
5. Multi-role differentiation only after the complete governance program.
6. Leadership Attention Management only after validation.
7. Broader Leadership Workspaces only with customer evidence.
8. Environmental Intelligence remains deferred until the internal loop is
   validated.

## Deferred research and expansion

Leadership Attention Management, broader prepared-work variants, leadership
journey templates, explainable organizational capability indicators,
Environmental Intelligence, structural analogy, evolving concepts,
meta-understanding, visible assumptions, and dialogue that develops shared
meaning remain later validation or research directions. They create no first-
slice dependency and authorize no new cognition.

## Related canonical documents

- [LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md](./LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md)
- [LEADERSHIP_CONVERSATION_CONFLICT_REGISTER_001.md](./LEADERSHIP_CONVERSATION_CONFLICT_REGISTER_001.md)
- [LEADERSHIP_CONVERSATION_IMPLEMENTATION_HANDOFF_001.md](./LEADERSHIP_CONVERSATION_IMPLEMENTATION_HANDOFF_001.md)
- [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)
- [DISCOVERY_LEADERSHIP_WORKSPACE_MANIFESTO.md](./DISCOVERY_LEADERSHIP_WORKSPACE_MANIFESTO.md)
- [PRODUCT_GAPS.md](./PRODUCT_GAPS.md)
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)
