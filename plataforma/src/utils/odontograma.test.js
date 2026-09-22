import { describe, expect, it } from 'vitest';
import {
  alternarCondicion, denticionDe, detalleASeleccion, esSuperior, formaDiente, formatearCara, leerDetalle,
  limpiarSeleccion, mesialALaDerecha, normalizarOdontograma, quitarDiente, seleccionADetalle, sugerirTipoTratamiento,
} from './odontograma';

describe('anatomía FDI', () => {
  it('reconoce el tipo de pieza', () => {
    expect(formaDiente(11)).toBe('incisivo');
    expect(formaDiente(43)).toBe('canino');
    expect(formaDiente(14)).toBe('premolarDoble');
    expect(formaDiente(24)).toBe('premolarDoble');
    expect(formaDiente(35)).toBe('premolar');
    expect(formaDiente(16)).toBe('molarSuperior');
    expect(formaDiente(46)).toBe('molarInferior');
    expect(formaDiente(55)).toBe('molarSuperior');
    expect(formaDiente(84)).toBe('molarInferior');
  });

  it('distingue maxilar superior e inferior (permanentes y temporales)', () => {
    expect([18, 21, 55, 61].every(esSuperior)).toBe(true);
    expect([48, 31, 85, 71].some(esSuperior)).toBe(false);
  });

  it('la cara mesial apunta a la línea media', () => {
    // Lado derecho del paciente (se dibuja a la izquierda): mesial a la derecha.
    expect([16, 46, 54, 84].every(mesialALaDerecha)).toBe(true);
    expect([26, 36, 64, 74].some(mesialALaDerecha)).toBe(false);
  });

  it('detecta la dentición', () => {
    expect(denticionDe(['11', '26'])).toBe('adulto');
    expect(denticionDe(['55', '74'])).toBe('nino');
  });
});

describe('edición', () => {
  it('alterna una condición en una cara', () => {
    const con = alternarCondicion({}, 16, 'oclusal', 'caries');
    expect(con).toEqual({ 16: { oclusal: ['caries'] } });
    expect(alternarCondicion(con, 16, 'oclusal', 'caries')).toEqual({ 16: { oclusal: [] } });
  });

  it('marca la pieza completa sin perder las caras', () => {
    const con = alternarCondicion({ 16: { mesial: ['caries'] } }, 16, 'diente', 'endodoncia');
    expect(con[16]).toEqual({ mesial: ['caries'], diente: ['endodoncia'] });
  });

  it('quitarDiente borra todas sus marcas', () => {
    expect(quitarDiente({ 11: { oclusal: ['caries'] }, 12: { diente: ['corona'] } }, 11)).toEqual({ 12: { diente: ['corona'] } });
  });
});

describe('odontogramas antiguos', () => {
  it('convierte el formato de una condición por diente', () => {
    expect(normalizarOdontograma({ 11: 'caries', 16: 'endodoncia', 21: 'sano' })).toEqual({
      denticion: 'adulto',
      dientes: { 11: { oclusal: ['caries'] }, 16: { diente: ['endodoncia'] } },
    });
  });

  it('respeta el formato nuevo', () => {
    const nuevo = { denticion: 'nino', dientes: { 55: { mesial: ['caries'] } } };
    expect(normalizarOdontograma(nuevo)).toEqual(nuevo);
  });

  it('tolera un odontograma vacío', () => {
    expect(normalizarOdontograma({})).toEqual({ denticion: 'adulto', dientes: {} });
  });
});

describe('formatearCara', () => {
  it('usa los nombres clínicos', () => expect(formatearCara(['caries', 'obturacion'])).toBe('Caries + Restauración'));
  it('muestra guion si no hay condiciones', () => {
    expect(formatearCara([])).toBe('-');
    expect(formatearCara(undefined)).toBe('-');
  });
  it('acepta textos y códigos de datos antiguos', () => {
    expect(formatearCara('caries')).toBe('Caries');
    expect(formatearCara(['curacion'])).toBe('Curacion');
  });
});

describe('sugerirTipoTratamiento', () => {
  it('detecta condiciones en caras y en la pieza completa', () => {
    expect(sugerirTipoTratamiento({ 11: { diente: ['endodoncia'] } })).toBe('Endodoncia');
    expect(sugerirTipoTratamiento({ 11: { mesial: ['caries', 'obturacion'] } })).toBe('Obturación');
    expect(sugerirTipoTratamiento({ 26: { distal: ['caries'] } })).toBe('Limpieza');
  });

  it('sugiere ortodoncia con más de 6 dientes sin otra condición', () => {
    const seleccion = Object.fromEntries([11, 12, 13, 14, 15, 16, 17].map((n) => [n, { diente: ['corona'] }]));
    expect(sugerirTipoTratamiento(seleccion)).toBe('Ortodoncia');
  });

  it('no sugiere nada sin condiciones', () => expect(sugerirTipoTratamiento({})).toBe(''));
});

describe('selección y detalle', () => {
  it('limpiarSeleccion quita dientes sin marcas', () => {
    expect(limpiarSeleccion({ 11: { oclusal: [] }, 12: { mesial: ['caries'] } })).toEqual({ 12: { mesial: ['caries'] } });
  });

  it('seleccionADetalle y detalleASeleccion son inversos', () => {
    const seleccion = { 12: { mesial: ['caries'] } };
    expect(seleccionADetalle(seleccion)).toEqual([{ numero: '12', mesial: ['caries'] }]);
    expect(detalleASeleccion(seleccionADetalle(seleccion))).toEqual(seleccion);
  });

  it('leerDetalle tolera JSON inválido', () => {
    expect(leerDetalle('no es json')).toEqual([]);
    expect(leerDetalle(undefined)).toEqual([]);
    expect(leerDetalle('[{"numero":"11"}]')).toEqual([{ numero: '11' }]);
  });
});
