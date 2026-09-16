import { FolderOpen, Pencil, Search, Stethoscope, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import { useAuth } from '../../context/auth';
import { useDatos } from '../../hooks/useDatos';
import { actualizarCliente, eliminarCliente, obtenerClientes, registrarCliente } from '../../services/clientes';
import { mensajeError } from '../../utils/errores';
import { avisoError, avisoExito, confirmar } from '../../utils/notificaciones';
import { validarCliente } from '../../utils/validaciones';

const FORM_VACIO = { nombre: '', dni: '', correo: '', telefono: '' };

const soloDigitos = (valor, maximo) => valor.replace(/\D/g, '').slice(0, maximo);

const iniciales = (nombre = '') =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export default function Clientes() {
  const { esAdmin } = useAuth();
  const { datos: clientes, cargando, error, recargar } = useDatos(obtenerClientes, []);
  const [form, setForm] = useState(FORM_VACIO);
  const [idEditar, setIdEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const cancelarEdicion = () => {
    setIdEditar(null);
    setForm(FORM_VACIO);
  };

  const guardar = async (e) => {
    e.preventDefault();
    const errorValidacion = validarCliente(form);
    if (errorValidacion) {
      avisoError(errorValidacion);
      return;
    }
    setGuardando(true);
    try {
      if (idEditar) await actualizarCliente(idEditar, form);
      else await registrarCliente(form);
      avisoExito(idEditar ? 'Paciente actualizado' : 'Paciente registrado', form.nombre);
      cancelarEdicion();
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo guardar el paciente.'), err);
    } finally {
      setGuardando(false);
    }
  };

  const editar = (cliente) => {
    setIdEditar(cliente.id);
    setForm({
      nombre: cliente.nombre ?? '',
      dni: cliente.dni ?? '',
      correo: cliente.correo ?? '',
      telefono: cliente.telefono ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (cliente) => {
    const ok = await confirmar(
      `¿Eliminar a ${cliente.nombre}?`,
      'Se borrarán también sus diagnósticos, tratamientos, pagos y archivos. Esta acción no se puede deshacer.',
    );
    if (!ok) return;
    try {
      await eliminarCliente(cliente.id);
      avisoExito('Paciente eliminado', cliente.nombre);
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo eliminar el paciente.'), err);
    }
  };

  const termino = busqueda.trim().toLowerCase();
  const filtrados = (clientes ?? []).filter((c) =>
    !termino || c.nombre?.toLowerCase().includes(termino) || c.dni?.includes(termino));

  return (
    <div>
      <EncabezadoPagina
        titulo="Pacientes"
        subtitulo={clientes ? `${clientes.length} pacientes registrados` : 'Registro y gestión de pacientes'}
        migas={[{ texto: 'Pacientes' }]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[340px_1fr]">
        <form onSubmit={guardar} className="tarjeta space-y-4 xl:sticky xl:top-24">
          <div className="flex items-center gap-3 border-b border-arena pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-oro-50 text-oro-700">
              {idEditar ? <Pencil size={16} /> : <UserPlus size={16} />}
            </span>
            <h2 className="font-semibold text-lg text-tinta-950">{idEditar ? 'Editar paciente' : 'Nuevo paciente'}</h2>
          </div>

          <div>
            <label htmlFor="nombre" className="etiqueta">Nombre completo</label>
            <input id="nombre" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} className="campo" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dni" className="etiqueta">DNI</label>
              <input id="dni" placeholder="8 dígitos" inputMode="numeric" value={form.dni} onChange={(e) => cambiar('dni', soloDigitos(e.target.value, 8))} className="campo" required />
            </div>
            <div>
              <label htmlFor="telefono" className="etiqueta">Teléfono</label>
              <input id="telefono" placeholder="9 dígitos" inputMode="numeric" value={form.telefono} onChange={(e) => cambiar('telefono', soloDigitos(e.target.value, 9))} className="campo" required />
            </div>
          </div>
          <div>
            <label htmlFor="correo" className="etiqueta">Correo <span className="font-normal normal-case">(opcional)</span></label>
            <input id="correo" type="email" value={form.correo} onChange={(e) => cambiar('correo', e.target.value)} className="campo" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={guardando} className="btn btn-primario flex-1">
              {guardando ? 'Guardando...' : idEditar ? 'Guardar cambios' : 'Registrar paciente'}
            </button>
            {idEditar && <button type="button" onClick={cancelarEdicion} className="btn btn-secundario">Cancelar</button>}
          </div>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-400" />
            <input
              type="search"
              placeholder="Buscar por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="campo pl-10"
            />
          </div>

          <Estado cargando={cargando && !clientes} error={error} recargar={recargar} vacio={filtrados.length === 0} mensajeVacio="No hay pacientes para mostrar.">
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>DNI</th>
                    <th>Teléfono</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-oro-50 text-xs font-bold text-oro-700 ring-1 ring-oro-200">
                            {iniciales(c.nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-tinta-900">{c.nombre}</p>
                            <p className="truncate text-xs text-tinta-500">{c.correo || 'Sin correo'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="tabular-nums">{c.dni}</td>
                      <td className="tabular-nums">{c.telefono}</td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <Link to={`/clientes/${c.id}/diagnostico`} className="btn btn-suave btn-chico"><Stethoscope size={14} />Diagnósticos</Link>
                          <Link to={`/clientes/${c.id}`} className="btn btn-secundario btn-chico"><FolderOpen size={14} />Archivos</Link>
                          <button type="button" onClick={() => editar(c)} className="btn btn-secundario btn-chico" title="Editar"><Pencil size={14} /></button>
                          {esAdmin && (
                            <button type="button" onClick={() => eliminar(c)} className="btn btn-suave-peligro btn-chico" title="Eliminar"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Estado>
        </div>
      </div>
    </div>
  );
}
