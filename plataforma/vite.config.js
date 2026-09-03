import { configDefaults } from 'vitest/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Electron carga dist/index.html desde el disco, así que necesita rutas relativas.
  base: mode === 'electron' ? './' : '/',
  build: {
    rollupOptions: {
      output: {
        // Firebase y los gráficos cambian poco: en archivos aparte quedan en caché del navegador.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          graficos: ['recharts'],
        },
      },
    },
  },
  test: {
    // Las pruebas de integración necesitan los emuladores: se ejecutan con `npm run test:integracion` (desde la raíz).
    exclude: [...configDefaults.exclude, 'src/integracion/**'],
  },
}));
