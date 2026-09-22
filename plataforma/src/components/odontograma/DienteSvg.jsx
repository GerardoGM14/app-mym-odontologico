import { CONDICION_POR_CODIGO, CONDICIONES, NOMBRE_CARA } from '../../config/odontograma';
import { esSuperior, formaDiente, mesialALaDerecha } from '../../utils/odontograma';

// Siluetas dibujadas para un diente superior en un lienzo de 40 x 64:
// raíces arriba (y 0–40) y corona abajo (y 38–64). Los inferiores se dibujan
// invertidos. `ejes` son los conductos (x, punta de la raíz) para la endodoncia.
const CORONAS = {
  incisivo: 'M10,38 L30,38 L31,57 Q30,63 25,63 L15,63 Q10,63 9,57 Z',
  canino: 'M9,38 L31,38 Q33,53 20,64 Q7,53 9,38 Z',
  premolar: 'M7,38 L33,38 Q35,52 31,60 Q26,64 20,60 Q14,64 9,60 Q5,52 7,38 Z',
  molar: 'M3,38 L37,38 Q39,52 36,60 Q32,64 27,60 Q23,64 20,60 Q17,64 13,60 Q8,64 4,60 Q1,52 3,38 Z',
};

const FORMAS = {
  incisivo: { corona: CORONAS.incisivo, raices: ['M12,40 Q13,10 20,2 Q27,10 28,40 Z'], ejes: [[20, 7]] },
  canino: { corona: CORONAS.canino, raices: ['M11,40 Q12,6 20,0 Q28,6 29,40 Z'], ejes: [[20, 5]] },
  premolar: { corona: CORONAS.premolar, raices: ['M12,40 Q13,12 20,4 Q27,12 28,40 Z'], ejes: [[20, 9]] },
  premolarDoble: {
    corona: CORONAS.premolar,
    raices: ['M9,40 Q9,14 14,6 Q18,14 19,40 Z', 'M21,40 Q22,14 26,6 Q31,14 31,40 Z'],
    ejes: [[14, 11], [26, 11]],
  },
  molarSuperior: {
    corona: CORONAS.molar,
    raices: ['M5,40 Q4,16 9,8 Q13,18 14,40 Z', 'M15,40 Q16,12 20,4 Q24,12 25,40 Z', 'M26,40 Q27,18 31,8 Q36,16 35,40 Z'],
    ejes: [[9.5, 13], [20, 9], [30.5, 13]],
  },
  molarInferior: {
    corona: CORONAS.molar,
    raices: ['M5,40 Q5,14 11,6 Q16,16 17,40 Z', 'M23,40 Q24,16 29,6 Q35,14 35,40 Z'],
    ejes: [[11, 11], [29, 11]],
  },
};

// Recuadro de las 5 caras (vista oclusal) en un lienzo de 36 x 36.
const ZONAS = {
  arriba: 'M0,0 L36,0 L26,10 L10,10 Z',
  abajo: 'M0,36 L36,36 L26,26 L10,26 Z',
  izquierda: 'M0,0 L10,10 L10,26 L0,36 Z',
  derecha: 'M36,0 L26,10 L26,26 L36,36 Z',
  centro: 'M10,10 L26,10 L26,26 L10,26 Z',
};

const TRAZO = '#3a3936';
const ALTO = 110;

// Vestibular siempre hacia afuera del odontograma; mesial hacia la línea media.
function carasDelRecuadro(numero) {
  const superior = esSuperior(numero);
  const mesialDerecha = mesialALaDerecha(numero);
  return {
    arriba: superior ? 'vestibular' : 'lingual',
    abajo: superior ? 'lingual' : 'vestibular',
    izquierda: mesialDerecha ? 'distal' : 'mesial',
    derecha: mesialDerecha ? 'mesial' : 'distal',
    centro: 'oclusal',
  };
}

// Si una cara tiene varias condiciones, manda la de mayor prioridad (orden de CONDICIONES).
function colorDeCara(codigos = []) {
  if (codigos.length === 0) return '#ffffff';
  const prioritaria = CONDICIONES.find((c) => codigos.includes(c.code));
  return prioritaria?.color ?? '#9ca3af';
}

function Marcas({ codigos, forma }) {
  return codigos.map((codigo) => {
    const condicion = CONDICION_POR_CODIGO[codigo];
    if (!condicion) return null;
    const color = condicion.color;
    switch (condicion.marca) {
      case 'endodoncia':
        return forma.ejes.map(([x, y]) => (
          <line key={`${codigo}-${x}`} x1={x} y1={y} x2={x} y2={46} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        ));
      case 'corona':
        return <path key={codigo} d={forma.corona} fill="none" stroke={color} strokeWidth={3} />;
      case 'fractura':
        return <polyline key={codigo} points="11,43 22,49 15,54 29,62" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />;
      case 'cruz':
        return (
          <g key={codigo} stroke={color} strokeWidth={3} strokeLinecap="round">
            <line x1={4} y1={3} x2={36} y2={62} />
            <line x1={36} y1={3} x2={4} y2={62} />
          </g>
        );
      default:
        return null;
    }
  });
}

// Un diente del odontograma: silueta anatómica + recuadro de 5 caras.
// `onAplicar(numero, cara)` recibe la cara clicada, o 'diente' si se clicó la silueta.
export default function DienteSvg({ numero, datos, onAplicar, alcance, soloLectura = false }) {
  const forma = FORMAS[formaDiente(numero)];
  const superior = esSuperior(numero);
  const caras = carasDelRecuadro(numero);
  const delDiente = datos?.diente ?? [];
  const ausente = delDiente.includes('ausente');
  const editable = !soloLectura && onAplicar;

  const claseSilueta = editable && alcance === 'diente' ? 'cursor-pointer hover:opacity-70' : '';
  const claseCara = editable && alcance !== 'diente' ? 'cursor-pointer hover:opacity-70' : editable ? 'cursor-pointer' : '';

  const silueta = (
    <g
      transform={superior ? undefined : `translate(0,${ALTO}) scale(1,-1)`}
      onClick={editable ? () => onAplicar(numero, 'diente') : undefined}
      className={claseSilueta}
    >
      <title>{`Pieza ${numero}`}</title>
      <g opacity={ausente ? 0.3 : 1}>
        {forma.raices.map((d) => <path key={d} d={d} fill="#f2ede5" stroke={TRAZO} strokeWidth={1} />)}
        <path d={forma.corona} fill="#ffffff" stroke={TRAZO} strokeWidth={1.2} />
      </g>
      <Marcas codigos={delDiente} forma={forma} />
    </g>
  );

  const recuadro = (
    <g transform={`translate(2,${superior ? 72 : 2})`}>
      {Object.entries(ZONAS).map(([zona, d]) => {
        const cara = caras[zona];
        return (
          <path
            key={zona}
            d={d}
            fill={colorDeCara(datos?.[cara])}
            stroke={TRAZO}
            strokeWidth={1}
            className={claseCara}
            onClick={editable ? () => onAplicar(numero, cara) : undefined}
          >
            <title>{`Pieza ${numero} · ${NOMBRE_CARA[cara]}`}</title>
          </path>
        );
      })}
    </g>
  );

  return (
    <svg viewBox={`0 0 40 ${ALTO}`} className="block w-9 sm:w-10" role="img" aria-label={`Pieza ${numero}`}>
      {silueta}
      {recuadro}
    </svg>
  );
}
