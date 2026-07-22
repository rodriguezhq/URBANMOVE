import { ApiClient, descargarArchivo } from './api';
import type { CrearIncidenteData, EstadoIncidente, IncidenteResponseDto } from '../Types/incidentesTypes';

export const IncidentesService = {
    crear: async (data: CrearIncidenteData): Promise<IncidenteResponseDto> => {
        const formData = new FormData();
        formData.append('Descripcion', data.descripcion);
        formData.append('Categoria', data.categoria);
        formData.append('Lat', data.lat.toString());
        formData.append('Lng', data.lng.toString());
        if (data.imagen) {
            formData.append('Imagen', data.imagen);
        }

        const response = await ApiClient.post('/incidentes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    listar: async (): Promise<IncidenteResponseDto[]> => {
        const response = await ApiClient.get('/incidentes');
        return response.data;
    },

    obtenerDetalle: async (id: number): Promise<IncidenteResponseDto> => {
        const response = await ApiClient.get(`/incidentes/${id}`);
        return response.data;
    },

    actualizarEstado: async (id: number, estado: EstadoIncidente): Promise<void> => {
        await ApiClient.patch(`/incidentes/${id}/estado`, { estado });
    },

    eliminar: async (id: number): Promise<void> => {
        await ApiClient.delete(`/incidentes/${id}`);
    },

    exportar: async (formato: 'csv' | 'xml') => {
        await descargarArchivo(`/incidentes/exportar?formato=${formato}`, `incidentes.${formato}`);
    },
};