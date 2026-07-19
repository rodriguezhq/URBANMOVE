import { ApiClient } from './api';
import type {
    FiltrosBusqueda,
    LineaDto,
    ParadaDto,
    ResultadoPaginadoDto,
    RutaResumenDto,
} from '../Types/navegacionTypes';

export const NavegacionService = {
    /**
     * Busca rutas con filtros opcionales. Devuelve resultado paginado.
     * Requiere cookie de sesión (ciudadano).
     */
    buscarRutas: async (
        filtros: Partial<FiltrosBusqueda>
    ): Promise<ResultadoPaginadoDto<RutaResumenDto>> => {
        // Eliminamos los campos undefined para no mandar query params vacíos
        const params = Object.fromEntries(
            Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
        );
        const response = await ApiClient.get('/navegacion/rutas', { params });
        return response.data;
    },

    /** Detalle de una ruta específica con sus paradas y salidas del día. */
    obtenerDetalleRuta: async (id: number): Promise<RutaResumenDto> => {
        const response = await ApiClient.get(`/navegacion/rutas/${id}`);
        return response.data;
    },

    /** Lista todas las líneas disponibles (para el select de filtros). */
    obtenerLineas: async (): Promise<LineaDto[]> => {
        const response = await ApiClient.get('/navegacion/lineas');
        return response.data;
    },

    /**
     * Busca paradas por nombre parcial (autocomplete).
     * @param q Texto a buscar (puede ser vacío para traer todas)
     */
    buscarParadas: async (q?: string): Promise<ParadaDto[]> => {
        const response = await ApiClient.get('/navegacion/paradas', {
            params: q ? { q } : undefined,
        });
        return response.data;
    },
};
