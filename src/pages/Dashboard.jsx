import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


function Dashboard() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      const ref = doc(db, 'usuarios', usuario.uid);
      getDoc(ref).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setNombreUsuario(data.nombre || usuario.email);
        }
      });
    }
  }, []);

  const modulos = [
    {
      nombre: 'Clientes / Pacientes',
      descripcion: 'Registro, edición y diagnóstico',
      color: 'bg-blue-100',
      icono: '🧑‍⚕️',
      ruta: '/clientes',
    },
    {
      nombre: 'Estadísticas',
      descripcion: 'Gráficos y análisis de pagos y tratamientos',
      color: 'bg-green-100',
      icono: '📊',
      ruta: '/estadisticas',
    },
    {
      nombre: 'Capacitación',
      descripcion: 'Módulo en desarrollo',
      color: 'bg-yellow-100',
      icono: '📚',
      ruta: '#',
    },
    {
      nombre: 'Configuración',
      descripcion: 'Opciones generales del sistema',
      color: 'bg-gray-100',
      icono: '⚙️',
      ruta: '#',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
        <img src="/logo-empresa.jpg" alt="Logo" className="h-12" />
          <div>
            <h1 className="text-2xl font-bold text-purple-800">OdontoSystem</h1>
            <p className="text-sm text-gray-500">Bienvenido, {nombreUsuario}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
        >
          🔓 Cerrar sesión
        </button>
      </div>

      {/* Módulos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in-up">
        {modulos.map((modulo, idx) => (
          <div
            key={idx}
            onClick={() => modulo.ruta !== '#' && navigate(modulo.ruta)}
            className={`${modulo.color} p-6 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="text-4xl mb-2">{modulo.icono}</div>
            <h3 className="text-xl font-semibold text-gray-800">{modulo.nombre}</h3>
            <p className="text-gray-600 text-sm">{modulo.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

