import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/channels/index.ts"],
  format: "esm",
  dts: true,
  sourcemap: false,
  clean: true,
  fixedExtension: false,
  platform: "neutral"
});
