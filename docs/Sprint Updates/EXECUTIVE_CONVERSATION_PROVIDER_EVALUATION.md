# Executive Conversation Provider Evaluation

## 1. Executive Summary

Sprint 109 tested whether one live OpenAI model could interpret an evolving organizational conversation through Discovery's Sprint 108 adapter boundary. OpenAI `gpt-4o-mini`, using frozen Prompt Version 1, improved the combined Executive Collaboration score to `78.49 / 100` in the first successful run while preserving Runtime, organization identity, model stewardship, recommendation behavior, actions, and Session Impact.

The provider boundary worked as intended: OpenAI described the conversation, Discovery retained ownership of organizational reasoning, and Ask retained ownership of executive-facing response composition. The interpretation remained ephemeral and never entered Runtime.

A later reproduction scored `80.63 / 100` combined. Both runs are retained because the difference is evidence of live-provider variance, not a reason to overwrite the first canonical baseline.

## 2. Architectural Boundary

```text
Participant message
+ bounded recent conversation
+ minimized read-only organizational context
→ OpenAIConversationInterpreter
→ validated ExecutiveConversationInterpretation
→ existing Ask response composition
```

- The provider interprets conversation.
- Discovery owns organizational reasoning and truth.
- Ask owns executive-facing response composition.
- Interpretation is advisory and ephemeral.
- Interpretation never enters Runtime, recommendations, decisions, evidence, or persistence.

## 3. Baseline Comparison

| Mode | Development | Held-out | Combined | Meaning |
|---|---:|---:|---:|---|
| Runtime-only | 65.21 | — | — | Existing behavior without conversation interpretation |
| Controlled mock | 90.36 | — | — | Deterministic architectural control, not live quality |
| OpenAI `gpt-4o-mini` | 78.93 | 77.85 | 78.49 | First live provider baseline |

The first live result is the canonical Prompt Version 1 baseline. The reproduction result was:

| Run | Development | Held-out | Combined |
|---|---:|---:|---:|
| Original live baseline | 78.93 | 77.85 | 78.49 |
| Reproduction | 78.49 | 83.85 | 80.63 |

The reproduction improved by `2.14` combined points, driven by a `6.00`-point increase on the four held-out scenarios while development declined by `0.44`. Prompt, model alias, scenarios, schema, context limits, and scoring were unchanged. The movement is therefore recorded as live interpretation variance.

## 4. Dimension Comparison

| Dimension | Runtime-only | Controlled mock | Live provider |
|---|---:|---:|---:|
| Executive understanding | 3.33 / 15 | 14.17 / 15 | 8.50 / 15 |
| Question quality | 8.00 / 10 | 8.00 / 10 | 8.00 / 10 |
| Collaborative reasoning | 8.00 / 15 | 14.50 / 15 | 11.10 / 15 |
| Constructive challenge | 5.33 / 10 | 8.00 / 10 | 5.80 / 10 |
| Conversational continuity | 5.72 / 10 | 10.00 / 10 | 9.07 / 10 |
| Model stewardship | 13.33 / 15 | 13.33 / 15 | 14.00 / 15 |
| Recommendation quality | 8.00 / 10 | 8.00 / 10 | 8.00 / 10 |
| Action handoff | 5.00 / 5 | 5.00 / 5 | 5.00 / 5 |
| Session Impact accuracy | 5.00 / 5 | 5.00 / 5 | 5.00 / 5 |
| Executive trust | 3.49 / 5 | 4.36 / 5 | 4.03 / 5 |

The provider materially improved executive understanding, collaborative reasoning, continuity, and trust while preserving stewardship and recommendation behavior. Constructive challenge remains the clearest measured weakness.

## 5. Held-Out Generalization

The held-out set covers:

1. a functional manager describing a cross-team delivery problem;
2. an ambiguous concern without a clear request;
3. conflicting claims across turns;
4. one message combining measured evidence and causal interpretation.

The first-run held-out score of `77.85` provides preliminary evidence that the provider can generalize beyond the six development conversations. Four scenarios are not sufficient to claim broad generalization.

## 6. Provider Reliability

First successful live run:

- 30 successful calls;
- 0 fallbacks;
- 0 schema repairs;
- 0 invalid outputs;
- 0 critical failures;
- Runtime artifacts restored;
- organization isolation preserved.

The reproduction also completed 30 of 30 calls with zero fallbacks, schema repairs, invalid outputs, or critical failures.

## 7. Latency and Usage

First successful run:

- average latency: `2,050 ms`;
- average input: `411` tokens per interpreted turn;
- average output: `159` tokens per interpreted turn.

Reproduction:

- average latency: `2,193 ms`;
- average input: `411` tokens;
- average output: `158` tokens.

Measured first-run token projections:

| Usage | Input tokens | Output tokens |
|---|---:|---:|
| One turn | 411 | 159 |
| 15 turns | 6,165 | 2,385 |
| 30 turns | 12,330 | 4,770 |
| 100 users/month at 30 turns | 1,233,000 | 477,000 |
| 1,000 users/month at 30 turns | 12,330,000 | 4,770,000 |

## 8. Cost

The official [GPT‑4o mini model documentation](https://developers.openai.com/api/docs/models/gpt-4o-mini) lists text pricing at `$0.15` per million input tokens and `$0.60` per million output tokens.

| Usage | Input cost | Output cost | Total |
|---|---:|---:|---:|
| One interpreted turn | $0.0000617 | $0.0000954 | $0.0001571 |
| 15-turn conversation | $0.0009248 | $0.0014310 | $0.0023558 |
| 30-turn conversation | $0.0018495 | $0.0028620 | $0.0047115 |
| 100 users/month at 30 turns | $0.1849500 | $0.2862000 | $0.4711500 |
| 1,000 users/month at 30 turns | $1.8495000 | $2.8620000 | $4.7115000 |

These are conversation-interpretation costs only. They exclude organizational reasoning, storage, hosting, retries, and outbound response generation.

## 9. Privacy and Data Boundary

Data sent to the provider:

- current participant message;
- six bounded recent turns;
- organization name;
- up to three condition or priority labels;
- one selected current-understanding statement.

Data not sent:

- organization ID;
- complete Runtime;
- evidence collections;
- recommendations;
- decisions;
- cognitive traces;
- confidence history;
- Session Impact;
- API credentials;
- unrelated internal objects.

The adapter logs only sanitized provider metadata. It does not log raw prompts or API keys. Provider retention, residency, and compliance settings remain deployment-account concerns and are not asserted by Discovery.

## 10. Measured Weaknesses

Remaining warnings concern:

- insufficient scenario-specific meaning coverage;
- repeated projected response in some changing-turn scenarios;
- insufficient challenge of weak assumptions.

Interpretation quality owns intent, hypothesis, ambiguity, and conversational-action classification. Ask composition owns how validated interpretation and Runtime meaning become a relevant response. Benchmark semantics own whether keyword coverage accurately represents useful meaning. These boundaries should remain separate during future optimization.

## 11. Decision

Approve limited experimental provider use behind the existing feature flag.

Constraints:

- `none` remains the default;
- Prompt Version 1 remains frozen as the canonical baseline;
- deterministic `mock` remains the regression oracle;
- no outbound AI response rewriting is authorized;
- no organizational truth, recommendation authority, decision authority, or persistence is delegated to the provider.

## 12. Next Experiment

Evaluate Prompt Version 2 focused on constructive challenge and scenario-specific meaning coverage while preserving Prompt Version 1 unchanged as the canonical comparison baseline. Do not change Runtime, cognition, recommendations, or organizational reasoning.
