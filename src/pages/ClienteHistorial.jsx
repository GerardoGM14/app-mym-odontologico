import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  doc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import Swal from 'sweetalert2';

function ClienteHistorial() {
  const { id } = useParams(); // id del cliente
  const [cliente, setCliente] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    const refCliente = doc(db, 'clientes', id);
    const snapCliente = await getDoc(refCliente);

    if (snapCliente.exists()) {
      setCliente(snapCliente.data());
    }

    const refDiagnosticos = collection(db, 'clientes', id, 'diagnosticos');
    const snapDiagnosticos = await getDocs(refDiagnosticos);
    const listaDiagnosticos = [];

    for (const d of snapDiagnosticos.docs) {
      const diagnostico = { id: d.id, ...d.data() };

      const refTratamientos = collection(db, 'clientes', id, 'diagnosticos', d.id, 'tratamientos');
      const snapTratamientos = await getDocs(refTratamientos);
      diagnostico.tratamientos = [];

      for (const t of snapTratamientos.docs) {
        const tratamiento = { id: t.id, ...t.data() };

        const refPagos = collection(db, 'clientes', id, 'diagnosticos', d.id, 'tratamientos', t.id, 'pagos');
        const snapPagos = await getDocs(refPagos);

        tratamiento.pagos = snapPagos.docs.map(p => p.data());
        diagnostico.tratamientos.push(tratamiento);
      }

      listaDiagnosticos.push(diagnostico);
    }

    setDiagnosticos(listaDiagnosticos);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {cliente && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            Historial clínico de {cliente.nombre}
          </h2>
          <p className="text-gray-600">DNI: {cliente.dni}</p>
        </div>
      )}

      {diagnosticos.map((diag) => (
        <div key={diag.id} className="bg-gray-50 p-4 rounded shadow space-y-3 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-blue-700">
                🗓️ {diag.fecha?.toDate().toLocaleDateString()}
              </h3>
              <p><strong>Especialidad:</strong> {diag.especialidad}</p>
              <p><strong>Profesional:</strong> {diag.odontologo}</p>
              <p><strong>Diagnóstico:</strong> {diag.diagnostico}</p>
              <p className="text-gray-700"><strong>Observaciones:</strong> {diag.observaciones || '–'}</p>
            </div>
          </div>

          {/* Tratamientos */}
          {diag.tratamientos.length > 0 && (
            <div className="mt-2">
              <h4 className="text-md font-bold text-green-800">💊 Tratamientos:</h4>
              <table className="w-full mt-2 text-sm border bg-white rounded overflow-hidden shadow">
                <thead className="bg-green-100 text-green-900">
                  <tr>
                    <th className="px-2 py-1">Tipo</th>
                    <th>Diente</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Pagos</th>
                  </tr>
                </thead>
                <tbody>
                  {diag.tratamientos.map((t) => {
                    const totalPagado = t.pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
                    return (
                      <tr key={t.id} className="border-t text-center">
                        <td>{t.tipo}</td>
                        <td>{t.diente}</td>
                        <td>S/. {parseFloat(t.precio).toFixed(2)}</td>
                        <td className={`capitalize ${t.estado === 'pagado' ? 'text-green-600' : t.estado === 'pendiente' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {t.estado}
                        </td>
                        <td>
                          <ul className="list-disc ml-4 text-left">
                            {t.pagos.length > 0 ? (
                              t.pagos.map((p, i) => (
                                <li key={i}>
                                  S/. {parseFloat(p.monto).toFixed(2)} — {p.fecha?.toDate().toLocaleDateString()}
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500 italic">Sin pagos</li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
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

export default ClienteHistorial;
