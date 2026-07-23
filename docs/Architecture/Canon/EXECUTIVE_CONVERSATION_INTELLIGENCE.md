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

The provider-independent `ExecutiveConversationInterpreter` interface owns interpretation. Sprint 108 implements only `MockConversationInterpreter`, a deterministic benchmark provider. Future providers must implement the same contract without changing Ask.

## Lifecycle and boundaries

Interpretations are ephemeral values. They are never written to Runtime, organizational memory, evidence, recommendations, or Session Impact. The interpreter receives Runtime as read-only context; organizational reasoning remains owned by existing production producers.

Conversation interpretation is advisory. It is not organizational intelligence or a source of truth, and it may be wrong. Discovery must degrade safely when interpretation is missing or rejected. Provider-backed interpretations require schema validation before Ask may consume them; the deterministic mock remains the regression oracle for the adapter contract.

Ask remains the executive-facing response composer. With an interpretation, Ask combines the conversational objective with existing Runtime-backed meaning. Without one, `buildAskExperienceView(runtime)` follows its prior Runtime-only behavior.

The `CONVERSATION_INTERPRETER` feature flag accepts:

- `none` — default Runtime-only behavior;
- `mock` — deterministic interpretation for development and benchmark use.

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
