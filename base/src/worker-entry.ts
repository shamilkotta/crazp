import { routeAgentRequest } from "agents";
import { CrazpAgent } from "../agents/crazp/agent";
import { CrazpWorker } from "../agents/crazp/agents/worker/agent";
import app from "./server";

export { CodemodeRuntime } from "@cloudflare/codemode";
export { Sandbox } from "@cloudflare/sandbox";

export { CrazpAgent as ThinkAgent_Crazp };
export { CrazpWorker as ThinkSubAgent_Crazp_Worker };

export default {
  async fetch(
    request: Request,
    env: Cloudflare.Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const appResponse = await app.fetch(request, env);
    if (appResponse) return appResponse;
    return (
      (await routeAgentRequest(request, env)) ??
      new Response("Not found", { status: 404 })
    );
  }
};
