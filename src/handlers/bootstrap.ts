import { getNexpAgentStub } from "../lib/agent-stub";

const JSON_HEADERS = { "content-type": "application/json" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function isDevHost(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname.endsWith(".localhost");
}

export async function handleBootstrapRequest(
  request: Request,
  env: Cloudflare.Env
): Promise<Response> {
  const url = new URL(request.url);
  const stub = await getNexpAgentStub(env);

  if (url.pathname === "/api/bootstrap/start") {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }
    const result = await stub.startBootstrapIfPending();
    return json(result);
  }

  if (url.pathname === "/api/bootstrap/reset") {
    if (!isDevHost(url)) return json({ error: "Not found" }, 404);
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }
    await stub.devReset();
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
}
