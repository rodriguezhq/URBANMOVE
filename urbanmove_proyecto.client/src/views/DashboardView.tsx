import { AlertTriangle, Bus, Gauge, LayoutDashboard, RefreshCw, Zap } from 'lucide-react';
import { useDashboard } from '../Hooks/useDashboard';
import KpiCard from '../Components/DashboardComponents/KpiCard';
import UnidadesTabla from '../Components/DashboardComponents/UnidadesTabla';
import FrecuenciasTabla from '../Components/DashboardComponents/FrecuenciasTabla';
import AlertaItem from '../Components/DashboardComponents/AlertaItem';
import MapaDashboard from '../Components/DashboardComponents/MapaDashboard';
import Spinner from '../Components/Spinner';
import AppButton from '../Components/AppButton';

/**
 * Vista principal del módulo RF-04: Dashboard de operaciones.
 * Accesible desde /app/dashboard (operador y admin).
 *
 * Bloques:
 *   - KPIs de resumen
 *   - Mapa interactivo (paradas + incidentes)
 *   - Estado de unidades
 *   - Programación de frecuencias
 *   - Alertas de desviación
 */
export default function DashboardView() {
    const { resumen, cargando, error, recargar } = useDashboard();

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            {/* ── Encabezado ── */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                        <LayoutDashboard size={18} className="text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Dashboard de operaciones</h1>
                        <p className="text-xs text-gray-500">
                            Estado de unidades, frecuencias y alertas en tiempo real
                        </p>
                    </div>
                </div>
                <AppButton
                    appearance="outline"
                    disabled={cargando}
                    onClick={recargar}
                    className="flex items-center gap-2 border-gray-300 text-gray-600"
                >
                    <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
                    Actualizar
                </AppButton>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Error */}
                {error && (
                    <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                {/* Cargando inicial */}
                {cargando && resumen === null && (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <Spinner />
                        <p className="text-sm text-gray-400">Cargando dashboard...</p>
                    </div>
                )}

                {resumen && (
                    <>
                        {/* ── KPIs ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <KpiCard
                                icono={<Bus size={20} />}
                                etiqueta="Unidades activas"
                                valor={`${resumen.kpis.unidadesActivas}/${resumen.kpis.unidadesTotal}`}
                                detalle="En servicio"
                            />
                            <KpiCard
                                icono={<Zap size={20} />}
                                etiqueta="Salidas en curso"
                                valor={resumen.kpis.salidasEnCurso}
                                detalle={`${resumen.kpis.salidasProximas} próximas`}
                            />
                            <KpiCard
                                icono={<AlertTriangle size={20} />}
                                etiqueta="Incidentes pendientes"
                                valor={resumen.kpis.incidentesPendientes}
                                detalle="Por atender"
                            />
                            <KpiCard
                                icono={<Gauge size={20} />}
                                etiqueta="Ocupación promedio"
                                valor={`${resumen.kpis.ocupacionPromedio}%`}
                                detalle="Próximas salidas"
                            />
                        </div>

                        {/* ── Mapa + Alertas ── */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                            <MapaDashboard mapa={resumen.mapa} />

                            {/* Alertas de desviación */}
                            <section className="flex flex-col overflow-hidden border border-gray-200 bg-white shadow-sm">
                                <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                                    <AlertTriangle size={18} className="text-violet-600" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950">
                                        Alertas de desviación
                                    </h3>
                                </header>
                                {resumen.alertas.length === 0 ? (
                                    <p className="px-5 py-6 text-sm text-gray-400 italic">
                                        Sin alertas. Todo en orden. ✅
                                    </p>
                                ) : (
                                    <ul className="flex max-h-90 flex-col gap-2 overflow-y-auto p-3">
                                        {resumen.alertas.map((a, i) => (
                                            <AlertaItem key={i} alerta={a} />
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>

                        {/* ── Estado de unidades ── */}
                        <UnidadesTabla unidades={resumen.unidades} />

                        {/* ── Programación de frecuencias ── */}
                        <FrecuenciasTabla frecuencias={resumen.frecuencias} />
                    </>
                )}
            </div>
        </div>
    );
}
