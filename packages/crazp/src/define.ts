import { tool } from "ai";
import type {
  CrazpAgentConfig,
  CrazpSubagentConfig
} from "./types";

export function defineAgent<const Config extends CrazpAgentConfig>(
  config: Config
): Config {
  return config;
}

export const defineTool = tool;

export function defineSubagent<const Config extends CrazpSubagentConfig>(
  config: Config
): Config {
  return config;
}

export function defineCrazpConfig<const Config extends Record<string, unknown>>(
  config: Config
): Config {
  return config;
}
