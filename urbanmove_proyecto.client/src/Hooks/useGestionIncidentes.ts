import { useCallback, useEffect, useState } from 'react';
import { IncidentesService } from '../services/IncidentesService';
import type { EstadoIncidente, IncidenteResponseDto } from '../Types/incidentesTypes';

export function useGestionIncidentes() {
    const [incidentes, setIncidentes] = useState<IncidenteResponseDto[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actualizandoId, setActualizandoId] = useState<number | null>(null);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);

    const cargarIncidentes = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await IncidentesService.listar();
            setIncidentes(data);
        } catch {
            setError('No se pudieron cargar los reportes.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarIncidentes();
    }, [cargarIncidentes]);

    const cambiarEstado = useCallback(async (id: number, estado: EstadoIncidente) => {
        setActualizandoId(id);
        try {
            await IncidentesService.actualizarEstado(id, estado);
            setIncidentes((prev) => prev.map((incidente) => (
                incidente.id === id ? { ...incidente, estado } : incidente
            )));
        } catch {
            setError('No se pudo actualizar el estado del reporte.');
        } finally {
            setActualizandoId(null);
        }
    }, []);

    const eliminarIncidente = useCallback(async (id: number) => {
        setEliminandoId(id);
        try {
            await IncidentesService.eliminar(id);
            setIncidentes((prev) => prev.filter((incidente) => incidente.id !== id));
        } catch {
            setError('No se pudo eliminar el reporte.');
        } finally {
            setEliminandoId(null);
        }
    }, []);

    return {
        incidentes,
        cargando,
        error,
        cargarIncidentes,
        cambiarEstado,
        actualizandoId,
        eliminarIncidente,
        eliminandoId,
    };
}