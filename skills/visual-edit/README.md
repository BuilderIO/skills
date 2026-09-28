# /visual-edit

Open a running local app in the Agent-Native Design surface as URL-backed iframe
screens for visual inspection, route-state exploration, and source-backed edits.

Use `/visual-edit` when a UI needs to be reviewed or changed in context: compare
real routes, inspect responsive states, walk a multi-screen flow, duplicate a
screen for a new URL state, or apply visual changes back through the coding
agent. The canvas uses the app's live routes and local bridge rather than a
copied static HTML snapshot.

## Install

Run this from your app repository to install the skill and hosted Design
connector:

```sh
npx @agent-native/core@latest skills add visual-edit
```

## Examples to try

- **One screen:** `/visual-edit the dashboard at desktop size`
- **Several screens:** `/visual-edit compare the dashboard, settings, and reports pages side by side`
- **A full flow:** `/visual-edit the onboarding flow from welcome through account created`
- **Responsive sizes:** `/visual-edit show the dashboard at desktop, tablet, and mobile widths`

## Example: refine an onboarding flow

Start your app locally, then ask your coding agent:

```text
/visual-edit the onboarding flow, plus home at every breakpoint
```

Design can place the four onboarding screens and Home at desktop, tablet, and
mobile sizes together on one canvas. Select the **Get started** button, change
its fill with the color picker, and drag its padding on the canvas to see the
layout respond.

When the result looks right, ask your coding agent to **Pull in my visual
edits**. The agent retrieves the pending batch and updates the app's source for
you to review. Design does not write those changes to your code automatically.

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

The hosted Design MCP connector handles the account-backed open, screen
placement, and source-edit workflow. Public/read-only designs may be viewed
without signing in; creating, saving, or sharing a design still requires an
authenticated account.

For the complete walkthrough and sharing details, see the [Visual Edit guide
in Agent-Native](https://github.com/BuilderIO/agent-native/blob/main/skills/visual-edit/README.md).
