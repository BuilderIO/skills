# /visual-plan

Turn ordinary implementation plans into rich interactive visual review surfaces.

`/visual-plan` turns the plan an agent would normally write in chat into a
human-optimized MDX document. Instead of a long wall of prose, reviewers get
custom components built for understanding: architecture diagrams, wireframes,
interactive prototypes, file maps, annotated code, OpenAPI-style API specs,
visual schema maps, open questions, and comments.

It solves for plans that are too important to bury in chat. The output is
scannable, commentable, and intuitive enough for a human to approve before code
changes start.

<picture>
  <img alt="Visual plan review surface" src="../../media/visual-plan.png">
</picture>

Visual plans are MDX, customizable with your own components, and viewed with the
[Agent-Native plans app](https://www.agent-native.com/docs/template-plan).
The hosted app is 100% free and open source; local-files mode writes
`plans/<name>/plan.mdx` in your repo and opens a local preview with no sharing.
[Source here](https://github.com/BuilderIO/agent-native/).

## What It Does

- Grounds plans in real repo files, schemas, actions, and symbols.
- Chooses the right visual surface: document-only, wireframe canvas, prototype,
  design direction, or visual intake.
- Uses MDX and custom components for diagrams, UI flows, API specs, schema maps,
  diffs, code annotations, and reviewer questions.
- Publishes the result as an interactive review document instead of inline chat Markdown.
- Keeps the plan as the approval gate before source edits begin.

## When To Use It

Use it for multi-file, ambiguous, risky, architecture-heavy, data-heavy, or
UI-heavy work where the wrong direction would be expensive. It is also useful
when a pasted text plan needs a richer review surface.

Skip it for trivial fixes, single-line changes, or anything whose diff is easier
to review than a plan.

## What Reviewers Get

Reviewers get a plan link that is built for scanning. Decisions, files,
diagrams, contracts, UI states, prototype behavior, schema shape, API boundaries,
and unresolved questions live in one consumable place.

For teams wiring visual plans into their review flow, the
[Plan app documentation](https://www.agent-native.com/docs/template-plan)
explains how the review surface is rendered and shared.

The point is not just prettier planning. It is a better medium for human review:
visual where visuals help, structured where structure helps, and grounded in the
actual codebase.

## Install

```sh
npx @agent-native/skills@latest add --skill visual-plan
```

The interactive installer asks whether to use hosted Plans or local files. To
force the no-sharing local path:

```sh
npx @agent-native/skills@latest add --skill visual-plan --mode local-files
```

The skill expects the [Plan MCP connector](https://www.agent-native.com/docs/template-plan)
to be available when hosted mode is used.
