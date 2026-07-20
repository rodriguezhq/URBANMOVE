import { useCallback, useEffect, useState } from 'react';
import { FidelizacionService } from '../services/FidelizacionService';
import type { Comercio, CrearComercioInput } from '../Types/fidelizacionTypes';

/**
 * Hook de gestión de comercios aliados (RF-05, solo admin).
 * Cubre listar, crear, actualizar y eliminar.
 */
export function useGestionComercios() {
    const [comercios, setComercios] = useState<Comercio[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await FidelizacionService.listarComercios();
            setComercios(data);
        } catch {
            setError('No se pudo cargar la lista de comercios.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const crear = useCallback(async (input: CrearComercioInput) => {
        setGuardando(true);
        setError(null);
        try {
            await FidelizacionService.crearComercio(input);
            await cargar();
            return true;
        } catch {
            setError('No se pudo crear el comercio.');
            return false;
        } finally {
            setGuardando(false);
        }
    }, [cargar]);

    const actualizar = useCallback(async (id: number, input: CrearComercioInput) => {
        setGuardando(true);
        setError(null);
        try {
            await FidelizacionService.actualizarComercio(id, input);
            await cargar();
            return true;
        } catch {
            setError('No se pudo actualizar el comercio.');
            return false;
        } finally {
            setGuardando(false);
        }
    }, [cargar]);

    const eliminar = useCallback(async (id: number) => {
        setEliminandoId(id);
        setError(null);
        try {
            await FidelizacionService.eliminarComercio(id);
            await cargar();
        } catch {
            setError('No se pudo eliminar el comercio.');
        } finally {
            setEliminandoId(null);
        }
    }, [cargar]);

    return { comercios, cargando, error, guardando, eliminandoId, cargar, crear, actualizar, eliminar };
}