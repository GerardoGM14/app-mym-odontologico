// Datos de la clínica. Para cambiar textos, teléfono o servicios, edita solo este archivo.

export const clinica = {
  nombre: 'Milla & Mendez',
  especialidad: 'Odontología integral',
  lema: 'Cuidamos sonrisas, hoy, mañana y siempre.',
  descripcion:
    'Clínica dental en Chimbote y Nuevo Chimbote. Odontología integral, estética dental, implantes, ortodoncia y atención especializada para niños.',
  telefono: '921 585 850',
  telefonoInternacional: '+51921585850',
  mensajeWhatsapp: 'Hola, quisiera agendar una cita en Milla & Mendez.',
  sedes: ['Chimbote', 'Nuevo Chimbote'],
  // Teléfono de contacto que aparece en el pie de página (WhatsApp).
  telefonoContacto: '+51 921 585 850',
  // Completar con las direcciones de las páginas oficiales; si están vacías no se muestran.
  redes: {
    facebook: 'https://www.facebook.com/profile.php?id=100083419627186',
    instagram: 'https://www.instagram.com/mmodontologiai/',
    tiktok: 'https://www.tiktok.com/@mmodontologiaintegral',
  },
  // Herramientas de medición. Solo se cargan si el visitante acepta las cookies.
  // Si un identificador está vacío, esa herramienta no se carga.
  analitica: {
    googleAnalytics: '', // ID de medición de Google Analytics 4, p. ej. 'G-XXXXXXXXXX'
    metaPixel: '', // ID del píxel de Meta (Facebook/Instagram), p. ej. '123456789012345'
  },
  // Plataforma interna para el personal.
  urlPlataforma: 'https://odonto-system-438b7.web.app',
};

export const urlWhatsapp = `https://wa.me/${clinica.telefonoInternacional.replace('+', '')}?text=${encodeURIComponent(clinica.mensajeWhatsapp)}`;
export const urlLlamada = `tel:${clinica.telefonoInternacional}`;
export const urlWhatsappContacto = `https://wa.me/${clinica.telefonoContacto.replace(/\D/g, '')}`;

// Sedes como aparecen en el pie de página.
export const sedesPie = [
  { zona: 'Nvo. Chimbote', direccion: 'Primero de Agosto C-30' },
  { zona: 'Nvo. Chimbote', direccion: 'José Carlos Mariátegui F3' },
  { zona: 'Chimbote', direccion: 'Esperanza Baja, Huascar O 16 A' },
];

export type NombreIcono =
  | 'diente' | 'sonrisa' | 'implante' | 'brackets' | 'nino' | 'escudo' | 'corazon' | 'tecnologia'
  | 'calendario' | 'ubicacion' | 'telefono' | 'lineas' | 'destellos' | 'manos' | 'flecha';

// Tarjetas de "Nuestros servicios". Las fotos van en public/ con estos nombres
// (formato vertical 2:3, idealmente 800 x 1200 px).
export const servicios: { titulo: string; descripcion: string; icono: NombreIcono; imagen: string; alt: string }[] = [
  {
    titulo: 'Prevención y cuidado',
    descripcion: 'Cuidamos tu salud bucal con limpiezas dentales y tratamientos como endodoncias y exodoncias.',
    icono: 'escudo',
    imagen: '/servicio-prevencion.jpg',
    alt: 'Odontóloga realizando una revisión dental a un paciente',
  },
  {
    titulo: 'Ortodoncia y alineación',
    descripcion: 'Corregimos la posición de los dientes para mejorar su alineación y mordida.',
    icono: 'lineas',
    imagen: '/servicio-ortodoncia.jpg',
    alt: 'Paciente sonriente con brackets',
  },
  {
    titulo: 'Estética dental',
    descripcion: 'Mejoramos la apariencia de tu sonrisa con blanqueamientos y carillas dentales.',
    icono: 'destellos',
    imagen: '/servicio-estetica.jpg',
    alt: 'Odontóloga comparando el tono de los dientes con una guía de colores',
  },
  {
    titulo: 'Rehabilitación dental',
    descripcion: 'Recuperamos la función y estructura de los dientes mediante coronas y prótesis dentales.',
    icono: 'manos',
    imagen: '/servicio-rehabilitacion.jpg',
    alt: 'Paciente mostrando su sonrisa frente a un espejo junto a su odontóloga',
  },
];

export const urlWhatsappServicio = (servicio: string) =>
  `https://wa.me/${clinica.telefonoInternacional.replace('+', '')}?text=${encodeURIComponent(`Hola, quisiera más información sobre ${servicio.toLowerCase()}.`)}`;

// Tarjetas de la sección "Conócenos". Las fotos están en public/.
export const tarjetasConocenos = [
  {
    imagen: '/card-odontologia-integral.jpg',
    alt: 'Odontóloga conversando con una paciente en el consultorio',
    titulo: 'Odontología integral',
    descripcion: 'Diferentes especialidades y opciones de atención para cuidar tu salud bucal.',
    rotacion: -5,
  },
  {
    imagen: '/card-compromiso-bienestar.jpg',
    alt: 'Paciente sonriente durante su atención dental',
    titulo: 'Compromiso con tu bienestar',
    descripcion: 'Nos importa que recibas una atención responsable y acorde con tus necesidades.',
    rotacion: 0,
  },
  {
    imagen: '/card-cuidado-familia.jpg',
    alt: 'Odontóloga atendiendo a una niña acompañada de su madre',
    titulo: 'Cuidado para toda la familia',
    descripcion: 'Atención odontológica para niños y adultos en las distintas etapas de la vida.',
    rotacion: 5,
  },
];

// Sedes de la sección "Visítanos". Las fotos van en public/ con estos nombres
// (proporción 6:7, idealmente 720 x 840 px). En `mapa` se puede pegar el enlace
// exacto de Google Maps; si no hay, "Cómo llegar" busca la dirección.
export const consultorios: {
  nombre: string;
  ciudad: string;
  direccion: string;
  referencia?: string;
  imagen: string;
  alt: string;
  mapa?: string;
}[] = [
  {
    nombre: 'Sede José Carlos Mariátegui',
    ciudad: 'Nuevo Chimbote',
    direccion: 'José Carlos Mariátegui F3',
    referencia: 'Costado óvalo San Pedrito',
    imagen: '/sede-jose-carlos-mariategui.jpg',
    alt: 'Fachada de la sede José Carlos Mariátegui de Milla & Méndez',
  },
  {
    nombre: 'Sede Primero de Agosto',
    ciudad: 'Nuevo Chimbote',
    direccion: 'Primero de Agosto C-30',
    referencia: '1/2 Cuadra Grifo DOXA',
    imagen: '/sede-primero-de-agosto.jpg',
    alt: 'Fachada de la sede Primero de Agosto de Milla & Méndez',
  },
  {
    // Falta la referencia de esta sede.
    nombre: 'Sede Esperanza Baja',
    ciudad: 'Chimbote',
    direccion: 'Esperanza Baja, Huascar O 16 A',
    imagen: '/sede-3.jpg',
    alt: 'Fachada de la sede Esperanza Baja de Milla & Méndez',
  },
];

// Motivos de "¿Por qué elegirnos?". Los íconos (SVG dorados) están en public/.
export const motivos = [
  {
    icono: '/icon-atencion.svg',
    titulo: 'Atención personalizada',
    descripcion: 'Escuchamos tus inquietudes para orientarte según lo que necesitas.',
  },
  {
    icono: '/icon-explicaciones.svg',
    titulo: 'Explicaciones claras',
    descripcion: 'Te ayudamos a comprender tus opciones y resolver tus dudas.',
  },
  {
    icono: '/icon-ambiente.svg',
    titulo: 'Un ambiente acogedor',
    descripcion: 'Buscamos que te sientas cómodo y en confianza durante tu visita.',
  },
  {
    icono: '/icon-cuidado.svg',
    titulo: 'Cuidado responsable',
    descripcion: 'Promovemos decisiones informadas y hábitos que favorezcan tu salud bucal.',
  },
];
