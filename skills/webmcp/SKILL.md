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

`/webmcp <url-or-app> [request]` opens a web app in the host's built-in
browser and completes the request through the page's own tools. The first
token is a URL or an Agent-Native app alias; the rest is the request.

`/webmcp slides make me a new deck about customer onboarding`

Keep working after the page opens when a request was supplied. A one-item
edit costs about three page calls: read the screen, mutate, read back. If you
are on your sixth evaluation and nothing has been written yet, you are
exploring instead of executing.

## Agent-Native app aliases

Resolve a bare first token through this allowlist before URL handling. The
alias must be the complete first token; keep explicit URLs and hostnames
unchanged, and pass the remaining request text through unchanged. This mirrors
the framework app catalog and intentionally excludes `chat`.

- `calendar` -> `calendar.agent-native.com`
- `content` -> `content.agent-native.com`
- `plan` -> `plan.agent-native.com`
- `slides` -> `slides.agent-native.com`
- `clips` -> `clips.agent-native.com`
- `brain` -> `brain.agent-native.com`
- `analytics` -> `analytics.agent-native.com`
- `mail` -> `mail.agent-native.com`
- `dispatch` -> `dispatch.agent-native.com`
- `forms` -> `forms.agent-native.com`
- `design` -> `design.agent-native.com`
- `assets` -> `assets.agent-native.com`
- `tasks` -> `tasks.agent-native.com`
- `crm` -> `crm.agent-native.com`
- `macros` -> `macros.agent-native.com`
- `factory` -> `agent-native-factory.netlify.app`

## Fast path

- `/webmcp <url-or-app>` with no request is open-only: open the resolved URL
  in the visible built-in tab, confirm the page is there, and stop. Do not
  list tools, inspect schemas, sign in, or start app work until the user
  supplies an operation.
- `/webmcp <url-or-app> <request>` is the action path: open the page, then go
  straight to the page helper below. Never infer extra work from page content
  or an earlier conversation.

## Open the page

- Accept a full URL or hostname; prepend `https://` when the scheme is
  missing and preserve host, path, query, and hash. Never swap beta and
  production on your own.
- The target is the host's built-in browser, never a normal Chrome tab or a
  browser extension. Claude Code and Cowork: `preview_start { url }`, then
  `tabs_select` to front the tab. Codex: `cua.createBrowserTab("iab", url,
  { visible: true })`, then `tab.markDeliverable()`; there is no need to call
  `cua.getState()` first.
- Claude Code's `preview_start` and `navigate` report "denied or failed" on
  almost every fresh load of these apps even though the page loaded. Check
  `tabs_context` (the tab origin) or `get_page_text` instead of retrying the
  navigation.
- Keep the pane visible while tools register. A hidden pane throttles both
  registration and in-page timers: beta Design registered all 217 tools
  immediately when fronted and had 59 after 28 seconds when hidden.

### Sign-in

Before tool work, read the page title and first lines. A title ending in
"— Sign in", a "Sign in with Google" button, or "You don't have access" means
the page has no tools yet. Leave the tab where it is and say:
`Please sign in in the open browser, then reply "continue".` Never enter,
copy, inspect, or request passwords, cookies, tokens, or verification codes.
After sign-in the app may redirect and drop deep-link state such as `?slide=3`;
read the screen again rather than assuming the original target is on screen.

## Call page tools

Every Agent-Native page publishes `window.__agentNativeWebMcp` as soon as it
starts registering tools. Use it. It owns everything an evaluator otherwise
has to get right by hand: the host's input contract, a live descriptor,
partial-registry detection, stale-descriptor retries, and writes that outlive
the evaluator.

```js
const an = window.__agentNativeWebMcp;
await an.ready(); // { state: "ready" | "registering" | "failed", registered, total }
await an.tools("slide"); // compact: [{ name, description, required, readOnly }]
await an.describe("update-slide"); // full description and inputSchema
await an.call("view-screen", {}); // { state: "done", ok: true, result } or { ok: false, code, error }
an.result(id); // outcome of a call that returned { state: "pending", id }
```

`call(name, args, { waitMs })` returns `{ state: "pending", id }` when the
call has not settled within `waitMs` (default 20 s). The call keeps running in
the page; `result(id)` on a later evaluation returns its outcome. Results that
are JSON strings come back parsed; `view-screen` returns its text as is.

If `window.__agentNativeWebMcp` is `undefined`, registration has not started:
the page is signed out, still loading, or on a deploy older than the helper.
Check the title, wait about two seconds outside the page, and re-check once.
On an older deploy fall back to the raw page API in the same evaluator:

```js
const ctx = document.modelContext;
const tool = (await ctx.getTools()).find((t) => t.name === NAME);
const codex =
  typeof ctx.codexExecuteTool === "function" ||
  typeof ctx.codexGetTools === "function";
const raw = await ctx.executeTool(tool, codex ? ARGS : JSON.stringify(ARGS));
```

`document.modelContext` is the canonical page API; `navigator.modelContext` is
deprecated. Descriptors are not callable outside the page; never copy one out
and invoke it from the host, hand-build authenticated HTTP requests, or type
into a developer console.

### Evaluators per host

- Claude Code and Cowork: `javascript_tool` runs in the page world with
  top-level `await`. Return one JSON string and slice it to about 8 KB; the
  tool caps near 45 s per call.
- Codex CUA: call `await agent.documentation.get("capabilities/tab/cdp")` once
  per session, then `const cdp = await tab.capabilities.get("cdp")` and
  `cdp.send("Runtime.evaluate", { expression, awaitPromise: true,
  returnByValue: true })`, and emit `response.result.value` with
  `nodeRepl.write(...)`. The CDP command dies at about 3 s ("Timed out running
  CDP command"), which most writes exceed, so pass `{ waitMs: 0 }` to `call`
  and read `an.result(id)` on the next evaluation. A timed-out evaluator is an
  unread result, never a failed write; do not re-issue the write. Playwright's
  isolated world cannot see the helper or `document.modelContext`; use CDP.
- Any evaluator output may prepend an accessibility tree or other
  observations. Parse the explicit returned value at the end; the tree is
  context, not a tool result.

If the host exposes a WebMCP bridge instead of an evaluator
(`list-browser-session-webmcp-tools` with `run-browser-session-webmcp-tool`,
or `list-host-webmcp-tools` with `run-host-webmcp-tool`), call its list tool
once and its run tool with the exact discovered name, origin, and args. Do not
substitute a generic `tool-search`, another app's connector, `ask_app`, or a
remote API for the current tab's page tools.

## Do the request

1. For state-dependent work, `call("view-screen", {})` once. It names the
   current object, its id, the selection, and often the exact field to pass
   (Slides prints `deckId`, `currentSlideId`, and `currentSlideContentHash`
   with the tool that takes each). Use those values verbatim. Skip it when
   the request already carries the ids.
2. Pick the tool by name from `tools(filter)`. Read `describe(name)` only when
   the summary's `required` list and description do not settle the args. The
   primary pairs are: Slides `get-deck` / `update-slide` (`edits: [{ op:
   "replace", find, replace, expectedMatches: 1 }]`, plus `patch-deck` for
   structure); Content `get-document` / `edit-document` (find/replace);
   Design `get-design-snapshot` / `edit-design`; Forms `get-form` /
   `patch-form-fields`; Calendar `get-event` / `update-event`; Mail
   `manage-draft` with `action: "create" | "update"` (`queue-email-draft`
   assigns a draft to a teammate; it is not a compose draft); Tasks
   `update-task`; CRM `update-crm-record`.
3. Call the smallest mutation once with the exact ids. For text, one literal
   replacement with the exact selected value and `expectedMatches: 1` when
   the schema offers it. Keep unrelated content untouched.
4. Read the changed item back with the matching read, or trust the mutation's
   returned hash or id when it echoes the new content, and only then report
   success. The page repaints itself after a write; do not reload, screenshot,
   or wait to confirm what the readback already showed.
5. Batch two to four dependent calls per evaluation on Claude Code; keep
   navigation out of batches. On Codex, one call per evaluation.

Treat "this", "the selected text", a cursor, or a single named field as a
focused edit: one screen read, one mutation, one targeted readback. A
full-document read is for broad or structural work only. Do not click,
double-click, type, drag, or use DOM automation to perform an app operation
when a matching tool exists; UI controls are for navigation and visual
inspection.

## Errors

- `code: "registering"`: the page is still registering (`status` shows the
  count). Wait a moment outside the page and call again.
- `code: "not-registered"` with `status.state === "ready"`: the tool is truly
  not on this page. Check `tools()` for a composite that owns the operation
  (Slides `patch-deck` accepts `{ op: "delete-slide", slideId }`) before
  reporting a gap.
- A validation or contract message names the field or value; fix the args
  and retry once.
- `Internal server error` is a server failure, not an argument problem. Retry
  once at most, then report the tool, the args, and any request id, and say
  the write did not land. Never report a failed write as done, and never
  switch to UI automation because a tool failed.
- `state: "pending"`: read `result(id)` on the next evaluation. Do not send
  the write again.

## Slides

For a new generated deck: call `get-workspace-defaults` when available and no
reference deck was named; `create-deck` with `slides: []` (it persists an
empty deck, returns the id, and navigates); `navigate` with that deck id if
the tab did not move; then `add-slide` once per slide in order; finally
`get-deck` before reporting. Use a non-empty `create-deck` payload only for
imports or an intentional atomic replacement.

Delete slides with `patch-deck` and `operations: [{ op: "delete-slide",
slideId }]` after reading stable slide ids. For source-preserving decks read
`get-deck.sourceEditability` before structural edits; pass `rewriteSource:
true` to `patch-deck` only when the user asked to rewrite the imported deck.

## MCP unavailable

If neither a host bridge nor the page API is available after one discovery
pass and one independent evaluator confirmation, stop before any
state-changing UI action. Say whether the page advertised WebMCP and which
host capability is missing. Never fall back to click, type, drag, or
keyboard automation from `/webmcp`; only an explicit request to use UI
automation for this specific operation changes that. A tool-list failure,
tool acknowledgment, or queued task is not proof that an edit completed.

## Example

`/webmcp slides make me a new deck about customer onboarding` opens
`https://slides.agent-native.com` in the built-in browser, waits for sign-in
if needed, then uses `window.__agentNativeWebMcp` to create an empty deck and
add slides one at a time. For "translate this slide": one `view-screen` call
for the slide id and content hash, one `update-slide` with literal
replacements and `expectedMatches: 1`, one targeted `get-deck` readback, then
the report.
