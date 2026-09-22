// Numeración FDI. En cada arcada, los dientes van en el orden en que se dibujan:
// de la derecha del paciente (izquierda de la pantalla) a su izquierda.
export const DENTICIONES = {
  adulto: {
    nombre: 'Adulto (permanente)',
    superior: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    inferior: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
  },
  nino: {
    nombre: 'Niño (temporal)',
    superior: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
    inferior: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
  },
};

export const CARAS = ['vestibular', 'lingual', 'mesial', 'distal', 'oclusal'];

export const NOMBRE_CARA = {
  vestibular: 'Vestibular',
  lingual: 'Lingual / palatino',
  mesial: 'Mesial',
  distal: 'Distal',
  oclusal: 'Oclusal / incisal',
  diente: 'Pieza completa',
};

// Colores clínicos (convención del odontograma: rojo = por tratar, azul = tratado / buen estado).
const ROJO = '#dc2626';
const AZUL = '#2563eb';

// alcance 'cara': se pinta la cara elegida.
// alcance 'diente': se marca sobre la pieza (`marca` define el dibujo en DienteSvg).
export const CONDICIONES = [
  { code: 'caries', nombre: 'Caries', alcance: 'cara', color: ROJO },
  { code: 'obturacion', nombre: 'Restauración', alcance: 'cara', color: AZUL },
  { code: 'sellante', nombre: 'Sellante', alcance: 'cara', color: '#93c5fd' },
  { code: 'fractura', nombre: 'Fractura', alcance: 'diente', marca: 'fractura', color: ROJO },
  { code: 'exodoncia', nombre: 'Extracción indicada', alcance: 'diente', marca: 'cruz', color: ROJO },
  { code: 'endodoncia', nombre: 'Endodoncia', alcance: 'diente', marca: 'endodoncia', color: AZUL },
  { code: 'corona', nombre: 'Corona', alcance: 'diente', marca: 'corona', color: AZUL },
  { code: 'ausente', nombre: 'Pieza ausente', alcance: 'diente', marca: 'cruz', color: AZUL },
];

export const CONDICION_POR_CODIGO = Object.fromEntries(CONDICIONES.map((c) => [c.code, c]));
