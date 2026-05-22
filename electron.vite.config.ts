import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: "src/main.js",
        },
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: "src/preload.js",
        },
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
