import { useCallback, useEffect, useState } from 'react';

// Ejecuta `cargar` al montar y cada vez que cambian `dependencias`.
// Devuelve { datos, cargando, error, recargar }.
export function useDatos(cargar, dependencias) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    cargar()
      .then((datos) => vigente && setEstado({ datos, cargando: false, error: null }))
      .catch((error) => {
        console.error(error);
        if (vigente) setEstado((previo) => ({ ...previo, cargando: false, error }));
      });
    return () => { vigente = false; };
    // `cargar` se recrea en cada render; lo que importa son las dependencias declaradas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { ...estado, recargar };
}
