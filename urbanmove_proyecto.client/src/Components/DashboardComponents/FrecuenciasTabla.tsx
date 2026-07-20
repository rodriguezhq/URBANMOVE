import { CalendarClock, Tag } from 'lucide-react';
import type { Frecuencia } from '../../Types/dashboardTypes';
import type { SalidaDto } from '../../Types/navegacionTypes';
import SalidaBadge from '../NavegarComponents/SalidaBadge';

interface FrecuenciasTablaProps {
    frecuencias: Frecuencia[];
}

/**
 * Convierte una Frecuencia del dashboard al SalidaDto que espera SalidaBadge,
 * para reutilizar ese componente (mismo look que en NavegarView).
 */
function aSalidaDto(f: Frecuencia): SalidaDto {
    return {
        id: f.salidaId,
        fechaHoraSalida: f.fechaHoraSalida,
        fechaHoraLlegadaEstimada: f.fechaHoraLlegadaEstimada,
        estado: f.estado,
        placaUnidad: f.placaUnidad,
        capacidadTotal: f.capacidadTotal,
        asientosOcupados: f.asientosOcupados,
        asientosDisponibles: Math.max(0, f.capacidadTotal - f.asientosOcupados),
    };
}

/**
 * Programación de frecuencias: próximas salidas con su ruta/línea y el detalle
 * (estado + ocupación) reutilizando el componente SalidaBadge.
 */
export default function FrecuenciasTabla({ frecuencias }: FrecuenciasTablaProps) {
    return (
        <section className="flex flex-col overflow-hidden border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                <CalendarClock size={18} className="text-violet-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950">
                    Programación de frecuencias
                </h3>
            </header>

            {frecuencias.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 italic">
                    No hay salidas programadas próximas.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                    {frecuencias.map(f => (
                        <div key={f.salidaId} className="flex flex-col gap-2">
                            {/* Ruta + línea */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-blue-950 leading-tight">
                                    {f.ruta}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Tag size={11} />
                                    {f.linea}
                                </span>
                            </div>
                            {/* Detalle de la salida reutilizando SalidaBadge */}
                            <SalidaBadge salida={aSalidaDto(f)} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
