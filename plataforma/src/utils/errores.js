const MENSAJES_FIREBASE = {
  'permission-denied': 'No tienes permisos para realizar esta acción.',
  'storage/unauthorized': 'No tienes permisos para realizar esta acción.',
  'unavailable': 'Sin conexión con el servidor. Revisa tu internet.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
  'auth/email-already-in-use': 'Ese correo ya está registrado.',
  'auth/weak-password': 'La contraseña es muy débil.',
};

// Traduce errores conocidos de Firebase; los errores de validación propios
// (ErrorValidacion) ya traen un mensaje para el usuario.
export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado.') {
  if (error?.name === 'ErrorValidacion') return error.message;
  return MENSAJES_FIREBASE[error?.code] ?? porDefecto;
}

export class ErrorValidacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorValidacion';
  }
}
