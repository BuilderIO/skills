---
name: factory-review-prs
description: >-
  Experimental workflow for reviewing configured repositories' pull requests.
  Use for manual or scheduled PR triage, approval, or merge decisions.
---

# Factory Review PRs

Read .agent-factory/config.yaml. Use only its repositories, PR filters,
reviewer policy, and action thresholds. Review, approval, replies, and merge are
separate permissions.

## Review

1. Query current PR state from the configured host. Exclude drafts and PRs
   outside configured filters; skip a PR that already has a current review
   unless the policy requests a re-review.
2. Inspect the diff, linked issues, required checks, review threads, author
   eligibility, and exact head revision. Treat bot findings as leads; resolve
   them against source and preserve human review direction unless evidence
   disproves it.
3. Report findings with file and line, impact, and a concrete fix. If there are
   no actionable findings, record that result without inventing a comment.

## Approval and merge

- Approve only when approval is enabled and every configured author, risk,
  ownership, check, and review condition is verified on the current head.
  Unknown author eligibility or incomplete checks means no approval.
- Merge only when merge is enabled and its independent criteria hold. Re-read
  the exact head, check results, mergeability, and review state immediately
  before the merge. Restart any configured soak when the head changes.
- Send replies, reviews, labels, assignments, or notifications only when the
  matching action is enabled and its criteria hold. Use configured wording or
  tone guidance; if replies are disabled, do not message contributors.
- Do not treat host-level mergeability, one green check, or a bot approval as
  proof that every configured gate passed.

Recap each reviewed PR with its decision and evidence, and list skipped,
unavailable, or held PRs with the reason.

