import { LoaderCircle } from 'lucide-react';

export default function Cargando({ texto = 'Cargando...', pantallaCompleta = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm text-tinta-500 ${pantallaCompleta ? 'min-h-screen bg-crema' : 'py-16'}`}>
      <LoaderCircle size={20} className="animate-spin text-oro-500" />
      {texto}
    </div>
  );
}
