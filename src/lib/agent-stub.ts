import { getAgentByName } from "agents";

import type { NexpAgent } from "../../agents/nexp/agent";

export const DEFAULT_AGENT_INSTANCE = "default";

export async function getNexpAgentStub(
  env: Cloudflare.Env,
  instanceName = DEFAULT_AGENT_INSTANCE
): Promise<DurableObjectStub<NexpAgent>> {
  return getAgentByName<Cloudflare.Env, NexpAgent>(
    env.ThinkAgent_Nexp,
    instanceName
  );
}
