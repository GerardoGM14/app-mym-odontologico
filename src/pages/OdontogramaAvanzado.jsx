import { useState } from 'react';
import DienteInteractivo from '../components/DienteInteractivo';

export default function OdontogramaAvanzado() {
    const [seleccion, setSeleccion] = useState({});
    const [condicionSeleccionada, setCondicionSeleccionada] = useState('caries');
    const [tratamientos, setTratamientos] = useState([]);
    const condiciones = [
        { code: 'caries', color: 'red', nombre: 'Caries' },
        { code: 'obturacion', color: 'blue', nombre: 'Obturación' },
        { code: 'endodoncia', color: 'green', nombre: 'Endodoncia' },
        { code: 'exodoncia', color: 'black', nombre: 'Exodoncia', icon: '✕' },
        { code: 'fractura', color: 'yellow', nombre: 'Fractura', icon: '/' },
        { code: 'corona', color: 'purple', nombre: 'Corona', icon: '⬒' },
        { code: 'curacion', color: 'gray', nombre: 'Curación', icon: '⚪' }
    ];


    const registrarTratamientos = () => {
        const resultado = Object.entries(seleccion)
            .filter(([_, caras]) =>
                Object.values(caras).some((c) => c !== null)
            )
            .map(([diente, caras]) => ({
                diente,
                ...caras
            }));

        setTratamientos(resultado);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Diente segmentado (demo)</h2>

            {/* Panel de condiciones */}
            <div className="flex flex-wrap gap-3 mb-6">
                {condiciones.map((cond) => (
                    <button
                        key={cond.code}
                        onClick={() => setCondicionSeleccionada(cond.code)}
                        className={`px-3 py-1 rounded border flex items-center gap-2 ${condicionSeleccionada === cond.code ? 'bg-gray-200' : 'bg-white'
                            }`}
                    >
                        {cond.icon ? (
                            <span className="text-lg">{cond.icon}</span>
                        ) : (
                            <span
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: cond.color }}
                            ></span>
                        )}
                        {cond.nombre}
                    </button>
                ))}
            </div>



            {/* Un diente de prueba */}
            <DienteInteractivo
                numero={11}
                seleccion={seleccion}
                setSeleccion={setSeleccion}
                condicionSeleccionada={condicionSeleccionada}
            />

            <button
                onClick={registrarTratamientos}
                className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
                Registrar desde odontograma
            </button>

            {/* Vista previa de tratamientos */}
            {tratamientos.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Resumen de tratamientos registrados:</h3>
                    <table className="w-full border bg-white shadow rounded text-sm">
                        <thead className="bg-blue-100">
                            <tr>
                                <th className="px-2 py-1">Diente</th>
                                <th>Oclusal</th>
                                <th>Mesial</th>
                                <th>Distal</th>
                                <th>Vestibular</th>
                                <th>Lingual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tratamientos.map((t, i) => (
                                <tr key={i} className="border-t text-center">
                                    <td className="px-2 py-1">{t.diente}</td>
                                    <td>{Array.isArray(t.oclusal) ? t.oclusal.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : (t.oclusal || '-')}</td>
                                    <td>{Array.isArray(t.mesial) ? t.mesial.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : (t.mesial || '-')}</td>
                                    <td>{Array.isArray(t.distal) ? t.distal.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : (t.distal || '-')}</td>
                                    <td>{Array.isArray(t.vestibular) ? t.vestibular.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : (t.vestibular || '-')}</td>
                                    <td>{Array.isArray(t.lingual) ? t.lingual.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : (t.lingual || '-')}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

