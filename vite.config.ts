import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // svgr must precede react(): it turns *.svg?react into JSX, which react()
  // then compiles. Reversed, react() sees a plain .svg and passes it through.
  plugins: [svgr(), react(), cloudflare(), tailwindcss()],
});
