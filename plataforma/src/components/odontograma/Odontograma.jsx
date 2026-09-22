import { Circle, Eraser, Minus, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { CONDICION_POR_CODIGO, CONDICIONES, DENTICIONES } from '../../config/odontograma';
import { alternarCondicion, dienteMarcado, quitarDiente } from '../../utils/odontograma';
import DienteSvg from './DienteSvg';

const BORRAR = 'borrar';

function Herramienta({ activa, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${activa ? 'border-tinta-900 bg-tinta-900 text-white' : 'border-arena bg-white text-tinta-700 hover:border-oro-300'}`}
    >
      {children}
    </button>
  );
}

function Muestra({ condicion }) {
  if (condicion.alcance === 'cara') {
    return <span className="h-3.5 w-3.5 rounded-sm ring-1 ring-tinta-300" style={{ backgroundColor: condicion.color }} />;
  }
  const Icono = { cruz: X, corona: Circle, endodoncia: Minus, fractura: Zap }[condicion.marca];
  return <Icono size={15} strokeWidth={2.5} color={condicion.color} className={condicion.marca === 'endodoncia' ? 'rotate-90' : ''} />;
}

function Arcada({ dientes, superior, valor, onAplicar, alcance, soloLectura }) {
  const mitad = dientes.length / 2;
  const columna = (numero) => {
    const marcado = dienteMarcado(valor[numero]);
    const etiqueta = (
      <span className={`text-[11px] tabular-nums ${marcado ? 'font-bold text-oro-700' : 'text-tinta-500'}`}>{numero}</span>
    );
    return (
      <div key={numero} className="flex flex-col items-center gap-1">
        {superior && etiqueta}
        <DienteSvg numero={numero} datos={valor[numero]} onAplicar={onAplicar} alcance={alcance} soloLectura={soloLectura} />
        {!superior && etiqueta}
      </div>
    );
  };

  return (
    <div className="flex items-stretch justify-center gap-1">
      <div className="flex gap-1">{dientes.slice(0, mitad).map(columna)}</div>
      <div className="mx-1.5 w-px bg-tinta-300" aria-hidden="true" />
      <div className="flex gap-1">{dientes.slice(mitad).map(columna)}</div>
    </div>
  );
}

// Odontograma anatómico. `valor` = { [diente]: { [cara | 'diente']: [codigos] } }.
export default function Odontograma({ valor, onCambiar, denticion = 'adulto', soloLectura = false }) {
  const [herramienta, setHerramienta] = useState('caries');
  const { superior, inferior } = DENTICIONES[denticion];
  const alcance = herramienta === BORRAR ? 'diente' : CONDICION_POR_CODIGO[herramienta].alcance;

  const aplicar = (numero, cara) => {
    if (herramienta === BORRAR) {
      onCambiar(quitarDiente(valor, numero));
      return;
    }
    if (alcance === 'diente') {
      onCambiar(alternarCondicion(valor, numero, 'diente', herramienta));
      return;
    }
    // Herramienta de cara sobre la silueta: no aplica.
    if (cara === 'diente') return;
    onCambiar(alternarCondicion(valor, numero, cara, herramienta));
  };

  const porCara = CONDICIONES.filter((c) => c.alcance === 'cara');
  const porDiente = CONDICIONES.filter((c) => c.alcance === 'diente');

  return (
    <div className="space-y-5">
      {!soloLectura && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-xs font-semibold text-tinta-500">Por cara</span>
            {porCara.map((c) => (
              <Herramienta key={c.code} activa={herramienta === c.code} onClick={() => setHerramienta(c.code)}>
                <Muestra condicion={c} />{c.nombre}
              </Herramienta>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-xs font-semibold text-tinta-500">Pieza completa</span>
            {porDiente.map((c) => (
              <Herramienta key={c.code} activa={herramienta === c.code} onClick={() => setHerramienta(c.code)}>
                <Muestra condicion={c} />{c.nombre}
              </Herramienta>
            ))}
            <Herramienta activa={herramienta === BORRAR} onClick={() => setHerramienta(BORRAR)}>
              <Eraser size={15} />Borrar pieza
            </Herramienta>
          </div>
          <p className="text-xs text-tinta-500">
            {herramienta === BORRAR
              ? 'Haz clic en una pieza para quitarle todas sus marcas.'
              : alcance === 'cara'
                ? 'Haz clic en una cara del recuadro para marcarla o desmarcarla.'
                : 'Haz clic en la pieza (dibujo o recuadro) para marcarla o desmarcarla.'}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-arena bg-white p-4">
        <div className="mx-auto w-max space-y-3">
          <p className="text-center text-[11px] font-semibold text-tinta-500">Maxilar superior</p>
          <Arcada dientes={superior} superior valor={valor} onAplicar={aplicar} alcance={alcance} soloLectura={soloLectura} />
          <div className="h-px bg-tinta-300" aria-hidden="true" />
          <Arcada dientes={inferior} valor={valor} onAplicar={aplicar} alcance={alcance} soloLectura={soloLectura} />
          <p className="text-center text-[11px] font-semibold text-tinta-500">Maxilar inferior</p>
        </div>
      </div>
    </div>
  );
}
