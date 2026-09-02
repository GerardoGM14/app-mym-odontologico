import { useState } from 'react';
import DienteInteractivo from './DienteInteractivo';
import { dientesAdultos, dientesNinos } from '../utils/dientes';

const condiciones = [
  { code: 'caries', color: 'red', nombre: 'Caries' },
  { code: 'obturacion', color: 'blue', nombre: 'Obturación' },
  { code: 'endodoncia', color: 'green', nombre: 'Endodoncia' },
  { code: 'exodoncia', color: 'black', nombre: 'Exodoncia', icon: '✕' },
  { code: 'fractura', color: 'yellow', nombre: 'Fractura', icon: '/' },
  { code: 'corona', color: 'purple', nombre: 'Corona', icon: '⬒' },
  { code: 'curacion', color: 'gray', nombre: 'Curación', icon: '⚪' }
];

export default function OdontogramaModal({ visible, onClose, onSeleccionar }) {
  const [seleccion, setSeleccion] = useState({});
  const [condicionSeleccionada, setCondicionSeleccionada] = useState('caries');
  const [tipo, setTipo] = useState('adulto');

  const dientes = tipo === 'adulto' ? dientesAdultos : dientesNinos;

  const handleGuardar = () => {
    const datosFiltrados = Object.entries(seleccion)
      .filter(([_, caras]) =>
        Object.values(caras).some((c) => Array.isArray(c) ? c.length > 0 : c)
      )
      .reduce((obj, [diente, caras]) => ({ ...obj, [diente]: caras }), {});
    onSeleccionar(datosFiltrados);
    onClose();
  };

  const handleLimpiar = () => setSeleccion({});

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-xl max-w-7xl w-full space-y-4 overflow-y-auto max-h-[95vh]">
        <h3 className="text-xl font-bold text-blue-800">Odontograma interactivo</h3>

        {/* Elegir tipo de odontograma */}
        <div className="flex gap-4 items-center">
          <label className="font-medium">Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="adulto">Adulto (32 dientes)</option>
            <option value="niño">Niño (20 dientes)</option>
          </select>
        </div>

        {/* Panel de condiciones */}
        <div className="flex flex-wrap gap-3 mb-4">
          {condiciones.map((cond) => (
            <button
              key={cond.code}
              onClick={() => setCondicionSeleccionada(cond.code)}
              className={`px-3 py-1 rounded border flex items-center gap-2 ${
                condicionSeleccionada === cond.code ? 'bg-gray-200' : 'bg-white'
              }`}
            >
              {cond.icon ? (
                <span className="text-lg">{cond.icon}</span>
              ) : (
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cond.color }}
                ></span>
              )}
              {cond.nombre}
            </button>
          ))}
          <button
            onClick={handleLimpiar}
            className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-auto"
          >
            Limpiar odontograma
          </button>
        </div>

        {/* Dientes superiores e inferiores separados */}
        <div className="flex flex-col gap-6 bg-gray-100 p-4 rounded shadow">
          <div className="flex flex-wrap gap-2 justify-center">
            {dientes.slice(0, dientes.length / 2).map((numero) => (
              <DienteInteractivo
                key={numero}
                numero={numero}
                seleccion={seleccion}
                setSeleccion={setSeleccion}
                condicionSeleccionada={condicionSeleccionada}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {dientes.slice(dientes.length / 2).map((numero) => (
              <DienteInteractivo
                key={numero}
                numero={numero}
                seleccion={seleccion}
                setSeleccion={setSeleccion}
                condicionSeleccionada={condicionSeleccionada}
              />
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Usar selección
          </button>
        </div>
      </div>
    </div>
  );
}

