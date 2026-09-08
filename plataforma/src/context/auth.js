import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// { usuario, perfil, esAdmin, cargando, cerrarSesion }
export const useAuth = () => useContext(AuthContext);
