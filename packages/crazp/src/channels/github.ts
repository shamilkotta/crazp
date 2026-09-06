import { createGitHubAdapter } from "@chat-adapter/github";
import { chatSdkChannel } from "./chat-sdk";

export type GitHubChannelOptions = {
  userName: string;
  adapterName?: string;
  /** Omit to read GITHUB_* env vars inside the adapter at runtime. */
  token?: string;
  appId?: string;
  privateKey?: string;
  webhookSecret?: string;
};

/** GitHub mentions and webhooks via Chat SDK + Think. */
export function githubChannel(options: GitHubChannelOptions) {
  const { userName, adapterName, token, appId, privateKey, webhookSecret } =
    options;
  const adapter = token
    ? createGitHubAdapter({ token })
    : appId && privateKey
      ? createGitHubAdapter({ appId, privateKey, webhookSecret })
      : createGitHubAdapter();
  return chatSdkChannel({
    adapter,
    adapterName,
    provider: "github",
    userName
  });
}
