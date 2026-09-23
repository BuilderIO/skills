---
name: factory
description: >-
  Experimental workflow for configuring an autonomous software delivery
  factory. Use when choosing feedback sources, schedules, worktree behavior,
  autonomy gates, or host automations.
---

# Factory

Set up or change a configurable software delivery workflow for the current
project. This skill coordinates the factory modules; it does not assume a
provider, repository, schedule, or level of autonomy.

## Configure

1. Read .agent-factory/config.yaml if it exists. Preserve explicit choices and
   ask only for decisions the user has not made.
2. Discover available source integrations and scheduler capabilities. A
   disconnected or unreadable source is unavailable, not empty.
3. Configure each action independently: implement fixes, reply to reporters,
   close issues, review or approve PRs, merge PRs, deploy, resume work, and send
   watchdog notices. Never infer permission for one action from permission for
   another.
4. Set schedules, time zone, repository/worktree ownership, runtime/model
   options, and notification rules only where the host supports them.
5. Write the agreed project configuration to .agent-factory/config.yaml. Store
   connector names or opaque references there, never credentials or tokens.
6. If the user asks to install or update automations, create or update one job
   per enabled workflow through the host's supported scheduler. Read back the
   saved settings and report any field the host could not honor. Do not claim
   an automation exists when only its prompt or config was written.

Use conservative defaults for unspecified behavior: no external replies,
issue closure, approvals, merges, production deploys, or resumption. A missing
or unclear policy means hold for a human. Criteria must name both what may
proceed and what must stop.

## Use the modules

- factory-feedback: collect and disposition configured feedback.
- factory-review-prs: review PRs and apply separately configured approval and
  merge policies.
- factory-ship: publish work and complete the configured delivery lifecycle.
- factory-watchdog: find stalled, explicitly authorized ship work and nudge
  only when the live state proves a next step is due.
- factory-recover: identify interrupted runs and resume only when their
  original authorization and worktree remain valid.

Each module can run independently. Read the same project config before work;
do not broaden an action because a different workflow is more autonomous.

