# Turn Into App

Give a workflow you have already proven the face of an app and the brain of an
agent. `/turn-into-app` turns a thread, a skill, a spreadsheet, or a Claude or
ChatGPT project into a visual [Agent-Native](https://www.agent-native.com) app:
populated, domain-shaped screens (a week grid, a board, a live workbench, a
triage queue) with the agent working behind buttons on the objects it acts on.

## Try it

- `/turn-into-app` at the end of a thread that proved a repeatable job.
- `/turn-into-app /some-skill` to package a skill, even at the start of a thread.
- `/turn-into-app ./forecast.xlsx` to turn a spreadsheet into a workbench.
- `/turn-into-app ./project-export/` to turn a Claude or ChatGPT project's
  instructions, knowledge files, and past runs into an app.

## How it works

1. **Brief.** It reads the source and posts a short brief: the job, its inputs
   and outputs, and the one to three moments that need the agent's judgment.
2. **Design.** It picks the app's layout, visual direction, and sample data
   before writing any UI.
3. **Build.** It creates a new Agent-Native app, never overwriting an existing
   one, and builds the screens, sample data, and agent moments together.
4. **Review.** It runs the app, screenshots it at desktop and phone sizes in
   light and dark, and fixes what the screenshots show.
5. **Report.** It says what is running, verified, build-ready, and deployed.

## What it runs and connects to

- **Building on your machine** (Claude Code and other local coding agents): it
  creates the app with `npx @agent-native/core@latest create`, installs the
  app's packages with pnpm, and starts its dev server. It needs Node.js 22.22 or
  newer and pnpm. For screenshots it uses your installed Chrome, or installs
  Playwright and, if needed, Playwright's Chromium in the app's `.tmp` folder.
  It deploys only when you ask or the project already has a host set up, using
  that host's own commands and your account there.
- **Hosting with Builder, or working from Claude on the web**: it hands a
  bounded brief to Builder through the plugin's one MCP server, Agent-Native
  Dispatch (`https://dispatch.agent-native.com/mcp`, signed in with OAuth).
  The brief describes the workflow and carries any files you attach. It asks
  before sending a file with personal or confidential data, and leaves such
  files out when nobody can answer. Builder builds the app in your workspace's
  Builder project.
- **A Google Sheets source**: it reads the sheet only through a Sheets or Drive
  connection you have already authorized, never through a public export link.

The plugin has no hooks and runs no code of its own when it loads. See the
[Agent-Native privacy policy](https://www.agent-native.com/privacy/).

## License

MIT
