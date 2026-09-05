import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type ConfigEnv, type UserConfig } from "vite";

const desktopRoot = __dirname;

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv & {
    root: string;
    forgeConfigSelf?: { name?: string };
  };
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf?.name ?? "main_window";

  return {
    root,
    mode,
    base: "./",
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [react()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@mindmap/core": path.resolve(
          desktopRoot,
          "../../src/components/MindMap",
        ),
      },
    },
    clearScreen: false,
  } as UserConfig;
});
