---
name: factory-recover
description: >-
  Experimental workflow for finding and resuming interrupted coding runs. Use
  after an agent host restart or an interrupted automation.
---

# Factory Recover

Read .agent-factory/config.yaml. Recover only the configured project and
workflow types; do not restart every stopped task.

1. Find runs the host identifies as interrupted or incomplete. Read the
   original user request and later messages, not just the run title or summary.
2. Skip work that is active, cancelled, intentionally paused, blocked on a
   person, complete, or ambiguous.
3. Confirm the existing worktree still belongs to that task and inspect its
   current branch, status, and unpublished changes. Preserve all local and
   concurrent work. Do not reset, clean, stash, or attach another task's
   branch.
4. Resume with the original authorization and current user instructions. Do not
   repeat completed writes, replies, approvals, merges, or deploys. Recheck
   external state before retrying an uncertain action.
5. If the original authorization no longer covers the next step, leave the run
   stopped and state the exact decision required.

Report resumed, skipped, and blocked runs with the evidence that determined
each outcome. Notifications follow the separate configured policy.

