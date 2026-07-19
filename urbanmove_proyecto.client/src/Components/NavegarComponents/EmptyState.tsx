import { Bus } from 'lucide-react';

/**
 * Estado vacío que se muestra cuando no hay resultados de búsqueda.
 */
export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-50">
                <Bus size={40} className="text-violet-300" />
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-blue-950">
                    Sin resultados
                </h3>
                <p className="text-sm text-gray-400 max-w-xs">
                    No encontramos rutas con esos filtros. Prueba cambiando el
                    origen, destino o el rango horario.
                </p>
            </div>
        </div>
    );
}
