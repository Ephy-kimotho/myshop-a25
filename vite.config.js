// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["nanoid"],
  },
  server: {
    port: 5500,
    open: true,
  },
});
