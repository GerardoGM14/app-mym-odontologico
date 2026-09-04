import { addDoc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { fechaCalendarioDesdeInput, milisegundos } from '../utils/fechas';
import { obtenerCliente } from './clientes';
import { colDiagnosticos, conId, refDiagnostico, refOdontograma } from './rutas';
import { obtenerTratamientos } from './tratamientos';

export async function obtenerDiagnosticos(clienteId) {
  const snap = await getDocs(colDiagnosticos(clienteId));
  return snap.docs.map(conId).sort((a, b) => milisegundos(b.fecha) - milisegundos(a.fecha));
}

export async function obtenerDiagnostico(clienteId, diagnosticoId) {
  const snap = await getDoc(refDiagnostico(clienteId, diagnosticoId));
  return snap.exists() ? conId(snap) : null;
}

export async function registrarDiagnostico(clienteId, { fecha, especialidad, odontologo, diagnostico, observaciones }) {
  await addDoc(colDiagnosticos(clienteId), {
    fecha: Timestamp.fromDate(fechaCalendarioDesdeInput(fecha)),
    especialidad,
    odontologo,
    diagnostico,
    observaciones: observaciones.trim(),
    creadoEn: serverTimestamp(),
  });
}

export async function actualizarDiagnostico(clienteId, diagnosticoId, { diagnostico, observaciones }) {
  await updateDoc(refDiagnostico(clienteId, diagnosticoId), {
    diagnostico: diagnostico.trim(),
    observaciones: observaciones.trim(),
  });
}

// Cliente + todos sus diagnósticos con tratamientos y pagos, consultados en paralelo.
export async function obtenerHistorialCliente(clienteId) {
  const [cliente, diagnosticos] = await Promise.all([
    obtenerCliente(clienteId),
    obtenerDiagnosticos(clienteId),
  ]);
  const conTratamientos = await Promise.all(diagnosticos.map(async (d) => ({
    ...d,
    tratamientos: await obtenerTratamientos(clienteId, d.id),
  })));
  return { cliente, diagnosticos: conTratamientos };
}

export async function obtenerOdontograma(clienteId, diagnosticoId) {
  const snap = await getDoc(refOdontograma(clienteId, diagnosticoId));
  return snap.exists() ? snap.data() : {};
}

export async function guardarOdontograma(clienteId, diagnosticoId, odontograma) {
  await setDoc(refOdontograma(clienteId, diagnosticoId), odontograma);
}
