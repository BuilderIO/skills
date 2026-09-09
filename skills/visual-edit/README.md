# /visual-edit

Open a running local app in the Agent-Native Design surface as URL-backed iframe
screens for visual inspection, route-state exploration, and source-backed edits.

Use `/visual-edit` when a UI needs to be reviewed or changed in context: compare
real routes, inspect responsive states, walk a multi-screen flow, duplicate a
screen for a new URL state, or apply visual changes back through the coding
agent. The canvas uses the app's live routes and local bridge rather than a
copied static HTML snapshot.

## Choose the screens deliberately

- **Multiple pages:** pass `paths` such as `["/", "/pricing", "/settings"]`.
- **A multi-step flow:** pass named `routes` in the order the user follows,
  such as shipping, payment, then confirmation. Each URL state becomes a
  separate canvas screen.
- **The same page at responsive widths:** add `viewports`, for example
  `["desktop", "mobile"]`. Design places each requested route or page once per
  viewport so they can be compared side by side.

For example, add these fields to an `open-visual-edit` payload to place each
checkout step at desktop and mobile sizes:

```json
{
  "title": "Checkout flow review",
  "routes": [
    { "url": "http://localhost:5173/checkout?step=shipping", "title": "1. Shipping" },
    { "url": "http://localhost:5173/checkout?step=payment", "title": "2. Payment" },
    { "url": "http://localhost:5173/checkout?step=done", "title": "3. Confirmation" }
  ],
  "viewports": ["desktop", "mobile"]
}
```

Pass that shape to `open-visual-edit` together with the connection details from
the workflow. For a page comparison, use `paths` instead of `routes`.

## Open the canvas beside the conversation when possible

Use the Design URL or embed returned by `open-visual-edit`. If the current host
supports an inline preview, webview, or side browser, open Design there so the
canvas remains beside the chat. Host support varies; when no such surface is
available, provide the returned **Open design** link instead.

Prefer the interactive MCP App when the connected host renders it. In that
surface, **Apply design updates** can submit the source-edit handoff to the
current host conversation after its normal confirmation. An ordinary Browser
pane has no trusted page-to-chat bridge: Apply uses Design's local agent there,
and **Copy prompt to your agent** is the coding-agent fallback.

Inside Design, choose **Show/Hide UI** from the `Cmd+K` menu or press Figma's
`Shift+\` shortcut. The same action is available from Design's empty-canvas
context menu.

For the full workflow, install the skill with the Agent-Native CLI:

```sh
npx @agent-native/core@latest skills add visual-edit
```

The hosted Design MCP connector handles the account-backed open, screen
placement, and source-edit workflow. Public/read-only designs may be viewed
without signing in; creating, saving, or sharing a design still requires an
authenticated account.
