#!/usr/bin/env node
/**
 * Minimal terminal chat client for the Crazp Think agent.
 * Usage: pnpm chat "Hello!"  or  pnpm chat (interactive)
 */

const BASE_URL = process.env.AGENT_URL ?? "http://localhost:5173";
const cliArgs = process.argv.slice(2);
const SESSION =
  process.env.AGENT_SESSION ?? (cliArgs.length > 1 ? cliArgs[0] : "default");
const PROMPT = (
  process.env.AGENT_SESSION
    ? cliArgs
    : cliArgs.length > 1
      ? cliArgs.slice(1)
      : cliArgs
).join(" ");
const AGENT = "crazp";

const wsUrl = BASE_URL.replace(/^http/, "ws") + `/agents/${AGENT}/${SESSION}`;

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function sendChat(ws, text, history = []) {
  const requestId = randomId();
  const userMessage = {
    id: randomId(),
    role: "user",
    parts: [{ type: "text", text }]
  };

  return new Promise((resolve, reject) => {
    let response = "";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for response"));
    }, 120_000);

    function cleanup() {
      clearTimeout(timeout);
      ws.removeEventListener("message", onMessage);
    }

    function onMessage(event) {
      try {
        const data = JSON.parse(event.data);

        if (
          data.type === "cf_agent_use_chat_response" &&
          data.id === requestId
        ) {
          if (data.error) {
            cleanup();
            reject(new Error(data.body || "Stream error"));
            return;
          }
          if (data.body?.trim()) {
            const chunk = JSON.parse(data.body);
            if (chunk.type === "text-delta" && chunk.delta) {
              process.stdout.write(chunk.delta);
              response += chunk.delta;
            }
          }
          if (data.done) {
            cleanup();
            process.stdout.write("\n");
            resolve(response);
          }
        }
      } catch {
        // ignore non-chat frames
      }
    }

    ws.addEventListener("message", onMessage);

    ws.send(
      JSON.stringify({
        type: "cf_agent_use_chat_request",
        id: requestId,
        init: {
          method: "POST",
          body: JSON.stringify({
            messages: [...history, userMessage],
            trigger: "submit-message"
          })
        }
      })
    );
  });
}

async function main() {
  const prompt = PROMPT.trim();

  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener(
      "error",
      () => reject(new Error(`Failed to connect to ${wsUrl}`)),
      { once: true }
    );
  });

  console.error(`Connected to ${wsUrl}\n`);

  if (prompt) {
    process.stdout.write("You: " + prompt + "\nAssistant: ");
    await sendChat(ws, prompt);
    ws.close();
    return;
  }

  const readline = await import("node:readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const history = [];

  console.error("Type a message and press Enter. Ctrl+C to quit.\n");

  try {
    while (true) {
      const input = (await rl.question("You: ")).trim();
      if (!input) continue;

      process.stdout.write("Assistant: ");
      const reply = await sendChat(ws, input, history);
      history.push(
        {
          id: randomId(),
          role: "user",
          parts: [{ type: "text", text: input }]
        },
        {
          id: randomId(),
          role: "assistant",
          parts: [{ type: "text", text: reply }]
        }
      );
      console.log();
    }
  } finally {
    rl.close();
    ws.close();
  }
}

main().catch((err) => {
  console.error("\nError:", err.message);
  console.error("\nMake sure the dev server is running: pnpm dev");
  process.exit(1);
});
