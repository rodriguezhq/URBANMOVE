import type { ReactNode } from 'react';

interface KpiCardProps {
    icono: ReactNode;
    etiqueta: string;
    valor: string | number;
    detalle?: string;
}

/**
 * Tarjeta de indicador (KPI) para la fila superior del dashboard.
 */
export default function KpiCard({ icono, etiqueta, valor, detalle }: KpiCardProps) {
    return (
        <div className="flex items-center gap-4 border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                {icono}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {etiqueta}
                </span>
                <span className="text-2xl font-bold leading-tight text-blue-950">{valor}</span>
                {detalle && <span className="text-xs text-gray-400">{detalle}</span>}
            </div>
        </div>
    );
}
