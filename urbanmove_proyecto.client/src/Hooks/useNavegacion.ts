import { useCallback, useEffect, useState } from 'react';
import { NavegacionService } from '../services/NavegacionService';
import type {
    FiltrosBusqueda,
    LineaDto,
    ParadaDto,
    ResultadoPaginadoDto,
    RutaResumenDto,
} from '../Types/navegacionTypes';

const FILTROS_INICIALES: FiltrosBusqueda = {
    soloConAsientos: false,
    pagina: 1,
    tamanioPagina: 10,
};

/**
 * Hook que encapsula toda la lógica del módulo de búsqueda de rutas (RF-02).
 * Los componentes solo consumen estado y callbacks, sin lógica de red propia.
 */
export function useNavegacion() {
    // ── Estado de datos ───────────────────────────────────────────────────────
    const [lineas, setLineas] = useState<LineaDto[]>([]);
    const [paradas, setParadas] = useState<ParadaDto[]>([]);
    const [resultado, setResultado] = useState<ResultadoPaginadoDto<RutaResumenDto> | null>(null);

    // ── Estado de filtros ─────────────────────────────────────────────────────
    const [filtros, setFiltros] = useState<FiltrosBusqueda>(FILTROS_INICIALES);

    // ── Estado de UI ──────────────────────────────────────────────────────────
    const [cargandoRutas, setCargandoRutas] = useState(false);
    const [cargandoParadas, setCargandoParadas] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Cargar catálogos al montar ────────────────────────────────────────────
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [lineasData, paradasData] = await Promise.all([
                    NavegacionService.obtenerLineas(),
                    NavegacionService.buscarParadas(),
                ]);
                setLineas(lineasData);
                setParadas(paradasData);
            } catch {
                setError('No se pudieron cargar las líneas y paradas.');
            }
        };
        cargarCatalogos();
    }, []);

    // ── Búsqueda de rutas ─────────────────────────────────────────────────────
    const buscar = useCallback(async (filtrosActuales: FiltrosBusqueda) => {
        setCargandoRutas(true);
        setError(null);
        try {
            const data = await NavegacionService.buscarRutas(filtrosActuales);
            setResultado(data);
        } catch {
            setError('Error al buscar rutas. Intenta de nuevo.');
            setResultado(null);
        } finally {
            setCargandoRutas(false);
        }
    }, []);

    // ── Búsqueda de paradas con debounce (autocomplete) ───────────────────────
    const buscarParadas = useCallback(async (q: string) => {
        setCargandoParadas(true);
        try {
            const data = await NavegacionService.buscarParadas(q);
            setParadas(data);
        } finally {
            setCargandoParadas(false);
        }
    }, []);

    // ── Actualizar un campo del filtro ────────────────────────────────────────
    const actualizarFiltro = useCallback(<K extends keyof FiltrosBusqueda>(
        campo: K,
        valor: FiltrosBusqueda[K]
    ) => {
        setFiltros(prev => ({ ...prev, [campo]: valor, pagina: 1 }));
    }, []);

    // ── Limpiar todos los filtros ─────────────────────────────────────────────
    const limpiarFiltros = useCallback(() => {
        setFiltros(FILTROS_INICIALES);
        setResultado(null);
    }, []);

    // ── Cambiar de página ─────────────────────────────────────────────────────
    const cambiarPagina = useCallback((pagina: number) => {
        const nuevos = { ...filtros, pagina };
        setFiltros(nuevos);
        buscar(nuevos);
    }, [filtros, buscar]);

    // ── Acción principal: buscar con los filtros actuales ─────────────────────
    const aplicarBusqueda = useCallback(() => {
        buscar({ ...filtros, pagina: 1 });
    }, [filtros, buscar]);

    return {
        // datos
        lineas,
        paradas,
        resultado,
        // filtros
        filtros,
        actualizarFiltro,
        limpiarFiltros,
        // acciones
        aplicarBusqueda,
        buscarParadas,
        cambiarPagina,
        // ui
        cargandoRutas,
        cargandoParadas,
        error,
    };
}
