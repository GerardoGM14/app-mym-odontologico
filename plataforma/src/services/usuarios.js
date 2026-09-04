import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword, inMemoryPersistence, initializeAuth, signOut,
} from 'firebase/auth';
import { getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { conectarAuthEmulador, firebaseConfig } from '../lib/firebase';
import { colUsuarios, conId, refUsuario } from './rutas';

// Perfil del usuario en Firestore: { nombre, email, rol: 'admin'|'asistente', activo }.
// Sin un perfil activo, las reglas de seguridad no permiten leer ni escribir datos.
export async function obtenerPerfil(uid) {
  const snap = await getDoc(refUsuario(uid));
  return snap.exists() ? conId(snap) : null;
}

export async function obtenerUsuarios() {
  const snap = await getDocs(colUsuarios());
  return snap.docs.map(conId).sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'));
}

// Crear una cuenta con el SDK cliente inicia sesión con ella. Para no cerrar la
// sesión del administrador, la cuenta se crea en una instancia secundaria de
// Firebase que no guarda la sesión.
let authSecundario = null;
function obtenerAuthSecundario() {
  if (!authSecundario) {
    const nombre = 'alta-usuarios';
    const app = getApps().find((a) => a.name === nombre) ?? initializeApp(firebaseConfig, nombre);
    authSecundario = initializeAuth(app, { persistence: inMemoryPersistence });
    conectarAuthEmulador(authSecundario);
  }
  return authSecundario;
}

export async function crearUsuario({ nombre, email, password, rol }) {
  const authAlta = obtenerAuthSecundario();
  const { user } = await createUserWithEmailAndPassword(authAlta, email.trim(), password);
  await signOut(authAlta);
  await setDoc(refUsuario(user.uid), {
    nombre: nombre.trim(),
    email: user.email,
    rol,
    activo: true,
    creadoEn: serverTimestamp(),
  });
}

export async function actualizarUsuario(uid, cambios) {
  await updateDoc(refUsuario(uid), cambios);
}
