---
name: factory
installer-group: factory
description: >-
  Experimental workflow for configuring an autonomous software delivery
  factory. Use when choosing feedback sources, schedules, worktree behavior,
  autonomy gates, or host automations.
---

# Factory

> Start with the [Factory guide](../../docs/factory/README.md) for workflow
> setup and configuration.

Read `.agent-factory/config.yaml` and apply the optional
`skill_prompts.factory` entry as additional project guidance. Configure the
current project to turn selected product or maintenance signals
into verified, reviewed changes. Factory coordinates the other modules; it
does not assume a provider, repository, schedule, or autonomy level.

## Set up

Use the [Factory configuration reference](https://github.com/BuilderIO/skills/blob/main/docs/factory/configuration.md) for field meanings, examples, and host limitations.

1. Read `.agent-factory/config.yaml` if it exists. Preserve explicit choices.
2. Show the read-capable integrations this host exposes. There is no built-in
   Factory source catalog. Confirm the source scope; add a custom source only
   when a connected tool can read it.
3. Set each action policy independently: implement, reply, close, review,
   approve, publish, merge, deploy, recover, and notify.
4. Add optional per-skill prompts under `skill_prompts` when you want
   project-specific rules layered onto a module.
5. Choose schedules, time zone, worktree ownership, runtime, and notifications
   only where the host supports them.
6. Write the agreed config. Never put credentials or tokens in it.
7. If asked to create automations, create one job per enabled workflow, then
   read back its saved schedule, target, runtime, and notification settings.
   Report fields the host could not honor.

A config entry or written prompt does not prove a job exists. Treat unavailable
or partial reads as unknown, not empty or successful.

## Safe defaults

- Keep replies, issue closure, approvals, merges, production deploys, and
  recovery disabled unless their own policy is explicit.
- For criteria-based actions, record both conditions that allow the action and
  conditions that require a human.
- Missing or unclear policy means hold. Permission to fix does not authorize
  publication or another external action.

## Modules

| Skill | Scope |
| --- | --- |
| `factory-collect` | Collect and triage configured feedback, telemetry, errors, and issues. |
| `factory-lookback` | Find recurring signals and brittle paths that need systemic fixes. |
| `factory-human-digest` | Aggregate work that still needs a human decision. |
| `factory-review-prs` | Review a filtered PR queue. |
| `factory-babysit-pr` | Follow one explicitly authorized PR. |
| `factory-ship` | Publish and complete a delivery lifecycle. |
| `factory-watchdog` | Find stopped, authorized delivery work. |
| `factory-recover` | Resume valid interrupted runs. |

Modules can run independently. Each reads the same project config and must not
borrow permissions from another workflow.

## Prompt overlays

`skill_prompts` is an open map from a skill name to a multiline prompt. Each
Factory module reads its matching entry, such as
`skill_prompts.factory-babysit-pr`, and treats it as additional project
guidance. Editing or removing that value replaces or removes the project
overlay; it never replaces the installed skill instructions.

For scheduled runs, include the matching overlay in the saved automation
prompt and verify the host retained it. A prompt cannot grant a permission,
weaken repository or host safeguards, or override the user's current request.
If it conflicts with those rules, follow the more restrictive requirement and
surface the conflict.

## Report

State which sources and host capabilities were verified, which policies and
jobs were configured, what remains manual, and any unavailable evidence. Never
claim that a schedule, integration, merge, or deployment exists without reading
back its live state.
