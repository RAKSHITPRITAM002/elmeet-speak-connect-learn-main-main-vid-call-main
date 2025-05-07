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
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "components": path.resolve(__dirname, "./src/components.ts"),
      "ui": path.resolve(__dirname, "./src/ui.ts"),
      "lib": path.resolve(__dirname, "./src/lib.ts"),
      "utils": path.resolve(__dirname, "./src/utils.ts"),
      "hooks": path.resolve(__dirname, "./src/hooks.ts"),
      "contexts": path.resolve(__dirname, "./src/contexts"),
      "integrations": path.resolve(__dirname, "./src/integrations.ts"),
      "pages": path.resolve(__dirname, "./src/pages.ts"),
    },
  },
}));
