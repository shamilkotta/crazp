import { defineAgent } from "crazp";

export default defineAgent({
  name: "crazp",
  model: "@cf/moonshotai/kimi-k2.6",
  maxSteps: 250,
  chatRecovery: true,
  extensions: true,
  bootstrap: {
    path: "BOOTSTRAP.md",
    seed: `# Bootstrap

You just came online in a fresh workspace. Start a short onboarding conversation, learn the user's name and collaboration preferences, update internal identity and memory, then delete this bootstrap file.`,
    startMessage: "begin"
  }
});
