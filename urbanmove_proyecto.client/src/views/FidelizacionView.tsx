import { useState } from 'react';
import { Award, Gift, History, RefreshCw, Store } from 'lucide-react';
import { useFidelizacion } from '../Hooks/useFidelizacion';
import Spinner from '../Components/Spinner';
import AppButton from '../Components/AppButton';

const COSTO_CANJE = 100; // debe coincidir con CostoCanjeEnPuntos del backend

export default function FidelizacionView() {
    const { saldo, comercios, cargando, canjeando, error, recargar, canjear } = useFidelizacion();
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const handleCanjear = async (comercioId: number) => {
        setMensajeExito(null);
        const resultado = await canjear(comercioId);
        if (resultado) {
            setMensajeExito(
                `¡Canje exitoso en ${resultado.comercio}! Descuento de S/ ${resultado.descuentoSoles.toFixed(2)}.`
            );
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            {/* ── Encabezado ── */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                        <Award size={18} className="text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Puntos eco</h1>
                        <p className="text-xs text-gray-500">
                            Gana puntos por cada ruta validada y canjéalos en comercios aliados
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

                {/* Éxito de canje */}
                {mensajeExito && (
                    <div className="border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                        ✅ {mensajeExito}
                    </div>
                )}

                {/* Cargando inicial */}
                {cargando && saldo === null && (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <Spinner />
                        <p className="text-sm text-gray-400">Cargando tus puntos...</p>
                    </div>
                )}

                {saldo && (
                    <>
                        {/* ── Saldo actual ── */}
                        <div className="flex items-center gap-4 border border-gray-200 bg-white p-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                <Award size={26} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Saldo actual</p>
                                <p className="text-3xl font-bold text-blue-950">{saldo.saldoActual} pts</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            {/* ── Comercios aliados ── */}
                            <div className="border border-gray-200 bg-white p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <Store size={16} className="text-blue-800" />
                                    <h2 className="font-semibold text-blue-950">Comercios aliados</h2>
                                </div>

                                {comercios.length === 0 ? (
                                    <p className="text-sm text-gray-400">No hay comercios aliados registrados.</p>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {comercios.map((c) => (
                                            <li
                                                key={c.id}
                                                className="flex items-center justify-between border border-gray-100 px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-blue-950">{c.nombre}</p>
                                                    <p className="text-xs text-gray-500">{c.direccion}</p>
                                                </div>
                                                <AppButton
                                                    appearance="filled"
                                                    disabled={canjeando || saldo.saldoActual < COSTO_CANJE}
                                                    onClick={() => handleCanjear(c.id)}
                                                    className="flex items-center gap-2 text-xs"
                                                >
                                                    <Gift size={14} />
                                                    Canjear ({COSTO_CANJE} pts)
                                                </AppButton>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {saldo.saldoActual < COSTO_CANJE && (
                                    <p className="mt-3 text-xs text-gray-400">
                                        Necesitas al menos {COSTO_CANJE} puntos para canjear.
                                    </p>
                                )}
                            </div>

                            {/* ── Historial de movimientos ── */}
                            <div className="border border-gray-200 bg-white p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <History size={16} className="text-blue-800" />
                                    <h2 className="font-semibold text-blue-950">Historial de movimientos</h2>
                                </div>

                                {saldo.movimientos.length === 0 ? (
                                    <p className="text-sm text-gray-400">Todavía no tienes movimientos.</p>
                                ) : (
                                    <ul className="flex flex-col gap-2">
                                        {saldo.movimientos.map((m) => (
                                            <li
                                                key={m.id}
                                                className="flex items-center justify-between border-b border-gray-100 py-2 text-sm"
                                            >
                                                <div>
                                                    <p className="text-gray-700">{m.descripcion ?? '—'}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(m.fecha).toLocaleDateString('es-PE', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <span
                                                    className={
                                                        m.tipo === 'Ganados'
                                                            ? 'font-semibold text-green-600'
                                                            : 'font-semibold text-red-500'
                                                    }
                                                >
                                                    {m.tipo === 'Ganados' ? '+' : '-'}{m.cantidad} pts
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}