# Harnesses

The benchmark drives three coding-agent harnesses through their official SDKs. Each request is an independent conversation, isolated from the user's own setup so the model can't use tools or read instructions.

| Harness | SDK | Reasoning levels | Structured output |
| --- | --- | --- | --- |
| Codex | `@openai/codex-sdk` | `minimal`, `low`, `medium`, `high`, `xhigh`, `max` | Native (`outputSchema`) |
| Claude Code | `@anthropic-ai/claude-agent-sdk` | `low`, `medium`, `high`, `xhigh`, `max` | Native (`outputFormat`) |
| OpenCode 2.x | `@opencode-ai/client` (pinned prerelease) | `low`, `medium`, `high` (model variants) | Schema in prompt, JSON parsed from the reply |

`default` leaves reasoning unset, so the harness or model decides.

## Isolation

- **Codex.** Each session gets a private temporary home (mode 0700) containing only a copy of `~/.codex/auth.json`, deleted on close. It runs `codex exec --ephemeral --ignore-user-config --ignore-rules` with:
  - read-only sandbox, no network, web search disabled, approval policy `never`
  - instruction files, MCP, plugins, skills, history and tool features turned off
- **Claude Code.** `tools: []`, `settingSources: []` (no settings files or CLAUDE.md), no MCP servers, plugins, skills, hooks or memory, `persistSession: false`, and a custom system prompt that replaces the Claude Code preset.
- **OpenCode.**
  - **Binary and server:** OpenCode is found on `PATH` or in `~/.opencode/bin`. The benchmark starts its own `opencode serve` on a free port, with a private temporary HOME, config, data and cache.
  - **Credentials:** only provider credential rows are read from `~/.local/share/opencode/opencode.db` and copied into the temporary database. Your database is opened read-only and never written. This uses Node's built-in SQLite, hence Node.js ≥ 22.13.
  - **Disabled:** user and project config, AGENTS.md discovery, tools (`{"*": false}` plus deny-all permissions), MCP, skills and optional plugins.
  - **Sessions:** each request creates and then deletes its own session, and nothing is added to your OpenCode history.

## OpenCode notes

- **Version.** Requires OpenCode **2.x** (tested with 2.0.32). OpenCode 2 moved its server API to `/api/...` with password authentication. The stable 1.x SDK can't talk to it, and OpenCode 1.x can't open a data folder that 2.x has migrated. The 2.x client is still a prerelease, pinned to `@opencode-ai/client@0.0.0-beta-19271`. Later 2.x releases are accepted but may change the API; `run.json` records the installed version and the tested one.
- **Free tier.** OpenCode's hosted free models reject tool-free sessions with `403 FreeTierError` ("OpenCode's free tier can only be used from within OpenCode"). The benchmark keeps tools disabled and reports this as a non-retryable error. Use a provider you've added your own API key for.

## Errors and usage limits

| Situation | What happens | Exit code |
| --- | --- | ---: |
| Timeout, network or other transient failure | Retried with backoff (1 s, 2 s, … up to 30 s), up to `--retries` | — |
| Auth failure, unknown model, missing CLI | Run stops with status `failed` | 1 |
| Subscription usage, plan or quota limit | Run stops with status `limited`, everything is saved, and the CLI prints `Usage limit reached (<harness>). Rerun the same command after it resets to resume.`, plus the reset time when known | 3 |
| Ctrl+C | In-flight sessions are aborted and the run is saved as `cancelled`; press again to exit immediately | 130 |

A bare HTTP 429 is retried at most twice before it counts as a limit. Explicit usage-limit errors stop immediately without retries. Warnings about approaching a limit are ignored.

Limit detection is based on each SDK's error types and on strings found in the installed binaries:
- **Codex:** `usage_limit_reached`, `quota_exceeded` and `rate_limit_exceeded`, with `resets_at`.
- **Claude Code:** rejected `rate_limit_event`s, `rate_limit` assistant errors and `api_error_status: 429`.
- **OpenCode:** provider 429s, `insufficient_quota` and `QuotaExhaustedError`.

None of these have been triggered against a real subscription. They're tested with simulated errors.
