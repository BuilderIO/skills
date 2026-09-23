# Factory configuration reference

[Back to the Factory guide](README.md).

> **Experimental:** This is an agent-readable configuration convention, not a
> schema or parser. The Factory skills read the file as project policy. A field
> cannot create an integration, grant permission, or prove a host automation was
> saved.

Keep the file at `.agent-factory/config.yaml` in the project the workflows
should operate on. Run `/factory` to configure it interactively; it preserves
existing choices and asks about missing ones.

## Quick start

This example reads from several common source types and only permits fixes that
match the stated criteria. Replace the scopes and policies with your own.

```yaml
version: 1
timezone: UTC

repositories:
  - id: app
    provider: github
    remote: example/project
    worktree:
      mode: fresh-per-run
      base: origin/main

sources:
  - id: chat-feedback
    provider: slack
    type: feedback
    scope: channel-id
  - id: code-issues
    provider: github
    type: issue
    scope: example/project
  - id: tracker-issues
    provider: jira
    type: issue
    scope: PROJECT
  - id: error-reports
    provider: sentry
    type: error
    scope: organization/project
  - id: product-events
    provider: custom
    type: telemetry
    scope: example/project
    integration: analytics-mcp
    read_tool: query_events
    arguments:
      project: example
      since: last 30 days

workflows:
  collect:
    enabled: true
    schedule: every 4 hours
    sources: [chat-feedback, code-issues, tracker-issues, error-reports, product-events]
    implement:
      mode: criteria
      allow: [verified defects in owned code]
      stop: [security-sensitive changes, unclear product intent]
    reply:
      mode: criteria
      require: [one missing detail blocks triage or verification]
      tone: warm, clear, and concise
      guidance: Ask one targeted question, then re-triage when an answer arrives.
    close:
      mode: never
  lookback:
    enabled: true
    schedule: monthly
    window: last 30 days
    compare_with: previous 30 days
    sources: [chat-feedback, product-events, error-reports]
    implement:
      mode: manual
  human-digest:
    enabled: true
    schedule: weekly
    window: last 7 days
    repositories: [app]
    sources: [chat-feedback, code-issues, error-reports, product-events]
    include: [pull-requests, issues, feedback, errors, telemetry]
    granularity: balanced

skill_prompts:
  factory-ship: |
    Keep release summaries concise and link the verified change.
```

`slack`, `github`, `jira`, and `sentry` are examples, not bundled Factory
connectors. The actual source choices depend on tools your agent host exposes.
See [Add a source](#add-a-source) before configuring another provider.
The `product-events` entry is a placeholder for a connected analytics tool;
replace its integration, query, and scope with the names your host provides.

## Add a source

Factory has no fixed or exhaustive provider list. It can read any source the
host already exposes through a connected integration or MCP/API tool, provided
the tool can enumerate the items and scope you need.

Examples shown in this guide:

| Source type | Example provider | Example scope |
| --- | --- | --- |
| Team feedback | Slack | Channel ID |
| Code issues | GitHub | Repository |
| Work tracking | Jira | Project key |
| Error monitoring | Sentry | Organization and project |
| Product telemetry | Connected analytics or event-query tool | Product, project, and time window |
| Stalled delivery work | Connected task or workflow host | Project, job, or run |
| Custom product feedback | Any connected MCP/API tool | The tool's project, workspace, or query boundary |

To add a custom source, add a `sources[]` entry. Record enough detail to tell
the agent which connected tool to call, what to query, and how to finish
pagination:

```yaml
sources:
  - id: customer-ideas
    provider: custom
    scope: demo-project
    integration: feedback-mcp
    read_tool: search_feedback
    arguments:
      project_id: demo-project
      status: open
    pagination: follow the tool's next-page cursor until exhausted
```

`integration`, `read_tool`, `arguments`, and `pagination` are descriptive
custom fields, not a required schema. Use the names and argument shape exposed
by your connected tool. If the host cannot read a source, connect or build that
integration first; adding YAML or installing Factory will not make the source
available.

Keep secrets in the host's connection or secret store. Config may name a
connection or contain an opaque reference, but never put tokens, passwords,
private URLs, or copied customer records in it. A missing or unreadable source
must be reported as unavailable, not as empty.

## Property reference

The tables below cover the documented v1 convention and the examples in this
page. Properties outside this reference can be used as human-readable,
project-specific policy, but they have no universal meaning until `/factory`
confirms how the host and skills will use them.

### Top level

| Property | Meaning |
| --- | --- |
| `version` | Convention version. Use `1` for this guide. |
| `timezone` | IANA time zone used to interpret schedule text, for example `America/Los_Angeles`. |
| `repositories` | Repositories the configured workflows may inspect or change. |
| `sources` | Feedback, issue, error, or telemetry sources available to workflows. |
| `workflows` | Map of named workflow settings. Each workflow has its own schedule and action policies. |

### `repositories[]`

| Property | Meaning |
| --- | --- |
| `repositories[].id` | Short, unique config name referenced by workflow policy. |
| `repositories[].provider` | Code host or provider label, such as `github`. The agent must already have access to it. |
| `repositories[].remote` | Provider's repository identifier, commonly `owner/repository`. |
| `repositories[].worktree.mode` | Isolation strategy. `fresh-per-run` requests a clean, automation-owned worktree for each code-changing run. Other values are host-specific; don't assume support. |
| `repositories[].worktree.base` | Git ref used to create the worktree, such as `origin/main`. |

Use a clean, automation-owned worktree for code-changing schedules. If the host
cannot provide one, keep the workflow manual rather than borrowing a shared
checkout.

### `sources[]`

| Property | Meaning |
| --- | --- |
| `sources[].id` | Short, unique name referenced by a workflow's `sources` list. |
| `sources[].provider` | Connected provider label, such as `slack`, `github`, `jira`, or `sentry`. Use `custom` for another connected tool. This label does not connect the provider. |
| `sources[].type` | Optional interpretation hint, such as `feedback`, `issue`, `error`, `telemetry`, or `delivery`. It is descriptive policy, not a connector type checked by a parser. |
| `sources[].scope` | Exact channel, repository, project, organization/project, or other boundary to read. Prefer stable IDs when available. |
| `sources[].integration` | Optional custom field naming the connected MCP/API integration. |
| `sources[].read_tool` | Optional custom field naming the read/list operation. |
| `sources[].arguments` | Optional custom map of the exact query arguments or filters. Its child keys depend on the provider tool. |
| `sources[].pagination` | Optional custom description of the cursor or pagination procedure. Read every page before reporting a complete result. |

### Common workflow fields

`workflows` is a map. The documented workflow names are `collect`, `lookback`,
`human-digest`, `pull-requests`, `pr-babysitting`, `ship-watchdog`, and
`recovery`.

| Property | Meaning |
| --- | --- |
| `workflows.<name>.enabled` | Whether the workflow should be active. `false` keeps it disabled. This does not grant permission for any individual action. |
| `workflows.<name>.schedule` | Desired cadence, written in natural language or the host's supported format. `/factory` must report what was actually saved. Without a schedule, do not create a recurring job. |

Schedules vary by host. A cron schedule and a thread heartbeat are different
kinds of automation; `/factory` must preserve the host's semantics and verify
the persisted target, runtime, schedule, and notification settings.

### `workflows.collect`

| Property | Meaning |
| --- | --- |
| `workflows.collect.sources` | IDs from the top-level `sources` list to read for current feedback, telemetry, errors, and issues. |
| `workflows.collect.implement.mode` | Policy for making a fix. `criteria` needs explicit allow and stop conditions; `never` or `manual` keeps fixes human-directed. |
| `workflows.collect.implement.allow` | Conditions that permit implementation, such as confirmed defects in named code areas. |
| `workflows.collect.implement.stop` | Conditions that hold a change for a person, such as security-sensitive work or unclear product intent. |
| `workflows.collect.reply.mode` | Independent policy for public replies. `never` disables replies; a milestone such as `after-fix` means wait for that proof point. |
| `workflows.collect.reply.require` | Conditions that allow a reply, such as when one missing detail blocks triage or verification. |
| `workflows.collect.reply.tone` | Optional voice for enabled replies. |
| `workflows.collect.reply.guidance` | Optional content instructions, such as whether to link the fix. |
| `workflows.collect.close.mode` | Independent issue-closing policy. Example: `after-merge` closes only after the configured merge point; `never` leaves the issue open. |

If an earlier experimental config uses `workflows.feedback`, rename that key
and its nested fields to `workflows.collect`; the skills do not run a config
migration.

### `workflows.lookback`

Use this workflow for a bounded retrospective across sources. It complements
current intake: it compares recurring symptoms, telemetry, error patterns, and
prior fixes to find shared causes the normal item-by-item flow did not resolve.

| Property | Meaning |
| --- | --- |
| `workflows.lookback.sources` | IDs from the top-level source list to compare. Use only connected sources with the required history. |
| `workflows.lookback.window` | Time range to inspect, such as `last 30 days`. State the dates the host actually queried. |
| `workflows.lookback.compare_with` | Optional baseline, such as the previous 30 days, used to distinguish a new increase from a recurring level. |
| `workflows.lookback.focus` | Optional text naming patterns to prioritize, such as reports marked fixed that later recur. |
| `workflows.lookback.implement.mode` | Whether the run may make a systemic fix. Use `manual` for recommendations only; `criteria` needs explicit allow and stop conditions. |
| `workflows.lookback.implement.allow` | Conditions under which a confirmed systemic cause may be fixed. |
| `workflows.lookback.implement.stop` | Conditions requiring a human decision. |
| `workflows.lookback.reply.mode` | Independent policy for source replies. It does not authorize issue closure or delivery. |

An incomplete history or unavailable source limits the conclusion. Never report
“no recurring issues” when coverage is partial.

### `workflows.human-digest`

This is a read-only queue of configured work that still needs a person's
judgment. A direct run defaults to the last 7 days, all configured categories,
and balanced detail unless the user requests another window, category, or level.
The workflow never replies, approves, merges, closes, assigns, changes status,
or notifies people.

| Property | Meaning |
| --- | --- |
| `workflows.human-digest.repositories` | IDs from `repositories` to inspect for pull requests and code-host issues. Omit to use all configured repositories. |
| `workflows.human-digest.sources` | IDs from `sources` to inspect for feedback, issues, errors, telemetry, or custom records. Omit to use all configured sources. |
| `workflows.human-digest.include` | Optional categories: `pull-requests`, `issues`, `feedback`, `errors`, `telemetry`, and `delivery`. Omit it to include every category available from the configured repositories and sources. |
| `workflows.human-digest.window` | Time range for each digest, such as `last 7 days`. Manual runs use the same default when no range is requested. |
| `workflows.human-digest.granularity` | `brief`, `balanced`, or `detailed`. Defaults to `balanced`. |

Group repeated reports only when their evidence points to the same issue.
Include every source link and report partial coverage, unavailable connectors,
and uncertain status rather than treating them as empty or resolved.

### `skill_prompts`

This top-level map adds project-specific prompt text to individual Factory
skills. Keys are skill names without a slash; values are arbitrary multiline
strings. Add only the keys you need, and replace or remove a key to update the
project's custom prompt.

~~~yaml
skill_prompts:
  factory-ship: |
    Keep release summaries concise and link the verified change.
  factory-babysit-pr: |
    Report check failures with the failing job name and exact next action.
  factory-collect: |
    Ask for the smallest missing detail that would let us verify the report.
  factory-human-digest: |
    Group repeated UX concerns but include every source link and required decision.
~~~

Each Factory skill reads and applies its matching entry on direct runs and
includes it in saved automation prompts when scheduling that workflow. The
overlay is additional guidance, not a replacement for the skill. It cannot
override the user's current instruction, repository or host safeguards, or a
separate action policy. A prompt does not create a schedule or integration.

### `workflows.pull-requests`

This is the queue-review workflow. It can select many PRs; use
`pr-babysitting` for one explicitly authorized PR.

| Property | Meaning |
| --- | --- |
| `workflows.pull-requests.filters` | Host-specific conditions for which PRs to inspect. |
| `workflows.pull-requests.filters.state` | PR state filter. The example uses `open`. |
| `workflows.pull-requests.filters.drafts` | Whether drafts are included. The example uses `exclude`. |
| `workflows.pull-requests.approve.mode` | Separate policy for submitting approvals. Approval is disabled unless explicitly enabled. |
| `workflows.pull-requests.approve.require` | Every author, head, check, ownership, and review condition required before approval. |
| `workflows.pull-requests.merge.mode` | Separate merge policy. Approval does not imply merge permission. |
| `workflows.pull-requests.merge.require` | Live merge conditions, such as current head, required checks, review state, and an unchanged soak. |

Add other filter keys only when their meaning is supported by the connected
code host. Unknown filters are not evidence that a PR was excluded or checked.

### `workflows.pr-babysitting`

This workflow follows one PR or merge request, not a queue. The target and
schedule do not authorize changes or external actions; the run must verify the
user's original authorization and live PR state on every pass.

| Property | Meaning |
| --- | --- |
| `workflows.pr-babysitting.target.host` | Connected code-host integration with the required PR read/check/review capabilities. |
| `workflows.pr-babysitting.target.repository` | Exact repository identifier on that host. |
| `workflows.pr-babysitting.target.id` | Exact PR identity. Keep it a string to support non-numeric IDs. |
| `workflows.pr-babysitting.authorization` | How authorization is established. `explicit-user-request` requires checking the actual user request; this value alone does not grant permission. |
| `workflows.pr-babysitting.fix.mode` | Whether the run may edit code. `criteria` requires all configured fix conditions; `never` disables edits. |
| `workflows.pr-babysitting.fix.allow` | Actionability, path, and risk conditions that bound eligible fixes. |
| `workflows.pr-babysitting.publish.mode` | Whether the run may push an update to the authorized PR branch. This is separate from permission to edit. |
| `workflows.pr-babysitting.reply.mode` | Whether the run may send PR replies. |
| `workflows.pr-babysitting.reply.tone` | Optional voice for enabled replies. |
| `workflows.pr-babysitting.reply.guidance` | Optional wording or content requirements for enabled replies. |
| `workflows.pr-babysitting.approve.mode` | Whether the run may submit an approval, separately from review or fixes. |
| `workflows.pr-babysitting.approve.require` | Live current-head conditions required before approval. |
| `workflows.pr-babysitting.merge.mode` | Whether the run may merge, separately from publishing or approval. |
| `workflows.pr-babysitting.merge.require` | Live checks, review state, current-head, and other merge conditions. |
| `workflows.pr-babysitting.soak` | Required unchanged interval, such as `10 minutes`, or `none` if no soak is needed. Any head or gate change restarts it. |

Use `never` for each action you want disabled. Keep approval and merge disabled
unless their independent criteria are complete. If the host cannot read the
full review/check state or condition the merge on the checked head, keep the
related action disabled.

### `workflows.ship-watchdog` and `workflows.recovery`

| Property | Meaning |
| --- | --- |
| `workflows.ship-watchdog.notify.mode` | When reminders are allowed. `meaningful-change-only` sends nothing unless live state shows a new, actionable next step. |
| `workflows.recovery.enabled` | Whether recovery sweeps are enabled. Recovery resumes only interrupted work whose original authorization and worktree remain valid. |

Both can use the common `enabled` and `schedule` fields. Schedule recovery only
when the host can identify interrupted runs reliably.

## Policy values

These values are written as agent instructions, not checked against an enum.
Use explicit conditions instead of relying on a label alone.

| Policy | Meaning |
| --- | --- |
| `never` | Do not take this action. |
| `manual` | Hold for a person to invoke or approve. |
| `criteria` | Act only when all stated allow conditions pass and no stop condition applies. |
| `after-fix` / `after-merge` | Wait until that named proof point before taking the action. |

Missing, unclear, or unavailable evidence means hold. Fix, reply, close, review,
approve, publish, merge, deploy, recover, and notify are independent decisions.
