import { useState } from "react";
import AppInput from "../Components/AppInput";
import AppButton from "../Components/AppButton";
import { CheckCircle2, TicketIcon, XCircle, Search } from "lucide-react";
import TicketsService from "../services/TicketsService";
import Spinner from "../Components/Spinner";

export default function ValidarTicketsView() {
    const [codigo, setCodigo] = useState("");
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState<{ exito: boolean; mensaje: string } | null>(null);

    const handleValidar = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (!codigo.trim()) return;

        setCargando(true);
        setResultado(null);
        try {
            const res = await TicketsService.validarTicket(codigo.trim().toUpperCase());
            setResultado({ exito: true, mensaje: res.mensaje });
            setCodigo(""); // Limpiar para el siguiente
        } catch (error: any) {
            setResultado({ 
                exito: false, 
                mensaje: error?.response?.data?.mensaje || "Error al validar el ticket." 
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                        <TicketIcon size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-blue-950">Validar Tickets</h1>
                        <p className="text-xs text-gray-500">Escanee o ingrese el código del pasajero</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center gap-8 p-6 mt-10">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg">
                    <form onSubmit={handleValidar} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2 text-center">
                            <h2 className="text-2xl font-bold text-gray-800">Código del Ticket</h2>
                            <p className="text-sm text-gray-500">
                                Asegúrese de tener el cursor en la caja de texto si utiliza un escáner físico.
                            </p>
                        </div>
                        
                        <AppInput
                            type="text"
                            placeholder="TKT-XXXXX..."
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            appearance="outline"
                            className="text-center text-2xl font-mono tracking-widest py-4 uppercase"
                            disabled={cargando}
                            autoFocus
                        />

                        <AppButton 
                            type="submit" 
                            appearance="filled" 
                            disabled={!codigo.trim() || cargando} 
                            className="w-full py-4 text-lg flex items-center justify-center gap-2 bg-violet-600 text-white"
                        >
                            {cargando ? <Spinner /> : <Search size={24} />}
                            Validar Ticket
                        </AppButton>
                    </form>
                </div>

                {resultado && (
                    <div className={`w-full max-w-lg p-6 rounded-2xl shadow-lg border flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-bottom-4 ${resultado.exito ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        {resultado.exito ? (
                            <CheckCircle2 size={64} className="text-green-500" />
                        ) : (
                            <XCircle size={64} className="text-red-500" />
                        )}
                        <div>
                            <h3 className={`text-xl font-bold ${resultado.exito ? 'text-green-800' : 'text-red-800'}`}>
                                {resultado.exito ? '¡Ticket Válido!' : 'Ticket Inválido'}
                            </h3>
                            <p className={`mt-2 ${resultado.exito ? 'text-green-700' : 'text-red-700'}`}>
                                {resultado.mensaje}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
