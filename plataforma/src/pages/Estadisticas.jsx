import { FileDown } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import logo from '../assets/logo-horizontal.jpg';
import EncabezadoPagina from '../components/ui/EncabezadoPagina';
import Estado from '../components/ui/Estado';
import { ESTADOS_PAGO, TIPOS_TRATAMIENTO } from '../config/catalogos';
import { useDatos } from '../hooks/useDatos';
import { obtenerDatosEstadisticas } from '../services/estadisticas';
import { formatearSoles } from '../utils/dinero';
import { calcularEstadisticas } from '../utils/estadisticas';
import { exportarElementoAPdf } from '../utils/exportarPdf';
import { avisoError, avisoExito } from '../utils/notificaciones';

// Colores de la marca (los mismos valores que los tokens de index.css).
const COLOR = { oro: '#b89058', oroClaro: '#d6b98c', negro: '#171717', texto: '#6b6862', linea: '#e9e2d6' };

const COLORES_ESTADO = {
  [ESTADOS_PAGO.pagado]: COLOR.oro,
  [ESTADOS_PAGO.enProgreso]: COLOR.oroClaro,
  [ESTADOS_PAGO.pendiente]: COLOR.negro,
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const ejes = { tick: { fill: COLOR.texto, fontSize: 12 }, axisLine: { stroke: COLOR.linea }, tickLine: false };
const estiloTooltip = {
  contentStyle: { borderRadius: 10, border: `1px solid ${COLOR.linea}`, fontSize: 13 },
  cursor: { fill: '#faf6ef' },
};

function Grafico({ titulo, children, className = '' }) {
  return (
    <div className={`tarjeta ${className}`}>
      <h3 className="mb-4 font-semibold text-lg text-tinta-950">{titulo}</h3>
      {children}
    </div>
  );
}

export default function Estadisticas() {
  const { datos, cargando, error, recargar } = useDatos(obtenerDatosEstadisticas, []);
  const [filtro, setFiltro] = useState('todos');
  const [exportando, setExportando] = useState(false);
  const contenedor = useRef(null);

  // Los datos se leen una sola vez; el filtro se aplica en memoria.
  const estadisticas = useMemo(() => (datos ? calcularEstadisticas(datos, filtro) : null), [datos, filtro]);
  // El gráfico circular solo muestra los estados que tienen tratamientos.
  const estadosConDatos = estadisticas?.porEstado.filter((e) => e.valor > 0) ?? [];

  const exportar = async () => {
    setExportando(true);
    try {
      await exportarElementoAPdf(contenedor.current, {
        titulo: `Milla & Mendez - Reporte de Estadísticas (${filtro})`,
        archivo: 'estadisticas-milla-mendez.pdf',
        logoUrl: logo,
      });
      avisoExito('PDF generado');
    } catch (err) {
      avisoError('Hubo un error al generar el PDF.', err);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div>
      <EncabezadoPagina titulo="Estadísticas" subtitulo="Tratamientos, estados de pago e ingresos de la clínica." migas={[{ texto: 'Estadísticas' }]}>
        <button type="button" onClick={exportar} disabled={!estadisticas || exportando} className="btn btn-primario">
          <FileDown size={16} />{exportando ? 'Generando...' : 'Exportar PDF'}
        </button>
      </EncabezadoPagina>

      <div className="mb-6 flex flex-wrap gap-2">
        {['todos', ...TIPOS_TRATAMIENTO].map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setFiltro(tipo)}
            className={`h-8 rounded-full border px-3.5 text-xs font-semibold capitalize transition-colors ${filtro === tipo ? 'border-tinta-900 bg-tinta-900 text-white' : 'border-arena bg-white text-tinta-600 hover:border-oro-300 hover:text-tinta-900'}`}
          >
            {tipo}
          </button>
        ))}
      </div>

      <Estado cargando={cargando} error={error} recargar={recargar}>
        {estadisticas && (
          <div ref={contenedor} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Grafico titulo="Tratamientos más realizados">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={estadisticas.porTipo}>
                  <CartesianGrid vertical={false} stroke={COLOR.linea} />
                  <XAxis dataKey="tipo" {...ejes} />
                  <YAxis allowDecimals={false} {...ejes} />
                  <Tooltip {...estiloTooltip} />
                  <Bar dataKey="cantidad" name="Cantidad" fill={COLOR.oro} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </Grafico>

            <Grafico titulo="Estado de pago de los tratamientos">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={estadosConDatos} dataKey="valor" nameKey="estado" cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={estadosConDatos.length > 1 ? 2 : 0} label>
                    {estadosConDatos.map((e) => <Cell key={e.estado} fill={COLORES_ESTADO[e.estado] ?? COLOR.texto} />)}
                  </Pie>
                  <Tooltip {...estiloTooltip} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} formatter={capitalizar} />
                </PieChart>
              </ResponsiveContainer>
            </Grafico>

            <Grafico titulo="Pagos mensuales (S/.)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={estadisticas.porMes}>
                  <CartesianGrid vertical={false} stroke={COLOR.linea} />
                  <XAxis dataKey="mes" {...ejes} />
                  <YAxis {...ejes} />
                  <Tooltip {...estiloTooltip} formatter={(valor) => formatearSoles(valor)} />
                  <Line type="monotone" dataKey="monto" name="Monto" stroke={COLOR.negro} strokeWidth={2.5} dot={{ r: 4, fill: COLOR.oro, stroke: COLOR.oro }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Grafico>
          </div>
        )}
      </Estado>
    </div>
  );
}
