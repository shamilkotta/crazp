# crazp

Filesystem first framework helpers for building agent projects with minimal setup.

`crazp` gives agent apps a small typed surface for defining agents, tools, subagents, and project config. It is designed around an agent as a directory workflow: Markdown for instructions and skills, TypeScript for tools, and a simple config file when you need to customize behavior.

## Install

```bash
pnpm add crazp
```

## Why Crazp?

- Define agents with plain TypeScript files.
- Keep instructions, tools, skills, and subagents in a filesystem first project layout.
- Create and deploy agents without hand wiring the same setup each time.

## Quick Start

Create an agent file:

```ts
// agent/agent.ts
import { defineAgent } from "crazp";

export default defineAgent({
  name: "assistant",
  model: "openai/gpt-5.4",
  maxSteps: 250,
  instructions: "You are a personal assistant"
});
```

Add a tool:

```ts
// agent/tools/echo.ts
import { defineTool } from "crazp";
import { z } from "zod";

export default defineTool({
  description: "Echo a message back with the current agent name.",
  inputSchema: z.object({
    message: z.string().describe("Message to echo back")
  }),
  execute: async ({ message }) => {
    return {
      message
    };
  }
});
```

Add a subagent when you want to delegate work:

```ts
// agent/subagents/researcher/agent.ts
import { defineSubagent } from "crazp";

export default defineSubagent({
  displayName: "Researcher",
  description: "Research a focused question and return concise findings.",
  model: "openai/gpt-5.4",
  maxSteps: 100
});
```

Add a channel when the agent should listen on Telegram, Slack, Discord, WhatsApp, or the web widget:

```ts
// agent/channels/telegram.ts
import { env } from "crazp:ctx";
import { telegramChannel } from "crazp/channels";

export default telegramChannel({
  token: env.TELEGRAM_BOT_TOKEN as string,
  userName: "assistant_bot",
  secretToken: env.TELEGRAM_WEBHOOK_SECRET_TOKEN as string | undefined
});
```

Channel modules can import `env` from `crazp:ctx` at the top level (Worker bindings from `agent/env.json` / Wrangler).

Put secrets in `agent/env.json` (or Wrangler secrets) and install the matching adapter:

```bash
pnpm add @chat-adapter/telegram
```

Think mounts messenger webhooks at `/messengers/<filename>/webhook`. The Crazp worker entry forwards that path to the root agent Durable Object automatically.

Custom HTTP routes from `defineCustomChannel` mount at `/<filename>/<route>`. Example: `agent/channels/webhook.ts` with `POST("/hook")` → `/webhook/hook`.

The default session API (`crazpChannel`) is registered automatically at `/crazp/v1/*`. Author `agent/channels/crazp.ts` to replace it (for example to change auth).

## API

### `crazp:ctx`

Module injected by the Crazp build pipeline. `env` is available at module top level (Worker bindings from `agent/env.json` / Wrangler):

```ts
import { env } from "crazp:ctx";

env.TELEGRAM_BOT_TOKEN;
```

If TypeScript cannot resolve `crazp:ctx`, include `crazp/modules.d.ts` in your app's TypeScript configuration or add `crazp/modules` to the `types` array.

### Channels (`crazp/channel`)

All channel helpers export from a single entry:

| Export                               | Provider                                 |
| ------------------------------------ | ---------------------------------------- |
| `telegramChannel`                    | Chat SDK Telegram                        |
| `slackChannel`                       | Chat SDK Slack                           |
| `discordChannel`                     | Chat SDK Discord                         |
| `whatsappChannel`                    | Chat SDK WhatsApp                        |
| `teamsChannel`                       | Chat SDK Microsoft Teams                 |
| `twilioChannel`                      | Chat SDK Twilio                          |
| `githubChannel`                      | Chat SDK GitHub                          |
| `linearChannel`                      | Chat SDK Linear                          |
| `googleChatChannel` / `gchatChannel` | Chat SDK Google Chat                     |
| `xChannel`                           | Chat SDK X (Twitter)                     |
| `webChannel`                         | Web widget policy                        |
| `emailChannel`                       | Custom policy placeholder                |
| `mcpChannel`                         | MCP placeholder                          |
| `chatSdkChannel`                     | Any Chat SDK adapter                     |
| `crazpChannel`                       | Default HTTP session API (`/crazp/v1/*`, auto-registered) |
| `defineCustomChannel`                | Author HTTP routes under `/<filename>/…` |

## License

MIT
