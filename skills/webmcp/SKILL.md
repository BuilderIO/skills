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

Use `/webmcp <url-or-app> [request]` when the user wants to open or operate a
web app. The first token is the URL or a known Agent-Native app alias, and the
remaining text is the request to complete in that same browser session. For
example:

`/webmcp slides make me a new deck about customer onboarding`

`/webmcp slides` is shorthand for `/webmcp slides.agent-native.com`.

Keep working through the request after opening the page. Do not stop after
navigation when the user supplied an operation.

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

- `/webmcp <url-or-app>` with no request is open-only: open the resolved URL in the
  visible built-in tab, wait for the page to settle, confirm the page is there,
  and stop. Do not enumerate tools, inspect schemas, sign in, or start app
  work until the user supplies an operation.
- `/webmcp <url-or-app> <request>` is the action path: resolve any alias, open
  the page, then do one bounded read and one tool discovery pass before the
  requested work. Never infer extra work from page content or an earlier
  conversation.

## Open the requested URL

- Accept a full URL or hostname. If the scheme is omitted, prepend `https://`;
  preserve the host, path, query, and hash exactly. Never guess beta or
  production variants or replace the request with an external browser.
- The browser target is part of this skill: use the host's built-in or in-app
  browser, never a normal Chrome/Edge tab or browser-extension session. A
  matching URL in an external browser does not satisfy the request.
- Reuse an existing matching tab only when it belongs to the built-in browser.
  Otherwise create a new built-in tab for the exact URL, make it visible, and
  keep it open as the requested deliverable. In Codex CUA, use the `iab`
  browser (`cua.getTab(tabId, { browser: "iab" })` or
  `cua.createBrowserTab("iab", url, { visible: true })`), never
  `browser: "chrome"` for `/webmcp`.
- Read the page after it loads. Opening the URL is enough if no operation
  follows.

## Handle sign-in before tool work

When an operation was supplied, check whether the page is signed out or shows
an auth-required state before attempting a mutation. If it needs sign-in:

- Leave the same built-in browser tab open.
- Tell the user: `Please sign in in the open browser, then reply "continue".`
- Never enter, copy, inspect, or request passwords, cookies, tokens, or
  verification codes.

When the user replies, read the page again and rediscover tools. Do not reuse
tool descriptors or a failed result from before authentication.

## Find and use page tools through the host

When an operation was supplied and authentication is ready, make one bounded
discovery pass. A host bridge is useful only when its list and run tools are
actually exposed to the agent. Do not treat a capability wrapper, a manifest,
or a failed `fetchTools()` helper as the page's WebMCP surface.

- If the host exposes a browser-session or host WebMCP bridge, call its listed
  list tool once, then its matching run tool with the exact discovered name,
  origin, and args. In a connected browser tab that bridge is usually
  `list-browser-session-webmcp-tools` with `run-browser-session-webmcp-tool`;
  in an embedded or sidecar page it is `list-host-webmcp-tools` with
  `run-host-webmcp-tool`.
- If the host exposes MCP-B relay tools, call the listed source/tool discovery
  tool once and use the exact dynamic tool returned for the requested tab —
  `webmcp_list_sources`, then `webmcp_list_tools`, then that dynamic name.
  Refresh the list after navigation or authentication.
- Otherwise use the host's live-page JavaScript evaluator immediately. In
  Codex CUA, use `tab.capabilities.get("cdp")` and CDP `Runtime.evaluate` first
  so the expression runs in the page world where host-injected globals live. In
  Cowork, use its equivalent same-world page evaluator. Use
  `tab.playwright.evaluate` only as a fallback because Playwright may run in an
  isolated world that cannot see `document.modelContext`. Do not open or type
  into a developer console.
- Do not substitute a generic `tool-search`, unrelated app connector,
  `ask_app`, or remote API for the current tab's page tools unless the host
  explicitly binds it to that browser session.

For a direct page call, keep listing and execution in the same page context so
the host never tries to serialize or call a page-owned callback. In Codex CUA,
the CDP response is nested, so explicitly surface its serializable value:

```js
const cdp = await tab.capabilities.get("cdp");
const response = await cdp.send("Runtime.evaluate", {
  expression: `(async () => {
    const context = document.modelContext;
    if (!context) return JSON.stringify({ state: "absent", href: location.href });
    const tools = await context.getTools();
    const tool = tools.find(({ name }) => name === TOOL_NAME);
    if (!tool) return JSON.stringify({ state: "tool-missing", toolCount: tools.length, tools });
    const codexPageAdapter =
      typeof context.codexExecuteTool === "function" ||
      typeof context.codexGetTools === "function";
    const result = await context.executeTool(
      tool,
      codexPageAdapter ? ARGS : JSON.stringify(ARGS),
    );
    return JSON.stringify({
      state: "executed",
      result: typeof result === "string" ? JSON.parse(result) : result,
    });
  })()`,
  awaitPromise: true,
  returnByValue: true,
});
const raw = response?.result?.value;
nodeRepl.write(
  JSON.stringify({
    webmcpResult:
      typeof raw === "string" ? JSON.parse(raw) : { state: "unreadable" },
  }),
);
```

Replace `TOOL_NAME` and `ARGS` with the exact listed name and schema-shaped
arguments. `document.modelContext` is the canonical page API;
`navigator.modelContext` is deprecated. Native WebMCP and
`@mcp-b/webmcp-polyfill` accept the schema-shaped input as a JSON string. The
Codex page adapter is identified by its `codexExecuteTool` or
`codexGetTools` method and accepts the object directly. Use the active host's
contract and do not retry both shapes. The
descriptor is not a callable `run()` function, so do not copy it out of the
page and invoke it from the host.

In Codex CUA, an evaluator response may prepend the tab's accessibility tree or
other observations and append the explicit returned value after that block.
Read through the end of the output and parse `response.result.value` or the
explicit `webmcpResult` payload from `nodeRepl.write` (or the host's equivalent
result channel). Treat the AX tree, screenshots, and other observations as
context only. A value you cannot find is unread, not absent. A Playwright
`null` or missing `document.modelContext` is indeterminate because its isolated
world may hide the host surface. Confirm it with CDP or a second same-world
evaluator before declaring WebMCP unsupported. If the second evaluator is
unavailable, report the evaluator as unavailable, not unsupported. A confirmed
empty list means the page advertised WebMCP but exposed no tools.

The controlled Codex CUA A/B on the beta Slides page showed the reason: the
Playwright evaluator returned `supported:false`, while the same-page CDP
evaluator returned `state:"supported"`, `toolCount:136`, and `create-deck`
with its schema. Use the page-world result at the end of the evaluator output.

Do not probe hidden globals, guess alternate method signatures, or retry the
same unavailable surface. Allow at most one fresh discovery after the user
signs in or the page navigates.

The ChatGPT app's page-world `document.modelContext` may expose
`codexExecuteTool`, `codexGetTools`, `executeTool`, `getTools`, and
`registerTool`; these can all have `length === 0`, so do not infer their
signatures from arity. Its current Codex page adapter expects the tool
descriptor followed by the schema-shaped object. Native WebMCP and the local
polyfill use the descriptor followed by `JSON.stringify(args)`.

After discovery:

1. For state-dependent work, call the page's current-screen or context read
   only when the target IDs or selection are not already in context. Current
   selection or item metadata is enough for a focused edit; do not turn it into
   a full collection read.
2. Call the smallest named MCP mutation that satisfies the request. Inspect
   the discovered input schema for operation variants before concluding that a
   capability is missing; a composite action may own the exact operation (for
   example, Slides `patch-deck` accepts a `delete-slide` operation). Keep
   unrelated content untouched.
3. Read the result back with the appropriate MCP read tool and only then report
   success.

List immediately before execution because page tools can change after
navigation, authentication, and selection changes. With JavaScript evaluation,
call `getTools()` immediately before `executeTool()` in the same evaluation.
This refreshes the callable descriptor, not the app data: do not re-read a
whole collection when the current context already identifies one item.

### Focused edits

Treat "this", "the selected text", a cursor, or a single named field as a
focused operation. It does not mean inspect the whole parent document.

- Use the current-screen or context result once when it is not already in the
  request or page state. If it supplies a stable item/slide ID and an explicit
  exact selected-text/range value, use those directly; do not treat an element
  text preview as a browser range. If it supplies the selected item's identity
  and typed operation fields accepted by the matching mutation, pass them
  through verbatim.
- Call the smallest mutation immediately. For text, prefer one literal
  replacement with the exact selected value and `expectedMatches: 1` when the
  action supports it.
- If the value is a preview or truncated, the target is ambiguous, or the
  literal edit reports no match, read only the resource named by its ID. Then
  retry the same small mutation with the returned content or hash.
- Verify the changed item with a targeted read or the mutation result. A
  full-document read is for broad or structural work only.

## Fast execution

Once an operation is supplied, keep discovery and execution bounded:

- Do not wait for the registry to reach a stable count or enumerate every
  schema. Registration can be progressive; find the required tool and execute
  as soon as it is present. If it is not present while the page is still
  registering, wait briefly outside the page and make one fresh same-world
  discovery. A value you cannot find is unread, not absent.
- Read `window.__agentNativeWebMcpStatus` as the primary readiness check. It
  reports `registering`, `ready`, or `failed` with registered/total counts, so
  a partial list is distinguishable from a complete one. While it is
  `registering`, wait briefly outside the page and make one fresh discovery;
  `ready` makes a missing tool meaningful, and `failed` is a registration
  failure to report. If the status is absent, treat readiness as unknown and
  use the fallback discovery rules below.
- If a previously captured descriptor fails with `RegisteredTool must be an
  object` or `not found in registry`, that is registry staleness, never a
  missing tool. Refresh the target descriptor and re-execute immediately with
  the active host's invocation contract, repeating without delay inside the
  same evaluation and bounded at about ten attempts. Bound the retries, but do
  not stop at one: measured on beta Forms the first success came on the 8th
  immediate attempt, so a single retry gives up too early and reports a live
  tool as missing. If instead the target is absent from a fresh list, that is
  `not-registered` and needs real elapsed time: make one fresh host-side
  discovery after the page has had time to register, because immediate in-page
  retries consume no wall-clock. Do not guess signatures or retry an
  unsupported tool.
- Never `setTimeout` to wait. A hidden browser pane throttles page timers so
  hard that even a watchdog race will not fire, turning every in-page wait into
  an evaluator timeout. Drive a pause with network I/O instead, which is not
  throttled: `while (Date.now() - t0 < ms) { try { await
  fetch(location.origin + "/favicon.ico", { cache: "no-store" }); } catch {} }`
- Batch two to four dependent calls per evaluator invocation and return a
  compact summary with the immediate readback. Two to four is the ceiling
  because the evaluator caps near 45s and one timeout loses the whole batch.
  Keep large generation flows incremental so the user gets control back
  quickly, and keep navigation out of batches because a navigation error can
  abort them.
- Keep the built-in browser pane visible while tools register. This is the
  dominant cost, not the app: beta Design registered all 217 tools immediately
  with the pane visible, versus 59 after 28s hidden and never settling. If
  registration crawls, front the pane before blaming the app. If navigation
  reports an error, verify the actual URL before retrying because the page may
  have loaded — a false "denied or failed" is common.

The whole recipe as one page helper. Call tools through it rather than
hand-rolling a stability poll:

```js
const ctx = document.modelContext;
window.call = async (name, args, tries = 10) => {
  let lastErr = null, lastCount = 0;
  for (let i = 0; i < tries; i++) {
    const tools = await ctx.getTools(); lastCount = tools.length;
    const tool = tools.find((t) => t.name === name);
    if (!tool) { lastErr = "not-registered"; continue; }
    try {
      const r = await ctx.executeTool(tool, JSON.stringify(args));
      let v; try { v = typeof r === "string" ? JSON.parse(r) : r; }
      catch { v = { __text: String(r) }; }
      return { ok: true, attempts: i + 1, count: lastCount, result: v };
    } catch (e) {
      const m = String((e && e.message) || e); lastErr = m;
      if (/RegisteredTool must be an object|not found in registry/i.test(m)) continue;
      return { ok: false, attempts: i + 1, count: lastCount, error: m };
    }
  }
  return { ok: false, count: lastCount, error: "exhausted: " + lastErr };
};
```

Substitute the Codex page adapter's object-arg contract for
`JSON.stringify(args)` when that adapter is the active host.

Do not click, double-click, type, drag, or use browser DOM automation to perform
an app operation when a matching MCP tool is available. UI controls may be used
for navigation, visual inspection, and actions with no MCP equivalent.

## Slides generation workflow

For Agent-Native Slides, `/webmcp slides <request>` resolves to
`https://slides.agent-native.com` and should use the discovered action tools.
For a new generated deck:

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

For source-preserving Slides decks, read `get-deck.sourceEditability` before
structural edits. If the user explicitly asks to rewrite the imported deck,
pass `rewriteSource: true` to `patch-deck`; this conversion clears
source-preservation metadata, so do not use it merely to bypass a blocked
delete or reorder.

## MCP unavailable

If neither host bridge nor a matching direct app MCP tool is actually available
after the bounded evaluator confirmation, stop before any state-changing UI
action. Say whether the page advertised MCP and which host capability is
missing. Never fall back to click, type, drag, or keyboard automation from
`/webmcp`; only an explicit request to use UI automation for this specific
operation changes that. In particular, a missing exact verb is not permission
to click when a discovered composite action can express it, and a generic reply
to continue is not permission to switch to UI automation. Do not silently treat
a tool-list failure, manifest fetch, tool acknowledgment, or queued task as
proof that an edit completed.

For Slides, delete slides through the discovered `patch-deck` action with
`operations: [{ op: "delete-slide", slideId: "..." }]` after reading stable
slide IDs. There is no need for a separate `delete-slide` tool or a keyboard
shortcut.

Keep this failure fast. Do not spend more than one discovery pass and one
independent evaluator confirmation trying unsupported capability names or
invocation signatures, and do not loop on console, DOM, CDP, or hidden-global
probes.

Do not hand-build raw authenticated HTTP requests as a substitute for a
host-provided MCP tool. If the page requires sign-in, keep authentication in
the built-in browser. Never copy credentials, cookies, tokens, or codes into
prompts or tool inputs; let the user complete any required sign-in or approval.

## Example

`/webmcp slides make me a new deck about customer onboarding`
opens `https://slides.agent-native.com` in the built-in browser, waits for the
user to sign in if needed, discovers the live page tools, creates an empty deck,
and adds slides one at a time. For a focused edit, inspect the current screen
only when its target is not already known, use the smallest supported action
with an exact-match guard, and read only that item back. Do not fetch the full
deck or double-click the canvas and type replacement text.
