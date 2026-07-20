import { ApiClient } from './api';
import type { DashboardResumen } from '../Types/dashboardTypes';

export const DashboardService = {
    /**
     * Obtiene el resumen completo del dashboard del operador (RF-04).
     * Requiere cookie de sesión (operador o admin).
     */
    obtenerResumen: async (): Promise<DashboardResumen> => {
        const response = await ApiClient.get('/dashboard/resumen');
        return response.data;
    },
};
