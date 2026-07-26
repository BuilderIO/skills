# /visual-edit

Open a running local app in the Agent-Native Design surface as URL-backed iframe
screens for visual inspection, route-state exploration, and source-backed edits.

Use `/visual-edit` when a UI needs to be reviewed or changed in context: compare
real routes, inspect responsive states, walk a multi-screen flow, duplicate a
screen for a new URL state, or apply visual changes back through the coding
agent. The canvas uses the app's live routes and local bridge rather than a
copied static HTML snapshot.

For the full workflow, install the skill with the Agent-Native CLI:

```sh
npx @agent-native/core@latest skills add visual-edit
```

The hosted Design MCP connector handles the account-backed open, screen
placement, and source-edit workflow. Public/read-only designs may be viewed
without signing in; creating, saving, or sharing a design still requires an
authenticated account.
