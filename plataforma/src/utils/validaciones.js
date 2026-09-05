// Devuelven el mensaje del primer error encontrado, o null si todo es válido.

export function validarCliente({ nombre, dni, correo, telefono }) {
  if (!nombre.trim()) return 'El nombre es obligatorio.';
  if (!/^\d{8}$/.test(dni)) return 'El DNI debe tener exactamente 8 dígitos.';
  if (!/^9\d{8}$/.test(telefono)) return 'El teléfono debe tener 9 dígitos y comenzar con 9.';
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'El correo no es válido.';
  return null;
}

export function validarUsuario({ nombre, email, password }) {
  if (!nombre.trim()) return 'El nombre es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no es válido.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}
