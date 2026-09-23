---
name: factory-ship
description: >-
  Experimental workflow for publishing and completing configured software
  delivery work. Use when the user or an enabled factory policy asks to ship.
---

# Factory Ship

Read .agent-factory/config.yaml and the repository's own instructions before
publishing. A user request or enabled policy may authorize a workflow step;
never infer merge or deployment permission from permission to edit code.

## Lifecycle

1. Confirm the target repository, owning worktree, branch, and complete
   task-related change set. Preserve unrelated or incomplete work. Use a
   fresh, automation-owned worktree when the configured scheduler provides one;
   never take over a peer's checkout.
2. Run the configured formatter, tests, and other release checks. Report skipped
   or unavailable checks as such.
3. Publish or open/update a PR only when that action is authorized. Use the
   configured title, body, draft status, labels, and communication rules. Do not
   tag or message people unless enabled.
4. Resolve review feedback against the code and current human direction. Make
   one coherent update and re-run affected checks.
5. Merge only when the independent merge policy is enabled and all criteria
   hold on the unchanged live PR head. Use the host's head-match guard when
   available. If the head changes, repeat the required checks and soak.
6. Verify the merge in the target's current base branch. Check deployment or
   production behavior only when configured; a merge is not live proof.
7. Close linked issues, rotate worktrees, and notify people only at their
   configured proof points.

If a gate is missing, preserve the work and state the exact next action. Do not
convert an external or inconclusive result into success.

