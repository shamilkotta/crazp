import { getAgentByName } from "agents";

import type { CrazpAgent } from "../../agents/crazp/agent";

export const DEFAULT_AGENT_INSTANCE = "default";

export async function getCrazpAgentStub(
  env: Cloudflare.Env,
  instanceName = DEFAULT_AGENT_INSTANCE
): Promise<DurableObjectStub<CrazpAgent>> {
  return getAgentByName<Cloudflare.Env, CrazpAgent>(
    env.ThinkAgent_Crazp,
    instanceName
  );
}
