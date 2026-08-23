import { getAgentByName } from "agents";

import type { CrazpAgent } from "../../agents/crazp/agent";
import { DEFAULT_AGENT_INSTANCE } from "../agent/r2-keys";

export { DEFAULT_AGENT_INSTANCE };

export async function getCrazpAgentStub(
  env: Cloudflare.Env,
  instanceName = DEFAULT_AGENT_INSTANCE
): Promise<DurableObjectStub<CrazpAgent>> {
  return getAgentByName<Cloudflare.Env, CrazpAgent>(
    env.ThinkAgent_Crazp,
    instanceName
  );
}
