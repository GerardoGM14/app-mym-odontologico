import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Navigate, useLocation } from 'react-router-dom';
import dienteClaro from '../assets/diente-claro.png';
import fondo from '../assets/login-fondo.jpg';
import sello from '../assets/logo-sello.png';
import Cargando from '../components/ui/Cargando';
import { useAuth } from '../context/auth';
import { auth } from '../lib/firebase';
import { mensajeError } from '../utils/errores';

function PanelMarca() {
  return (
    <aside className="relative hidden overflow-hidden bg-tinta-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      {/* Foto de fondo en blanco y negro con un velo negro para mantener la paleta de la marca.
          Foto de Unsplash (licencia libre, sin atribución obligatoria). */}
      <img src={fondo} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[60%_center] grayscale" />
      <div className="pointer-events-none absolute inset-0 bg-tinta-950/75" />

      {/* Círculos decorativos que evocan el sello de la clínica. */}
      <div className="pointer-events-none absolute -right-48 -bottom-48 h-[560px] w-[560px] rounded-full border border-oro-500/25" />
      <div className="pointer-events-none absolute -right-36 -bottom-36 h-[460px] w-[460px] rounded-full border border-oro-500/10" />

      <div className="relative flex items-center gap-4">
        <img src={dienteClaro} alt="" className="h-14 w-14 object-contain" />
        <div>
          <p className="font-serif text-2xl">Milla <span className="text-oro-400">&amp;</span> Mendez</p>
          <p className="mt-1 text-sm font-semibold text-oro-400">Odontología integral</p>
        </div>
      </div>

      <div className="relative max-w-md space-y-8">
        <h1 className="text-5xl leading-tight font-normal tracking-tight">
          Cuidamos <span className="text-oro-400">sonrisas</span>, hoy, mañana y siempre.
        </h1>
        <p className="text-sm leading-relaxed text-tinta-200">
          Plataforma clínica para gestionar pacientes, diagnósticos, tratamientos y pagos en un solo lugar.
        </p>
      </div>

      <div className="relative flex items-center justify-between text-xs text-tinta-300">
        <span className="flex items-center gap-2"><MapPin size={14} className="text-oro-400" />Chimbote · Nuevo Chimbote</span>
        <span>© {new Date().getFullYear()} M&amp;M Odontología Integral</span>
      </div>
    </aside>
  );
}

export default function Login() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (cargando) return <Cargando pantallaCompleta />;
  // Al iniciar sesión, AuthProvider actualiza `usuario` y esta redirección hace el resto.
  if (usuario) return <Navigate to={location.state?.desde ?? '/dashboard'} replace />;

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesión.'));
      setEnviando(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-crema lg:grid-cols-[1.1fr_1fr]">
      <PanelMarca />

      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-in">
          <img src={sello} alt="Milla & Mendez Odontología Integral" className="mx-auto mb-8 h-32 w-auto" />

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-tinta-950">Bienvenido</h2>
            <p className="mt-2 text-sm text-tinta-500">Ingresa con tu cuenta para continuar</p>
          </div>

          <form onSubmit={iniciarSesion} className="space-y-5">
            <div>
              <label htmlFor="email" className="etiqueta">Correo electrónico</label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-400" />
                <input
                  id="email"
                  type="email"
                  className="campo h-11 pl-10"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="etiqueta">Contraseña</label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-400" />
                <input
                  id="password"
                  type={verPassword ? 'text' : 'password'}
                  className="campo h-11 pr-11 pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-tinta-400 hover:text-tinta-800"
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="flex items-center gap-2 rounded-lg border border-peligro-100 bg-peligro-50 px-3 py-2.5 text-sm text-peligro-700">
                <CircleAlert size={16} className="shrink-0" />
                {error}
              </p>
            )}

            <button type="submit" disabled={enviando} className="btn btn-primario h-11 w-full">
              {enviando ? <LoaderCircle size={18} className="animate-spin" /> : <>Iniciar sesión <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-tinta-500">
            ¿No tienes cuenta? Pídele a un administrador que te registre.
          </p>
        </div>
      </main>
    </div>
  );
}
