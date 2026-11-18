# Black Buck benchmark inventory

Gallery packaging note (7 September 2026): paths below and in `inventory.json` record the original collection locations. The gallery serves preserved copies from `../../raw/`. In particular, the Gemini artifact and its supporting `styles.css`, `simulation.js` and `resolved_elements.json` are now in [the Antigravity directory](../../raw/Gemini%203.5%20Flash%20%28High%29/antigravity-flash/); this workspace's root `index.html` opens the gallery. Recorded hashes refer to the original benchmark bytes, not the gallery entry page.

Addition (23 September 2026): `opus55` (claude-opus-5-5) added from `Dev/vulcan-5.5`; copy in `../../raw/claude-opus-5-5/opus55/`, hash-verified. Project moved to `Dev/buck-bench` as the source of truth; `Dev/black-buck` is the superseded copy.

Addition (30 September 2026): `sol61` added from `Dev/vulcan-6-1`, with the user-supplied model name **GPT-Sol 6.1**. The HTML and README are preserved in `../../raw/gpt-sol-6-1/sol61/`; the supplied `preview.png` is used as the gallery screenshot. Copies are hash-verified. The entry is placed immediately after Claude Fable 5.1 by request. Release date verified as 29 September 2026 using [OpenAI’s system card addendum](https://deploymentsafety.openai.com/gpt-6-1-sol/respecting-auto-review). Session-level model metadata has not been verified.

Addition (19 November 2026, evening): `sol6` (gpt-6-sol, xhigh, Codex TUI); `sonnet45-era200` (Claude Code 2.0.0, release era, no browser tool) and `sonnet45-era2132` (Claude Code 2.1.32 with Chrome). Sonnet 4.5 researched only on 2.0.0 and never viewed its page in any harness except the discarded first attempt.

Addition (19 November 2026, era harness): `opus46-era` (Claude Code 2.1.32) and `sonnet46-era` (2.1.45), each run on the Claude Code version current at the model's release, in an isolated install and clean config. Both researched and checked their pages in Chrome, unlike their runs on today's Claude Code. Sonnet's run used a claude.ai Exa connector for search (see inventory). The installs, config and login were removed afterwards.

Addition (19 November 2026, later): reruns `opus46-run2` and `sonnet46-run2` with the Artifact tool blocked; both saved to the run folder and checked their pages in Chrome, neither looked anything up online. The first runs stay as `Run 1` versions. Log review notes: `../../sessions/run-review.md`, `../../sessions/prompt-history.md`.

Addition (19 November 2026): clean Claude Code runs `sonnet55`, `opus45`, `opus46`, `sonnet46`, `sonnet45` (from `Dev/buck`, one at a time) and `sol62` (gpt-6.2-sol, xhigh, Codex TUI in `Documents/Vulcan`). Fable 5.2 split into `fable52-v1` (original, reconstructed and verified) and `fable52` (v2, from the user's forked session). Run settings and per-run behaviour are in `inventory.json`; session logs are in the gitignored `../../sessions/` with a contamination report (all clean).

Addition (18 November 2026): `fable52` (claude-fable-5-2, xhigh) from `Dev/vulcan-f52` and `astra62` (gpt-6.2-astra, high) from `Dev/vulcan-6-2`; copies in `../../raw/claude-fable-5-2/fable52/` and `../../raw/gpt-6-2-astra/astra62/`, hash-verified. Both were launched as T3 Code threads with the verbatim prompt. Screenshots taken with headless Chrome at 1440×900 on page load.

Collected 5 September 2026. Information gathering only; existing benchmark files were not changed. Unknown/unconfirmed model entries, unfinished attempts, and conversions of externally created artifacts are excluded.

27 eligible artifact entries. An entry can contain supporting files or identical copies; revisions are separate entries, not necessarily independent runs.

| Entry | Model evidence | Primary artifact |
|---|---|---|
| astra62 | gpt-6.2-astra | [index.html](</Users/onesteppplusgmai.com/Dev/vulcan-6-2/index.html>) |
| fable52 | claude-fable-5-2 | [black-buck-refuelling.html](</Users/onesteppplusgmai.com/Dev/vulcan-f52/black-buck-refuelling.html>) |
| opus55 | claude-opus-5-5 | [black-buck-refuelling.html](</Users/onesteppplusgmai.com/Dev/vulcan-5.5/black-buck-refuelling.html>) |
| vulcan-v1 | claude-fable-5 | [black-buck.html](</Users/onesteppplusgmai.com/Dev/Vulcan/black-buck.html>) |
| vulcan-v2 | claude-fable-5 | [black-buck-v2.html](</Users/onesteppplusgmai.com/Dev/Vulcan/black-buck-v2.html>) |
| opus5-v1 | claude-opus-5 | [black-buck.html](</Users/onesteppplusgmai.com/Dev/vulcan-O5/black-buck.html>) |
| opus5-v2 | claude-opus-5 | [black-buck-v2.html](</Users/onesteppplusgmai.com/Dev/vulcan-O5/black-buck-v2.html>) |
| fable51-simulation | claude-fable-5-1 | [black-buck.html](</Users/onesteppplusgmai.com/Dev/vulcan-2/black-buck.html>) |
| fable51-story | claude-fable-5-1 | [black-buck-story.html](</Users/onesteppplusgmai.com/Dev/vulcan-2/black-buck-story.html>) |
| sol61 | GPT-Sol 6.1 (user-confirmed) | [index.html](../../raw/gpt-sol-6-1/sol61/index.html) |
| sol-codex | gpt-5.6-sol | [index.html](</Users/onesteppplusgmai.com/Dev/vulcan-sol/index.html>) |
| sol-claude-harness | gpt-5.6-sol | [index.html](</Users/onesteppplusgmai.com/Dev/vulcan-sol-c/index.html>) |
| sonnet5 | claude-sonnet-5 | [black-buck-1-refuelling.html](</Users/onesteppplusgmai.com/Dev/vulcan-s-5/black-buck-1-refuelling.html>) |
| astra | gpt-6-astra | [index.html](</Users/onesteppplusgmai.com/Dev/vulcan-ast/index.html>) |
| documents-opus48 | claude-opus-4-8 | [index.html](</Users/onesteppplusgmai.com/Documents/bb-visualisation/index.html>) |
| aaa-opus47 | claude-opus-4-7 | [index.html](</Users/onesteppplusgmai.com/Dev/AAA-Misc/bb-visualisation-opus-4-7/index.html>) |
| kimi3 | kimi-k3 | [black-buck.html](</Users/onesteppplusgmai.com/Dev/vulcan-k3/black-buck.html>) |
| ox | GLM-5.3 | [black-buck.html](</Users/onesteppplusgmai.com/Dev/vulcan-ox/black-buck.html>) |
| grok45 | grok-4.5 | [index.html](</Users/onesteppplusgmai.com/Dev/vulcan-grok/index.html>) |
| antigravity-flash | Gemini 3.5 Flash (High) | [index.html](</Users/onesteppplusgmai.com/Dev/black-buck/index.html>) |

## Evidence and interpretation

- `recorded_model`: literal model label in response/session metadata. These IDs are not translated into marketing names.
- `recorded_selection`: Antigravity recorded a UI model selection; this is weaker than a per-response model field.
- Arena/Claude origin URLs are filesystem download metadata. They establish the originating conversation, not its selected model.
- SHA-256 hashes identify exact bytes. File modification dates are recorded for reference, not treated as creation dates.
- Session summaries guided discovery; raw logs, transcript file operations and database message records were used for attribution. The transcript renderer sometimes omits early exchanges or mislabels Codex source type, so source format/model attribution comes from raw metadata.

## Provenance by entry

### astra62

Single-prompt build with the verbatim benchmark prompt, reasoning effort high, in a T3 Code thread (Codex harness). Only `exec` tool calls (web search and shell); no subagents or skills recorded. About 3 minutes and 6,281 output tokens. An earlier scheduled attempt in the same project ran on claude-opus-5-5 by mistake and was stopped before writing output; it is excluded. Release: OpenAI's [model release notes](https://help.openai.com/en/articles/9624314-model-release-notes) list GPT-6.2 Astra without its own date, above the 16 November entry; 17 November 2026 comes from launch coverage.

- Source: [rollout-2026-11-18T09-45-58-01a1ebb0-3e8c-7770-b9c7-f40bba795796.jsonl](</Users/onesteppplusgmai.com/.codex/sessions/2026/11/18/rollout-2026-11-18T09-45-58-01a1ebb0-3e8c-7770-b9c7-f40bba795796.jsonl>).
- `gpt-6.2-astra` at JSONL line 1.

### fable52

Single-prompt build with the verbatim benchmark prompt, effort xhigh, in a T3 Code thread (Claude Code harness). Tools: Bash, Read, Write, WebSearch, WebFetch, ToolSearch and T3 preview tools; no subagents or skills recorded. Release: 9 November 2026 per the [Claude Platform release notes](https://platform.claude.com/docs/en/release-notes/overview).

- Source: [c565cbb5-afbd-40e9-98ec-aabef81f648e.jsonl](</Users/onesteppplusgmai.com/.claude/projects/-Users-onesteppplusgmai-com-Dev-vulcan-f52/c565cbb5-afbd-40e9-98ec-aabef81f648e.jsonl>).
- `claude-fable-5-2` at JSONL line 21.

### opus55

Single-prompt build with the verbatim benchmark prompt, high effort. No subagents or skills recorded.

- Source: [6e73071a-a341-46f9-90d5-2b46375404fe.jsonl](</Users/onesteppplusgmai.com/.claude/projects/-Users-onesteppplusgmai-com-Dev-vulcan-5-5/6e73071a-a341-46f9-90d5-2b46375404fe.jsonl>).
- `claude-opus-5-5` at JSONL line 30.

### vulcan-v1

Original HTML build; same session later created v2. Earlier inline widget is a separate attempt.

- Source: [430a5b71-c24a-41ff-9fb6-722916f6b568.jsonl](</Users/onesteppplusgmai.com/.claude/projects/-Users-onesteppplusgmai-com-Dev-Vulcan/430a5b71-c24a-41ff-9fb6-722916f6b568.jsonl>).
- `claude-fable-5` at JSONL line 8.

### vulcan-v2

Continuation with geography, silhouettes, sound and formation cards. d5dce303 is a shorter fork, not an independent benchmark.

- Source: [430a5b71-c24a-41ff-9fb6-722916f6b568.jsonl](</Users/onesteppplusgmai.com/.claude/projects/-Users-onesteppplusgmai-com-Dev-Vulcan/430a5b71-c24a-41ff-9fb6-722916f6b568.jsonl>).
- `claude-fable-5` at JSONL line 8.

### opus5-v1

Fresh build; folder O5 is supported by raw model ID.

- Source: [1719c439-7c0b-4227-9b41-8aaa179b6abc.jsonl](</Users/onesteppplusgmai.com/Dropbox/Apps/rclone_claude/claude_projects_backup/-Users-onesteppplusgmai-com-Dev-vulcan-O5/1719c439-7c0b-4227-9b41-8aaa179b6abc.jsonl>).
- `claude-opus-5` at JSONL line 10.

### opus5-v2

Follow-up revision of same run, with refuelling formation and fuel-model improvements.

- Source: [1719c439-7c0b-4227-9b41-8aaa179b6abc.jsonl](</Users/onesteppplusgmai.com/Dropbox/Apps/rclone_claude/claude_projects_backup/-Users-onesteppplusgmai-com-Dev-vulcan-O5/1719c439-7c0b-4227-9b41-8aaa179b6abc.jsonl>).
- `claude-opus-5` at JSONL line 10.

### fable51-simulation

Fresh detailed simulation. Codex 01a06054 only checked whether this session was active; it did not create this file.

- Source: [421c5d33-0976-4c68-819d-511ecec790bf.jsonl](</Users/onesteppplusgmai.com/.claude/projects/-Users-onesteppplusgmai-com-Dev-vulcan-2/421c5d33-0976-4c68-819d-511ecec790bf.jsonl>).
- `claude-fable-5-1` at JSONL line 24.

### fable51-story

Separate narrative/story revision requested in the same session.

- Source: [421c5d33-0976-4c68-819d-511ecec790bf.jsonl](</Users/onesteppplusgmai.com/.claude/projects/-Users-onesteppplusgmai-com-Dev-vulcan-2/421c5d33-0976-4c68-819d-511ecec790bf.jsonl>).
- `claude-fable-5-1` at JSONL line 24.

### sol61

Fact: the user supplied `Dev/vulcan-6-1/index.html` and identified the model as **GPT-Sol 6.1** on 30 September 2026. HTML, README and screenshot copies match the supplied files byte-for-byte. OpenAI’s official introduction is dated **29 September 2026 (Tuesday)**, verified on 30 September 2026 using the [system card addendum](https://deploymentsafety.openai.com/gpt-6-1-sol/respecting-auto-review) and [Enterprise/Edu release notes](https://help.openai.com/en/articles/10128477-chatgpt-enterprise-and-edu-release-notes). The release notes describe a rollout starting with Pro users and expanding to other plans. No inference about the harness, exact prompt or tooling is made; session metadata has not been checked.

- Source: [index.html](</Users/onesteppplusgmai.com/Dev/vulcan-6-1/index.html>).
- Archived output: [index.html](../../raw/gpt-sol-6-1/sol61/index.html).

### sol-codex

Codex build. 019f6ad5 is an earlier planning attempt.

- Source: [rollout-2026-07-16T22-12-04-019f6ad7-53dc-7e73-b27a-28e02cb82710.jsonl](</Users/onesteppplusgmai.com/.codex/sessions/2026/07/16/rollout-2026-07-16T22-12-04-019f6ad7-53dc-7e73-b27a-28e02cb82710.jsonl>).
- `gpt-5.6-sol` at JSONL line 8.

### sol-claude-harness

Model ID is GPT despite Claude-format JSONL; includes v1-to-v2 iteration in one file.

- Source: [1f458c3a-8720-43af-b8a0-5f648d4758a3.jsonl](</Users/onesteppplusgmai.com/Dropbox/Apps/rclone_claude/claude_projects_backup/-Users-onesteppplusgmai-com-Dev-vulcan-sol-c/1f458c3a-8720-43af-b8a0-5f648d4758a3.jsonl>).
- `gpt-5.6-sol` at JSONL line 12.

### sonnet5

Completed build; older logs recovered from Dropbox backup.

- Source: [fffa6f91-af65-4ab7-86b2-7800f24d4b3a.jsonl](</Users/onesteppplusgmai.com/Dropbox/Apps/rclone_claude/claude_projects_backup/-Users-onesteppplusgmai-com-Dev-vulcan-s-5/fffa6f91-af65-4ab7-86b2-7800f24d4b3a.jsonl>).
- `claude-sonnet-5` at JSONL line 18.

### astra

Codex creation session. Claude 9e4d7410 in this directory is unrelated plugin/model discussion, not authorship.

- Source: [rollout-2026-09-05T20-16-20-01a07111-b3d9-7ac0-a590-16f308f90ba9.jsonl](</Users/onesteppplusgmai.com/.codex/sessions/2026/09/05/rollout-2026-09-05T20-16-20-01a07111-b3d9-7ac0-a590-16f308f90ba9.jsonl>).
- `gpt-6-astra` at JSONL line 8.

### documents-opus48

Main build model; Sonnet 4.6 subagent also contributed (see supporting sessions). Later 5e9e081b in the same directory is unrelated tools discussion.

- Source: [02565888-9d61-40f6-b721-ed61e69cecf0.jsonl](</Users/onesteppplusgmai.com/Dropbox/Apps/rclone_claude/claude_projects_backup/-Users-onesteppplusgmai-com-Documents-bb-visualisation/02565888-9d61-40f6-b721-ed61e69cecf0.jsonl>).
- `claude-opus-4-8` at JSONL line 10.

### aaa-opus47

Session wrote bb-visualisation/index.html; current folder is renamed. Matching content is supported by subject, size and recorded implementation, but exact rename history was not established. Build delegated to same-model subagent ab1ad4185dff24125; subsequent parent changes.

- Source: [d6e9187f-fbcc-418d-a43b-6cb9c5c5a0b6.jsonl](</Users/onesteppplusgmai.com/Dropbox/Apps/rclone_claude/claude_projects_backup/-Users-onesteppplusgmai-com-Dev-AAA-Misc/d6e9187f-fbcc-418d-a43b-6cb9c5c5a0b6.jsonl>).
- `claude-opus-4-7` at JSONL line 6.

### kimi3

OpenCode SQLite source, not original JSONL. Backup is byte-identical; gateway ping sessions do not establish authorship.

- OpenCode session: `ses_08a9471edffeLowDw1K6mQsdgb`; selected database records in [opencode-evidence.json](opencode-evidence.json).

### ox

OpenCode SQLite source, not original JSONL. Recorded ID is `stealth/ox-alpha`; user confirmed on 5 September 2026 that OX Alpha is **GLM-5.3**.

- OpenCode session: `ses_fd6358afaffeHCIwfVBW8MoGLa`; selected database records in [opencode-evidence.json](opencode-evidence.json).

### grok45

Grok native JSONLs recovered.

- Source: [events.jsonl](</Users/onesteppplusgmai.com/.grok/sessions/%2FUsers%2Fonesteppplusgmai.com%2FDev%2Fvulcan-grok/019f433e-715a-7f92-b9ef-921a57320fbb/events.jsonl>).

### antigravity-flash

Recorded UI selection, not per-response API model ID. Current workspace already contained this benchmark before inventory work.

- Source: [transcript_full.jsonl](</Users/onesteppplusgmai.com/.gemini/antigravity/brain/6c70f2c4-0c8f-4094-9a16-fd71ae117350/.system_generated/logs/transcript_full.jsonl>).

## Duplicates and relationships

- The Kimi backup equals Dev/vulcan-k3/black-buck.html byte-for-byte and is not counted separately.
- v1/v2 and simulation/story variants are related in-session revisions, not independent fresh runs.

## Outstanding gaps

1. Establish the exact rename history for the AAA-Misc Opus 4.7 folder.
2. Decide whether future benchmark comparisons use first output, latest revision, or both. Prompts and allowed tooling differ between runs; these are not controlled, identical-condition tests.

Search covered artifact filenames and content in Documents, Dev and Downloads; session stores in Claude, Codex, Grok, OpenCode, Antigravity, local archive and Dropbox Claude backup. This is a broad local inventory, not a guarantee that every web-only or deleted version was recovered.

Machine-readable details, hashes, original session paths, timestamps, archive manifests and supporting subagent model IDs are in [inventory.json](inventory.json).

TL;DR: 18 simulation artifacts retained, including the user-confirmed GPT-Sol 6.1 entry.
