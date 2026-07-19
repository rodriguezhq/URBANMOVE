import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { ParadaDto } from '../../Types/navegacionTypes';

interface ParadaSelectProps {
    label: string;
    value?: number;
    paradas: ParadaDto[];
    loading?: boolean;
    onSelect: (parada: ParadaDto | undefined) => void;
    onSearch: (q: string) => void;
    placeholder?: string;
}

/**
 * Select con búsqueda tipo autocomplete para elegir una parada.
 * El usuario escribe → dispara onSearch → el padre actualiza `paradas`.
 */
export default function ParadaSelect({
    label,
    value,
    paradas,
    loading,
    onSelect,
    onSearch,
    placeholder = 'Buscar parada...',
}: ParadaSelectProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Nombre de la parada seleccionada actualmente
    const seleccionada = paradas.find(p => p.id === value);

    // Debounce manual para no llamar la API en cada tecla
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 0) onSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, onSearch]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (parada: ParadaDto) => {
        onSelect(parada);
        setQuery('');
        setOpen(false);
    };

    const handleClear = () => {
        onSelect(undefined);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-blue-950">
                {label}
            </span>

            {/* Input principal */}
            <div
                className={twMerge(
                    'flex items-center gap-2 border border-gray-300 bg-white px-3 py-2.5 text-sm',
                    'focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all'
                )}
            >
                <Search size={15} className="shrink-0 text-gray-400" />
                <input
                    className="flex-1 bg-transparent text-blue-950 placeholder:text-gray-400 focus:outline-none"
                    placeholder={seleccionada ? seleccionada.nombre : placeholder}
                    value={seleccionada ? '' : query}
                    onFocus={() => setOpen(true)}
                    onChange={e => {
                        setQuery(e.target.value);
                        if (seleccionada) handleClear();
                    }}
                />
                {seleccionada && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs font-bold"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Etiqueta de parada seleccionada */}
            {seleccionada && (
                <span className=" flex gap-1 text-xs text-violet-600 font-medium truncate">
                    {<MapPin size={12} />} {seleccionada.nombre}
                </span>
            )}

            {/* Dropdown */}
            {open && (
                <ul className="absolute top-full z-50 mt-1 w-full border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
                    {loading && (
                        <li className="px-4 py-3 text-xs text-gray-400 animate-pulse">
                            Buscando paradas...
                        </li>
                    )}
                    {!loading && paradas.length === 0 && (
                        <li className="px-4 py-3 text-xs text-gray-400">
                            Sin resultados para "{query}"
                        </li>
                    )}
                    {!loading && paradas.map(p => (
                        <li
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className={twMerge(
                                'cursor-pointer px-4 py-2.5 text-sm text-blue-950 hover:bg-violet-50 transition-colors',
                                value === p.id && 'bg-violet-100 font-semibold'
                            )}
                        >
                            {p.nombre}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
