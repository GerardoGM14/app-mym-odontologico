# Milla & Mendez · Landing

Página pública de la clínica, hecha con Astro y Tailwind CSS v4. Usa la misma identidad
visual que la plataforma interna (`../plataforma-odonto`).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:4321 |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run preview` | Sirve `dist/` para revisarlo antes de publicar |

## Editar contenido

Teléfono, sedes, redes sociales, servicios y motivos están en `src/data/clinica.ts`.
Las secciones viven en `src/components/` y la paleta de colores en `src/styles/global.css`.

## Publicación

La configuración de Firebase está en la raíz del repositorio (`../firebase.json`, `../.firebaserc`).
Desde la raíz:

```
firebase deploy --only hosting:landing
```

El build se ejecuta solo antes de publicar (`predeploy`). Más detalles en `../README.md`.
