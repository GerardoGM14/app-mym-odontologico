// Catálogos de la clínica. Para agregar profesionales, diagnósticos o
// tratamientos basta con editar este archivo.

export const ESPECIALIDADES = {
  'Odontólogo': {
    profesionales: ['Dr. Boris Milla', 'Dra. Sadhit Méndez'],
    diagnosticos: ['Caries dental', 'Pulpitis aguda', 'Absceso periapical'],
  },
  'Ortodoncista': {
    profesionales: ['Dra. Camila Ruiz', 'Dr. Mateo Paredes'],
    diagnosticos: ['Maloclusión clase II', 'Apiñamiento dental', 'Sobremordida'],
  },
};

export const TIPOS_TRATAMIENTO = ['Endodoncia', 'Obturación', 'Prótesis', 'Ortodoncia', 'Limpieza'];

export const ROLES = {
  admin: 'Administrador',
  asistente: 'Asistente',
};

export const ESTADOS_PAGO = {
  pendiente: 'pendiente',
  enProgreso: 'en progreso',
  pagado: 'pagado',
};

export const TAMANO_MAXIMO_ARCHIVO_MB = 20;
