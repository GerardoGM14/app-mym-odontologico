import { ChartColumn, LayoutDashboard, LogOut, ShieldCheck, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROLES } from '../../config/catalogos';
import { useAuth } from '../../context/auth';
import Marca from './Marca';

const SECCIONES = [
  {
    titulo: 'Principal',
    enlaces: [
      { a: '/dashboard', texto: 'Inicio', Icono: LayoutDashboard },
      { a: '/clientes', texto: 'Pacientes', Icono: Users },
      { a: '/estadisticas', texto: 'Estadísticas', Icono: ChartColumn },
    ],
  },
  {
    titulo: 'Administración',
    soloAdmin: true,
    enlaces: [{ a: '/usuarios', texto: 'Usuarios', Icono: ShieldCheck }],
  },
];

const iniciales = (nombre = '') =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

// Texto flotante que aparece al pasar el mouse cuando el sidebar está colapsado.
function Globo({ texto }) {
  return (
    <span className="pointer-events-none absolute left-full z-50 ml-3 rounded-md bg-tinta-800 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {texto}
    </span>
  );
}

function Enlace({ a, texto, Icono, colapsado }) {
  return (
    <NavLink
      to={a}
      className={({ isActive }) => [
        'group relative flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors',
        colapsado ? 'justify-center' : 'px-3',
        isActive ? 'bg-white/[0.07] text-oro-400' : 'text-tinta-300 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-oro-400" />}
          <Icono size={19} strokeWidth={1.8} className="shrink-0" />
          {colapsado ? <Globo texto={texto} /> : <span className="truncate">{texto}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ colapsado, abiertoMovil, onCerrarMovil, onCerrarSesion }) {
  const { usuario, perfil, esAdmin } = useAuth();
  const nombre = perfil?.nombre || usuario?.email || '';
  // En móvil el cajón siempre se muestra completo.
  const compacto = colapsado && !abiertoMovil;

  return (
    <>
      {abiertoMovil && (
        <div className="fixed inset-0 z-40 bg-tinta-950/60 lg:hidden" onClick={onCerrarMovil} aria-hidden="true" />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-tinta-950 transition-[width,transform] duration-300 ease-out',
          abiertoMovil ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0',
          compacto ? 'lg:w-[76px]' : 'lg:w-64',
        ].join(' ')}
        aria-label="Menú principal"
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-white/10 ${compacto ? 'justify-center' : 'justify-between px-5'}`}>
          <Marca compacta={compacto} />
          <button type="button" onClick={onCerrarMovil} className="rounded-md p-1.5 text-tinta-300 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <nav className={`flex-1 space-y-6 px-3 py-6 ${compacto ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {SECCIONES.filter((s) => !s.soloAdmin || esAdmin).map((seccion) => (
            <div key={seccion.titulo} className="space-y-1">
              {compacto ? (
                <div className="mx-auto mb-3 h-px w-8 bg-white/10" />
              ) : (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.2em] text-tinta-500 uppercase">{seccion.titulo}</p>
              )}
              {seccion.enlaces.map((enlace) => <Enlace key={enlace.a} {...enlace} colapsado={compacto} />)}
            </div>
          ))}
        </nav>

        <div className={`shrink-0 border-t border-white/10 p-3 ${compacto ? 'space-y-2' : ''}`}>
          <div className={`flex items-center gap-3 rounded-lg ${compacto ? 'flex-col' : 'p-2'}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-oro-500 text-xs font-bold text-tinta-950" title={nombre}>
              {iniciales(nombre)}
            </span>
            {!compacto && (
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-white">{nombre}</p>
                <p className="truncate text-xs text-oro-400">{ROLES[perfil?.rol] ?? perfil?.rol}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onCerrarSesion}
              className="group relative rounded-md p-2 text-tinta-300 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
              title={compacto ? undefined : 'Cerrar sesión'}
            >
              <LogOut size={18} />
              {compacto && <Globo texto="Cerrar sesión" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
