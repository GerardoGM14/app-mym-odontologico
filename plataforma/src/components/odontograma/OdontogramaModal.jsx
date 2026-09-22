import { useState } from 'react';
import { DENTICIONES } from '../../config/odontograma';
import { limpiarSeleccion } from '../../utils/odontograma';
import Modal from '../ui/Modal';
import Odontograma from './Odontograma';

export default function OdontogramaModal({ abierto, onCerrar, onSeleccionar }) {
  const [seleccion, setSeleccion] = useState({});
  const [denticion, setDenticion] = useState('adulto');

  const usarSeleccion = () => {
    onSeleccionar(limpiarSeleccion(seleccion));
    onCerrar();
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Odontograma" ancho="max-w-6xl">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="denticion-modal" className="etiqueta mb-0">Dentición</label>
        <select id="denticion-modal" value={denticion} onChange={(e) => setDenticion(e.target.value)} className="campo w-auto">
          {Object.entries(DENTICIONES).map(([valor, { nombre }]) => <option key={valor} value={valor}>{nombre}</option>)}
        </select>
        <button type="button" onClick={() => setSeleccion({})} className="btn btn-suave-peligro btn-chico ml-auto">
          Limpiar todo
        </button>
      </div>

      <Odontograma valor={seleccion} onCambiar={setSeleccion} denticion={denticion} />

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCerrar} className="btn btn-secundario">Cancelar</button>
        <button type="button" onClick={usarSeleccion} className="btn btn-primario">Usar selección</button>
      </div>
    </Modal>
  );
}
