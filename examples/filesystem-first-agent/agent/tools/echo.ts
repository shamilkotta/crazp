import ctx from "crazp:ctx";
import { defineTool } from "crazp";
import { z } from "zod";

export default defineTool({
  description: "Echo a message back with the current agent name.",
  inputSchema: z.object({
    message: z.string().describe("Message to echo back")
  }),
  execute: async ({ message }) => {
    return {
      message,
      agentName: ctx.agentName
    };
  }
});
