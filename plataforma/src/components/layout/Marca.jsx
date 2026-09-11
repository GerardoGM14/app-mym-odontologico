import dienteClaro from '../../assets/diente-claro.png';

// Marca para fondos oscuros: diente dorado/crema + nombre de la clínica.
export default function Marca({ compacta = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img src={dienteClaro} alt="Milla & Mendez" className="h-9 w-9 shrink-0 object-contain" />
      {!compacta && (
        <div className="min-w-0 leading-none">
          <p className="truncate font-serif text-lg text-white">
            Milla <span className="text-oro-400">&amp;</span> Mendez
          </p>
          <p className="mt-1.5 text-[9px] font-medium tracking-[0.2em] whitespace-nowrap text-oro-400">ODONTOLOGÍA INTEGRAL</p>
        </div>
      )}
    </div>
  );
}
