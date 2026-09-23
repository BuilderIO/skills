---
name: factory-ship
installer-group: factory
description: >-
  Experimental workflow for publishing and completing configured software
  delivery work. Use when the user or an enabled factory policy asks to ship.
---

# Factory Ship

> Start with the [Factory guide](../../docs/factory/README.md) for workflow
> setup and configuration.

Read `.agent-factory/config.yaml`, the optional
`skill_prompts.factory-ship` entry, and the repository's instructions before
publishing. See the [Factory configuration reference](https://github.com/BuilderIO/skills/blob/main/docs/factory/configuration.md). The prompt adds project guidance; editing code does not by itself authorize a PR update, approval, merge, or deployment.

## Delivery steps

1. **Confirm ownership.** Identify the target repository, task-owned worktree,
   branch, and complete task-related change set. Preserve unrelated changes.
   Use a clean automation-owned worktree when the scheduler provides one; never
   take over a peer's checkout.
2. **Verify changes.** Run the configured formatter, tests, and release checks.
   Report checks that were skipped or unavailable.
3. **Publish when enabled.** Open or update a PR only when authorized. Apply
   configured title, body, draft status, labels, and communication rules. Do
   not tag or message people unless enabled.
4. **Resolve feedback.** Compare comments with the code and current human
   direction. Make one coherent update, then rerun affected checks.
5. **Apply merge gates.** Merge only under its own enabled policy and while all
   criteria hold on the unchanged live head. Use a head-match guard when the
   host supports it. A head change invalidates tied evidence and resets the
   soak.
6. **Verify and close out.** Confirm the merge in the current base branch.
   Verify deployment only when configured; a merge is not live proof. Close
   issues, rotate worktrees, and notify only at their configured proof points.

## Stop conditions

Hold the work when ownership, authorization, a required check, or live host
state is missing or unclear. State the exact next step; do not turn an
inconclusive result into success.
