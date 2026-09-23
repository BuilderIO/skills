---
name: factory-feedback
description: >-
  Experimental workflow for collecting and triaging configured product
  feedback, error reports, and issue trackers. Use during a feedback sweep.
---

# Factory Feedback

Read .agent-factory/config.yaml and work only the enabled sources and scopes.
Do not assume a Slack channel, issue tracker, error service, project, reporter,
or product owner.

## Sweep

1. Enumerate each configured source with its native cursor or complete list.
   Record whether it was read successfully. Unavailable, truncated, and empty
   are distinct outcomes; never report an unreadable source as having no items.
2. Carry forward unresolved items using the source's durable state when
   available. Deduplicate related reports without discarding their links,
   reporters, or status.
3. Claim work in the source when its configured workflow provides a safe claim
   marker. Read back the marker before investigating; never alter another
   worker's marker.
4. Read the full report and relevant discussion. Classify it as a verified
   defect, subjective UX request, feature request, duplicate, out of scope, or
   needing more evidence.
5. Fix only items allowed by the configured implementation criteria and
   repository ownership. Otherwise record why they were held and the exact
   information or human decision needed.
6. Verify the changed behavior using the configured checks. A code change,
   merge, or test alone is not live behavior proof.
7. Apply reply, issue-close, and escalation policies independently. Use the
   configured reply guidance verbatim as intent: tone may be customized or
   replies may be disabled. Close or mark fixed only at the configured proof
   point; never imply publication or live verification that did not happen.
8. Leave one disposition per item and summarize source counts, unavailable
   sources, work done, replies or closures, and blockers.

Unknown feature scope or subjective product direction stays with a human unless
the configuration explicitly defines an approval signal and its owner. A
reporter's request alone is not product authorization.

