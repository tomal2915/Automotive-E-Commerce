import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom", // simulates a browser DOM in Node, since there's no real browser in CI
    globals: true, // lets test files use `describe`/`it`/`expect` without importing them every time
    setupFiles: "./src/test-setup.ts",
  },
});
