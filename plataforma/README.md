# Milla & Mendez · Odontología Integral

Sistema de gestión de la clínica: pacientes, diagnósticos, odontograma, tratamientos,
pagos, archivos clínicos y estadísticas. Hecho con React 19 + Vite, Tailwind CSS v4 y
Firebase (Auth, Firestore y Storage). Opcionalmente se empaqueta como app de escritorio
con Electron.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Compila la versión web en `dist/` |
| `npm test` | Ejecuta las pruebas (Vitest) |
| `npm run lint` | Revisa el código con ESLint |
| `npm run electron` | Compila y abre la app de escritorio |
| `npm run electron:dev` | Abre Electron sobre el servidor de desarrollo (requiere `npm run dev`) |

## Estructura

```
src/
├── App.jsx                 Rutas (cada página se carga bajo demanda)
├── main.jsx                Punto de entrada
├── index.css               Paleta de la marca (oro, tinta, crema, arena), tipografías y clases
│                           reutilizables (.btn-*, .campo, .etiqueta, .tarjeta, .tabla)
├── assets/                 Logos de la marca (sello, diente claro/oscuro, horizontal para PDF)
├── config/                 Catálogos editables: profesionales, diagnósticos, tratamientos, odontograma
├── context/                Sesión del usuario (useAuth)
├── hooks/useDatos.js       Carga de datos con estados de carga/error/recarga
├── lib/firebase.js         Inicialización de Firebase
├── services/               Todo el acceso a Firestore/Storage (una capa por entidad)
├── utils/                  Lógica pura y probada: dinero, fechas, odontograma, validaciones...
├── components/
│   ├── layout/             Sidebar plegable, barra superior con migas de pan, protección de rutas
│   ├── ui/                 Modal, toasts y confirmación, encabezado de página, cargando
│   └── odontograma/        Diente interactivo, modal del odontograma y placa
└── pages/                  Una carpeta por módulo (clientes, diagnosticos, tratamientos, usuarios)
```

Reglas para mantenerlo ordenado:

- Las páginas **no** importan `firebase/firestore`: piden los datos a `services/`.
- La lógica que no depende de React va en `utils/` con su archivo `.test.js`.
- Para agregar un profesional, diagnóstico o tipo de tratamiento, edita `src/config/catalogos.js`.
- Usa los colores de la marca (`oro-*`, `tinta-*`, `crema`, `arena`) en lugar de los de Tailwind.
- Avisos: `avisoExito`, `avisoError`, `avisoInfo` y `confirmar` de `utils/notificaciones.js`.
- Cada página declara sus migas de pan con la prop `migas` de `EncabezadoPagina`.

## Modelo de datos (Firestore)

```
usuarios/{uid}                     { nombre, email, rol: 'admin'|'asistente', activo }
clientes/{clienteId}               { nombre, dni, correo, telefono }
  archivos/{id}                    { nombre, ruta, url, fecha }
  diagnosticos/{id}                { fecha, especialidad, odontologo, diagnostico, observaciones }
    odontograma/estado             { [diente]: condicion }
    tratamientos/{id}              { tipo, diente, precio, detalle }
      pagos/{id}                   { monto, fecha }
```

El estado de un tratamiento (pendiente / en progreso / pagado) **no se guarda**: se calcula
siempre a partir de sus pagos. Los montos se guardan en soles, pero se suman en céntimos.

## Seguridad y roles

La seguridad está en `../firestore.rules` y `../storage.rules`, en la raíz del repositorio (ya no hay PIN en el código):

- **Sin perfil activo** en `usuarios/{uid}` no se puede leer ni escribir nada, aunque
  alguien cree una cuenta por su cuenta.
- **Asistente**: registra y edita clientes, diagnósticos, tratamientos, pagos y odontogramas.
- **Administrador**: además edita diagnósticos, sube/elimina archivos, elimina clientes
  (con todo su historial) y gestiona usuarios desde el módulo *Usuarios*.

### Puesta en marcha (una sola vez)

1. **Crear el primer administrador.** En la consola de Firebase → Firestore, crea el documento
   `usuarios/<UID>` (el UID aparece en Authentication, o en la pantalla "Cuenta sin acceso"
   al iniciar sesión) con los campos:
   - `nombre` (string), `email` (string), `rol` = `"admin"` (string), `activo` = `true` (boolean)
2. **Desplegar las reglas** desde la raíz del repositorio (requiere `npm i -g firebase-tools` y `firebase login`):
   ```
   firebase deploy --only firestore:rules,storage
   ```
   La primera vez, Firebase pedirá permiso para que Storage lea Firestore: acéptalo.
3. Desde el módulo *Usuarios*, el administrador da de alta al resto del personal.
4. Deja activada la opción Authentication → Settings → *User actions* → **"Enable create
   (sign-up)"**: el módulo *Usuarios* la necesita para dar de alta cuentas. No es un riesgo,
   porque una cuenta creada por fuera no tiene perfil y, por tanto, no accede a ningún dato.
