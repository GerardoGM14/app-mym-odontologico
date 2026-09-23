import { ESTADOS_PAGO } from '../config/catalogos';
import { aCentimos, aSoles } from './dinero';
import { claveMes, etiquetaMes } from './fechas';

// tratamientos: [{ ruta, tipo, estado }]
// pagos: [{ rutaTratamiento, monto, fecha: Date|null }]
export function calcularEstadisticas({ tratamientos, pagos }, filtroTipo = 'todos') {
  const incluidos = filtroTipo === 'todos'
    ? tratamientos
    : tratamientos.filter((t) => t.tipo === filtroTipo);
  const rutasIncluidas = new Set(incluidos.map((t) => t.ruta));

  const conteoTipos = {};
  const conteoEstados = { [ESTADOS_PAGO.pagado]: 0, [ESTADOS_PAGO.enProgreso]: 0, [ESTADOS_PAGO.pendiente]: 0 };
  for (const t of incluidos) {
    conteoTipos[t.tipo] = (conteoTipos[t.tipo] || 0) + 1;
    conteoEstados[t.estado] = (conteoEstados[t.estado] || 0) + 1;
  }

  const centimosPorMes = {};
  for (const p of pagos) {
    if (!p.fecha || !rutasIncluidas.has(p.rutaTratamiento)) continue;
    const clave = claveMes(p.fecha);
    centimosPorMes[clave] = (centimosPorMes[clave] || 0) + aCentimos(p.monto);
  }

  return {
    porTipo: Object.entries(conteoTipos).map(([tipo, cantidad]) => ({ tipo, cantidad })),
    porEstado: Object.entries(conteoEstados).map(([estado, valor]) => ({ estado, valor })),
    porMes: Object.keys(centimosPorMes)
      .sort()
      .map((clave) => ({ mes: etiquetaMes(clave), monto: aSoles(centimosPorMes[clave]) })),
  };
}
