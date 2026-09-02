import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../firebase/firebaseConfig';
import {
    collection, addDoc, getDocs, deleteDoc, doc, Timestamp
} from 'firebase/firestore';
import {
    ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import Swal from 'sweetalert2';

function ClienteDetalles() {
    const { id } = useParams(); // ✅ Correcto: dentro del componente
    const [cargando, setCargando] = useState(false);
    const [archivos, setArchivos] = useState([]);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [pinModal, setPinModal] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [puedeGestionar, setPuedeGestionar] = useState(false);

    useEffect(() => {
        obtenerArchivos();
    }, []);

    const obtenerArchivos = async () => {
        const refArchivos = collection(db, 'clientes', id, 'archivos');
        const snap = await getDocs(refArchivos);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArchivos(data);
    };

    const subirArchivo = async () => {
        if (!archivoSeleccionado) return;

        setCargando(true); // 👈 inicia el loader

        try {
            const storageRef = ref(storage, `clientes/${id}/archivos/${archivoSeleccionado.name}`);
            await uploadBytes(storageRef, archivoSeleccionado);

            const url = await getDownloadURL(storageRef);
            const fecha = Timestamp.now();

            await addDoc(collection(db, 'clientes', id, 'archivos'), {
                nombre: archivoSeleccionado.name,
                url,
                fecha
            });

            setArchivoSeleccionado(null);
            obtenerArchivos();

            // ✅ Toast de éxito
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Archivo subido correctamente',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });

        } catch (error) {
            console.error("❌ Error al subir archivo:", error);

            // ❌ Toast de error
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Error al subir archivo',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true
            });

        } finally {
            setCargando(false); // 👈 termina el loader
        }
    };

    const validarPIN = () => {
        if (pinModal === '14061708') {
            setPuedeGestionar(true);
            setMostrarModal(false);
            setPinModal('');
            alert('✅ Acceso concedido para subir o eliminar archivos.');
        } else {
            alert('❌ PIN incorrecto');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">

            {/* Modal de PIN */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">🔐 Ingrese el PIN de seguridad</h3>
                        <input
                            type="password"
                            value={pinModal}
                            onChange={(e) => setPinModal(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 mb-4"
                            placeholder="PIN de administrador"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setMostrarModal(false)}
                                className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={validarPIN}
                                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                            >
                                Validar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 bg-white p-4 rounded shadow space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-blue-800">📎 Archivos clínicos del paciente</h3>
                    {!puedeGestionar && (
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                        >
                            🔐 Validar PIN
                        </button>
                    )}
                </div>

                {puedeGestionar && (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <label className="relative cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition text-sm font-medium">
                                📁 Seleccionar archivo
                                <input
                                    type="file"
                                    onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </label>

                            {archivoSeleccionado && (
                                <span className="text-sm text-gray-600 truncate max-w-xs">
                                    {archivoSeleccionado.name}
                                </span>
                            )}

                            <button
                                onClick={subirArchivo}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                disabled={!archivoSeleccionado}
                            >
                                📤 Subir archivo
                            </button>
                            {cargando && (
                                <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500 border-opacity-50"></span>
                                    Subiendo archivo...
                                </div>
                            )}

                        </div>

                    </div>
                )}
            </div>
            {archivos.length > 0 ? (
                <table className="w-full bg-white mt-4 rounded shadow text-sm">
                    <thead className="bg-blue-100 text-blue-900">
                        <tr>
                            <th className="px-4 py-2 text-left">📄 Nombre</th>
                            <th>📅 Fecha</th>
                            <th className="text-center">📎 Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {archivos.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="px-4 py-2">{a.nombre}</td>
                                <td>{a.fecha?.toDate().toLocaleDateString()}</td>
                                <td className="text-center space-x-2">
                                    <a
                                        href={a.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-700 hover:underline"
                                    >
                                        Ver
                                    </a>
                                    {puedeGestionar && (
                                        <button
                                            onClick={async () => {
                                                if (confirm('¿Eliminar archivo?')) {
                                                    const archivoRef = ref(storage, `clientes/${id}/archivos/${a.nombre}`);
                                                    await deleteObject(archivoRef);
                                                    await deleteDoc(doc(db, 'clientes', id, 'archivos', a.id));
                                                    obtenerArchivos();
                                                }
                                            }}
                                            className="text-red-600 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500 mt-4 italic">No hay archivos subidos aún.</p>
            )}
            <button
                onClick={() => {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'info',
                        title: 'Regresando al inicio...',
                        toast: true,
                        showConfirmButton: false,
                        timer: 1800,
                        timerProgressBar: true,
                        customClass: {
                            popup: 'rounded-lg shadow-md text-sm',
                            title: 'font-semibold text-gray-700'
                        }
                    });
                    setTimeout(() => navigate('/dashboard'), 1200); // Cambia la ruta si lo necesitas
                }}
                className="fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:bg-gray-900 transition text-sm z-50"
            >
                <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded">←</span>
                Volver al inicio
            </button>
        </div>
    );
}

export default ClienteDetalles;
