# Playbook: running a new model

## 1. Send the run

1. Make a new folder outside this repo: `~/Dev/vulcan-<short>` (e.g. `vulcan-f52`, `vulcan-6-2`).
2. Start a fresh agent there: a T3 thread (`t3_thread_launch` with `modelSelection`) or a CLI session.
3. Name the thread or session innocuously: "Vulcan" or "Black Buck". No "test", no model name.
4. Send the first prompt only, verbatim (see `index.html`).
5. Check the model actually running: the Claude JSONL (`~/.claude/projects/<folder>/`) or the Codex rollout (`~/.codex/sessions/`) records `model` and `effort`.

To time a Codex run to a fresh 5-hour window: `codexbar usage --provider codex` shows "Resets <time>".

A T3 scheduled task (`schedule_task`) ran on Opus 5.5 even though the project default was set to Astra (2026-11-18). Launch the thread directly with `modelSelection` instead.

### Claude models: clean run with a browser (2026-11-19)

Runs go one at a time in `~/Dev/buck`, using `scripts/run-sequence.sh` in this repo (pass model ids as arguments; it writes to ~/Dev/buck and ~/Dev/buck-runs):

```bash
cd ~/Dev/buck && CLAUDE_CODE_DISABLE_FEATURE_FLAGS=1 claude -p --safe-mode --chrome --disable-slash-commands --disallowed-tools Artifact --dangerously-skip-permissions --model <model> --effort xhigh -n Vulcan --output-format json "<prompt>"
```

- `--safe-mode`: no user skills, plugins, hooks, MCP, CLAUDE.md or output style.
- `--chrome`: Claude in Chrome tools, driving the real Chrome in its own tab group.
- `CLAUDE_CODE_DISABLE_FEATURE_FLAGS=1` with skip-permissions: Chrome runs without approval prompts (tested 2026-11-18).
- `--disable-slash-commands`: removes built-in skills, including the Chrome helper skill.
- `--disallowed-tools Artifact`: blocks publishing to claude.ai. Opus 4.6 and Sonnet 4.6 published their pages before this was added.
- Claude in Chrome refuses `file://` URLs. The runner serves the run folder at `http://localhost:8607/` and adds one line with `--append-system-prompt`: "Files in the working directory are served at http://localhost:8607/." Without it, Sonnet 4.5 never checked its page.
- Some models save into Claude Code's scratchpad (`/private/tmp/claude-501/...`), not the run folder; the runner copies that too.
- Run the runner inside `tmux` so it survives the launching session ending.
- Set `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000` (Claude Code clamps it to each model's max). At the 32,000 default, Sonnet 4.6 at high spent four replies only thinking and wrote nothing (open bug [#102429](https://github.com/anthropics/claude-code/issues/102429)).
- The JSONL is saved as normal under `~/.claude/projects/-Users-onesteppplusgmai-com-Dev-buck/`.
- Effort that actually applied (session log): Sonnet 5.5 xhigh; Opus 4.6, Opus 4.5, Sonnet 4.6 high; Sonnet 4.5 none.

### Release-era Claude Code (optional, 2026-11-19)

To match a model's original harness, install the Claude Code version current at its release with `npm install --prefix <dir> @anthropic-ai/claude-code@<version>` and run it with a clean `CLAUDE_CONFIG_DIR` (one `/login`). Set `DISABLE_AUTOUPDATER=1`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`, `ENABLE_CLAUDEAI_MCP_SERVERS=false`, and unset `CLAUDECODE` when launching from inside Claude Code. These versions rewrite Chrome's native-host file (`~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`); back it up and restore it after. Remove the install, config and its `Claude Code-credentials-<hash>` keychain item when done.

After each run: move everything in `~/Dev/buck` out, leave the folder empty, delete the project's `memory/` folder, keep the JSONL.

## 2. Add it to the gallery

1. Copy the output unchanged into `raw/<model-id>/<entry-id>/`.
2. Add a `modelReleases` entry (date + first-party source) and an `artifacts` entry in `gallery.js`.
3. Add a 1440×900 screenshot at `screenshots/<entry-id>.png`.
4. Update the model and output counts in `index.html`.
5. Record provenance (session ID, model, effort, SHA-256) in `research/black-buck-inventory/inventory.json` and its README.
6. Check desktop, mobile, version switching and output links.
