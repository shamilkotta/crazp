import { createTeamsAdapter } from "@chat-adapter/teams";
import { chatSdkChannel } from "./chat-sdk";

export type TeamsChannelOptions = {
  appId: string;
  appPassword: string;
  userName: string;
  appTenantId?: string;
  adapterName?: string;
};

/** Microsoft Teams messenger via Chat SDK + Think. */
export function teamsChannel(options: TeamsChannelOptions) {
  return chatSdkChannel({
    adapter: createTeamsAdapter({
      appId: options.appId,
      appPassword: options.appPassword,
      appTenantId: options.appTenantId
    }),
    adapterName: options.adapterName,
    provider: "teams",
    userName: options.userName
  });
}
