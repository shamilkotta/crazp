import type { ToolSet } from "ai";

/** Inline skill entry for `CrazpAgentConfig.skills`. */
export type SkillManifestEntry = {
  name: string;
  description: string;
  body: string;
  [key: string]: unknown;
};

export type CrazpContext = {
  env: Record<string, unknown>;
  agentName: string;
};

export type CrazpModel =
  | string
  | ((ctx: Pick<CrazpContext, "env" | "agentName">) => string);

export type CrazpSubagentConfig = {
  name: string;
  slug?: string;
  description: string;
  model?: CrazpModel;
  maxSteps?: number;
  instructions?: string;
  tools?: ToolSet;
};

export type CrazpExecutionConfig = {
  workspaceTools?: boolean;
  container?: boolean;
  browser?: boolean;
  /** @deprecated Prefer container / sandbox flags used by the runtime. */
  execute?: boolean;
  /** @deprecated Prefer container / sandbox flags used by the runtime. */
  executeBundle?: boolean;
  sandbox?: boolean;
};

export type CrazpAgentConfig = {
  name?: string;
  slug?: string;
  model?: CrazpModel;
  maxSteps?: number;
  chatRecovery?: boolean;
  instructions?: string;
  tools?: ToolSet;
  subagents?: Record<string, Omit<CrazpSubagentConfig, "tools">>;
  skills?: SkillManifestEntry[];
  extensions?: boolean;
  execution?: CrazpExecutionConfig;
};
