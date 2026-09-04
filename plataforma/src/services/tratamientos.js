import { addDoc, getDoc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { aCentimos, resumenPagos } from '../utils/dinero';
import { ErrorValidacion } from '../utils/errores';
import { milisegundos } from '../utils/fechas';
import { colPagos, colTratamientos, conId, refTratamiento } from './rutas';

const ordenarPorFecha = (lista) => lista.sort((a, b) => milisegundos(a.fecha) - milisegundos(b.fecha));

async function obtenerPagos(clienteId, diagnosticoId, tratamientoId) {
  const snap = await getDocs(colPagos(clienteId, diagnosticoId, tratamientoId));
  return ordenarPorFecha(snap.docs.map(conId));
}

// Agrega al tratamiento sus pagos y el resumen calculado (pagado, pendiente, estado).
// El campo `estado` guardado en datos antiguos se ignora: la fuente de verdad son los pagos.
const conResumen = (tratamiento, pagos) => ({
  ...tratamiento,
  pagos,
  ...resumenPagos(tratamiento.precio, pagos.map((p) => p.monto)),
});

export async function obtenerTratamientos(clienteId, diagnosticoId) {
  const snap = await getDocs(colTratamientos(clienteId, diagnosticoId));
  return Promise.all(snap.docs.map(async (t) =>
    conResumen(conId(t), await obtenerPagos(clienteId, diagnosticoId, t.id))));
}

export async function obtenerTratamiento(clienteId, diagnosticoId, tratamientoId) {
  const [snap, pagos] = await Promise.all([
    getDoc(refTratamiento(clienteId, diagnosticoId, tratamientoId)),
    obtenerPagos(clienteId, diagnosticoId, tratamientoId),
  ]);
  return snap.exists() ? conResumen(conId(snap), pagos) : null;
}

export async function registrarTratamiento(clienteId, diagnosticoId, { tipo, diente, precio, detalle }) {
  await addDoc(colTratamientos(clienteId, diagnosticoId), {
    tipo,
    diente: diente.trim(),
    precio: Number(precio),
    detalle: JSON.stringify(detalle ?? []),
    creadoEn: serverTimestamp(),
  });
}

export async function registrarPago(clienteId, diagnosticoId, tratamiento, monto) {
  const montoC = aCentimos(monto);
  if (montoC <= 0) throw new ErrorValidacion('El monto debe ser mayor a 0.');
  if (montoC > aCentimos(tratamiento.pendiente)) {
    throw new ErrorValidacion('El monto supera el saldo pendiente.');
  }
  await addDoc(colPagos(clienteId, diagnosticoId, tratamiento.id), {
    monto: montoC / 100,
    fecha: Timestamp.now(),
  });
}
