import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { obtenerPerfil } from '../services/usuarios';
import { AuthContext } from './auth';

export default function AuthProvider({ children }) {
  const [estado, setEstado] = useState({ usuario: null, perfil: null, cargando: true });

  useEffect(() => onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      setEstado({ usuario: null, perfil: null, cargando: false });
      return;
    }
    setEstado((previo) => ({ ...previo, cargando: true }));
    try {
      setEstado({ usuario, perfil: await obtenerPerfil(usuario.uid), cargando: false });
    } catch (error) {
      console.error('No se pudo cargar el perfil del usuario', error);
      setEstado({ usuario, perfil: null, cargando: false });
    }
  }), []);

  const valor = useMemo(() => ({
    ...estado,
    esAdmin: Boolean(estado.perfil?.activo && estado.perfil?.rol === 'admin'),
    cerrarSesion: () => signOut(auth),
  }), [estado]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
