import { useCallback, useEffect, useState } from 'react';
import { IncidentesService } from '../services/IncidentesService';
import type { CrearIncidenteData, IncidenteResponseDto } from '../Types/incidentesTypes';

export function useIncidentes() {
    const [misIncidentes, setMisIncidentes] = useState<IncidenteResponseDto[]>([]);
    const [cargandoLista, setCargandoLista] = useState(false);
    const [errorLista, setErrorLista] = useState<string | null>(null);

    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
    const [envioExitoso, setEnvioExitoso] = useState(false);

    const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
    const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);

    const cargarIncidentes = useCallback(async () => {
        setCargandoLista(true);
        setErrorLista(null);
        try {
            const data = await IncidentesService.listar();
            setMisIncidentes(data);
        } catch {
            setErrorLista('No se pudieron cargar tus reportes.');
        } finally {
            setCargandoLista(false);
        }
    }, []);

    useEffect(() => {
        cargarIncidentes();
    }, [cargarIncidentes]);

    const obtenerUbicacionActual = useCallback((): Promise<{ lat: number; lng: number } | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setErrorUbicacion('Tu navegador no soporta geolocalización.');
                resolve(null);
                return;
            }

            setObteniendoUbicacion(true);
            setErrorUbicacion(null);

            navigator.geolocation.getCurrentPosition(
                (posicion) => {
                    setObteniendoUbicacion(false);
                    resolve({
                        lat: posicion.coords.latitude,
                        lng: posicion.coords.longitude,
                    });
                },
                () => {
                    setObteniendoUbicacion(false);
                    setErrorUbicacion('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
                    resolve(null);
                }
            );
        });
    }, []);

    const crearIncidente = useCallback(async (data: CrearIncidenteData): Promise<boolean> => {
        setEnviando(true);
        setErrorEnvio(null);
        setEnvioExitoso(false);
        try {
            await IncidentesService.crear(data);
            setEnvioExitoso(true);
            await cargarIncidentes();
            return true;
        } catch (error) {
            const mensaje = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrorEnvio(mensaje ?? 'No se pudo enviar el reporte. Intenta de nuevo.');
            return false;
        } finally {
            setEnviando(false);
        }
    }, [cargarIncidentes]);

    return {
        misIncidentes,
        cargandoLista,
        errorLista,
        cargarIncidentes,
        crearIncidente,
        enviando,
        errorEnvio,
        envioExitoso,
        obtenerUbicacionActual,
        obteniendoUbicacion,
        errorUbicacion,
    };
}