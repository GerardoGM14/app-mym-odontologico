import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// La configuración web de Firebase es pública por diseño (viaja al navegador).
// La protección de los datos está en firestore.rules y storage.rules.
const configuracionProduccion = {
  apiKey: 'AIzaSyDhJ0L0AfRHLFToFN3qJpkHUGeH3dh4leA',
  authDomain: 'odonto-system-438b7.firebaseapp.com',
  projectId: 'odonto-system-438b7',
  storageBucket: 'odonto-system-438b7.firebasestorage.app',
  messagingSenderId: '934987312061',
  appId: '1:934987312061:web:7134ef08f97470466e40d4',
  measurementId: 'G-HSLTGXEDM3',
};

// Con VITE_EMULADORES=1 la app usa los emuladores locales de Firebase y un proyecto
// "demo-", que nunca puede tocar los datos reales (pruebas de integración y desarrollo).
export const usarEmuladores = import.meta.env.VITE_EMULADORES === '1';

export const firebaseConfig = usarEmuladores
  ? { ...configuracionProduccion, projectId: 'demo-odonto', storageBucket: 'demo-odonto.appspot.com' }
  : configuracionProduccion;

export function conectarAuthEmulador(instanciaAuth) {
  if (usarEmuladores) connectAuthEmulator(instanciaAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (usarEmuladores) {
  conectarAuthEmulador(auth);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
