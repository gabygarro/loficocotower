import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";

export default defineConfig({
  plugins: [vike({ prerender: true }), react({})],
  build: {
    target: "es2022",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "src/setupTests.js"],
    },
  },
});
