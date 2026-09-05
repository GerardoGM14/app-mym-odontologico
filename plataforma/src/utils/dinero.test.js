import { describe, expect, it } from 'vitest';
import { calcularEstadoPago, formatearSoles, resumenPagos, sumarSoles } from './dinero';

describe('sumarSoles', () => {
  it('suma sin errores de redondeo', () => {
    expect(sumarSoles([0.1, 0.2])).toBe(0.3);
    expect(sumarSoles([33.33, 33.33, 33.34])).toBe(100);
  });

  it('tolera textos y valores vacíos de datos antiguos', () => {
    expect(sumarSoles(['10.50', undefined, null, 5])).toBe(15.5);
  });
});

describe('calcularEstadoPago', () => {
  it('pendiente sin pagos', () => expect(calcularEstadoPago(100, 0)).toBe('pendiente'));
  it('en progreso con pago parcial', () => expect(calcularEstadoPago(100, 40)).toBe('en progreso'));
  it('pagado al completar', () => expect(calcularEstadoPago(100, 100)).toBe('pagado'));
  it('tratamiento gratuito cuenta como pagado', () => expect(calcularEstadoPago(0, 0)).toBe('pagado'));
});

describe('resumenPagos', () => {
  it('calcula pagado, pendiente y estado', () => {
    expect(resumenPagos(150, [50, 25.5])).toEqual({ pagado: 75.5, pendiente: 74.5, estado: 'en progreso' });
  });

  it('el pendiente nunca es negativo', () => {
    expect(resumenPagos(100, [80, 50]).pendiente).toBe(0);
  });
});

describe('formatearSoles', () => {
  it('usa dos decimales', () => {
    expect(formatearSoles(1234.5)).toBe('S/. 1,234.50');
    expect(formatearSoles(undefined)).toBe('S/. 0.00');
  });
});
