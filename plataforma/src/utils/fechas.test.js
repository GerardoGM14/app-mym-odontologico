import { describe, expect, it } from 'vitest';
import { claveMes, fechaCalendarioDesdeInput, formatearFechaCalendario, hoyParaInput } from './fechas';

describe('fechas de calendario', () => {
  it('se guardan como medianoche UTC', () => {
    expect(fechaCalendarioDesdeInput('2025-04-18').toISOString()).toBe('2025-04-18T00:00:00.000Z');
  });

  it('se muestran sin correrse un día (antes en Perú salía 17/04)', () => {
    const fecha = fechaCalendarioDesdeInput('2025-04-18');
    expect(formatearFechaCalendario(fecha)).toBe('18/04/2025');
    // También funciona con Timestamps de Firestore (objetos con toDate).
    expect(formatearFechaCalendario({ toDate: () => fecha })).toBe('18/04/2025');
  });

  it('muestra un guion si no hay fecha', () => {
    expect(formatearFechaCalendario(undefined)).toBe('–');
  });
});

describe('utilidades', () => {
  it('hoyParaInput usa la fecha local', () => {
    expect(hoyParaInput(new Date(2025, 0, 5, 23, 30))).toBe('2025-01-05');
  });

  it('claveMes ordena bien como texto', () => {
    expect(claveMes(new Date(2025, 8, 1))).toBe('2025-09');
    expect(claveMes(new Date(2025, 9, 1)) > claveMes(new Date(2025, 8, 1))).toBe(true);
  });
});
