import { lazy } from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Notificaciones from './components/ui/Notificaciones';
import AuthProvider from './context/AuthProvider';
import Login from './pages/Login';
import NoEncontrado from './pages/NoEncontrado';

// Cada página se descarga solo cuando se visita.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Estadisticas = lazy(() => import('./pages/Estadisticas'));
const Clientes = lazy(() => import('./pages/clientes/Clientes'));
const ClienteDetalles = lazy(() => import('./pages/clientes/ClienteDetalles'));
const ClienteHistorial = lazy(() => import('./pages/clientes/ClienteHistorial'));
const Diagnosticos = lazy(() => import('./pages/diagnosticos/Diagnosticos'));
const OdontogramaDiagnostico = lazy(() => import('./pages/diagnosticos/OdontogramaDiagnostico'));
const Tratamientos = lazy(() => import('./pages/tratamientos/Tratamientos'));
const Pagos = lazy(() => import('./pages/tratamientos/Pagos'));
const Usuarios = lazy(() => import('./pages/usuarios/Usuarios'));

// En Electron la app se abre desde file://, donde solo funciona el enrutado con #.
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/estadisticas" element={<Estadisticas />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:id" element={<ClienteDetalles />} />
              <Route path="/clientes/:id/historial" element={<ClienteHistorial />} />
              <Route path="/clientes/:id/diagnostico" element={<Diagnosticos />} />
              <Route path="/clientes/:id/diagnostico/:diagnosticoId/odontograma" element={<OdontogramaDiagnostico />} />
              <Route path="/clientes/:id/diagnostico/:diagnosticoId/tratamientos" element={<Tratamientos />} />
              <Route path="/clientes/:id/diagnostico/:diagnosticoId/tratamientos/:tratamientoId/pagos" element={<Pagos />} />

              <Route element={<ProtectedRoute soloAdmin />}>
                <Route path="/usuarios" element={<Usuarios />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </Router>
      <Notificaciones />
    </AuthProvider>
  );
}
