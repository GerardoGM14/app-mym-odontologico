import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import PlacaModal from '../components/PlacaModal';
import OdontogramaModal from '../components/OdontogramaModal';
import Swal from 'sweetalert2';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs
} from 'firebase/firestore';

function TratamientosPorDiagnostico() {
    const navigate = useNavigate();
    const [mostrarOdontograma, setMostrarOdontograma] = useState(false);
    const { id, diagnosticoId } = useParams(); // clienteId y diagnosticoId
    const [mostrarPlaca, setMostrarPlaca] = useState(false);
    const [placaDatos, setPlacaDatos] = useState(null);

    const [diagnostico, setDiagnostico] = useState(null);
    const [tratamientos, setTratamientos] = useState([]);
    const [form, setForm] = useState({
        tipo: '',
        diente: '',
        precio: '',
        estado: 'pendiente'
    });

    const obtenerDiagnostico = async () => {
        const ref = doc(db, 'clientes', id, 'diagnosticos', diagnosticoId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            setDiagnostico(snap.data());
        }
    };

    const obtenerTratamientos = async () => {
        const ref = collection(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'tratamientos');
        const snap = await getDocs(ref);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTratamientos(data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ref = collection(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'tratamientos');
        await addDoc(ref, {
            ...form,
            precio: parseFloat(form.precio),
            detalle: JSON.stringify(form.detalle || [])

        });
        setForm({ tipo: '', diente: '', precio: '', estado: 'pendiente' });
        obtenerTratamientos();
    };

    const manejarSeleccionDientes = (seleccionados) => {
        const dientes = Object.keys(seleccionados);
        const condiciones = Object.values(seleccionados);

        // sugerencia automática
        let tipo = '';
        if (condiciones.includes('endodoncia')) tipo = 'Endodoncia';
        else if (condiciones.includes('obturacion')) tipo = 'Obturación';
        else if (condiciones.includes('caries')) tipo = 'Limpieza';
        else if (condiciones.length > 6) tipo = 'Ortodoncia';

        setForm({
            ...form,
            diente: dientes.join(', '),
            tipo: tipo || form.tipo,
            detalle: Object.entries(seleccionados).map(([numero, caras]) => ({
                numero,
                ...caras
            }))
        });
    };


    useEffect(() => {
        obtenerDiagnostico();
        obtenerTratamientos();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {diagnostico && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-800">Tratamientos para diagnóstico:</h2>
                    <p className="text-gray-600">{diagnostico.diagnostico}</p>
                    <p className="text-sm text-gray-500">{diagnostico.fecha?.toDate().toLocaleDateString()}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-md mb-6">
                <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                >
                    <option value="">Tipo de tratamiento</option>
                    <option value="Endodoncia">Endodoncia</option>
                    <option value="Obturación">Obturación</option>
                    <option value="Prótesis">Prótesis</option>
                    <option value="Ortodoncia">Ortodoncia</option>
                    <option value="Limpieza">Limpieza</option>
                </select>

                <div className="flex gap-2 items-center">
                    <input
                        name="diente"
                        placeholder="Ej. 11, 26"
                        value={form.diente}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    />
                    <button
                        type="button"
                        onClick={() => setMostrarOdontograma(true)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        Ver Odontograma
                    </button>
                </div>


                <input
                    type="number"
                    name="precio"
                    placeholder="Precio (S/.)"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                />

                <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="en progreso">En progreso</option>
                </select>

                <button
                    type="submit"
                    className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Registrar tratamiento
                </button>
            </form>

            <table className="w-full text-left bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-900">
                    <tr>
                        <th className="px-4 py-2">Tipo</th>
                        <th>Diente</th>
                        <th>Precio (S/.)</th>
                        <th>Estado</th>
                        <th>Acciones</th> {/* ← NUEVO */}
                        <th>🦷 Placa</th>
                    </tr>
                </thead>

                <tbody>
                    {tratamientos.map((t) => (
                        <tr key={t.id} className="border-t">
                            <td className="px-4 py-2">{t.tipo}</td>
                            <td>{t.diente}</td>
                            <td>{t.precio}</td>
                            <td>{t.estado}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        navigate(`/clientes/${id}/diagnostico/${diagnosticoId}/tratamientos/${t.id}/pagos`)
                                    }
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                >
                                    Ver pagos
                                </button>
                            </td>
                            <td className="text-center">
                                <button
                                    onClick={() => {
                                        try {
                                            const detalles = JSON.parse(t.detalle || '[]');
                                            if (detalles.length > 0) {
                                                setPlacaDatos({ tratamiento: t.tipo, dientes: detalles });
                                                setMostrarPlaca(true);
                                            } else {
                                                alert("Este tratamiento no tiene datos del odontograma guardados.");
                                            }
                                        } catch (error) {
                                            console.error("Error al cargar placa:", error);
                                        }
                                    }}
                                    className="text-xl hover:text-blue-700"
                                    title="Ver placa"
                                >
                                    🦷
                                </button>
                            </td>


                        </tr>
                    ))}
                </tbody>

            </table>
            {/* Modal odontograma */}
            <OdontogramaModal
                visible={mostrarOdontograma}
                onClose={() => setMostrarOdontograma(false)}
                onSeleccionar={manejarSeleccionDientes}
            />
            <PlacaModal
                visible={mostrarPlaca}
                onClose={() => setMostrarPlaca(false)}
                datos={placaDatos}
            />
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

export default TratamientosPorDiagnostico;
