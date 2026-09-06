import type { ChannelDefinition } from "@cloudflare/think";

export type EmailChannelOptions = {
  address: string;
  /** Reserved for a future inbound mail adapter. */
  providerToken?: string;
  instructions?: string;
};

/**
 * TODO
 * Email is stored as a custom channel policy today.
 * Inbound mail delivery is not a Chat SDK webhook yet.
 */
export function emailChannel(options: EmailChannelOptions): ChannelDefinition {
  return {
    kind: "custom",
    ingress: { transport: "websocket" },
    instructions:
      options.instructions ??
      `This agent owns the inbox ${options.address}. Inbound email is not delivered as a live webhook yet.`
  };
}
