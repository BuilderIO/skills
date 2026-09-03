# /webmcp

Open a requested URL in the host's built-in browser, then use the page's MCP
or WebMCP tools before browser UI automation for app communication or edits.

## Use it

Run `/webmcp <url> [request]` with a full URL or hostname. The skill opens the
requested page in the built-in browser, preserves the requested path and query,
and keeps the page available for the rest of the task. The remaining text is
the request to complete in that same tab.

With no request, `/webmcp <url>` is a fast open-only handoff: the skill opens
the visible built-in tab, confirms the page loaded, and stops without eagerly
listing tools or starting work. Tool discovery begins when an operation is
present.

```text
/webmcp slides.agent-native.com make me a new deck about customer onboarding
```

“Built-in browser” means the host's in-app browser, not a matching Chrome or
Edge tab. If the URL is already open externally, open a separate in-app tab for
the exact URL. In Codex CUA, use the `iab` browser and make the tab visible.

If the page is signed out, the skill leaves the tab open and asks the user to
sign in there, then resumes discovery after the user replies.

When the task requires app communication, use the first path that is actually
exposed, with one bounded discovery pass:

1. A host browser-session or host WebMCP bridge, if its list and run tools are
   available to the agent.
2. MCP-B local relay tools, if they are listed by the host.
3. The browser host's live-page JavaScript evaluator. In Codex CUA, use the
   exposed CDP `Runtime.evaluate` first; in Cowork, use its equivalent
   same-world page evaluator. `tab.playwright.evaluate` is only a fallback
   because its isolated world may not see host-injected globals. Call
   `document.modelContext.getTools()` and `document.modelContext.executeTool()`
   in the same page context with the exact listed descriptor.

Generic `tool-search`, unrelated app connectors, `ask_app`, and remote APIs do
not count unless the host explicitly binds them to the current browser tab.

Do not rely on `tab.capabilities.get("webmcp").fetchTools()`, copy a descriptor
out of the page to call it, guess alternate signatures, or use a visible
developer console. `document.modelContext` is canonical. Native WebMCP and
`@mcp-b/webmcp-polyfill` pass schema-shaped input as `JSON.stringify(args)`;
the current Codex page adapter passes the object directly. Follow the active
host's documented contract and do not retry both shapes.

When using Codex CUA, explicitly emit the evaluator's serializable return value
through `nodeRepl.write` (or the equivalent host result channel). CUA may also
show the tab's accessibility tree in the same result. That tree is observation,
not the WebMCP return value. If Playwright returns `null` or no
`document.modelContext`, confirm with CDP or another same-world evaluator before
calling the page unsupported. If the explicit result is missing, report the
evaluator as unavailable instead of treating the AX tree as a tool list or
trying hidden probes.

Read the current screen or context before state-dependent work, inspect the
discovered schema for composite operation variants, use the smallest matching
mutation, and read the result back before reporting success. A missing exact
verb is not proof that the capability is unavailable.

For Slides, delete slides with the `patch-deck` WebMCP action and its
`{ op: "delete-slide", slideId: "..." }` operation after reading stable slide
IDs. Do not select thumbnails or press Delete when that action is available.

For source-preserving decks, `get-deck` reports structural edits as blocked and
names the explicit `patch-deck` conversion path. Use `rewriteSource: true` only
when the user asked to rewrite the imported deck.

Do not click, double-click, type, drag, or use browser DOM automation when a
matching MCP tool or JavaScript evaluator is available. Do not use the visible
developer console as a substitute. If the host cannot discover or invoke MCP
and has no JavaScript evaluator, stop before any state-changing UI fallback and
report that limitation. Only an explicit request to use UI automation for that
specific operation changes this. A Playwright-only missing
`document.modelContext` is indeterminate, not a fast unsupported result; confirm
it through a second evaluator or report the host surface as unavailable.

## Install

```sh
npx @agent-native/skills@latest add --skill webmcp
```
