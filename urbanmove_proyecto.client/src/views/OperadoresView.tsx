import { useEffect, useState } from "react";
import { HardHat, Check, X } from "lucide-react";
import AppButton from "../Components/AppButton";
import AppInput from "../Components/AppInput";
import Spinner from "../Components/Spinner";
import { AuthService } from "../services/AuthService";
import type { OperadorPendienteType } from "../Types/authType";

export default function OperadoresView() {
    const [pendientes, setPendientes] = useState<OperadorPendienteType[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await AuthService.listarOperadoresPendientes();
            setPendientes(data);
        } catch {
            setError("No se pudieron cargar las solicitudes de operador.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                        <HardHat size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Aprobar Operadores</h1>
                        <p className="text-xs text-gray-500">Solicitudes pendientes de revisión</p>
                    </div>
                </div>
                <AppButton appearance="outline" onClick={cargar}>Actualizar</AppButton>
            </header>

            <div className="flex flex-col gap-4 p-6">
                {error && (
                    <div className="border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
                )}
                {cargando ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                ) : pendientes.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">No hay solicitudes pendientes.</p>
                ) : (
                    pendientes.map((op) => (
                        <OperadorPendienteCard key={op.id} operador={op} onResuelto={cargar} />
                    ))
                )}
            </div>
        </div>
    );
}

function OperadorPendienteCard({ operador, onResuelto }: { operador: OperadorPendienteType; onResuelto: () => void }) {
    const [mostrarMotivo, setMostrarMotivo] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [procesando, setProcesando] = useState(false);

    const aprobar = async () => {
        setProcesando(true);
        try {
            await AuthService.aprobarOperador(operador.id);
            onResuelto();
        } finally {
            setProcesando(false);
        }
    };

    const rechazar = async () => {
        if (!motivo.trim()) return;
        setProcesando(true);
        try {
            await AuthService.rechazarOperador(operador.id, motivo);
            onResuelto();
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="border border-gray-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-blue-950">{operador.nombres} {operador.apellidos}</p>
                    <p className="text-sm text-gray-500">{operador.email} · DNI {operador.dni}</p>
                </div>
                <div className="flex gap-2">
                    <AppButton appearance="filled" disabled={procesando} onClick={aprobar}>
                        <Check size={16} className="mr-1" /> Aprobar
                    </AppButton>
                    <AppButton appearance="outline" disabled={procesando} onClick={() => setMostrarMotivo(!mostrarMotivo)}>
                        <X size={16} className="mr-1" /> Rechazar
                    </AppButton>
                </div>
            </div>
            {mostrarMotivo && (
                <div className="flex gap-2 items-center border-t pt-3">
                    <AppInput
                        appearance="outline"
                        placeholder="Motivo del rechazo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        containerClassName="w-full"
                    />
                    <AppButton appearance="filled" disabled={procesando || !motivo.trim()} onClick={rechazar}>
                        Confirmar
                    </AppButton>
                </div>
            )}
        </div>
    );
}
