import type { ChannelDefinition } from "@cloudflare/think";

export type WebChannelOptions = {
  /** Prepended to the system prompt for web turns. */
  instructions?: string;
  /** Optional origins shown in the web-widget setup UI. */
  allowedOrigins?: string[];
  maxTurns?: number;
};

/**
 * TODO
 * Policy for Think's implicit web channel.
 * Declaring `web` does not install a Chat SDK adapter — it only sets turn policy.
 */
export function webChannel(options: WebChannelOptions = {}): ChannelDefinition {
  const originNote =
    options.allowedOrigins && options.allowedOrigins.length > 0
      ? ` Allowed origins: ${options.allowedOrigins.join(", ")}.`
      : "";
  const instructions =
    options.instructions ??
    `You are chatting over the web widget.${originNote}`.trim();

  return {
    kind: "web",
    ingress: { transport: "websocket" },
    instructions,
    maxTurns: options.maxTurns
  };
}
