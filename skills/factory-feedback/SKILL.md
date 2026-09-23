---
name: factory-feedback
installer-group: factory
description: >-
  Experimental workflow for collecting and triaging configured product
  feedback, error reports, and issue trackers. Use during a feedback sweep.
---

# Factory Feedback

Read only the sources and scopes enabled in `.agent-factory/config.yaml`. See
the [Factory configuration reference](https://github.com/BuilderIO/skills/blob/main/docs/factory/configuration.md) for source fields and policy examples.

## Collect

- Enumerate each source completely using its native cursor or full-list
  operation. Track `empty`, `unavailable`, and `truncated` separately.
- Carry unresolved items forward from durable source state when available.
  Deduplicate related reports without losing links, reporters, or status.
- Claim an item only when the source provides a safe claim marker. Read the
  marker back and never alter another worker's claim.
- Read the full report and relevant discussion before deciding what it means.

## Triage and fix

Classify each item as a verified defect, subjective UX request, feature request,
duplicate, out of scope, or needing more evidence.

Implement only when the configured allow conditions and repository ownership
match. Stop for the configured risk conditions, uncertain scope, or unclear
product intent. Verify changed behavior with the configured checks. A code
change, merge, or test alone is not proof that live behavior changed.

## External actions

| Action | Rule |
| --- | --- |
| Reply | Follow the separate reply policy and configured tone/guidance; `never` means no public reply. |
| Close or mark fixed | Wait for the configured proof point, such as source merge. Do not imply an unverified release. |
| Escalate | Follow the configured owner and destination. A reporter's request is not product authorization. |

## Report

Give one disposition per item. Summarize source counts, unavailable or
truncated reads, classifications, fixes and checks, replies or closures, and
any exact human decision needed.
