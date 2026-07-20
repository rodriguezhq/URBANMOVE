import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Tag, Map } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { RutaResumenDto } from '../../Types/navegacionTypes';
import SalidaBadge from './SalidaBadge';
import AppButton from '../AppButton';

interface RutaCardProps {
    ruta: RutaResumenDto;
    onVermapa?: (ruta: RutaResumenDto) => void;
    onReservar?: (salidaId: number) => void;
}

export default function RutaCard({ ruta, onVermapa, onReservar }: RutaCardProps) {
    const [expandidaParadas, setExpandidaParadas] = useState(false);

    const primeraParada = ruta.paradas.at(0)?.parada.nombre ?? '—';
    const ultimaParada = ruta.paradas.at(-1)?.parada.nombre ?? '—';

    return (
        <article className="flex flex-col gap-0 overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* ── Cabecera de la ruta ── */}
            <header className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold text-white leading-tight">
                        {ruta.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <Tag size={12} className="text-violet-200" />
                        <span className="text-xs font-medium text-violet-200">
                            {ruta.linea.nombre}
                        </span>
                    </div>
                </div>
                <div className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                    {ruta.salidas.length} salida{ruta.salidas.length !== 1 ? 's' : ''}
                </div>
            </header>

            {/* ── Ruta origen → destino ── */}
            <div className="flex items-center gap-2 bg-violet-50 px-5 py-3 text-sm">
                <MapPin size={14} className="shrink-0 text-violet-500" />
                <span className="font-medium text-blue-950 truncate">{primeraParada}</span>
                <span className="mx-1 text-gray-400">→</span>
                <MapPin size={14} className="shrink-0 text-violet-700" />
                <span className="font-medium text-blue-950 truncate">{ultimaParada}</span>
            </div>

            {/* ── Cuerpo ── */}
            <div className="flex flex-col gap-4 p-5">

                {/* Paradas (colapsable) */}
                <section>
                    <button
                        type="button"
                        onClick={() => setExpandidaParadas(p => !p)}
                        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-violet-600 transition-colors"
                    >
                        <span>{ruta.paradas.length} paradas</span>
                        {expandidaParadas
                            ? <ChevronUp size={14} />
                            : <ChevronDown size={14} />
                        }
                    </button>

                    {expandidaParadas && (
                        <ol className="mt-3 flex flex-col">
                            {ruta.paradas.map((rp, i) => (
                                <li key={rp.parada.id} className="flex items-start gap-3">
                                    {/* Línea visual tipo timeline */}
                                    <div className="flex flex-col items-center">
                                        <div className={twMerge(
                                            'h-3 w-3 rounded-full border-2',
                                            i === 0 || i === ruta.paradas.length - 1
                                                ? 'border-violet-600 bg-violet-600'
                                                : 'border-gray-300 bg-white'
                                        )} />
                                        {i < ruta.paradas.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-gray-200 my-0.5 min-h-4" />
                                        )}
                                    </div>
                                    <div className="pb-3">
                                        <span className={twMerge(
                                            'text-sm',
                                            i === 0 || i === ruta.paradas.length - 1
                                                ? 'font-semibold text-blue-950'
                                                : 'text-gray-600'
                                        )}>
                                            {rp.parada.nombre}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                {/* Salidas */}
                <section className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Salidas disponibles
                    </h4>
                    {ruta.salidas.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">
                            Sin salidas para los filtros seleccionados.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ruta.salidas.map(salida => (
                                <SalidaBadge key={salida.id} salida={salida} onReservar={onReservar} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Acción: Ver mapa */}
                <div className="pt-2 border-t border-gray-100 mt-2">
                    <AppButton
                        appearance="outline"
                        className="w-full flex justify-center border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 gap-2"
                        onClick={() => onVermapa && onVermapa(ruta)}
                    >
                        <Map />
                        Ver trazo en mapa
                    </AppButton>
                </div>
            </div>
        </article>
    );
}
