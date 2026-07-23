# Executive Conversation Intelligence

## Purpose

Executive Conversation Intelligence is the ephemeral adapter between an evolving executive conversation and Discovery's organizational intelligence. It answers only:

> What is happening in this conversation?

It does not decide what the organization should do, create organizational truth, or replace the Cognitive Operating System, Runtime, Executive Communication, or recommendation pipeline.

```text
Executive message + bounded recent conversation + Organization Runtime
                              ↓
              Executive Conversation Interpreter
                              ↓
             Executive Conversation Interpretation
                              ↓
             existing Ask response composition
```

## Canonical contract

`ExecutiveConversationRequest` carries the current executive message, a caller-bounded recent conversation, and the current Organization Runtime. `ExecutiveConversationInterpretation` describes:

- executive objective and intent;
- active and discarded hypotheses;
- unresolved questions;
- assumptions and ambiguity;
- interpretation confidence;
- the next conversational action.

Allowed conversational actions are `clarify`, `challenge`, `explain`, `summarize`, `explore`, `recommend`, and `wait`. They guide communication behavior; they are not organizational recommendations.

The provider-independent `ExecutiveConversationInterpreter` interface owns interpretation. Sprint 108 introduced `MockConversationInterpreter` as a deterministic benchmark provider. Sprint 109 adds one experimental OpenAI implementation behind the same contract without changing Ask.

## Lifecycle and boundaries

Interpretations are ephemeral values. They are never written to Runtime, organizational memory, evidence, recommendations, or Session Impact. The interpreter receives Runtime as read-only context; organizational reasoning remains owned by existing production producers.

Conversation interpretation is advisory. It is not organizational intelligence or a source of truth, and it may be wrong. Discovery must degrade safely when interpretation is missing or rejected. Provider-backed interpretations require schema validation before Ask may consume them; the deterministic mock remains the regression oracle for the adapter contract.

Ask remains the executive-facing response composer. With an interpretation, Ask combines the conversational objective with existing Runtime-backed meaning. Without one, `buildAskExperienceView(runtime)` follows its prior Runtime-only behavior.

The `CONVERSATION_INTERPRETER` feature flag accepts:

- `none` — default Runtime-only behavior;
- `mock` — deterministic interpretation for development and benchmark use.
- `openai` — experimental provider interpretation with direct safe fallback to `none`.

Unsupported values resolve to `none`.

## Example

For “Actually, I now prefer delegated authority in Option B” after discussing centralization, the mock produces:

```text
objective: Re-evaluate the changed direction: Actually, I now prefer delegated authority in Option B
intent: reflect
active hypothesis: Actually, I now prefer delegated authority in Option B
discarded hypothesis: I prefer centralizing operating decisions in Option A.
confidence: 0.8
recommended conversational action: wait
```

This interpretation describes the conversation. It does not assert that delegated authority is the correct organizational choice.

## Benchmark observability

Every Executive Collaboration Lab turn records three separate artifacts:

1. executive message and bounded prior context;
2. conversation interpretation;
3. composed executive response.

This makes interpretation, organizational reasoning, and response-composition failures distinguishable while preserving deterministic replay, scenario-order independence, organization isolation, and Runtime restoration.

The Runtime-only score (`65.21 / 100`) remains the actual current fallback baseline. The deterministic mock score (`90.36 / 100`) is a controlled-interpreter baseline demonstrating the potential value of turn-aware interpretation. It is not evidence of live-provider quality, unseen-conversation generalization, or a final AI-enabled score. Future provider results must be reported separately.

## Provider experiment

Sprint 109 uses the repository's existing OpenAI HTTPS convention. The model is configurable through `OPENAI_CONVERSATION_MODEL`, then `OPENAI_MODEL`, and otherwise defaults to the existing low-cost `gpt-4o-mini` convention. Credentials come only from `OPENAI_API_KEY`; they are never embedded in code, prompts, or logs.

The versioned `executive-conversation-interpretation-v1` prompt asks the provider to analyze conversation rather than organizational truth. It contains no benchmark scenarios or expected answers. Provider output is accepted only after strict schema validation. Unknown fields or enum values, missing fields, malformed JSON, invalid confidence, excessive lists, empty output, refusals, and organizational recommendations are rejected. Rejected output falls directly back to `none`; the deterministic mock is never an operational fallback.

### Conversation bounds

- most recent six turns;
- 1,000 characters per prior turn;
- 2,000 characters for the current message;
- 8,000 characters for the complete serialized request;
- four discarded hypotheses;
- five unresolved questions, assumptions, and ambiguity items each.

The most recent turns are preserved when truncation is required.

### Data boundary

The provider receives only:

- the current participant message;
- the bounded recent conversation;
- organization name;
- up to three current priority or condition labels;
- one selected current-understanding statement when available.

The provider does not receive the organization identifier, complete Runtime, recommendations, decisions, evidence collections, cognitive traces, confidence history, Session Impact, API credentials, or unrelated internal objects. The organization name, conversation, and selected context may still be confidential; enabling the experiment is therefore an explicit deployment choice.

The adapter does not configure or claim provider retention, residency, or compliance guarantees. Those settings remain properties of the selected provider account and deployment configuration and must be reviewed before rollout. Development observability stores only provider name, model, prompt version, status, fallback reason, latency, token counts, and sanitized request-size metadata. Raw prompts and API keys are not logged by the adapter.

### Failure behavior

Missing credentials, timeouts, rate limits, provider HTTP errors, refusals, empty output, malformed JSON, schema failures, and network errors all degrade to the prior Runtime-only Ask response. The fallback reason remains ephemeral observability metadata and is never written to Runtime.

## Prompt Version 1 live baseline

Sprint 109 completed the first live OpenAI `gpt-4o-mini` evaluation using frozen prompt `executive-conversation-interpretation-v1`:

- development: `78.93 / 100`;
- held-out: `77.85 / 100`;
- combined: `78.49 / 100`;
- 30 successful calls;
- zero fallbacks, schema repairs, invalid outputs, or critical failures.

Prompt Version 1 is frozen as the canonical live-provider baseline. `none` remains the default, `mock` remains the deterministic regression oracle, and `openai` remains experimental and feature-flagged. No Runtime, cognition, recommendation, decision, or persistence authority was transferred to the provider.
