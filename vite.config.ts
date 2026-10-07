import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages sirve el proyecto en https://<user>.github.io/Solicitud-anticipada-uber/
// El base se aplica en el build (npm run build); en dev queda en "/".
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // VITE_ARTIFACT=1 (npm run build:artifact): vista previa publicable como Artifact, con rutas relativas.
  base: process.env.VITE_ARTIFACT === '1' ? './' : command === 'build' ? '/Solicitud-anticipada-uber/' : '/',
  resolve: {
    alias: {
      '@ds': fileURLToPath(new URL('./src/design-system', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
  server: { port: 5173 },
}));
