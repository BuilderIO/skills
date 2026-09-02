# /webmcp

Open a requested URL in the host's built-in browser, then use the page's MCP
or WebMCP tools before browser UI automation for app communication or edits.

## Use it

Run `/webmcp <url> [request]` with a full URL or hostname. The skill opens the
requested page in the built-in browser, preserves the requested path and query,
and keeps the page available for the rest of the task. The remaining text is
the request to complete in that same tab.

```text
/webmcp slides.agent-native.com make me a new deck about customer onboarding
```

If the page is signed out, the skill leaves the tab open and asks the user to
sign in there, then resumes discovery after the user replies.

When the task requires app communication, try these paths in order:

1. A host browser-session or host WebMCP bridge.
2. MCP-B local relay tools, starting with `webmcp_list_sources` and
   `webmcp_list_tools`.
3. The browser host's JavaScript evaluator, calling
   `document.modelContext.getTools()` and then
   `document.modelContext.executeTool()` with the exact listed descriptor.

Read the current screen or context before state-dependent work, use the
smallest named mutation, and read the result back before reporting success.

Do not click, double-click, type, drag, or use browser DOM automation when a
matching MCP tool or JavaScript evaluator is available. Do not use the visible
developer console as a substitute. If the host cannot discover or invoke MCP
and has no JavaScript evaluator, stop before a state-changing UI fallback and
report that limitation.

## Install

```sh
npx @agent-native/skills@latest add --skill webmcp
```
