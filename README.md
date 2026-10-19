# Milla & Mendez · Odontología Integral

Repositorio con las dos aplicaciones de la clínica. Son **proyectos independientes**: cada
uno tiene sus propias dependencias, su propio build y se publica en su propio sitio. Solo
comparten la configuración de Firebase de la raíz.

```
plataforma-odonto/
├── plataforma/          Sistema clínico interno (React + Vite)      → ver plataforma/README.md
├── landing/             Página pública de la clínica (Astro)         → ver landing/README.md
├── firebase.json        Hosting de los dos sitios + reglas de seguridad
├── .firebaserc          Proyecto Firebase y a qué sitio va cada app
├── firestore.rules      Reglas de Firestore (protegen los datos de pacientes)
├── storage.rules        Reglas de Storage (archivos clínicos)
└── package.json         Atajos para trabajar desde la raíz (no tiene dependencias)
```

| App | Sitio de Firebase | Dirección |
| --- | --- | --- |
| Plataforma | `odonto-system-438b7` (sitio por defecto) | https://odonto-system-438b7.web.app |
| Landing | `milla-mendez-odontologia` | https://milla-mendez-odontologia.web.app |

## Primeros pasos

```
npm run instalar          # instala las dependencias de las dos apps
npm run dev:plataforma    # http://localhost:5173
npm run dev:landing       # http://localhost:4321
```

También puedes entrar a cada carpeta y usar sus propios comandos (`npm run dev`, `npm test`...).

## Pruebas

| Comando | Qué revisa |
| --- | --- |
| `npm test` | Lógica de la plataforma (dinero, fechas, odontograma, validaciones...) |
| `npm run test:integracion` | El flujo completo de la clínica y los permisos de cada rol, contra emuladores locales de Firebase con las reglas reales. Usa un proyecto de prueba (`demo-odonto`): **nunca toca los datos reales**. Requiere Java. |

Ejecuta `npm run test:integracion` antes de publicar cambios en las reglas o en `plataforma/src/services/`.

## Publicar

Todo se publica desde esta carpeta raíz. Cada sitio se compila solo antes de subirse.

| Comando | Qué publica |
| --- | --- |
| `firebase deploy --only hosting:plataforma` | Solo la plataforma |
| `firebase deploy --only hosting:landing` | Solo la landing |
| `firebase deploy --only firestore:rules,storage` | Solo las reglas de seguridad |
| `firebase deploy` | Todo lo anterior |

La primera vez, si el sitio de la landing no existe, créalo con
`firebase hosting:sites:create milla-mendez-odontologia`.
