import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base = nombre del repositorio, para que la app funcione en
// https://alejandrom3lo.github.io/BarrilMundialista/
export default defineConfig({
  plugins: [react()],
  base: "/BarrilMundialista/",
});
