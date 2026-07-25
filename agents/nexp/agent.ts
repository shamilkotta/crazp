import { Think, skills } from "@cloudflare/think";
import { Workspace } from "@cloudflare/shell";
import { agentTool } from "agents/agent-tools";
import type { Session } from "agents/experimental/memory/session";
import { createCompactFunction } from "agents/experimental/memory/utils";
import { generateText, type ToolSet } from "ai";
import bundledSkills from "agents:skills";
import { z } from "zod";

import {
  AGENT_CORE_FILES,
  BOOTSTRAP_PATH,
  BOOTSTRAP_SEED,
  coreFileMeta,
  IDENTITY_PATH,
  MEMORY_PATH,
  resolveCoreFile,
  SOUL_PATH,
  USER_PATH,
  type CoreFileRecord
} from "../../src/agent/core-files";
import { workspaceContextProvider } from "../../src/agent/context-providers";
import {
  ACTIVE_PLAN_KEY,
  buildTurnSections,
  PREAMBLE
} from "../../src/agent/preamble";
import { listWorkspaceSkills } from "../../src/agent/skills-list";
import { buildExecutionTools } from "../../src/agent/execution-tools";
import type { ActivePlan } from "../../src/agent/tools/todo-write";
import { NexpWorker } from "./agents/worker/agent";

const BOOTSTRAP_SEEDED_KEY = "nexp:bootstrap-seeded";

export class NexpAgent extends Think<Cloudflare.Env> {
  override extensionLoader = this.env.LOADER;

  override workspace = new Workspace({
    sql: this.ctx.storage.sql,
    r2: this.env.WORKSPACE_BUCKET,
    name: () => this.name
  });

  override maxSteps = 250;
  override chatRecovery = true;

  override getModel() {
    return "@cf/moonshotai/kimi-k2.6";
  }

  override configureSession(session: Session) {
    const compactFn = createCompactFunction({
      summarize: async (prompt) => {
        const result = await generateText({
          model: this.resolveModel(),
          prompt
        });
        return result.text;
      }
    });
    return session
      .withContext("operating", {
        provider: { get: async () => PREAMBLE }
      })
      .withContext("soul", {
        description:
          "Your character, values, and tone. refine over time as the relationship grows.",
        provider: workspaceContextProvider(this.workspace, SOUL_PATH),
        maxTokens: 2000
      })
      .withContext("identity", {
        description:
          "Your name and sense of self as a general purpose collaborator — update when it evolves.",
        provider: workspaceContextProvider(this.workspace, IDENTITY_PATH),
        maxTokens: 1500
      })
      .withContext("memory", {
        description:
          "Living memory: facts, decisions, and lessons — append and prune continuously.",
        provider: workspaceContextProvider(this.workspace, MEMORY_PATH),
        maxTokens: 4000
      })
      .withContext("user", {
        description:
          "Who you work with and how they like to collaborate — keep current as you learn.",
        provider: workspaceContextProvider(this.workspace, USER_PATH),
        maxTokens: 2000
      })
      .onCompaction(compactFn)
      .compactAfter(150_000)
      .withCachedPrompt();
  }

  override getSkills() {
    return [
      bundledSkills,
      skills.r2(this.env.WORKSPACE_BUCKET, { prefix: "skills/" })
    ];
  }

  override getTools(): ToolSet {
    return {
      ...buildExecutionTools({
        executeAgent: this,
        ctx: this.ctx,
        agentName: this.name,
        env: this.env,
        getWorkspace: () => this.workspace,
        setActivePlan: (plan) => this.#setActivePlan(plan),
        extensions: true,
        extensionManager: this.extensionManager
      }),
      worker: agentTool(NexpWorker, {
        displayName: "Worker",
        description: `Hand off heavy work to a generic worker (same tools, isolated context). You decide each turn — there are no specialized sub-agents for research, code, etc.
You may call worker multiple times in parallel when subtasks are independent.
Use when the task needs many tool calls, long browser/execute runs, or a large artifact. Stay inline for quick replies, 1–2 tool calls, and identity/memory updates.

Pass a self contained brief. Use each worker's returned summary in your reply to the user.`,
        inputSchema: z.object({
          brief: z
            .string()
            .min(10)
            .describe(
              "Self-contained task instructions: goal, constraints, expected output."
            )
        })
      })
    };
  }

  override async beforeTurn(ctx: {
    system: string;
    messages: unknown[];
    tools: ToolSet;
    continuation: boolean;
  }) {
    await this.#ensureBootstrapSeeded();
    const [bootstrap, latestPlan] = await Promise.all([
      this.workspace.readFile(BOOTSTRAP_PATH),
      this.ctx.storage.get<ActivePlan>(ACTIVE_PLAN_KEY).then((v) => v ?? null)
    ]);
    const extra = buildTurnSections({ bootstrap, latestPlan });
    return {
      system: `${ctx.system}\n\n${extra}`.trim()
    };
  }

  async #setActivePlan(plan: ActivePlan | null): Promise<void> {
    if (plan == null) await this.ctx.storage.delete(ACTIVE_PLAN_KEY);
    else await this.ctx.storage.put(ACTIVE_PLAN_KEY, plan);
  }

  #bootstrapInit?: Promise<void>;

  #ensureBootstrapSeeded(): Promise<void> {
    this.#bootstrapInit ??= this.#seedBootstrapOnce();
    return this.#bootstrapInit;
  }

  async #seedBootstrapOnce(): Promise<void> {
    const seeded = await this.ctx.storage.get<boolean>(BOOTSTRAP_SEEDED_KEY);
    if (seeded === true) return;
    await this.workspace.writeFile(BOOTSTRAP_PATH, BOOTSTRAP_SEED);
    await this.ctx.storage.put(BOOTSTRAP_SEEDED_KEY, true);
  }

  async startBootstrapIfPending(): Promise<{ started: boolean }> {
    await this.#ensureBootstrapSeeded();
    if (this.messages.length > 0) return { started: false };
    const pending = (await this.workspace.readFile(BOOTSTRAP_PATH)) != null;
    if (!pending) return { started: false };
    const result = await this.saveMessages([
      {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: "begin" }],
        metadata: { kickoff: true }
      }
    ]);
    return { started: result.status === "completed" };
  }

  async devReset(): Promise<void> {
    this.clearMessages();
    await this.ctx.storage.delete(BOOTSTRAP_SEEDED_KEY);
    this.#bootstrapInit = undefined;
    await this.#ensureBootstrapSeeded();
  }

  async listCoreFiles(): Promise<CoreFileRecord[]> {
    return Promise.all(
      AGENT_CORE_FILES.map((meta) => resolveCoreFile(this.workspace, meta))
    );
  }

  async readCoreFile(path: string): Promise<CoreFileRecord | null> {
    const meta = coreFileMeta(path);
    if (!meta) return null;
    return resolveCoreFile(this.workspace, meta);
  }

  async writeCoreFile(path: string, content: string): Promise<void> {
    const meta = coreFileMeta(path);
    if (!meta) throw new Error("Path is not a core identity file");
    await this.workspace.writeFile(path, content);
  }

  async listAgentSkills() {
    return listWorkspaceSkills(this.workspace);
  }
}
