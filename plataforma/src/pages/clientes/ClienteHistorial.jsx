import { CalendarDays } from 'lucide-react';
import { useParams } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import EstadoPago from '../../components/ui/EstadoPago';
import { useDatos } from '../../hooks/useDatos';
import { obtenerHistorialCliente } from '../../services/diagnosticos';
import { formatearSoles, sumarSoles } from '../../utils/dinero';
import { formatearFecha, formatearFechaCalendario } from '../../utils/fechas';
import { migaCliente, migaPacientes } from '../../utils/migas';

function Resumen({ etiqueta, valor, clase = 'text-tinta-950' }) {
  return (
    <div className="tarjeta">
      <p className="text-xs font-semibold tracking-wider text-tinta-500 uppercase">{etiqueta}</p>
      <p className={`mt-2 font-bold text-3xl ${clase}`}>{valor}</p>
    </div>
  );
}

export default function ClienteHistorial() {
  const { id } = useParams();
  const { datos, cargando, error, recargar } = useDatos(() => obtenerHistorialCliente(id), [id]);

  const cliente = datos?.cliente;
  const diagnosticos = datos?.diagnosticos ?? [];
  const tratamientos = diagnosticos.flatMap((d) => d.tratamientos);
  const totalPagado = sumarSoles(tratamientos.map((t) => t.pagado));
  const totalPendiente = sumarSoles(tratamientos.map((t) => t.pendiente));

  return (
    <div>
      <EncabezadoPagina
        titulo="Historial clínico"
        subtitulo={cliente ? `${cliente.nombre} · DNI ${cliente.dni}` : undefined}
        migas={[migaPacientes, migaCliente(id, cliente), { texto: 'Historial' }]}
      />

      <Estado cargando={cargando} error={error} recargar={recargar} vacio={!cliente} mensajeVacio="Paciente no encontrado.">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Resumen etiqueta="Diagnósticos" valor={diagnosticos.length} />
          <Resumen etiqueta="Total pagado" valor={formatearSoles(totalPagado)} clase="text-oro-700" />
          <Resumen etiqueta="Saldo pendiente" valor={formatearSoles(totalPendiente)} clase="text-peligro-700" />
        </div>

        {diagnosticos.length === 0 && <p className="vacio">Este paciente aún no tiene diagnósticos.</p>}

        {/* Línea de tiempo de diagnósticos */}
        <ol className="relative space-y-6 border-l border-arena pl-6 md:ml-2">
          {diagnosticos.map((diag) => (
            <li key={diag.id} className="relative">
              <span className="absolute top-6 -left-[31px] h-3 w-3 rounded-full border-2 border-crema bg-oro-500 ring-1 ring-oro-300" />
              <article className="tarjeta space-y-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-oro-700 uppercase">
                      <CalendarDays size={14} />{formatearFechaCalendario(diag.fecha)}
                    </p>
                    <h3 className="mt-1 font-semibold text-xl text-tinta-950">{diag.diagnostico}</h3>
                  </div>
                  <p className="text-right text-sm text-tinta-500">
                    {diag.odontologo}
                    {diag.especialidad && <span className="block text-xs">{diag.especialidad}</span>}
                  </p>
                </header>
                {diag.observaciones && <p className="rounded-lg bg-arena-claro px-4 py-3 text-sm text-tinta-700">{diag.observaciones}</p>}

                {diag.tratamientos.length > 0 && (
                  <div className="tabla-contenedor shadow-none">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Tratamiento</th>
                          <th>Diente</th>
                          <th>Precio</th>
                          <th>Pagado</th>
                          <th>Estado</th>
                          <th>Pagos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diag.tratamientos.map((t) => (
                          <tr key={t.id}>
                            <td className="font-medium text-tinta-900">{t.tipo}</td>
                            <td>{t.diente || '–'}</td>
                            <td className="tabular-nums">{formatearSoles(t.precio)}</td>
                            <td className="tabular-nums">{formatearSoles(t.pagado)}</td>
                            <td><EstadoPago estado={t.estado} /></td>
                            <td className="text-xs text-tinta-600">
                              {t.pagos.length > 0 ? (
                                <ul className="space-y-0.5">
                                  {t.pagos.map((p) => (
                                    <li key={p.id} className="tabular-nums">{formatearSoles(p.monto)} · {formatearFecha(p.fecha)}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="italic">Sin pagos</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      </Estado>
    </div>
  );
}
