import { useEffect, useState } from "react";
import type { TicketResumenDto } from "../Types/ticketsType";
import TicketsService from "../services/TicketsService";
import Spinner from "../Components/Spinner";
import { CheckCircle2, Clock, MapPin, TicketIcon } from "lucide-react";
import QRCode from "react-qr-code";
import type { ResultadoPaginadoDto } from "../Types/navegacionTypes";
import AppButton from "../Components/AppButton";

export default function TicketsView() {
    const [resultado, setResultado] = useState<ResultadoPaginadoDto<TicketResumenDto> | null>(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
        TicketsService.obtenerMisTickests(paginaActual, 10)
            .then(setResultado)
            .finally(() => setCargando(false));
    }, [paginaActual]);

    const activos = resultado?.datos.filter(t => t.estado === 'Reservado') || [];
    const historial = resultado?.datos.filter(t => t.estado !== 'Reservado') || [];

    if (cargando) return <div className="flex h-64 justify-center items-center"><Spinner /></div>;
    return (
        <div className="p-2 px-4 mx-auto flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold text-blue-950 flex items-center gap-2">
                    <TicketIcon className="text-violet-600" /> Mis Tickets
                </h1>
            </div>

            <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Tickets Activos</h2>
                {activos.length === 0 ? (
                    <p className="text-gray-500 italic">No tienes tickets reservados actualmente.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activos.map(t => (
                            <div key={t.id} className="bg-white border-2 border-violet-500 rounded-2xl shadow-lg flex overflow-hidden">
                                <div className="bg-violet-600 p-6 flex flex-col items-center justify-center text-white w-40 shrink-0">
                                    <div className="bg-white p-2 rounded-xl">
                                        <QRCode value={t.codigo} size={100} />
                                    </div>
                                    <span className="font-mono mt-3 text-sm font-bold">{t.codigo}</span>
                                </div>
                                <div className="p-6 flex flex-col justify-center gap-2">
                                    <span className="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-1 rounded w-fit">Válido hoy</span>
                                    <h3 className="font-bold text-blue-950 text-lg">{t.rutaNombre}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={16} /> Salida: {new Date(t.fechaHoraSalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin size={16} /> Placa Bus: <span className="font-mono">{t.placaUnidad}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-col gap-4 mt-8">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Historial de Viajes</h2>
                    {historial.map(t => (
                        <div key={t.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center opacity-80">
                            <div>
                                <h4 className="font-bold text-gray-700">{t.rutaNombre}</h4>
                                <span className="text-xs text-gray-500">{new Date(t.fechaHoraSalida).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {t.estado === 'Validado' ? <CheckCircle2 className="text-green-500" size={20} /> : null}
                                <span className="font-bold text-sm text-gray-600">{t.estado}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Paginador */}
                {resultado && resultado.totalPaginas > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <AppButton
                            appearance="outline"
                            disabled={resultado.paginaActual <= 1}
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </AppButton>
                        <span className="font-bold text-gray-600">
                            Página {resultado.paginaActual} de {resultado.totalPaginas}
                        </span>
                        <AppButton
                            appearance="outline"
                            disabled={resultado.paginaActual >= resultado.totalPaginas}
                            onClick={() => setPaginaActual(p => p + 1)}
                        >
                            Siguiente
                        </AppButton>
                    </div>
                )}
            </div>
        </div>
    )
}