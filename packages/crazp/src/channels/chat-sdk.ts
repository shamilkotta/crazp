import {
  chatSdkMessenger,
  type ChatSdkMessengerOptions
} from "@cloudflare/think/messengers";

export function chatSdkChannel(options: ChatSdkMessengerOptions) {
  return chatSdkMessenger({
    ...options,
    adapter: options.adapter,
    verifyWebhook: options.verifyWebhook ?? false
  });
}
