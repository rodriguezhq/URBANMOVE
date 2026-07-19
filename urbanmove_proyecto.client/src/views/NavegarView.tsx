import { ChevronLeft, ChevronRight, Map } from 'lucide-react';
import { useNavegacion } from '../Hooks/useNavegacion';
import FiltrosPanel from '../Components/NavegarComponents/FiltrosPanel';
import RutaCard from '../Components/NavegarComponents/RutaCard';
import EmptyState from '../Components/NavegarComponents/EmptyState';
import Spinner from '../Components/Spinner';
import AppButton from '../Components/AppButton';
import { useEffect } from 'react';

/**
 * Vista principal del módulo RF-02: Búsqueda y filtrado de rutas.
 * Accesible desde /app/navegar (solo ciudadano autenticado).
 *
 * Layout:
 *   - Sidebar izquierdo: FiltrosPanel
 *   - Área derecha: lista de RutaCard paginada
 */
export default function NavegarView() {
    const {
        lineas,
        paradas,
        resultado,
        filtros,
        actualizarFiltro,
        limpiarFiltros,
        aplicarBusqueda,
        buscarParadas,
        cambiarPagina,
        cargandoRutas,
        cargandoParadas,
        error,
    } = useNavegacion();

    const hayResultados = (resultado?.datos?.length ?? 0) > 0;
    const totalPaginas = resultado?.totalPaginas ?? 0;

    // Disparar búsqueda automática al cargar la página
    useEffect(() => {
        aplicarBusqueda();
    }, [aplicarBusqueda]);

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

            {/* ── Cuerpo: filtros + resultados ── */}
            <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row lg:items-start">

                {/* Filtros – sticky en desktop */}
                <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
                    <FiltrosPanel
                        filtros={filtros}
                        lineas={lineas}
                        paradas={paradas}
                        cargandoParadas={cargandoParadas}
                        onFiltroChange={actualizarFiltro}
                        onBuscarParadas={buscarParadas}
                        onAplicar={aplicarBusqueda}
                        onLimpiar={limpiarFiltros}
                        cargando={cargandoRutas}
                    />
                </div>

                {/* Resultados */}
                <section className="flex flex-1 flex-col gap-4">

                    {/* Error */}
                    {error && (
                        <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Cargando */}
                    {cargandoRutas && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20">
                            <Spinner />
                            <p className="text-sm text-gray-400">Buscando rutas...</p>
                        </div>
                    )}

                    {/* Estado inicial (aún no buscó) */}
                    {!cargandoRutas && resultado === null && !error && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-50">
                                <Map size={40} className="text-violet-300" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-base font-bold text-blue-950">
                                    Configura tus filtros y busca
                                </h3>
                                <p className="max-w-xs text-sm text-gray-400">
                                    Usa el panel de la izquierda para buscar rutas disponibles.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resultados: encabezado informativo */}
                    {!cargandoRutas && resultado !== null && (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {resultado.totalRegistros === 0
                                        ? 'Sin resultados'
                                        : `${resultado.totalRegistros} ruta${resultado.totalRegistros !== 1 ? 's' : ''} encontrada${resultado.totalRegistros !== 1 ? 's' : ''}`}
                                    {totalPaginas > 1 &&
                                        ` · Página ${resultado.paginaActual} de ${totalPaginas}`
                                    }
                                </p>
                            </div>

                            {/* Sin resultados */}
                            {!hayResultados && <EmptyState />}

                            {/* Lista de rutas */}
                            {hayResultados && (
                                <div className="flex flex-col gap-4">
                                    {resultado.datos.map(ruta => (
                                        <RutaCard key={ruta.id} ruta={ruta} />
                                    ))}
                                </div>
                            )}

                            {/* Paginación */}
                            {totalPaginas > 1 && (
                                <nav
                                    className="flex items-center justify-center gap-2 pt-2"
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
                                                    ? 'min-w-9 justify-center bg-violet-600 border-transparent'
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
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
