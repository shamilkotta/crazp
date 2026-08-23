import { Think } from "@cloudflare/think";
import { Workspace } from "@cloudflare/shell";
import type { Session } from "agents/experimental/memory/session";
import type { ToolSet, UIMessage } from "ai";

import { setActivePlan } from "../../../../src/agent/active-plan";
import { buildExecutionTools } from "../../../../src/agent/execution-tools";
import { workspaceR2Name } from "../../../../src/agent/r2-keys";

const WORKER_PROMPT = `You are a generic delegate worker for the parent agent. You are not a specialized role — the same worker handles any task the parent assigns (research, coding, planning, drafts, etc.). You have no chat history beyond the brief in the user message.

Use browser tools, execute, file tools, and skills as needed. Write durable outputs under workspace/ when the brief calls for files. End with a clear, concise result the parent can relay to the user.

You cannot spawn sub-agents. Do not ask clarifying questions — the brief must be enough.`;

export class CrazpWorker extends Think<Cloudflare.Env> {
  override workspace = new Workspace({
    sql: this.ctx.storage.sql,
    r2: this.env.WORKSPACE_BUCKET,
    name: () => workspaceR2Name(this.env, this.name)
  });

  override maxSteps = 250;

  override getModel() {
    return "@cf/moonshotai/kimi-k2.6";
  }

  override configureSession(session: Session) {
    return session
      .withContext("soul", {
        provider: { get: async () => WORKER_PROMPT }
      })
      .withCachedPrompt();
  }

  override formatAgentToolInput(input: unknown): UIMessage {
    const brief =
      typeof input === "object" &&
      input != null &&
      "brief" in input &&
      typeof (input as { brief: unknown }).brief === "string"
        ? (input as { brief: string }).brief
        : typeof input === "string"
          ? input
          : JSON.stringify(input, null, 2);
    return {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: brief }]
    };
  }

  override getTools(): ToolSet {
    return buildExecutionTools({
      executeAgent: this,
      ctx: this.ctx,
      agentName: this.name,
      env: this.env,
      getWorkspace: () => this.workspace,
      setActivePlan: (plan) => setActivePlan(this.ctx.storage, plan)
    });
  }
}

Object.defineProperty(CrazpWorker, "name", {
  value: "ThinkSubAgent_Crazp_Worker"
});
