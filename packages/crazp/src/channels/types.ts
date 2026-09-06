import type { ChannelDefinition } from "@cloudflare/think";
import type { MessengerDefinition } from "@cloudflare/think/messengers";
import type { CrazpCustomChannelDefinition } from "./custom";

export type CrazpRouteContext = {
  request: Request;
  params: Record<string, string>;
  channelId: string;
  from: (address: string) => {
    send: (
      message: string,
      options?: { metadata?: Record<string, unknown> }
    ) => Promise<{ ok: true; status: "accepted" }>;
    cancel: (options?: { turnId?: string }) => Promise<{ ok: boolean }>;
    compact: () => Promise<{ ok: boolean }>;
    clear: () => Promise<{ ok: boolean }>;
    reset: (options?: { reason?: string }) => Promise<{ ok: boolean }>;
  };
  waitUntil: (promise: Promise<unknown>) => void;
};

export type CrazpChannelModule =
  | ChannelDefinition
  | MessengerDefinition
  | CrazpCustomChannelDefinition;
