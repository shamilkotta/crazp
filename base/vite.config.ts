import { cloudflare } from "@cloudflare/vite-plugin";
import agents from "agents/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), agents(), cloudflare()]
});
