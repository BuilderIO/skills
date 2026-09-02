# /webmcp

Open a requested URL in the host's built-in browser, then use the page's MCP
or WebMCP tools before browser UI automation for app communication or edits.

## Use it

Run `/webmcp <url>` with a full URL or hostname. The skill opens the requested
page in the built-in browser, preserves the requested path and query, and keeps
the page available for the rest of the task.

When the task requires app communication:

1. Discover and verify the page's actual MCP or WebMCP tools.
2. Read the current screen or context before state-dependent work.
3. Use the smallest named MCP mutation that satisfies the request.
4. Read the result back before reporting success.

Do not click, double-click, type, drag, or use browser DOM automation when a
matching MCP tool is available. If the host cannot discover or invoke MCP, stop
before a state-changing UI fallback and report that limitation.

## Install

```sh
npx @agent-native/skills@latest add --skill webmcp
```
