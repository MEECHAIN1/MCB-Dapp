import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    server: {
      port: 3000,
      strictPort: false,
      host: true,
      allowedHosts: true,
    },
    define: {
      'import.meta.env.VIET_API_KEY': JSON.stringify(env.VITE_API_KEY || ""),
      'global': 'globalThis',
    }
  };
});