export default function PlacaModal({ visible, onClose, datos }) {
    if (!visible || !datos) return null;
  
    const tratamiento = datos.tratamiento || '';
    const dientes = datos.dientes || [];
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-blue-800 mb-4">🦷 Placa del tratamiento: <span className="capitalize">{tratamiento}</span></h2>
  
          <table className="w-full text-sm border shadow rounded bg-white">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-2">Diente</th>
                <th>Oclusal</th>
                <th>Mesial</th>
                <th>Distal</th>
                <th>Vestibular</th>
                <th>Lingual</th>
              </tr>
            </thead>
            <tbody>
              {dientes.map((diente, i) => (
                <tr key={i} className="border-t text-center">
                  <td className="p-2 font-semibold">{diente.numero}</td>
                  <td>{diente.oclusal || '-'}</td>
                  <td>{diente.mesial || '-'}</td>
                  <td>{diente.distal || '-'}</td>
                  <td>{diente.vestibular || '-'}</td>
                  <td>{diente.lingual || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
  
          <div className="text-right mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }
  