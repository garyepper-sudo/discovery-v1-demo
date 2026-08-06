# Leadership Conversation Conflict and Reconciliation Register 001

**Status:** Canonical reconciliation record

This register classifies material ideas from the Leadership Conversation
specification. It prevents later implementation from silently reopening
resolved ownership or architecture questions.

| Original proposal | Canonical conflict | Reconciliation decision | Accepted replacement | Implementation consequence |
|---|---|---|---|---|
| Conversation identity | A second durable workflow identity competes with `ProductQuestion` | Accepted with modification | Conversation context and artifacts reference the canonical Question | No independent conversation aggregate identity |
| Prepared Work Product as report | Reports can become presentation-only or duplicate meaning | Accepted with modification | Versioned non-authoritative Product Workflow artifact | Reference canonical owners; no packet-level confidence |
| Uploaded notes as Evidence | Upload does not establish canonical authority | Accepted with modification | Source-bound receipt plus Evidence candidate/proposal | Human approval and canonical admission required |
| Generic Takeaway owner | Would compete with Evidence, Decision, Outcome, Learning, Unknown, and Question owners | Rejected | Typed proposal envelope naming its proposed canonical owner | No generic Takeaway persistence or authority |
| Capture mutates Runtime | Bypasses candidacy, review, admission, and lifecycle owners | Rejected | Capture → proposals → human disposition → canonical admission → governed evolution | No direct Runtime mutation from prose or approval |
| Leadership title grants authority | Conflates descriptive role with authorization | Rejected | Exact server-resolved organization/scope authority | Participant/title metadata is non-authoritative |
| Role-specific first-slice preparation | Current CEO/Director/Manager semantics are identical | Deferred | Shared organization-wide preparation | No material differentiation claim |
| Current Focus as new objective system | Competes with Objective and Optimization Context | Deferred | Future extension of existing Objective/Context owners | No first-slice Current Focus owner |
| Decision Readiness in first slice | Owner and calibration remain unresolved; risks opaque score | Deferred | Exact Unknowns, assumptions, caveats, and current owner states | No readiness score |
| Dialogue support as meeting software | Risks replacing human conversation and generic meeting-assistant positioning | Rejected for first slice | Prepare before and Capture after an external human conversation | No live participation, facilitation, or transcription |
| “Worth keeping in mind” as prediction | Could imply what another person will say or alarm without evidence | Accepted with modification | Evidence-grounded adjacent, non-predictive context | Subordinate to purpose; explicit caveats |
| Capability indicators as health score | Risks weak aggregation and hidden inputs | Deferred | Explainable owner-produced measures only after validation | No opaque score or composite health |
| Leadership Workspace as task/project management | Creates competing work, task, and commitment owners | Rejected | ProductQuestion-centered prepared work and canonical workflow references | No task board or autonomous task creation |
| Environmental Intelligence as immediate input | Separate authority/provenance model is unresolved | Deferred | Internal authorized Organizational Understanding only | No first-slice dependency or external intelligence |
| Live transcription | Privacy, retention, source identity, and consent are unresolved | Deferred | Bounded paste/upload after the conversation | No microphone or real-time capture |
| Route promotion | Development proof lacks Production security and differentiated-governance acceptance | Deferred | Isolated development-only experience | Existing canonical routes unchanged |
| Production deployment | Persistence, upload security, retention, revocation, operations, and acceptance remain open | Deferred | Deterministic local proof | No Production access or deployment |
| One-on-one scenario | Heightened personnel sensitivity needs stronger governance | Deferred | Recurring cross-functional leadership/staff conversation | One generic contract; sensitive template later |
| Multiple meeting-type architectures | Duplicates Product primitives | Rejected | One generic Leadership Conversation contract | Meeting types are bounded context/templates only |
| Automatic admission | Generated or uploaded text would become truth without review | Rejected | Explicit disposition followed by canonical admission | Every admitted item has human and owner receipts |
| Autonomous decision or commitment | Discovery does not own final leadership judgment | Rejected | Proposed Decision/commitment routed to existing owners | Leader remains final decision maker |
| Dashboard-first or chat-first UX | Conflicts with accomplishment-first stateful workflow | Rejected | Set up → Prepare → Freeze → Capture → Review → What changed → Prepare again | One progressive ProductQuestion workspace |
| Raw Evidence or Runtime display | Violates projection firewall and disclosure boundary | Rejected | Bounded Evidence references and authorized Product contracts | No bodies or Runtime objects in presentation |

## Classification summary

### Accepted

- Leadership Conversation Prepare–Capture–Prepare as the first wedge;
- one recurring cross-functional Northstar acceptance scenario;
- `ProductQuestion` anchor and existing canonical owners;
- human conversation outside Discovery;
- progressive ProductQuestion-centered workspace;
- explicit, separated “what changed” states.

### Accepted with modification

- conversation identity becomes bounded Question-linked context;
- Prepared Work Product becomes a non-authoritative versioned artifact;
- upload becomes a source receipt and proposal input, not Evidence;
- “worth keeping in mind” becomes evidence-grounded non-predictive context;
- participant/title information becomes descriptive metadata only.

### Deferred

- role differentiation and full field-governance activation;
- Current Focus and Attention Management;
- Decision Readiness;
- capability indicators;
- sensitive one-on-ones and broader templates;
- live transcription and connector automation;
- route promotion, Production, and Environmental Intelligence.

### Rejected

- competing conversation, Understanding, Takeaway, task, Decision, confidence,
  source-identity, or Runtime owners;
- automatic admission or direct Runtime mutation;
- autonomous decisions/tasks;
- title-based authority;
- dashboard/chat/meeting-assistant positioning;
- raw Evidence-body or Runtime presentation.

### Unresolved but bounded for implementation planning

- exact versioned TypeScript shapes and event consolidation;
- which existing Product Workflow persistence mechanism stores each new
  artifact without using Runtime as a generic document store;
- canonical creation-time injection and content normalization rules;
- exact proposal edit/disposition vocabulary beyond the required semantics;
- development route name and UI composition, subject to the no-promotion gate.

These decisions are implementation-level and do not reopen Product strategy or
canonical ownership.
