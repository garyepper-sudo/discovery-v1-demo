# Discovery Experience Alpha

# Scene Eight Specification — Follow

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Stewardship
**Implemented Alpha route:** `/alpha/follow`
**Previous implemented scene:** Respond
**Historical previous concept:** Challenge or Confirm
**Next scene:** Return
**Primary objective:** Transform the Understanding from a one-time insight into an evolving organizational asset that Discovery continuously improves.
**Core trust requirement:** Following means Discovery commits to meaningful stewardship—not notification spam.

This document preserves detailed Alpha design intent. Following is simulated
through deterministic fixture and local prototype state. It does not create a
durable subscription, background learning process, notification service,
organizational-memory update, or Organization Runtime change.

---

# 1. Scene Purpose

Scene Eight answers one simple but profound question:

> **Should Discovery keep learning about this?**

This is arguably the most important product decision in Experience Alpha.

Until this moment, Discovery has helped the user answer a question.

Now Discovery asks permission to continue improving the answer.

The transition is subtle but fundamental.

The user is no longer consuming information.

They are deciding whether this Understanding deserves continuous attention.

If Scene Five creates trust...

Scene Eight creates habit.

---

# 2. Primary User Outcome

The user intentionally chooses to follow the Living Understanding.

The user should believe:

* this Understanding will continue improving;
* Discovery will notify them only when meaningful things change;
* the Understanding now has a life beyond today's session;
* Discovery is taking responsibility for organizational learning;
* returning tomorrow is worthwhile.

The user should not believe:

* they subscribed to notifications;
* they started a monitoring job;
* Discovery will constantly interrupt them;
* following creates additional work.

---

# 3. Primary Discovery Outcome

Discovery records that this Understanding now has an active steward.

Future meaningful learning may:

* improve confidence;
* discover contradictions;
* connect new Understandings;
* recommend investigations;
* refine explanations;
* reduce uncertainty;
* expand scope.

The Understanding becomes part of the user's evolving portfolio.

---

# 4. Emotional Objective

```text
Trust

↓

Commitment

↓

Ownership

↓

Partnership
```

The user should think:

> I want Discovery to keep getting better at understanding this.

---

# 5. Primary Scene Message

## Headline

> Keep learning?

Supporting copy:

> Discovery can continue improving this Understanding and tell you only when something meaningful changes.

The emphasis is:

**learning**

—not—

notifications.

---

# 6. What Following Means

Discovery should explicitly explain:

Following means Discovery will:

* continue evaluating new relevant evidence;
* identify meaningful changes;
* preserve historical versions;
* surface important contradictions;
* recommend high-value next learning.

Discovery will **not**:

* notify for insignificant updates;
* interrupt constantly;
* overwrite historical Understanding;
* silently change conclusions.

---

# 7. Meaningful Change Definition

The Alpha defines five meaningful changes.

Discovery should notify only when one occurs.

1. Confidence changes materially.
2. A new contradiction appears.
3. A stronger explanation replaces the current one.
4. A significant relationship emerges.
5. A recommended investigation becomes high priority.

These are canonical Alpha concepts and candidate product concepts beyond the
Alpha.

---

# 8. Notification Philosophy

Do not ask:

> How often should Discovery notify you?

Instead ask:

> When should Discovery interrupt you?

Default:

> Only when something meaningful changes.

Additional options may include:

* Daily summary
* Weekly summary
* Never interrupt; update when I return

The default should remain:

**Meaningful changes only.**

---

# 9. Follow Confirmation

When the user selects:

> Follow this Understanding

Discovery responds:

> Engineering Productivity is now one of your Living Understandings.

Supporting copy:

> I'll continue improving this Understanding and let you know when something important changes.

No confetti.

No success animation.

Only quiet confidence.

---

# 10. Current State

After following:

Status changes:

```text
Following
```

Additional information:

Started:

Today

Current confidence:

Moderate

Next expected learning:

Compare decision practices in the consistently delivering team.

The page now subtly communicates:

This Understanding has a future.

---

# 11. Suggested Next Understanding

Immediately after following:

Discovery may suggest:

> Understanding Product Prioritization is likely to improve Engineering Productivity.

Expected information gain:

High

Relationship:

Strongly connected

Actions:

* Begin this Understanding
* Not now

Discovery expands naturally through curiosity.

Never through menus.

---

# 12. Future Learning Preview

The user should see an example of what tomorrow could look like.

Example card:

```text
Tomorrow this Understanding might...

Increase confidence

Discover a contradiction

Connect another organizational issue

Recommend a new investigation

Remain unchanged
```

Important:

Remaining unchanged is acceptable.

Discovery should not manufacture novelty.

---

# 13. Visual Treatment

The page should feel calmer than previous scenes.

The user has already done the work.

Now Discovery quietly accepts responsibility.

Whitespace increases.

Motion decreases.

Typography carries the experience.

---

# 14. Primary Actions

Primary:

> Finish

Secondary:

> Begin another Understanding

The experience should encourage another question naturally.

It should not force onboarding loops.

---

# 15. Motion

When Follow is selected:

The Follow button quietly changes to:

Following

The Understanding gains a subtle persistent visual state for the prototype
session. Durable follow state remains future Runtime-integrated behavior.

No dramatic animation.

Suggested duration:

```text
200–300 ms
```

---

# 16. Copy Principles

Preferred language:

* keep learning
* meaningful change
* continue improving
* preserve history
* evolving Understanding
* I'll let you know

Avoid:

* subscribe
* alerts
* monitor
* tracking
* watchlist
* notifications
* automation
* workflow

---

# 17. Accessibility

Following must be:

* keyboard accessible;
* screen-reader announced;
* reversible;
* visually obvious without relying on color.

Announcement example:

> Engineering Productivity is now being followed. Discovery will notify you only when meaningful changes occur.

---

# 18. Component Hierarchy

```text
FollowScene
├── ExperienceFrame
├── UnderstandingSummary
├── FollowExplanation
├── MeaningfulChangeDefinition
├── NotificationPreference
├── FollowConfirmation
├── SuggestedUnderstanding
├── FutureLearningPreview
└── FollowActions
```

---

# 19. Determinism

For Alpha:

Following always results in:

* status = Following
* confidence unchanged
* recommendation = Compare decision practices in reliable team
* suggested Understanding = Product Prioritization

These remain fixed.

---

# 20. Acceptance Criteria

The user should understand:

* what following means;
* what Discovery will do;
* what Discovery will not do;
* when Discovery will interrupt them;
* why another Understanding is suggested;
* that Discovery continues learning even when they leave.

The emotional result should be:

> "I want to come back tomorrow."

---

# 21. Definition of Done

Scene Eight is complete when:

* following feels like stewardship rather than subscription;
* meaningful change is clearly defined;
* the user understands the future value of the Understanding;
* Discovery feels like a long-term research partner;
* the user naturally wants to return.

The final review question is:

> Does following this Understanding feel like beginning a relationship rather than enabling a notification?

Only an unambiguous yes is acceptable.
