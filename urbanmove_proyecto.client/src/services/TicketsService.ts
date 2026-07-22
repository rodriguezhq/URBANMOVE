import type { TicketResumenDto } from "../Types/ticketsType";
import { ApiClient, descargarArchivo } from "./api"

const TicketsService = {
    async obtenerMisTickests(): Promise<TicketResumenDto[]> {
        const response = await ApiClient.get('/tickets/mis_tickets')
        return response.data;
    },

    async exportar(formato: 'csv' | 'xml') {
        await descargarArchivo(`/tickets/exportar?formato=${formato}`, `tickets.${formato}`);
    }
}

export default TicketsService;