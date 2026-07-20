import { ApiClient } from './api';
import type {
    Comercio,
    CrearComercioInput,
    SaldoPuntos,
    CanjeResultado,
} from '../Types/fidelizacionTypes';

export const FidelizacionService = {
    /**
     * Saldo actual e historial de movimientos del usuario autenticado (RF-05).
     */
    obtenerSaldo: async (): Promise<SaldoPuntos> => {
        const response = await ApiClient.get('/fidelizacion/saldo');
        return response.data;
    },

    /**
     * Lista los comercios aliados disponibles para canje.
     */
    listarComercios: async (): Promise<Comercio[]> => {
        const response = await ApiClient.get('/fidelizacion/comercios');
        return response.data;
    },

    /**
     * Canjea puntos del usuario autenticado en un comercio aliado.
     */
    canjear: async (comercioId: number): Promise<CanjeResultado> => {
        const response = await ApiClient.post('/fidelizacion/canjear', { comercioId });
        return response.data;
    },

    // ── CRUD de comercios (solo admin) ──────────────────────────────────────

    crearComercio: async (input: CrearComercioInput): Promise<Comercio> => {
        const response = await ApiClient.post('/fidelizacion/comercios', input);
        return response.data;
    },

    actualizarComercio: async (id: number, input: CrearComercioInput): Promise<void> => {
        await ApiClient.put(`/fidelizacion/comercios/${id}`, input);
    },

    eliminarComercio: async (id: number): Promise<void> => {
        await ApiClient.delete(`/fidelizacion/comercios/${id}`);
    },
};