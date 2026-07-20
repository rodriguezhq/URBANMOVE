import { AlertTriangle, Clock } from 'lucide-react';
import type { Alerta } from '../../Types/dashboardTypes';

interface AlertaItemProps {
    alerta: Alerta;
}

/**
 * Fila de alerta del panel de alertas de desviación.
 * "Retraso" = salida en curso que superó su hora estimada de llegada.
 * "Incidente" = incidente pendiente reportado por un ciudadano.
 */
export default function AlertaItem({ alerta }: AlertaItemProps) {
    const esRetraso = alerta.tipo === 'Retraso';

    const fecha = new Date(alerta.fecha).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <li
            className={
                esRetraso
                    ? 'flex items-start gap-3 border-l-4 border-red-400 bg-red-50 px-4 py-3'
                    : 'flex items-start gap-3 border-l-4 border-amber-400 bg-amber-50 px-4 py-3'
            }
        >
            <div className={esRetraso ? 'text-red-500' : 'text-amber-500'}>
                {esRetraso ? <AlertTriangle size={18} /> : <Clock size={18} />}
            </div>
            <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wide ${esRetraso ? 'text-red-700' : 'text-amber-700'}`}>
                    {esRetraso ? 'Retraso' : 'Incidente'}
                </span>
                <span className="text-sm text-blue-950">{alerta.mensaje}</span>
                <span className="text-xs text-gray-400">{fecha}</span>
            </div>
        </li>
    );
}
