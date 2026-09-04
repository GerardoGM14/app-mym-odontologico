import { collection, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Estructura de Firestore:
// clientes/{clienteId}
//   archivos/{archivoId}
//   diagnosticos/{diagnosticoId}
//     odontograma/estado
//     tratamientos/{tratamientoId}
//       pagos/{pagoId}
// usuarios/{uid}

export const colClientes = () => collection(db, 'clientes');
export const refCliente = (clienteId) => doc(db, 'clientes', clienteId);

export const colArchivos = (clienteId) => collection(db, 'clientes', clienteId, 'archivos');
export const refArchivo = (clienteId, archivoId) => doc(colArchivos(clienteId), archivoId);

export const colDiagnosticos = (clienteId) => collection(db, 'clientes', clienteId, 'diagnosticos');
export const refDiagnostico = (clienteId, diagnosticoId) => doc(colDiagnosticos(clienteId), diagnosticoId);

export const refOdontograma = (clienteId, diagnosticoId) =>
  doc(refDiagnostico(clienteId, diagnosticoId), 'odontograma', 'estado');

export const colTratamientos = (clienteId, diagnosticoId) =>
  collection(refDiagnostico(clienteId, diagnosticoId), 'tratamientos');
export const refTratamiento = (clienteId, diagnosticoId, tratamientoId) =>
  doc(colTratamientos(clienteId, diagnosticoId), tratamientoId);

export const colPagos = (clienteId, diagnosticoId, tratamientoId) =>
  collection(refTratamiento(clienteId, diagnosticoId, tratamientoId), 'pagos');

export const colUsuarios = () => collection(db, 'usuarios');
export const refUsuario = (uid) => doc(db, 'usuarios', uid);

export const conId = (snap) => ({ id: snap.id, ...snap.data() });
