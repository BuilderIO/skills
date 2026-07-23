# /rewind

Recover a recent local moment from Clips Desktop without turning your desktop
into a hosted archive. Rewind helps an agent find what you just said, saw, or
did by searching bounded local chapters first, then the smallest useful range
of local transcript, OCR, or frame context.

## Requirements

- macOS with a current [Clips Desktop](https://www.agent-native.com/docs/template-clips)
  build.
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

The recommended path is in Clips Desktop:

1. Open the Clips tray, turn on **Rewind**, and select **Visuals** or
   **Visuals + audio**.
2. Complete the macOS permission prompts.
3. Click **Set up your agent** on the Rewind card and paste the copied prompt
   into your agent. It installs the reusable skill and the local MCP connection
   together.
4. Restart the agent only if it cannot reload MCP servers in place.

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
using Rewind as prose-only instructions.

## First Test

Ask your agent: **“Look at Rewind.”** A working setup calls
`screen_memory_status` first and reports that Rewind is enabled and unpaused.
For a recent moment, it searches chapters before reading the smallest useful
local context range.

## Repair

If Rewind is unavailable:

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
