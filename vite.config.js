import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  let backendOrigin = "http://localhost:5000";

  try {
    backendOrigin = new URL(env.VITE_API_URL).origin;
  } catch {
    // Keep the local fallback when VITE_API_URL is absent or invalid.
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
