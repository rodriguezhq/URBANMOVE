import type { CalculateRuteRequest, CalculateRuteResponse, CrearRutaRequest, GuardarRutaResponse, LineaCrearRequest, ParadaCrearRequest, RutaListItem, MensajeResponse } from "../Types/rutasAdminType";
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
    },
    async crearLinea(request: LineaCrearRequest): Promise<MensajeResponse> {
        try {
            const response = await ApiClient.post('/rutas/lineas', request);
            return response.data;
        } catch (error: any) {
            throw new Error('Error al crear la línea: ' + error);
        }
    },
    async crearParada(request: ParadaCrearRequest): Promise<MensajeResponse> {
        try {
            const response = await ApiClient.post('/rutas/paradas', request);
            return response.data;
        } catch (error: any) {
            throw new Error('Error al crear la parada: ' + error);
        }
    },
    async listarRutas(): Promise<RutaListItem[]> {
        try {
            const response = await ApiClient.get('/rutas');
            return response.data;
        } catch (error: any) {
            throw new Error('Error al listar rutas: ' + error);
        }
    },
    async eliminarRuta(id: number): Promise<MensajeResponse> {
        try {
            const response = await ApiClient.delete(`/rutas/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error('Error al eliminar la ruta: ' + error);
        }
    }
}