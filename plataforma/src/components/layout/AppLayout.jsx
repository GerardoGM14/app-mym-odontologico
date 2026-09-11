import { CalendarDays, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { MigasContext } from '../../context/migas';
import Cargando from '../ui/Cargando';
import Migas from './Migas';
import Sidebar from './Sidebar';

const CLAVE_COLAPSADO = 'mm.sidebar.colapsado';

function leerColapsado() {
  try {
    return localStorage.getItem(CLAVE_COLAPSADO) === '1';
  } catch {
    return false;
  }
}

function hoy() {
  const texto = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function AppLayout() {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [colapsado, setColapsado] = useState(leerColapsado);
  const [abiertoMovil, setAbiertoMovil] = useState(false);
  const [migas, setMigas] = useState([]);

  // Al navegar en el celular, el menú se cierra solo.
  useEffect(() => setAbiertoMovil(false), [pathname]);

  const alternarColapsado = () => {
    setColapsado((actual) => {
      try {
        localStorage.setItem(CLAVE_COLAPSADO, actual ? '0' : '1');
      } catch {
        // Sin almacenamiento disponible: solo dura esta sesión.
      }
      return !actual;
    });
  };

  const salir = async () => {
    await cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <MigasContext.Provider value={setMigas}>
      <div className="min-h-screen bg-crema">
        <Sidebar
          colapsado={colapsado}
          abiertoMovil={abiertoMovil}
          onCerrarMovil={() => setAbiertoMovil(false)}
          onCerrarSesion={salir}
        />

        <div className={`transition-[padding] duration-300 ease-out ${colapsado ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-arena bg-white px-4 md:px-8">
            <button type="button" onClick={() => setAbiertoMovil(true)} className="btn btn-fantasma btn-icono lg:hidden" aria-label="Abrir menú">
              <Menu size={20} />
            </button>
            <button
              type="button"
              onClick={alternarColapsado}
              className="btn btn-fantasma btn-icono hidden lg:inline-flex"
              aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
              title={colapsado ? 'Expandir menú' : 'Contraer menú'}
            >
              {colapsado ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <div className="h-6 w-px bg-arena" />
            <Migas migas={migas} />
            <p className="ml-auto hidden items-center gap-2 text-xs font-medium text-tinta-500 md:flex">
              <CalendarDays size={15} className="text-oro-600" />
              {hoy()}
            </p>
          </header>

          <main className="mx-auto max-w-7xl p-4 md:p-8">
            <Suspense fallback={<Cargando />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </MigasContext.Provider>
  );
}
