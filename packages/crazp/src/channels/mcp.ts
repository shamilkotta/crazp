import type { ChannelDefinition } from "@cloudflare/think";

export type McpChannelOptions = {
  instructions?: string;
};

/**
 * TODO
 * Placeholder for an MCP-as-channel surface.
 * Wire an MCP server as a tool/connection until a dedicated ingress lands in Think.
 */
export function mcpChannel(options: McpChannelOptions = {}): ChannelDefinition {
  return {
    kind: "custom",
    ingress: { transport: "websocket" },
    instructions:
      options.instructions ??
      "MCP clients should connect through the agent MCP connection surface; a dedicated MCP channel ingress is not wired yet."
  };
}
