# Discovery Canon
Version: Sprint 16
Status: Active
Last Updated: July 3, 2026

---

# Mission

Discovery is not an AI chatbot.

Discovery is an Understanding Engine.

Its purpose is to transform fragmented organizational information into coherent understanding that leaders can trust.

The long-term vision is to become an organization's evolving understanding—not simply its knowledge base.

---

# Core Product Principles

## CEO First

Everything should answer one question:

"What does the CEO need to understand next?"

Do not optimize for analysts first.

---

## Progressive Disclosure

This is canon.

The interface should never overwhelm the user.

Default views should contain only enough information to answer the next question.

Everything else should be expandable.

Examples:

• Executive Summary
• Supporting Understandings
• Trace Understanding
• Evidence
• Contradictions
• Past Insights

Long explanations should remain hidden until requested.

---

## Understanding Before Explanation

Discovery should produce understanding first.

Reasoning comes afterward.

The experience should feel like:

"I understand."

followed by

"Show me why."

not the reverse.

---

## Living Understanding

The organism is not decoration.

It is a living visualization of the understanding engine.

It should evolve as understanding evolves.

Future versions may include:

• Stable understanding patterns
• Persistent organizational memory
• Cross-investigation evolution
• Emerging whirlpools
• Understanding health

These are future phases.

---

## Current Product Scope

Current focus:

Build the best investigation engine possible.

Future phases include:

• Persistent understanding
• Organizational continuity
• Department understanding
• Enterprise organism
• Long-term evolution

Do not sacrifice current utility for future features.

---

# UX Canon

Current UI direction:

Dark premium executive briefing.

Layout:

Left
• Executive Summary
• Supporting Understandings
• Expandable reasoning
• Past insights

Right
• Living Understanding Organism

Bottom
• Investigation status

The organism should remain visible at all times.

Avoid large walls of text.

---

# Engine Philosophy

Information

↓

Evidence

↓

Signals

↓

Themes

↓

Beliefs

↓

Contradictions

↓

Causal Chains

↓

Executive Understanding

↓

Understanding Organism

The executive understanding is the primary output.

Everything else supports it.

---

# Current Architecture

Engine

engine/
    discoveryV3/
        index.ts
        parse.ts
        observations.ts
        signals.ts
        workspace.ts
        themes.ts
        beliefs.ts
        contradictions.ts
        causalChains.ts
        understanding.ts
        executiveUnderstanding.ts
        types.ts

API

app/api/discovery-lab/

Frontend

app/discovery-lab/

Components

components/results/

components/organism/

components/trace/

Future architecture should continue separating:

Engine

UI

Visualization

Interaction

---

# Organism Rules

The organism represents understanding.

NOT data.

NOT evidence.

NOT documents.

Particles represent meaningful structures such as:

• Beliefs
• Themes
• Evidence
• Contradictions
• Causal chains

The organism should become:

more connected

more stable

more coherent

as understanding improves.

---

# Coding Rules

Always preserve architecture.

Prefer incremental improvements.

One sprint at a time.

One feature at a time.

Maintain zero TypeScript errors.

Never break working features for cosmetic improvements.

When requested, generate complete files.

---

# Sprint Workflow

1. Define sprint goal

2. Build feature

3. Fix errors

4. Test

5. Reach zero TypeScript errors

6. Commit

7. Update this document

Repeat.

---

# Current Sprint

Sprint 16

Goal:

Continue evolving the Living Understanding Organism.

Current objectives include:

• Interactive organism
• Better particle relationships
• Organism viewer improvements
• Particle selection
• Dynamic behavior

---

# Product Positioning

Discovery creates organizational understanding.

Key ideas:

• Organizational continuity

• Organizational memory

• Understanding survives personnel changes

• "When people leave, understanding stays."

---

# Long-Term Vision

Discovery eventually becomes an organization's understanding layer.

Departments build understanding.

Executives consume understanding.

The organization evolves over time.

The understanding becomes a living asset.

---

# Future Engines

Investigation Engine

↓

Understanding Engine

↓

Persistent Understanding Engine

↓

Organizational Memory Engine

↓

Prediction Engine

↓

Stewardship Engine

---

# Development Preferences

Default to step-by-step instructions.

Prefer complete file rewrites when requested.

Keep UI modern and minimal.

Optimize for executive comprehension.

Favor clarity over cleverness.

Build the foundation first.

Everything else can evolve later.

---

# Before Every Sprint

Ask:

Does this improve understanding?

Does this improve trust?

Does this improve executive decision making?

If not, reconsider building it.