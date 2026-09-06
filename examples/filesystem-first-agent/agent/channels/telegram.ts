import { env } from "crazp:ctx";
import { telegramChannel } from "crazp/channels";

export default telegramChannel({
  token: env.TELEGRAM_BOT_TOKEN as string,
  userName: "crazp_bot",
  secretToken: env.TELEGRAM_WEBHOOK_SECRET_TOKEN as string | undefined
});
