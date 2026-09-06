import { createDiscordAdapter } from "@chat-adapter/discord";
import { chatSdkChannel } from "./chat-sdk";

export type DiscordChannelOptions = {
  token: string;
  publicKey: string;
  applicationId: string;
  userName: string;
  adapterName?: string;
};

/** Discord messenger via Chat SDK + Think. */
export function discordChannel(options: DiscordChannelOptions) {
  return chatSdkChannel({
    adapter: createDiscordAdapter({
      botToken: options.token,
      publicKey: options.publicKey,
      applicationId: options.applicationId
    }),
    adapterName: options.adapterName,
    provider: "discord",
    userName: options.userName
  });
}
