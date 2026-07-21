import type { CalculateRuteRequest, CalculateRuteResponse, CrearRutaRequest, GuardarRutaResponse } from "../Types/rutasAdminType";
import { ApiClient } from "./api";

export const RutasAdminService = {
    async calcularTrazo(request: CalculateRuteRequest): Promise<CalculateRuteResponse> {
        try {
            const response = await ApiClient.post('/rutas/routing', request);
            return response.data;
        } catch (error: any) {
            throw new Error('Error al calcular el trazo: ' + error);
        }
    },
    async guardarRuta(request: CrearRutaRequest): Promise<GuardarRutaResponse> {
        try {
            const response = await ApiClient.post('/rutas/guardar', request);
            return response.data;
        } catch (error: any) {
            throw new Error('Error al guardar la ruta: ' + error);
        }
    }
}