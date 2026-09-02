import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    Timestamp
} from 'firebase/firestore';

function ClienteDiagnostico() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [cliente, setCliente] = useState(null);
    const [diagnosticos, setDiagnosticos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState(null);
    const [pinModal, setPinModal] = useState('');
    const [form, setForm] = useState({
        fecha: '',
        observaciones: '',
        diagnostico: '',
        odontologo: ''
    });
    const [formEdicion, setFormEdicion] = useState({
        diagnostico: '',
        observaciones: ''
    });

    const obtenerCliente = async () => {
        const ref = doc(db, 'clientes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            setCliente(snap.data());
        }
    };

    const obtenerDiagnosticos = async () => {
        const ref = collection(db, 'clientes', id, 'diagnosticos');
        const snap = await getDocs(ref);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDiagnosticos(data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ref = collection(db, 'clientes', id, 'diagnosticos');
        await addDoc(ref, {
            ...form,
            fecha: Timestamp.fromDate(new Date(form.fecha)),
        });
        setForm({ fecha: '', observaciones: '', diagnostico: '', odontologo: '' });
        obtenerDiagnosticos();
    };

    const abrirModal = (diagnostico) => {
        setDiagnosticoSeleccionado(diagnostico);
        setPinModal('');
        setFormEdicion({
            diagnostico: diagnostico.diagnostico,
            observaciones: diagnostico.observaciones
        });
        setMostrarModal(true);
    };

    const guardarEdicion = async () => {
        if (pinModal !== '14061708') {
            Swal.fire({
                icon: 'error',
                title: 'PIN incorrecto',
                text: 'No tienes permiso para editar este diagnóstico.',
            });
            return;
        }

        try {
            const ref = doc(db, 'clientes', id, 'diagnosticos', diagnosticoSeleccionado.id);
            await updateDoc(ref, {
                diagnostico: formEdicion.diagnostico,
                observaciones: formEdicion.observaciones
            });

            setMostrarModal(false);
            obtenerDiagnosticos();

            Swal.fire({
                icon: 'success',
                title: 'Diagnóstico actualizado',
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: error.message
            });
        }
    };


    useEffect(() => {
        obtenerCliente();
        obtenerDiagnosticos();
    }, []);

    const mostrarNotificacion = (titulo = 'Regresando...', icono = 'info', tiempo = 1800) => {
        Swal.fire({
            position: 'top-end',
            icon: icono,
            title: titulo,
            showConfirmButton: false,
            timer: tiempo,
            toast: true,
            timerProgressBar: true,
            customClass: {
                popup: 'rounded-lg shadow-md text-sm',
                title: 'font-semibold text-gray-700'
            }
        });
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            {cliente && (
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800">Diagnósticos de {cliente.nombre}</h2>
                        <p className="text-gray-600">DNI: {cliente.dni}</p>
                    </div>
                    <button
                        onClick={() => navigate(`/clientes/${id}/historial`)}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition text-sm"
                    >
                        📄 Ver historial completo
                    </button>
                </div>
            )}


            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-md mb-6">
                <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                />

                {/* Selección de especialidad */}
                <select
                    name="especialidad"
                    value={form.especialidad || ''}
                    onChange={(e) => {
                        const especialidad = e.target.value;
                        setForm({ ...form, especialidad, odontologo: '', diagnostico: '' });
                    }}
                    className="border p-2 rounded"
                    required
                >
                    <option value="">Seleccione especialidad</option>
                    <option value="Odontólogo">Odontólogo</option>
                    <option value="Ortodoncista">Ortodoncista</option>
                </select>

                {/* Lista de profesionales */}
                <select
                    name="odontologo"
                    value={form.odontologo}
                    onChange={(e) => setForm({ ...form, odontologo: e.target.value })}
                    className="border p-2 rounded"
                    required
                    disabled={!form.especialidad}
                >
                    <option value="">Seleccione profesional</option>
                    {form.especialidad === 'Odontólogo' && (
                        <>
                            <option value="Dr. Boris Milla">Dr. Boris Milla</option>
                            <option value="Dra. Sadhit Méndez">Dra. Sadhit Méndez</option>
                        </>
                    )}
                    {form.especialidad === 'Ortodoncista' && (
                        <>
                            <option value="Dra. Camila Ruiz">Dra. Camila Ruiz</option>
                            <option value="Dr. Mateo Paredes">Dr. Mateo Paredes</option>
                        </>
                    )}
                </select>

                {/* Diagnóstico clínico sugerido */}
                <select
                    name="diagnostico"
                    value={form.diagnostico}
                    onChange={handleChange}
                    className="border p-2 rounded col-span-full"
                    required
                    disabled={!form.odontologo}
                >
                    <option value="">Seleccione diagnóstico clínico</option>
                    {form.especialidad === 'Odontólogo' && (
                        <>
                            <option value="Caries dental">Caries dental</option>
                            <option value="Pulpite aguda">Pulpite aguda</option>
                            <option value="Absceso periapical">Absceso periapical</option>
                        </>
                    )}
                    {form.especialidad === 'Ortodoncista' && (
                        <>
                            <option value="Maloclusión clase II">Maloclusión clase II</option>
                            <option value="Apiñamiento dental">Apiñamiento dental</option>
                            <option value="Sobremordida">Sobremordida</option>
                        </>
                    )}
                </select>

                {/* Observaciones */}
                <textarea
                    name="observaciones"
                    placeholder="Observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    className="border p-2 rounded col-span-full"
                />

                <button
                    type="submit"
                    className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Registrar diagnóstico
                </button>

            </form>


            <table className="w-full text-left bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-blue-100 text-blue-900">
                    <tr>
                        <th className="px-4 py-2">Fecha</th>
                        <th>Odontólogo</th>
                        <th>Diagnóstico</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                        <th>Tratamientos</th>
                    </tr>
                </thead>
                <tbody>
                    {diagnosticos.map((d) => (
                        <tr key={d.id} className="border-t">
                            <td className="px-4 py-2">
                                {d.fecha?.toDate().toLocaleDateString() ?? '–'}
                            </td>
                            <td>{d.odontologo}</td>
                            <td>{d.diagnostico}</td>
                            <td>{d.observaciones}</td>
                            <td>
                                <button
                                    onClick={() => abrirModal(d)}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                > Editar
                                </button>
                            </td>
                            <td>
                                <button
                                    onClick={() => navigate(`/clientes/${id}/diagnostico/${d.id}/tratamientos`)}
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                                > Ver tratamientos
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4 animate-fadeIn">
                        <h3 className="text-xl font-semibold text-blue-700">Editar diagnóstico</h3>

                        <label className="text-sm font-medium">PIN de seguridad</label>
                        <input
                            type="password"
                            className="w-full border rounded p-2"
                            value={pinModal}
                            onChange={(e) => setPinModal(e.target.value)}
                            placeholder="Ingresa PIN"
                        />

                        <label className="text-sm font-medium">Diagnóstico</label>
                        <input
                            type="text"
                            className="w-full border rounded p-2"
                            value={formEdicion.diagnostico}
                            onChange={(e) => setFormEdicion({ ...formEdicion, diagnostico: e.target.value })}
                            disabled={pinModal !== '14061708'}
                        />

                        <label className="text-sm font-medium">Observaciones</label>
                        <textarea
                            className="w-full border rounded p-2"
                            value={formEdicion.observaciones}
                            onChange={(e) => setFormEdicion({ ...formEdicion, observaciones: e.target.value })}
                            disabled={pinModal !== '14061708'}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                onClick={() => setMostrarModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className={`px-4 py-2 rounded text-white ${pinModal === '14061708' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'
                                    }`}
                                onClick={guardarEdicion}
                            >
                                Guardar
                            </button>
                        </div>

                    </div>

                </div>

            )}
            {/* Botón flotante de regreso */}
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

export default ClienteDiagnostico;
