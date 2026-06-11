import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Compila toda la app en UN solo archivo HTML (polla-standalone.html) que
// funciona sin servidor: doble clic y listo. En este modo no hay datos
// compartidos (no puede leer public/data/); todo queda en el navegador local.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
  build: {
    outDir: "dist-standalone",
  },
});
