import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ abierto, titulo, onCerrar, ancho = 'max-w-md', children }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta-950/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof titulo === 'string' ? titulo : undefined}
        className={`w-full ${ancho} max-h-[92vh] animate-fade-in overflow-y-auto rounded-2xl border border-arena bg-white shadow-2xl`}
      >
        {titulo && (
          <div className="flex items-center justify-between gap-4 border-b border-arena px-6 py-4">
            <h3 className="font-semibold text-xl text-tinta-950">{titulo}</h3>
            <button type="button" onClick={onCerrar} className="btn btn-fantasma btn-icono" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="space-y-4 p-6">{children}</div>
      </div>
    </div>
  );
}
