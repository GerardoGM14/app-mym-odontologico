import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { resumenPagos } from '../utils/dinero';
import { colClientes } from './rutas';

// Las rutas tienen la forma clientes/{clienteId}/diagnosticos/...
const clienteDeRuta = (ruta) => ruta.split('/')[1];

// Lee todos los tratamientos y pagos de la clínica. Se descartan los que
// pertenecen a clientes ya eliminados (datos huérfanos de versiones anteriores).
export async function obtenerDatosEstadisticas() {
  const [clientesSnap, tratamientosSnap, pagosSnap] = await Promise.all([
    getDocs(colClientes()),
    getDocs(collectionGroup(db, 'tratamientos')),
    getDocs(collectionGroup(db, 'pagos')),
  ]);

  const clientesVigentes = new Set(clientesSnap.docs.map((c) => c.id));
  const esVigente = (ruta) => clientesVigentes.has(clienteDeRuta(ruta));

  const pagos = pagosSnap.docs
    .filter((p) => esVigente(p.ref.path))
    .map((p) => {
      const datos = p.data();
      return {
        rutaTratamiento: p.ref.parent.parent.path,
        monto: datos.monto,
        fecha: datos.fecha?.toDate?.() ?? null,
      };
    });

  const montosPorTratamiento = new Map();
  for (const p of pagos) {
    const montos = montosPorTratamiento.get(p.rutaTratamiento) ?? [];
    montos.push(p.monto);
    montosPorTratamiento.set(p.rutaTratamiento, montos);
  }

  const tratamientos = tratamientosSnap.docs
    .filter((t) => esVigente(t.ref.path))
    .map((t) => {
      const datos = t.data();
      const { estado } = resumenPagos(datos.precio, montosPorTratamiento.get(t.ref.path) ?? []);
      return { ruta: t.ref.path, tipo: datos.tipo, estado };
    });

  return { tratamientos, pagos };
}
