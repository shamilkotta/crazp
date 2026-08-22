// Durable Object class names are preserved from the removed Think framework
// so existing deployments keep their SQLite data.
declare namespace Cloudflare {
  interface Env {
    ThinkAgent_Crazp: DurableObjectNamespace<
      InstanceType<(typeof import("./agents/crazp/agent"))["CrazpAgent"]>
    >;
    crazp: DurableObjectNamespace<
      InstanceType<(typeof import("./agents/crazp/agent"))["CrazpAgent"]>
    >;
  }
}
