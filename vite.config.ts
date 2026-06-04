import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  define: {
    "process.env.SUPABASE_URL": "undefined",
    "process.env.SUPABASE_PUBLISHABLE_KEY": "undefined",
  },
});
