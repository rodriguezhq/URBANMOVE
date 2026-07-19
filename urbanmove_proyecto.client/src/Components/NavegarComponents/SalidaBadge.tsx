import { twMerge } from 'tailwind-merge';
import type { SalidaDto } from '../../Types/navegacionTypes';
import { Car, Clock, Users } from 'lucide-react';

interface SalidaBadgeProps {
    salida: SalidaDto;
}

const ESTADO_ESTILOS: Record<SalidaDto['estado'], string> = {
    Programada: 'bg-blue-50 text-blue-700 border-blue-200',
    EnCurso: 'bg-green-50 text-green-700 border-green-200',
    Finalizada: 'bg-gray-100 text-gray-500 border-gray-200',
    Cancelada: 'bg-red-50 text-red-600 border-red-200',
};

const ESTADO_PUNTO: Record<SalidaDto['estado'], string> = {
    Programada: 'bg-blue-500',
    EnCurso: 'bg-green-500 animate-pulse',
    Finalizada: 'bg-gray-400',
    Cancelada: 'bg-red-500',
};

function formatHora(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Lima',
    });
}

/**
 * Tarjeta compacta que muestra el detalle de una salida programada:
 * hora, estado, placa, ocupación y asientos disponibles.
 */
export default function SalidaBadge({ salida }: SalidaBadgeProps) {
    const porcentajeOcupacion =
        salida.capacidadTotal > 0
            ? Math.round((salida.asientosOcupados / salida.capacidadTotal) * 100)
            : 0;

    return (
        <div
            className={twMerge(
                'flex flex-col gap-2 rounded-none border p-3 text-xs transition-shadow hover:shadow-sm',
                ESTADO_ESTILOS[salida.estado]
            )}
        >
            {/* Fila superior: hora + estado */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                    <Clock size={13} />
                    <span>{formatHora(salida.fechaHoraSalida)}</span>
                    <span className="font-normal text-xs opacity-70">
                        → {formatHora(salida.fechaHoraLlegadaEstimada)}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={twMerge('h-1.5 w-1.5 rounded-full', ESTADO_PUNTO[salida.estado])} />
                    <span className="font-semibold">{salida.estado}</span>
                </div>
            </div>

            {/* Placa */}
            <div className="flex items-center gap-1.5 opacity-70">
                <span>{<Car size={12} />}</span>
                <span className="font-mono font-semibold">{salida.placaUnidad}</span>
            </div>

            {/* Barra de ocupación */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 opacity-70">
                        <Users size={11} />
                        <span>{salida.asientosOcupados}/{salida.capacidadTotal} ocupados</span>
                    </div>
                    <span
                        className={twMerge(
                            'font-bold',
                            salida.asientosDisponibles === 0 && 'text-red-600',
                            salida.asientosDisponibles > 0 && salida.asientosDisponibles <= 5 && 'text-orange-600',
                            salida.asientosDisponibles > 5 && 'text-green-700'
                        )}
                    >
                        {salida.asientosDisponibles === 0
                            ? 'Lleno'
                            : `${salida.asientosDisponibles} libres`}
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                        className={twMerge(
                            'h-full rounded-full transition-all',
                            porcentajeOcupacion >= 100 ? 'bg-red-500' :
                                porcentajeOcupacion >= 75 ? 'bg-orange-400' :
                                    'bg-green-500'
                        )}
                        style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
