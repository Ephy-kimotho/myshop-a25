// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // Set "src" as the root
  optimizeDeps: {
    include: ["nanoid"],
  },
  server: {
    port: 5500,
    open: true,
  },
});
