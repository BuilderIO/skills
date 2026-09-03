---
name: agent-watchdog
description: Use when asked to watch, babysit, audit, review, compare, or fix another agent's work from a Codex session ID, Claude Code session/transcript, chat/thread link, PR, branch, log, or pasted run summary. Monitor until the other agent is done or blocked, reconstruct what the user asked, independently investigate the same problem to form your own hypotheses and approach, inspect what the agent actually changed and verified, compare the two investigations, report gaps and add-on directions, and optionally make scoped fixes when the user authorizes repair.
---

# Agent Watchdog

Watch another agent's work like a reviewer with a pager who is also a second
investigator: wait for completion when needed, reconstruct the request, run
your own independent investigation of the same problem, verify the evidence,
and close the gap between what was asked and what actually happened. You are
not just grading their homework — you are a second solver whose findings get
diffed against theirs so nothing is missed.

## Choose The Mode

Infer the mode from the user's wording:

- **Watch only:** monitor a session, PR, branch, CI run, or transcript until it
  reaches a terminal state. Do not edit files.
- **Audit:** read the prompt, transcript, diff, tests, CI, comments, screenshots,
  or final claims, run the independent investigation below, and return a gap
  report plus add-on directions. Do not edit files.
- **Audit and fix:** audit first, then make narrow fixes for clear gaps. Avoid
  broad rewrites, branch movement, or speculative changes.
- **Compare:** when given multiple sessions or agents, compare their work against
  the same original request and reconcile the important differences.

If authority is unclear, default to audit-only and say what you would fix.

## Resolve The Target

1. Identify every artifact the user supplied: session ID, transcript path,
   thread URL, PR, branch, commit, CI run, issue, Slack link, or pasted summary.
2. Use the host's native thread/history tools, local transcript files, repo
   logs, GitHub tools, or pasted content to resolve the artifact. Prefer the
   most direct source over summaries.
3. If the artifact is still running and the user asked to watch, poll at a
   reasonable interval until it is done, blocked, stale, or clearly waiting on a
   human/external system.
4. If the artifact cannot be resolved, ask for the missing identifier or path.

## Reconstruct The Contract

Build a compact contract before judging the work:

- Original user request and any later changes in scope.
- Explicit constraints: branch rules, no-edit requests, deadlines, package
  versions, validation expectations, design requirements, or security/privacy
  limits.
- Implied acceptance criteria: user-visible behavior, tests, CI, docs, deploys,
  screenshots, review replies, or status updates.
- The other agent's final claims and any "could not do" caveats.

Treat the user's request as the source of truth, not the other agent's summary.

## Investigate Independently

Act as if the original prompt had been given to you, in parallel with auditing
the watched agent. Anchoring is the failure mode: reading their work first and
nodding along. Your value comes from a genuinely separate second pass.

1. Form your own hypotheses about root causes and the approach you would take —
   ideally before reading the watched agent's conclusions, and if you have
   already seen them, still reason from first principles rather than from
   their framing.
2. Explore the code, data, logs, production state, and docs yourself, directly
   or via subagents. While the watched agent is still running, use the wait to
   pre-map the problem domains so hypotheses are ready before their diff lands.
3. Prioritize evidence the watched agent may not have looked at: production
   run ledgers or databases, session replays, error trackers, user-supplied
   screenshots, deploy/version state, other worktrees, memory of past
   incidents in the same area.
4. Verify the watched agent's key claims against primary sources, and verify
   your own leads the same way — reopen the cited files and line refs before
   asserting either side is right. Subagent reports are leads, not facts.
5. Diff the two investigations: what they found that you missed, what you
   found that they missed, where the approaches diverge, and any product or
   design fork they took silently. Convert the diff into concrete, actionable
   add-on directions (exact files, guards, test cases) — not vague concerns —
   and offer them as a paste-ready note the user can relay.

## Relay Sparingly

Finding something is not a reason to send it yet. A watched agent that is
still building re-plans around every note it receives, so the cost of a
relay is their attention and their sequencing, not your tokens.

- Interrupt a live run only for what changes their current step: a defect in
  code they are touching now, a correction to something you told them
  earlier, or an answer they are blocked on.
- Everything else — coverage gaps, reference material, conventions, polish —
  waits for their next checkpoint and travels as one batched note.
- Never hand a mid-run agent an unranked list of what is missing. Ranked, and
  labelled as a map rather than a to-do list, or not at all: an unranked
  backlog reliably produces several half-finished surfaces instead of a few
  complete ones.
- Say what you verified as correct, not only what is wrong. It stops them
  re-litigating settled ground and keeps the relationship peer-to-peer.
- If the watched agent has not yet acted on your previous note, do not send
  another one.

## Audit The Evidence

Inspect evidence, not vibes:

- Read changed files and relevant unchanged files around the touched paths.
- Check git status/diff without reverting unrelated work.
- Compare commands the agent claimed to run with actual output when available.
- Inspect failed or skipped tests, CI logs, browser screenshots, review
  comments, deploy output, and error traces.
- For PR/review work, verify unresolved threads and CI state from the source
  system when tools are available.
- For UI work, prefer screenshots or browser checks over prose claims.

Classify each issue as:

- **Gap:** requested behavior is missing or incomplete.
- **Bug:** the implementation likely fails or regresses behavior.
- **Verification miss:** the work may be right but the evidence is weak.
- **Scope drift:** the agent changed something unrelated or skipped a constraint.
- **No issue:** the concern is already handled, with evidence.

## Fix Narrowly

When the user authorized repair:

1. Fix only gaps with clear evidence.
2. Preserve unrelated local changes and do not move branches unless explicitly
   asked for that branch operation.
3. Use existing repo patterns and targeted tests.
4. Re-run the smallest useful validation after each meaningful fix.
5. If a fix would require a product decision, credential, destructive action, or
   broad rewrite, stop and report the decision instead of guessing.

## Report

Lead with the outcome. Keep the report short enough to scan:

```md
Status
- Done, blocked, stale, or still running.

Requested
- What the user asked the watched agent to do.

Observed
- What the watched agent changed, claimed, and verified.

Gaps
- Missing behavior, bugs, weak verification, or scope drift.

Independent findings
- What your own investigation surfaced that the watched agent missed, where
  your approach would have differed, and concrete add-on directions to relay.

Fixes made
- Files changed and validation run. Omit this section for audit-only work.

Remaining risk
- Anything still unverified or waiting on CI/review/deploy/human input.
```

Name exact files, commands, PRs, or thread IDs when they matter.
