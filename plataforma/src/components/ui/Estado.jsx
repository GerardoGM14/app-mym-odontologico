import { CircleAlert } from 'lucide-react';
import { mensajeError } from '../../utils/errores';
import Cargando from './Cargando';

// Envoltorio para el resultado de useDatos: muestra carga, error o el contenido.
export default function Estado({ cargando, error, recargar, vacio, mensajeVacio = 'No se encontró la información.', children }) {
  if (error) {
    return (
      <div className="tarjeta flex flex-col items-center gap-3 py-10 text-center">
        <CircleAlert className="text-peligro-600" />
        <p className="text-sm text-tinta-700">{mensajeError(error, 'No se pudo cargar la información.')}</p>
        <button type="button" onClick={recargar} className="btn btn-secundario">Reintentar</button>
      </div>
    );
  }
  if (cargando) return <Cargando />;
  if (vacio) return <p className="vacio">{mensajeVacio}</p>;
  return children;
}
