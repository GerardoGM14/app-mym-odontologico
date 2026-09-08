import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import { ROLES } from '../../config/catalogos';
import { useAuth } from '../../context/auth';
import { useDatos } from '../../hooks/useDatos';
import { actualizarUsuario, crearUsuario, obtenerUsuarios } from '../../services/usuarios';
import { mensajeError } from '../../utils/errores';
import { avisoError, avisoExito } from '../../utils/notificaciones';
import { validarUsuario } from '../../utils/validaciones';

const FORM_VACIO = { nombre: '', email: '', password: '', rol: 'asistente' };

const iniciales = (nombre = '') =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

// Solo administradores. Reemplaza al antiguo registro público protegido con PIN.
export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const { datos: usuarios, cargando, error, recargar } = useDatos(obtenerUsuarios, []);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const crear = async (e) => {
    e.preventDefault();
    const errorValidacion = validarUsuario(form);
    if (errorValidacion) {
      avisoError(errorValidacion);
      return;
    }
    setGuardando(true);
    try {
      await crearUsuario(form);
      avisoExito('Usuario creado', form.email);
      setForm(FORM_VACIO);
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo crear el usuario.'), err);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarUsuario = async (uid, cambios) => {
    try {
      await actualizarUsuario(uid, cambios);
      avisoExito('Usuario actualizado');
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo actualizar el usuario.'), err);
    }
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Usuarios del sistema"
        subtitulo="Solo los usuarios activos pueden acceder a los datos de la clínica."
        migas={[{ texto: 'Administración' }, { texto: 'Usuarios' }]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[340px_1fr]">
        <form onSubmit={crear} className="tarjeta space-y-4">
          <div className="flex items-center gap-3 border-b border-arena pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-oro-50 text-oro-700"><UserPlus size={16} /></span>
            <h2 className="font-semibold text-lg text-tinta-950">Nuevo usuario</h2>
          </div>
          <div>
            <label htmlFor="u-nombre" className="etiqueta">Nombre</label>
            <input id="u-nombre" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} className="campo" required />
          </div>
          <div>
            <label htmlFor="u-email" className="etiqueta">Correo</label>
            <input id="u-email" type="email" value={form.email} onChange={(e) => cambiar('email', e.target.value)} className="campo" required autoComplete="off" />
          </div>
          <div>
            <label htmlFor="u-password" className="etiqueta">Contraseña inicial</label>
            <input id="u-password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => cambiar('password', e.target.value)} className="campo" required autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="u-rol" className="etiqueta">Rol</label>
            <select id="u-rol" value={form.rol} onChange={(e) => cambiar('rol', e.target.value)} className="campo">
              {Object.entries(ROLES).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
            </select>
          </div>
          <button type="submit" disabled={guardando} className="btn btn-primario w-full">
            {guardando ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>

        <Estado cargando={cargando && !usuarios} error={error} recargar={recargar}>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acceso</th>
                </tr>
              </thead>
              <tbody>
                {usuarios?.map((u) => {
                  const soyYo = u.id === yo?.uid;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tinta-900 text-xs font-bold text-oro-400">
                            {iniciales(u.nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-tinta-900">
                              {u.nombre}{soyYo && <span className="ml-1.5 text-xs font-normal text-tinta-400">(tú)</span>}
                            </p>
                            <p className="truncate text-xs text-tinta-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={u.rol}
                          disabled={soyYo}
                          onChange={(e) => cambiarUsuario(u.id, { rol: e.target.value })}
                          className="campo h-8 w-auto py-0"
                          aria-label={`Rol de ${u.nombre}`}
                        >
                          {Object.entries(ROLES).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={u.activo}
                          disabled={soyYo}
                          onClick={() => cambiarUsuario(u.id, { activo: !u.activo })}
                          className="flex items-center gap-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className={`relative h-5 w-9 rounded-full transition-colors ${u.activo ? 'bg-oro-500' : 'bg-tinta-200'}`}>
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] ${u.activo ? 'left-[18px]' : 'left-0.5'}`} />
                          </span>
                          <span className={u.activo ? 'text-tinta-900' : 'text-tinta-500'}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Estado>
      </div>
    </div>
  );
}
