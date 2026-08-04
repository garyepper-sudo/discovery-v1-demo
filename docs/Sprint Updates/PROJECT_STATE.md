# Discovery Project State

**Drive integration baseline:**
`39420f200e5789f223795d8f4b918d9814d16e04`

**Current phase:** multi-role backend, role-aware frontend first slice, and
multi-user sandbox access complete; live scoped Product adapter wiring is next

**Architecture posture:** canonical Product backend complete for UI/UX design;
recommendation and evaluator development frozen by default

## Current Milestone

The Living Organization Google Drive corpus integration is complete,
live-validated, and integrated into `origin/main`. The retained sandbox uses
organization `sandbox-northstar-implementation-services-001`, six semantic
batches, sixteen documents, and five negative controls.

## Current Phase

All six multi-role benchmark gaps have focused production-owner traceability.
One canonical model serves five permission-safe role projections through one
scoped Product adapter. The first fixture-backed frontend slice is implemented.

## Current Product State

- Frontend contract: `ProductQuestionWorkspaceV2`, contract version `2`.
- Workflow stages: 9.
- Semantic actions: 14.
- Deterministic fixtures: 24.
- Semantic fixture coverage: 24/24; canonical nested state and orientation coherence validated.
- Authorized repository reads per workspace: 1.
- Exact fixture reset: validated.
- Real local-operation replay: passed.
- `inspect-existing-evidence`: implemented under Product Confidence
  Improvement.
- `compare-existing-evidence`: blocked as unimplemented.
- Replay result: information produced; no Evidence candidate, Evidence
  admission, Unknown change, Answer change, Understanding change, or
  recommendation change.
- Learning: truthful no-change projection.
- Frontend implementation: role-neutral first slice implemented at
  `/role-aware-alpha/[fixtureId]`; 24 fixtures semantically validated and ten
  approved first-slice fixtures rendered.
- Frontend foundations: shell/navigation, Home, Understanding, Decision,
  Investigation, History, and six distinct semantic dispositions.
- Live scoped Product adapter: not wired.
- Multi-user sandbox access: three distinct Clerk development identities are
  provisioned as CEO, Director, and Manager in the same organization through
  explicit server-side scopes and operations; titles grant no authority.
- Access acceptance: deterministic inspection, three isolated sign-in/sign-out
  sessions, copied-URL/cache isolation, Manager revocation, canonical
  append-only restoration, and exact idempotent reset passed.
- Canonical `/your-organization`: unchanged.
- Governed Drive integration: one exact private/non-root/non-recursive folder;
  manual incremental synchronization; read-only connector; strict MIME,
  file-count, byte, and digest validation.
- Live sequence: `5/5/0`, `7/2/5`, `9/2/7`, `16/7/9`, `16/0/16`
  (`files/new/unchanged`); parity passed and mismatch lists were empty.
- Validate-before-persist, exact identity binding, recursive OAuth/log
  redaction, negative controls, and unchanged retry: validated.
- Final 16-file sandbox Runtime and semantic state: retained.
- Automatic watching, recursive/multiple folders, connector writes, other
  connectors, selector activation, and Production activation: blocked.

## Current Objective

Wire the canonical scoped Product adapter to the role-aware experience and
validate it with the three sandbox accounts without changing Product meaning,
authorization ownership, or the canonical `/your-organization` route.

## Next Priority

**DISCOVERY LIVE SCOPED PRODUCT ADAPTER WIRING AND THREE-ACCOUNT ACCEPTANCE
001**

Replace the isolated role-aware fixture read with the canonical server-side
scoped Product read while preserving the serialized contract and frontend
semantics. Validate CEO, Director, and Manager disclosure and denial behavior
in isolated sessions. Supported metrics remain coherence and learning velocity.

## Canonical implementation boundary

```text
authorized server request
→ CanonicalProductWorkspaceAdapter
→ ProductQuestionWorkspaceV2
→ semantic action metadata
→ frontend presentation
```

The internal local-operation adapter may be called only by a governed server
command. It is not a direct frontend integration boundary. Operation results,
Outcome observations, Evidence admission, and cognition remain separate.

## Frozen work

Recommendation development is frozen by default. Material Information
Acquisition remains inactive. The Organizational Understanding Evaluator is
frozen at its preserved checkpoint. Human communication feedback resumes only
after frontend completion. No semantic adjudication, selector activation,
external action, connector execution, or Production activation is authorized.

## Worktree boundary

The original research worktree remains intentionally dirty with unapproved
evaluator Phase 4–5, external-comparative, observable-output-fidelity,
scoring-robustness, governance, handoff, package, and related research drafts.
Do not use it for UI/UX implementation. Start a new branch from `origin/main`
in the clean Product worktree.
