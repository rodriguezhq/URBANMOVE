import { useCallback, useEffect, useState } from 'react';
import { FidelizacionService } from '../services/FidelizacionService';
import type { SaldoPuntos, Comercio } from '../Types/fidelizacionTypes';

/**
 * Hook que encapsula el módulo RF-05: saldo/historial de puntos,
 * lista de comercios aliados, y la acción de canje.
 * La vista solo consume estado y acciones.
 */
export function useFidelizacion() {
    const [saldo, setSaldo] = useState<SaldoPuntos | null>(null);
    const [comercios, setComercios] = useState<Comercio[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canjeando, setCanjeando] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [saldoData, comerciosData] = await Promise.all([
                FidelizacionService.obtenerSaldo(),
                FidelizacionService.listarComercios(),
            ]);
            setSaldo(saldoData);
            setComercios(comerciosData);
        } catch {
            setError('No se pudo cargar tu información de puntos. Intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    /**
     * Canjea puntos en un comercio. Devuelve el resultado si tuvo éxito,
     * o null si falló (el mensaje de error queda en `error`).
     * Recarga el saldo automáticamente tras un canje exitoso.
     */
    const canjear = useCallback(async (comercioId: number) => {
        setCanjeando(true);
        setError(null);
        try {
            const resultado = await FidelizacionService.canjear(comercioId);
            await cargar(); // refresca saldo/historial tras el canje
            return resultado;
        } catch (err: any) {
            const mensaje = err?.response?.data?.message ?? 'No se pudo completar el canje.';
            setError(mensaje);
            return null;
        } finally {
            setCanjeando(false);
        }
    }, [cargar]);

    return { saldo, comercios, cargando, canjeando, error, recargar: cargar, canjear };
}