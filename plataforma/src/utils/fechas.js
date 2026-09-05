// Hay dos tipos de fecha en el sistema:
// - Fechas de calendario (p. ej. la fecha del diagnóstico): se eligen en un
//   <input type="date">, se guardan como medianoche UTC y se muestran en UTC.
//   Si se mostraran en hora local, en Perú (UTC-5) aparecerían un día antes.
// - Momentos (p. ej. la fecha de un pago o de un archivo): se muestran en hora local.

const FORMATO_FECHA = { day: '2-digit', month: '2-digit', year: 'numeric' };

const aDate = (valor) => {
  if (!valor) return null;
  if (typeof valor.toDate === 'function') return valor.toDate();
  return valor instanceof Date ? valor : null;
};

export function fechaCalendarioDesdeInput(valor) {
  const [anio, mes, dia] = valor.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

export function formatearFechaCalendario(valor) {
  return aDate(valor)?.toLocaleDateString('es-PE', { ...FORMATO_FECHA, timeZone: 'UTC' }) ?? '–';
}

export function formatearFecha(valor) {
  return aDate(valor)?.toLocaleDateString('es-PE', FORMATO_FECHA) ?? '–';
}

export function hoyParaInput(ahora = new Date()) {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

export const milisegundos = (valor) => aDate(valor)?.getTime() ?? 0;

export function claveMes(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

export function etiquetaMes(clave) {
  const [anio, mes] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
}
