# nexp

pnpm monorepo for building agents on [Project Think](https://developers.cloudflare.com/agents/harnesses/think/) (`@cloudflare/think`).

## Workspace layout

```
base/                 # Reference agent app (headless personal agent)
packages/nexp/        # Agent setup framework (in development)
examples/             # Example apps built on nexp
```

## Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account with Workers AI, R2, Browser Rendering, Durable Objects, Worker Loaders, and **Containers** (for sandbox) enabled
- Docker running locally for sandbox container builds during `pnpm dev` / deploy

## Setup

```bash
pnpm install
```

Create the R2 bucket for the base agent (once):

```bash
pnpm --filter @nexp/base exec wrangler r2 bucket create nexp-workspace
```

## Development

Run the base agent locally:

```bash
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

## Deploy

```bash
pnpm deploy
```

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm dev`        | Start base agent dev server          |
| `pnpm chat`       | Terminal chat client for base agent  |
| `pnpm deploy`     | Build and deploy base agent          |
| `pnpm typecheck`  | Typecheck all workspace packages     |
| `pnpm lint`       | Lint entire workspace                |
| `pnpm format`     | Format entire workspace              |
| `pnpm check`      | format:check + lint + typecheck      |

See [base/README.md](./base/README.md) for base agent API details and project layout.
