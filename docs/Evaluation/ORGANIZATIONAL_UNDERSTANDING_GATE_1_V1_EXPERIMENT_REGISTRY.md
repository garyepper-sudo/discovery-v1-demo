# Organizational Understanding Gate 1 V1 Experiment Registry

| Field | Value |
| --- | --- |
| Experiment | `organizational-understanding-gate1-v1` |
| Status | Completed; independently evaluated and accepted for bounded Gate 1 research use |
| Candidate | `gpt-6-astra`, ultra reasoning, fresh context per packet |
| Call budget | 12 maximum; retries 0 |
| Worlds | Three independently authored synthetic worlds, six governed public source bodies each |
| Scenarios | 12: baseline, selective change/withheld source, temporal state, contradiction/origin |
| Candidate disclosure | Generic source labels and line numbers only; no filenames, answer keys, expected conclusions, intervention names, prior outputs, or benchmark-state metadata |
| Output location | Private task-owned filesystem only |
| Acceptance | `ACCEPT_GATE_1_V1`: B1 grounding, B2 chronology/temporal state, B3 contradiction/disagreement, and selective intervention passed across 12 responses; the content-safe aggregate recorded 0.97 citation support and zero material unsupported claims, withheld-source leakage, future-information contamination, historical overwrite, invented reconciliation, duplicate-origin confidence inflation, or seniority-as-evidential-authority. The result remains bounded to the frozen synthetic worlds. |

Run packet preparation with `npm run experiment:organizational-understanding-gate1-v1`. The command writes packets, extractive baselines, and a manifest to `DISCOVERY_GATE1_PACKET_OUTPUT_DIR` or `/private/tmp/discovery-gate1-research-packets`. The candidate interface is one fresh request for each packet's `modelRequest` object; return a JSON object conforming to `gate1-structured-candidate/v1`. Do not send the internal packet object, packet manifest, or any hidden evaluation material to the candidate.

The evaluator records structural citation closure locally. Luna's frozen answer key independently assesses grounding, temporal coherence, contradictions, selective responsiveness, and executive usefulness. Failures map first to source admission, permission-scoped selection, body loading, entity continuity, temporal representation, epistemic representation, contradiction representation, packet composition, candidate reasoning, output validation, or executive projection. No architecture conclusion is authorized unless the same recoverability failure recurs across two independently authored worlds.
