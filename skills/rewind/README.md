# /rewind

Recover a recent local moment from Clips Desktop without turning your desktop
into a hosted archive. Rewind helps an agent find what you just said, saw, or
did by searching bounded local chapters first, then the smallest useful range
of local transcript, OCR, or frame context.

## Requirements

- macOS with the current signed [Clips Desktop](https://clips.agent-native.com/download)
  app installed and running.
- A compatible coding-agent host: Codex, Claude Code, Cursor, OpenCode, GitHub
  Copilot, or Cowork.
- Rewind enabled in the Clips tray. It is disabled by default, and macOS may
  request the capture permissions that match the mode you choose.

## Privacy And Retention

Rewind stores its rolling buffer locally. You choose the capture mode,
excluded/private apps, and retention in Clips. The skill searches local screen
memory through the `clips-screen-memory` MCP connection; it does not expose
archive paths or upload raw frames, audio, transcripts, OCR, or indexes.

If local evidence is not enough, an agent can propose the smallest timestamp
range for a bounded private Clip handoff. That escalation is explicit; it is not
a hosted fallback wearing a fake mustache.

## Set Up Rewind

You can invoke `/rewind` before doing any setup. If Clips Desktop is missing,
the agent should explain the prerequisite and ask permission before opening the
official download page. It must not silently download or install Clips, bypass
Gatekeeper, accept macOS permission prompts, or enable capture for you.

After permission, a capable agent can open the official install flow. If the
agent cannot control native UI, it should give you the direct
[Clips Desktop download link](https://clips.agent-native.com/download) and wait
for you to finish. Then:

1. Install and launch Clips Desktop.
2. Open the Clips tray, turn on **Rewind**, and select **Visuals** or
   **Visuals + audio**.
3. Complete the macOS permission prompts yourself.
4. Click **Set up your agent** on the Rewind card and paste the copied prompt
   into your agent. It installs the reusable skill and the local MCP connection
   together.
5. Restart the agent only if it cannot reload MCP servers in place.

To repair or configure a connection directly, run this in a terminal with the
matching client name:

```sh
npx -y @agent-native/core@latest skills add rewind --client codex --scope user --yes
```

The public skills installer also supports Rewind:

```sh
npx @agent-native/skills@latest add --skill rewind
```

Both advertised paths must install the local `clips-screen-memory` connection;
if either reports that it cannot do so, treat setup as incomplete rather than
using Rewind as prose-only instructions. These commands configure the agent;
they do not install or enable Clips Desktop.

## First Test

Ask your agent: **“Look at Rewind.”** A working setup calls
`screen_memory_status` first and reports that Rewind is enabled and unpaused.
For a recent moment, it searches chapters before reading the smallest useful
local context range.

## Repair

If Rewind is unavailable:

- If Clips Desktop is missing, ask the agent to open the official
  [download page](https://clips.agent-native.com/download), or open it yourself.
- Confirm Clips Desktop is current, running on macOS, and Rewind is enabled in
  its tray settings.
- Run the direct command above with a supported `--client` value, then restart
  the agent if it does not reload MCP configuration.
- Update to a current Node runtime before retrying the installer.
- If your host is not listed above, it is not yet a supported Rewind MCP host;
  do not point it at a hosted endpoint as a substitute.

See the [Clips documentation](https://www.agent-native.com/docs/template-clips)
and [Agent Native source](https://github.com/BuilderIO/agent-native) for the
current product and implementation details.
