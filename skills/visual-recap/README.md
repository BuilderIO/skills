# /visual-recap

Turn a branch, commit, or PR diff into an interactive visual recap with
annotated diffs, diagrams, API/schema summaries, file maps, UI state summaries,
and focused review notes.

`/visual-recap` is the reverse of `/visual-plan`: instead of planning a future
change, it summarizes a diff, branch, commit, or PR after the work exists. The
goal is to help reviewers understand the shape of a change before they dive into
raw line-by-line diffs.

It solves for diffs that hide the shape of the change. Reviewers can understand
contracts, architecture moves, schema changes, and UI impact before diving into
raw line-by-line review.

The recap is a human-optimized MDX document with custom components for the
things raw diffs are bad at explaining: annotated diffs, diagrams, visual schema
maps, OpenAPI-style API diffs, file maps, UI state summaries, and focused review
notes.

Visual recaps are MDX, customizable with your own components, and viewed with
the [Agent-Native plans app](https://www.agent-native.com/docs/template-plan).
The hosted app is 100% free and open source; local-files mode writes the recap
MDX into your repo and opens a local preview with no sharing.
[Source here](https://github.com/BuilderIO/agent-native/).

<picture>
  <img alt="Visual recap review surface animation" src="../../media/visual-recap.gif">
</picture>

## What It Does

- Reads the actual changed files and diff.
- Publishes an interactive recap with file maps, diagrams, visual schema
  maps, API diffs, annotated diffs, UI state summaries, and focused key changes.
- Keeps recaps substantial enough for real review without dumping every line.
- Makes large changes consumable before a reviewer opens raw GitHub diff view.
- Can be installed with a reusable GitHub Action for PR visual recaps.

## When To Use It

Use it for PRs or work units that are large, multi-file, UI-heavy, or touch
schema, API contracts, permissions, architecture, or review-critical behavior.

Skip it for tiny, obvious diffs that review faster directly in GitHub.

## What Reviewers Get

Reviewers get the shape of the change first: what moved, which contracts
changed, what data or API surfaces were touched, how UI states differ, and where
the risky lines are. Then they can review the raw diff with a map in their head.

## GitHub Action

When installed with `--with-github-action`, this repo writes a PR workflow that
can automatically generate a visual recap from every pull request diff.
Reviewers open the generated PR recap in the
[Plan app review surface](https://www.agent-native.com/docs/template-plan)
before moving into raw GitHub diff view.

The top-level installer also offers the PR action as an option:

```sh
npx @agent-native/skills@latest add
```

![Example of a visual recap posted to a PR](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fcf9bac396cf24a4ba976fc331af6fc5d)

## Install

```sh
npx @agent-native/skills@latest add --skill visual-recap --with-github-action
```

The interactive installer asks whether to use hosted Plans or local files. To
force the no-sharing local path:

```sh
npx @agent-native/skills@latest add --skill visual-recap --mode local-files
```

The skill expects the [Plan MCP connector](https://www.agent-native.com/docs/template-plan)
to be available when hosted mode is used.
