import { Navigate, Outlet, useLocation } from 'react-router-dom';
import sello from '../../assets/logo-sello.png';
import { useAuth } from '../../context/auth';
import Cargando from '../ui/Cargando';

function SinPerfil({ usuario, cerrarSesion }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-crema p-4">
      <div className="tarjeta max-w-md space-y-4 p-8 text-center">
        <img src={sello} alt="Milla & Mendez" className="mx-auto h-24" />
        <h2 className="font-semibold text-2xl text-tinta-950">Cuenta sin acceso</h2>
        <p className="text-sm text-tinta-600">
          Tu cuenta ({usuario.email}) no tiene un perfil activo en el sistema.
          Pide a un administrador que te habilite.
        </p>
        <p className="rounded-lg bg-arena-claro px-3 py-2 font-mono text-xs break-all text-tinta-500">UID: {usuario.uid}</p>
        <button type="button" onClick={cerrarSesion} className="btn btn-secundario">Cerrar sesión</button>
      </div>
    </div>
  );
}

// Protege las rutas hijas: exige sesión iniciada y un perfil activo.
// Con `soloAdmin`, además exige rol de administrador.
export default function ProtectedRoute({ soloAdmin = false }) {
  const { usuario, perfil, esAdmin, cargando, cerrarSesion } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando pantallaCompleta />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (!perfil?.activo) return <SinPerfil usuario={usuario} cerrarSesion={cerrarSesion} />;
  if (soloAdmin && !esAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
