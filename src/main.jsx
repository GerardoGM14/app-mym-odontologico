import './index.css'; // ✅ Estilos de Tailwind
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute.jsx'

// Páginas del sistema
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clientes from './pages/Clientes.jsx'
import ClienteDiagnostico from './pages/ClienteDiagnostico.jsx'
import TratamientosPorDiagnostico from './pages/TratamientosPorDiagnostico.jsx'
import PagosPorTratamiento from './pages/PagosPorTratamiento.jsx'
import OdontogramaDiagnostico from './pages/OdontogramaDiagnostico.jsx'
import OdontogramaAvanzado from './pages/OdontogramaAvanzado.jsx'
import Estadisticas from './pages/Estadisticas.jsx'
import ClienteDetalles from './pages/ClienteDetalles.jsx'
import ClienteHistorial from './pages/ClienteHistorial.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id/diagnostico"
          element={
            <ProtectedRoute>
              <ClienteDiagnostico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id/diagnostico/:diagnosticoId/tratamientos"
          element={
            <ProtectedRoute>
              <TratamientosPorDiagnostico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id/diagnostico/:diagnosticoId/tratamientos/:tratamientoId/pagos"
          element={
            <ProtectedRoute>
              <PagosPorTratamiento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id/diagnostico/:diagnosticoId/odontograma"
          element={
            <ProtectedRoute>
              <OdontogramaDiagnostico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/odontograma-avanzado"
          element={
            <ProtectedRoute>
              <OdontogramaAvanzado />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <ProtectedRoute>
              <Estadisticas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id"
          element={
            <ProtectedRoute>
              <ClienteDetalles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id/historial"
          element={
            <ProtectedRoute>
              <ClienteHistorial />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

