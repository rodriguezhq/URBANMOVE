import { Bus } from 'lucide-react';
import type { UnidadEstado } from '../../Types/dashboardTypes';

interface UnidadesTablaProps {
    unidades: UnidadEstado[];
}

/**
 * Tabla con el estado de cada unidad de transporte: placa, capacidad,
 * si está activa y la ruta en la que se encuentra en curso.
 */
export default function UnidadesTabla({ unidades }: UnidadesTablaProps) {
    return (
        <section className="flex flex-col overflow-hidden border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                <Bus size={18} className="text-violet-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950">
                    Estado de unidades
                </h3>
            </header>

            {unidades.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 italic">No hay unidades registradas.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-2 font-semibold">Placa</th>
                                <th className="px-5 py-2 font-semibold">Capacidad</th>
                                <th className="px-5 py-2 font-semibold">Estado</th>
                                <th className="px-5 py-2 font-semibold">En ruta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unidades.map(u => (
                                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-5 py-3 font-medium text-blue-950">{u.placa}</td>
                                    <td className="px-5 py-3 text-gray-600">{u.capacidad} asientos</td>
                                    <td className="px-5 py-3">
                                        {u.activa ? (
                                            <span className="inline-flex items-center gap-1 border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-bold uppercase text-green-700">
                                                Activa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-bold uppercase text-gray-500">
                                                Inactiva
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {u.salidaActual ?? <span className="text-gray-300">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
