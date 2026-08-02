import { defineSubagent } from "crazp";

export default defineSubagent({
  displayName: "Worker",
  model: "@cf/moonshotai/kimi-k2.6",
  maxSteps: 250,
  description:
    "Hand off heavy work to a generic isolated worker. Pass a self-contained brief with goal, constraints, and expected output."
});
