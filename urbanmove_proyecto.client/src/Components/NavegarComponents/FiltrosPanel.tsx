import { Filter, RotateCcw, Search } from 'lucide-react';
import AppButton from '../AppButton';
import ParadaSelect from './ParadaSelect';
import type { FiltrosBusqueda, LineaDto, ParadaDto } from '../../Types/navegacionTypes';

interface FiltrosPanelProps {
    filtros: FiltrosBusqueda;
    lineas: LineaDto[];
    paradas: ParadaDto[];
    cargandoParadas: boolean;
    onFiltroChange: <K extends keyof FiltrosBusqueda>(campo: K, valor: FiltrosBusqueda[K]) => void;
    onBuscarParadas: (q: string) => void;
    onAplicar: () => void;
    onLimpiar: () => void;
    cargando: boolean;
}

/**
 * Panel de filtros de búsqueda de rutas (RF-02).
 * Agrupa: origen/destino, línea, rango horario, disponibilidad de asientos.
 */
export default function FiltrosPanel({
    filtros,
    lineas,
    paradas,
    cargandoParadas,
    onFiltroChange,
    onBuscarParadas,
    onAplicar,
    onLimpiar,
    cargando,
}: FiltrosPanelProps) {
    return (
        <aside className="flex flex-col gap-5 rounded-none border border-gray-200 bg-white p-5 shadow-sm">
            {/* Título */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Filter size={18} className="text-violet-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-950">
                    Filtros de búsqueda
                </h2>
            </div>

            {/* Parada de origen */}
            <ParadaSelect
                label="Parada de origen"
                value={filtros.origenParadaId}
                paradas={paradas}
                loading={cargandoParadas}
                placeholder="¿Desde dónde saldrás?"
                onSelect={p => onFiltroChange('origenParadaId', p?.id)}
                onSearch={onBuscarParadas}
            />

            {/* Parada de destino */}
            <ParadaSelect
                label="Parada de destino"
                value={filtros.destinoParadaId}
                paradas={paradas}
                loading={cargandoParadas}
                placeholder="¿A dónde vas?"
                onSelect={p => onFiltroChange('destinoParadaId', p?.id)}
                onSearch={onBuscarParadas}
            />

            {/* Línea */}
            <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-950">
                    Línea
                </span>
                <select
                    className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-blue-950
                               focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                    value={filtros.lineaId ?? ''}
                    onChange={e =>
                        onFiltroChange('lineaId', e.target.value ? Number(e.target.value) : undefined)
                    }
                >
                    <option value="">Todas las líneas</option>
                    {lineas.map(l => (
                        <option key={l.id} value={l.id}>
                            {l.nombre}
                        </option>
                    ))}
                </select>
            </label>

            {/* Rango horario */}
            <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-950">
                    Horario de salida
                </span>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Desde</span>
                    <input
                        type="datetime-local"
                        className="border border-gray-300 px-3 py-2 text-sm text-blue-950
                                   focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                        value={filtros.fechaHoraDesde ?? ''}
                        onChange={e =>
                            onFiltroChange('fechaHoraDesde', e.target.value || undefined)
                        }
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Hasta</span>
                    <input
                        type="datetime-local"
                        className="border border-gray-300 px-3 py-2 text-sm text-blue-950
                                   focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                        value={filtros.fechaHoraHasta ?? ''}
                        onChange={e =>
                            onFiltroChange('fechaHoraHasta', e.target.value || undefined)
                        }
                    />
                </label>
            </div>

            {/* Solo con asientos */}
            <label className="flex cursor-pointer items-center gap-3 select-none">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={filtros.soloConAsientos}
                        onChange={e => onFiltroChange('soloConAsientos', e.target.checked)}
                    />
                    <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-violet-600" />
                    <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm font-medium text-blue-950">
                    Solo con asientos disponibles
                </span>
            </label>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-1">
                <AppButton
                    id="btn-buscar-rutas"
                    appearance="filled"
                    disabled={cargando}
                    onClick={onAplicar}
                    className="flex flex-1 items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 border-transparent"
                >
                    <Search size={16} />
                    {cargando ? 'Buscando...' : 'Buscar rutas'}
                </AppButton>
                <AppButton
                    id="btn-limpiar-filtros"
                    appearance="outline"
                    onClick={onLimpiar}
                    title="Limpiar filtros"
                    className="border-gray-300 text-gray-500 hover:bg-gray-50"
                >
                    <RotateCcw size={16} />
                </AppButton>
            </div>
        </aside>
    );
}
