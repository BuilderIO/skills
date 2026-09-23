# `/factory-babysit-pr`

Monitor one explicitly authorized pull or merge request. Each pass checks its
live head, review threads, required checks, and mergeability. Fixes, publishing,
replies, approvals, merges, and soak requirements each have separate gates.

Use `/factory-review-prs` for a PR queue and `/factory-watchdog` for stopped
delivery work that needs a verified reminder.

Configure the exact host, repository, PR, authorization, cadence, worktree, and
action policies with `/factory` in `.agent-factory/config.yaml`. See the
[Factory configuration reference](../../docs/factory/configuration.md#workflowspr-babysitting).

## Install

```sh
npx @agent-native/skills@latest add
```

Select **Factory** to preselect its modules, remove any modules you do not
want, then choose the supported client and install scope.
