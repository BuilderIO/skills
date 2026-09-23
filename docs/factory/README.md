# Experimental software factory

The Factory skills are an experimental, composable workflow for turning configured
feedback and maintenance signals into reviewed software changes. They support
different issue trackers, chat channels, error monitors, repositories, coding
hosts, schedules, and autonomy thresholds.

They install agent instructions. They do not connect accounts, provision
credentials, create scheduled automations, or grant permissions by themselves.
Use /factory to configure the project, then ask it to create automations through
the connected host's supported scheduler.

## Install the whole group

The skills CLI accepts repeated --skill flags, so one command installs the
setup skill and every workflow module into Codex's shared .agents/skills path
and Claude Code's .claude/skills path:

~~~sh
npx @agent-native/skills@latest add \
  --skill factory \
  --skill factory-feedback \
  --skill factory-review-prs \
  --skill factory-ship \
  --skill factory-watchdog \
  --skill factory-recover \
  --client codex,claude-code \
  --scope project \
  --yes
~~~

You can also install one skill at a time. The CLI picker and skills list mark
each module Experimental in its description.

## Skills

- /factory configures sources, schedules, worktrees, autonomy, notifications,
  and host automations.
- /factory-feedback enumerates and triages product feedback, issues, and errors.
- /factory-review-prs reviews pull requests and applies independent approval,
  reply, and merge policies.
- /factory-ship publishes configured work and completes its delivery checks.
- /factory-watchdog follows explicitly authorized ship work and stays quiet
  unless a verified next step is due.
- /factory-recover finds interrupted runs and resumes only when the original
  authorization and worktree are still valid.

The existing /agent-watchdog remains the general audit skill for another
agent's session or diff. It is useful alongside Factory but does not replace
these recurring intake, review, and delivery workflows.

## Configure the factory

Run /factory in the project where the workflows should operate. It reads
.agent-factory/config.yaml if present, discovers connected providers and
scheduler capabilities, and asks only for missing decisions. Keep the config
in the project so the setup and recurring runs share the same policy.

This is an agent-readable convention, not a validated scheduler schema. The
skill must still create or update each host automation and read its persisted
settings back. A schedule written in YAML is not proof that a job exists.

~~~yaml
version: 1
timezone: America/Los_Angeles

repositories:
  - id: app
    provider: github
    remote: example/project
    worktree:
      mode: fresh-per-run
      base: origin/main

sources:
  - id: product-feedback
    provider: slack
    scope: channel-id
  - id: issues
    provider: jira
    scope: PROJECT
  - id: errors
    provider: sentry
    scope: organization/project

workflows:
  feedback:
    enabled: true
    schedule: every 4 hours
    sources: [product-feedback, issues, errors]
    implement:
      mode: criteria
      allow: [verified defects, low-risk changes]
    reply:
      mode: after-fix
      tone: concise and appreciative
      guidance: Thank the reporter and link the fix.
    close:
      mode: after-merge

  pull-requests:
    enabled: true
    schedule: "weekdays at 07:00, 12:00, and 15:00"
    approve:
      mode: criteria
      require: [eligible author, current head, required checks green, no unresolved findings]
    merge:
      mode: criteria
      require: [mergeable, review-clean, unchanged head for 10 minutes]

  ship-watchdog:
    enabled: true
    schedule: every 5 minutes
    notify:
      mode: meaningful-change-only

  recovery:
    enabled: false
~~~

The example schedules, sources, criteria, and ten-minute soak are illustrations,
not defaults. Configure each item for the host, repositories, and risk tolerance.

### Autonomy is per action

Choose each policy separately. Do not use one autonomy level for an entire
factory:

| Action | Example policy |
| --- | --- |
| Read a source | Enumerate every configured item; unavailable is not empty |
| Implement a change | Only confirmed bugs under named risk and path criteria |
| Reply to a reporter | Never, ask first, after a fix, or every in-scope item; set tone and guidance |
| Close an issue | Never, after source merge, or after a configured verification point |
| Review a PR | Inspect and report findings without changing PR state |
| Approve a PR | Disabled by default; enable for named authors and verified gates |
| Merge a PR | Disabled by default; enable only with explicit live check, review, and soak criteria |
| Deploy to production | Independent of merge; disabled unless separately configured |
| Resume a run | Only when its original authorization remains valid |
| Send a watchdog reminder | Only for verified stopped work with a concrete next step |

For every action, choose a policy such as never, manual approval, or criteria.
When criteria are enabled, specify the allow conditions and stop conditions.
Unknown, incomplete, or unreadable evidence fails closed. A user's approval to
fix an issue does not automatically authorize a public reply, issue closure,
PR approval, merge, or production deployment.

### Sources and credentials

Each source names a provider or custom adapter and its scope, such as a chat
channel, repository, tracker project, or error-monitor project. Use only
integrations the host already grants. A custom provider can be described by its
connected MCP/API tool and the filters or cursor needed to enumerate it.

Keep credentials in the host's connection or secret store. The project config
may contain a connection name or opaque reference, but never token values,
passwords, private URLs, or copied customer data. If a provider is unavailable,
report it and continue only with sources that were successfully read.

### Schedules and worktrees

Set the time zone, cadence, target project, and runtime separately for each
workflow. Hosts differ in scheduling syntax and in whether a recurring task is
a cron job or a thread heartbeat. Preserve those semantics; do not convert a
job type simply to gain a model or effort option. Verify the saved schedule,
target, runtime, and notification behavior after setup.

Code-changing jobs should use a clean, automation-owned worktree from the
configured base. Do not borrow a saved checkout or another active task's
worktree. If the host cannot provision that isolation, keep the code-changing
workflow manual instead of silently using a shared checkout.

### Run and tune

Start with read-only source enumeration or dry runs. Confirm each source's
cursor, scope, and counts, then exercise one low-risk code change and its
configured verification. Review sample replies, approvals, merges, and
notifications before enabling those actions. Use the run history to tune the
criteria; do not weaken a gate merely to make a run appear successful.

The factory skills are experimental. Their config is not schema-validated, and
host automation capabilities vary. The setup skill must say which sources,
actions, and schedule fields were actually configured and which still need
manual setup.

