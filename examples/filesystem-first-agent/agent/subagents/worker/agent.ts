import { defineSubagent } from "crazp";

export default defineSubagent({
  displayName: "Helper",
  model: "openai/gpt-5.4",
  maxSteps: 250,
  description:
    "Hand off heavy work to a generic helper subagent. Pass a self-contained brief with goal, constraints, and expected output."
});
