import { useMigas } from '../../context/migas';

// Título de la página, botones de acción y migas de pan (se ven en la barra superior).
export default function EncabezadoPagina({ titulo, subtitulo, migas = [], children }) {
  useMigas(migas);

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-bold tracking-tight text-3xl leading-tight text-tinta-950">{titulo}</h1>
        <div className="mt-3 h-0.5 w-12 rounded-full bg-oro-500" />
        {subtitulo && <p className="mt-3 text-sm text-tinta-500">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
