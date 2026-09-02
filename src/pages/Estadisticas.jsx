import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collectionGroup, getDocs } from 'firebase/firestore';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    PieChart, Pie, Cell,
    LineChart, Line, CartesianGrid, ResponsiveContainer
} from 'recharts';

const coloresPago = ['#00C49F', '#FFBB28', '#FF8042']; // pagado, en progreso, pendiente

function Estadisticas() {
    const [tratamientosContados, setTratamientosContados] = useState([]);
    const [estadoPagos, setEstadoPagos] = useState([]);
    const [pagosMensuales, setPagosMensuales] = useState([]);
    const [filtro, setFiltro] = useState('todos');

    const cargarLogo = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.warn('⚠️ No se pudo cargar el logo.');
            resolve(null);
          };
          img.src = url;
        });
      };
      
    const exportarPDF = async () => {
        console.log('📸 Iniciando exportación...');

        const original = document.getElementById('contenedor-estadisticas');

        if (!original) {
            alert('No se encontró el contenido a exportar');
            return;
        }

        // Clon para estilos seguros
        const clon = original.cloneNode(true);
        clon.id = 'contenedor-estadisticas-clone';
        clon.style.backgroundColor = '#ffffff';
        clon.style.color = '#000000';
        clon.style.padding = '20px';
        clon.style.boxShadow = 'none';

        Array.from(clon.querySelectorAll('*')).forEach((el) => {
            el.style.color = '#000';
            el.style.backgroundColor = '#fff';
            el.style.boxShadow = 'none';
            el.style.borderColor = '#ddd';
        });

        clon.style.position = 'absolute';
        clon.style.left = '-9999px';
        document.body.appendChild(clon);

        try {
            const canvas = await html2canvas(clon, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/jpg');

            const imgProps = {
                width: canvas.width,
                height: canvas.height,
            };

            const pxToMm = (px) => px * 0.264583;
            const pdfWidth = pxToMm(imgProps.width);
            const pdfHeight = pxToMm(imgProps.height) + 20; // espacio para pie

            const pdf = new jsPDF('landscape', 'mm', [pdfWidth, pdfHeight]);

            // 🧾 Encabezado
            pdf.setFontSize(16);
            pdf.setTextColor(33, 37, 41);
            pdf.text('OdontoSystem - Reporte de Estadísticas', 14, 20);

            // 🖼️ Imagen del contenido
            pdf.addImage(imgData, 'JPG', 10, 30, pdfWidth - 20, pdfHeight - 50);

            // 🕐 Pie con fecha y hora
            const fechaActual = new Date().toLocaleString('es-PE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            });
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Fecha de generación: ${fechaActual}`, 14, pdfHeight - 10);

            // 🖼️ Logo (ubicado en /public/logo-empresa.png)
            const logo = await cargarLogo('/logo-empresa.jpg');
            if (logo) {
                pdf.addImage(logo, 'JPG', pdfWidth - 40, pdfHeight - 18, 25, 12);
            }

            // 💾 Guardar PDF
            pdf.save('estadisticas-odontosystem.pdf');
            console.log('✅ PDF generado con éxito');

        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            alert('Hubo un error al generar el PDF. Revisa los estilos utilizados.');
        } finally {
            document.body.removeChild(clon);
        }
    };


    useEffect(() => {
        obtenerDatos();
    }, []);

    const obtenerDatos = async () => {
        const tratamientosSnap = await getDocs(collectionGroup(db, 'tratamientos'));
        const conteo = {};
        const estados = { pagado: 0, pendiente: 0, 'en progreso': 0 };
        const pagosPorMes = {};

        tratamientosSnap.forEach(doc => {
            const t = doc.data();

            // Filtro opcional
            if (filtro !== 'todos' && t.tipo !== filtro) return;

            // Conteo de tipos
            conteo[t.tipo] = (conteo[t.tipo] || 0) + 1;

            // Estado de tratamiento
            estados[t.estado] = (estados[t.estado] || 0) + 1;
        });

        setTratamientosContados(Object.entries(conteo).map(([tipo, cantidad]) => ({ tipo, cantidad })));
        setEstadoPagos(Object.entries(estados).map(([estado, valor]) => ({ estado, valor })));

        const pagosSnap = await getDocs(collectionGroup(db, 'pagos'));
        pagosSnap.forEach(doc => {
            const p = doc.data();
            const fecha = p.fecha.toDate();
            const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
            pagosPorMes[key] = (pagosPorMes[key] || 0) + parseFloat(p.monto || 0);
        });

        const resultadoMensual = Object.entries(pagosPorMes).map(([mes, monto]) => ({ mes, monto }));
        setPagosMensuales(resultadoMensual);
    };

    useEffect(() => {
        obtenerDatos();
    }, [filtro]);

    return (

        <div id="contenedor-estadisticas" className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-blue-800">📊 Estadísticas del sistema</h2>
                <button
                    onClick={exportarPDF}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                >
                    📄 Exportar PDF
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 mb-4">
                {['todos', 'Ortodoncia', 'Endodoncia', 'Obturación', 'Prótesis', 'Limpieza'].map((tipo) => (
                    <button
                        key={tipo}
                        onClick={() => setFiltro(tipo)}
                        className={`px-3 py-1 rounded-full text-sm ${filtro === tipo
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                            }`}
                    >
                        {tipo}
                    </button>
                ))}
            </div>

            {/* Grillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico 1: Tratamientos más comunes */}
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">🦷 Tratamientos más realizados</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={tratamientosContados}>
                            <XAxis dataKey="tipo" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="cantidad" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico 2: Estados de tratamientos */}
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">📌 Estado de los tratamientos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={estadoPagos}
                                dataKey="valor"
                                nameKey="estado"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {estadoPagos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={coloresPago[index % coloresPago.length]} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico 3: Pagos mensuales */}
                <div className="bg-gray-100 p-4 rounded shadow col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">💵 Pagos mensuales (S/.)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={pagosMensuales}>
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="monto" stroke="#10B981" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Estadisticas;

