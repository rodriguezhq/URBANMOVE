import { useCallback, useEffect, useState } from 'react';
import { DashboardService } from '../services/DashboardService';
import type { DashboardResumen } from '../Types/dashboardTypes';

/**
 * Hook que encapsula la carga del dashboard del operador (RF-04).
 * La vista solo consume estado y la acción de recargar.
 */
export function useDashboard() {
    const [resumen, setResumen] = useState<DashboardResumen | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await DashboardService.obtenerResumen();
            setResumen(data);
        } catch {
            setError('No se pudo cargar el dashboard. Intenta de nuevo.');
            setResumen(null);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { resumen, cargando, error, recargar: cargar };
}
