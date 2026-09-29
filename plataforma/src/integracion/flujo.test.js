// Prueba de integración: flujo completo de la clínica contra los emuladores de Firebase,
// con las reglas reales (firestore.rules y storage.rules) y los servicios reales de la app.
// Ejecutar desde la raíz del repositorio: npm run test:integracion
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { eliminarArchivo, obtenerArchivos, subirArchivo } from '../services/archivos';
import { actualizarCliente, eliminarCliente, obtenerClientes, registrarCliente } from '../services/clientes';
import {
  actualizarDiagnostico, guardarOdontograma, obtenerDiagnosticos, obtenerHistorialCliente, obtenerOdontograma,
  registrarDiagnostico,
} from '../services/diagnosticos';
import { obtenerDatosEstadisticas } from '../services/estadisticas';
import { obtenerTratamiento, obtenerTratamientos, registrarPago, registrarTratamiento } from '../services/tratamientos';
import { actualizarUsuario, crearUsuario, obtenerPerfil, obtenerUsuarios } from '../services/usuarios';
import { formatearFechaCalendario } from '../utils/fechas';

const PROYECTO = firebaseConfig.projectId;
const CLAVE = 'clave-segura-123';
const ADMIN = { email: 'admin@prueba.pe', nombre: 'Admin Prueba' };
const ASISTENTE = { email: 'asistente@prueba.pe', nombre: 'Asistente Prueba' };

// El primer administrador se crea saltándose las reglas (como se hace desde la consola de Firebase).
async function crearPerfilAdminDirecto(uid) {
  const url = `http://127.0.0.1:8080/v1/projects/${PROYECTO}/databases/(default)/documents/usuarios?documentId=${uid}`;
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        nombre: { stringValue: ADMIN.nombre },
        email: { stringValue: ADMIN.email },
        rol: { stringValue: 'admin' },
        activo: { booleanValue: true },
      },
    }),
  });
  if (!respuesta.ok) throw new Error(`No se pudo crear el perfil admin: ${respuesta.status}`);
}

async function entrarComo(email) {
  await signOut(auth);
  await signInWithEmailAndPassword(auth, email, CLAVE);
}

const codigoDeError = (promesa) => promesa.then(() => 'sin error', (error) => error.code ?? error.name);

// Estado compartido entre pasos (las pruebas se ejecutan en orden).
const ctx = {};

describe('flujo del administrador', () => {
  it('el primer administrador inicia sesión y tiene perfil', async () => {
    const { user } = await createUserWithEmailAndPassword(auth, ADMIN.email, CLAVE);
    await crearPerfilAdminDirecto(user.uid);
    ctx.uidAdmin = user.uid;
    const perfil = await obtenerPerfil(user.uid);
    expect(perfil).toMatchObject({ rol: 'admin', activo: true });
  });

  it('registra pacientes y rechaza un DNI duplicado', async () => {
    await registrarCliente({ nombre: 'Ana Pérez', dni: '12345678', correo: 'ana@correo.pe', telefono: '987654321' });
    await registrarCliente({ nombre: 'Bruno Díaz', dni: '87654321', correo: '', telefono: '912345678' });
    const duplicado = registrarCliente({ nombre: 'Otra', dni: '12345678', correo: '', telefono: '900000000' });
    expect(await codigoDeError(duplicado)).toBe('ErrorValidacion');

    const clientes = await obtenerClientes();
    expect(clientes.map((c) => c.nombre)).toEqual(['Ana Pérez', 'Bruno Díaz']);
    ctx.ana = clientes[0];
    ctx.bruno = clientes[1];
  });

  it('edita un paciente (y permite conservar su propio DNI)', async () => {
    await actualizarCliente(ctx.ana.id, { ...ctx.ana, telefono: '955555555' });
    const ana = (await obtenerClientes()).find((c) => c.id === ctx.ana.id);
    expect(ana.telefono).toBe('955555555');
  });

  it('registra y edita un diagnóstico; la fecha no se corre un día', async () => {
    await registrarDiagnostico(ctx.ana.id, {
      fecha: '2025-04-18', especialidad: 'Odontólogo', odontologo: 'Dr. Boris Milla',
      diagnostico: 'Caries dental', observaciones: ' Molar 16 ',
    });
    const [diagnostico] = await obtenerDiagnosticos(ctx.ana.id);
    expect(formatearFechaCalendario(diagnostico.fecha)).toBe('18/04/2025');
    expect(diagnostico.observaciones).toBe('Molar 16');

    await actualizarDiagnostico(ctx.ana.id, diagnostico.id, { diagnostico: 'Caries profunda', observaciones: '' });
    const [editado] = await obtenerDiagnosticos(ctx.ana.id);
    expect(editado.diagnostico).toBe('Caries profunda');
    ctx.diagnostico = editado;
  });

  it('guarda y lee el odontograma por caras', async () => {
    const odontograma = { denticion: 'adulto', dientes: { 16: { oclusal: ['caries'], diente: ['endodoncia'] } } };
    await guardarOdontograma(ctx.ana.id, ctx.diagnostico.id, odontograma);
    expect(await obtenerOdontograma(ctx.ana.id, ctx.diagnostico.id)).toEqual(odontograma);
  });

  it('registra un tratamiento y su estado sigue a los pagos', async () => {
    await registrarTratamiento(ctx.ana.id, ctx.diagnostico.id, {
      tipo: 'Endodoncia', diente: '16', precio: '150.50', detalle: [{ numero: '16', diente: ['endodoncia'] }],
    });
    let [tratamiento] = await obtenerTratamientos(ctx.ana.id, ctx.diagnostico.id);
    expect(tratamiento).toMatchObject({ precio: 150.5, pagado: 0, pendiente: 150.5, estado: 'pendiente' });

    await registrarPago(ctx.ana.id, ctx.diagnostico.id, tratamiento, '100.20');
    tratamiento = await obtenerTratamiento(ctx.ana.id, ctx.diagnostico.id, tratamiento.id);
    expect(tratamiento).toMatchObject({ pagado: 100.2, pendiente: 50.3, estado: 'en progreso' });

    const sobrepago = registrarPago(ctx.ana.id, ctx.diagnostico.id, tratamiento, '60');
    expect(await codigoDeError(sobrepago)).toBe('ErrorValidacion');

    await registrarPago(ctx.ana.id, ctx.diagnostico.id, tratamiento, '50.30');
    tratamiento = await obtenerTratamiento(ctx.ana.id, ctx.diagnostico.id, tratamiento.id);
    expect(tratamiento).toMatchObject({ pagado: 150.5, pendiente: 0, estado: 'pagado' });
    expect(tratamiento.pagos).toHaveLength(2);
  });

  it('sube y elimina archivos clínicos; dos archivos con el mismo nombre no se pisan', async () => {
    const archivo = () => new File(['radiografía de prueba'], 'radiografia.txt', { type: 'text/plain' });
    await subirArchivo(ctx.ana.id, archivo());
    await subirArchivo(ctx.ana.id, archivo());
    let archivos = await obtenerArchivos(ctx.ana.id);
    expect(archivos).toHaveLength(2);
    expect(new Set(archivos.map((a) => a.ruta)).size).toBe(2);

    await eliminarArchivo(ctx.ana.id, archivos[0]);
    archivos = await obtenerArchivos(ctx.ana.id);
    expect(archivos).toHaveLength(1);
    // Se deja un archivo para comprobar que eliminar al paciente también lo borra.
  });

  it('el historial suma lo pagado y lo pendiente', async () => {
    const { cliente, diagnosticos } = await obtenerHistorialCliente(ctx.ana.id);
    expect(cliente.nombre).toBe('Ana Pérez');
    expect(diagnosticos).toHaveLength(1);
    expect(diagnosticos[0].tratamientos[0]).toMatchObject({ pagado: 150.5, estado: 'pagado' });
  });

  it('las estadísticas leen tratamientos y pagos de toda la clínica', async () => {
    const { tratamientos, pagos } = await obtenerDatosEstadisticas();
    expect(tratamientos).toEqual([expect.objectContaining({ tipo: 'Endodoncia', estado: 'pagado' })]);
    expect(pagos).toHaveLength(2);
  });

  it('crea un usuario asistente sin cerrar la sesión del administrador', async () => {
    await crearUsuario({ nombre: ASISTENTE.nombre, email: ASISTENTE.email, password: CLAVE, rol: 'asistente' });
    expect(auth.currentUser.uid).toBe(ctx.uidAdmin);
    const usuarios = await obtenerUsuarios();
    ctx.asistente = usuarios.find((u) => u.email === ASISTENTE.email);
    expect(ctx.asistente).toMatchObject({ rol: 'asistente', activo: true });
  });
});

describe('permisos del asistente', () => {
  it('puede trabajar con pacientes, diagnósticos, tratamientos y pagos', async () => {
    await entrarComo(ASISTENTE.email);
    expect(await obtenerClientes()).toHaveLength(2);
    await registrarCliente({ nombre: 'Carla Ruiz', dni: '11223344', correo: '', telefono: '933333333' });
    await registrarDiagnostico(ctx.bruno.id, {
      fecha: '2025-05-02', especialidad: 'Ortodoncista', odontologo: 'Dra. Camila Ruiz',
      diagnostico: 'Sobremordida', observaciones: '',
    });
    const [diagnostico] = await obtenerDiagnosticos(ctx.bruno.id);
    await registrarTratamiento(ctx.bruno.id, diagnostico.id, { tipo: 'Ortodoncia', diente: '', precio: '1000', detalle: [] });
    const [tratamiento] = await obtenerTratamientos(ctx.bruno.id, diagnostico.id);
    await registrarPago(ctx.bruno.id, diagnostico.id, tratamiento, '200');
    expect((await obtenerDatosEstadisticas()).tratamientos).toHaveLength(2);
  });

  it('NO puede eliminar pacientes, editar diagnósticos, subir archivos ni ver usuarios', async () => {
    expect(await codigoDeError(eliminarCliente(ctx.bruno.id))).toBe('permission-denied');
    expect(await codigoDeError(
      actualizarDiagnostico(ctx.ana.id, ctx.diagnostico.id, { diagnostico: 'X', observaciones: '' }),
    )).toBe('permission-denied');
    expect(await codigoDeError(
      subirArchivo(ctx.ana.id, new File(['x'], 'x.txt', { type: 'text/plain' })),
    )).toBe('storage/unauthorized');
    expect(await codigoDeError(obtenerUsuarios())).toBe('permission-denied');
    expect(await codigoDeError(
      crearUsuario({ nombre: 'Intruso', email: 'intruso2@prueba.pe', password: CLAVE, rol: 'admin' }),
    )).toBe('permission-denied');
  });
});

describe('cuentas sin acceso', () => {
  it('una cuenta creada por fuera (sin perfil) no ve nada', async () => {
    await signOut(auth);
    await createUserWithEmailAndPassword(auth, 'intruso@prueba.pe', CLAVE);
    expect(await codigoDeError(obtenerClientes())).toBe('permission-denied');
    expect(await codigoDeError(
      registrarCliente({ nombre: 'Hack', dni: '99999999', correo: '', telefono: '999999999' }),
    )).toBe('permission-denied');
  });

  it('un usuario desactivado pierde el acceso', async () => {
    await entrarComo(ADMIN.email);
    await actualizarUsuario(ctx.asistente.id, { activo: false });
    await entrarComo(ASISTENTE.email);
    expect(await codigoDeError(obtenerClientes())).toBe('permission-denied');
  });
});

describe('eliminación de pacientes', () => {
  it('el administrador elimina a un paciente con todo su historial, sin dejar huérfanos', async () => {
    await entrarComo(ADMIN.email);
    await eliminarCliente(ctx.ana.id);

    expect((await obtenerClientes()).map((c) => c.nombre)).toEqual(['Bruno Díaz', 'Carla Ruiz']);
    expect(await obtenerDiagnosticos(ctx.ana.id)).toEqual([]);
    expect(await obtenerArchivos(ctx.ana.id)).toEqual([]);

    // No quedan tratamientos ni pagos de Ana en toda la base.
    const tratamientos = await getDocs(collectionGroup(db, 'tratamientos'));
    const pagos = await getDocs(collectionGroup(db, 'pagos'));
    expect(tratamientos.docs.some((d) => d.ref.path.includes(ctx.ana.id))).toBe(false);
    expect(pagos.docs.some((d) => d.ref.path.includes(ctx.ana.id))).toBe(false);
  });
});
