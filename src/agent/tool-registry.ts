import {
  createDeleteTool,
  createEditTool,
  createReadTool
} from "@cloudflare/think/tools/workspace";
import type { Workspace } from "@cloudflare/shell";
import { tool } from "ai";
import type { ToolSet } from "ai";
import { z } from "zod";

import { isCorePath } from "./core-files";
import type { ActivePlan } from "./tools/todo-write";
import { createTodoWriteTool } from "./tools/todo-write";

function assertNotCorePath(path: string): void {
  const normalized = path.replace(/^\/+/, "");
  if (isCorePath(normalized)) {
    throw new Error(
      "Use set_context or identity file tools for core identity paths."
    );
  }
}

function createProtectedReadTool({
  getWorkspace
}: {
  getWorkspace: () => Workspace;
}) {
  return createReadTool({
    ops: {
      readFile: async (path) => getWorkspace().readFile(path),
      readFileBytes: async (path) => getWorkspace().readFileBytes(path),
      stat: (path) => getWorkspace().stat(path)
    }
  });
}

function createProtectedEditTool({
  getWorkspace
}: {
  getWorkspace: () => Workspace;
}) {
  return createEditTool({
    ops: {
      readFile: async (path) => getWorkspace().readFile(path),
      writeFile: async (path, content) => {
        assertNotCorePath(path);
        await getWorkspace().writeFile(path, content);
      }
    }
  });
}

function createProtectedDeleteTool({
  getWorkspace
}: {
  getWorkspace: () => Workspace;
}) {
  return createDeleteTool({
    ops: {
      rm: async (path, opts) => {
        assertNotCorePath(path);
        await getWorkspace().rm(path, opts);
      }
    }
  });
}

function createFixedWriteTool({
  getWorkspace
}: {
  getWorkspace: () => Workspace;
}) {
  return tool({
    description:
      "Write content to a file. Parent directories are created automatically.",
    inputSchema: z.object({
      path: z.string(),
      content: z.string()
    }),
    execute: async ({ path, content }) => {
      await getWorkspace().writeFile(path, content);
      return {
        path,
        bytesWritten: new TextEncoder().encode(content).byteLength
      };
    }
  });
}

function createMoveTool({ getWorkspace }: { getWorkspace: () => Workspace }) {
  return tool({
    description: "Move or rename a file or directory inside the workspace.",
    inputSchema: z.object({
      from: z.string(),
      to: z.string(),
      recursive: z.boolean().optional()
    }),
    execute: async ({ from, to, recursive }) => {
      await getWorkspace().mv(from, to, { recursive: recursive ?? false });
      return { from, to };
    }
  });
}

function createCopyTool({ getWorkspace }: { getWorkspace: () => Workspace }) {
  return tool({
    description: "Copy a file or directory inside the workspace.",
    inputSchema: z.object({
      from: z.string(),
      to: z.string(),
      recursive: z.boolean().optional()
    }),
    execute: async ({ from, to, recursive }) => {
      await getWorkspace().cp(from, to, { recursive: recursive ?? false });
      return { from, to };
    }
  });
}

type SharedToolDeps = {
  getWorkspace: () => Workspace;
  setActivePlan: (plan: ActivePlan | null) => Promise<void>;
};

export function buildSharedToolSet(deps: SharedToolDeps): ToolSet {
  const { getWorkspace, setActivePlan } = deps;
  return {
    read: createProtectedReadTool({ getWorkspace }),
    write: createFixedWriteTool({ getWorkspace }),
    edit: createProtectedEditTool({ getWorkspace }),
    delete: createProtectedDeleteTool({ getWorkspace }),
    move: createMoveTool({ getWorkspace }),
    copy: createCopyTool({ getWorkspace }),
    todo_write: createTodoWriteTool({ setActivePlan })
  };
}
