import { CONDICION_POR_CODIGO } from '../config/odontograma';

// Estructura de un odontograma: { [numeroDiente]: { [cara | 'diente']: [codigos] } }
// Las caras son vestibular, lingual, mesial, distal y oclusal; 'diente' guarda las
// condiciones de la pieza completa (endodoncia, corona, extracción...).

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const nombreCondicion = (codigo) => CONDICION_POR_CODIGO[codigo]?.nombre ?? capitalizar(String(codigo));

// --- Anatomía (numeración FDI) ---

const cuadrante = (numero) => Math.floor(Number(numero) / 10);

// Cuadrantes 1, 2 (permanentes) y 5, 6 (temporales) son del maxilar superior.
export const esSuperior = (numero) => [1, 2, 5, 6].includes(cuadrante(numero));

// En los cuadrantes del lado derecho del paciente (1, 4, 5, 8), que se dibujan a la
// izquierda de la pantalla, la cara mesial (hacia la línea media) queda a la derecha.
export const mesialALaDerecha = (numero) => [1, 4, 5, 8].includes(cuadrante(numero));

export function formaDiente(numero) {
  const pieza = Number(numero) % 10;
  const temporal = cuadrante(numero) >= 5;
  const superior = esSuperior(numero);
  if (pieza <= 2) return 'incisivo';
  if (pieza === 3) return 'canino';
  if (temporal || pieza >= 6) return superior ? 'molarSuperior' : 'molarInferior';
  // El primer premolar superior suele tener dos raíces.
  return superior && pieza === 4 ? 'premolarDoble' : 'premolar';
}

export const denticionDe = (numeros) => (numeros.some((n) => cuadrante(n) >= 5) ? 'nino' : 'adulto');

// --- Edición ---

export function alternarCondicion(odontograma, numero, cara, codigo) {
  const actuales = odontograma[numero]?.[cara] ?? [];
  const nuevas = actuales.includes(codigo) ? actuales.filter((c) => c !== codigo) : [...actuales, codigo];
  return { ...odontograma, [numero]: { ...odontograma[numero], [cara]: nuevas } };
}

export function quitarDiente(odontograma, numero) {
  const { [numero]: _quitado, ...resto } = odontograma;
  return resto;
}

const tieneCondiciones = (valor) => (Array.isArray(valor) ? valor.length > 0 : Boolean(valor));

export const dienteMarcado = (caras) => Object.values(caras ?? {}).some(tieneCondiciones);

// Quita los dientes que no tienen ninguna condición marcada.
export function limpiarSeleccion(seleccion) {
  return Object.fromEntries(Object.entries(seleccion).filter(([, caras]) => dienteMarcado(caras)));
}

// Los odontogramas de diagnóstico antiguos guardaban una condición por diente
// ({ 11: 'caries' }). Se convierten al formato por caras.
export function normalizarOdontograma(datos) {
  if (!datos) return { denticion: 'adulto', dientes: {} };
  if (datos.dientes) return { denticion: datos.denticion ?? 'adulto', dientes: datos.dientes };

  const dientes = {};
  for (const [numero, valor] of Object.entries(datos)) {
    if (!/^\d+$/.test(numero) || typeof valor !== 'string' || valor === 'sano') continue;
    const alcance = CONDICION_POR_CODIGO[valor]?.alcance ?? 'cara';
    dientes[numero] = alcance === 'diente' ? { diente: [valor] } : { oclusal: [valor] };
  }
  return { denticion: denticionDe(Object.keys(dientes)), dientes };
}

// --- Presentación ---

// Una cara puede guardar varias condiciones (arreglo) o, en datos antiguos, un texto.
export function formatearCara(valor) {
  if (Array.isArray(valor)) return valor.length > 0 ? valor.map(nombreCondicion).join(' + ') : '-';
  return valor ? nombreCondicion(valor) : '-';
}

export function condicionesDeSeleccion(seleccion) {
  const todas = Object.values(seleccion).flatMap((caras) => Object.values(caras).flat());
  return [...new Set(todas.filter(Boolean))];
}

export function sugerirTipoTratamiento(seleccion) {
  const condiciones = condicionesDeSeleccion(seleccion);
  if (condiciones.includes('endodoncia')) return 'Endodoncia';
  if (condiciones.includes('obturacion')) return 'Obturación';
  if (condiciones.includes('caries')) return 'Limpieza';
  if (Object.keys(seleccion).length > 6) return 'Ortodoncia';
  return '';
}

export function seleccionADetalle(seleccion) {
  return Object.entries(seleccion).map(([numero, caras]) => ({ numero, ...caras }));
}

export function detalleASeleccion(detalle) {
  return Object.fromEntries(detalle.map(({ numero, ...caras }) => [numero, caras]));
}

// El detalle se guarda como texto JSON en el tratamiento.
export function leerDetalle(detalle) {
  try {
    const datos = JSON.parse(detalle || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}
