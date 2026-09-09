import { ESTADOS_PAGO } from '../../config/catalogos';

const ESTILOS = {
  [ESTADOS_PAGO.pagado]: 'bg-exito-50 text-exito-700 ring-exito-700/20',
  [ESTADOS_PAGO.enProgreso]: 'bg-oro-50 text-oro-800 ring-oro-500/30',
  [ESTADOS_PAGO.pendiente]: 'bg-peligro-50 text-peligro-700 ring-peligro-600/20',
};

export default function EstadoPago({ estado }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ESTILOS[estado] ?? 'bg-tinta-50 text-tinta-600 ring-tinta-200'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : '–'}
    </span>
  );
}
