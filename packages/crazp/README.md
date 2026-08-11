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
import ctx from "crazp:ctx";
import { defineTool } from "crazp";
import { z } from "zod";

export default defineTool({
  description: "Echo a message back with the current agent name.",
  inputSchema: z.object({
    message: z.string().describe("Message to echo back")
  }),
  execute: async ({ message }) => {
    return {
      message,
      agentName: ctx.agentName
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

## API

### `crazp:ctx`

Virtual module injected by the Crazp build pipeline. Use it inside tools to access runtime context:

```ts
import ctx from "crazp:ctx";

ctx.agentName;
ctx.env;
ctx.workspace;
```

If TypeScript cannot resolve `crazp:ctx`, include `crazp/modules.d.ts` in your app's TypeScript configuration or add `crazp/modules` to the `types` array.

## License

MIT
