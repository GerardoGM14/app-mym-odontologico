// Pequeño almacén de notificaciones (toasts y diálogo de confirmación).
// Se puede usar desde cualquier lugar; <Notificaciones /> lo dibuja en pantalla.

let estado = { toasts: [], confirmacion: null };
const oyentes = new Set();
let siguienteId = 1;

function emitir(cambios) {
  estado = { ...estado, ...cambios };
  oyentes.forEach((oyente) => oyente());
}

export const almacenNotificaciones = {
  suscribir(oyente) {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  },
  obtener: () => estado,
};

export function cerrarToast(id) {
  emitir({ toasts: estado.toasts.filter((t) => t.id !== id) });
}

function mostrarToast(tipo, titulo, descripcion, duracion) {
  const id = siguienteId++;
  // Como máximo 4 a la vez: se descartan los más antiguos.
  emitir({ toasts: [...estado.toasts.slice(-3), { id, tipo, titulo, descripcion, duracion }] });
  setTimeout(() => cerrarToast(id), duracion);
  return id;
}

export const avisoExito = (titulo, descripcion) => mostrarToast('exito', titulo, descripcion, 3500);

export const avisoInfo = (titulo, descripcion) => mostrarToast('info', titulo, descripcion, 3500);

export function avisoError(titulo, error) {
  if (error) console.error(error);
  return mostrarToast('error', titulo, undefined, 5000);
}

// Devuelve una promesa que se resuelve con true (confirmado) o false (cancelado).
export function confirmar(titulo, texto, textoConfirmar = 'Sí, eliminar') {
  return new Promise((resolve) => {
    emitir({
      confirmacion: {
        titulo,
        texto,
        textoConfirmar,
        responder: (respuesta) => {
          emitir({ confirmacion: null });
          resolve(respuesta);
        },
      },
    });
  });
}
