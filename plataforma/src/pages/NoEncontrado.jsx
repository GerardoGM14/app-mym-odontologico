import { Link } from 'react-router-dom';
import diente from '../assets/diente.png';

export default function NoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-crema p-6 text-center">
      <img src={diente} alt="" className="h-20 w-20 object-contain opacity-80" />
      <p className="text-xs font-semibold tracking-[0.3em] text-oro-700">ERROR 404</p>
      <h1 className="font-bold tracking-tight text-4xl text-tinta-950">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-tinta-500">La dirección que buscas no existe o fue movida.</p>
      <Link to="/dashboard" className="btn btn-primario">Ir al inicio</Link>
    </div>
  );
}
