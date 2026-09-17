import { ClipboardList, FolderOpen, History, Pencil, Plus, Smile } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import Modal from '../../components/ui/Modal';
import { ESPECIALIDADES } from '../../config/catalogos';
import { useAuth } from '../../context/auth';
import { useDatos } from '../../hooks/useDatos';
import { obtenerCliente } from '../../services/clientes';
import { actualizarDiagnostico, obtenerDiagnosticos, registrarDiagnostico } from '../../services/diagnosticos';
import { mensajeError } from '../../utils/errores';
import { formatearFechaCalendario, hoyParaInput } from '../../utils/fechas';
import { migaPacientes } from '../../utils/migas';
import { avisoError, avisoExito } from '../../utils/notificaciones';

const formVacio = () => ({ fecha: hoyParaInput(), especialidad: '', odontologo: '', diagnostico: '', observaciones: '' });

export default function Diagnosticos() {
  const { id } = useParams();
  const { esAdmin } = useAuth();
  const { datos, cargando, error, recargar } = useDatos(
    () => Promise.all([obtenerCliente(id), obtenerDiagnosticos(id)]),
    [id],
  );
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [edicion, setEdicion] = useState(null); // { id, diagnostico, observaciones }

  const [cliente, diagnosticos] = datos ?? [null, []];
  const catalogo = ESPECIALIDADES[form.especialidad];

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await registrarDiagnostico(id, form);
      avisoExito('Diagnóstico registrado', form.diagnostico);
      setForm(formVacio());
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo registrar el diagnóstico.'), err);
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async () => {
    try {
      await actualizarDiagnostico(id, edicion.id, edicion);
      setEdicion(null);
      avisoExito('Diagnóstico actualizado');
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo actualizar el diagnóstico.'), err);
    }
  };

  return (
    <div>
      <EncabezadoPagina
        titulo={cliente?.nombre ?? 'Diagnósticos'}
        subtitulo={cliente ? `DNI ${cliente.dni} · ${cliente.telefono}` : undefined}
        migas={[migaPacientes, { texto: cliente?.nombre ?? '…' }, { texto: 'Diagnósticos' }]}
      >
        <Link to={`/clientes/${id}/historial`} className="btn btn-primario"><History size={16} />Historial completo</Link>
        <Link to={`/clientes/${id}`} className="btn btn-secundario"><FolderOpen size={16} />Archivos</Link>
      </EncabezadoPagina>

      <Estado cargando={cargando && !datos} error={error} recargar={recargar} vacio={datos && !cliente} mensajeVacio="Paciente no encontrado.">
        <form onSubmit={registrar} className="tarjeta mb-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-arena pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-oro-50 text-oro-700"><Plus size={18} /></span>
            <h2 className="font-semibold text-lg text-tinta-950">Nuevo diagnóstico</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="fecha" className="etiqueta">Fecha</label>
              <input id="fecha" type="date" value={form.fecha} onChange={(e) => cambiar('fecha', e.target.value)} required className="campo" />
            </div>
            <div>
              <label htmlFor="especialidad" className="etiqueta">Especialidad</label>
              <select
                id="especialidad"
                value={form.especialidad}
                onChange={(e) => setForm({ ...form, especialidad: e.target.value, odontologo: '', diagnostico: '' })}
                className="campo"
                required
              >
                <option value="">Seleccione</option>
                {Object.keys(ESPECIALIDADES).map((esp) => <option key={esp} value={esp}>{esp}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="odontologo" className="etiqueta">Profesional</label>
              <select id="odontologo" value={form.odontologo} onChange={(e) => cambiar('odontologo', e.target.value)} className="campo" required disabled={!catalogo}>
                <option value="">Seleccione</option>
                {catalogo?.profesionales.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="diagnostico" className="etiqueta">Diagnóstico clínico</label>
              <select id="diagnostico" value={form.diagnostico} onChange={(e) => cambiar('diagnostico', e.target.value)} className="campo" required disabled={!form.odontologo}>
                <option value="">Seleccione</option>
                {catalogo?.diagnosticos.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="observaciones" className="etiqueta">Observaciones</label>
            <textarea id="observaciones" rows={2} value={form.observaciones} onChange={(e) => cambiar('observaciones', e.target.value)} className="campo" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={guardando} className="btn btn-primario">
              {guardando ? 'Guardando...' : 'Registrar diagnóstico'}
            </button>
          </div>
        </form>

        {diagnosticos.length === 0 ? (
          <p className="vacio">Aún no hay diagnósticos registrados.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Diagnóstico</th>
                  <th>Profesional</th>
                  <th>Observaciones</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticos.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap tabular-nums">{formatearFechaCalendario(d.fecha)}</td>
                    <td className="font-medium text-tinta-900">{d.diagnostico}</td>
                    <td className="whitespace-nowrap">{d.odontologo}</td>
                    <td className="max-w-xs text-tinta-500">{d.observaciones || '–'}</td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Link to={`/clientes/${id}/diagnostico/${d.id}/tratamientos`} className="btn btn-suave btn-chico"><ClipboardList size={14} />Tratamientos</Link>
                        <Link to={`/clientes/${id}/diagnostico/${d.id}/odontograma`} className="btn btn-secundario btn-chico"><Smile size={14} />Odontograma</Link>
                        {esAdmin && (
                          <button
                            type="button"
                            onClick={() => setEdicion({ id: d.id, diagnostico: d.diagnostico ?? '', observaciones: d.observaciones ?? '' })}
                            className="btn btn-secundario btn-chico"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Estado>

      <Modal abierto={Boolean(edicion)} onCerrar={() => setEdicion(null)} titulo="Editar diagnóstico">
        <div>
          <label htmlFor="edicion-diagnostico" className="etiqueta">Diagnóstico</label>
          <input
            id="edicion-diagnostico"
            type="text"
            className="campo"
            value={edicion?.diagnostico ?? ''}
            onChange={(e) => setEdicion({ ...edicion, diagnostico: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="edicion-observaciones" className="etiqueta">Observaciones</label>
          <textarea
            id="edicion-observaciones"
            rows={3}
            className="campo"
            value={edicion?.observaciones ?? ''}
            onChange={(e) => setEdicion({ ...edicion, observaciones: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secundario" onClick={() => setEdicion(null)}>Cancelar</button>
          <button type="button" className="btn btn-primario" onClick={guardarEdicion} disabled={!edicion?.diagnostico.trim()}>Guardar</button>
        </div>
      </Modal>
    </div>
  );
}
