import { ESTADOS_PAGO } from '../config/catalogos';

// Los montos se guardan en soles (número) por compatibilidad con los datos
// existentes, pero toda la aritmética se hace en céntimos enteros para evitar
// errores de redondeo (0.1 + 0.2 !== 0.3).
export const aCentimos = (soles) => Math.round((Number(soles) || 0) * 100);

export const aSoles = (centimos) => centimos / 100;

export const sumarSoles = (montos) => aSoles(montos.reduce((total, m) => total + aCentimos(m), 0));

const formato = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatearSoles = (soles) => `S/. ${formato.format(Number(soles) || 0)}`;

export function calcularEstadoPago(precio, pagado) {
  const precioC = aCentimos(precio);
  const pagadoC = aCentimos(pagado);
  if (pagadoC >= precioC) return ESTADOS_PAGO.pagado;
  if (pagadoC <= 0) return ESTADOS_PAGO.pendiente;
  return ESTADOS_PAGO.enProgreso;
}

// El estado de un tratamiento se deriva siempre de sus pagos reales.
export function resumenPagos(precio, montos) {
  const pagado = sumarSoles(montos);
  const pendiente = aSoles(Math.max(aCentimos(precio) - aCentimos(pagado), 0));
  return { pagado, pendiente, estado: calcularEstadoPago(precio, pagado) };
}
