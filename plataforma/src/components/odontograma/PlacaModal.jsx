import { CARAS, NOMBRE_CARA } from '../../config/odontograma';
import { denticionDe, detalleASeleccion, formatearCara } from '../../utils/odontograma';
import Modal from '../ui/Modal';
import Odontograma from './Odontograma';

const COLUMNAS = [...CARAS, 'diente'];

export default function PlacaModal({ datos, onCerrar }) {
  const dientes = datos?.dientes ?? [];

  return (
    <Modal abierto={Boolean(datos)} onCerrar={onCerrar} titulo={`Placa · ${datos?.tratamiento ?? ''}`} ancho="max-w-6xl">
      <Odontograma
        valor={detalleASeleccion(dientes)}
        denticion={denticionDe(dientes.map((d) => d.numero))}
        soloLectura
      />

      <div className="tabla-contenedor shadow-none">
        <table className="tabla text-center">
          <thead>
            <tr>
              <th>Pieza</th>
              {COLUMNAS.map((cara) => <th key={cara}>{NOMBRE_CARA[cara]}</th>)}
            </tr>
          </thead>
          <tbody>
            {dientes.map((diente) => (
              <tr key={diente.numero}>
                <td className="font-semibold text-tinta-900 tabular-nums">{diente.numero}</td>
                {COLUMNAS.map((cara) => <td key={cara}>{formatearCara(diente[cara])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right">
        <button type="button" onClick={onCerrar} className="btn btn-secundario">Cerrar</button>
      </div>
    </Modal>
  );
}
