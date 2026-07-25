import type { Workspace } from "@cloudflare/shell";
import type { WritableContextProvider } from "agents/experimental/memory/session";

import { coreFileMeta, resolveCoreFile } from "./core-files";

export function workspaceContextProvider(
  workspace: Workspace,
  path: string
): WritableContextProvider {
  const meta = coreFileMeta(path);
  if (!meta) {
    throw new Error(`Unknown core file path: ${path}`);
  }
  return {
    get: async () => {
      const file = await resolveCoreFile(workspace, meta);
      return file.content.trim();
    },
    set: async (content) => {
      await workspace.writeFile(path, content);
    }
  };
}
