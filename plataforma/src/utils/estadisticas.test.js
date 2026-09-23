import { describe, expect, it } from 'vitest';
import { calcularEstadisticas } from './estadisticas';

const datos = {
  tratamientos: [
    { ruta: 't1', tipo: 'Limpieza', estado: 'pagado' },
    { ruta: 't2', tipo: 'Limpieza', estado: 'pendiente' },
    { ruta: 't3', tipo: 'Endodoncia', estado: 'en progreso' },
  ],
  pagos: [
    { rutaTratamiento: 't1', monto: 0.1, fecha: new Date(2025, 9, 5) },
    { rutaTratamiento: 't1', monto: 0.2, fecha: new Date(2025, 9, 20) },
    { rutaTratamiento: 't3', monto: 50, fecha: new Date(2025, 8, 1) },
    { rutaTratamiento: 't3', monto: 10, fecha: null },
  ],
};

describe('calcularEstadisticas', () => {
  it('cuenta por tipo y por estado', () => {
    const { porTipo, porEstado } = calcularEstadisticas(datos);
    expect(porTipo).toEqual([{ tipo: 'Limpieza', cantidad: 2 }, { tipo: 'Endodoncia', cantidad: 1 }]);
    expect(porEstado).toEqual([
      { estado: 'pagado', valor: 1 },
      { estado: 'en progreso', valor: 1 },
      { estado: 'pendiente', valor: 1 },
    ]);
  });

  it('ordena los meses cronológicamente, suma exacto e ignora pagos sin fecha', () => {
    const { porMes } = calcularEstadisticas(datos);
    expect(porMes.map((m) => m.monto)).toEqual([50, 0.3]);
  });

  it('el filtro por tipo también se aplica a los pagos', () => {
    const { porTipo, porMes } = calcularEstadisticas(datos, 'Limpieza');
    expect(porTipo).toEqual([{ tipo: 'Limpieza', cantidad: 2 }]);
    expect(porMes.map((m) => m.monto)).toEqual([0.3]);
  });
});
