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
token is a URL or an app alias; the rest is the request.

`/webmcp slides make me a new deck about customer onboarding`

## The two rules

1. **Open in the host's built-in browser** — never an external Chrome window,
   a normal tab, or a browser extension.
2. **Call the page's tools.** Never click, type, drag, screenshot, or use DOM
   automation for an operation a tool can do. UI controls are for navigation
   and visual inspection only.

That is the whole contract. Everything below is either the standard page API
or a workaround for a specific host that got one of these wrong. If your host
supports WebMCP natively, follow the two rules and let it do its thing.

## Fast path

- `/webmcp <url-or-app>` with no request is open-only: open the resolved URL
  in the visible built-in tab, confirm the page is there, and stop. Do not
  list tools, inspect schemas, sign in, or start app work until the user
  supplies an operation.
- `/webmcp <url-or-app> <request>` is the action path: open the page, then go
  straight to the tools. Never infer extra work from page content or an
  earlier conversation.

Keep working after the page opens when a request was supplied. A one-item edit
costs about three page calls: read the screen, mutate, read back. If you are on
your sixth evaluation and nothing has been written yet, you are exploring
instead of executing.

## Open the page

- Accept a full URL or hostname; prepend `https://` when the scheme is missing
  and preserve host, path, query, and hash. Never swap beta and production on
  your own.
- Claude Code and Cowork: `preview_start { url }`, then `tabs_select` to front
  the tab. Codex: `cua.createBrowserTab("iab", url, { visible: true })`, then
  `tab.markDeliverable()`.
- Keep the pane visible while tools register. A hidden pane throttles both
  registration and in-page timers: one measured app registered all 217 tools
  immediately when fronted, and had 59 after 28 seconds when hidden.

### Sign-in

Before tool work, read the page title and first lines. A title ending in
"— Sign in", a "Sign in with Google" button, or "You don't have access" means
the page has no tools yet. Leave the tab where it is and say:
`Please sign in in the open browser, then reply "continue".` Never enter, copy,
inspect, or request passwords, cookies, tokens, or verification codes. After
sign-in the app may redirect and drop deep-link state such as `?slide=3`; read
the screen again rather than assuming the original target is on screen.

## Call page tools

**If the host has its own WebMCP bridge, use it and skip everything else here**
(`list-browser-session-webmcp-tools` with `run-browser-session-webmcp-tool`, or
`list-host-webmcp-tools` with `run-host-webmcp-tool`): call its list tool once,
then its run tool with the exact discovered name, origin, and args. Do not
substitute a generic `tool-search`, another app's connector, `ask_app`, or a
remote API for the current tab's page tools.

Otherwise evaluate in the page. `document.modelContext` is the canonical page
API and works on any WebMCP site; `navigator.modelContext` is deprecated.

```js
const ctx = document.modelContext;
const tool = (await ctx.getTools()).find((t) => t.name === NAME);
const codex =
  typeof ctx.codexExecuteTool === "function" ||
  typeof ctx.codexGetTools === "function";
const raw = await ctx.executeTool(tool, codex ? ARGS : JSON.stringify(ARGS));
```

Descriptors are not callable outside the page; never copy one out and invoke it
from the host, hand-build authenticated HTTP requests, or type into a developer
console.

### Evaluators, per host

- **Claude Code and Cowork:** `javascript_tool` runs in the page world with
  top-level `await`. Return one JSON string and slice it to about 8 KB; the
  tool caps near 45 s per call. Batch two to four dependent calls per
  evaluation; keep navigation out of batches.
- **Codex:** try `tab.capabilities.get("webmcp").fetchTools()` once per session
  first. Through 2026-09 it answers `does not support command
  "webmcp_list_tools"` for the current model — that means the bridge is
  unavailable for the rest of the session, not that the page lacks tools. Then
  use CDP: `globalThis.__cdp ??= await tab.capabilities.get("cdp")`, then
  `await globalThis.__cdp.documentation()` once (the first CDP call fails
  without it), then `cdp.send("Runtime.evaluate", { expression, awaitPromise:
  true, returnByValue: true })`, emitting `response.result.value` with
  `nodeRepl.write(...)`. One call per evaluation. Playwright's isolated world
  cannot see `document.modelContext`; use CDP.
- Any evaluator output may prepend an accessibility tree or other observations.
  Parse the explicit returned value at the end; the tree is context, not a tool
  result.

### Host bugs worth knowing

Each cost a real debugging session. None is a page or app fault — do not
diagnose them as one.

- **Codex CDP dies at about 3 s** ("Timed out running CDP command"). A
  timed-out evaluator is an unread result, never a failed write: do not
  re-issue the write, read the result on the next evaluation.
- **Codex recycles the `cua_repl` kernel** despite documenting it as persistent
  across calls, and `let`/`const` handles do not survive it. Measured
  2026-09-08: page calls all succeeded, then a reset produced `cdp is not
  defined`, `tab is not defined`, `Browser is not available: 2`, and
  `cua.getState()` spent 5.4-6.6 s returning "Sky Computer Use native pipe
  startup failed". Keep handles on `globalThis` and re-resolve them at the top
  of every evaluation; on any of those errors reopen the tab and re-run
  `documentation()`. Never reach for `cua.getState()` to recover — that is the
  call that fails.
- **Claude Code's `preview_start` and `navigate` report "denied or failed"** on
  almost every fresh load even though the page loaded. Check `tabs_context` or
  `get_page_text` instead of retrying the navigation.

## Do the request

1. For state-dependent work, read the screen once for the current object, its
   id, and the selection. Skip it when the request already carries the ids.
2. Pick the tool by name. The page's tool list and the app's own MCP
   `instructions` are the index — read them rather than guessing. When the
   screen read already names the tool and its arguments, call it directly;
   listing and describing tools is for unfamiliar apps and unsettled args, not
   a ritual before every edit.
3. Call the smallest mutation once with the exact ids. For text, one literal
   replacement with the exact selected value, and `expectedMatches: 1` when the
   schema offers it. Keep unrelated content untouched.
4. Read the changed item back, or trust the mutation's returned hash or id when
   it echoes the new content, and only then report success. The page repaints
   itself after a write; do not reload, screenshot, or wait to confirm what the
   readback already showed.

When a result carries a `nextRequiredAction`, it names the next tool; follow it.

You are the model for the whole request. "Generate a deck", "design a todo
app", "write a landing page", "draft a form" means you author the content and
save it through the app's own create and update tools. Never hand the authoring
to the app's built-in agent, never call a tool whose description says to stop
and wait for the user's answer in the app (those answers go to the in-app chat,
not to you), and never call a generic `ask_app` when a named tool can do the
work. If a decision is genuinely open, ask in your own chat and keep going with
a stated default.

Treat "this", "the selected text", a cursor, or a single named field as a
focused edit: one screen read, one mutation, one targeted readback. Scope
follows the words, not the selection: "this text" means the selection, while
"this slide", "this screen", or "this section" means the whole current item
even when a text selection happens to exist.

For a style change (dark mode, a new palette, "match the others"), the item you
edit is one of many and the user expects it to look like its siblings. Read the
shared style first and reuse those values, and read one real sibling the way you
would open a neighboring source file before a structural restyle — a color
tally settles colors and fonts, never spacing or element order. Introduce a
color or font the document does not already use only when the user asks for it.

## Errors

- Still registering: wait a moment outside the page and call again.
- Tool not found while the page reports ready: it is truly not on this page.
  Check the tool list for a composite that owns the operation before reporting
  a gap.
- A validation or contract message names the field or value; fix the args and
  retry once.
- `Internal server error` is a server failure, not an argument problem. Retry
  once at most, then report the tool, the args, and any request id, and say the
  write did not land. Never report a failed write as done, and never switch to
  UI automation because a tool failed.
- Pending: read the result on the next evaluation. Do not send the write again.

## MCP unavailable

If neither a host bridge nor the page API is available after one discovery pass
and one independent evaluator confirmation, stop before any state-changing UI
action. Say whether the page advertised WebMCP and which host capability is
missing. Never fall back to click, type, drag, or keyboard automation from
`/webmcp`; only an explicit request to use UI automation for this specific
operation changes that. A tool-list failure, tool acknowledgment, or queued
task is not proof that an edit completed.

## Agent-Native extras

Everything above is generic. This section is a convenience for Agent-Native
apps and applies to no other site.

**Aliases.** A bare first token resolves through this list before URL handling;
explicit URLs and hostnames pass through unchanged. `calendar`, `content`,
`plan`, `slides`, `clips`, `brain`, `analytics`, `mail`, `dispatch`, `forms`,
`design`, `assets`, `crm`, `macros` -> `<name>.agent-native.com`; `factory` ->
`agent-native-factory.netlify.app`. `chat` is intentionally excluded.

**Page helper.** Agent-Native pages also publish `window.__agentNativeWebMcp`,
a wrapper over `document.modelContext` adding readiness and partial-registry
state, a tools filter, and calls that outlive the evaluator. It is ours, not
part of WebMCP — no other site has it, so check before depending on it, and
never treat its absence as "this page has no tools".

```js
const an = window.__agentNativeWebMcp;
await an.ready();                              // { state, registered, total }
await an.tools("slide");                       // [{ name, description, required, readOnly }]
await an.describe("update-slide");
await an.call("view-screen", {}, { waitMs: 2000 });
an.result(id);                                 // for { state: "pending", id }
```

`call` returns `{ state: "pending", id }` when it has not settled within
`waitMs`; the call keeps running in the page. Under Codex's ~3 s CDP cap pass
`{ waitMs: 2000 }` so reads and most writes come back done in the same
evaluation, and do not pair every call with a `result()` read by default.

If it is `undefined`, registration has not started — the page is signed out,
still loading, or on an older deploy. Use `document.modelContext` above.

**Native connector.** If the host already has the app configured as its own MCP
server and those tools are present, prefer them for server-backed work: that
transport survives a browser or host reset. An entry with a bare `url` and no
`Authorization` header registers zero tools — a missing `agent-native connect
<url>`, not an app without MCP. Hosted apps serve a trimmed connector catalog
by default and page-local tools exist only in the page, so this supplements the
page rather than replacing it.
