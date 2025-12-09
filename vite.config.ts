// Configuration file for VITE - tells Vite how to run the app and to handle the plugins.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./src",
  publicDir: "../public"
});
