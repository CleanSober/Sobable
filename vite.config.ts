import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split big vendor libs into stable, long-cacheable chunks so users only
    // re-download what actually changed between releases. Also keeps the main
    // entry chunk small for faster TTI on first visit.
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-motion": ["framer-motion"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle the heaviest deps so dev cold-start and first navigation
    // don't pay per-module Vite request waterfalls.
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "framer-motion",
      "lucide-react",
      "sonner",
    ],
  },
}));
