import {
  addDoc, collection, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ErrorValidacion } from '../utils/errores';
import { eliminarDeStorage, rutaStorageArchivo } from './archivos';
import { colArchivos, colClientes, colDiagnosticos, conId, refCliente } from './rutas';

const limpiar = ({ nombre, dni, correo, telefono }) => ({
  nombre: nombre.trim(),
  dni,
  correo: correo.trim(),
  telefono,
});

export async function obtenerClientes() {
  const snap = await getDocs(colClientes());
  return snap.docs.map(conId).sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'));
}

export async function obtenerCliente(clienteId) {
  const snap = await getDoc(refCliente(clienteId));
  return snap.exists() ? conId(snap) : null;
}

async function verificarDniLibre(dni, clienteIdActual = null) {
  const snap = await getDocs(query(colClientes(), where('dni', '==', dni)));
  if (snap.docs.some((d) => d.id !== clienteIdActual)) {
    throw new ErrorValidacion('Ya existe un cliente registrado con ese DNI.');
  }
}

export async function registrarCliente(datos) {
  await verificarDniLibre(datos.dni);
  await addDoc(colClientes(), { ...limpiar(datos), creadoEn: serverTimestamp() });
}

export async function actualizarCliente(clienteId, datos) {
  await verificarDniLibre(datos.dni, clienteId);
  await updateDoc(refCliente(clienteId), limpiar(datos));
}

// Firestore no borra subcolecciones al borrar un documento, así que se
// recorre todo el árbol del cliente (diagnósticos, tratamientos, pagos,
// odontogramas y archivos) para no dejar datos huérfanos.
async function recolectarArbolCliente(clienteId) {
  const documentos = [];
  const rutasStorage = [];

  const [diagnosticos, archivos] = await Promise.all([
    getDocs(colDiagnosticos(clienteId)),
    getDocs(colArchivos(clienteId)),
  ]);

  archivos.forEach((a) => {
    documentos.push(a.ref);
    rutasStorage.push(rutaStorageArchivo(clienteId, a.data()));
  });

  await Promise.all(diagnosticos.docs.map(async (diagnostico) => {
    documentos.push(diagnostico.ref);
    const [tratamientos, odontogramas] = await Promise.all([
      getDocs(collection(diagnostico.ref, 'tratamientos')),
      getDocs(collection(diagnostico.ref, 'odontograma')),
    ]);
    odontogramas.forEach((o) => documentos.push(o.ref));

    await Promise.all(tratamientos.docs.map(async (tratamiento) => {
      documentos.push(tratamiento.ref);
      const pagos = await getDocs(collection(tratamiento.ref, 'pagos'));
      pagos.forEach((p) => documentos.push(p.ref));
    }));
  }));

  return { documentos, rutasStorage };
}

const LIMITE_LOTE = 450;

export async function eliminarCliente(clienteId) {
  const { documentos, rutasStorage } = await recolectarArbolCliente(clienteId);

  // Primero los archivos: si algo falla aquí, los datos siguen intactos y se puede reintentar.
  await Promise.all(rutasStorage.map(eliminarDeStorage));

  documentos.push(refCliente(clienteId));
  for (let i = 0; i < documentos.length; i += LIMITE_LOTE) {
    const lote = writeBatch(db);
    documentos.slice(i, i + LIMITE_LOTE).forEach((ref) => lote.delete(ref));
    await lote.commit();
  }
}
