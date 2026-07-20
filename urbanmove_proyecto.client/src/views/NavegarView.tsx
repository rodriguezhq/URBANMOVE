import { ChevronLeft, ChevronRight, Map } from 'lucide-react';
import FiltrosPanel from '../Components/NavegarComponents/FiltrosPanel';
import RutaCard from '../Components/NavegarComponents/RutaCard';
import EmptyState from '../Components/NavegarComponents/EmptyState';
import { useCallback, useEffect, useState } from 'react';
import type { FiltrosBusqueda, LineaDto, ParadaDto, ResultadoPaginadoDto, RutaResumenDto } from '../Types/navegacionTypes';
import { NavegacionService } from '../services/NavegacionService';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import AppButton from '../Components/AppButton';
const FILTROS_INICIALES: FiltrosBusqueda = {
    soloConAsientos: false,
    pagina: 1,
    tamanioPagina: 10,
};

export default function NavegarView() {

    const [lineas, setLineas] = useState<LineaDto[]>([]);
    const [paradas, setParadas] = useState<ParadaDto[]>([]);
    const [resultado, setResultado] = useState<ResultadoPaginadoDto<RutaResumenDto> | null>(null);
    const [filtros, setFiltros] = useState<FiltrosBusqueda>(FILTROS_INICIALES);
    const [cargandoRutas, setCargandoRutas] = useState(false);
    const [cargandoParadas, setCargandoParadas] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaResumenDto | null>(null);

    const hayResultados = (resultado?.datos?.length ?? 0) > 0;
    const totalPaginas = resultado?.totalPaginas ?? 0;
    const trazoRuta = rutaSeleccionada?.paradas.map(rp => [rp.parada.lat, rp.parada.lng] as [number, number]) || [];

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

    const actualizarFiltro = useCallback(<K extends keyof FiltrosBusqueda>(
        campo: K,
        valor: FiltrosBusqueda[K]
    ) => {
        setFiltros(prev => ({ ...prev, [campo]: valor, pagina: 1 }));
    }, []);

    const limpiarFiltros = useCallback(() => {
        setFiltros(FILTROS_INICIALES);
        setResultado(null);
    }, []);

    const cambiarPagina = useCallback((pagina: number) => {
        const nuevos = { ...filtros, pagina };
        setFiltros(nuevos);
        buscar(nuevos);
    }, [filtros, buscar]);

    const aplicarBusqueda = useCallback(() => {
        buscar({ ...filtros, pagina: 1 });
    }, [filtros, buscar]);
    const handleReservar = async (salidaId: number) => {
        if (!confirm('¿Desas resevar un asiento para esta ruta')) return;
        try {
            const res = await NavegacionService.reservarAsiento(salidaId);
            alert(`¡${res.mensaje}! Tu código de ticket es: ${res.codigo}`);
            aplicarBusqueda();
        } catch (error: any) {
            console.log('Error: ' + (error?.response?.data?.mensaje || 'No se pudo reservar'));
        }
    }
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            {/* ── Encabezado de la página ── */}
            <header className="border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                        <Map size={18} className="text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Buscar rutas</h1>
                        <p className="text-xs text-gray-500">
                            Filtra por origen, destino, línea, horario y disponibilidad de asientos
                        </p>
                    </div>
                </div>
            </header>

            {/* ── Cuerpo: filtros + resultados + MAPA ── */}
            <div className="flex flex-1 gap-6 p-6">

                <div className="flex flex-col w-[45%] gap-6 max-h-[85vh] overflow-y-auto pr-4">

                    <FiltrosPanel
                        filtros={filtros}
                        lineas={lineas}
                        paradas={paradas}
                        cargandoParadas={cargandoParadas}
                        cargando={cargandoRutas}
                        onFiltroChange={actualizarFiltro}
                        onBuscarParadas={buscarParadas}
                        onAplicar={aplicarBusqueda}
                        onLimpiar={limpiarFiltros}
                    />

                    {/*  encabezado informativo */}
                    {!cargandoRutas && resultado !== null && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-gray-500">
                                {resultado.totalRegistros === 0
                                    ? 'Sin resultados'
                                    : `${resultado.totalRegistros} ruta(s) encontrada(s)`}
                            </p>

                            {!hayResultados && <EmptyState />}

                            {/* Lista de rutas */}
                            {hayResultados && (
                                <div className="flex flex-col gap-4">
                                    {resultado.datos.map(ruta => (
                                        <RutaCard
                                            key={ruta.id}
                                            ruta={ruta}
                                            onVermapa={setRutaSeleccionada}
                                            onReservar={handleReservar}
                                        />
                                    ))}
                                </div>
                            )}
                            {totalPaginas > 1 && (
                                <nav
                                    className="flex items-center justify-center gap-2 pt-4 pb-8"
                                    aria-label="Paginación de rutas"
                                >
                                    <AppButton
                                        id="btn-pagina-anterior"
                                        appearance="outline"
                                        disabled={resultado.paginaActual <= 1}
                                        onClick={() => cambiarPagina(resultado.paginaActual - 1)}
                                        className="flex items-center gap-1 border-gray-300 text-gray-600"
                                    >
                                        <ChevronLeft size={16} />
                                        Anterior
                                    </AppButton>

                                    {/* Números de página */}
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                                        <AppButton
                                            key={p}
                                            id={`btn-pagina-${p}`}
                                            appearance={p === resultado.paginaActual ? 'filled' : 'outline'}
                                            onClick={() => cambiarPagina(p)}
                                            className={
                                                p === resultado.paginaActual
                                                    ? 'min-w-9 justify-center bg-violet-600 border-transparent text-white'
                                                    : 'min-w-9 justify-center border-gray-300 text-gray-600'
                                            }
                                        >
                                            {p}
                                        </AppButton>
                                    ))}

                                    <AppButton
                                        id="btn-pagina-siguiente"
                                        appearance="outline"
                                        disabled={resultado.paginaActual >= totalPaginas}
                                        onClick={() => cambiarPagina(resultado.paginaActual + 1)}
                                        className="flex items-center gap-1 border-gray-300 text-gray-600"
                                    >
                                        Siguiente
                                        <ChevronRight size={16} />
                                    </AppButton>
                                </nav>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-[55%] h-[85vh] sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden z-0">
                    <MapContainer
                        center={[-12.0651, -75.2048]} // Centro de Huancayo
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution="&copy; OpenStreetMap"
                        />

                        {/* Dibujar trazo solo si hay una ruta seleccionada */}
                        {trazoRuta.length > 0 && (
                            <>
                                <Polyline
                                    positions={trazoRuta}
                                    color="#7c3aed" // Color violeta
                                    weight={6}
                                    opacity={0.8}
                                />

                                {/* Marcador Origen */}
                                <Marker position={trazoRuta[0]}>
                                    <Popup>Origen: {rutaSeleccionada?.paradas[0].parada.nombre}</Popup>
                                </Marker>

                                {/* Marcador Destino */}
                                <Marker position={trazoRuta[trazoRuta.length - 1]}>
                                    <Popup>Destino: {rutaSeleccionada?.paradas.at(-1)?.parada.nombre}</Popup>
                                </Marker>
                            </>
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
