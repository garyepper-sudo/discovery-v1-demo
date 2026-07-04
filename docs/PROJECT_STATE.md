# Discovery — Project State
Last Updated: Sprint 19 Complete

---

# Vision

Discovery is no longer just an investigation engine.

Discovery is evolving into a Living Organizational Understanding Engine.

Rather than analyzing individual document uploads independently, Discovery continuously develops and maintains an evolving understanding of an organization.

Every upload changes the organization's internal model.

The primary product is no longer an investigation.

The primary product is organizational understanding.

---

# Product Philosophy

Traditional AI answers:

> "What does this document say?"

Discovery answers:

> "How has our understanding of the organization changed?"

Every upload becomes another observation that either:

- reinforces understanding
- weakens understanding
- creates new understanding
- resolves uncertainty

Discovery behaves more like a scientist than a chatbot.

---

# Canon UX Principles

## Progressive Disclosure

The interface should never overwhelm the user.

Only show enough information to answer the next question.

Everything else unfolds naturally.

---

## Executive First

Executives want conclusions.

Not evidence.

Not graphs.

Not reading.

The UI should always begin with:

Current Understanding

then naturally unfold:

Why

How

Confidence

Unknowns

Revisions

Evidence

Trace

---

## Notebook Experience

The new workspace is a narrative notebook.

Users scroll through one evolving understanding instead of switching between disconnected tabs.

Navigation acts as chapter markers rather than page navigation.

---

## Organism Philosophy

The organism is NOT a graph.

The organism represents living organizational understanding.

Nodes represent evolving beliefs.

Connections represent relationships between understandings.

Node behavior should evolve over time.

The organism should visibly grow as Discovery learns.

---

# Current Engine

Current pipeline:

Upload
↓

Evidence

↓

Themes

↓

Contradictions

↓

Mechanisms

↓

Beliefs

↓

Executive Understanding

This engine is stable.

It now becomes one stage inside a larger learning system.

---

# Next Major Architecture

Discovery now needs persistent understanding.

Introduce:

UnderstandingState

Persistent representation of the organization's current understanding.

Contains:

- beliefs
- themes
- mechanisms
- uncertainties
- organism
- confidence
- history

This object survives between uploads.

---

# Evolution Engine

New engine:

Existing UnderstandingState

+

New Investigation

↓

UnderstandingDelta

↓

Updated UnderstandingState

↓

Updated Organism

↓

Executive Change Narrative

---

# Understanding Delta

Every upload should produce an UnderstandingDelta.

Possible outputs include:

New Beliefs

Strengthened Beliefs

Weakened Beliefs

Resolved Beliefs

New Themes

Resolved Themes

New Contradictions

Resolved Contradictions

Confidence Changes

Organism Changes

Executive Narrative

The delta becomes the heartbeat of Discovery.

---

# Organism Evolution

The organism should evolve instead of reset.

Uploads should:

Grow nodes

Shrink nodes

Strengthen connections

Remove obsolete relationships

Highlight new understanding

Represent stable patterns visually.

---

# Stable Understanding

Understanding becomes stable through repeated reinforcement.

Discovery should detect:

Repeated observations

Repeated mechanisms

Repeated strategic themes

Repeated executive concerns

Long-term stability is significantly more valuable than one-time insight.

---

# Executive Experience

The future executive briefing begins with:

What's Changed

instead of

Summary

Possible output:

+ Three beliefs strengthened

+ One uncertainty resolved

+ Two new strategic themes emerged

+ Confidence increased

+ Organism evolved

Only then does Discovery explain the current understanding.

---

# Current Sprint Status

Sprint 19 Complete.

Major accomplishments:

✓ Narrative notebook workspace

✓ Executive understanding chapters

✓ Premium workspace navigation

✓ Progressive disclosure workspace

✓ Notebook component architecture

✓ Living Understanding product vision established

The UI is now sufficiently mature.

Future effort shifts toward engine evolution.

---

# Sprint 20 Goal

Build the first version of persistent organizational understanding.

The UI should now follow the engine—not lead it.

# Project State — Discovery

## Current Sprint

Sprint 20 — Living Understanding Engine

## Major Architectural Pivot

Discovery is no longer being optimized as a one-upload document analysis tool.

The product is now evolving into a Living Organizational Understanding Engine.

The existing V3 investigation pipeline remains intact:

```txt
Evidence
  → Themes
  → Contradictions
  → Mechanisms
  → Beliefs
  → Executive Understanding