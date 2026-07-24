---
name: adding-a-skill
description: >-
  Use in the BuilderIO/skills repo whenever adding, updating, publishing,
  documenting, validating, or wiring a public skill. Covers the repo-local skill
  files, root catalog docs, plugin metadata, @agent-native/skills dynamic
  install path, optional managed AGENTS/CLAUDE instruction blocks in
  ../agent-native/framework, and generated/synced Plan skill gotchas.
---

# Adding A Skill

Use this for public skill work in this repo. Keep ordinary skill changes in
`skills/<skill-name>/`; keep repo-only guidance under `.agents/skills/`.

## First Decide The Skill Kind

- **Plain public skill:** a normal folder under `skills/<name>/` with
  `SKILL.md`. This is the common case. `@agent-native/skills` discovers these
  dynamically from `BuilderIO/skills@main`, so there is no framework registry to
  edit just to make `npx @agent-native/skills@latest add --skill <name>` work.
- **Instruction-style skill:** a plain skill that should optionally write an
  always-on managed `AGENTS.md` / `CLAUDE.md` line when users pass
  `--update-instructions`. These need one extra framework change; see
  "Managed Instruction Blocks" below.
- **App-backed / MCP skill:** a skill that registers a hosted/local MCP server
  or uses framework-owned install behavior. These are not plain public skills;
  inspect `../agent-native/framework/packages/core/src/cli/skills.ts` and
  `../agent-native/framework/packages/skills/src/built-in-apps.ts`.
- **Plan skills:** `visual-plan` and `visual-recap` have generated/synced copies
  between this repo and `../agent-native/framework`. Do not treat them like a
  standalone prose folder.
- **Rewind:** its canonical `SKILL.md` is generated from Agent Native because
  the instructions and local Screen Memory tools share one privacy contract.
  Keep the human README here; use `npm run sync:agent-native-skills` for the
  generated skill instead of editing it by hand.

## Plain Public Skill Checklist

1. Create or update `skills/<skill-name>/SKILL.md`.
2. Add `skills/<skill-name>/README.md` when the skill should appear in the
   public catalog. This repo intentionally uses READMEs for public skill pages.
3. If the collection positioning changes, update root `README.md`,
   `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and `package.json`
   descriptions.
4. Keep the skill concise. Put only essential agent instructions in `SKILL.md`;
   avoid extra docs unless they directly support the skill.
5. Validate with:

   ```sh
   python3 /Users/steve/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/<skill-name>
   ```

6. Smoke-test install discovery locally before claiming the CLI path works:

   ```sh
   node ../agent-native/framework/packages/skills/dist/cli.js add --copy . --skill <skill-name> --client codex --scope project --dry-run --json
   ```

7. Run `npm run check`. If it fails on `visual-plan` / `visual-recap` sync while
   the change is unrelated, report that specifically instead of rewriting those
   skills casually.

## @agent-native/skills Install Path

For a plain public skill, the install path is dynamic:

- `../agent-native/framework/packages/skills/src/index.ts` sets
  `DEFAULT_SKILLS_SOURCE = "BuilderIO/skills"`.
- It materializes that repo, reads plugin manifests via `resolveSkillsRoot`, and
  discovers every `skills/*/SKILL.md` through `discoverSkills`.
- Therefore a new folder under `skills/<name>/` is enough for:

  ```sh
  npx @agent-native/skills@latest add --skill <name>
  ```

No `@agent-native/core` built-in registry change is needed unless the skill is
app-backed or needs custom install behavior.

## Managed Instruction Blocks

If the skill should affect `AGENTS.md` / `CLAUDE.md` through
`--update-instructions`, update the framework wrapper:

- Add a concise line in
  `../agent-native/framework/packages/skills/src/index.ts` inside
  `instructionContentForSkill(skillName)`.
- Add or update tests in
  `../agent-native/framework/packages/skills/src/index.spec.ts`.
- Run:

  ```sh
  pnpm --filter @agent-native/skills test -- src/index.spec.ts --runInBand
  ```

Use this for durable behavior rules like `quick-recap`, `efficient-fable`,
`stay-within-limits`, and likely docs-first behavior such as
`read-the-damn-docs`.

## App-Backed Or MCP Skills

If a skill needs hosted tools, auth, MCP registration, local-files mode, or
special install flags, inspect the framework before editing:

- `../agent-native/framework/packages/core/src/cli/skills.ts`
- `../agent-native/framework/packages/skills/src/built-in-apps.ts`
- `../agent-native/framework/packages/skills/src/sync-with-core.spec.ts`

Keep the core and standalone `@agent-native/skills` MCP descriptors in sync.

## Agent Native Skill Sync Gotchas

`visual-plan`, `visual-recap`, and `rewind` are special:

- Framework contains canonical/generated copies and Plan marketplace bundles.
- This repo's `npm run check` compares those copies and can fail for drift
  unrelated to a new plain skill.
- When intentionally changing Plan skills, use the framework sync paths instead
  of hand-editing generated copies. Search the framework for
  `sync-plan-marketplace`, `sync-workspace-skills`, and `skills.sync.spec.ts`.
- Rewind's `SKILL.md` is generated from
  `packages/core/src/cli/skills-content/rewind-skill.ts`. Its public README is
  preserved as an overlay. The plain-copy installer cannot configure Rewind's
  local MCP connection; public setup docs must use `@agent-native/skills` or
  `@agent-native/core`.
- Plugin manifests that publish the whole `skills/` directory must carry an
  always-on setup directive: invoking Rewind with Clips absent asks permission
  before opening the official install flow, never installs or enables capture
  silently, and keeps Rewind unavailable until Core configures the local MCP
  connection and `screen_memory_status` succeeds.

## Final Reporting

When finishing a skill change, tell the user:

- Which skill files changed.
- Whether `@agent-native/skills` dynamic install discovery is enough.
- Whether a framework managed-instruction change was added or intentionally
  left as a follow-up.
- Which validation commands passed or failed, including unrelated Plan sync
  failures.
