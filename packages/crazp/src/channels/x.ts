import { createXAdapter } from "@chat-adapter/x";
import { chatSdkChannel } from "./chat-sdk";

export type XChannelOptions = {
  userName: string;
  adapterName?: string;
  clientId?: string;
  clientSecret?: string;
  consumerSecret?: string;
  refreshToken?: string;
};

/** X (Twitter) mentions and DMs via Chat SDK + Think. */
export function xChannel(options: XChannelOptions) {
  return chatSdkChannel({
    adapter: createXAdapter({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      consumerSecret: options.consumerSecret,
      refreshToken: options.refreshToken
    }),
    adapterName: options.adapterName,
    provider: "x",
    userName: options.userName
  });
}
