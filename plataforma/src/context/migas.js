import { createContext, useContext, useEffect } from 'react';

// Las migas de pan se dibujan en la barra superior del layout, pero cada página
// decide cuáles son. Una miga es { texto, a? }; la última no lleva enlace.
export const MigasContext = createContext(null);

export function useMigas(migas) {
  const fijarMigas = useContext(MigasContext);
  const clave = JSON.stringify(migas ?? []);

  useEffect(() => {
    fijarMigas?.(JSON.parse(clave));
  }, [fijarMigas, clave]);
}
