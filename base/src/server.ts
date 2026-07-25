import { handleBootstrapRequest } from "./handlers/bootstrap";
import { handleFilesRequest } from "./handlers/files";
import { handleSkillsRequest } from "./handlers/skills";
import { json } from "./http";

async function handleApiRequest(
  request: Request,
  env: Cloudflare.Env
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/files/")) {
    return handleFilesRequest(request, env);
  }
  if (url.pathname.startsWith("/api/bootstrap")) {
    return handleBootstrapRequest(request, env);
  }
  if (url.pathname === "/api/skills") {
    return handleSkillsRequest(request, env);
  }
  if (url.pathname === "/health") {
    return new Response("ok");
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response | null> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") || url.pathname === "/health") {
      return handleApiRequest(request, env);
    }
    return null;
  }
};
