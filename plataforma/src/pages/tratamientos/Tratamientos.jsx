import { Plus, Smile, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OdontogramaModal from '../../components/odontograma/OdontogramaModal';
import PlacaModal from '../../components/odontograma/PlacaModal';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import Estado from '../../components/ui/Estado';
import EstadoPago from '../../components/ui/EstadoPago';
import { TIPOS_TRATAMIENTO } from '../../config/catalogos';
import { useDatos } from '../../hooks/useDatos';
import { obtenerCliente } from '../../services/clientes';
import { obtenerDiagnostico } from '../../services/diagnosticos';
import { obtenerTratamientos, registrarTratamiento } from '../../services/tratamientos';
import { formatearSoles } from '../../utils/dinero';
import { mensajeError } from '../../utils/errores';
import { formatearFechaCalendario } from '../../utils/fechas';
import { migaCliente, migaPacientes } from '../../utils/migas';
import { avisoError, avisoExito, avisoInfo } from '../../utils/notificaciones';
import { leerDetalle, seleccionADetalle, sugerirTipoTratamiento } from '../../utils/odontograma';

const FORM_VACIO = { tipo: '', diente: '', precio: '', detalle: [] };

export default function Tratamientos() {
  const { id, diagnosticoId } = useParams();
  const { datos, cargando, error, recargar } = useDatos(
    () => Promise.all([
      obtenerCliente(id),
      obtenerDiagnostico(id, diagnosticoId),
      obtenerTratamientos(id, diagnosticoId),
    ]),
    [id, diagnosticoId],
  );
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [odontogramaAbierto, setOdontogramaAbierto] = useState(false);
  const [placa, setPlaca] = useState(null);

  const [cliente, diagnostico, tratamientos] = datos ?? [null, null, []];

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const usarOdontograma = (seleccion) => {
    const sugerido = sugerirTipoTratamiento(seleccion);
    setForm((f) => ({
      ...f,
      diente: Object.keys(seleccion).join(', '),
      tipo: sugerido || f.tipo,
      detalle: seleccionADetalle(seleccion),
    }));
    if (sugerido) avisoInfo('Tratamiento sugerido', sugerido);
  };

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await registrarTratamiento(id, diagnosticoId, form);
      avisoExito('Tratamiento registrado', form.tipo);
      setForm(FORM_VACIO);
      recargar();
    } catch (err) {
      avisoError(mensajeError(err, 'No se pudo registrar el tratamiento.'), err);
    } finally {
      setGuardando(false);
    }
  };

  const verPlaca = (tratamiento) => {
    const dientes = leerDetalle(tratamiento.detalle);
    if (dientes.length === 0) {
      avisoInfo('Sin datos de odontograma', 'Este tratamiento se registró sin seleccionar dientes.');
      return;
    }
    setPlaca({ tratamiento: tratamiento.tipo, dientes });
  };

  return (
    <div>
      <EncabezadoPagina
        titulo={diagnostico?.diagnostico ?? 'Tratamientos'}
        subtitulo={diagnostico ? `${formatearFechaCalendario(diagnostico.fecha)} · ${diagnostico.odontologo}` : undefined}
        migas={[migaPacientes, migaCliente(id, cliente), { texto: diagnostico?.diagnostico ?? '…' }, { texto: 'Tratamientos' }]}
      />

      <Estado cargando={cargando && !datos} error={error} recargar={recargar} vacio={datos && !diagnostico} mensajeVacio="Diagnóstico no encontrado.">
        <form onSubmit={registrar} className="tarjeta mb-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-arena pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-oro-50 text-oro-700"><Plus size={18} /></span>
            <h2 className="font-semibold text-lg text-tinta-950">Nuevo tratamiento</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.4fr_1fr]">
            <div>
              <label htmlFor="tipo" className="etiqueta">Tipo</label>
              <select id="tipo" value={form.tipo} onChange={(e) => cambiar('tipo', e.target.value)} required className="campo">
                <option value="">Seleccione</option>
                {TIPOS_TRATAMIENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="diente" className="etiqueta">Dientes</label>
              <div className="flex gap-2">
                <input id="diente" placeholder="Ej. 11, 26" value={form.diente} onChange={(e) => cambiar('diente', e.target.value)} className="campo" />
                <button type="button" onClick={() => setOdontogramaAbierto(true)} className="btn btn-suave shrink-0">
                  <Smile size={16} />Odontograma
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="precio" className="etiqueta">Precio (S/.)</label>
              <input
                id="precio"
                type="number"
                placeholder="0.00"
                value={form.precio}
                onChange={(e) => cambiar('precio', e.target.value)}
                required
                min="0"
                step="0.01"
                className="campo"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={guardando} className="btn btn-primario">
              {guardando ? 'Guardando...' : 'Registrar tratamiento'}
            </button>
          </div>
        </form>

        {tratamientos.length === 0 ? (
          <p className="vacio">Aún no hay tratamientos para este diagnóstico.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Tratamiento</th>
                  <th>Dientes</th>
                  <th>Precio</th>
                  <th>Pagado</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tratamientos.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium text-tinta-900">{t.tipo}</td>
                    <td>{t.diente || '–'}</td>
                    <td className="tabular-nums">{formatearSoles(t.precio)}</td>
                    <td className="tabular-nums">{formatearSoles(t.pagado)}</td>
                    <td><EstadoPago estado={t.estado} /></td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/clientes/${id}/diagnostico/${diagnosticoId}/tratamientos/${t.id}/pagos`}
                          className="btn btn-suave btn-chico"
                        >
                          <Wallet size={14} />Pagos
                        </Link>
                        <button type="button" onClick={() => verPlaca(t)} className="btn btn-secundario btn-chico">
                          <Smile size={14} />Placa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Estado>

      <OdontogramaModal abierto={odontogramaAbierto} onCerrar={() => setOdontogramaAbierto(false)} onSeleccionar={usarOdontograma} />
      <PlacaModal datos={placa} onCerrar={() => setPlaca(null)} />
    </div>
  );
}
