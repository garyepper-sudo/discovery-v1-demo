# Cognition Engine

Sprint 20 introduced the Cognition Engine.

This layer is responsible for persistent organizational learning over time.

## Purpose

The investigation engine analyzes one upload.

The cognition engine updates the organization’s evolving understanding.

```txt
Organizational Event
  → Investigation Output
  → Persistent Observations
  → Persistent Beliefs
  → Understanding Delta
  → Understanding Event
  → UnderstandingState
  → Organism Evolution

  ## Known limitation

Current similarity logic uses lightweight word overlap and temporary keyword expansion.

This is good enough for Sprint 20 smoke testing, but should later be replaced with a stronger semantic similarity layer.