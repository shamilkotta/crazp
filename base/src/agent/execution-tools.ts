import { createBrowserTools } from "@cloudflare/think/tools/browser";
import {
  createExecuteTool,
  type ExecuteToolAgent
} from "@cloudflare/think/tools/execute";
import { createExtensionTools } from "@cloudflare/think/tools/extensions";
// import { createSandboxTools as createThinkSandboxTools } from "@cloudflare/think/tools/sandbox";
import type { ExtensionManager } from "@cloudflare/think/extensions";
import type { Workspace } from "@cloudflare/shell";
import type { ToolSet } from "ai";

import { buildSharedToolSet } from "./tool-registry";
import type { ActivePlan } from "./tools/todo-write";
import { createExecuteBundleTool } from "./tools/execute-bundle";
import { createSandboxTools } from "./tools/sandbox";

export type BuildExecutionToolsOptions = {
  executeAgent: ExecuteToolAgent;
  ctx: DurableObjectState;
  agentName: string;
  env: Cloudflare.Env;
  getWorkspace: () => Workspace;
  setActivePlan: (plan: ActivePlan | null) => Promise<void>;
  onIdentityFileChanged?: () => Promise<void>;
  /** Include load_extension / list_extensions and loaded extension tools */
  extensions?: boolean;
  extensionManager?: ExtensionManager;
};

/**
 * Full Project Think execution ladder:
 * - Tier 0: workspace file tools + Think built-in list/find/grep/bash
 * - Tier 1: execute (codemode Dynamic Worker)
 * - Tier 2: execute_bundle (npm via worker-bundler)
 * - Tier 3: browser_* tools
 * - Tier 4: sandbox_* tools (Cloudflare Sandbox container)
 */
export function buildExecutionTools(
  options: BuildExecutionToolsOptions
): ToolSet {
  const {
    executeAgent,
    ctx,
    agentName,
    env,
    getWorkspace,
    setActivePlan,
    onIdentityFileChanged,
    extensions = false,
    extensionManager
  } = options;
  const browserTools = createBrowserTools({
    ctx,
    browser: env.BROWSER,
    loader: env.LOADER
  });

  const tools: ToolSet = {
    ...browserTools,
    execute: createExecuteTool(executeAgent),
    execute_bundle: createExecuteBundleTool(env.LOADER),
    ...buildSharedToolSet({ getWorkspace, setActivePlan, onIdentityFileChanged }),
    // ...createThinkSandboxTools(env.SANDBOX), NOT IMPLEMENTED YET, SO USING CUSTOM TOOL BELOW
    ...createSandboxTools({
      sandbox: env.SANDBOX,
      sandboxId: agentName,
      getWorkspace
    })
  };

  if (extensions && extensionManager) {
    Object.assign(tools, createExtensionTools({ manager: extensionManager }));
    Object.assign(tools, extensionManager.getTools());
  }

  return tools;
}
