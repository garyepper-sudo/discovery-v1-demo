# Discovery Governed Exact Source Content Owner 001

## Status

Implemented and validated as a connector-neutral, development-only owner. This
closes the exact-source-content prerequisite for the Leadership Conversation
Prepare-and-Capture vertical slice; it does not implement that slice or claim
Production readiness.

## Ownership boundary

`GovernedSourceContentService` is the sole semantic entrypoint. It authorizes
one of four exact operations, resolves the current canonical Source Binding on
the server, validates organization, purpose, scope, sensitivity, availability,
source type, and normalized digest, and only then invokes mechanical
persistence. The operations are `source-content:write`,
`source-content:read-for-proposal`,
`source-content:read-for-evidence-admission`, and
`source-content:reset-development`.

Source Binding remains the stable source-identity and scope-lineage owner.
Source Content owns immutable exact bytes and their content version. Exact byte
identity and normalized comparison identity remain separate. New local Source
Bindings require source type, purpose, and availability; revision changes are
immutable and current revocation denies new reads and writes.

The filesystem repository is injected, mechanical, temporary-root testable,
and guarded for non-Production use. It uses organization manifests, exact-
digest blobs, compare-and-swap revisions, atomic manifest replacement, and
digest-only persisted idempotency data. Deterministic reset and three-process
write/reload/replay/reset/re-entry validation pass without touching default
storage or Organization Runtime.

## Explicit exclusions

This owner does not admit Evidence, mutate Organization Runtime, persist
Product Workflow bodies, call connectors, read Google Drive, provide search or
listing, administer retention, or provide Production storage. Approval,
Evidence admission, Runtime evolution, and Understanding change remain
distinct downstream stages.

## Immediate successor

**DISCOVERY LEADERSHIP CONVERSATION PREPARE-AND-CAPTURE VERTICAL SLICE 001**

The slice must create or resolve a canonical local Source Binding, write exact
content through `GovernedSourceContentService`, retain only
`SourceContentWriteReceiptV1` references in `ConversationUploadReceiptV1`, read
server-side through `source-content:read-for-proposal`, and route approved
Evidence proposals through `source-content:read-for-evidence-admission`. A
client may never supply replacement canonical text.
