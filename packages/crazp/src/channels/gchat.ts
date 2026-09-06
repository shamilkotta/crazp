import { createGoogleChatAdapter } from "@chat-adapter/gchat";
import { chatSdkChannel } from "./chat-sdk";

export type GoogleChatChannelOptions = {
  userName: string;
  adapterName?: string;
  /** Service account JSON string or object. Omit to auto-detect from env. */
  credentials?: string | Record<string, unknown>;
  projectId?: string;
};

/** Google Chat (Workspace) via Chat SDK + Think. */
export function googleChatChannel(options: GoogleChatChannelOptions) {
  return chatSdkChannel({
    adapter: createGoogleChatAdapter({
      ...(options.credentials
        ? {
            credentials:
              typeof options.credentials === "string"
                ? JSON.parse(options.credentials)
                : options.credentials
          }
        : {}),
      ...(options.projectId ? { projectId: options.projectId } : {})
    }),
    adapterName: options.adapterName,
    provider: "gchat",
    userName: options.userName
  });
}

/** Alias for `googleChatChannel`. */
export const gchatChannel = googleChatChannel;
