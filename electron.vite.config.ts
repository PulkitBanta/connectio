import { defineConfig } from "electron-vite";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: {
          index: "src/main/index.ts",
        },
        formats: ["cjs"],
      },
    },
  },
  preload: {
    build: {
      lib: {
        entry: {
          index: "src/preload/index.ts",
        },
        formats: ["cjs"],
      },
    },
  },
  renderer: {
    root: "src/renderer",
    plugins: [tailwindcss(), solid()],
    build: {
      rollupOptions: {
        input: "src/renderer/index.html",
      },
    },
  },
});
