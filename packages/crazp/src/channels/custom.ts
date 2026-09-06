import type { CrazpRouteContext } from "./types";

type RouteHandler = (
  request: Request,
  ctx: CrazpRouteContext
) => Response | Promise<Response>;

function route(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  handler: RouteHandler
) {
  return { method, path, handler };
}

export function GET(path: string, handler: RouteHandler) {
  return route("GET", path, handler);
}

export function POST(path: string, handler: RouteHandler) {
  return route("POST", path, handler);
}

export function PUT(path: string, handler: RouteHandler) {
  return route("PUT", path, handler);
}

export function PATCH(path: string, handler: RouteHandler) {
  return route("PATCH", path, handler);
}

export function DELETE(path: string, handler: RouteHandler) {
  return route("DELETE", path, handler);
}

/**
 * Author a channel with your own HTTP routes.
 * Routes mount under `/<filename>` from `agent/channels/<filename>.ts`
 * (e.g. `POST("/hook")` in `webhook.ts` → `/webhook/hook`).
 */
export function defineCustomChannel(options: {
  routes: Array<ReturnType<typeof GET>>;
  turnPolicy?: "steer" | "queue";
  cors?:
    | boolean
    | {
        origin?: string | string[];
        methods?: string[];
        allowHeaders?: string[];
      };
  events?: Record<string, (event: unknown, ctx: CrazpRouteContext) => void>;
}) {
  return {
    __crazpCustomChannel: true as const,
    routes: options.routes,
    turnPolicy: options.turnPolicy,
    cors: options.cors,
    events: options.events
  };
}

export type CrazpCustomChannelDefinition = ReturnType<
  typeof defineCustomChannel
>;

export function isCrazpCustomChannelDefinition(
  value: unknown
): value is CrazpCustomChannelDefinition {
  return (
    typeof value === "object" &&
    value != null &&
    "__crazpCustomChannel" in value &&
    (value as CrazpCustomChannelDefinition).__crazpCustomChannel === true
  );
}

/**
 * Default HTTP session API.
 * Auto-registered as channel id `crazp` (routes at `/crazp/v1/*`) when
 * `agent/channels/crazp.ts` is missing. Author that file to replace it.
 */
export function crazpChannel(
  options: Pick<
    Parameters<typeof defineCustomChannel>[0],
    "turnPolicy" | "cors"
  > & {
    instructions?: string;
  } = {}
) {
  const instructions =
    options.instructions ??
    "You are reachable over the crazp HTTP session API (/crazp/v1).";

  return defineCustomChannel({
    turnPolicy: options.turnPolicy ?? "steer",
    cors: options.cors,
    routes: [
      GET("/v1/health", () => Response.json({ ok: true, status: "ready" })),
      POST("/v1/session", async (request, ctx) => {
        const body = (await request.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!body.message?.trim()) {
          return Response.json(
            { ok: false, error: "message is required" },
            { status: 400 }
          );
        }
        await ctx.from("http-default").send(body.message, {
          metadata: { instructions }
        });
        return Response.json({ ok: true, status: "accepted" }, { status: 202 });
      }),
      POST("/v1/session/:sessionId", async (request, ctx) => {
        const body = (await request.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!body.message?.trim()) {
          return Response.json(
            { ok: false, error: "message is required" },
            { status: 400 }
          );
        }
        const address = ctx.params.sessionId ?? "http-default";
        await ctx.from(address).send(body.message, {
          metadata: { instructions }
        });
        return Response.json({ ok: true, status: "accepted" }, { status: 202 });
      }),
      POST("/v1/session/:sessionId/cancel", async (_request, ctx) => {
        const address = ctx.params.sessionId ?? "http-default";
        const result = await ctx.from(address).cancel();
        return Response.json(result);
      }),
      POST("/v1/session/:sessionId/clear", async (_request, ctx) => {
        const address = ctx.params.sessionId ?? "http-default";
        const result = await ctx.from(address).clear();
        return Response.json(result);
      }),
      POST("/v1/session/:sessionId/compact", async (_request, ctx) => {
        const address = ctx.params.sessionId ?? "http-default";
        const result = await ctx.from(address).compact();
        return Response.json(result);
      }),
      POST("/v1/session/:sessionId/reset", async (_request, ctx) => {
        const address = ctx.params.sessionId ?? "http-default";
        const result = await ctx.from(address).reset();
        return Response.json(result);
      })
    ]
  });
}
