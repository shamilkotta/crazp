import { json } from "../http";
import { getNexpAgentStub } from "../lib/agent-stub";

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
