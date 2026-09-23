---
name: factory-watchdog
description: >-
  Experimental workflow for monitoring explicitly authorized delivery tasks
  and reporting stalled work. Use for scheduled ship follow-through.
---

# Factory Watchdog

Read .agent-factory/config.yaml. Monitor only the configured projects and
authorized delivery handoffs. A task title, branch name, PR, successful check,
or agent summary is not authorization.

## Scan

1. Find candidate tasks through the configured host. Read enough of each
   task's user-authored history to verify the requested scope and any later
   cancellation or change.
2. Skip active work, explicit waits, completed or cancelled work, ambiguous
   ownership, and tasks with no configured delivery authorization.
3. For stopped work, identify its latest task-owned PR, branch, or unpublished
   change. Query the live host state immediately before acting. Verify the PR
   is open and the branch/head match, or verify a named existing worktree has
   task-owned unpublished work.
4. Send a reminder only when the configured notification policy allows it and
   the live evidence shows a specific next step is due. Check recent task
   history for an unchanged reminder. Stay quiet on unchanged waits and
   unavailable state.
5. Keep the task owner responsible for its merge, post-merge verification,
   and cleanup unless the config explicitly assigns those actions elsewhere.

Use the configured destination, wording, cadence, and rate limit. If the host
cannot prove the target or state, do not message; report DONT_NOTIFY when
there is no meaningful change.

