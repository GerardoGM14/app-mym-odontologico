import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const coleccion = collection(db, "clientes");

export const registrarCliente = async (cliente) => {
  await addDoc(coleccion, cliente);
};

export const obtenerClientes = async () => {
  const snapshot = await getDocs(coleccion);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const actualizarCliente = async (id, datos) => {
  const ref = doc(db, "clientes", id);
  await updateDoc(ref, datos);
};

export const eliminarCliente = async (id) => {
  const ref = doc(db, "clientes", id);
  await deleteDoc(ref);
};
