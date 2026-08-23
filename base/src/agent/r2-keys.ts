export const DEFAULT_AGENT_INSTANCE = "main";

const FALLBACK_WORKER_NAME = "crazp";

export function workspaceR2Name(
  env: { CRAZP_WORKER_NAME?: string },
  instanceName: string
): string {
  const worker =
    typeof env.CRAZP_WORKER_NAME === "string" && env.CRAZP_WORKER_NAME.trim()
      ? env.CRAZP_WORKER_NAME.trim()
      : FALLBACK_WORKER_NAME;
  return `${worker}/${instanceName}`;
}

export function skillsR2Prefix(
  env: { CRAZP_WORKER_NAME?: string },
  instanceName: string
): string {
  return `${workspaceR2Name(env, instanceName)}/skills/`;
}
