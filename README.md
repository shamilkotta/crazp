# crazp

Filesystem first framework for building agents with minimal setup.

Crazp is inspired by [Vercel Eve](https://vercel.com/eve): an agent should feel like a directory you can understand, extend, and deploy. Instructions and skills live in Markdown, tools live in TypeScript, and configuration stays close to the agent.

## Workspace Layout

```txt
packages/crazp/        # Public authoring API: define agents, tools, subagents, config
packages/core/         # Build pipeline and CLI used by Crazp projects
examples/              # Examples built with Crazp
base/                  # Reference agent app used while building the framework
```

`base/` is intentionally different from the framework packages. It is a running reference agent built on Cloudflare Think, and it helped shape the framework while Crazp was being developed. See [`base/README.md`](./base/README.md) for its runtime specific setup.

## Agent Shape

A Crazp project is organized around an `agent/` directory:

```txt
agent/
  instructions.md
  agent.ts
  tools/
    echo.ts
  skills/
    research/SKILL.md
  subagents/
    helper/
      agent.ts
      instructions.md
```

The framework reads that filesystem shape and turns it into an agent project. Use Markdown for behavior, TypeScript for tools, and `agent.ts` when you need to configure the model, step limit, skills, execution, or subagents.

## Packages

### `crazp`

Public package for authoring agents:

- `defineAgent`
- `defineTool`
- `defineSubagent`
- `defineCrazpConfig`
- `crazp:ctx` type declarations through `crazp/modules`

See [`packages/crazp/README.md`](./packages/crazp/README.md) for package details.

### `@crazp/core`

Internal framework implementation and build pipeline. It provides the `crazp` CLI used by examples and apps:

```bash
pnpm --filter @crazp/example-filesystem-first-agent build
```

## Examples

[`examples/filesystem-first-agent`](./examples/filesystem-first-agent) shows the intended project layout: one main agent, a tool, a skill, and a helper subagent.

## Setup

```bash
pnpm install
```

## Development

Run workspace checks:

```bash
pnpm check
```

Build the public authoring package:

```bash
pnpm --filter crazp build
```

Build the filesystem first example:

```bash
pnpm --filter @crazp/example-filesystem-first-agent build
```

## Scripts

- `pnpm format` formats the workspace with `oxfmt`.
- `pnpm format:check` checks formatting.
- `pnpm lint` lints the workspace with `oxlint`.
- `pnpm typecheck` typechecks all workspace packages.
- `pnpm check` runs format check, lint, and typecheck.
