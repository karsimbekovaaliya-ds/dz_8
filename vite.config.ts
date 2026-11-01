import { defineConfig } from "vite";

// Без Babel и без @vitejs/plugin-react: JSX компилирует встроенный esbuild.
// base "./" — сайт работает на GitHub Pages из любого подкаталога (/repo-name/).
export default defineConfig({
  base: "./",
  esbuild: { jsx: "automatic" },
});
