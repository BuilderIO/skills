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

Use `/webmcp <url>` when the user wants to open or operate a web app. It owns
the browser surface and the MCP-first decision for the rest of that task.

## Open the requested URL

- Accept a full URL or hostname. If the scheme is omitted, prepend `https://`;
  preserve the host, path, query, and hash exactly. Never guess beta or
  production variants or replace the request with an external browser.
- Reuse an existing matching tab without reloading. Otherwise open it in the
  host's built-in or in-app browser. Make it visible when the user asks to open
  it and keep it open as the requested deliverable.
- Read the page after it loads. Opening the URL is enough if no operation
  follows.

## Use MCP before UI controls

After navigation and before communicating with the page:

1. Discover actual page-local WebMCP tools or host-provided MCP/app tools. Treat
   a manifest or instructions page as metadata, not proof that the host can
   invoke tools; verify the discovery capability.
2. For any state-dependent operation, call the page's current-screen or
   context read first. Use the exact IDs and selection metadata returned there.
3. Call the smallest named MCP mutation that satisfies the request. Keep
   unrelated content untouched.
4. Read the result back with the appropriate MCP read tool and only then report
   success.

Do not click, double-click, type, drag, or use browser DOM automation to perform
an app operation when a matching MCP tool is available. UI controls may be used
for navigation, visual inspection, and actions with no MCP equivalent.

## MCP unavailable

If the host cannot discover or invoke the page's MCP tools, stop before any
state-changing UI action. Say whether the page advertised MCP and whether the
host could use it. Ask the user before using click or type automation as a
fallback. Do not silently treat a tool-list failure, manifest fetch, tool
acknowledgment, or queued task as proof that an edit completed.

Do not hand-build raw authenticated HTTP requests as a substitute for a
host-provided MCP tool. If the page requires sign-in, keep authentication in
the built-in browser. Never copy credentials, cookies, tokens, or codes into
prompts or tool inputs; let the user complete any required sign-in or approval.

## Example

`/webmcp slides.agent-native.com` opens `https://slides.agent-native.com` in the
built-in browser and prepares the page for MCP-first work. For a focused Slides
edit, inspect the current screen, use the smallest supported slide-edit action,
and read the slide back. Do not double-click the canvas and type replacement
text.
