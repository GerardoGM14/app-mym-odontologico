import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Odontograma from '../../components/odontograma/Odontograma';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import { DENTICIONES } from '../../config/odontograma';
import { useDatos } from '../../hooks/useDatos';
import { obtenerCliente } from '../../services/clientes';
import { guardarOdontograma, obtenerDiagnostico, obtenerOdontograma } from '../../services/diagnosticos';
import { mensajeError } from '../../utils/errores';
import { migaCliente, migaDiagnostico, migaPacientes } from '../../utils/migas';
import { avisoError, avisoExito } from '../../utils/notificaciones';
import { limpiarSeleccion, normalizarOdontograma } from '../../utils/odontograma';

// Odontograma del diagnóstico: estado de la boca del paciente en esa consulta.
export default function OdontogramaDiagnostico() {
  const { id, diagnosticoId } = useParams();
  const { datos, cargando, error, recargar } = useDatos(
    () => Promise.all([obtenerCliente(id), obtenerDiagnostico(id, diagnosticoId), obtenerOdontograma(id, diagnosticoId)]),
    [id, diagnosticoId],
  );
  const [dientes, setDientes] = useState({});
  const [denticion, setDenticion] = useState('adulto');
  const [guardando, setGuardando] = useState(false);

  const [cliente, diagnostico, guardado] = datos ?? [];

  useEffect(() => {
    if (!guardado) return;
    const normalizado = normalizarOdontograma(guardado);
    setDientes(normalizado.dientes);
    setDenticion(normalizado.denticion);
  }, [guardado]);

  const guardar = async () => {
    setGuardando(true);
    try {
      await guardarOdontograma(id, diagnosticoId, { denticion, dientes: limpiarSeleccion(dientes) });
      avisoExito('Odontograma guardado');
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo guardar el odontograma.'), err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Odontograma"
        subtitulo={diagnostico ? `${diagnostico.diagnostico} · ${cliente?.nombre ?? ''}` : undefined}
        migas={[migaPacientes, migaCliente(id, cliente), migaDiagnostico(id, diagnosticoId, diagnostico), { texto: 'Odontograma' }]}
      >
        <select value={denticion} onChange={(e) => setDenticion(e.target.value)} className="campo w-auto" aria-label="Dentición">
          {Object.entries(DENTICIONES).map(([valor, { nombre }]) => <option key={valor} value={valor}>{nombre}</option>)}
        </select>
        <button type="button" onClick={guardar} disabled={guardando || cargando} className="btn btn-primario">
          <Save size={16} />{guardando ? 'Guardando...' : 'Guardar odontograma'}
        </button>
      </EncabezadoPagina>

      <Estado cargando={cargando} error={error} recargar={recargar}>
        <div className="tarjeta">
          <Odontograma valor={dientes} onCambiar={setDientes} denticion={denticion} />
        </div>
      </Estado>
    </div>
  );
}
