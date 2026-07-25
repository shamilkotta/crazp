import { getSandbox, type Sandbox } from "@cloudflare/sandbox";
import { tool } from "ai";
import type { ToolSet } from "ai";
import { z } from "zod";

import {
  assertSandboxSyncPrefixAllowed,
  isSandboxSyncExcludedPath
} from "../core-files";
import type { Workspace } from "@cloudflare/shell";

const SANDBOX_WORKDIR = "/workspace";

function truncate(text: string, max = 32_000): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n…[truncated ${text.length - max} chars]`;
}

export function createSandboxTools(args: {
  sandbox: DurableObjectNamespace<Sandbox>;
  sandboxId: string;
  getWorkspace?: () => Workspace;
}): ToolSet {
  const { sandbox, sandboxId, getWorkspace } = args;

  function resolveSandbox() {
    return getSandbox(sandbox, sandboxId, { normalizeId: true });
  }

  return {
    sandbox_exec: tool({
      description:
        "Tier 4 — run a shell command in the full OS sandbox (git, npm, cargo, test runners). Use when Tier 0–3 are insufficient. Working directory defaults to /workspace.",
      inputSchema: z.object({
        command: z.string().describe("Shell command to run"),
        cwd: z
          .string()
          .optional()
          .describe(
            `Working directory inside the sandbox (default: ${SANDBOX_WORKDIR})`
          ),
        timeout: z
          .number()
          .int()
          .positive()
          .max(600_000)
          .optional()
          .describe("Timeout in ms (default 120000)")
      }),
      execute: async ({ command, cwd, timeout }) => {
        const sb = resolveSandbox();
        const result = await sb.exec(command, {
          cwd: cwd ?? SANDBOX_WORKDIR,
          timeout: timeout ?? 120_000
        });
        return {
          success: result.success,
          exitCode: result.exitCode,
          stdout: truncate(result.stdout),
          stderr: truncate(result.stderr)
        };
      }
    }),

    sandbox_read_file: tool({
      description:
        "Tier 4 — read a file from the sandbox filesystem. Use after sandbox_exec or sandbox_sync_workspace.",
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute path in the sandbox (e.g. /workspace/package.json)"
          )
      }),
      execute: async ({ path }) => {
        const sb = resolveSandbox();
        const file = await sb.readFile(path);
        return { path, content: truncate(file.content) };
      }
    }),

    sandbox_write_file: tool({
      description:
        "Tier 4 — write a file in the sandbox filesystem. Parent directories are created as needed.",
      inputSchema: z.object({
        path: z.string(),
        content: z.string()
      }),
      execute: async ({ path, content }) => {
        const sb = resolveSandbox();
        await sb.writeFile(path, content);
        return {
          path,
          bytesWritten: new TextEncoder().encode(content).byteLength
        };
      }
    }),

    sandbox_run_code: tool({
      description:
        "Tier 4 — run Python or JavaScript/TypeScript in the sandbox code interpreter. Prefer sandbox_exec for shell workflows; use this for short scripts with rich output.",
      inputSchema: z.object({
        code: z.string(),
        language: z
          .enum(["python", "javascript", "typescript"])
          .default("javascript"),
        timeout: z.number().int().positive().max(600_000).optional()
      }),
      execute: async ({ code, language, timeout }) => {
        const sb = resolveSandbox();
        const result = await sb.runCode(code, {
          language,
          timeout: timeout ?? 120_000
        });
        const stdout = result.logs.stdout.join("\n");
        const stderr = result.logs.stderr.join("\n");
        return {
          success: result.error == null,
          stdout: truncate(stdout),
          stderr: truncate(stderr),
          results: result.results?.slice(0, 20),
          error: result.error?.message
        };
      }
    }),

    sandbox_sync_workspace: tool({
      description:
        "Tier 4 — copy files from the durable workspace into the sandbox at /workspace/. Use before npm test or builds when source lives in workspace/. Only syncs under the given prefix; identity/, skills/, and BOOTSTRAP.md are always excluded.",
      inputSchema: z.object({
        prefix: z
          .string()
          .default("workspace/")
          .describe("Workspace path prefix to sync into /workspace/"),
        maxFiles: z.number().int().positive().max(500).default(200),
        maxFileBytes: z
          .number()
          .int()
          .positive()
          .max(2_000_000)
          .default(512_000)
      }),
      execute: async ({ prefix, maxFiles, maxFileBytes }) => {
        if (!getWorkspace) {
          throw new Error("Workspace sync is unavailable");
        }
        const ws = getWorkspace();
        const normalized = assertSandboxSyncPrefixAllowed(prefix);
        const entries = await ws.glob(`${normalized}**/*`);
        const files = entries
          .filter((e) => e.type === "file")
          .slice(0, maxFiles);
        const sb = resolveSandbox();
        let synced = 0;
        let skipped = 0;
        let excluded = 0;
        const paths: string[] = [];
        for (const entry of files) {
          if (isSandboxSyncExcludedPath(entry.path)) {
            excluded += 1;
            continue;
          }
          const rel = entry.path.startsWith(normalized)
            ? entry.path.slice(normalized.length)
            : entry.path;
          const target = `${SANDBOX_WORKDIR}/${rel.replace(/^\/+/, "")}`;
          const bytes = await ws.readFileBytes(entry.path);
          if (bytes == null || bytes.byteLength > maxFileBytes) {
            skipped += 1;
            continue;
          }
          const isText =
            entry.mimeType.startsWith("text/") ||
            entry.mimeType === "application/json" ||
            entry.mimeType === "application/javascript";
          if (!isText) {
            skipped += 1;
            continue;
          }
          await sb.writeFile(target, new TextDecoder().decode(bytes));
          synced += 1;
          paths.push(target);
        }
        return { synced, skipped, excluded, paths: paths.slice(0, 50) };
      }
    })
  };
}
