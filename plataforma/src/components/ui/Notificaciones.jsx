import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { almacenNotificaciones, cerrarToast } from '../../utils/notificaciones';
import Modal from './Modal';

const ESTILOS_TOAST = {
  exito: { Icono: CircleCheck, borde: 'border-l-oro-500', icono: 'text-oro-600', barra: 'bg-oro-500' },
  error: { Icono: CircleAlert, borde: 'border-l-peligro-600', icono: 'text-peligro-600', barra: 'bg-peligro-600' },
  info: { Icono: Info, borde: 'border-l-tinta-800', icono: 'text-tinta-700', barra: 'bg-tinta-800' },
};

function Toast({ toast }) {
  const { Icono, borde, icono, barra } = ESTILOS_TOAST[toast.tipo];
  return (
    <div
      role={toast.tipo === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto relative flex animate-toast-in items-start gap-3 overflow-hidden rounded-xl border border-l-4 border-arena bg-white p-4 pr-10 shadow-lg ${borde}`}
    >
      <Icono size={20} className={`mt-0.5 shrink-0 ${icono}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-tinta-900">{toast.titulo}</p>
        {toast.descripcion && <p className="mt-0.5 text-xs text-tinta-500">{toast.descripcion}</p>}
      </div>
      <button
        type="button"
        onClick={() => cerrarToast(toast.id)}
        className="absolute top-3 right-3 rounded p-1 text-tinta-400 hover:bg-arena-claro hover:text-tinta-800"
        aria-label="Cerrar aviso"
      >
        <X size={14} />
      </button>
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full origin-left animate-encoger opacity-60 ${barra}`}
        style={{ animationDuration: `${toast.duracion}ms` }}
      />
    </div>
  );
}

function Confirmacion({ confirmacion }) {
  const responder = confirmacion?.responder;
  return (
    <Modal abierto={Boolean(confirmacion)} onCerrar={() => responder(false)}>
      <div className="flex gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-peligro-50 text-peligro-600">
          <TriangleAlert size={22} />
        </span>
        <div className="space-y-1">
          <h3 className="font-semibold text-xl text-tinta-950">{confirmacion?.titulo}</h3>
          {confirmacion?.texto && <p className="text-sm text-tinta-500">{confirmacion.texto}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-secundario" onClick={() => responder(false)}>Cancelar</button>
        <button type="button" className="btn btn-peligro" onClick={() => responder(true)} autoFocus>
          {confirmacion?.textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}

// Se monta una sola vez en App: dibuja los toasts y el diálogo de confirmación.
export default function Notificaciones() {
  const { toasts, confirmacion } = useSyncExternalStore(
    almacenNotificaciones.suscribir,
    almacenNotificaciones.obtener,
  );

  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed top-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
      </div>
      <Confirmacion confirmacion={confirmacion} />
    </>
  );
}
