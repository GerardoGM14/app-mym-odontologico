import { addDoc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { milisegundos } from '../utils/fechas';
import { colArchivos, conId, refArchivo } from './rutas';

// Los registros antiguos no guardaban `ruta`: su archivo está bajo el nombre original.
export const rutaStorageArchivo = (clienteId, archivo) =>
  archivo.ruta ?? `clientes/${clienteId}/archivos/${archivo.nombre}`;

export async function eliminarDeStorage(ruta) {
  try {
    await deleteObject(ref(storage, ruta));
  } catch (error) {
    if (error.code !== 'storage/object-not-found') throw error;
  }
}

export async function obtenerArchivos(clienteId) {
  const snap = await getDocs(colArchivos(clienteId));
  return snap.docs.map(conId).sort((a, b) => milisegundos(b.fecha) - milisegundos(a.fecha));
}

export async function subirArchivo(clienteId, archivo) {
  // El prefijo con la hora evita que dos archivos con el mismo nombre se sobrescriban.
  const ruta = `clientes/${clienteId}/archivos/${Date.now()}-${archivo.name}`;
  const destino = ref(storage, ruta);
  await uploadBytes(destino, archivo);
  const url = await getDownloadURL(destino);

  await addDoc(colArchivos(clienteId), {
    nombre: archivo.name,
    ruta,
    url,
    tipo: archivo.type,
    tamano: archivo.size,
    fecha: Timestamp.now(),
  });
}

export async function eliminarArchivo(clienteId, archivo) {
  await eliminarDeStorage(rutaStorageArchivo(clienteId, archivo));
  await deleteDoc(refArchivo(clienteId, archivo.id));
}
