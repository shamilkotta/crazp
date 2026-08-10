import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  sourcemap: false,
  clean: true,
  unbundle: true,
  fixedExtension: false,
  platform: "neutral",
  deps: {
    neverBundle: ["ai"]
  }
});
