import { ChevronRight, House } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

// Migas de pan: Inicio › Pacientes › Ana Pérez › Diagnósticos
export default function Migas({ migas }) {
  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li className="shrink-0">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-tinta-500 hover:text-oro-700">
            <House size={15} />
            <span className={migas.length === 0 ? 'font-medium text-tinta-900' : 'sr-only'}>Inicio</span>
          </Link>
        </li>
        {migas.map((miga, i) => {
          const ultima = i === migas.length - 1;
          return (
            <Fragment key={`${miga.texto}-${i}`}>
              <li aria-hidden="true" className="shrink-0 text-tinta-300"><ChevronRight size={14} /></li>
              <li className={`min-w-0 ${ultima ? '' : 'hidden sm:block'}`}>
                {ultima || !miga.a ? (
                  <span className={`block truncate ${ultima ? 'font-medium text-tinta-900' : 'text-tinta-500'}`} aria-current={ultima ? 'page' : undefined}>
                    {miga.texto}
                  </span>
                ) : (
                  <Link to={miga.a} className="block max-w-[14rem] truncate text-tinta-500 hover:text-oro-700">{miga.texto}</Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
