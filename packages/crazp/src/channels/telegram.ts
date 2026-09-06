import {
  createTelegramAdapter,
  type TelegramAdapterConfig
} from "@chat-adapter/telegram";
import { chatSdkChannel } from "./chat-sdk";

const TELEGRAM_STREAM_SOFT_LIMIT = 3400;
const TELEGRAM_FOLLOWUP_CHUNK_LIMIT = 3500;
const TELEGRAM_DEDUPE_PREFIX = "dedupe:telegram:";

export type TelegramChannelOptions = {
  token: string;
  userName: string;
  secretToken?: string;
  adapterName?: string;
  apiBaseUrl?: string;
  apiUrl?: string;
  mode?: TelegramAdapterConfig["mode"];
  verifyWebhook?:
    | false
    | ((request: Request) => boolean | Response | Promise<boolean | Response>);
};

/** Telegram messenger via Chat SDK + Think. */
export function telegramChannel(options: TelegramChannelOptions) {
  const adapterName = options.adapterName ?? "telegram";
  const shardThread = (threadId: string) =>
    defaultTelegramThreadShard(threadId, adapterName);
  const mode = options.mode ?? "webhook";

  if (
    mode === "webhook" &&
    !options.secretToken &&
    options.verifyWebhook === undefined
  ) {
    throw new Error(
      "telegramChannel requires secretToken for webhook verification, or verifyWebhook: false to opt out explicitly"
    );
  }

  return chatSdkChannel({
    adapter: createTelegramAdapter({
      apiBaseUrl: options.apiBaseUrl,
      apiUrl: options.apiUrl,
      botToken: options.token,
      mode,
      secretToken: options.secretToken,
      userName: options.userName
    }),
    adapterName,
    capabilities: {
      canEditMessages: true,
      canStream: true,
      supportsActions: true,
      supportsAttachments: true
    },
    delivery: {
      isExpectedDeliveryCompletion: isExpectedTelegramFinalEditNoop,
      splitText: splitTelegramMessageText,
      visibleSoftLimit: TELEGRAM_STREAM_SOFT_LIMIT
    },
    keyShard: (key) => shardTelegramStateKey(key, shardThread),
    provider: "telegram",
    shardKey: shardThread,
    userName: options.userName,
    verifyWebhook:
      options.verifyWebhook === false
        ? false
        : (options.verifyWebhook ??
          telegramSecretTokenVerifier(options.secretToken))
  });
}

function telegramSecretTokenVerifier(
  secretToken: string | undefined
): (request: Request) => boolean {
  if (!secretToken) {
    throw new Error("Telegram webhook secretToken is required");
  }
  return (request) =>
    request.headers.get("x-telegram-bot-api-secret-token") === secretToken;
}

function defaultTelegramThreadShard(
  threadId: string,
  adapterName = "telegram"
): string {
  const shard = threadId.split(":").slice(0, 2).join(":") || "telegram";
  return adapterName === "telegram" ? shard : `${adapterName}:${shard}`;
}

function shardTelegramStateKey(
  key: string,
  shardThread: (threadId: string) => string = defaultTelegramThreadShard
): string | undefined {
  if (!key.startsWith(TELEGRAM_DEDUPE_PREFIX)) return;
  const chatId = key.slice(TELEGRAM_DEDUPE_PREFIX.length).split(":")[0];
  return chatId ? shardThread(`telegram:${chatId}`) : undefined;
}

function isTelegramIgnorableDeliveryError(error: unknown): boolean {
  if (error === undefined || error === null) return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === "string" ? candidate.code : undefined;
  const message =
    typeof candidate.message === "string"
      ? candidate.message.toLowerCase()
      : String(error).toLowerCase();
  return (
    code === "VALIDATION_ERROR" && message.includes("message is not modified")
  );
}

function isExpectedTelegramFinalEditNoop(
  error: unknown,
  callback: { visibleLimitReached: () => boolean }
): boolean {
  return (
    callback.visibleLimitReached() && isTelegramIgnorableDeliveryError(error)
  );
}

function splitTelegramMessageText(
  text: string,
  limit = TELEGRAM_FOLLOWUP_CHUNK_LIMIT
): string[] {
  if (!text.trim()) return [];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    let splitAt = remaining.lastIndexOf("\n\n", limit);
    if (splitAt < Math.floor(limit * 0.5)) {
      splitAt = remaining.lastIndexOf("\n", limit);
    }
    if (splitAt < Math.floor(limit * 0.5)) {
      splitAt = remaining.lastIndexOf(" ", limit);
    }
    if (splitAt < Math.floor(limit * 0.5)) splitAt = limit;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
