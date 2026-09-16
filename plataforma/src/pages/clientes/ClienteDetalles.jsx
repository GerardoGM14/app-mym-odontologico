import { ExternalLink, FileText, Stethoscope, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import { TAMANO_MAXIMO_ARCHIVO_MB } from '../../config/catalogos';
import { useAuth } from '../../context/auth';
import { useDatos } from '../../hooks/useDatos';
import { eliminarArchivo, obtenerArchivos, subirArchivo } from '../../services/archivos';
import { obtenerCliente } from '../../services/clientes';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/fechas';
import { migaCliente, migaPacientes } from '../../utils/migas';
import { avisoError, avisoExito, confirmar } from '../../utils/notificaciones';

// Archivos clínicos del paciente. Subir y eliminar es exclusivo de administradores.
export default function ClienteDetalles() {
  const { id } = useParams();
  const { esAdmin } = useAuth();
  const { datos, cargando, error, recargar } = useDatos(
    () => Promise.all([obtenerCliente(id), obtenerArchivos(id)]),
    [id],
  );
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const inputArchivo = useRef(null);

  const [cliente, archivos] = datos ?? [null, []];

  const elegirArchivo = (e) => {
    const elegido = e.target.files[0] ?? null;
    if (elegido && elegido.size > TAMANO_MAXIMO_ARCHIVO_MB * 1024 * 1024) {
      avisoError(`El archivo supera los ${TAMANO_MAXIMO_ARCHIVO_MB} MB.`);
      e.target.value = '';
      return;
    }
    setArchivo(elegido);
  };

  const subir = async () => {
    setSubiendo(true);
    try {
      await subirArchivo(id, archivo);
      avisoExito('Archivo subido correctamente', archivo.name);
      setArchivo(null);
      inputArchivo.current.value = '';
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'Error al subir el archivo.'), err);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminar = async (registro) => {
    if (!(await confirmar(`¿Eliminar "${registro.nombre}"?`, 'El archivo se borrará definitivamente.'))) return;
    try {
      await eliminarArchivo(id, registro);
      avisoExito('Archivo eliminado');
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo eliminar el archivo.'), err);
    }
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Archivos clínicos"
        subtitulo={cliente ? `${cliente.nombre} · DNI ${cliente.dni}` : undefined}
        migas={[migaPacientes, migaCliente(id, cliente), { texto: 'Archivos' }]}
      >
        <Link to={`/clientes/${id}/diagnostico`} className="btn btn-secundario"><Stethoscope size={16} />Diagnósticos</Link>
      </EncabezadoPagina>

      <Estado cargando={cargando && !datos} error={error} recargar={recargar} vacio={datos && !cliente} mensajeVacio="Paciente no encontrado.">
        {esAdmin && (
          <div className="tarjeta mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-oro-50 text-oro-700"><Upload size={18} /></span>
            <input
              ref={inputArchivo}
              type="file"
              onChange={elegirArchivo}
              className="min-w-0 flex-1 text-sm text-tinta-600 file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border file:border-arena file:bg-arena-claro file:px-3 file:text-sm file:font-medium file:text-tinta-800 hover:file:bg-arena"
            />
            <button type="button" onClick={subir} disabled={!archivo || subiendo} className="btn btn-oro">
              <Upload size={16} />{subiendo ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>
        )}

        {archivos.length > 0 ? (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {archivos.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="flex items-center gap-2.5 font-medium text-tinta-900">
                        <FileText size={16} className="shrink-0 text-oro-600" />{a.nombre}
                      </span>
                    </td>
                    <td className="tabular-nums">{formatearFecha(a.fecha)}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-suave btn-chico"><ExternalLink size={14} />Ver</a>
                        {esAdmin && (
                          <button type="button" onClick={() => eliminar(a)} className="btn btn-suave-peligro btn-chico" title="Eliminar"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="vacio">No hay archivos subidos aún.</p>
        )}
      </Estado>
    </div>
  );
}
