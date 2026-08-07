---
name: efficient-fable
description: Use when running Claude Fable on codebase-heavy or token-heavy work and the user wants Fable to orchestrate research, coding, and testing while cheaper subagents do bounded heavy lifting.
---

# Efficient Fable

Use Claude Fable as the orchestrator, architect, synthesizer, and final judge.
Use cheaper subagents for token-heavy research, coding, testing, and
summarization that do not require Fable's full judgment.

## Where Fable Shines

Reserve Fable for:

- Decomposing ambiguous work into clean parallel slices.
- Architecture, product, and safety tradeoffs.
- Reading conflicting subagent reports and deciding what matters.
- Integrating partial implementations into one coherent plan.
- Final review, risk assessment, and user-facing synthesis.

## Delegation Pattern

1. Name the expensive-token risk: large repo search, long logs, broad docs, or
   repetitive edits.
2. Split independent work into subagents before reading everything yourself.
3. Use cheaper models for research scans, inventory, search summaries, narrow
   bug hunts, browser/testing passes, test output reduction, and bounded code
   edits.
4. Ask subagents for concise evidence: files, line references, commands run,
   diffs, uncertainties, and stop conditions they hit.
5. Spend Fable tokens on the decision layer: compare results, resolve conflicts,
   choose the implementation path, and review the final patch.

Prefer parallel subagents when the slices do not depend on each other. Keep
blocking or highly coupled work local.

## Staying Unblocked

- Defer questions to the user until no other independent work remains: every
  mid-plan stop stalls the slices that could keep moving. Batch open
  questions for the end. Exception: ask immediately when the answer gates
  every remaining slice or the next step is irreversible.
- Don't sit blocked on a running subagent either: run subagents in the
  background and spend the wait on orchestrator-side work — vetting earlier
  results, planning the next slice.
- Keep the build green even while changes are incomplete — leave unfinished
  work stubbed or unwired rather than half-connected — so one blocked or
  stalled slice does not block the others. If a slice breaks the build,
  revert only its diff in the working copy.

## Handoff Packets

Write delegated prompts as if the subagent has no useful chat context. Include
only the context it needs:

- The repo path and exact objective.
- The files, packages, or surfaces in scope and anything explicitly out of
  scope.
- The evidence format to return: files, line refs, commands, diffs, failures,
  screenshots, and uncertainty.
- The verification commands or browser flows to run, plus what success should
  look like when that is knowable.
- Stop conditions: if the code does not match the prompt, a command fails after
  a reasonable retry, or the task needs out-of-scope files, stop and report
  instead of improvising. Subagents should never pause to wait on user input;
  they stop the task and report so the orchestrator stays unblocked.

## Vetting Delegated Work

Treat subagent reports as leads, not facts. Before using a high-impact finding,
opening a PR, or telling the user the work is done, Fable should reopen the
important cited files, confirm the relevant line refs or failures, and review
the final diff against the task. Let lighter agents gather signal; keep
truth-judgment with Fable.

## Common Scenarios

Treat these as soft defaults, not rigid rules:

- Research: ask lighter agents to scan docs, prior art, APIs, and repo surfaces;
  Fable decides what evidence changes the plan.
- Coding: give cheaper agents bounded edits or candidate patches; Fable owns
  shared-file coordination, integration, and final review.
- Testing: have Fable suggest the validation direction and the scripts or
  browser checks that matter. Let lighter agents run targeted tests, browser
  flows, screenshots, and log reduction, then report exact commands, failures,
  likely causes, and whether failures look flaky, environmental, or real.
- Debugging: use cheaper agents to cluster logs, reproduce issues, and try
  small fixes; Fable decides which diagnosis is most trustworthy.

If a task is tiny or the validation itself needs delicate judgment, keep it
with Fable.

## Diagram

Use `assets/fable-orchestrator.excalidraw` when a visual explanation helps.

## Claims

For codebase-heavy work, it is reasonable to describe this as up to 3-5x more
cost-efficient and 2-4x faster when independent research, coding, or testing
slices can run in parallel. Treat those as workload-dependent estimates, not
guarantees.

Good launch copy:

> Make Claude Fable more efficient by using cheaper subagents for token-heavy
> research, coding, and testing, saving Fable for judgment, architecture,
> synthesis, and final review.
