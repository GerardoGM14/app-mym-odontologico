import { useEffect, useState } from 'react';
import {
    registrarCliente,
    obtenerClientes,
    actualizarCliente,
    eliminarCliente
} from '../services/clientes';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Clientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ nombre: '', dni: '', correo: '', telefono: '' });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);

    const obtenerDatos = async () => {
        const data = await obtenerClientes();
        setClientes(data);
    };

    useEffect(() => {
        obtenerDatos();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.dni.length !== 8) {
            alert("El DNI debe tener exactamente 8 dígitos.");
            return;
        }

        if (!/^9\d{8}$/.test(form.telefono)) {
            alert("El teléfono debe tener exactamente 9 dígitos y comenzar con 9.");
            return;
        }

        try {
            if (modoEdicion) {
                await actualizarCliente(idEditar, form);
                setModoEdicion(false);
                setIdEditar(null);
            } else {
                await registrarCliente(form);
            }
            setForm({ nombre: '', dni: '', correo: '', telefono: '' });
            obtenerDatos();
        } catch (error) {
            alert("Hubo un error al guardar el cliente.");
            console.error(error);
        }
    };

    const handleEditar = (cliente) => {
        setModoEdicion(true);
        setIdEditar(cliente.id);
        setForm({
            nombre: cliente.nombre,
            dni: cliente.dni,
            correo: cliente.correo,
            telefono: cliente.telefono
        });
    };

    const handleEliminar = async (id) => {
        if (confirm("¿Eliminar cliente?")) {
            await eliminarCliente(id);
            obtenerDatos();
        }
    };

    const regresarDashboard = () => {
        Swal.fire({
            icon: 'info',
            title: 'Regresando...',
            toast: true,
            position: 'bottom-start',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
        });
        setTimeout(() => navigate('/dashboard'), 1300);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto relative">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Gestión de Clientes</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-md mb-6">
                <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="border p-2 rounded" required />
                <input
                    name="dni"
                    placeholder="DNI"
                    value={form.dni}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,8}$/.test(value) || value === "") {
                            setForm({ ...form, dni: value });
                        }
                    }}
                    className="border p-2 rounded"
                    required
                    maxLength={8}
                />
                <input name="correo" type="email" placeholder="Correo" value={form.correo} onChange={handleChange} className="border p-2 rounded" />
                <input
                    name="telefono"
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^9\d{0,8}$/.test(value) || value === "") {
                            setForm({ ...form, telefono: value });
                        }
                    }}
                    className="border p-2 rounded"
                    required
                    maxLength={9}
                />
                <button
                    type="submit"
                    className="col-span-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                    {modoEdicion ? "Actualizar Cliente" : "Registrar Cliente"}
                </button>
            </form>

            <table className="w-full text-left bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-blue-200 text-blue-900">
                    <tr>
                        <th className="px-4 py-2">Nombre</th>
                        <th>DNI</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((c) => (
                        <tr key={c.id} className="border-t text-sm">
                            <td className="px-4 py-2">{c.nombre}</td>
                            <td>{c.dni}</td>
                            <td>{c.correo}</td>
                            <td>{c.telefono}</td>
                            <td className="space-x-1">
                                <button
                                    onClick={() => handleEditar(c)}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                >Editar</button>
                                <button
                                    onClick={() => handleEliminar(c.id)}
                                    className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                                >Eliminar</button>
                                <button
                                    onClick={() => navigate(`/clientes/${c.id}`)}
                                    className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                                >Detalles</button>
                                <button
                                    onClick={() => navigate(`/clientes/${c.id}/diagnostico`)}
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                                >Diagnóstico</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Botón de regreso al Dashboard */}
            <button
                onClick={regresarDashboard}
                className="fixed bottom-6 left-6 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition"
            >
                ⬅️ Volver al inicio
            </button>
        </div>
    );
}

export default Clientes;

