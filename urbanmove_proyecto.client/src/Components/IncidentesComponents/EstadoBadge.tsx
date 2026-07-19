import { CheckCircle2, Clock, Search } from 'lucide-react';
import type { EstadoIncidente } from '../../Types/incidentesTypes';

export default function EstadoBadge({ estado }: { estado: EstadoIncidente }) {
    if (estado === 'Pendiente') {
        return (
            <span className="inline-flex items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                <Clock size={12} />
                Pendiente
            </span>
        );
    }
    if (estado === 'EnRevision') {
        return (
            <span className="inline-flex items-center gap-1 border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                <Search size={12} />
                En revisión
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 border border-green-300 bg-green-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
            <CheckCircle2 size={12} />
            Resuelto
        </span>
    );
}