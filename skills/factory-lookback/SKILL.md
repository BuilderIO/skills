---
name: factory-lookback
installer-group: factory
description: >-
  Experimental workflow for auditing recurring feedback, telemetry, errors,
  and brittle delivery paths to find systemic fixes. Use for periodic or
  requested cross-source lookbacks, not routine single-item intake.
---

# Factory Lookback

Read `.agent-factory/config.yaml` and apply the optional
`skill_prompts.factory-lookback` entry as additional project guidance. Use this
workflow when asked to look back across a bounded period or when an enabled
`workflows.lookback` automation runs. Its purpose is to find patterns that
normal item-by-item flows keep missing or fixing only temporarily.

## Build a bounded evidence set

1. Confirm the configured sources, scope, time window, comparison period, and
   output policy before querying. Use only connected sources the host can read.
2. Enumerate the full configured range, follow every page or cursor, and record
   source filters, dates, counts, and unavailable or truncated sources. Do not
   report a complete lookback when coverage is partial.
3. Include relevant feedback, analytics or telemetry, runtime errors,
   recurring CI or review failures, repeated recovery attempts, replies to
   earlier information requests, and prior fixes marked shipped or verified
   when those records are available.
4. Cluster records by underlying symptom and affected boundary, not wording
   alone. Keep event counts, affected users or sessions, time range, versions,
   and distinct source links separate; do not infer identity or impact from
   unstable identifiers.

## Find the systemic cause

For each recurring cluster, trace representative reports to their original
source and inspect prior dispositions, commits, tests, and release evidence.
Check whether the symptom recurred after a claimed fix, appeared through a
sibling caller, or escaped because the normal workflow lacked a signal, owner,
verification step, or recovery path.

For a report previously held for more information, inspect the full source
thread for new replies. Re-triage the original report with the new details and
check whether the normal fix flow now has enough evidence to proceed. Keep the
item open when the answer is still incomplete; do not treat a reply as a fix or
as permission for another action.

Reproduce a representative current case when possible. Trace related callers
and surfaces to the shared boundary that can explain the evidence. Prefer one
verified correction at that boundary over a pile of caller-specific patches.
Separate confirmed causes from hypotheses, and state what evidence would
disprove each proposed explanation.

## Change and verify

Use `workflows.lookback.implement` to decide whether to recommend only, prepare
a fix, or publish an authorized change. A recurring pattern is evidence for
investigation, not automatic permission to edit code or take an external
action. Keep reply, issue closure, PR approval, merge, deployment, and
notification under their own configured policies.

When implementation is allowed, make the smallest systemic fix that addresses
the confirmed cause. Add or update a regression check at the boundary, exercise
the representative failure and relevant sibling paths, and inspect the same
signals again after the fix. A test, merge, or “fixed” label alone does not
prove that the live recurrence stopped.

## Report

For each pattern, report:

- the source links, date range, query coverage, counts, and impact evidence;
- prior fixes or dispositions and whether the symptom returned;
- information requests, answers received, and whether they changed the
  evidence or next step;
- confirmed cause, alternatives still uncertain, and the shared boundary;
- recommended or completed systemic change, regression proof, and remaining
  rollout or live-verification work;
- independent reply, close, publish, approval, merge, deployment, and notify
  decisions, plus any exact human decision required.

Do not treat unavailable telemetry or an incomplete history as evidence that a
pattern does not exist.
