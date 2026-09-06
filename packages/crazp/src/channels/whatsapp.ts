import { createWhatsAppAdapter } from "@chat-adapter/whatsapp";
import { chatSdkChannel } from "./chat-sdk";

export type WhatsAppChannelOptions = {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  appSecret: string;
  userName: string;
  adapterName?: string;
};

/** WhatsApp Business Cloud messenger via Chat SDK + Think. */
export function whatsappChannel(options: WhatsAppChannelOptions) {
  return chatSdkChannel({
    adapter: createWhatsAppAdapter({
      accessToken: options.accessToken,
      phoneNumberId: options.phoneNumberId,
      verifyToken: options.verifyToken,
      appSecret: options.appSecret
    }),
    adapterName: options.adapterName,
    provider: "whatsapp",
    userName: options.userName
  });
}
