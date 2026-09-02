import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import Swal from 'sweetalert2';

function PagosPorTratamiento() {
  const { id, diagnosticoId, tratamientoId } = useParams();
  const [tratamiento, setTratamiento] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [form, setForm] = useState({ monto: '' });

  const obtenerTratamiento = async () => {
    const ref = doc(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'tratamientos', tratamientoId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setTratamiento(snap.data());
    }
  };

  const obtenerPagos = async () => {
    const ref = collection(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'tratamientos', tratamientoId, 'pagos');
    const snap = await getDocs(ref);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPagos(data);
  };

  const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);
  const pendiente = tratamiento ? tratamiento.precio - totalPagado : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ref = collection(db, 'clientes', id, 'diagnosticos', diagnosticoId, 'tratamientos', tratamientoId, 'pagos');
    await addDoc(ref, {
      monto: parseFloat(form.monto),
      fecha: Timestamp.now()
    });
    setForm({ monto: '' });
    obtenerPagos();

    Swal.fire({
      icon: 'success',
      title: 'Pago registrado correctamente',
      timer: 1500,
      showConfirmButton: false
    });
  };

  useEffect(() => {
    obtenerTratamiento();
    obtenerPagos();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-blue-800">Pagos del Tratamiento</h2>

      {tratamiento && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <p><strong>Tipo:</strong> {tratamiento.tipo}</p>
          <p><strong>Diente:</strong> {tratamiento.diente}</p>
          <p><strong>Precio total:</strong> S/. {tratamiento.precio.toFixed(2)}</p>
          <p><strong>Total pagado:</strong> S/. {totalPagado.toFixed(2)}</p>
          <p><strong>Pendiente:</strong> S/. {pendiente.toFixed(2)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <input
          type="number"
          name="monto"
          placeholder="Monto del pago (S/.)"
          value={form.monto}
          onChange={(e) => setForm({ monto: e.target.value })}
          className="border p-2 rounded"
          required
          min="0"
          step="0.01"
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded py-2 hover:bg-green-700 transition"
        >
          Registrar pago
        </button>
      </form>

      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-green-100 text-green-900">
          <tr>
            <th className="px-4 py-2">Monto (S/.)</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2">{p.monto.toFixed(2)}</td>
              <td>{p.fecha?.toDate().toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default PagosPorTratamiento;
