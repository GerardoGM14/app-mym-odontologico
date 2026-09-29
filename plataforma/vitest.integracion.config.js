import { defineConfig } from 'vitest/config';

// Pruebas de integración contra los emuladores de Firebase (proyecto demo-odonto).
// Se ejecutan desde la raíz con `npm run test:integracion`, que levanta los emuladores.
export default defineConfig({
  define: { 'import.meta.env.VITE_EMULADORES': JSON.stringify('1') },
  test: {
    include: ['src/integracion/**/*.test.js'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
