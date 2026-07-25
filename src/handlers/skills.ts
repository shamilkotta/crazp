import { getNexpAgentStub } from "../lib/agent-stub";

const JSON_HEADERS = { "content-type": "application/json" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export async function handleSkillsRequest(
  request: Request,
  env: Cloudflare.Env
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }
  const stub = await getNexpAgentStub(env);
  const skills = await stub.listAgentSkills();
  return json({ skills });
}
