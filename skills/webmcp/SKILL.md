---
name: webmcp
description: >-
  Open a user-provided URL in the host's built-in browser and use the page's
  MCP or WebMCP tools before browser UI automation for app communication or
  edits.
metadata:
  visibility: exported
---

# WebMCP

Use `/webmcp <url> [request]` when the user wants to open or operate a web app.
The first token is the URL and the remaining text is the request to complete in
that same browser session. For example:

`/webmcp slides.agent-native.com make me a new deck about customer onboarding`

Keep working through the request after opening the page. Do not stop after
navigation when the user supplied an operation.

## Open the requested URL

- Accept a full URL or hostname. If the scheme is omitted, prepend `https://`;
  preserve the host, path, query, and hash exactly. Never guess beta or
  production variants or replace the request with an external browser.
- Reuse an existing matching tab without reloading. Otherwise open it in the
  host's built-in or in-app browser. Make it visible when the user asks to open
  it and keep it open as the requested deliverable.
- Read the page after it loads. Opening the URL is enough if no operation
  follows.

## Handle sign-in before tool work

After opening the page, check whether it is signed out or shows an auth-required
state before attempting a mutation. If it needs sign-in:

- Leave the same built-in browser tab open.
- Tell the user: `Please sign in in the open browser, then reply "continue".`
- Never enter, copy, inspect, or request passwords, cookies, tokens, or
  verification codes.

When the user replies, read the page again and rediscover tools. Do not reuse
tool descriptors or a failed result from before authentication.

## Find and use page tools through the host

After navigation and authentication, discover tools in this order:

- Prefer a host bridge when one is exposed. In a connected browser tab, use
  `list-browser-session-webmcp-tools`; in an embedded or sidecar page, use
  `list-host-webmcp-tools`. Run the matching `run-browser-session-webmcp-tool`
  or `run-host-webmcp-tool` with the exact discovered name, origin, and args.
- If the host has the MCP-B local relay configured, use its MCP tools. Call
  `webmcp_list_sources`, then `webmcp_list_tools`, then the exact dynamic tool
  name returned for the requested tab. Refresh the list after navigation or
  authentication.
- If neither bridge is available, use the browser host's JavaScript evaluation
  tool, such as its Playwright or Chrome DevTools evaluate capability. Evaluate
  the WebMCP API in the live page, not in a visible developer-console tab:

  ```js
  const tools = await document.modelContext.getTools();
  const tool = tools.find(({ name }) => name === TOOL_NAME);
  if (!tool) throw new Error(`WebMCP tool ${TOOL_NAME} is unavailable`);
  const result = await document.modelContext.executeTool(
    tool,
    JSON.stringify(ARGS),
  );
  return typeof result === "string" ? JSON.parse(result) : result;
  ```

  Replace `TOOL_NAME` and `ARGS` with the discovered tool name and
  schema-shaped arguments. `document.modelContext` is the canonical page API;
  `navigator.modelContext` is deprecated. This is a direct call into the
  current page's registered function, not a raw HTTP request or DOM automation.

Use the first path that is actually available. Do not claim that a manifest or
`document.modelContext` check proves the host can invoke tools. The host must
provide either a bridge, a relay, or a JavaScript evaluation capability.

After discovery:

1. For any state-dependent operation, call the page's current-screen or
   context read first. Use the exact IDs and selection metadata returned there.
2. Call the smallest named MCP mutation that satisfies the request. Keep
   unrelated content untouched.
3. Read the result back with the appropriate MCP read tool and only then report
   success.

List immediately before execution because page tools can change after
navigation, authentication, and selection changes. If using JavaScript
evaluation, call `getTools()` immediately before `executeTool()` and pass the
descriptor returned by that same listing.

Do not click, double-click, type, drag, or use browser DOM automation to perform
an app operation when a matching MCP tool is available. UI controls may be used
for navigation, visual inspection, and actions with no MCP equivalent.

## Slides generation workflow

For Agent-Native Slides, `/webmcp slides.agent-native.com <request>` should
use the discovered action tools. For a new generated deck:

1. Call `get-workspace-defaults` when it is available and no reference deck or
   design system was named.
2. Call `create-deck` with `slides: []` or omit `slides`. It persists an empty
   editable deck, returns its id, and sends a navigation command to open it.
3. If the connected tab did not move, call `navigate` with that deck id.
4. Call `add-slide` once per slide in order and wait for each result. Read the
   deck back with `get-deck` before reporting completion.

Use a non-empty `create-deck` payload only for imports or an intentional atomic
bulk replacement. The empty-deck workflow lets the user watch the deck grow
without one long, fragile tool call.

## MCP unavailable

If neither host bridge nor a matching direct app MCP tool is actually available,
stop before any state-changing UI action. Say whether the page advertised MCP
and which host capability is missing. Ask the user before using click or type
automation as a fallback. Do not silently treat a tool-list failure, manifest
fetch, tool acknowledgment, or queued task as proof that an edit completed.

Do not hand-build raw authenticated HTTP requests as a substitute for a
host-provided MCP tool. If the page requires sign-in, keep authentication in
the built-in browser. Never copy credentials, cookies, tokens, or codes into
prompts or tool inputs; let the user complete any required sign-in or approval.

## Example

`/webmcp slides.agent-native.com make me a new deck about customer onboarding`
opens `https://slides.agent-native.com` in the built-in browser, waits for the
user to sign in if needed, discovers the live page tools, creates an empty deck,
and adds slides one at a time. For a focused edit, inspect the current screen,
use the smallest supported slide-edit action, and read the slide back. Do not
double-click the canvas and type replacement text.
