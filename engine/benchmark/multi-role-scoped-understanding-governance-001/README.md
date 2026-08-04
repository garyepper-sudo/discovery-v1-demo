# Multi-Role Scoped Understanding and Governance Benchmark 001

Classification target: benchmark-only evaluation of one canonical governed
Organizational Understanding model with multiple permission-safe projections.

Non-interference classification: **B — NARROW CANONICAL DEPENDENCY REQUIRED**.
The benchmark reuses existing canonical owner contracts, supplies only
synthetic manifests and already-resolved benchmark inputs, and fails closed
where recursive scope, role, purpose, sensitivity, historical visibility,
contribution authority, metric lineage, or decision-calibration semantics are
not currently represented. It does not implement those semantics.

Run:

```sh
node --import tsx engine/benchmark/multi-role-scoped-understanding-governance-001/runBenchmark.ts
```

All generated artifacts are deterministic and remain inside `results/`.
Temporary Runtime roots are removed exactly. The runner makes no connector,
Drive, network, Production, deployment, or external-action call.

For a strict zero-network rerun on macOS, execute the same local Node loader
under `sandbox-exec` with `(deny network*)` and set `npm_config_offline=true`,
`npm_config_audit=false`, `npm_config_fund=false`, and
`npm_config_update_notifier=false`. Do not use bare `npx`; package-resolution
fallback is prohibited.
