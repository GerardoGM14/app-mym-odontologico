// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Dirección pública de la landing (segundo sitio de Hosting del proyecto Firebase).
  site: 'https://milla-mendez-odontologia.web.app',
  vite: {
    plugins: [tailwindcss()],
    // Evita que Vite tome el postcss.config.js de la carpeta superior (ProyectoMyM).
    css: { postcss: { plugins: [] } },
  },
});
