---
name: efficient-orchestrator
description: Run only when the user explicitly invokes /efficient-orchestrator (or the /efficient-frontier and /efficient-fable aliases). Keeps an expensive model (Fable, Opus, Astra, Sol) on planning, judgment and review while cheaper subagents do bounded research, coding, QA and log work. Never self-activate.
disable-model-invocation: true
---

# Efficient Orchestrator

Use this only when the user asks for it by name. Without that request, do the
work yourself and don't spawn helpers.

The expensive main model plans, decides, integrates and reviews. Cheaper
subagents do the token-heavy, bounded work.

## Model tiers

| Main model | Cheap helpers | Use |
| --- | --- | --- |
| Claude Fable / Opus | `haiku` | search, scans, docs extraction, log reduction, mechanical edits, test and browser runs |
|  | `sonnet` | coding or analysis that needs judgment |
| OpenAI Astra / Sol | `gpt-6.1-terra` low or medium | coding, QA, research, most delegated work |
|  | `gpt-6-luna` | bulk mechanical scans, only when Terra isn't needed |

Set the model and effort explicitly on every spawn; never let a helper inherit
the expensive model. If the main model is already a cheap tier, don't use this
skill.

## Workflow

1. Keep at the top: architecture, prioritization, ambiguity, risk, synthesis
   and final review.
2. Delegate: repo scans, research, narrow patches with clear file ownership,
   test and browser passes, failure clustering, log reduction.
3. Write each handoff as a self-contained packet: repo path, objective, scope
   and out-of-scope, files or search targets, verification command, return
   format, stop conditions.
4. Require compact returns: findings, changed files, commands run, evidence,
   open decisions.
5. Inspect the evidence that matters before claiming done. Delegated output
   is evidence, not a verdict.

## Limits

- At most 3–5 helpers at once. Helpers never spawn their own helpers.
- Close each helper as soon as its result is in.
- Don't delegate the blocker your next step depends on, and never give two
  helpers the same files.
- Stop helpers that return nothing usable twice; do that step yourself.
- When done, say roughly how much work was delegated, so the cost is visible.
