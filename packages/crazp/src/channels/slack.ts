import { createSlackAdapter } from "@chat-adapter/slack";
import { chatSdkChannel } from "./chat-sdk";

export type SlackChannelOptions = {
  token: string;
  signingSecret: string;
  userName: string;
  adapterName?: string;
};

/** Slack messenger via Chat SDK + Think. */
export function slackChannel(options: SlackChannelOptions) {
  return chatSdkChannel({
    adapter: createSlackAdapter({
      botToken: options.token,
      signingSecret: options.signingSecret
    }),
    adapterName: options.adapterName,
    provider: "slack",
    userName: options.userName
  });
}
