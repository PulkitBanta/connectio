import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: {
          index: "src/main.js",
        },
        formats: ["cjs"],
      },
    },
  },
  preload: {
    build: {
      lib: {
        entry: {
          index: "src/preload.js",
        },
        formats: ["cjs"],
      },
    },
  },
  renderer: {
    root: "src/renderer",
    build: {
      rollupOptions: {
        input: "src/renderer/index.html",
      },
    },
  },
});
