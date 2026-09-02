// src/pages/OdontogramaDiagnostico.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import Swal from 'sweetalert2';

const dientesAdultos = [
    18, 17, 16, 15, 14, 13, 12, 11,
    21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41,
    31, 32, 33, 34, 35, 36, 37, 38
];

const condiciones = [
    { nombre: 'Sano', color: 'white', code: 'sano' },
    { nombre: 'Caries', color: 'red', code: 'caries' },
    { nombre: 'Obturación', color: 'blue', code: 'obturacion' },
    { nombre: 'Endodoncia', color: 'blue', code: 'endodoncia', linea: true },
    { nombre: 'Exodoncia', color: 'red', code: 'exodoncia', cruz: true },
    { nombre: 'Sellante', color: 'blue', code: 'sellante' },
    { nombre: 'Fractura', color: 'red', code: 'fractura', linea: true }
];

function OdontogramaDiagnostico() {
    const { id, diagnosticoId } = useParams();
    const [condicionSeleccionada, setCondicionSeleccionada] = useState('sano');
    const [odontograma, setOdontograma] = useState({});

    const cargarOdontograma = async () => {
        const ref = doc(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'odontograma', 'estado');
        const snap = await getDoc(ref);
        if (snap.exists()) setOdontograma(snap.data());
    };

    const guardarOdontograma = async () => {
        const ref = doc(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'odontograma', 'estado');
        await setDoc(ref, odontograma);
        Swal.fire({
            icon: 'success',
            title: 'Odontograma guardado',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const actualizarDiente = (numero) => {
        setOdontograma((prev) => ({
            ...prev,
            [numero]: condicionSeleccionada
        }));
    };

    useEffect(() => {
        cargarOdontograma();
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Odontograma Interactivo</h2>

            <div className="flex flex-wrap gap-4 mb-6">
                {condiciones.map((c) => (
                    <button
                        key={c.code}
                        onClick={() => setCondicionSeleccionada(c.code)}
                        className={`px-4 py-2 rounded border shadow ${condicionSeleccionada === c.code ? 'bg-gray-300' : 'bg-white'}`}
                    >
                        <span className="inline-block w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                        {c.nombre}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-16 gap-2 bg-gray-100 p-4 rounded shadow">
                {dientesAdultos.map((numero) => (
                    <div
                        key={numero}
                        className={`w-12 h-12 border rounded flex items-center justify-center cursor-pointer relative`}
                        onClick={() => actualizarDiente(numero)}
                        style={{
                            backgroundColor: condiciones.find(c => c.code === odontograma[numero])?.color || 'white'
                        }}
                    >
                        <span className="text-xs text-gray-800">{numero}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={guardarOdontograma}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
                Guardar Odontograma
            </button>
        </div>
    );
}

export default OdontogramaDiagnostico;
