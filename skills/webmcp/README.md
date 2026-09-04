# /webmcp

Open a requested URL in the host's built-in browser, then use the page's MCP
or WebMCP tools before browser UI automation for app communication or edits.

## Use it

Run `/webmcp <url-or-app> [request]`. The first token is a full URL, a
hostname, or an Agent-Native app alias such as `slides`; the rest is the
request to complete in that same tab.

```text
/webmcp slides make me a new deck about customer onboarding
```

With no request, `/webmcp <url-or-app>` is a fast open-only handoff: the skill
opens the visible built-in tab, confirms the page loaded, and stops. Tool work
begins when an operation is present.

"Built-in browser" means the host's in-app browser, not a matching Chrome or
Edge tab. In Codex CUA that is the `iab` browser. If the page is signed out,
the skill leaves the tab open and asks the user to sign in there, then resumes
after the user replies.

## How it calls tools

Every Agent-Native page publishes `window.__agentNativeWebMcp` once it starts
registering WebMCP tools. The skill calls that helper from the host's
same-world JavaScript evaluator (Claude Code and Cowork `javascript_tool`;
Codex CDP `Runtime.evaluate`) instead of hand-writing `document.modelContext`
code:

```js
const an = window.__agentNativeWebMcp;
await an.call("view-screen", {}); // ids and selection for the current screen
await an.call("update-slide", { deckId, slideId, edits }); // smallest mutation
await an.call("get-deck", { id: deckId, slideId }); // targeted readback
```

The helper picks the host's input contract, always executes a live descriptor,
retries stale-descriptor errors, distinguishes "still registering" from
"not on this page", and returns `{ state: "pending", id }` when a call outlives
the evaluator so `result(id)` can pick it up on the next evaluation. That last
part matters on Codex, whose CDP evaluator times out at about three seconds.

A one-item edit is three calls: read the screen, mutate, read back. The page
repaints itself after a write, so the skill does not reload or screenshot to
confirm. When the helper is missing the page is signed out, still loading, or
on an older deploy; the raw `document.modelContext` call is the fallback.

If the host exposes a WebMCP bridge (`list-browser-session-webmcp-tools` and
`run-browser-session-webmcp-tool`, or the `list-host-webmcp-tools` pair), the
skill uses that instead. Generic `tool-search`, unrelated app connectors,
`ask_app`, and remote APIs do not count unless the host binds them to the
current tab.

If neither a bridge nor an evaluator is available, the skill stops before any
state-changing click or type fallback and reports the limitation. Only an
explicit request to use UI automation for that operation changes this.

## Install

```sh
npx @agent-native/skills@latest add --skill webmcp
```
