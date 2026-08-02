import { z } from "zod";

import { json } from "../http";
import { getCrazpAgentStub } from "../lib/agent-stub";

const WriteRequestBodySchema = z.object({
  content: z.string()
});

async function parseWriteBody(
  request: Request
): Promise<{ ok: true; content: string } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: json({ error: "Invalid JSON body" }, 400) };
  }
  const parsed = WriteRequestBodySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: json({ error: "Missing `content` string" }, 400)
    };
  }
  return { ok: true, content: parsed.data.content };
}

export async function handleFilesRequest(
  request: Request,
  env: Cloudflare.Env
): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\//, "").split("/");
  const path = parts.slice(3).map(decodeURIComponent).join("/");

  if (parts[2] !== "core") {
    return json({ error: "Not found" }, 404);
  }

  const stub = await getCrazpAgentStub(env);

  if (path === "") {
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }
    const files = await stub.listCoreFiles();
    return json({ files });
  }

  if (request.method === "GET") {
    const file = await stub.readCoreFile(path);
    if (!file) return json({ error: "Unknown core file path" }, 400);
    return json({ file });
  }

  if (request.method === "PUT") {
    const parsed = await parseWriteBody(request);
    if (!parsed.ok) return parsed.response;
    await stub.writeCoreFile(path, parsed.content);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
}
