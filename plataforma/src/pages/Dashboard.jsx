import { ArrowRight, BookOpen, ChartColumn, Settings, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import dienteClaro from '../assets/diente-claro.png';
import { useAuth } from '../context/auth';
import { useMigas } from '../context/migas';

const MODULOS = [
  { nombre: 'Pacientes', descripcion: 'Registro, archivos clínicos, diagnósticos y tratamientos.', Icono: Users, ruta: '/clientes' },
  { nombre: 'Estadísticas', descripcion: 'Gráficos de tratamientos, estados de pago e ingresos.', Icono: ChartColumn, ruta: '/estadisticas' },
  { nombre: 'Usuarios', descripcion: 'Altas, roles y accesos del personal.', Icono: ShieldCheck, ruta: '/usuarios', soloAdmin: true },
  { nombre: 'Capacitación', descripcion: 'Material de formación para el equipo.', Icono: BookOpen },
  { nombre: 'Configuración', descripcion: 'Opciones generales del sistema.', Icono: Settings },
];

function saludo(hora = new Date().getHours()) {
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function TarjetaModulo({ nombre, descripcion, Icono, ruta }) {
  const contenido = (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-full border border-oro-300 text-oro-600 transition-colors group-hover:border-oro-500 group-hover:bg-oro-500 group-hover:text-tinta-950">
        <Icono size={22} strokeWidth={1.6} />
      </span>
      <div className="mt-5 flex-1">
        <h3 className="font-semibold text-xl text-tinta-950">{nombre}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-tinta-500">{descripcion}</p>
      </div>
      {ruta ? (
        <span className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-oro-700 uppercase">
          Abrir <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      ) : (
        <span className="mt-6 w-fit rounded-full bg-arena-claro px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] text-tinta-500 uppercase">
          Próximamente
        </span>
      )}
    </>
  );

  const clases = 'group flex flex-col rounded-xl border border-arena bg-white p-6 shadow-sm transition-all';
  return ruta ? (
    <Link to={ruta} className={`${clases} hover:-translate-y-0.5 hover:border-oro-300 hover:shadow-md`}>{contenido}</Link>
  ) : (
    <div className={`${clases} opacity-70`}>{contenido}</div>
  );
}

export default function Dashboard() {
  const { perfil, usuario, esAdmin } = useAuth();
  const nombre = perfil?.nombre || usuario?.email;
  const modulos = MODULOS.filter((m) => !m.soloAdmin || esAdmin);
  useMigas([]);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-tinta-950 px-8 py-10 text-white md:px-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full border border-oro-500/25" />
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full border border-oro-500/15" />
        <img src={dienteClaro} alt="" className="pointer-events-none absolute right-10 bottom-8 hidden h-24 w-24 object-contain opacity-90 md:block" />

        <p className="text-sm font-semibold text-oro-400">Milla &amp; Mendez · Odontología integral</p>
        <h1 className="mt-4 font-bold tracking-tight text-3xl md:text-4xl">
          {saludo()}, <span className="text-oro-400">{nombre}</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-tinta-300">
          Bienvenido a la plataforma clínica. Elige un módulo para comenzar a trabajar.
        </p>
        <Link to="/clientes" className="btn btn-oro mt-7">
          Ver pacientes <ArrowRight size={16} />
        </Link>
      </section>

      <section>
        <h2 className="font-semibold text-2xl text-tinta-950">Módulos</h2>
        <div className="mt-3 mb-6 h-0.5 w-12 rounded-full bg-oro-500" />
        <div className="grid animate-fade-in grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {modulos.map((modulo) => <TarjetaModulo key={modulo.nombre} {...modulo} />)}
        </div>
      </section>
    </div>
  );
}
