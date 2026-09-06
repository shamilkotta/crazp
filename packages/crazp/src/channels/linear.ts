import { createLinearAdapter } from "@chat-adapter/linear";
import { chatSdkChannel } from "./chat-sdk";

export type LinearChannelOptions = {
  userName: string;
  adapterName?: string;
  /** Personal or OAuth API key. Omit to read LINEAR_* env vars at runtime. */
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
};

/** Linear issues and agent sessions via Chat SDK + Think. */
export function linearChannel(options: LinearChannelOptions) {
  const {
    userName,
    adapterName,
    apiKey,
    clientId,
    clientSecret,
    webhookSecret
  } = options;
  const adapter = apiKey
    ? createLinearAdapter({ apiKey })
    : clientId && clientSecret
      ? createLinearAdapter({ clientId, clientSecret, webhookSecret })
      : createLinearAdapter();
  return chatSdkChannel({
    adapter,
    adapterName,
    provider: "linear",
    userName
  });
}
