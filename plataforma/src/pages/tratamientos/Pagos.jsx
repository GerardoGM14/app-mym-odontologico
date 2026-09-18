import { CircleCheck, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import EstadoPago from '../../components/ui/EstadoPago';
import { ESTADOS_PAGO } from '../../config/catalogos';
import { useDatos } from '../../hooks/useDatos';
import { obtenerCliente } from '../../services/clientes';
import { obtenerDiagnostico } from '../../services/diagnosticos';
import { obtenerTratamiento, registrarPago } from '../../services/tratamientos';
import { aCentimos, formatearSoles } from '../../utils/dinero';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/fechas';
import { migaCliente, migaDiagnostico, migaPacientes } from '../../utils/migas';
import { avisoError, avisoExito } from '../../utils/notificaciones';

function Cifra({ etiqueta, valor, clase = 'text-tinta-950' }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-tinta-500 uppercase">{etiqueta}</p>
      <p className={`mt-1 font-bold text-2xl tabular-nums ${clase}`}>{valor}</p>
    </div>
  );
}

export default function Pagos() {
  const { id, diagnosticoId, tratamientoId } = useParams();
  const { datos, cargando, error, recargar } = useDatos(
    () => Promise.all([
      obtenerCliente(id),
      obtenerDiagnostico(id, diagnosticoId),
      obtenerTratamiento(id, diagnosticoId, tratamientoId),
    ]),
    [id, diagnosticoId, tratamientoId],
  );
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [cliente, diagnostico, tratamiento] = datos ?? [];

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await registrarPago(id, diagnosticoId, tratamiento, monto);
      avisoExito('Pago registrado', formatearSoles(monto));
      setMonto('');
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo registrar el pago.'), err);
    } finally {
      setGuardando(false);
    }
  };

  const pagado = tratamiento?.estado === ESTADOS_PAGO.pagado;
  const avance = tratamiento && aCentimos(tratamiento.precio) > 0
    ? Math.min(100, Math.round((aCentimos(tratamiento.pagado) / aCentimos(tratamiento.precio)) * 100))
    : 100;

  return (
    <div>
      <EncabezadoPagina
        titulo={tratamiento ? `Pagos · ${tratamiento.tipo}` : 'Pagos'}
        subtitulo={tratamiento?.diente ? `Dientes: ${tratamiento.diente}` : undefined}
        migas={[migaPacientes, migaCliente(id, cliente), migaDiagnostico(id, diagnosticoId, diagnostico), { texto: 'Pagos' }]}
      />

      <Estado cargando={cargando && !datos} error={error} recargar={recargar} vacio={datos && !tratamiento} mensajeVacio="Tratamiento no encontrado.">
        {tratamiento && (
          <>
            <div className="tarjeta mb-6 space-y-5">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <Cifra etiqueta="Precio total" valor={formatearSoles(tratamiento.precio)} />
                <Cifra etiqueta="Pagado" valor={formatearSoles(tratamiento.pagado)} clase="text-oro-700" />
                <Cifra etiqueta="Pendiente" valor={formatearSoles(tratamiento.pendiente)} clase={pagado ? 'text-tinta-400' : 'text-peligro-700'} />
                <div>
                  <p className="text-xs font-semibold tracking-wider text-tinta-500 uppercase">Estado</p>
                  <div className="mt-2"><EstadoPago estado={tratamiento.estado} /></div>
                </div>
              </div>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-arena-claro">
                  <div className="h-full rounded-full bg-oro-500 transition-[width] duration-500" style={{ width: `${avance}%` }} />
                </div>
                <p className="mt-1.5 text-right text-xs text-tinta-500 tabular-nums">{avance}% pagado</p>
              </div>
            </div>

            {pagado ? (
              <p className="mb-6 flex items-center gap-3 rounded-xl border border-exito-700/20 bg-exito-50 px-5 py-4 text-sm font-medium text-exito-700">
                <CircleCheck size={18} /> Este tratamiento ya está pagado por completo.
              </p>
            ) : (
              <form onSubmit={registrar} className="tarjeta mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="monto" className="etiqueta">Monto del pago (S/.)</label>
                  <input
                    id="monto"
                    type="number"
                    placeholder={`Máximo ${tratamiento.pendiente.toFixed(2)}`}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="campo"
                    required
                    min="0.01"
                    max={tratamiento.pendiente}
                    step="0.01"
                  />
                </div>
                <button type="button" onClick={() => setMonto(String(tratamiento.pendiente))} className="btn btn-secundario">
                  Saldo completo
                </button>
                <button type="submit" disabled={guardando} className="btn btn-oro">
                  <Receipt size={16} />{guardando ? 'Guardando...' : 'Registrar pago'}
                </button>
              </form>
            )}

            {tratamiento.pagos.length > 0 ? (
              <div className="tabla-contenedor">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th className="text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tratamiento.pagos.map((p, i) => (
                      <tr key={p.id}>
                        <td className="text-tinta-400 tabular-nums">{i + 1}</td>
                        <td className="tabular-nums">{formatearFecha(p.fecha)}</td>
                        <td className="text-right font-medium text-tinta-900 tabular-nums">{formatearSoles(p.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="vacio">Aún no hay pagos registrados.</p>
            )}
          </>
        )}
      </Estado>
    </div>
  );
}
