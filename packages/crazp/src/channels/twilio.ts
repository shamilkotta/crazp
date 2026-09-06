import { createTwilioAdapter } from "@chat-adapter/twilio";
import { chatSdkChannel } from "./chat-sdk";

export type TwilioChannelOptions = {
  accountSid: string;
  authToken: string;
  userName: string;
  phoneNumber?: string;
  messagingServiceSid?: string;
  adapterName?: string;
};

/** Twilio SMS / messaging via Chat SDK + Think. */
export function twilioChannel(options: TwilioChannelOptions) {
  return chatSdkChannel({
    adapter: createTwilioAdapter({
      accountSid: options.accountSid,
      authToken: options.authToken,
      phoneNumber: options.phoneNumber,
      messagingServiceSid: options.messagingServiceSid,
      userName: options.userName
    }),
    adapterName: options.adapterName,
    provider: "twilio",
    userName: options.userName
  });
}
