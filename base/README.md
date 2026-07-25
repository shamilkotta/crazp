# @nexp/base

Headless personal agent on [Project Think](https://developers.cloudflare.com/agents/harnesses/think/) (`@cloudflare/think`). Single durable general-purpose collaborator with continuously self-editable identity (soul, memory, user), Think-native skills, browser-based web research when needed, and optional delegation to one generic worker sub-agent.

No UI, no Alchemy — deploy with Wrangler only.

## Features

- **Identity & memory** — writable context blocks backed by `identity/*.md` in R2; the agent updates them continuously as it learns
- **Skills** — bundled + workspace skills via `getSkills()` (`activate_skill`, `read_skill_resource`)
- **Web research** — Cloudflare Browser Run tools + `execute` / `execute_bundle` (codemode)
- **Execution ladder** — Tier 0 workspace → Tier 1 `execute` → Tier 2 `execute_bundle` (npm) → Tier 3 browser → Tier 4 OS sandbox (`sandbox_*`)
- **Extensions** — `load_extension` / `list_extensions` for self-authored sandboxed tools
- **Smart delegation** — parent model calls the `worker` agent tool when a task is too heavy for one turn; one generic worker, not task-type sub-agents
- **Headless API** — REST for core files, skills catalog, bootstrap
- **CLI chat** — WebSocket client via `pnpm chat`

## Setup

```bash
# from repo root
pnpm install
pnpm --filter @nexp/base exec wrangler r2 bucket create nexp-workspace
```

## Local development

```bash
# from repo root
pnpm dev
```

In another terminal:

```bash
pnpm chat "Hello!"
# or interactive: pnpm chat
```

Bootstrap first-run onboarding:

```bash
curl -X POST http://localhost:5173/api/bootstrap/start
```

## REST API

| Method  | Path                               | Description                |
| ------- | ---------------------------------- | -------------------------- |
| GET     | `/api/files/core`                  | List identity files        |
| GET/PUT | `/api/files/core/identity/SOUL.md` | Read/write core files      |
| GET     | `/api/skills`                      | List workspace skills      |
| POST    | `/api/bootstrap/start`             | Start onboarding ritual    |
| POST    | `/api/bootstrap/reset`             | Dev-only reset (localhost) |
| GET     | `/health`                          | Health check               |

WebSocket chat: `ws://localhost:5173/agents/nexp/default`

## Deploy

```bash
# from repo root
pnpm deploy
```

Ensure `nexp-workspace` R2 bucket exists in your account.

## Project layout

```
agents/nexp/agent.ts              # NexpAgent (Think)
agents/nexp/agents/worker/agent.ts # Generic worker sub-agent (agentTool)
agents/nexp/skills/               # Bundled skills (agents:skills)
src/server.ts                     # REST API (Think entry fallthrough)
src/agent/execution-tools.ts      # Execution ladder tool builder
src/agent/tools/sandbox.ts        # Tier 4 sandbox tools
src/agent/tools/execute-bundle.ts # Tier 2 npm execution
src/worker-entry.ts               # Worker entry (Think + Sandbox export)
scripts/chat.mjs                  # Terminal chat client
```

## Bindings

See [wrangler.jsonc](./wrangler.jsonc): `AI`, `WORKSPACE_BUCKET` (R2), `BROWSER`, `LOADER`, `SANDBOX` (container), `ThinkAgent_Nexp`.
